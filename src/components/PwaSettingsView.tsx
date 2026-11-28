import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PwaStatus } from '../pwa/usePwaSetup';
import { DeviceStorageStatus, KidProfile, ProfilesStoreData, getKidApp } from '../types/kidapp';

interface PwaSettingsViewProps {
  pwaStatus: PwaStatus;
  onTriggerInstall: () => Promise<boolean>;
  isDark: boolean;
  onToggleTheme: () => void;
  transparencyPct: number;
  onChangeTransparency: (pct: number) => void;
  profile: KidProfile;
  onStoreUpdated: () => void;
}

const GROWNUP_CHALLENGES = [
  { q: '3 × 4 = ?', a: 12 },
  { q: '4 × 6 = ?', a: 24 },
  { q: '7 × 3 = ?', a: 21 },
  { q: '5 × 6 = ?', a: 30 },
  { q: '8 × 4 = ?', a: 32 }
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PwaSettingsView({
  pwaStatus,
  onTriggerInstall,
  isDark,
  onToggleTheme,
  transparencyPct,
  onChangeTransparency,
  profile,
  onStoreUpdated
}: PwaSettingsViewProps) {
  const app = getKidApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [unlocked, setUnlocked] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(() =>
    Math.floor(Math.random() * GROWNUP_CHALLENGES.length)
  );
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [storageStatus, setStorageStatus] = useState<DeviceStorageStatus | null>(null);

  const refreshStorageStatus = useCallback(async () => {
    const ds = getKidApp()?.DeviceStorage;
    if (!ds) return;
    const st = await ds.getStatus();
    setStorageStatus(st);
  }, []);

  useEffect(() => {
    void refreshStorageStatus();
    const onStorageChange = () => void refreshStorageStatus();
    window.addEventListener('kidapp:storage-change', onStorageChange);
    return () => window.removeEventListener('kidapp:storage-change', onStorageChange);
  }, [refreshStorageStatus]);

  const tryUnlock = () => {
    const challenge = GROWNUP_CHALLENGES[challengeIdx];
    if (Number(gateInput.trim()) === challenge.a) {
      app?.AudioEngine.correct();
      setUnlocked(true);
      setGateError(false);
      setGateInput('');
    } else {
      app?.AudioEngine.wrong();
      setGateError(true);
      setGateInput('');
    }
  };

  const handleSaveToFiles = async () => {
    const store = app?.bridge?.profileStore.store;
    const ds = app?.DeviceStorage;
    if (!store || !ds) return;
    const res = await ds.shareOrDownloadBackup(store);
    if (res.ok) {
      setBackupMessage(
        res.method === 'share'
          ? '✅ Opened Share Sheet — choose "Save to Files" or iCloud Drive!'
          : '✅ Backup JSON downloaded to your device!'
      );
    }
  };

  const handleLinkDeviceFile = async () => {
    const store = app?.bridge?.profileStore.store;
    const ds = app?.DeviceStorage;
    if (!store || !ds) return;
    const res = await ds.linkSaveFile(store);
    if (res.ok) {
      app?.AudioEngine.correct();
      setBackupMessage(`✅ Auto-saving progress directly to "${res.fileName}" on your device!`);
      void refreshStorageStatus();
    } else if (res.reason !== 'cancelled') {
      setBackupMessage('ℹ️ File linking is not supported on this browser; use Save to Files instead.');
    }
  };

  const handleReconnectDeviceFile = async () => {
    const store = app?.bridge?.profileStore.store;
    const ds = app?.DeviceStorage;
    if (!store || !ds) return;
    const res = await ds.reconnectSaveFile(store);
    if (res.ok) {
      setBackupMessage(`✅ Reconnected auto-save file "${res.fileName}".`);
      void refreshStorageStatus();
    } else {
      setBackupMessage('⚠️ Could not reconnect file permission.');
    }
  };

  const handleUnlinkDeviceFile = async () => {
    const ds = app?.DeviceStorage;
    if (!ds) return;
    await ds.unlinkSaveFile();
    setBackupMessage('Unlinked auto-save file (progress still stays saved in app storage).');
    void refreshStorageStatus();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const storeCandidate: ProfilesStoreData =
        parsed?.data?.profiles ? parsed.data : parsed?.profiles ? parsed : null;
      if (!storeCandidate || !app?.bridge) {
        throw new Error('Invalid PlaySpark backup JSON.');
      }
      app.bridge.profileStore.replaceStore(storeCandidate);
      onStoreUpdated();
      app.AudioEngine.fanfare();
      setBackupMessage('✅ Profiles and stars restored to device storage!');
      void refreshStorageStatus();
    } catch (err) {
      app?.AudioEngine.wrong();
      setBackupMessage(
        `⚠️ Restore failed: ${err instanceof Error ? err.message : 'Invalid file'}`
      );
    }
  };

  const handleResetDemo = () => {
    if (!app?.bridge) return;
    app.bridge.profileStore.resetCurrent();
    onStoreUpdated();
    setConfirmReset(false);
    setBackupMessage('🔄 Current kid profile reset to fresh starter state.');
    void refreshStorageStatus();
  };

  const challenge = GROWNUP_CHALLENGES[challengeIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* Status & Readiness Header */}
      <section className="liquid-glass rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
              ⚙️ App Settings &amp; Device Storage
            </h1>
            <p className="mt-0.5 text-xs opacity-75">
              Install PlaySpark on your home screen, toggle Glass mode, or manage phone backups.
            </p>
          </div>

          {pwaStatus.isStandalone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              ✅ Installed &amp; Offline Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3.5 py-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-200">
              🌐 Web Mode
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="liquid-glass rounded-2xl p-3">
            <div className="text-xs font-semibold opacity-70">Web Manifest</div>
            <div className="mt-1 text-sm font-extrabold">
              {pwaStatus.manifestReady ? '✅ Ready (PlaySpark)' : '⏳ Preparing'}
            </div>
          </div>
          <div className="liquid-glass rounded-2xl p-3">
            <div className="text-xs font-semibold opacity-70">iOS / macOS Icons</div>
            <div className="mt-1 text-sm font-extrabold">
              {pwaStatus.appleMetaReady ? '✅ 180px + Maskable' : '⏳ Preparing'}
            </div>
          </div>
          <div className="liquid-glass rounded-2xl p-3">
            <div className="text-xs font-semibold opacity-70">Offline Cache (SW)</div>
            <div className="mt-1 text-sm font-extrabold">
              {pwaStatus.swStatus === 'active'
                ? '✅ Active Offline'
                : pwaStatus.swStatus === 'sandboxed'
                ? 'ℹ️ Preview / No SW'
                : '⏳ Initializing'}
            </div>
          </div>
          <div className="liquid-glass rounded-2xl p-3">
            <div className="text-xs font-semibold opacity-70">Phone App Storage</div>
            <div className="mt-1 text-sm font-extrabold">
              {storageStatus?.persisted
                ? '🔒 Persistent Device'
                : storageStatus?.opfsReady || storageStatus?.idbReady
                ? '💾 App Storage Active'
                : '💾 Local Storage'}
            </div>
            {storageStatus && storageStatus.usageBytes > 0 && (
              <div className="tabular-nums mt-0.5 text-[11px] opacity-65">
                {formatBytes(storageStatus.usageBytes)} used
              </div>
            )}
          </div>
        </div>
      </section>

      {/* OS-Aware Install Card & Appearance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="liquid-glass rounded-[26px] p-4 sm:p-5 lg:col-span-7">
          <h2 className="text-base font-extrabold tracking-tight">📲 Install on This Device</h2>

          {pwaStatus.installTarget === 'installed' && (
            <div className="mt-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 p-4 text-sm">
              <strong>You are running PlaySpark as an installed app!</strong>
              <p className="mt-1 text-xs opacity-80">
                All math blocks, phonics games, puzzles, and progress are stored on your device for
                offline play.
              </p>
            </div>
          )}

          {pwaStatus.installTarget === 'native-prompt' && (
            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-indigo-400/35 bg-indigo-500/10 p-4">
              <p className="text-xs font-medium opacity-85">
                Install PlaySpark directly to your Home Screen or Desktop Apps for instant launch.
              </p>
              <button
                type="button"
                onClick={() => void onTriggerInstall()}
                className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-5 text-sm font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
              >
                📲 Install PlaySpark App
              </button>
            </div>
          )}

          {pwaStatus.installTarget === 'ios-safari' && (
            <div className="mt-3 rounded-2xl border border-sky-400/35 bg-sky-500/10 p-4 text-xs leading-relaxed">
              <div className="text-sm font-extrabold">🍎 Install on iPhone or iPad (Safari)</div>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 font-medium">
                <li>
                  Tap the <strong>Share</strong> button (square with upward arrow) in Safari&apos;s
                  toolbar.
                </li>
                <li>
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                </li>
                <li>
                  Tap <strong>Add</strong> — PlaySpark gets its own isolated app storage on your
                  device!
                </li>
              </ol>
            </div>
          )}

          {pwaStatus.installTarget === 'macos-safari' && (
            <div className="mt-3 rounded-2xl border border-sky-400/35 bg-sky-500/10 p-4 text-xs leading-relaxed">
              <div className="text-sm font-extrabold">💻 Install on Mac (Safari)</div>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 font-medium">
                <li>
                  In the top menu bar, click <strong>File → &quot;Add to Dock...&quot;</strong>.
                </li>
                <li>
                  Click <strong>Add</strong> to pin PlaySpark right to your macOS Dock.
                </li>
              </ol>
            </div>
          )}

          {pwaStatus.installTarget === 'browser-manual' && (
            <div className="mt-3 rounded-2xl border border-slate-400/30 bg-black/5 p-4 text-xs leading-relaxed dark:bg-white/5">
              <div className="text-sm font-extrabold">🌐 Browser Install Hint</div>
              <p className="mt-1 opacity-80">
                Look for the <strong>Install</strong> icon in your browser&apos;s address bar or
                open the browser menu (⋮) and choose <strong>Install PlaySpark</strong> /{' '}
                <strong>Add to Home Screen</strong>.
              </p>
            </div>
          )}
        </section>

        <section className="liquid-glass rounded-[26px] p-4 sm:p-5 lg:col-span-5">
          <h2 className="text-base font-extrabold tracking-tight">🌗 Glass Theme &amp; Transparency</h2>
          <p className="mt-1 text-xs opacity-75">
            Switch Light/Dark Glass or adjust transparency up to Complete Glass.
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="liquid-glass mt-3 flex min-h-[44px] w-full items-center justify-between rounded-2xl px-4 text-sm font-bold transition hover:brightness-105 active:scale-[0.98]"
          >
            <span>{isDark ? '🌙 Dark Glass Active' : '☀️ Light Glass Active'}</span>
            <span className="liquid-glass-active rounded-full px-3 py-1 text-xs">Switch</span>
          </button>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold">
              <span>🫧 Glass Transparency</span>
              <span className="tabular-nums rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-indigo-700 dark:text-indigo-200">
                {transparencyPct}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              step={5}
              value={transparencyPct}
              onChange={(e) => onChangeTransparency(Number(e.target.value))}
              aria-label="Glass Transparency Percentage"
              className="w-full cursor-pointer accent-indigo-600"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: 'Frosted 25%', value: 25 },
                { label: 'Balanced 55%', value: 55 },
                { label: 'Complete Glass 90%', value: 90 }
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onChangeTransparency(preset.value)}
                  className={`min-h-[32px] rounded-full px-2.5 text-[11px] font-bold transition ${
                    transparencyPct === preset.value
                      ? 'liquid-glass-active'
                      : 'liquid-glass opacity-80 hover:opacity-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Glass Preview Strip */}
            <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-sky-400 to-emerald-400 p-2.5">
              <div className="liquid-glass-capsule flex items-center justify-between rounded-full px-3 py-1.5">
                <span className="text-[11px] font-bold">Preview Bar</span>
                <span className="liquid-glass-active rounded-full px-2.5 py-0.5 text-[11px] font-extrabold">
                  Selected
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Grown-Ups Gate Protecting Device File Sync / Export / Import / Reset */}
      <section className="liquid-glass rounded-[26px] p-4 sm:p-5">
        {!unlocked ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                🔒
              </span>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  👨‍👩‍👧 Grown-Ups Device Storage &amp; Backup
                </h2>
                <p className="text-xs opacity-70">
                  Solve to link a phone save file, save to Files/iCloud, restore, or reset{' '}
                  <strong>{profile.name || 'Kid'}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-extrabold text-indigo-700 dark:text-indigo-200">
                {challenge.q}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') tryUnlock();
                }}
                placeholder="?"
                aria-label="Grown-up verification answer"
                className="tabular-nums min-h-[44px] w-20 rounded-xl border border-slate-400/40 bg-white/70 px-3 text-center text-sm font-extrabold dark:bg-black/30"
              />
              <button
                type="button"
                onClick={tryUnlock}
                className="min-h-[44px] rounded-full bg-indigo-600 px-4 text-xs font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]"
              >
                🔓 Unlock
              </button>
              {gateError && <span className="text-xs font-bold text-rose-500">Try again!</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  💾 Phone Storage &amp; Backups
                </h2>
                <p className="text-xs opacity-70">
                  Progress auto-saves in persistent device storage (IndexedDB + OPFS). You can also
                  back up directly to your phone&apos;s Files folder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUnlocked(false);
                  setConfirmReset(false);
                  setChallengeIdx(Math.floor(Math.random() * GROWNUP_CHALLENGES.length));
                }}
                className="liquid-glass min-h-[40px] rounded-full px-3 text-xs font-bold"
              >
                🔒 Lock
              </button>
            </div>

            {/* Android / Desktop Real Device Auto-Save File */}
            {storageStatus?.supportsFilePicker && (
              <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold">
                      📁 Auto-Save to Real Device File (Android / Desktop)
                    </div>
                    <div className="mt-0.5 opacity-80">
                      {storageStatus.linkedFileName
                        ? `Linked: ${storageStatus.linkedFileName} (${
                            storageStatus.filePermission === 'granted'
                              ? 'Auto-saving live'
                              : 'Tap Reconnect to resume'
                          })`
                        : 'Pick a .json file in Downloads or Documents once — PlaySpark will auto-save every star to it.'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!storageStatus.linkedFileName ? (
                      <button
                        type="button"
                        onClick={() => void handleLinkDeviceFile()}
                        className="min-h-[40px] rounded-full bg-indigo-600 px-3.5 font-extrabold text-white"
                      >
                        📁 Link Save File
                      </button>
                    ) : (
                      <>
                        {storageStatus.filePermission !== 'granted' && (
                          <button
                            type="button"
                            onClick={() => void handleReconnectDeviceFile()}
                            className="min-h-[40px] rounded-full bg-indigo-600 px-3.5 font-extrabold text-white"
                          >
                            🔄 Reconnect
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleUnlinkDeviceFile()}
                          className="liquid-glass min-h-[40px] rounded-full px-3.5 font-bold"
                        >
                          Unlink
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => void handleSaveToFiles()}
                className="min-h-[48px] rounded-full bg-indigo-600 px-4 text-xs font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]"
              >
                📲 Save to Files / Download JSON
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="liquid-glass min-h-[48px] rounded-full px-4 text-xs font-extrabold transition hover:brightness-105 active:scale-[0.98]"
              >
                ⬆️ Import Restore
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset((v) => !v)}
                className="min-h-[48px] rounded-full border border-rose-500/40 bg-rose-500/15 px-4 text-xs font-extrabold text-rose-600 transition hover:brightness-105 active:scale-[0.98] dark:text-rose-300"
              >
                🗑️ Reset Kid Progress
              </button>
            </div>

            {confirmReset && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-xs">
                <span className="font-bold">
                  Reset all stars, treasures, and progress for {profile.name || 'this kid'}?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="min-h-[40px] rounded-full bg-rose-600 px-3.5 font-extrabold text-white"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="liquid-glass min-h-[40px] rounded-full px-3.5 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {backupMessage && (
              <div className="rounded-xl bg-black/5 px-3 py-2 text-xs font-bold dark:bg-white/10">
                {backupMessage}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
