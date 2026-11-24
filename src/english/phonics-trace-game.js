/* Air-Trace & Glow Pad — Camera/Touch Phonics Writing, Sound Boxes & Dictation */
(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, EnglishPhonics } = app;

const FALLBACK_WORDS = {
    cvc: [
      { word: 'cat', emoji: '🐱' },
      { word: 'dog', emoji: '🐶' },
      { word: 'sun', emoji: '☀️' },
      { word: 'pig', emoji: '🐷' },
      { word: 'hat', emoji: '🎩' },
      { word: 'bug', emoji: '🐞' },
      { word: 'cup', emoji: '🥤' },
      { word: 'fox', emoji: '🦊' },
      { word: 'bed', emoji: '🛏️' },
      { word: 'map', emoji: '🗺️' },
      { word: 'jam', emoji: '🍓' },
      { word: 'bus', emoji: '🚌' }
    ],
    blends: [
      { word: 'frog', emoji: '🐸' },
      { word: 'star', emoji: '⭐' },
      { word: 'crab', emoji: '🦀' },
      { word: 'drum', emoji: '🥁' },
      { word: 'plum', emoji: '🫐' },
      { word: 'flag', emoji: '🚩' },
      { word: 'sled', emoji: '🛷' },
      { word: 'swim', emoji: '🏊' },
      { word: 'lamp', emoji: '💡' },
      { word: 'nest', emoji: '🪺' }
    ],
    digraphs: [
      { word: 'ship', emoji: '🚢' },
      { word: 'fish', emoji: '🐟' },
      { word: 'duck', emoji: '🦆' },
      { word: 'chat', emoji: '💬' },
      { word: 'chin', emoji: '😊' },
      { word: 'shop', emoji: '🛍️' },
      { word: 'bath', emoji: '🛁' },
      { word: 'ring', emoji: '💍' },
      { word: 'sock', emoji: '🧦' },
      { word: 'king', emoji: '👑' }
    ],
    long: [
      { word: 'cake', emoji: '🎂' },
      { word: 'bike', emoji: '🚲' },
      { word: 'moon', emoji: '🌙' },
      { word: 'tree', emoji: '🌳' },
      { word: 'boat', emoji: '⛵' },
      { word: 'rain', emoji: '🌧️' },
      { word: 'book', emoji: '📖' },
      { word: 'kite', emoji: '🪁' },
      { word: 'bear', emoji: '🐻' },
      { word: 'seed', emoji: '🌱' }
    ]
  };

  // Approximate natural handwriting start coordinates (normalized 0..1 inside sound box)
  const LETTER_STARTS = {
    a: [0.63, 0.36],
    b: [0.32, 0.16],
    c: [0.65, 0.35],
    d: [0.66, 0.16],
    e: [0.34, 0.50],
    f: [0.64, 0.18],
    g: [0.65, 0.36],
    h: [0.32, 0.16],
    i: [0.50, 0.34],
    j: [0.56, 0.34],
    k: [0.34, 0.16],
    l: [0.50, 0.16],
    m: [0.22, 0.35],
    n: [0.32, 0.35],
    o: [0.50, 0.32],
    p: [0.32, 0.35],
    q: [0.66, 0.35],
    r: [0.36, 0.35],
    s: [0.63, 0.34],
    t: [0.48, 0.18],
    u: [0.32, 0.35],
    v: [0.28, 0.35],
    w: [0.20, 0.35],
    x: [0.30, 0.35],
    y: [0.30, 0.35],
    z: [0.30, 0.35]
  };

  const PHONICS_CONFUSABLES = {
    a: ['e', 'o', 'u', 'i'],
    b: ['d', 'p', 'h', 't'],
    c: ['k', 's', 'o', 'g'],
    d: ['b', 't', 'p', 'g'],
    e: ['a', 'i', 'o', 'u'],
    f: ['v', 't', 'p', 's'],
    g: ['j', 'c', 'd', 'q'],
    h: ['n', 'b', 'k', 'r'],
    i: ['e', 'a', 'y', 'l'],
    j: ['g', 'y', 'i', 'd'],
    k: ['c', 'g', 't', 'h'],
    l: ['i', 't', 'r', 'b'],
    m: ['n', 'w', 'r', 'b'],
    n: ['m', 'h', 'r', 'u'],
    o: ['a', 'u', 'e', 'c'],
    p: ['b', 'q', 'd', 'f'],
    q: ['p', 'g', 'k', 'o'],
    r: ['n', 'l', 'w', 'h'],
    s: ['c', 'z', 'f', 'sh'],
    t: ['d', 'f', 'l', 'k'],
    u: ['o', 'a', 'e', 'n'],
    v: ['f', 'w', 'b', 'y'],
    w: ['v', 'm', 'u', 'r'],
    x: ['s', 'z', 'k', 'c'],
    y: ['i', 'j', 'v', 'e'],
    z: ['s', 'x', 'c', 'n']
  };

  const MASK_SIZE = 48;
  const GUIDE_FONT = '700 36px "Nunito", "Trebuchet MS", "Comic Sans MS", system-ui, sans-serif';

  class PhonicsTraceGame {
    /**
     * @param {Object} options
     * @param {HTMLCanvasElement} options.canvas
     * @param {Function} [options.onScore]
     * @param {Function} [options.onFinish]
     * @param {Function} [options.onStatus]
     */
    constructor(options) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});

      // Optional Air-Cam video + lightweight motion tracker
      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;
      this.stream = null;
      this.hasCamera = false;
      this.showCamera = false;

      // Hidden 48x48 letter mask canvas & cache
      this.maskCanvas = document.createElement('canvas');
      this.maskCanvas.width = MASK_SIZE;
      this.maskCanvas.height = MASK_SIZE;
      this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true });
      this.letterMasks = {};

      // Game state
      this.running = false;
      this.rafId = null;
      this.advanceTimeoutId = null;
      this.tier = 'all';
      this.mode = 'trace';
      this.score = 0;
      this.streak = 0;
      this.wordsDone = 0;
      this.stars = 0;
      this.tick = 0;

      this.currentEntry = null;
      this.letters = [];
      this.activeIndex = 0;
      this.solvedFlags = [];
      this.wordCompleted = false;

      this.boxStrokes = [];
      this.boxHitSets = [];
      this.boxInkStats = [];
      this.shakeTimers = [];
      this.boxRects = [];

      this.keyTray = [];
      this.keyRects = [];
      this.hearBtnRect = null;
      this.clearBtnRect = null;

      this.particles = [];
      this.popups = [];
      this.bgStars = [];

      this.pointerDown = false;
      this.activePointerId = null;
      this.lastBoxNorm = null;

      this.airCursor = {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        active: false,
        hasPrev: false,
        insideBox: false,
        idleFrames: 0
      };

      this._initBgStars();
      this._bindInput();
      this._onResize = () => {
        if (this.running) this._syncCanvasSize();
      };
      window.addEventListener('resize', this._onResize);
    }

    _syncCanvasSize() {
      const vw = Math.max(320, window.innerWidth || 640);
      const vh = Math.max(320, window.innerHeight || 480);
      const w = Math.max(480, Math.min(920, vw));
      const h = Math.max(380, Math.round((w * vh) / vw));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.motionCanvas.width = 80;
        this.motionCanvas.height = Math.max(44, Math.round((80 * h) / w));
        this.prevFrame = null;
        this._initBgStars();
      }
      this._computeLayout();
    }

    _initBgStars() {
      const w = this.canvas.width || 640;
      const h = this.canvas.height || 480;
      this.bgStars = [];
      for (let i = 0; i < 48; i++) {
        this.bgStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 1.9,
          phase: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03
        });
      }
    }

    _computeLayout() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const n = Math.max(3, this.letters.length || 3);

      // Keep y >= 58 clear for the slim top HUD; prompt banner sits at y = 64..114
      const topSafe = 124;
      const bottomReserve = this.mode === 'dictation' ? 128 : 54;
      const availH = Math.max(120, h - topSafe - bottomReserve);

      const gap = Math.max(12, Math.min(26, Math.round(w * 0.028)));
      const maxBoxW = Math.floor((w - 56 - gap * (n - 1)) / n);
      const boxSize = Math.max(76, Math.min(154, maxBoxW, Math.floor(availH * 0.82)));

      const totalW = n * boxSize + (n - 1) * gap;
      const startX = Math.round((w - totalW) / 2);
      const boxY = Math.round(topSafe + (availH - boxSize) / 2);

      this.boxRects = [];
      for (let i = 0; i < n; i++) {
        this.boxRects.push({
          x: startX + i * (boxSize + gap),
          y: boxY,
          w: boxSize,
          h: boxSize
        });
      }

      // On-canvas Phonics Letter Keyboard layout for dictation mode
      this.keyRects = [];
      if (this.mode === 'dictation' && this.keyTray.length > 0) {
        const count = this.keyTray.length;
        const singleRow = w >= 600 || count <= 8;
        const cols = singleRow ? count : Math.ceil(count / 2);
        const rows = singleRow ? 1 : 2;
        const kGap = singleRow ? 10 : 8;
        const keyW = Math.max(38, Math.min(54, Math.floor((w - 48 - kGap * (cols - 1)) / cols)));
        const keyH = singleRow ? 48 : 42;
        const trayH = rows * keyH + (rows - 1) * 8;
        const baseY = h - trayH - 18;

        for (let i = 0; i < count; i++) {
          const row = singleRow ? 0 : Math.floor(i / cols);
          const col = singleRow ? i : i % cols;
          const itemsInRow = singleRow ? count : (row === 0 ? cols : count - cols);
          const rowW = itemsInRow * keyW + (itemsInRow - 1) * kGap;
          const rowStartX = Math.round((w - rowW) / 2);
          this.keyRects.push({
            letter: this.keyTray[i],
            x: rowStartX + col * (keyW + kGap),
            y: baseY + row * (keyH + 8),
            w: keyW,
            h: keyH
          });
        }
      }

      // Subtle prompt-bar action buttons anchored inside the centered banner
      const bannerY = 66;
      const bannerH = 46;
      const bannerW = Math.min(w - 28, 760);
      const bannerX = Math.round((w - bannerW) / 2);
      const btnH = 30;
      const btnY = bannerY + Math.round((bannerH - btnH) / 2);
      const compact = w < 580;
      const clearW = compact ? 70 : 84;
      const hearW = compact ? 86 : 106;
      this.clearBtnRect = { x: bannerX + 10, y: btnY, w: clearW, h: btnH };
      this.hearBtnRect = { x: bannerX + bannerW - hearW - 10, y: btnY, w: hearW, h: btnH };
    }

    _getCanvasCoords(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * this.canvas.width,
        y: ((clientY - rect.top) / rect.height) * this.canvas.height
      };
    }

    _hitRect(x, y, r, pad = 0) {
      if (!r) return false;
      return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
    }

    _bindInput() {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        const pt = this._getCanvasCoords(e.clientX, e.clientY);

        if (this._hitRect(pt.x, pt.y, this.hearBtnRect, 4)) {
          this.speakCurrentWord();
          return;
        }
        if (this._hitRect(pt.x, pt.y, this.clearBtnRect, 4)) {
          this.clearActiveBox();
          return;
        }

        // Check Phonics Letter Keyboard in dictation mode
        if (this.mode === 'dictation' && !this.wordCompleted) {
          for (const kr of this.keyRects) {
            if (this._hitRect(pt.x, pt.y, kr, 2)) {
              this.submitLetterChoice(kr.letter);
              return;
            }
          }
        }

        if (this.wordCompleted) return;
        const box = this.boxRects[this.activeIndex];
        if (!box) return;

        if (this._hitRect(pt.x, pt.y, box, 14)) {
          this.pointerDown = true;
          this.activePointerId = e.pointerId;
          if (this.canvas.setPointerCapture) {
            try {
              this.canvas.setPointerCapture(e.pointerId);
            } catch (_) {}
          }
          const nx = (pt.x - box.x) / box.w;
          const ny = (pt.y - box.y) / box.h;
          this._beginStroke(this.activeIndex, nx, ny);
          this.lastBoxNorm = { x: nx, y: ny };
        }
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.running || !this.pointerDown || e.pointerId !== this.activePointerId) return;
        if (this.wordCompleted) return;
        const box = this.boxRects[this.activeIndex];
        if (!box) return;

        const pt = this._getCanvasCoords(e.clientX, e.clientY);
        if (!this._hitRect(pt.x, pt.y, box, 22)) {
          this.lastBoxNorm = null;
          return;
        }

        const nx = Math.max(0.02, Math.min(0.98, (pt.x - box.x) / box.w));
        const ny = Math.max(0.02, Math.min(0.98, (pt.y - box.y) / box.h));
        if (!this.lastBoxNorm) {
          this._beginStroke(this.activeIndex, nx, ny);
        } else {
          this._extendStroke(this.activeIndex, this.lastBoxNorm.x, this.lastBoxNorm.y, nx, ny);
        }
        this.lastBoxNorm = { x: nx, y: ny };
      });

      const endPointer = (e) => {
        if (e.pointerId !== undefined && this.activePointerId !== null && e.pointerId !== this.activePointerId) {
          return;
        }
        this.pointerDown = false;
        this.activePointerId = null;
        this.lastBoxNorm = null;
      };

      this.canvas.addEventListener('pointerup', endPointer);
      this.canvas.addEventListener('pointercancel', endPointer);

      window.addEventListener('keydown', (e) => {
        if (!this.running) return;
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.key === 'Backspace') {
          e.preventDefault();
          this.clearActiveBox();
          return;
        }
        if (e.key === ' ' && this.mode === 'dictation') {
          e.preventDefault();
          this.speakCurrentWord();
          return;
        }
        if (this.mode === 'dictation' && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          this.submitLetterChoice(e.key.toLowerCase());
        }
      });
    }

    /**
     * Build/cache the 48x48 glyph mask and ~22 evenly distributed checkpoints for letter `a-z`.
     */
    _getLetterMask(letter) {
      const ch = String(letter || 'a').toLowerCase().charAt(0);
      if (this.letterMasks[ch]) return this.letterMasks[ch];

      const ctx = this.maskCtx;
      ctx.clearRect(0, 0, MASK_SIZE, MASK_SIZE);
      ctx.fillStyle = '#ffffff';
      ctx.font = GUIDE_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, MASK_SIZE / 2, MASK_SIZE / 2 + 1);

      const img = ctx.getImageData(0, 0, MASK_SIZE, MASK_SIZE).data;
      const pixels = [];
      const nearMask = new Uint8Array(MASK_SIZE * MASK_SIZE);

      for (let y = 0; y < MASK_SIZE; y++) {
        for (let x = 0; x < MASK_SIZE; x++) {
          const alpha = img[(y * MASK_SIZE + x) * 4 + 3];
          if (alpha > 95) {
            pixels.push({ x, y });
            // Dilate by 4px radius so natural handwriting/air-trace hits count cleanly
            for (let dy = -4; dy <= 4; dy++) {
              for (let dx = -4; dx <= 4; dx++) {
                if (dx * dx + dy * dy <= 18) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < MASK_SIZE && ny >= 0 && ny < MASK_SIZE) {
                    nearMask[ny * MASK_SIZE + nx] = 1;
                  }
                }
              }
            }
          }
        }
      }

      // Pick ~22 well-spaced checkpoints via greedy farthest-point sampling
      const checkpoints = [];
      const targetCount = Math.min(22, Math.max(14, Math.round(pixels.length / 10)));
      if (pixels.length > 0) {
        const startNorm = LETTER_STARTS[ch] || [0.5, 0.3];
        const sx = startNorm[0] * MASK_SIZE;
        const sy = startNorm[1] * MASK_SIZE;
        let firstIdx = 0;
        let bestStartDist = Infinity;
        for (let i = 0; i < pixels.length; i++) {
          const d = (pixels[i].x - sx) ** 2 + (pixels[i].y - sy) ** 2;
          if (d < bestStartDist) {
            bestStartDist = d;
            firstIdx = i;
          }
        }
        checkpoints.push(pixels[firstIdx]);

        const minDistSq = new Float32Array(pixels.length);
        for (let i = 0; i < pixels.length; i++) {
          minDistSq[i] = (pixels[i].x - checkpoints[0].x) ** 2 + (pixels[i].y - checkpoints[0].y) ** 2;
        }

        while (checkpoints.length < targetCount) {
          let farIdx = -1;
          let farVal = -1;
          for (let i = 0; i < pixels.length; i++) {
            if (minDistSq[i] > farVal) {
              farVal = minDistSq[i];
              farIdx = i;
            }
          }
          if (farIdx < 0 || farVal < 4) break;
          const chosen = pixels[farIdx];
          checkpoints.push(chosen);
          for (let i = 0; i < pixels.length; i++) {
            const d = (pixels[i].x - chosen.x) ** 2 + (pixels[i].y - chosen.y) ** 2;
            if (d < minDistSq[i]) minDistSq[i] = d;
          }
        }
      }

      const maskData = { checkpoints, nearMask };
      this.letterMasks[ch] = maskData;
      return maskData;
    }

    _beginStroke(boxIdx, nx, ny) {
      if (!this.boxStrokes[boxIdx]) return;
      this.boxStrokes[boxIdx].push([{ x: nx, y: ny }]);
      this._markMaskCoverage(boxIdx, nx, ny, nx, ny);
    }

    _extendStroke(boxIdx, nx0, ny0, nx1, ny1) {
      const strokes = this.boxStrokes[boxIdx];
      if (!strokes) return;
      if (strokes.length === 0) {
        strokes.push([{ x: nx0, y: ny0 }]);
      }
      const current = strokes[strokes.length - 1];
      const last = current[current.length - 1];
      if (!last || Math.hypot(nx1 - last.x, ny1 - last.y) >= 0.008) {
        current.push({ x: nx1, y: ny1 });
      }
      this._markMaskCoverage(boxIdx, nx0, ny0, nx1, ny1);
    }

    _markMaskCoverage(boxIdx, nx0, ny0, nx1, ny1) {
      if (this.wordCompleted || this.solvedFlags[boxIdx] || boxIdx !== this.activeIndex) return;
      const targetChar = this.letters[boxIdx];
      const mask = this._getLetterMask(targetChar);
      const hitSet = this.boxHitSets[boxIdx];
      const inkStat = this.boxInkStats[boxIdx];
      if (!mask || !hitSet || !inkStat || mask.checkpoints.length === 0) return;

      const x0 = nx0 * MASK_SIZE;
      const y0 = ny0 * MASK_SIZE;
      const x1 = nx1 * MASK_SIZE;
      const y1 = ny1 * MASK_SIZE;
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(dist / 1.5));
      const hitRadius = this.showCamera ? 7.2 : 6.2;
      const hitRadiusSq = hitRadius * hitRadius;

      for (let s = 0; s <= steps; s++) {
        const t = steps === 0 ? 0 : s / steps;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;

        const gx = Math.max(0, Math.min(MASK_SIZE - 1, Math.round(px)));
        const gy = Math.max(0, Math.min(MASK_SIZE - 1, Math.round(py)));
        inkStat.total++;
        if (mask.nearMask[gy * MASK_SIZE + gx]) {
          inkStat.onMask++;
        }

        for (let i = 0; i < mask.checkpoints.length; i++) {
          if (hitSet.has(i)) continue;
          const cp = mask.checkpoints[i];
          const dSq = (px - cp.x) ** 2 + (py - cp.y) ** 2;
          if (dSq <= hitRadiusSq) {
            hitSet.add(i);
          }
        }
      }

      const ratio = hitSet.size / mask.checkpoints.length;
      if (this.mode === 'trace') {
        if (ratio >= 0.68) {
          this._completeActiveLetter();
        }
      } else {
        // In dictation mode, accept freehand writing when letter shape matches cleanly
        const precision = inkStat.total > 0 ? inkStat.onMask / inkStat.total : 0;
        if (ratio >= 0.68 && inkStat.total >= 10 && precision >= 0.42) {
          this._completeActiveLetter();
        }
      }
    }

    _getActiveCoverage() {
      const targetChar = this.letters[this.activeIndex];
      if (!targetChar) return 0;
      const mask = this._getLetterMask(targetChar);
      const hitSet = this.boxHitSets[this.activeIndex];
      if (!mask || !hitSet || mask.checkpoints.length === 0) return 0;
      return Math.min(1, hitSet.size / mask.checkpoints.length);
    }

    _completeActiveLetter() {
      if (this.wordCompleted || this.activeIndex >= this.letters.length) return;
      const idx = this.activeIndex;
      const letter = this.letters[idx];
      this.solvedFlags[idx] = true;

      // Speak phoneme cleanly
      if (EnglishPhonics && typeof EnglishPhonics.speakPhoneme === 'function') {
        EnglishPhonics.speakPhoneme(letter);
      } else if (AudioEngine) {
        AudioEngine.pop();
      }

      const box = this.boxRects[idx];
      if (box) {
        this._spawnSparkles(box.x + box.w / 2, box.y + box.h / 2, 18, ['#38bdf8', '#a855f7', '#fde047']);
        this._addPopup(box.x + box.w / 2, box.y - 12, letter.toUpperCase() + '!', '#38bdf8');
      }

      // Advance to next unsolved box or complete the whole word
      if (idx + 1 < this.letters.length) {
        this.activeIndex = idx + 1;
        this.lastBoxNorm = null;
        this.pointerDown = false;
        this._emitScore(null, null);
      } else {
        this._completeWord();
      }
    }

    _completeWord() {
      this.wordCompleted = true;
      this.pointerDown = false;
      this.lastBoxNorm = null;

      const word = this.currentEntry.word;
      this.score += 100;
      this.stars += 2;
      this.wordsDone += 1;
      this.streak += 1;

      const collectedMaterial = true ? pickRandomTreasure() : null;

      if (AudioEngine && typeof AudioEngine.magic === 'function') {
        AudioEngine.magic();
      }
      setTimeout(() => {
        if (this.running) this.speakCurrentWord();
      }, 420);

      // Celebration sparkles across all boxes
      for (const box of this.boxRects) {
        this._spawnSparkles(box.x + box.w / 2, box.y + box.h / 2, 20, ['#fde047', '#38bdf8', '#4ade80', '#f472b6']);
      }
      this._addPopup(
        this.canvas.width / 2,
        Math.max(115, (this.boxRects[0] ? this.boxRects[0].y : 160) - 24),
        `✨ ${word.toUpperCase()}! +100`,
        '#fde047'
      );
      if (collectedMaterial) {
        this._addPopup(
          this.canvas.width / 2,
          Math.max(145, (this.boxRects[0] ? this.boxRects[0].y : 160) + 6),
          `${collectedMaterial.emoji} ${collectedMaterial.short}`,
          '#4ade80'
        );
      }

      this._emitScore(collectedMaterial, word);
      this.onStatus(`🌟 Great job spelling "${word.toUpperCase()}"! +100 pts`);

      if (this.advanceTimeoutId) clearTimeout(this.advanceTimeoutId);
      this.advanceTimeoutId = setTimeout(() => {
        this.advanceTimeoutId = null;
        if (this.running) {
          this.nextWord();
        }
      }, 1300);
    }

    _emitScore(collectedMaterial = null, solvedWord = null) {
      const activeLetter = this.wordCompleted ? '' : (this.letters[this.activeIndex] || '');
      const wordProgress = this.letters
        .map((ch, i) => (this.solvedFlags[i] ? ch.toUpperCase() : '_'))
        .join(' ');
      this.onScore({
        score: this.score,
        streak: this.streak,
        wordsDone: this.wordsDone,
        stars: this.stars,
        activeLetter,
        wordProgress,
        collectedMaterial,
        solvedWord
      });
    }

    _pickWordEntry() {
      const prevWord = this.currentEntry ? this.currentEntry.word : '';
      let chosen = null;

      if (EnglishPhonics && typeof EnglishPhonics.pickWord === 'function') {
        for (let attempt = 0; attempt < 12; attempt++) {
          const raw = EnglishPhonics.pickWord(this.tier);
          if (!raw) continue;
          const wordStr = typeof raw === 'string' ? raw : (raw.word || raw.text || '');
          const clean = String(wordStr).toLowerCase().replace(/[^a-z]/g, '');
          if (clean.length === 3 || clean.length === 4) {
            if (clean === prevWord && attempt < 9) continue;
            chosen = {
              word: clean,
              emoji: (typeof raw === 'object' && (raw.emoji || raw.icon)) || '✨'
            };
            break;
          }
        }
      }

      if (!chosen) {
        let pool;
        if (FALLBACK_WORDS[this.tier]) {
          pool = FALLBACK_WORDS[this.tier];
        } else {
          pool = [
            ...FALLBACK_WORDS.cvc,
            ...FALLBACK_WORDS.blends,
            ...FALLBACK_WORDS.digraphs,
            ...FALLBACK_WORDS.long
          ];
        }
        const filtered = pool.filter((item) => item.word !== prevWord);
        const finalPool = filtered.length > 0 ? filtered : pool;
        chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
      }

      return chosen;
    }

    _buildKeyTray(word) {
      const unique = [];
      for (const ch of word.split('')) {
        if (!unique.includes(ch)) unique.push(ch);
      }

      // Add close phonics distractors first
      const candidates = [];
      for (const ch of unique) {
        const list = PHONICS_CONFUSABLES[ch] || [];
        for (const alt of list) {
          if (alt.length === 1 && !unique.includes(alt) && !candidates.includes(alt)) {
            candidates.push(alt);
          }
        }
      }
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      while (unique.length + candidates.length < 10) {
        const extra = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!unique.includes(extra) && !candidates.includes(extra)) {
          candidates.push(extra);
        }
      }

      const tray = [...unique, ...candidates.slice(0, Math.max(0, 10 - unique.length))];
      // Fisher-Yates shuffle
      for (let i = tray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tray[i], tray[j]] = [tray[j], tray[i]];
      }
      return tray.slice(0, 10);
    }

    _loadNextWord(announce = true) {
      if (this.advanceTimeoutId) {
        clearTimeout(this.advanceTimeoutId);
        this.advanceTimeoutId = null;
      }

      this.currentEntry = this._pickWordEntry();
      this.letters = this.currentEntry.word.split('');
      this.activeIndex = 0;
      this.solvedFlags = this.letters.map(() => false);
      this.wordCompleted = false;
      this.boxStrokes = this.letters.map(() => []);
      this.boxHitSets = this.letters.map(() => new Set());
      this.boxInkStats = this.letters.map(() => ({ onMask: 0, total: 0 }));
      this.shakeTimers = this.letters.map(() => 0);
      this.keyTray = this._buildKeyTray(this.currentEntry.word);
      this.pointerDown = false;
      this.lastBoxNorm = null;

      this._computeLayout();
      this._emitScore(null, null);

      if (announce) {
        if (this.mode === 'dictation') {
          this.speakCurrentWord();
        }
        this._updateModeStatus();
      }
    }

    _updateModeStatus() {
      if (this.showCamera && this.hasCamera) {
        this.onStatus(
          this.mode === 'dictation'
            ? '📷 Air-Cam Dictation! Listen, tap a key or air-write each letter!'
            : '📷 Air-Cam Trace! Wave your finger over the glowing letter box!'
        );
      } else {
        this.onStatus(
          this.mode === 'dictation'
            ? '🎧 Dictation Mode! Listen & type, tap a letter key, or write in the box!'
            : '✏️ Trace Mode! Follow the dotted letter inside the glowing box!'
        );
      }
    }

    start(tier = 'all', mode = 'trace') {
      this.stop();
      this.tier = tier || 'all';
      this.mode = mode === 'dictation' ? 'dictation' : 'trace';
      this.score = 0;
      this.streak = 0;
      this.wordsDone = 0;
      this.stars = 0;
      this.particles = [];
      this.popups = [];
      this.running = true;

      this._syncCanvasSize();
      this._loadNextWord(true);

      if (this.showCamera) {
        this._startCamera();
      }

      const loop = () => {
        if (!this.running) return;
        this._update();
        this._render();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.advanceTimeoutId) {
        clearTimeout(this.advanceTimeoutId);
        this.advanceTimeoutId = null;
      }
      this._stopCamera();
      this.pointerDown = false;
      this.activePointerId = null;
      this.lastBoxNorm = null;
    }

    setTier(tier) {
      this.tier = tier || 'all';
      if (this.running) {
        this._loadNextWord(true);
      }
    }

    setMode(mode) {
      this.mode = mode === 'dictation' ? 'dictation' : 'trace';
      if (this.running) {
        this._loadNextWord(true);
      }
    }

    async toggleCameraView() {
      this.showCamera = !this.showCamera;
      if (this.showCamera) {
        await this._startCamera();
      } else {
        this._stopCamera();
        this._updateModeStatus();
      }
      return this.showCamera;
    }

    clearActiveBox() {
      if (!this.running || this.wordCompleted) return;
      const idx = this.activeIndex;
      if (this.boxStrokes[idx]) this.boxStrokes[idx] = [];
      if (this.boxHitSets[idx]) this.boxHitSets[idx].clear();
      if (this.boxInkStats[idx]) this.boxInkStats[idx] = { onMask: 0, total: 0 };
      this.lastBoxNorm = null;
      if (AudioEngine) AudioEngine.flip();
    }

    speakCurrentWord() {
      if (!this.currentEntry) return;
      const word = this.currentEntry.word;
      if (EnglishPhonics && typeof EnglishPhonics.speakWord === 'function') {
        EnglishPhonics.speakWord(word);
      } else if (AudioEngine && typeof AudioEngine.speak === 'function') {
        AudioEngine.speak(word, 'gentle');
      }
    }

    nextWord() {
      if (!this.running) return;
      this._loadNextWord(true);
    }

    submitLetterChoice(letter) {
      if (!this.running || this.wordCompleted) return false;
      const clean = String(letter || '').toLowerCase().replace(/[^a-z]/g, '').charAt(0);
      if (!clean) return false;

      const target = this.letters[this.activeIndex];
      if (!target) return false;

      if (clean === target) {
        this._completeActiveLetter();
        return true;
      }

      // Gentle wobble + feedback in dictation mode
      this.shakeTimers[this.activeIndex] = 18;
      if (AudioEngine && typeof AudioEngine.wrong === 'function') {
        AudioEngine.wrong();
      }
      const box = this.boxRects[this.activeIndex];
      if (box) {
        this._addPopup(box.x + box.w / 2, box.y - 10, `Try again!`, '#fb7185');
      }
      this.onStatus(`Almost! Listen to "${this.currentEntry.word.toUpperCase()}" again!`);
      return false;
    }

    async _startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showCamera = false;
        this.hasCamera = false;
        this.onStatus('✨ Camera unavailable — trace right on the Glow Pad with touch or mouse!');
        return;
      }
      if (this.stream && this.hasCamera) {
        this._updateModeStatus();
        return;
      }
      try {
        this.onStatus('📷 Starting Air-Cam...');
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        this.video.srcObject = this.stream;
        await this.video.play();
        this.hasCamera = true;
        this.prevFrame = null;
        this.airCursor.hasPrev = false;
        this._updateModeStatus();
      } catch (_) {
        this.showCamera = false;
        this.hasCamera = false;
        this.onStatus('✨ Camera permission off — trace right on the Glow Pad with touch or mouse!');
      }
    }

    _stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
      this.hasCamera = false;
      this.prevFrame = null;
      this.airCursor.active = false;
      this.airCursor.hasPrev = false;
      this.airCursor.insideBox = false;
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

    _analyzeAirMotion() {
      if (!this.showCamera || !this.hasCamera || this.video.readyState < 2) {
        this.airCursor.active = false;
        return;
      }
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;
      this._drawVideoCover(this.motionCtx, mw, mh);

      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      let sum = 0;
      let sumX = 0;
      let sumY = 0;
      const yStart = Math.round(mh * 0.12);
      const yEnd = Math.round(mh * 0.92);

      for (let y = yStart; y < yEnd; y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const diff =
            Math.abs(data[idx] - this.prevFrame[idx]) +
            Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
            Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
          if (diff > 58) {
            sum++;
            sumX += x;
            sumY += y;
          }
        }
      }

      this.prevFrame.set(data);
      const minPixels = Math.max(12, Math.round(mw * mh * 0.0028));
      const w = this.canvas.width;
      const h = this.canvas.height;

      if (sum >= minPixels) {
        const rawX = (sumX / sum / mw) * w;
        const rawY = (sumY / sum / mh) * h;
        if (!this.airCursor.hasPrev) {
          this.airCursor.x = rawX;
          this.airCursor.y = rawY;
          this.airCursor.prevX = rawX;
          this.airCursor.prevY = rawY;
          this.airCursor.hasPrev = true;
        } else {
          this.airCursor.prevX = this.airCursor.x;
          this.airCursor.prevY = this.airCursor.y;
          this.airCursor.x += (rawX - this.airCursor.x) * 0.34;
          this.airCursor.y += (rawY - this.airCursor.y) * 0.34;
        }
        this.airCursor.active = true;
        this.airCursor.idleFrames = 0;

        // Draw neon ink when air-finger glides smoothly over the active Sound Box
        if (!this.wordCompleted) {
          const box = this.boxRects[this.activeIndex];
          const inBox = box && this._hitRect(this.airCursor.x, this.airCursor.y, box, 12);
          if (inBox) {
            const nx1 = Math.max(0.02, Math.min(0.98, (this.airCursor.x - box.x) / box.w));
            const ny1 = Math.max(0.02, Math.min(0.98, (this.airCursor.y - box.y) / box.h));
            const moveDist = Math.hypot(
              this.airCursor.x - this.airCursor.prevX,
              this.airCursor.y - this.airCursor.prevY
            );
            if (!this.airCursor.insideBox) {
              this._beginStroke(this.activeIndex, nx1, ny1);
              this.airCursor.insideBox = true;
            } else if (moveDist >= 2 && moveDist <= box.w * 0.45) {
              const nx0 = Math.max(0.02, Math.min(0.98, (this.airCursor.prevX - box.x) / box.w));
              const ny0 = Math.max(0.02, Math.min(0.98, (this.airCursor.prevY - box.y) / box.h));
              this._extendStroke(this.activeIndex, nx0, ny0, nx1, ny1);
            }
          } else {
            this.airCursor.insideBox = false;
          }
        }
      } else {
        this.airCursor.idleFrames++;
        if (this.airCursor.idleFrames > 14) {
          this.airCursor.active = false;
          this.airCursor.hasPrev = false;
          this.airCursor.insideBox = false;
        }
      }
    }

    _spawnSparkles(x, y, count = 14, colors = ['#38bdf8', '#fde047']) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.4 + Math.random() * 4.2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.8,
          r: 2 + Math.random() * 3.5,
          life: 1,
          decay: 0.02 + Math.random() * 0.02,
          color: colors[i % colors.length]
        });
      }
    }

    _addPopup(x, y, text, color = '#fde047') {
      this.popups.push({
        x,
        y,
        text,
        color,
        life: 1
      });
    }

    _update() {
      this.tick++;
      this._analyzeAirMotion();

      for (let i = 0; i < this.shakeTimers.length; i++) {
        if (this.shakeTimers[i] > 0) this.shakeTimers[i]--;
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.life -= p.decay;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 0.7;
        pop.life -= 0.018;
        if (pop.life <= 0) this.popups.splice(i, 1);
      }
    }

    _roundRectPath(ctx, x, y, w, h, r) {
      const rad = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }

    _renderBackground(ctx, w, h) {
      if (this.showCamera && this.hasCamera && this.video.readyState >= 2) {
        this._drawVideoCover(ctx, w, h);
        ctx.fillStyle = 'rgba(8, 15, 36, 0.56)';
        ctx.fillRect(0, 0, w, h);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#070d1f');
        grad.addColorStop(0.55, '#0f1b38');
        grad.addColorStop(1, '#111833');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Soft glowing nebula circles
        ctx.save();
        const glow1 = ctx.createRadialGradient(w * 0.2, h * 0.35, 10, w * 0.2, h * 0.35, w * 0.35);
        glow1.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
        glow1.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, w, h);

        const glow2 = ctx.createRadialGradient(w * 0.82, h * 0.65, 10, w * 0.82, h * 0.65, w * 0.35);
        glow2.addColorStop(0, 'rgba(168, 85, 247, 0.11)');
        glow2.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, w, h);

        // Twinkling starfield
        for (const s of this.bgStars) {
          const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(this.tick * s.speed + s.phase));
          ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    _renderPromptBanner(ctx, w) {
      if (!this.currentEntry) return;
      const bannerY = 66;
      const bannerH = 46;
      const bannerW = Math.min(w - 28, 760);
      const bannerX = Math.round((w - bannerW) / 2);

      ctx.save();
      this._roundRectPath(ctx, bannerX, bannerY, bannerW, bannerH, 16);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.stroke();

      // Clear button on left
      if (this.clearBtnRect) {
        const cr = this.clearBtnRect;
        this._roundRectPath(ctx, cr.x, cr.y, cr.w, cr.h, 12);
        ctx.fillStyle = 'rgba(51, 65, 85, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 13px "Nunito", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧹 Clear', cr.x + cr.w / 2, cr.y + cr.h / 2 + 1);
      }

      // Hear Word button on right
      if (this.hearBtnRect) {
        const hr = this.hearBtnRect;
        this._roundRectPath(ctx, hr.x, hr.y, hr.w, hr.h, 12);
        ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 13px "Nunito", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w < 580 ? '🔊 Word' : '🔊 Hear Word', hr.x + hr.w / 2, hr.y + hr.h / 2 + 1);
      }

      // Center prompt text
      const emoji = this.currentEntry.emoji || '✨';
      let promptText;
      if (this.mode === 'trace') {
        const spaced = this.letters.map((ch) => ch.toUpperCase()).join(' - ');
        promptText = `${emoji} Trace: ${spaced}`;
      } else {
        promptText = `${emoji} Listen & Write (${this.letters.length} letters)!`;
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = `800 ${w < 580 ? 15 : 20}px "Nunito", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = this.clearBtnRect && this.hearBtnRect
        ? (this.clearBtnRect.x + this.clearBtnRect.w + this.hearBtnRect.x) / 2
        : w / 2;
      ctx.fillText(promptText, centerX, bannerY + bannerH / 2 + 1);
      ctx.restore();
    }

    _renderSoundBoxes(ctx) {
      const pulse = 0.5 + 0.5 * Math.sin(this.tick * 0.09);

      for (let i = 0; i < this.boxRects.length; i++) {
        const box = this.boxRects[i];
        const ch = this.letters[i];
        const solved = this.solvedFlags[i];
        const isActive = !this.wordCompleted && i === this.activeIndex;
        const shakeOffset = this.shakeTimers[i] > 0 ? Math.sin(this.shakeTimers[i] * 1.4) * 6 : 0;

        const bx = box.x + shakeOffset;
        const by = box.y;
        const bw = box.w;
        const bh = box.h;

        ctx.save();
        this._roundRectPath(ctx, bx, by, bw, bh, 22);

        if (solved) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#34d399';
          ctx.stroke();
        } else if (isActive) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14 + pulse * 14;
          ctx.fill();
          ctx.lineWidth = 3 + pulse * 1.2;
          ctx.strokeStyle = `rgba(56, 189, 248, ${(0.7 + pulse * 0.3).toFixed(2)})`;
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.stroke();
        }
        ctx.restore();

        const cx = bx + bw / 2;
        const cy = by + bh / 2;
        const guideFontPx = Math.round(bw * (36 / MASK_SIZE));

        if (solved) {
          // Crisp glowing completed letter
          ctx.save();
          ctx.fillStyle = '#ecfeff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.font = `700 ${guideFontPx}px "Nunito", "Trebuchet MS", "Comic Sans MS", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch, cx, cy + bw * 0.02);
          ctx.restore();
        } else if (this.mode === 'trace') {
          // Dotted/dashed guide letter + start dot
          ctx.save();
          ctx.font = `700 ${guideFontPx}px "Nunito", "Trebuchet MS", "Comic Sans MS", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.fillStyle = isActive ? 'rgba(148, 163, 184, 0.20)' : 'rgba(148, 163, 184, 0.12)';
          ctx.fillText(ch, cx, cy + bw * 0.02);

          ctx.setLineDash([5, 5]);
          ctx.lineWidth = isActive ? 2.4 : 1.6;
          ctx.strokeStyle = isActive ? 'rgba(125, 211, 252, 0.62)' : 'rgba(148, 163, 184, 0.32)';
          ctx.strokeText(ch, cx, cy + bw * 0.02);
          ctx.setLineDash([]);

          // Subtle stroke start dot for active letter
          if (isActive) {
            const startNorm = LETTER_STARTS[ch] || [0.5, 0.3];
            const sx = bx + startNorm[0] * bw;
            const sy = by + startNorm[1] * bh;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + pulse * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#fde047';
            ctx.shadowBlur = 10;
            ctx.fill();
          }
          ctx.restore();
        } else {
          // Dictation mode: show '?' in unsolved boxes
          ctx.save();
          ctx.fillStyle = isActive ? 'rgba(125, 211, 252, 0.55)' : 'rgba(148, 163, 184, 0.30)';
          ctx.font = `800 ${Math.round(bw * 0.44)}px "Nunito", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', cx, cy + 2);
          ctx.restore();
        }

        // Render user's glowing neon ink strokes inside the box
        const strokes = this.boxStrokes[i];
        if (!solved && strokes && strokes.length > 0) {
          ctx.save();
          this._roundRectPath(ctx, bx + 2, by + 2, bw - 4, bh - 4, 20);
          ctx.clip();

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = Math.max(7, Math.round(bw * 0.085));
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;

          for (const st of strokes) {
            if (st.length === 0) continue;
            ctx.beginPath();
            ctx.moveTo(bx + st[0].x * bw, by + st[0].y * bh);
            if (st.length === 1) {
              ctx.lineTo(bx + st[0].x * bw + 0.1, by + st[0].y * bh + 0.1);
            } else {
              for (let p = 1; p < st.length; p++) {
                ctx.lineTo(bx + st[p].x * bw, by + st[p].y * bh);
              }
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // Active trace coverage progress bar just beneath active box
        if (isActive && this.mode === 'trace') {
          const pct = Math.min(1, this._getActiveCoverage() / 0.68);
          const barW = Math.round(bw * 0.76);
          const barH = 6;
          const barX = Math.round(bx + (bw - barW) / 2);
          const barY = by + bh + 10;

          ctx.save();
          this._roundRectPath(ctx, barX, barY, barW, barH, 3);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
          ctx.fill();
          if (pct > 0.02) {
            this._roundRectPath(ctx, barX, barY, Math.max(6, Math.round(barW * pct)), barH, 3);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }

    _renderKeyboard(ctx) {
      if (this.mode !== 'dictation' || this.keyRects.length === 0) return;

      for (const kr of this.keyRects) {
        ctx.save();
        this._roundRectPath(ctx, kr.x, kr.y, kr.w, kr.h, 12);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.90)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `800 ${kr.h >= 46 ? 22 : 19}px "Nunito", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(kr.letter, kr.x + kr.w / 2, kr.y + kr.h / 2 + 1);
        ctx.restore();
      }
    }

    _renderAirCursor(ctx) {
      if (!this.showCamera || !this.hasCamera || !this.airCursor.active) return;
      const { x, y } = this.airCursor;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      ctx.restore();
    }

    _renderEffects(ctx) {
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const pop of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pop.life);
        ctx.fillStyle = pop.color;
        ctx.shadowColor = 'rgba(0,0,0,0.65)';
        ctx.shadowBlur = 6;
        ctx.font = '800 20px "Nunito", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      this._renderBackground(ctx, w, h);
      this._renderPromptBanner(ctx, w);
      this._renderSoundBoxes(ctx);
      this._renderKeyboard(ctx);
      this._renderAirCursor(ctx);
      this._renderEffects(ctx);
    }
  }

  app.PhonicsTraceGame = PhonicsTraceGame;
})(window.KidApp = window.KidApp || {});
