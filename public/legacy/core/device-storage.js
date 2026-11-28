/* PlaySpark Device Storage — IndexedDB + OPFS + Persistent Storage + Phone File Sync */

(function (app) {
  'use strict';

  const DB_NAME = 'playspark-device-storage';
  const DB_VERSION = 1;
  const KV_STORE = 'kv';
  const HANDLES_STORE = 'handles';
  const PROFILE_KEY = 'profiles';
  const LINKED_FILE_KEY = 'saveFile';
  const OPFS_FILE_NAME = 'playspark-profiles.json';

  let dbPromise = null;
  let fileWriteTimer = null;
  let cachedFileStatus = {
    linkedFileName: null,
    filePermission: 'none' // 'none' | 'granted' | 'prompt'
  };

  function openDb() {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(KV_STORE)) {
            db.createObjectStore(KV_STORE);
          }
          if (!db.objectStoreNames.contains(HANDLES_STORE)) {
            db.createObjectStore(HANDLES_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
    return dbPromise;
  }

  async function idbGet(storeName, key) {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function idbPut(storeName, key, val) {
    const db = await openDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(val, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  async function idbDelete(storeName, key) {
    const db = await openDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  async function writeOpfs(payload) {
    try {
      if (!navigator.storage || typeof navigator.storage.getDirectory !== 'function') {
        return false;
      }
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(OPFS_FILE_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(payload));
      await writable.close();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function readOpfs() {
    try {
      if (!navigator.storage || typeof navigator.storage.getDirectory !== 'function') {
        return null;
      }
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(OPFS_FILE_NAME);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  }

  function buildBackupEnvelope(store) {
    return {
      app: 'PlaySpark',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: store
    };
  }

  async function writeLinkedHandle(handle, store) {
    if (!handle) return false;
    try {
      if (typeof handle.queryPermission === 'function') {
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        cachedFileStatus = { linkedFileName: handle.name || 'playspark-progress.json', filePermission: perm };
        if (perm !== 'granted') return false;
      }
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(buildBackupEnvelope(store), null, 2));
      await writable.close();
      cachedFileStatus = {
        linkedFileName: handle.name || 'playspark-progress.json',
        filePermission: 'granted'
      };
      return true;
    } catch (_) {
      return false;
    }
  }

  async function requestPersistence() {
    try {
      if (navigator.storage && typeof navigator.storage.persisted === 'function') {
        const already = await navigator.storage.persisted();
        if (already) return true;
        if (typeof navigator.storage.persist === 'function') {
          return await navigator.storage.persist();
        }
      }
    } catch (_) {}
    return false;
  }

  async function persistProfiles(store) {
    if (!store || typeof store !== 'object') return;
    await idbPut(KV_STORE, PROFILE_KEY, store);
    await writeOpfs(store);

    // Debounced auto-save to linked phone file (Android / Desktop Chrome & Edge)
    if (fileWriteTimer) clearTimeout(fileWriteTimer);
    fileWriteTimer = setTimeout(async () => {
      const handle = await idbGet(HANDLES_STORE, LINKED_FILE_KEY);
      if (handle) {
        await writeLinkedHandle(handle, store);
        window.dispatchEvent(new CustomEvent('kidapp:storage-change'));
      }
    }, 350);
  }

  async function loadDurableProfiles() {
    const idbData = await idbGet(KV_STORE, PROFILE_KEY);
    if (idbData && idbData.profiles) return idbData;
    const opfsData = await readOpfs();
    if (opfsData && opfsData.profiles) return opfsData;
    return null;
  }

  async function getStatus() {
    let persisted = false;
    let usageBytes = 0;
    let quotaBytes = 0;

    try {
      if (navigator.storage) {
        if (typeof navigator.storage.persisted === 'function') {
          persisted = await navigator.storage.persisted();
        }
        if (typeof navigator.storage.estimate === 'function') {
          const est = await navigator.storage.estimate();
          usageBytes = est.usage || 0;
          quotaBytes = est.quota || 0;
        }
      }
    } catch (_) {}

    const db = await openDb();
    const handle = await idbGet(HANDLES_STORE, LINKED_FILE_KEY);
    if (handle) {
      let perm = 'granted';
      try {
        if (typeof handle.queryPermission === 'function') {
          perm = await handle.queryPermission({ mode: 'readwrite' });
        }
      } catch (_) {
        perm = 'prompt';
      }
      cachedFileStatus = {
        linkedFileName: handle.name || 'playspark-progress.json',
        filePermission: perm
      };
    } else {
      cachedFileStatus = { linkedFileName: null, filePermission: 'none' };
    }

    return {
      persisted,
      idbReady: Boolean(db),
      opfsReady: Boolean(navigator.storage && typeof navigator.storage.getDirectory === 'function'),
      supportsFilePicker: typeof window.showSaveFilePicker === 'function',
      supportsShareFiles: typeof navigator.canShare === 'function',
      usageBytes,
      quotaBytes,
      linkedFileName: cachedFileStatus.linkedFileName,
      filePermission: cachedFileStatus.filePermission
    };
  }

  async function linkSaveFile(store) {
    if (typeof window.showSaveFilePicker !== 'function') {
      return { ok: false, reason: 'unsupported' };
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'playspark-progress.json',
        types: [
          {
            description: 'PlaySpark Progress Backup',
            accept: { 'application/json': ['.json'] }
          }
        ]
      });
      await idbPut(HANDLES_STORE, LINKED_FILE_KEY, handle);
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(buildBackupEnvelope(store), null, 2));
      await writable.close();
      cachedFileStatus = {
        linkedFileName: handle.name || 'playspark-progress.json',
        filePermission: 'granted'
      };
      window.dispatchEvent(new CustomEvent('kidapp:storage-change'));
      return { ok: true, fileName: cachedFileStatus.linkedFileName };
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { ok: false, reason: 'cancelled' };
      }
      return { ok: false, reason: err?.message || 'failed' };
    }
  }

  async function reconnectSaveFile(store) {
    const handle = await idbGet(HANDLES_STORE, LINKED_FILE_KEY);
    if (!handle) return { ok: false };
    try {
      if (typeof handle.requestPermission === 'function') {
        const perm = await handle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') return { ok: false };
      }
      const wrote = await writeLinkedHandle(handle, store);
      window.dispatchEvent(new CustomEvent('kidapp:storage-change'));
      return { ok: wrote, fileName: handle.name };
    } catch (_) {
      return { ok: false };
    }
  }

  async function unlinkSaveFile() {
    await idbDelete(HANDLES_STORE, LINKED_FILE_KEY);
    cachedFileStatus = { linkedFileName: null, filePermission: 'none' };
    window.dispatchEvent(new CustomEvent('kidapp:storage-change'));
  }

  async function shareOrDownloadBackup(store) {
    const filename = `playspark-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const jsonText = JSON.stringify(buildBackupEnvelope(store), null, 2);

    try {
      const file = new File([jsonText], filename, { type: 'application/json' });
      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'PlaySpark Progress Backup',
          text: 'Save to Files or iCloud Drive to keep kid progress backed up.'
        });
        return { ok: true, method: 'share' };
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { ok: false, method: 'cancelled' };
      }
    }

    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { ok: true, method: 'download' };
  }

  app.DeviceStorage = {
    requestPersistence,
    persistProfiles,
    loadDurableProfiles,
    getStatus,
    linkSaveFile,
    reconnectSaveFile,
    unlinkSaveFile,
    shareOrDownloadBackup
  };
})(window.KidApp = window.KidApp || {});
