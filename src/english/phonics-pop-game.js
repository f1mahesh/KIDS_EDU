/* Phonics Bubble Pop AR — Hear the Phonic Sound & Pop the Matching Letter Bubbles */
(function (app) {
  'use strict';

  const { AudioEngine, TREASURE_BY_ID, pickRandomTreasure, drawTreasureCanvasItem, EnglishPhonics } = app;

  const SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   floatSpeed: 0.72, duration: 90, maxBubbles: 5, bubbleR: 48, motionThresh: 14 },
    medium: { label: '🚀 Medium (Ages 6–8)', floatSpeed: 1.15, duration: 75, maxBubbles: 6, bubbleR: 44, motionThresh: 18 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  floatSpeed: 1.65, duration: 60, maxBubbles: 7, bubbleR: 40, motionThresh: 22 }
  };

  const TIER_LABELS = {
    all:  '🎲 All K–5',
    k:    '🐣 Kindergarten',
    g1:   '🌱 Grade 1',
    g2:   '🚀 Grade 2',
    g3:   '✨ Grade 3',
    g4_5: '👑 Grades 4–5'
  };

  const BUBBLE_PALETTES = [
    { rim: '#38bdf8', inner: 'rgba(56, 189, 248, 0.28)', core: 'rgba(186, 230, 253, 0.55)', glow: '#38bdf8', shards: ['#bae6fd', '#38bdf8', '#ffffff'] },
    { rim: '#f472b6', inner: 'rgba(244, 114, 182, 0.28)', core: 'rgba(251, 207, 232, 0.55)', glow: '#ec4899', shards: ['#fbcfe8', '#ec4899', '#fde047'] },
    { rim: '#a78bfa', inner: 'rgba(167, 139, 250, 0.28)', core: 'rgba(221, 214, 254, 0.55)', glow: '#8b5cf6', shards: ['#ddd6fe', '#a855f7', '#38bdf8'] },
    { rim: '#34d399', inner: 'rgba(52, 211, 153, 0.28)', core: 'rgba(187, 247, 208, 0.55)', glow: '#10b981', shards: ['#bbf7d0', '#34d399', '#fde047'] },
    { rim: '#fbbf24', inner: 'rgba(251, 191, 36, 0.28)', core: 'rgba(254, 240, 138, 0.55)', glow: '#f59e0b', shards: ['#fef08a', '#fbbf24', '#ffffff'] }
  ];

  // UFLI-aligned phoneme targets grouped by sound equivalence (`soundGroup`)
  // so homophone graphemes (like C / K / CK or AI / AY) never confuse as distractors.
  // `chant` pronounces each phonic sound 2 times for musical chants like "B, sound buh, buh".
  const PHONICS_SOUNDS_BANK = [
    // Kindergarten (Short Vowels + Core Single Consonants)
    { id: 'a',   label: 'A',   soundKey: 'a',   soundGroup: 'short_a', symbol: '/ă/',  keyword: 'alligator', chant: 'ah, ah',   emoji: '🐊', tiers: ['k', 'g1', 'all'] },
    { id: 'e',   label: 'E',   soundKey: 'e',   soundGroup: 'short_e', symbol: '/ĕ/',  keyword: 'elephant',  chant: 'eh, eh',   emoji: '🐘', tiers: ['k', 'g1', 'all'] },
    { id: 'i',   label: 'I',   soundKey: 'i',   soundGroup: 'short_i', symbol: '/ĭ/',  keyword: 'igloo',    chant: 'ih, ih',    emoji: '🧊', tiers: ['k', 'g1', 'all'] },
    { id: 'o',   label: 'O',   soundKey: 'o',   soundGroup: 'short_o', symbol: '/ŏ/',  keyword: 'octopus',  chant: 'aw, aw',    emoji: '🐙', tiers: ['k', 'g1', 'all'] },
    { id: 'u',   label: 'U',   soundKey: 'u',   soundGroup: 'short_u', symbol: '/ŭ/',  keyword: 'umbrella', chant: 'uh, uh',    emoji: '☂️', tiers: ['k', 'g1', 'all'] },
    { id: 'b',   label: 'B',   soundKey: 'b',   soundGroup: 'b',       symbol: '/b/',  keyword: 'bear',     chant: 'buh, buh',  emoji: '🐻', tiers: ['k', 'g1', 'all'] },
    { id: 'c',   label: 'C',   soundKey: 'c',   soundGroup: 'k',       symbol: '/k/',  keyword: 'cat',      chant: 'kuh, kuh',  emoji: '🐱', tiers: ['k', 'all'] },
    { id: 'd',   label: 'D',   soundKey: 'd',   soundGroup: 'd',       symbol: '/d/',  keyword: 'dog',      chant: 'duh, duh',  emoji: '🐶', tiers: ['k', 'g1', 'all'] },
    { id: 'f',   label: 'F',   soundKey: 'f',   soundGroup: 'f',       symbol: '/f/',  keyword: 'fish',     chant: 'fuh, fuh',  emoji: '🐟', tiers: ['k', 'g1', 'all'] },
    { id: 'g',   label: 'G',   soundKey: 'g',   soundGroup: 'g',       symbol: '/g/',  keyword: 'goat',     chant: 'guh, guh',  emoji: '🐐', tiers: ['k', 'g1', 'all'] },
    { id: 'h',   label: 'H',   soundKey: 'h',   soundGroup: 'h',       symbol: '/h/',  keyword: 'hat',      chant: 'huh, huh',  emoji: '🎩', tiers: ['k', 'all'] },
    { id: 'j',   label: 'J',   soundKey: 'j',   soundGroup: 'j',       symbol: '/j/',  keyword: 'jar',      chant: 'juh, juh',  emoji: '🫙', tiers: ['k', 'g1', 'all'] },
    { id: 'k',   label: 'K',   soundKey: 'k',   soundGroup: 'k',       symbol: '/k/',  keyword: 'kite',     chant: 'kuh, kuh',  emoji: '🪁', tiers: ['k', 'g1', 'all'] },
    { id: 'l',   label: 'L',   soundKey: 'l',   soundGroup: 'l',       symbol: '/l/',  keyword: 'leaf',     chant: 'luh, luh',  emoji: '🍃', tiers: ['k', 'g1', 'all'] },
    { id: 'm',   label: 'M',   soundKey: 'm',   soundGroup: 'm',       symbol: '/m/',  keyword: 'mouse',    chant: 'muh, muh',  emoji: '🐭', tiers: ['k', 'g1', 'all'] },
    { id: 'n',   label: 'N',   soundKey: 'n',   soundGroup: 'n',       symbol: '/n/',  keyword: 'nose',     chant: 'nuh, nuh',  emoji: '👃', tiers: ['k', 'g1', 'all'] },
    { id: 'p',   label: 'P',   soundKey: 'p',   soundGroup: 'p',       symbol: '/p/',  keyword: 'pig',      chant: 'puh, puh',  emoji: '🐷', tiers: ['k', 'g1', 'all'] },
    { id: 'r',   label: 'R',   soundKey: 'r',   soundGroup: 'r',       symbol: '/r/',  keyword: 'ring',     chant: 'ruh, ruh',  emoji: '💍', tiers: ['k', 'g1', 'all'] },
    { id: 's',   label: 'S',   soundKey: 's',   soundGroup: 's',       symbol: '/s/',  keyword: 'sun',      chant: 'suh, suh',  emoji: '☀️', tiers: ['k', 'g1', 'all'] },
    { id: 't',   label: 'T',   soundKey: 't',   soundGroup: 't',       symbol: '/t/',  keyword: 'tiger',    chant: 'tuh, tuh',  emoji: '🐯', tiers: ['k', 'g1', 'all'] },
    { id: 'v',   label: 'V',   soundKey: 'v',   soundGroup: 'v',       symbol: '/v/',  keyword: 'van',      chant: 'vuh, vuh',  emoji: '🚐', tiers: ['k', 'g1', 'all'] },
    { id: 'w',   label: 'W',   soundKey: 'w',   soundGroup: 'w',       symbol: '/w/',  keyword: 'web',      chant: 'wuh, wuh',  emoji: '🕸️', tiers: ['k', 'g1', 'all'] },
    { id: 'z',   label: 'Z',   soundKey: 'z',   soundGroup: 'z',       symbol: '/z/',  keyword: 'zipper',   chant: 'zuh, zuh',  emoji: '🤐', tiers: ['k', 'g1', 'all'] },

    // Grade 1 (Q, X, Y + Consonant Blends)
    { id: 'qu',  label: 'QU',  soundKey: 'qu',  soundGroup: 'kw',      symbol: '/kw/', keyword: 'queen',    chant: 'kwa, kwa',   emoji: '👑', tiers: ['g1', 'g2', 'all'] },
    { id: 'x',   label: 'X',   soundKey: 'x',   soundGroup: 'ks',      symbol: '/ks/', keyword: 'fox',      chant: 'kss, kss',   emoji: '🦊', tiers: ['g1', 'all'] },
    { id: 'y',   label: 'Y',   soundKey: 'y',   soundGroup: 'y',       symbol: '/y/',  keyword: 'yellow',   chant: 'yuh, yuh',   emoji: '💛', tiers: ['g1', 'all'] },
    { id: 'fl',  label: 'FL',  soundKey: 'fl',  soundGroup: 'fl',      symbol: '/f/ /l/', keyword: 'flag',  chant: 'fluh, fluh', emoji: '🚩', tiers: ['g1'] },
    { id: 'fr',  label: 'FR',  soundKey: 'fr',  soundGroup: 'fr',      symbol: '/f/ /r/', keyword: 'frog',  chant: 'fruh, fruh', emoji: '🐸', tiers: ['g1'] },
    { id: 'cl',  label: 'CL',  soundKey: 'cl',  soundGroup: 'cl',      symbol: '/k/ /l/', keyword: 'clap',  chant: 'kluh, kluh', emoji: '👏', tiers: ['g1'] },
    { id: 'cr',  label: 'CR',  soundKey: 'cr',  soundGroup: 'cr',      symbol: '/k/ /r/', keyword: 'crab',  chant: 'kruh, kruh', emoji: '🦀', tiers: ['g1'] },
    { id: 'dr',  label: 'DR',  soundKey: 'dr',  soundGroup: 'dr',      symbol: '/d/ /r/', keyword: 'drum',  chant: 'druh, druh', emoji: '🥁', tiers: ['g1'] },
    { id: 'st',  label: 'ST',  soundKey: 'st',  soundGroup: 'st',      symbol: '/s/ /t/', keyword: 'stop',  chant: 'stuh, stuh', emoji: '🛑', tiers: ['g1'] },
    { id: 'pl',  label: 'PL',  soundKey: 'pl',  soundGroup: 'pl',      symbol: '/p/ /l/', keyword: 'plum',  chant: 'pluh, pluh', emoji: '🫐', tiers: ['g1'] },
    { id: 'sw',  label: 'SW',  soundKey: 'sw',  soundGroup: 'sw',      symbol: '/s/ /w/', keyword: 'swim',  chant: 'swuh, swuh', emoji: '🏊', tiers: ['g1'] },
    { id: 'sn',  label: 'SN',  soundKey: 'sn',  soundGroup: 'sn',      symbol: '/s/ /n/', keyword: 'snap',  chant: 'snuh, snuh', emoji: '🫰', tiers: ['g1'] },
    { id: 'tr',  label: 'TR',  soundKey: 'tr',  soundGroup: 'tr',      symbol: '/t/ /r/', keyword: 'trip',  chant: 'truh, truh', emoji: '🧳', tiers: ['g1'] },

    // Grade 2 (Digraphs & FLSZ)
    { id: 'sh',  label: 'SH',  soundKey: 'sh',  soundGroup: 'sh',      symbol: '/sh/', keyword: 'ship',     chant: 'shh, shh',   emoji: '🚢', tiers: ['g2', 'g3', 'all'] },
    { id: 'ch',  label: 'CH',  soundKey: 'ch',  soundGroup: 'ch',      symbol: '/ch/', keyword: 'chair',    chant: 'chuh, chuh', emoji: '🪑', tiers: ['g2', 'g3', 'all'] },
    { id: 'th',  label: 'TH',  soundKey: 'th',  soundGroup: 'th',      symbol: '/th/', keyword: 'thumb',    chant: 'thuh, thuh', emoji: '👍', tiers: ['g2', 'g3', 'all'] },
    { id: 'wh',  label: 'WH',  soundKey: 'wh',  soundGroup: 'w',       symbol: '/wh/', keyword: 'whale',    chant: 'wuh, wuh',   emoji: '🐳', tiers: ['g2'] },
    { id: 'ph',  label: 'PH',  soundKey: 'ph',  soundGroup: 'f',       symbol: '/f/',  keyword: 'phone',    chant: 'fuh, fuh',   emoji: '📱', tiers: ['g2', 'g4_5'] },
    { id: 'ck',  label: 'CK',  soundKey: 'ck',  soundGroup: 'k',       symbol: '/k/',  keyword: 'duck',     chant: 'kuh, kuh',   emoji: '🦆', tiers: ['g2'] },
    { id: 'ng',  label: 'NG',  soundKey: 'ng',  soundGroup: 'ng',      symbol: '/ng/', keyword: 'ring',     chant: 'ing, ing',   emoji: '💍', tiers: ['g2', 'g3', 'all'] },
    { id: 'ff',  label: 'FF',  soundKey: 'ff',  soundGroup: 'f',       symbol: '/f/',  keyword: 'puff',     chant: 'fuh, fuh',   emoji: '💨', tiers: ['g2'] },
    { id: 'll',  label: 'LL',  soundKey: 'll',  soundGroup: 'l',       symbol: '/l/',  keyword: 'bell',     chant: 'luh, luh',   emoji: '🔔', tiers: ['g2'] },
    { id: 'ss',  label: 'SS',  soundKey: 'ss',  soundGroup: 's',       symbol: '/s/',  keyword: 'grass',    chant: 'suh, suh',   emoji: '🌿', tiers: ['g2'] },
    { id: 'zz',  label: 'ZZ',  soundKey: 'zz',  soundGroup: 'z',       symbol: '/z/',  keyword: 'buzz',     chant: 'zuh, zuh',   emoji: '🐝', tiers: ['g2'] },

    // Grade 3 (VCe Long Vowels & R-Controlled Vowels)
    { id: 'a_e', label: 'A-E', soundKey: 'a_e', soundGroup: 'long_a',  symbol: '/ā/',  keyword: 'cake',     chant: 'ay, ay',    emoji: '🎂', tiers: ['g3', 'all'] },
    { id: 'i_e', label: 'I-E', soundKey: 'i_e', soundGroup: 'long_i',  symbol: '/ī/',  keyword: 'kite',     chant: 'eye, eye',  emoji: '🪁', tiers: ['g3', 'all'] },
    { id: 'o_e', label: 'O-E', soundKey: 'o_e', soundGroup: 'long_o',  symbol: '/ō/',  keyword: 'bone',     chant: 'oh, oh',    emoji: '🦴', tiers: ['g3', 'all'] },
    { id: 'u_e', label: 'U-E', soundKey: 'u_e', soundGroup: 'long_u',  symbol: '/yū/', keyword: 'cube',     chant: 'you, you',  emoji: '🧊', tiers: ['g3', 'all'] },
    { id: 'ar',  label: 'AR',  soundKey: 'ar',  soundGroup: 'ar',      symbol: '/ar/', keyword: 'star',     chant: 'ar, ar',    emoji: '⭐', tiers: ['g3', 'g4_5', 'all'] },
    { id: 'or',  label: 'OR',  soundKey: 'or',  soundGroup: 'or',      symbol: '/or/', keyword: 'fork',     chant: 'or, or',    emoji: '🍴', tiers: ['g3', 'g4_5', 'all'] },
    { id: 'er',  label: 'ER',  soundKey: 'er',  soundGroup: 'er',      symbol: '/er/', keyword: 'fern',     chant: 'er, er',    emoji: '🌿', tiers: ['g3', 'g4_5', 'all'] },
    { id: 'ir',  label: 'IR',  soundKey: 'ir',  soundGroup: 'er',      symbol: '/er/', keyword: 'bird',     chant: 'er, er',    emoji: '🐦', tiers: ['g3'] },
    { id: 'ur',  label: 'UR',  soundKey: 'ur',  soundGroup: 'er',      symbol: '/er/', keyword: 'surf',     chant: 'er, er',    emoji: '🏄', tiers: ['g3'] },

    // Grades 4–5 (Vowel Teams & Diphthongs)
    { id: 'ai',  label: 'AI',  soundKey: 'ai',  soundGroup: 'long_a',  symbol: '/ā/',  keyword: 'rain',     chant: 'ay, ay',    emoji: '🌧️', tiers: ['g4_5', 'all'] },
    { id: 'ay',  label: 'AY',  soundKey: 'ay',  soundGroup: 'long_a',  symbol: '/ā/',  keyword: 'play',     chant: 'ay, ay',    emoji: '🎮', tiers: ['g4_5'] },
    { id: 'ee',  label: 'EE',  soundKey: 'ee',  soundGroup: 'long_e',  symbol: '/ē/',  keyword: 'tree',     chant: 'E, E',      emoji: '🌳', tiers: ['g4_5', 'all'] },
    { id: 'ea',  label: 'EA',  soundKey: 'ea',  soundGroup: 'long_e',  symbol: '/ē/',  keyword: 'leaf',     chant: 'E, E',      emoji: '🍃', tiers: ['g4_5'] },
    { id: 'oa',  label: 'OA',  soundKey: 'oa',  soundGroup: 'long_o',  symbol: '/ō/',  keyword: 'boat',     chant: 'oh, oh',    emoji: '⛵', tiers: ['g4_5', 'all'] },
    { id: 'ow',  label: 'OW',  soundKey: 'ow',  soundGroup: 'long_o',  symbol: '/ō/',  keyword: 'snow',     chant: 'oh, oh',    emoji: '❄️', tiers: ['g4_5'] },
    { id: 'oo',  label: 'OO',  soundKey: 'oo',  soundGroup: 'oo_long', symbol: '/ū/',  keyword: 'moon',     chant: 'ooh, ooh',  emoji: '🌙', tiers: ['g4_5', 'all'] },
    { id: 'ou',  label: 'OU',  soundKey: 'ou',  soundGroup: 'ow_dip',  symbol: '/ow/', keyword: 'cloud',    chant: 'ow, ow',    emoji: '☁️', tiers: ['g4_5', 'all'] },
    { id: 'oi',  label: 'OI',  soundKey: 'oi',  soundGroup: 'oy_dip',  symbol: '/oy/', keyword: 'coin',     chant: 'oy, oy',    emoji: '🪙', tiers: ['g4_5', 'all'] },
    { id: 'oy',  label: 'OY',  soundKey: 'oy',  soundGroup: 'oy_dip',  symbol: '/oy/', keyword: 'toy',      chant: 'oy, oy',    emoji: '🧸', tiers: ['g4_5'] },
    { id: 'au',  label: 'AU',  soundKey: 'au',  soundGroup: 'aw_dip',  symbol: '/aw/', keyword: 'hawk',     chant: 'aw, aw',    emoji: '🦅', tiers: ['g4_5'] },
    { id: 'aw',  label: 'AW',  soundKey: 'aw',  soundGroup: 'aw_dip',  symbol: '/aw/', keyword: 'paw',      chant: 'aw, aw',    emoji: '🐾', tiers: ['g4_5', 'all'] },
    { id: 'igh', label: 'IGH', soundKey: 'igh', soundGroup: 'long_i',  symbol: '/ī/',  keyword: 'night',    chant: 'eye, eye',  emoji: '🌃', tiers: ['g4_5', 'all'] }
  ];

  const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
  const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
  const MEDIAPIPE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

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

  class PhonicsPopGame {
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

      // Progressive MediaPipe HandLandmarker (automatic offline optical fallback)
      this.handLandmarker = null;
      this.mpReady = false;
      this.mpLoading = false;
      this.lastVideoTime = -1;
      this.fingerCursors = []; // Mirrored { x, y, prevX, prevY }
      this.motionSparks = [];

      this.stream = null;
      this.hasCamera = false;
      this.showCamera = true;
      this.running = false;
      this.rafId = null;
      this.timerId = null;
      this.echoTimer = null;
      this.nextRoundTimer = null;

      this.tier = 'all';
      this.speed = 'slow';
      this.clueMode = 'clue'; // 'clue' | 'ear'
      this.score = 0;
      this.popped = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = 90;
      this.tick = 0;
      this.shakeFrames = 0;
      this.popCooldown = 0;
      this.soundWaveFrames = 0;

      this.targetSound = null;
      this.roundLocked = false;
      this.hintText = '';
      this.hintFrames = 0;
      this.bannerRect = { x: 0, y: 0, w: 0, h: 0 };
      this.pictureCardRect = { x: 0, y: 0, w: 0, h: 0 };
      this.pictureBounceFrames = 0;

      this.bubbles = [];
      this.rings = [];
      this.droplets = [];
      this.popups = [];
      this.bgBubbles = [];

      this._initBackdrop();
      this._bindPointer();
      this._onResize = () => {
        if (this.running) this._syncCanvasSize();
      };
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
        this._initBackdrop();
      }
    }

    _initBackdrop() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.bgBubbles = [];
      for (let i = 0; i < 24; i++) {
        this.bgBubbles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 6 + Math.random() * 18,
          vy: 0.25 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2
        });
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

    toggleCameraView() {
      this.showCamera = !this.showCamera;
      return this.showCamera;
    }

    setTier(tier) {
      this.tier = normalizeTier(tier);
      if (this.running) {
        this._loadNextSound(true);
      }
      this.onStatus(`📚 ${TIER_LABELS[this.tier]} — Listen to the phonic sound and pop the matching letter!`);
    }

    setSpeed(speedKey) {
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.onStatus(`🫧 ${preset.label} — Wave your hand or tap the matching letter bubble!`);
    }

    setClueMode(mode) {
      this.clueMode = mode === 'ear' ? 'ear' : 'clue';
      this.onStatus(
        this.clueMode === 'ear'
          ? '🎧 Sound Only Mode! Hear the phonic sound and pop the matching letter!'
          : '🎵 Phonics Song Mode! Hear the letter, sound & example word!'
      );
      if (this.running) this.repeatSound(false);
    }

    repeatSound(withKeyword = false) {
      if (!this.targetSound) return;
      this.soundWaveFrames = 34;
      this._playTargetPhonicSound(withKeyword);
    }

    handleKey(key) {
      if (!this.running || this.roundLocked || this.popCooldown > 0) return;
      if (key === ' ') {
        this.repeatSound(false);
        return;
      }
      const ch = String(key || '').trim().toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return;

      // Pop matching single-letter bubble if present, else gentle feedback on the typed letter
      const matchIdx = this.bubbles.findIndex((b) => b.isLetter && b.soundItem.label === ch);
      if (matchIdx !== -1) {
        this._popBubble(this.bubbles[matchIdx], matchIdx);
      }
    }

    _bindPointer() {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

        // Tapping the top sound banner or smiling cartoon picture replays the phonic sound
        const br = this.bannerRect;
        const pr = this.pictureCardRect;
        const hitBanner = br.w > 0 && x >= br.x && x <= br.x + br.w && y >= br.y && y <= br.y + br.h;
        const hitPic = pr.w > 0 && x >= pr.x && x <= pr.x + pr.w && y >= pr.y && y <= pr.y + pr.h;
        if (hitBanner || hitPic) {
          this.pictureBounceFrames = 18;
          this.repeatSound(hitPic);
          return;
        }

        if (this.popCooldown > 0) return;
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
          const b = this.bubbles[i];
          if (Math.hypot(x - b.x, y - b.y) <= b.r + 14) {
            this._popBubble(b, i);
            break;
          }
        }
      });
    }

    async _initMediaPipeHands() {
      if (this.mpReady || this.mpLoading) return;
      if (window.location.protocol === 'file:' || !navigator.onLine) {
        return;
      }
      this.mpLoading = true;
      try {
        const visionPkg = await import(MEDIAPIPE_CDN);
        const { FilesetResolver, HandLandmarker } = visionPkg;
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_MODEL,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });
        this.mpReady = true;
        if (this.running && this.hasCamera) {
          this.onStatus('🖐️ AR Finger Pop Ready! Point or wave at the matching letter bubble!');
        }
      } catch (_) {
        this.mpReady = false;
      } finally {
        this.mpLoading = false;
      }
    }

    async start(tier = 'all', speedKey = 'slow', clueMode = 'clue') {
      this.stop();
      this._syncCanvasSize();
      this.tier = normalizeTier(tier);
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.clueMode = clueMode === 'ear' ? 'ear' : 'clue';
      const preset = SPEED_PRESETS[this.speed];

      this.score = 0;
      this.popped = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.tick = 0;
      this.shakeFrames = 0;
      this.popCooldown = 0;
      this.soundWaveFrames = 0;
      this.prevFrame = null;
      this.fingerCursors = [];
      this.motionSparks = [];
      this.bubbles = [];
      this.rings = [];
      this.droplets = [];
      this.popups = [];
      this.hintText = '';
      this.hintFrames = 0;
      this.roundLocked = false;
      this.running = true;

      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.onStatus('📷 Starting AR Bubble Pop Camera...');
      await this._startCamera();
      this._loadNextSound(true);

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this.onScore({
          score: this.score,
          popped: this.popped,
          combo: this.combo,
          stars: this.stars,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedSound: null
        });
        if (this.timeLeft <= 0) {
          const finalScore = this.score;
          const finalPopped = this.popped;
          const finalStars = this.stars;
          this.stop();
          this.onFinish({
            score: finalScore,
            popped: finalPopped,
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
        this.onStatus('🫧 Touch Pop Mode! Listen to the phonic sound & tap the matching letter bubble!');
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
        this.onStatus('🫧 Wave your hand or tap a floating letter bubble to POP the phonic sound!');
        this._initMediaPipeHands();
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('🫧 Touch Pop Mode (Camera off)! Listen & tap the matching letter bubble!');
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
      if (this.echoTimer) {
        clearTimeout(this.echoTimer);
        this.echoTimer = null;
      }
      if (this.nextRoundTimer) {
        clearTimeout(this.nextRoundTimer);
        this.nextRoundTimer = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    _getPoolForTier() {
      const pool = PHONICS_SOUNDS_BANK.filter((item) => item.tiers.includes(this.tier));
      return pool.length > 0 ? pool : PHONICS_SOUNDS_BANK;
    }

    _getSoundMetadata(item) {
      const ep = EnglishPhonics;
      const g = ep && ep.UFLI_GRAPHEMES && ep.UFLI_GRAPHEMES[item.soundKey];
      return {
        symbol: item.symbol || (g && g.symbol) || `/${item.soundKey}/`,
        keyword: item.keyword || (g && g.keyword) || '',
        emoji: item.emoji || (g && g.emoji) || '🔊',
        chant: item.chant || item.soundKey
      };
    }

    _formatSpokenLabel(label) {
      const clean = String(label || '').replace('-', ' ').trim();
      return clean.length > 1 ? clean.split('').join(' ') : clean;
    }

    _buildPhonicsChant(item, fullSong = false) {
      const meta = this._getSoundMetadata(item);
      const spokenLetter = this._formatSpokenLabel(item.label);
      const word = meta.keyword;
      if (this.clueMode === 'ear' && !fullSong) {
        return word ? `sound ${meta.chant}, like ${word}` : `sound ${meta.chant}`;
      }
      if (fullSong) {
        return word
          ? `${spokenLetter}, sound ${meta.chant}! ${word}, ${word}, ${meta.chant}!`
          : `${spokenLetter}, sound ${meta.chant}!`;
      }
      return word
        ? `${spokenLetter}, sound ${meta.chant}! ${word}!`
        : `${spokenLetter}, sound ${meta.chant}`;
    }

    _playPhonemeKey(soundKey, cancelActive = true) {
      const ep = EnglishPhonics;
      if (ep && typeof ep.speakPhoneme === 'function') {
        ep.speakPhoneme(soundKey, cancelActive, 4.4);
        return;
      }
      if (AudioEngine && typeof AudioEngine.playPhoneme === 'function') {
        AudioEngine.playPhoneme(soundKey, 0, 4.4);
      }
    }

    _playTargetPhonicSound(withKeyword = false) {
      if (!this.targetSound) return;
      const target = this.targetSound;
      this.soundWaveFrames = 44;
      if (this.echoTimer) {
        clearTimeout(this.echoTimer);
        this.echoTimer = null;
      }

      if (AudioEngine && typeof AudioEngine.musicalChantNotes === 'function') {
        AudioEngine.musicalChantNotes(withKeyword);
      }

      const canSpeak = Boolean(AudioEngine && typeof AudioEngine.speak === 'function' && typeof window.speechSynthesis !== 'undefined');
      if (canSpeak) {
        const phrase = this._buildPhonicsChant(target, withKeyword);
        AudioEngine.speak(phrase, 'gentle');
        return;
      }

      // Offline / no-SpeechSynthesis fallback: 2 musical phoneme beats
      this._playPhonemeKey(target.soundKey, true);
      this.echoTimer = setTimeout(() => {
        if (!this.running || this.roundLocked || this.targetSound !== target) return;
        this.soundWaveFrames = Math.max(this.soundWaveFrames, 24);
        this._playPhonemeKey(target.soundKey, false);
      }, 360);
    }

    _loadNextSound(isFreshRound = false) {
      if (this.nextRoundTimer) {
        clearTimeout(this.nextRoundTimer);
        this.nextRoundTimer = null;
      }
      if (this.echoTimer) {
        clearTimeout(this.echoTimer);
        this.echoTimer = null;
      }

      const pool = this._getPoolForTier();
      let picked = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && this.targetSound && picked.id === this.targetSound.id) {
        const idx = pool.indexOf(picked);
        picked = pool[(idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length];
      }

      this.targetSound = picked;
      this.roundLocked = false;
      this.hintText = '';
      this.hintFrames = 0;

      if (isFreshRound) {
        this.bubbles = [];
      } else {
        // Clear stale distractors matching previous target and ensure fresh target bubble spawns cleanly
        this.bubbles = this.bubbles.filter((b) => b.isTreasure || b.soundItem.soundGroup !== picked.soundGroup);
      }

      this._ensureBubbles();
      this._playTargetPhonicSound(false);
    }

    _pickDistractorSound(target) {
      const pool = this._getPoolForTier();
      const existingIds = new Set(this.bubbles.filter((b) => b.isLetter).map((b) => b.soundItem.id));
      const candidates = pool.filter(
        (item) => item.id !== target.id && item.soundGroup !== target.soundGroup && !existingIds.has(item.id)
      );
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      const fallback = pool.filter((item) => item.soundGroup !== target.soundGroup);
      if (fallback.length > 0) {
        return fallback[Math.floor(Math.random() * fallback.length)];
      }
      return PHONICS_SOUNDS_BANK.find((item) => item.soundGroup !== target.soundGroup) || PHONICS_SOUNDS_BANK[0];
    }

    _spawnBubble(kind, soundItem = null, ySpread = 0) {
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const r = kind === 'treasure' ? Math.max(36, preset.bubbleR - 4) : preset.bubbleR;

      for (let attempt = 0; attempt < 20; attempt++) {
        const x = r + 24 + Math.random() * Math.max(40, w - (r + 24) * 2);
        // Spawn comfortably below the top banner or rising from bottom
        const y = h + r + 14 + ySpread + Math.random() * 95;
        const tooClose = this.bubbles.some((o) => Math.hypot(x - o.x, y - o.y) < r + o.r + 26);
        if (tooClose) continue;

        if (kind === 'treasure') {
          const mat = pickRandomTreasure();
          this.bubbles.push({
            x,
            y,
            r,
            vx: (Math.random() - 0.5) * 0.55,
            vy: -(preset.floatSpeed + 0.25 + Math.random() * 0.35),
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.03 + Math.random() * 0.02,
            isLetter: false,
            isTreasure: true,
            treasureId: mat.id,
            points: mat.pts,
            glow: mat.glow,
            shardColors: mat.shardColors,
            wobble: 0,
            wrongCooldown: 0
          });
          return true;
        }

        const palette = BUBBLE_PALETTES[Math.floor(Math.random() * BUBBLE_PALETTES.length)];
        this.bubbles.push({
          x,
          y,
          r,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(preset.floatSpeed + Math.random() * 0.38),
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.025 + Math.random() * 0.025,
          isLetter: true,
          isTreasure: false,
          soundItem,
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

    _ensureBubbles() {
      if (!this.running || !this.targetSound || this.roundLocked) return;
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const target = this.targetSound;

      // Always keep at least one matching target bubble rising on screen
      const targetCount = this.bubbles.filter((b) => b.isLetter && b.soundItem.id === target.id).length;
      if (targetCount === 0) {
        // Place initial target higher if board was just reset so kid doesn't wait!
        const spawnOk = this._spawnBubble('letter', target, 0);
        if (spawnOk && this.bubbles.length <= 2) {
          const latest = this.bubbles[this.bubbles.length - 1];
          latest.y = this.canvas.height * (0.55 + Math.random() * 0.22);
        }
      }

      let guard = 0;
      const initialFill = this.bubbles.length <= 1;
      while (this.bubbles.length < preset.maxBubbles && guard < 22) {
        guard++;
        const hasTreasure = this.bubbles.some((b) => b.isTreasure);
        if (!hasTreasure && Math.random() < 0.16) {
          if (this._spawnBubble('treasure', null, guard * 28) && initialFill) {
            this.bubbles[this.bubbles.length - 1].y = this.canvas.height * (0.48 + Math.random() * 0.36);
          }
        } else {
          const distractor = this._pickDistractorSound(target);
          if (this._spawnBubble('letter', distractor, guard * 24) && initialFill) {
            this.bubbles[this.bubbles.length - 1].y = this.canvas.height * (0.42 + Math.random() * 0.44);
          }
        }
      }
    }

    _spawnPopBurst(x, y, r, colors, count = 18) {
      this.rings.push({
        x,
        y,
        r: r * 0.65,
        maxR: r * 1.95,
        color: colors[0] || '#ffffff',
        life: 18,
        maxLife: 18
      });
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const spd = 2.4 + Math.random() * 5.2;
        this.droplets.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2,
          r: 3.5 + Math.random() * 5.5,
          color: colors[i % colors.length],
          life: 24 + Math.random() * 12
        });
      }
    }

    _popBubble(bubble, index) {
      if (bubble.isTreasure) {
        this.popCooldown = 14;
        this.bubbles.splice(index, 1);
        this.shakeFrames = 6;
        this.score += bubble.points;
        if (AudioEngine) AudioEngine.magic();
        this._spawnPopBurst(bubble.x, bubble.y, bubble.r, bubble.shardColors, 20);
        const mat = TREASURE_BY_ID[bubble.treasureId];
        this.popups.push({
          x: bubble.x,
          y: bubble.y - 10,
          text: mat ? `${mat.emoji} +${bubble.points} ${mat.short}!` : `💎 +${bubble.points}!`,
          color: '#fde047',
          life: 44
        });
        this.onScore({
          score: this.score,
          popped: this.popped,
          combo: this.combo,
          stars: this.stars,
          timeLeft: this.timeLeft,
          collectedMaterial: bubble.treasureId,
          solvedSound: null
        });
        return;
      }

      if (this.roundLocked || !this.targetSound) return;
      const item = bubble.soundItem;

      if (item.id === this.targetSound.id || item.soundGroup === this.targetSound.soundGroup) {
        // Correct phonic sound popped!
        this.roundLocked = true;
        this.popCooldown = 18;
        if (this.echoTimer) {
          clearTimeout(this.echoTimer);
          this.echoTimer = null;
        }
        this.bubbles.splice(index, 1);
        this.shakeFrames = 7;

        const pts = 20 * this.combo;
        this.score += pts;
        this.popped += 1;
        this.combo = Math.min(5, this.combo + 1);
        const earnedStar = this.popped % 3 === 0 ? 1 : 0;
        this.stars += earnedStar;

        if (AudioEngine) AudioEngine.pop();
        if (earnedStar > 0 && AudioEngine) AudioEngine.correct();
        this._spawnPopBurst(bubble.x, bubble.y, bubble.r, bubble.shardColors, 24);

        const meta = this._getSoundMetadata(item);
        this.popups.push({
          x: bubble.x,
          y: bubble.y - 14,
          text: earnedStar > 0 ? `✨ ${item.label} ${meta.symbol}! +${pts} ⭐` : `✨ ${item.label} ${meta.symbol}! +${pts}`,
          color: '#4ade80',
          life: 46
        });

        this.onScore({
          score: this.score,
          popped: this.popped,
          combo: this.combo,
          stars: this.stars,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedSound: item.label
        });

        if (this.nextRoundTimer) clearTimeout(this.nextRoundTimer);
        this.nextRoundTimer = setTimeout(() => {
          this.nextRoundTimer = null;
          if (this.running) this._loadNextSound(false);
        }, 720);
      } else {
        // Wrong letter: playful wobble + play the wrong letter's phonic sound so the kid learns!
        if (bubble.wrongCooldown > 0) return;
        this.popCooldown = 12;
        bubble.wobble = 18;
        bubble.wrongCooldown = 26;
        this.combo = 1;

        const wrongMeta = this._getSoundMetadata(item);
        const targetMeta = this._getSoundMetadata(this.targetSound);
        this.hintText = `That's ${item.label} ${wrongMeta.symbol} — listen for ${targetMeta.symbol}!`;
        this.hintFrames = 85;

        if (AudioEngine) AudioEngine.wrong();
        if (AudioEngine && typeof AudioEngine.speak === 'function' && typeof window.speechSynthesis !== 'undefined') {
          const wrongLetter = this._formatSpokenLabel(item.label);
          const targetSay = this.clueMode === 'ear'
            ? `${targetMeta.chant}!`
            : `${this._formatSpokenLabel(this.targetSound.label)}, ${targetMeta.chant}!`;
          AudioEngine.speak(`That is ${wrongLetter}, ${wrongMeta.chant}. Find ${targetSay}`, 'gentle');
        } else {
          setTimeout(() => {
            if (this.running) this._playPhonemeKey(item.soundKey, false);
          }, 150);
        }

        this.popups.push({
          x: bubble.x,
          y: bubble.y - 12,
          text: `${item.label} = ${wrongMeta.symbol}`,
          color: '#fbbf24',
          life: 40
        });

        this.onScore({
          score: this.score,
          popped: this.popped,
          combo: this.combo,
          stars: this.stars,
          timeLeft: this.timeLeft,
          collectedMaterial: null,
          solvedSound: null
        });
      }
    }

    _analyzeARPopHits() {
      if (!this.hasCamera || this.video.readyState < 2) return;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // 1. Primary: MediaPipe fingertip tracking (index finger tip #8, middle tip #12, palm #9)
      if (this.mpReady && this.handLandmarker) {
        try {
          if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const res = this.handLandmarker.detectForVideo(this.video, performance.now());
            const prevByIdx = this.fingerCursors;
            const nextCursors = [];
            if (res && res.landmarks) {
              for (const lm of res.landmarks) {
                [8, 12].forEach((tipIdx, localIdx) => {
                  const pt = lm[tipIdx];
                  if (!pt) return;
                  const cx = (1 - pt.x) * w;
                  const cy = pt.y * h;
                  const prev = prevByIdx[nextCursors.length];
                  nextCursors.push({
                    x: cx,
                    y: cy,
                    prevX: prev ? prev.x : cx,
                    prevY: prev ? prev.y : cy
                  });
                });
              }
            }
            this.fingerCursors = nextCursors;
          }

          if (this.fingerCursors.length > 0) {
            if (this.popCooldown <= 0) {
              for (const cur of this.fingerCursors) {
                for (let i = this.bubbles.length - 1; i >= 0; i--) {
                  const b = this.bubbles[i];
                  if (Math.hypot(cur.x - b.x, cur.y - b.y) <= b.r + 14) {
                    this._popBubble(b, i);
                    return;
                  }
                }
              }
            }
            return;
          }
        } catch (_) {
          // Fall through seamlessly to optical motion pop
        }
      }

      // 2. Fallback: Lightweight Optical Motion AR Pop (works 100% offline!)
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;
      this._drawVideoCover(this.motionCtx, mw, mh);
      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;

      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      if (this.popCooldown > 0) {
        this.prevFrame.set(data);
        return;
      }

      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      let bestIdx = -1;
      let bestEnergy = 0;

      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        const cx = Math.round((b.x / w) * mw);
        const cy = Math.round((b.y / h) * mh);
        const rad = Math.max(4, Math.round((b.r / w) * mw));

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
            if (diff > 92) hardPixels += 2;
            else if (diff > 52) softPixels += 1;
          }
        }

        const energy = hardPixels + softPixels * 0.35;
        if (energy >= preset.motionThresh && energy > bestEnergy) {
          bestEnergy = energy;
          bestIdx = i;
        } else if (energy >= preset.motionThresh * 0.5) {
          b.wobble = Math.max(b.wobble, 6);
        }
      }

      this.prevFrame.set(data);

      if (bestIdx !== -1) {
        const hitB = this.bubbles[bestIdx];
        this.motionSparks.push({ x: hitB.x, y: hitB.y, life: 16 });
        this._popBubble(hitB, bestIdx);
      }
    }

    _update() {
      this.tick += 1;
      if (this.shakeFrames > 0) this.shakeFrames -= 1;
      if (this.popCooldown > 0) this.popCooldown -= 1;
      if (this.soundWaveFrames > 0) this.soundWaveFrames -= 1;
      if (this.hintFrames > 0) this.hintFrames -= 1;
      if (this.pictureBounceFrames > 0) this.pictureBounceFrames -= 1;

      const w = this.canvas.width;
      const h = this.canvas.height;

      for (const bg of this.bgBubbles) {
        bg.y -= bg.vy;
        bg.phase += 0.03;
        bg.x += Math.sin(bg.phase) * 0.25;
        if (bg.y < -bg.r - 10) {
          bg.y = h + bg.r + 10;
          bg.x = Math.random() * w;
        }
      }

      this._ensureBubbles();

      const minY = 128;
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        if (b.wobble > 0) b.wobble -= 1;
        if (b.wrongCooldown > 0) b.wrongCooldown -= 1;

        b.swayPhase += b.swaySpeed;
        b.x += b.vx + Math.sin(b.swayPhase) * 0.48;
        b.y += b.vy;

        if (b.x < b.r + 16) {
          b.x = b.r + 16;
          b.vx = Math.abs(b.vx);
        } else if (b.x > w - b.r - 16) {
          b.x = w - b.r - 16;
          b.vx = -Math.abs(b.vx);
        }

        // Remove bubble once it floats above the top edge
        if (b.y < -b.r - 24) {
          this.bubbles.splice(i, 1);
          continue;
        }

        // Keep bubbles gently separated for clean readability & single-pop accuracy
        for (let j = i - 1; j >= 0; j--) {
          const ot = this.bubbles[j];
          const dx = ot.x - b.x;
          const dy = ot.y - b.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b.r + ot.r + 20;
          if (dist > 0 && dist < minDist) {
            const push = (minDist - dist) * 0.04;
            const nx = dx / dist;
            const ny = dy / dist;
            b.x -= nx * push;
            ot.x += nx * push;
            if (b.y > minY && ot.y > minY) {
              b.y -= ny * push * 0.35;
              ot.y += ny * push * 0.35;
            }
          }
        }
      }

      this._analyzeARPopHits();

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const rg = this.rings[i];
        rg.r += (rg.maxR - rg.r) * 0.24;
        rg.life -= 1;
        if (rg.life <= 0) this.rings.splice(i, 1);
      }

      for (let i = this.droplets.length - 1; i >= 0; i--) {
        const d = this.droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.22;
        d.life -= 1;
        if (d.life <= 0) this.droplets.splice(i, 1);
      }

      for (let i = this.popups.length - 1; i >= 0; i--) {
        const p = this.popups[i];
        p.y -= 1.25;
        p.life -= 1;
        if (p.life <= 0) this.popups.splice(i, 1);
      }

      for (let i = this.motionSparks.length - 1; i >= 0; i--) {
        this.motionSparks[i].life -= 1;
        if (this.motionSparks[i].life <= 0) this.motionSparks.splice(i, 1);
      }
    }

    _drawBackground() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const camActive = this.hasCamera && this.showCamera && this.video.readyState >= 2;

      if (camActive) {
        this._drawVideoCover(ctx, w, h);
        const tint = ctx.createLinearGradient(0, 0, w, h);
        tint.addColorStop(0, 'rgba(14, 165, 233, 0.16)');
        tint.addColorStop(0.5, 'rgba(99, 102, 241, 0.12)');
        tint.addColorStop(1, 'rgba(236, 72, 153, 0.18)');
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, w, h);
      } else {
        const sky = ctx.createLinearGradient(0, 0, w, h);
        sky.addColorStop(0, '#0c4a6e');
        sky.addColorStop(0.45, '#1e1b4b');
        sky.addColorStop(1, '#3b0764');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      }

      // Soft ambient floating micro-bubbles
      ctx.save();
      for (const bg of this.bgBubbles) {
        ctx.strokeStyle = camActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(186, 230, 253, 0.25)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(bg.x, bg.y, bg.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawBubble(b) {
      const ctx = this.ctx;
      const jx = b.wobble > 0 ? (Math.random() - 0.5) * 8 : 0;
      const jy = b.wobble > 0 ? (Math.random() - 0.5) * 6 : 0;
      const breathe = 1 + 0.035 * Math.sin(this.tick * 0.09 + b.swayPhase);

      ctx.save();
      ctx.translate(b.x + jx, b.y + jy);
      ctx.scale(breathe, 2 - breathe);

      ctx.shadowColor = b.glow;
      ctx.shadowBlur = 16;

      if (b.isTreasure) {
        // Translucent golden bubble shell around treasure
        const tGrad = ctx.createRadialGradient(-b.r * 0.28, -b.r * 0.28, b.r * 0.1, 0, 0, b.r);
        tGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        tGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.28)');
        tGrad.addColorStop(1, 'rgba(251, 191, 36, 0.45)');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        ctx.shadowBlur = 0;
        drawTreasureCanvasItem(ctx, b.treasureId, b.r * 0.68, this.tick);
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.font = '900 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(`+${b.points}`, 0, b.r * 0.52);
        ctx.fillText(`+${b.points}`, 0, b.r * 0.52);
        ctx.restore();
        return;
      }

      const pal = b.palette;
      const grad = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.32, b.r * 0.08, 0, 0, b.r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
      grad.addColorStop(0.32, pal.core);
      grad.addColorStop(0.76, pal.inner);
      grad.addColorStop(1, pal.rim);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Soap-bubble specular gloss arc
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.34, -b.r * 0.36, b.r * 0.28, b.r * 0.13, -0.55, 0, Math.PI * 2);
      ctx.fill();

      // Bold Letter / Grapheme
      const label = b.soundItem.label;
      const fontSize = label.length >= 3 ? 25 : label.length === 2 ? 30 : 38;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5.5;
      ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(label, 0, 2);
      ctx.fillText(label, 0, 2);

      ctx.restore();
    }

    _drawSmilingFaceFeatures(ctx, eyeY, eyeDx, smileY, smileR, cheekColor = 'rgba(251, 113, 133, 0.55)') {
      // Friendly glossy eyes
      [-eyeDx, eyeDx].forEach((ex) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ex, eyeY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex - 1.3, eyeY - 1.4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rosy cheeks
      ctx.fillStyle = cheekColor;
      ctx.beginPath();
      ctx.ellipse(-eyeDx - 4, smileY - 1, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeDx + 4, smileY - 1, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Big cheerful smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, smileY - 2, smileR, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    _drawCartoonCharacter(ctx, keyword, emoji) {
      const k = String(keyword || '').toLowerCase();

      if (k === 'alligator') {
        // Cute smiling cartoon green alligator
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2.5;
        // Eye bumps
        ctx.beginPath();
        ctx.arc(-11, -18, 8, 0, Math.PI * 2);
        ctx.arc(11, -18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Rounded snout & cheeks
        ctx.beginPath();
        ctx.ellipse(0, 3, 27, 19, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Soft belly/chin highlight
        ctx.fillStyle = '#bbf7d0';
        ctx.beginPath();
        ctx.ellipse(0, 10, 19, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cute little rounded smile teeth
        ctx.fillStyle = '#ffffff';
        [-8, 8].forEach((tx) => {
          ctx.beginPath();
          ctx.moveTo(tx - 3, 12);
          ctx.lineTo(tx, 17);
          ctx.lineTo(tx + 3, 12);
          ctx.closePath();
          ctx.fill();
        });
        // Nostrils
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(-6, -1, 2, 0, Math.PI * 2);
        ctx.arc(6, -1, 2, 0, Math.PI * 2);
        ctx.fill();
        this._drawSmilingFaceFeatures(ctx, -18, 11, 8, 14);
        return;
      }

      if (k === 'bear') {
        // Cute smiling cartoon bear
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.4;
        [-19, 19].forEach((ex) => {
          ctx.beginPath();
          ctx.arc(ex, -19, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(ex, -19, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b45309';
        });
        ctx.beginPath();
        ctx.arc(0, 1, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Muzzle
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(0, 8, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, 4, 4.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        this._drawSmilingFaceFeatures(ctx, -6, 10, 10, 7);
        return;
      }

      if (k === 'cat') {
        // Cute smiling cartoon kitty
        ctx.fillStyle = '#fb923c';
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2.4;
        [[-20, -10, -10, -26, -2, -16], [20, -10, 10, -26, 2, -16]].forEach(([x1, y1, x2, y2, x3, y3]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.ellipse(0, 2, 24, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Whiskers
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.6;
        [-1, 1].forEach((dir) => {
          ctx.beginPath();
          ctx.moveTo(dir * 13, 3);
          ctx.lineTo(dir * 27, 0);
          ctx.moveTo(dir * 13, 7);
          ctx.lineTo(dir * 27, 9);
          ctx.stroke();
        });
        // Pink triangle nose
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(-3.5, 2);
        ctx.lineTo(3.5, 2);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        this._drawSmilingFaceFeatures(ctx, -5, 10, 9, 7);
        return;
      }

      if (k === 'dog') {
        // Cute smiling cartoon puppy
        ctx.fillStyle = '#92400e';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.3;
        [-22, 22].forEach((ex, i) => {
          ctx.save();
          ctx.translate(ex, -4);
          ctx.rotate(i === 0 ? 0.35 : -0.35);
          ctx.beginPath();
          ctx.ellipse(0, 6, 8, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(0, 1, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(0, 14, 4.2, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, 3, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        this._drawSmilingFaceFeatures(ctx, -6, 9, 9, 8);
        return;
      }

      if (k === 'elephant') {
        // Cute smiling cartoon baby elephant
        ctx.fillStyle = '#60a5fa';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.4;
        [-22, 22].forEach((ex) => {
          ctx.beginPath();
          ctx.ellipse(ex, 0, 12, 17, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.ellipse(ex, 1, 7, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#60a5fa';
        });
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Happy curled trunk
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.quadraticCurveTo(0, 18, 10, 15);
        ctx.stroke();
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.quadraticCurveTo(0, 18, 10, 15);
        ctx.stroke();
        this._drawSmilingFaceFeatures(ctx, -6, 9, 6, 7);
        return;
      }

      // Friendly animated smiling cartoon badge for all other words!
      const g = ctx.createRadialGradient(-8, -8, 4, 0, 0, 27);
      g.addColorStop(0, '#fef9c3');
      g.addColorStop(1, '#fde047');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji || '✨', 0, 2);
    }

    _drawSoundPromptBanner() {
      if (!this.targetSound) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const meta = this._getSoundMetadata(this.targetSound);

      let bannerY = Math.max(88, Math.round(h * 0.12));
      const canvasRect = this.canvas.getBoundingClientRect();
      const parentCabinet = this.canvas.closest('.arcade-fullscreen');
      const marquee = parentCabinet ? parentCabinet.querySelector('.arcade-marquee') : null;
      if (marquee && canvasRect.height > 0) {
        const mRect = marquee.getBoundingClientRect();
        const hudBottomCanvas = ((mRect.bottom - canvasRect.top) / canvasRect.height) * h;
        bannerY = Math.max(bannerY, Math.round(hudBottomCanvas + 36));
      }

      const mainText =
        this.clueMode === 'ear'
          ? '🔊 Listen & Pop the Letter!'
          : `🎵 Pop ${meta.symbol}!`;

      ctx.save();
      ctx.font = `900 ${w < 540 ? 19 : 23}px system-ui, sans-serif`;
      const textW = ctx.measureText(mainText).width;
      const boxW = Math.min(w - 30, Math.max(230, textW + 92));
      const boxH = 48;
      const bx = w / 2 - boxW / 2;
      const by = bannerY - boxH / 2;
      this.bannerRect = { x: bx, y: by, w: boxW, h: boxH };

      ctx.shadowColor = 'rgba(56, 189, 248, 0.35)';
      ctx.shadowBlur = 14;
      const grad = ctx.createLinearGradient(bx, by, bx + boxW, by + boxH);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.62)');
      grad.addColorStop(1, 'rgba(30, 58, 138, 0.62)');
      ctx.fillStyle = grad;
      drawRoundedRectPath(ctx, bx, by, boxW, boxH, 24);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = this.soundWaveFrames > 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.72)';
      ctx.stroke();

      // Animated audio equalizer bars on left & right of banner
      const bars = 4;
      for (let i = 0; i < bars; i++) {
        const amp = this.soundWaveFrames > 0
          ? 6 + Math.abs(Math.sin(this.tick * 0.35 + i * 1.1)) * 16
          : 5 + (i % 2) * 3;
        ctx.fillStyle = this.soundWaveFrames > 0 ? '#38bdf8' : 'rgba(186, 230, 253, 0.65)';
        drawRoundedRectPath(ctx, bx + 16 + i * 6, bannerY - amp / 2, 4, amp, 2);
        ctx.fill();
        drawRoundedRectPath(ctx, bx + boxW - 20 - i * 6, bannerY - amp / 2, 4, amp, 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mainText, w / 2, bannerY + 1);
      ctx.restore();

      // Cute Smiling Cartoon Picture Card below the banner in Phonics Song mode
      if (this.clueMode !== 'ear') {
        const cardSize = w < 540 ? 78 : 88;
        const bob = Math.sin(this.tick * 0.09) * 3.5;
        const bounceScale = this.pictureBounceFrames > 0 ? 1 + Math.sin(this.pictureBounceFrames * 0.45) * 0.12 : 1;
        const cx = w / 2;
        const cy = bannerY + boxH / 2 + 12 + cardSize / 2 + bob;
        this.pictureCardRect = { x: cx - cardSize / 2, y: cy - cardSize / 2, w: cardSize, h: cardSize };

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(bounceScale, bounceScale);

        ctx.shadowColor = 'rgba(253, 224, 71, 0.45)';
        ctx.shadowBlur = 16;
        const cardGrad = ctx.createLinearGradient(-cardSize / 2, -cardSize / 2, cardSize / 2, cardSize / 2);
        cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        cardGrad.addColorStop(1, 'rgba(224, 242, 254, 0.88)');
        ctx.fillStyle = cardGrad;
        drawRoundedRectPath(ctx, -cardSize / 2, -cardSize / 2, cardSize, cardSize, 22);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        this._drawCartoonCharacter(ctx, meta.keyword, meta.emoji);
        ctx.restore();
      } else {
        this.pictureCardRect = { x: 0, y: 0, w: 0, h: 0 };
      }

      if (this.hintFrames > 0 && this.hintText) {
        const hintBaseY = this.clueMode !== 'ear' ? bannerY + boxH / 2 + 108 : bannerY + boxH / 2 + 10;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.hintFrames / 18);
        ctx.font = '800 14px system-ui, sans-serif';
        const hw = Math.min(w - 28, Math.max(180, ctx.measureText(this.hintText).width + 28));
        ctx.fillStyle = 'rgba(251, 191, 36, 0.88)';
        drawRoundedRectPath(ctx, w / 2 - hw / 2, hintBaseY, hw, 28, 14);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hintText, w / 2, hintBaseY + 14);
        ctx.restore();
      }
    }

    _drawARCursors() {
      const ctx = this.ctx;
      for (const cur of this.fingerCursors) {
        ctx.save();
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.85)';
        ctx.beginPath();
        ctx.arc(cur.x, cur.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      }

      for (const sp of this.motionSparks) {
        ctx.save();
        ctx.globalAlpha = sp.life / 16;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, (16 - sp.life) * 2.2 + 12, 0, Math.PI * 2);
        ctx.stroke();
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
        ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
      }

      this._drawBackground();

      for (const b of this.bubbles) {
        this._drawBubble(b);
      }

      for (const rg of this.rings) {
        ctx.save();
        ctx.globalAlpha = rg.life / rg.maxLife;
        ctx.strokeStyle = rg.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (const d of this.droplets) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, d.life / 16);
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this._drawARCursors();
      this._drawSoundPromptBanner();

      for (const p of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 18);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4.5;
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  app.PhonicsPopGame = PhonicsPopGame;
})(window.KidApp = window.KidApp || {});
