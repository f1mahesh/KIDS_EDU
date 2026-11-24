/* Letter Blaster / Sound Smash AR — Writing & Spelling Action Arcade Game */
(function (app) {
  'use strict';

  const { AudioEngine, TREASURE_BY_ID, pickRandomTreasure, drawTreasureCanvasItem, EnglishPhonics } = app;

const PHONICS_SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   fallSpeed: 0.78, duration: 90, hardThreshold: 15, maxOrbs: 4 },
    medium: { label: '🚀 Medium (Ages 6–8)', fallSpeed: 1.25, duration: 75, hardThreshold: 21, maxOrbs: 5 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  fallSpeed: 1.85, duration: 60, hardThreshold: 27, maxOrbs: 6 }
  };

  const TIER_LABELS = {
    all:  '🌟 All Grades',
    k:    '🐣 Kindergarten',
    g1:   '🌱 Grade 1',
    g2:   '🚀 Grade 2',
    g3:   '🔭 Grade 3',
    g4_5: '🏆 Grades 4–5'
  };

  const ORB_PALETTES = [
    { core: '#bae6fd', mid: '#0ea5e9', edge: '#0369a1', glow: '#38bdf8', border: '#e0f2fe', shards: ['#bae6fd', '#38bdf8', '#ffffff'] },
    { core: '#fbcfe8', mid: '#ec4899', edge: '#9d174d', glow: '#f472b6', border: '#fce7f3', shards: ['#fbcfe8', '#ec4899', '#fde047'] },
    { core: '#ddd6fe', mid: '#8b5cf6', edge: '#4c1d95', glow: '#a855f7', border: '#ede9fe', shards: ['#ddd6fe', '#a855f7', '#38bdf8'] },
    { core: '#bbf7d0', mid: '#10b981', edge: '#065f46', glow: '#34d399', border: '#dcfce7', shards: ['#bbf7d0', '#34d399', '#fde047'] },
    { core: '#fef08a', mid: '#f59e0b', edge: '#b45309', glow: '#fbbf24', border: '#fef9c3', shards: ['#fef08a', '#fbbf24', '#ffffff'] }
  ];

  const HAZARD_STYLE = {
    glow: '#ef4444',
    shardColors: ['#dc2626', '#7f1d1d', '#1e293b']
  };

  const FALLBACK_WORDS = [
    // Kindergarten (3-letter CVC)
    { word: 'cat',  emoji: '🐱', tier: 'k',    letters: ['c', 'a', 't'],      tiles: ['c', 'a', 't'] },
    { word: 'dog',  emoji: '🐶', tier: 'k',    letters: ['d', 'o', 'g'],      tiles: ['d', 'o', 'g'] },
    { word: 'sun',  emoji: '☀️', tier: 'k',    letters: ['s', 'u', 'n'],      tiles: ['s', 'u', 'n'] },
    { word: 'hat',  emoji: '🎩', tier: 'k',    letters: ['h', 'a', 't'],      tiles: ['h', 'a', 't'] },
    { word: 'pig',  emoji: '🐷', tier: 'k',    letters: ['p', 'i', 'g'],      tiles: ['p', 'i', 'g'] },
    { word: 'bus',  emoji: '🚌', tier: 'k',    letters: ['b', 'u', 's'],      tiles: ['b', 'u', 's'] },
    { word: 'fox',  emoji: '🦊', tier: 'k',    letters: ['f', 'o', 'x'],      tiles: ['f', 'o', 'x'] },
    { word: 'bug',  emoji: '🐛', tier: 'k',    letters: ['b', 'u', 'g'],      tiles: ['b', 'u', 'g'] },
    { word: 'bed',  emoji: '🛏️', tier: 'k',    letters: ['b', 'e', 'd'],      tiles: ['b', 'e', 'd'] },
    { word: 'cup',  emoji: '🥤', tier: 'k',    letters: ['c', 'u', 'p'],      tiles: ['c', 'u', 'p'] },
    // Grade 1 (digraphs & blends)
    { word: 'ship', emoji: '🚢', tier: 'g1',   letters: ['s', 'h', 'i', 'p'], tiles: ['sh', 'i', 'p'] },
    { word: 'fish', emoji: '🐟', tier: 'g1',   letters: ['f', 'i', 's', 'h'], tiles: ['f', 'i', 'sh'] },
    { word: 'frog', emoji: '🐸', tier: 'g1',   letters: ['f', 'r', 'o', 'g'], tiles: ['f', 'r', 'o', 'g'] },
    { word: 'duck', emoji: '🦆', tier: 'g1',   letters: ['d', 'u', 'c', 'k'], tiles: ['d', 'u', 'ck'] },
    { word: 'star', emoji: '⭐', tier: 'g1',   letters: ['s', 't', 'a', 'r'], tiles: ['st', 'a', 'r'] },
    { word: 'crab', emoji: '🦀', tier: 'g1',   letters: ['c', 'r', 'a', 'b'], tiles: ['c', 'r', 'a', 'b'] },
    { word: 'drum', emoji: '🥁', tier: 'g1',   letters: ['d', 'r', 'u', 'm'], tiles: ['d', 'r', 'u', 'm'] },
    { word: 'bell', emoji: '🔔', tier: 'g1',   letters: ['b', 'e', 'l', 'l'], tiles: ['b', 'e', 'll'] },
    // Grade 2 (vowel teams & silent-e)
    { word: 'cake', emoji: '🎂', tier: 'g2',   letters: ['c', 'a', 'k', 'e'], tiles: ['c', 'a', 'k', 'e'] },
    { word: 'rain', emoji: '🌧️', tier: 'g2',   letters: ['r', 'a', 'i', 'n'], tiles: ['r', 'ai', 'n'] },
    { word: 'boat', emoji: '⛵', tier: 'g2',   letters: ['b', 'o', 'a', 't'], tiles: ['b', 'oa', 't'] },
    { word: 'tree', emoji: '🌳', tier: 'g2',   letters: ['t', 'r', 'e', 'e'], tiles: ['t', 'r', 'ee'] },
    { word: 'moon', emoji: '🌙', tier: 'g2',   letters: ['m', 'o', 'o', 'n'], tiles: ['m', 'oo', 'n'] },
    { word: 'kite', emoji: '🪁', tier: 'g2',   letters: ['k', 'i', 't', 'e'], tiles: ['k', 'i', 't', 'e'] },
    { word: 'bird', emoji: '🐦', tier: 'g2',   letters: ['b', 'i', 'r', 'd'], tiles: ['b', 'ir', 'd'] },
    { word: 'snow', emoji: '❄️', tier: 'g2',   letters: ['s', 'n', 'o', 'w'], tiles: ['s', 'n', 'ow'] },
    // Grade 3 (4-letter spelling)
    { word: 'book', emoji: '📚', tier: 'g3',   letters: ['b', 'o', 'o', 'k'], tiles: ['b', 'oo', 'k'] },
    { word: 'milk', emoji: '🥛', tier: 'g3',   letters: ['m', 'i', 'l', 'k'], tiles: ['m', 'i', 'l', 'k'] },
    { word: 'jump', emoji: '🦘', tier: 'g3',   letters: ['j', 'u', 'm', 'p'], tiles: ['j', 'u', 'm', 'p'] },
    { word: 'lamp', emoji: '💡', tier: 'g3',   letters: ['l', 'a', 'm', 'p'], tiles: ['l', 'a', 'm', 'p'] },
    { word: 'tent', emoji: '⛺', tier: 'g3',   letters: ['t', 'e', 'n', 't'], tiles: ['t', 'e', 'n', 't'] },
    { word: 'wolf', emoji: '🐺', tier: 'g3',   letters: ['w', 'o', 'l', 'f'], tiles: ['w', 'o', 'l', 'f'] },
    { word: 'king', emoji: '👑', tier: 'g3',   letters: ['k', 'i', 'n', 'g'], tiles: ['k', 'i', 'ng'] },
    // Grades 4–5 (4-letter crisp vocabulary)
    { word: 'gold', emoji: '🪙', tier: 'g4_5', letters: ['g', 'o', 'l', 'd'], tiles: ['g', 'o', 'l', 'd'] },
    { word: 'glow', emoji: '✨', tier: 'g4_5', letters: ['g', 'l', 'o', 'w'], tiles: ['g', 'l', 'ow'] },
    { word: 'gift', emoji: '🎁', tier: 'g4_5', letters: ['g', 'i', 'f', 't'], tiles: ['g', 'i', 'f', 't'] },
    { word: 'maze', emoji: '🧩', tier: 'g4_5', letters: ['m', 'a', 'z', 'e'], tiles: ['m', 'a', 'z', 'e'] },
    { word: 'mint', emoji: '🌿', tier: 'g4_5', letters: ['m', 'i', 'n', 't'], tiles: ['m', 'i', 'n', 't'] },
    { word: 'echo', emoji: '🔊', tier: 'g4_5', letters: ['e', 'c', 'h', 'o'], tiles: ['e', 'ch', 'o'] },
    { word: 'wind', emoji: '💨', tier: 'g4_5', letters: ['w', 'i', 'n', 'd'], tiles: ['w', 'i', 'n', 'd'] }
  ];

  const SINGLE_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const PHONICS_CHUNKS = ['sh', 'ch', 'th', 'ck', 'ng', 'ai', 'ee', 'oo', 'oa', 'ow', 'ir', 'ar', 'st', 'll'];

  function normalizeTier(tier) {
    const t = String(tier || 'all').toLowerCase().trim();
    if (t === 'prek' || t === 'pre_k' || t === 'pre-k') return 'k';
    if (t === 'g4' || t === 'g5' || t === 'g4-5') return 'g4_5';
    return Object.prototype.hasOwnProperty.call(TIER_LABELS, t) ? t : 'all';
  }

  function drawRoundedRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rad);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  class PhonicsBlasterGame {
    constructor(options = {}) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;

      this.stream = null;
      this.hasCamera = false;
      this.showCamera = true;
      this.running = false;
      this.rafId = null;
      this.timerId = null;
      this.nextWordTimer = null;

      this.tier = 'all';
      this.speed = 'slow';
      this.score = 0;
      this.wordsDone = 0;
      this.streak = 0;
      this.stars = 0;
      this.timeLeft = 90;
      this.shakeFrames = 0;
      this.globalHitCooldown = 0;
      this.tick = 0;

      this.currentWordObj = null;
      this.currentWordText = '';
      this.currentEmoji = '🔤';
      this.targetTiles = [];
      this.slotIndex = 0;
      this.slotFlashes = [];
      this.wordCompleted = false;
      this.bannerPulse = 0;
      this.hintText = '';
      this.hintTimer = 0;

      this.orbs = [];
      this.shards = [];
      this.popups = [];
      this.galaxyStars = [];

      this._initGalaxy();
      this._bindPointer();
      this._onResize = () => { if (this.running) this._syncCanvasSize(); };
      window.addEventListener('resize', this._onResize);
    }

    _syncCanvasSize() {
      const vw = Math.max(320, window.innerWidth || 640);
      const vh = Math.max(320, window.innerHeight || 480);
      const w = Math.max(480, Math.min(920, vw));
      const h = Math.max(360, Math.round((w * vh) / vw));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.motionCanvas.width = 80;
        this.motionCanvas.height = Math.max(44, Math.round((80 * h) / w));
        this.prevFrame = null;
        this._initGalaxy();
      }
    }

    _drawVideoCover(targetCtx, tw, th) {
      const vw = this.video.videoWidth || tw;
      const vh = this.video.videoHeight || th;
      const scale = Math.max(tw / vw, th / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (tw - dw) / 2;
      const dy = (th - dh) / 2;
      targetCtx.save();
      targetCtx.scale(-1, 1);
      targetCtx.drawImage(this.video, -(dx + dw), dy, dw, dh);
      targetCtx.restore();
    }

    _initGalaxy() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.galaxyStars = [];
      for (let i = 0; i < 75; i++) {
        this.galaxyStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.04 + Math.random() * 0.06,
          tint: i % 4 === 0 ? '#bae6fd' : i % 5 === 0 ? '#fbcfe8' : '#ffffff'
        });
      }
    }

    toggleCameraView() {
      this.showCamera = !this.showCamera;
      return this.showCamera;
    }

    _bindPointer() {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running || this.globalHitCooldown > 0) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

        // One tap hits strictly ONE orb at a time!
        for (let i = this.orbs.length - 1; i >= 0; i--) {
          const orb = this.orbs[i];
          if (Math.hypot(x - orb.x, y - orb.y) <= orb.r + 12) {
            this._handleOrbHit(orb, i);
            break;
          }
        }
      });
    }

    setTier(tier) {
      this.tier = normalizeTier(tier);
      if (this.running) {
        if (this.nextWordTimer) {
          clearTimeout(this.nextWordTimer);
          this.nextWordTimer = null;
        }
        this._loadNextWord();
      }
      this.onStatus(`📚 ${TIER_LABELS[this.tier]} — Spell left-to-right by punching, kicking, or tapping!`);
    }

    setSpeed(speedKey) {
      this.speed = PHONICS_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = PHONICS_SPEED_PRESETS[this.speed];
      this.onStatus(`🥊 ${preset.label} — Hit the glowing yellow slot's sound next!`);
    }

    repeatWord() {
      if (!this.currentWordObj) return;
      this.bannerPulse = 18;
      this._speakWord(this.currentWordObj, 'Spell');
    }

    async start(tier = 'all', speedKey = 'slow') {
      this.stop();
      this._syncCanvasSize();
      this.tier = normalizeTier(tier);
      this.speed = PHONICS_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = PHONICS_SPEED_PRESETS[this.speed];

      this.score = 0;
      this.wordsDone = 0;
      this.streak = 0;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.shakeFrames = 0;
      this.globalHitCooldown = 0;
      this.prevFrame = null;
      this.orbs = [];
      this.shards = [];
      this.popups = [];
      this.hintText = '';
      this.hintTimer = 0;
      this.running = true;
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.onStatus('📷 Starting Letter Blaster AR Camera...');
      await this._startCamera();
      this._loadNextWord();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this.onScore({
          score: this.score,
          wordsDone: this.wordsDone,
          streak: this.streak,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedWord: null
        });
        if (this.timeLeft <= 0) {
          const finalScore = this.score;
          const finalWords = this.wordsDone;
          const finalStars = this.stars;
          this.stop();
          this.onFinish({
            score: finalScore,
            wordsDone: finalWords,
            stars: finalStars
          });
        }
      }, 1000);

      const loop = () => {
        if (!this.running) return;
        this._update();
        this._render();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    async _startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.hasCamera = false;
        this.onStatus('💥 Touch Smash Mode! Tap the matching letter orbs in order!');
        return;
      }
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        this.video.srcObject = this.stream;
        await this.video.play();
        this.hasCamera = true;
        this.onStatus('🥊 PUNCH & 🦶 KICK matching letter orbs left-to-right to spell!');
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('💥 Touch Smash Mode (Camera off)! Tap letters in order to spell!');
      }
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.nextWordTimer) {
        clearTimeout(this.nextWordTimer);
        this.nextWordTimer = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    _usePhonicsTilesMode() {
      return this.tier === 'k' || this.tier === 'g1' || this.tier === 'g2';
    }

    _extractSequence(wordObj) {
      const rawWord = String((wordObj && (wordObj.word || wordObj.text)) || 'cat').trim();
      const useTiles = this._usePhonicsTilesMode();
      let seq = null;
      if (useTiles && wordObj && Array.isArray(wordObj.tiles) && wordObj.tiles.length > 0) {
        seq = wordObj.tiles;
      } else if (wordObj && Array.isArray(wordObj.letters) && wordObj.letters.length > 0) {
        seq = wordObj.letters;
      } else if (wordObj && Array.isArray(wordObj.tiles) && wordObj.tiles.length > 0) {
        seq = wordObj.tiles;
      } else {
        seq = rawWord.split('');
      }
      return seq.map((item) => {
        const s = String(item).trim();
        return { raw: s.toLowerCase(), label: s.toUpperCase() };
      });
    }

    _pickWordFromBank() {
      const pool = this.tier === 'all'
        ? FALLBACK_WORDS
        : FALLBACK_WORDS.filter((w) => w.tier === this.tier);
      const candidates = pool.length > 0 ? pool : FALLBACK_WORDS;
      let picked = candidates[Math.floor(Math.random() * candidates.length)];
      if (candidates.length > 1 && picked.word.toUpperCase() === this.currentWordText) {
        picked = candidates[(candidates.indexOf(picked) + 1 + Math.floor(Math.random() * (candidates.length - 1))) % candidates.length];
      }
      return picked;
    }

    _pickTargetWord() {
      const ep = EnglishPhonics;
      if (ep && typeof ep.pickWord === 'function') {
        for (let attempt = 0; attempt < 8; attempt++) {
          const candidate = ep.pickWord(this.tier, this.currentWordText);
          if (!candidate) continue;
          const text = String(candidate.word || candidate.text || '').trim().toUpperCase();
          const seq = this._extractSequence(candidate);
          if (seq.length >= 3 && seq.length <= 4 && text && text !== this.currentWordText) {
            return candidate;
          }
          if (attempt === 7 && seq.length >= 2 && seq.length <= 5 && text) {
            return candidate;
          }
        }
      }
      return this._pickWordFromBank();
    }

    _loadNextWord() {
      const wordObj = this._pickTargetWord();
      this.currentWordObj = wordObj;
      this.currentWordText = String((wordObj && (wordObj.word || wordObj.text)) || 'CAT').trim().toUpperCase();
      this.currentEmoji = (wordObj && (wordObj.emoji || wordObj.icon)) || '🔤';
      this.targetTiles = this._extractSequence(wordObj);
      this.slotIndex = 0;
      this.slotFlashes = this.targetTiles.map(() => 0);
      this.wordCompleted = false;
      this.bannerPulse = 18;
      this.hintText = '';
      this.hintTimer = 0;
      this.orbs = [];

      this._ensureOrbs();
      this._speakWord(wordObj, 'Spell');
    }

    _speakPhoneme(rawTile) {
      const ep = EnglishPhonics;
      if (ep && typeof ep.speakPhoneme === 'function') {
        try {
          ep.speakPhoneme(rawTile);
          return;
        } catch (_) {}
      }
      if (AudioEngine && typeof AudioEngine.speak === 'function') {
        AudioEngine.speak(rawTile, 'gentle');
      }
    }

    _speakWord(wordObj, prefix = '') {
      const ep = EnglishPhonics;
      if (ep && typeof ep.speakWord === 'function') {
        try {
          if (prefix) ep.speakWord(wordObj, prefix);
          else ep.speakWord(wordObj);
          return;
        } catch (_) {}
      }
      const wordStr = typeof wordObj === 'string'
        ? wordObj
        : String((wordObj && (wordObj.word || wordObj.text)) || this.currentWordText);
      const text = prefix ? `${prefix} ${wordStr}` : wordStr;
      if (AudioEngine && typeof AudioEngine.speak === 'function') {
        AudioEngine.speak(text, 'cheer');
      }
    }

    _pickDistractorTile(neededLabel) {
      const existingLabels = new Set(this.orbs.filter((o) => o.isLetter).map((o) => o.tileLabel));
      existingLabels.add(neededLabel);

      // Prefer a mix of single letters and (when in tiles mode) phonics chunks
      const useChunks = this._usePhonicsTilesMode() && Math.random() < 0.35;
      const pool = useChunks ? PHONICS_CHUNKS : SINGLE_LETTERS;

      for (let i = 0; i < 16; i++) {
        const raw = pool[Math.floor(Math.random() * pool.length)];
        const label = raw.toUpperCase();
        if (!existingLabels.has(label)) {
          return { raw, label };
        }
      }
      const fallback = SINGLE_LETTERS.find((l) => !existingLabels.has(l.toUpperCase())) || 'z';
      return { raw: fallback, label: fallback.toUpperCase() };
    }

    _spawnOrb(kind, tileData = null, yOffset = 0) {
      const preset = PHONICS_SPEED_PRESETS[this.speed] || PHONICS_SPEED_PRESETS.slow;
      const w = this.canvas.width;
      const r = kind === 'treasure' ? 46 : kind === 'hazard' ? 46 : 48;

      for (let attempt = 0; attempt < 18; attempt++) {
        const x = 78 + Math.random() * (w - 156);
        const y = -r - 18 - yOffset - Math.random() * 110;
        const tooClose = this.orbs.some((other) => Math.hypot(x - other.x, y - other.y) < r + other.r + 34);
        if (tooClose) continue;

        if (kind === 'treasure' ) {
          const mat = pickRandomTreasure();
          this.orbs.push({
            x,
            y,
            r,
            vx: (Math.random() - 0.5) * 0.4,
            vy: preset.fallSpeed + 0.15 + Math.random() * 0.35,
            rot: 0,
            vrot: 0,
            isLetter: false,
            isTreasure: true,
            isHazard: false,
            treasureId: mat.id,
            points: mat.pts,
            glow: mat.glow,
            shardColors: mat.shardColors,
            wobble: 0,
            wrongCooldown: 0
          });
          return true;
        }

        if (kind === 'hazard') {
          this.orbs.push({
            x,
            y,
            r,
            vx: (Math.random() - 0.5) * 0.45,
            vy: preset.fallSpeed + Math.random() * 0.4,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.025,
            isLetter: false,
            isTreasure: false,
            isHazard: true,
            points: -15,
            glow: HAZARD_STYLE.glow,
            shardColors: HAZARD_STYLE.shardColors,
            poly: this._makePolygon(r, 11, 0.3),
            wobble: 0,
            wrongCooldown: 0
          });
          return true;
        }

        const palette = ORB_PALETTES[Math.floor(Math.random() * ORB_PALETTES.length)];
        this.orbs.push({
          x,
          y,
          r,
          vx: (Math.random() - 0.5) * 0.4,
          vy: preset.fallSpeed + Math.random() * 0.35,
          rot: 0,
          vrot: 0,
          isLetter: true,
          isTreasure: false,
          isHazard: false,
          tileRaw: tileData.raw,
          tileLabel: tileData.label,
          palette,
          glow: palette.glow,
          shardColors: palette.shards,
          wobble: 0,
          wrongCooldown: 0
        });
        return true;
      }
      return false;
    }

    _ensureOrbs() {
      if (!this.running || this.wordCompleted || this.slotIndex >= this.targetTiles.length) return;
      const preset = PHONICS_SPEED_PRESETS[this.speed] || PHONICS_SPEED_PRESETS.slow;
      const needed = this.targetTiles[this.slotIndex];

      // Always ensure the next needed tile is falling!
      const hasNeeded = this.orbs.some((o) => o.isLetter && o.tileLabel === needed.label);
      if (!hasNeeded) {
        this._spawnOrb('letter', needed, 0);
      }

      let guard = 0;
      while (this.orbs.length < preset.maxOrbs && guard < 20) {
        guard++;
        const hasTreasure = this.orbs.some((o) => o.isTreasure);
        const hasHazard = this.orbs.some((o) => o.isHazard);
        const roll = Math.random();

        if (true && !hasTreasure && roll < 0.18) {
          this._spawnOrb('treasure', null, 30);
        } else if (!hasHazard && roll < 0.34) {
          this._spawnOrb('hazard', null, 40);
        } else {
          const distractor = this._pickDistractorTile(needed.label);
          this._spawnOrb('letter', distractor, 20);
        }
      }
    }

    _makePolygon(r, sides = 10, variance = 0.25) {
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const ang = (Math.PI * 2 * i) / sides;
        const rad = r * (1 - variance * 0.5 + Math.random() * variance);
        pts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
      }
      return pts;
    }

    _spawnBurst(x, y, colors, count = 20) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const spd = 2.8 + Math.random() * 6.2;
        this.shards.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.6,
          size: 6 + Math.random() * 9,
          color: colors[i % colors.length],
          life: 26 + Math.random() * 14
        });
      }
    }

    _handleOrbHit(orb, index) {
      if (orb.isHazard) {
        this.globalHitCooldown = 16;
        this.orbs.splice(index, 1);
        this.shakeFrames = 10;
        this.score = Math.max(0, this.score - 15);
        this.streak = 0;
        if (AudioEngine) AudioEngine.wrong();
        this._spawnBurst(orb.x, orb.y, orb.shardColors, 20);
        this.popups.push({
          x: orb.x,
          y: orb.y - 12,
          text: '🚫 -15! SKIP!',
          color: '#ef4444',
          life: 44
        });
        this.onScore({
          score: this.score,
          wordsDone: this.wordsDone,
          streak: this.streak,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedWord: null
        });
        return;
      }

      if (orb.isTreasure) {
        this.globalHitCooldown = 16;
        this.orbs.splice(index, 1);
        this.shakeFrames = 8;
        this.score += orb.points;
        if (AudioEngine) AudioEngine.magic();
        this._spawnBurst(orb.x, orb.y, orb.shardColors, 22);
        const matInfo = true ? TREASURE_BY_ID[orb.treasureId] : null;
        this.popups.push({
          x: orb.x,
          y: orb.y - 12,
          text: matInfo ? `${matInfo.emoji} +${orb.points} ${matInfo.short}!` : `💎 +${orb.points}!`,
          color: '#fde047',
          life: 46
        });
        this.onScore({
          score: this.score,
          wordsDone: this.wordsDone,
          streak: this.streak,
          timeLeft: this.timeLeft,
          collectedMaterial: orb.treasureId,
          solvedWord: null
        });
        return;
      }

      if (this.wordCompleted || this.slotIndex >= this.targetTiles.length) return;
      const needed = this.targetTiles[this.slotIndex];

      if (orb.tileLabel === needed.label) {
        // Correct next tile!
        this.globalHitCooldown = 16;
        this.orbs.splice(index, 1);
        this.shakeFrames = 8;
        this.score += 30;
        this.streak += 1;
        this.slotFlashes[this.slotIndex] = 22;
        this.hintText = '';
        this.hintTimer = 0;

        if (AudioEngine) AudioEngine.pop();
        this._speakPhoneme(needed.raw);
        this._spawnBurst(orb.x, orb.y, orb.shardColors, 22);
        this.popups.push({
          x: orb.x,
          y: orb.y - 12,
          text: `✨ ${needed.label}! +30`,
          color: '#4ade80',
          life: 44
        });

        this.slotIndex += 1;

        if (this.slotIndex >= this.targetTiles.length) {
          this._completeWord();
        } else {
          this.onScore({
            score: this.score,
            wordsDone: this.wordsDone,
            streak: this.streak,
            timeLeft: this.timeLeft,
            collectedMaterial: null,
            solvedWord: null
          });
          this._ensureOrbs();
        }
      } else {
        // Wrong distractor: gentle wobble & buzz without breaking flow!
        if (orb.wrongCooldown > 0) return;
        this.globalHitCooldown = 12;
        orb.wobble = 16;
        orb.wrongCooldown = 22;
        orb.vy = Math.max(0.35, orb.vy * 0.65);

        const tip = `💡 Need /${needed.raw}/!`;
        this.hintText = tip;
        this.hintTimer = 75;

        if (AudioEngine) AudioEngine.wrong();
        this.popups.push({
          x: orb.x,
          y: orb.y - 14,
          text: tip,
          color: '#fbbf24',
          life: 42
        });
        this.onScore({
          score: this.score,
          wordsDone: this.wordsDone,
          streak: this.streak,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedWord: null
        });
      }
    }

    _completeWord() {
      this.wordCompleted = true;
      this.wordsDone += 1;
      this.score += 100;
      this.stars += 2;
      this.shakeFrames = 12;

      const bonusDrop = true ? pickRandomTreasure() : null;
      if (AudioEngine) AudioEngine.magic();
      const solvedWordObj = this.currentWordObj;
      setTimeout(() => {
        if (this.running && this.currentWordObj === solvedWordObj) {
          this._speakWord(solvedWordObj);
        }
      }, 420);

      // Clear remaining letter orbs in a celebratory burst
      for (const rem of this.orbs) {
        if (rem.isLetter) {
          this._spawnBurst(rem.x, rem.y, rem.shardColors, 10);
        }
      }
      this.orbs = this.orbs.filter((o) => o.isTreasure);

      const w = this.canvas.width;
      const h = this.canvas.height;
      this._spawnBurst(w / 2, h - 62, ['#fde047', '#4ade80', '#38bdf8', '#f472b6'], 30);
      this.popups.push({
        x: w / 2,
        y: h - 115,
        text: `🎉 ${this.currentWordText}! +100 🌟+2${bonusDrop ? ' ' + bonusDrop.emoji : ''}`,
        color: '#fde047',
        life: 62
      });

      this.onScore({
        score: this.score,
        wordsDone: this.wordsDone,
        streak: this.streak,
        timeLeft: this.timeLeft,
        collectedMaterial: bonusDrop ? bonusDrop.id : null,
        solvedWord: this.currentWordText
      });

      if (this.nextWordTimer) clearTimeout(this.nextWordTimer);
      this.nextWordTimer = setTimeout(() => {
        this.nextWordTimer = null;
        if (this.running) this._loadNextWord();
      }, 1050);
    }

    _analyzeHits() {
      if (!this.hasCamera || this.video.readyState < 2) return;
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;

      this._drawVideoCover(this.motionCtx, mw, mh);

      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      if (this.globalHitCooldown > 0) {
        this.prevFrame.set(data);
        return;
      }

      const w = this.canvas.width;
      const h = this.canvas.height;
      const preset = PHONICS_SPEED_PRESETS[this.speed] || PHONICS_SPEED_PRESETS.slow;

      // Find ONLY the single orb receiving the strongest punch/kick!
      let bestIdx = -1;
      let bestEnergy = 0;

      for (let i = 0; i < this.orbs.length; i++) {
        const orb = this.orbs[i];
        const cx = Math.round((orb.x / w) * mw);
        const cy = Math.round((orb.y / h) * mh);
        const rad = Math.max(4, Math.round((orb.r / w) * mw));

        let hardPixels = 0;
        let softPixels = 0;
        const y0 = Math.max(0, cy - rad);
        const y1 = Math.min(mh - 1, cy + rad);
        const x0 = Math.max(0, cx - rad);
        const x1 = Math.min(mw - 1, cx + rad);

        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            if ((x - cx) * (x - cx) + (y - cy) * (y - cy) > rad * rad) continue;
            const idx = (y * mw + x) * 4;
            const diff =
              Math.abs(data[idx] - this.prevFrame[idx]) +
              Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
              Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
            if (diff > 95) hardPixels += 2;
            else if (diff > 55) softPixels += 1;
          }
        }

        const impactEnergy = hardPixels + softPixels * 0.35;
        if (impactEnergy >= preset.hardThreshold && impactEnergy > bestEnergy) {
          bestEnergy = impactEnergy;
          bestIdx = i;
        } else if (impactEnergy >= preset.hardThreshold * 0.5) {
          orb.wobble = Math.max(orb.wobble, 6);
        }
      }

      this.prevFrame.set(data);

      if (bestIdx !== -1) {
        this._handleOrbHit(this.orbs[bestIdx], bestIdx);
      }
    }

    _update() {
      this.tick += 1;
      if (this.shakeFrames > 0) this.shakeFrames -= 1;
      if (this.globalHitCooldown > 0) this.globalHitCooldown -= 1;
      if (this.bannerPulse > 0) this.bannerPulse -= 1;
      if (this.hintTimer > 0) this.hintTimer -= 1;

      for (let i = 0; i < this.slotFlashes.length; i++) {
        if (this.slotFlashes[i] > 0) this.slotFlashes[i] -= 1;
      }

      const w = this.canvas.width;
      const h = this.canvas.height;

      this._ensureOrbs();

      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const orb = this.orbs[i];
        if (orb.wobble > 0) orb.wobble -= 1;
        if (orb.wrongCooldown > 0) orb.wrongCooldown -= 1;

        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.rot += orb.vrot;

        if (orb.x < orb.r + 18 || orb.x > w - orb.r - 18) orb.vx *= -1;
        if (orb.y > h + orb.r + 24) {
          this.orbs.splice(i, 1);
          continue;
        }

        // Keep falling orbs well separated
        for (let j = i - 1; j >= 0; j--) {
          const ot = this.orbs[j];
          const dx = ot.x - orb.x;
          const dy = ot.y - orb.y;
          const dist = Math.hypot(dx, dy);
          const minDist = orb.r + ot.r + 24;
          if (dist > 0 && dist < minDist) {
            const push = (minDist - dist) * 0.05;
            const nx = dx / dist;
            orb.x -= nx * push;
            ot.x += nx * push;
          }
        }
      }

      this._analyzeHits();

      for (let i = this.shards.length - 1; i >= 0; i--) {
        const s = this.shards[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.25;
        s.life -= 1;
        if (s.life <= 0) this.shards.splice(i, 1);
      }

      for (let i = this.popups.length - 1; i >= 0; i--) {
        const p = this.popups[i];
        p.y -= 1.2;
        p.life -= 1;
        if (p.life <= 0) this.popups.splice(i, 1);
      }
    }

    _drawGalaxyBackground() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const camActive = this.hasCamera && this.showCamera && this.video.readyState >= 2;

      if (camActive) {
        this._drawVideoCover(ctx, w, h);
        const tint = ctx.createLinearGradient(0, 0, w, h);
        tint.addColorStop(0, 'rgba(30, 27, 75, 0.34)');
        tint.addColorStop(0.5, 'rgba(88, 28, 135, 0.24)');
        tint.addColorStop(1, 'rgba(15, 23, 42, 0.34)');
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, w, h);
      } else {
        const sky = ctx.createLinearGradient(0, 0, w, h);
        sky.addColorStop(0, '#090d24');
        sky.addColorStop(0.45, '#1e1b4b');
        sky.addColorStop(0.8, '#3b0764');
        sky.addColorStop(1, '#0f172a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      }

      const nebAlpha = camActive ? 0.16 : 0.32;
      const neb1 = ctx.createRadialGradient(w * 0.25, h * 0.3, 10, w * 0.25, h * 0.3, 190);
      neb1.addColorStop(0, `rgba(236, 72, 153, ${nebAlpha})`);
      neb1.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, w, h);

      const neb2 = ctx.createRadialGradient(w * 0.76, h * 0.55, 10, w * 0.76, h * 0.55, 210);
      neb2.addColorStop(0, `rgba(56, 189, 248, ${nebAlpha})`);
      neb2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);

      // Distant Ringed Galaxy Planet
      ctx.save();
      ctx.globalAlpha = camActive ? 0.55 : 0.9;
      const px = w - 68;
      const py = 152;
      const pGrad = ctx.createRadialGradient(px - 8, py - 8, 4, px, py, 24);
      pGrad.addColorStop(0, '#fde047');
      pGrad.addColorStop(0.6, '#a855f7');
      pGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px, py, 36, 9, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (const st of this.galaxyStars) {
        st.phase += st.speed;
        const alpha = (camActive ? 0.55 : 0.9) * (0.45 + 0.55 * Math.sin(st.phase));
        ctx.fillStyle = st.tint;
        ctx.globalAlpha = Math.max(0.15, alpha);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    _drawOrb(orb) {
      const ctx = this.ctx;
      const jx = orb.wobble > 0 ? (Math.random() - 0.5) * 8 : 0;
      const jy = orb.wobble > 0 ? (Math.random() - 0.5) * 6 : 0;

      ctx.save();
      ctx.translate(orb.x + jx, orb.y + jy);
      ctx.shadowColor = orb.glow;
      ctx.shadowBlur = 18;

      if (orb.isTreasure ) {
        drawTreasureCanvasItem(ctx, orb.treasureId, orb.r * 0.88, this.tick);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.font = '900 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(`+${orb.points}`, 0, -2);
        ctx.fillText(`+${orb.points}`, 0, -2);
      } else if (orb.isHazard) {
        ctx.save();
        ctx.rotate(orb.rot);
        ctx.beginPath();
        orb.poly.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        const grad = ctx.createLinearGradient(-orb.r, -orb.r, orb.r, orb.r);
        grad.addColorStop(0, '#7f1d1d');
        grad.addColorStop(0.55, '#450a0a');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
        ctx.restore();

        ctx.shadowBlur = 0;
        ctx.font = '900 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚫', 0, -2);
      } else {
        // Glowing Letter / Sound Orb
        const pal = orb.palette;
        const grad = ctx.createRadialGradient(-orb.r * 0.28, -orb.r * 0.28, orb.r * 0.12, 0, 0, orb.r);
        grad.addColorStop(0, pal.core);
        grad.addColorStop(0.45, pal.mid);
        grad.addColorStop(1, pal.edge);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, orb.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3.5;
        ctx.strokeStyle = pal.border;
        ctx.stroke();

        // Specular gloss highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-orb.r * 0.32, -orb.r * 0.34, orb.r * 0.26, orb.r * 0.13, -0.55, 0, Math.PI * 2);
        ctx.fill();

        // Crisp Letter / Tile Text
        const fontSize = orb.tileLabel.length >= 3 ? 24 : orb.tileLabel.length === 2 ? 30 : 36;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 5;
        ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(orb.tileLabel, 0, -2);
        ctx.fillText(orb.tileLabel, 0, -2);
      }

      // Dynamic Punch / Kick / Skip / Bonus tag pill
      const inKickZone = orb.y >= this.canvas.height * 0.64;
      ctx.shadowBlur = 0;
      ctx.fillStyle = orb.isHazard
        ? '#dc2626'
        : orb.isTreasure
        ? '#d97706'
        : inKickZone
        ? '#ec4899'
        : '#f97316';
      drawRoundedRectPath(ctx, -30, orb.r - 12, 60, 19, 9);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 10.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        orb.isHazard ? '🚫 SKIP!' : orb.isTreasure ? '💎 BONUS' : inKickZone ? '🦶 KICK' : '🥊 PUNCH',
        0,
        orb.r - 2
      );

      ctx.restore();
    }

    _drawPromptBanner() {
      if (!this.currentWordText) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const pulseScale = this.bannerPulse > 0 ? 1 + 0.06 * Math.sin(this.bannerPulse * 0.45) : 1;
      const label = `${this.currentEmoji} Spell ${this.currentWordText}!`;

      // Position safely below the top HUD/camera notch on iPhone & desktop
      let bannerY = Math.max(88, Math.round(h * 0.12));
      const canvasRect = this.canvas.getBoundingClientRect();
      const parentCabinet = this.canvas.closest('.arcade-fullscreen');
      const marquee = parentCabinet ? parentCabinet.querySelector('.arcade-marquee') : null;
      if (marquee && canvasRect.height > 0) {
        const mRect = marquee.getBoundingClientRect();
        const hudBottomCanvas = ((mRect.bottom - canvasRect.top) / canvasRect.height) * h;
        bannerY = Math.max(bannerY, Math.round(hudBottomCanvas + 36));
      }

      ctx.save();
      ctx.translate(w / 2, bannerY);
      ctx.scale(pulseScale, pulseScale);

      ctx.font = `900 ${w < 540 ? 20 : 24}px system-ui, sans-serif`;
      const textW = ctx.measureText(label).width;
      const boxW = Math.min(w - 36, Math.max(220, textW + 48));
      const boxH = 46;

      ctx.shadowColor = 'rgba(250, 204, 21, 0.28)';
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(-boxW / 2, -boxH / 2, boxW / 2, boxH / 2);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.46)');
      grad.addColorStop(1, 'rgba(76, 29, 149, 0.46)');
      ctx.fillStyle = grad;
      drawRoundedRectPath(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 23);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.wordCompleted ? 'rgba(74, 222, 128, 0.85)' : 'rgba(253, 224, 71, 0.82)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 1);
      ctx.restore();

      // Gentle hint pill if the player tapped a wrong distractor
      if (this.hintTimer > 0 && this.hintText) {
        const hintY = bannerY + boxH / 2 + 8;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.hintTimer / 18);
        ctx.font = '800 14px system-ui, sans-serif';
        const hw = Math.max(140, ctx.measureText(this.hintText).width + 28);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.78)';
        drawRoundedRectPath(ctx, w / 2 - hw / 2, hintY, hw, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hintText, w / 2, hintY + 13);
        ctx.restore();
      }
    }

    _drawSlots() {
      const count = this.targetTiles.length;
      if (count === 0) return;

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const slotW = count >= 5 ? 52 : w < 520 ? 54 : 64;
      const slotH = w < 520 ? 54 : 62;
      const gap = count >= 5 ? 8 : 12;
      const totalW = count * slotW + (count - 1) * gap;
      const startX = (w - totalW) / 2;
      const slotY = h - slotH - 18;

      // Translucent tray behind the letter slots
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.56)';
      drawRoundedRectPath(ctx, startX - 14, slotY - 12, totalW + 28, slotH + 24, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < count; i++) {
        const tile = this.targetTiles[i];
        const isFilled = i < this.slotIndex || this.wordCompleted;
        const isNext = i === this.slotIndex && !this.wordCompleted;
        const flash = this.slotFlashes[i] || 0;
        const sx = startX + i * (slotW + gap) + slotW / 2;
        const sy = slotY + slotH / 2;
        const pulse = isNext ? 1 + 0.055 * Math.sin(this.tick * 0.16) : flash > 0 ? 1 + (flash / 22) * 0.12 : 1;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(pulse, pulse);

        if (isFilled) {
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 16;
          const fGrad = ctx.createLinearGradient(-slotW / 2, -slotH / 2, slotW / 2, slotH / 2);
          fGrad.addColorStop(0, '#10b981');
          fGrad.addColorStop(1, '#047857');
          ctx.fillStyle = fGrad;
          drawRoundedRectPath(ctx, -slotW / 2, -slotH / 2, slotW, slotH, 14);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fef08a';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${tile.label.length >= 2 ? 24 : 30}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tile.label, 0, 1);
        } else if (isNext) {
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 22;
          const nGrad = ctx.createLinearGradient(-slotW / 2, -slotH / 2, slotW / 2, slotH / 2);
          nGrad.addColorStop(0, 'rgba(250, 204, 21, 0.34)');
          nGrad.addColorStop(1, 'rgba(245, 158, 11, 0.22)');
          ctx.fillStyle = nGrad;
          drawRoundedRectPath(ctx, -slotW / 2, -slotH / 2, slotW, slotH, 14);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#fde047';
          ctx.stroke();

          ctx.fillStyle = '#fef08a';
          ctx.font = '900 26px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', 0, 1);

          // Active slot pointer arrow above the box
          ctx.fillStyle = '#fde047';
          ctx.font = '900 12px system-ui, sans-serif';
          ctx.fillText('▼ NEXT', 0, -slotH / 2 - 12);
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
          drawRoundedRectPath(ctx, -slotW / 2, -slotH / 2, slotW, slotH, 14);
          ctx.fill();
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
          ctx.font = '900 22px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('_', 0, -2);
        }

        ctx.restore();
      }
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      if (this.shakeFrames > 0) {
        ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      }

      this._drawGalaxyBackground();

      // Punch / Kick zone divider line
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.64);
      ctx.lineTo(w, h * 0.64);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText('🥊 PUNCH ZONE', 14, h * 0.64 - 8);
      ctx.fillText('🦶 KICK ZONE', 14, h * 0.64 + 16);
      ctx.restore();

      for (const orb of this.orbs) {
        this._drawOrb(orb);
      }

      for (const s of this.shards) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.rect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        ctx.fill();
      }

      this._drawPromptBanner();
      this._drawSlots();

      for (const p of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  app.PhonicsBlasterGame = PhonicsBlasterGame;
})(window.KidApp = window.KidApp || {});
