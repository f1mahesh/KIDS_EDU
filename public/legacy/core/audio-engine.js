/* Lightweight Web Audio API Synthesizer & Kid-Friendly Speech Engine */

(function (app) {
  'use strict';

const PREFERRED_FEMALE_VOICES = [
  'ava',
  'emma',
  'aria',
  'jenny',
  'ana',
  'sonia',
  'libby',
  'natasha',
  'clara',
  'michelle',
  'samantha',
  'nicky',
  'allison',
  'karen',
  'serena',
  'moira',
  'tessa',
  'flo',
  'sandy',
  'google uk english female',
  'google us english'
];

const ROBOTIC_VOICE_HINTS = [
  'espeak',
  'compact',
  'zira',
  'david',
  'mark',
  'hazel',
  'george',
  'ravi',
  'heera',
  'fred',
  'albert',
  'bells'
];

const VOICE_PREF_KEY = 'playspark_voice_name';

let audioCtx = null;
let muted = localStorage.getItem('mathcube_muted') === 'true';
let voiceOn = localStorage.getItem('mathcube_voice') !== 'false';
let preferredVoiceName = localStorage.getItem(VOICE_PREF_KEY) || '';
let cachedKidVoice = null;
let voiceListeners = [];
let lastPhonemeKey = '';
let lastPhonemeTime = 0;

function scoreVoice(v) {
  const name = (v.name || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase();
  let score = 0;

  if (lang.startsWith('en-us') || lang.startsWith('en-gb') || lang.startsWith('en-ca') || lang.startsWith('en-au')) {
    score += 18;
  } else if (lang.startsWith('en')) {
    score += 10;
  }

  // Strongly prefer Neural / Natural / Enhanced human voices over robotic local SAPI voices
  if (name.includes('natural') || name.includes('neural')) score += 120;
  if (name.includes('online')) score += 60;
  if (name.includes('enhanced') || name.includes('premium') || name.includes('siri')) score += 75;
  if (name.includes('female')) score += 28;
  if (v.localService === false) score += 18;

  PREFERRED_FEMALE_VOICES.forEach((kw, idx) => {
    if (name.includes(kw)) {
      score += (PREFERRED_FEMALE_VOICES.length - idx) * 6 + 30;
    }
  });

  ROBOTIC_VOICE_HINTS.forEach((bad) => {
    if (name.includes(bad)) score -= 85;
  });

  // Penalize clearly male names so soothing female voices win
  if (/\b(male|man|guy|andrew|brian|christopher|eric|ryan|roger|steffan|liam|thomas|william|daniel|alex|oliver)\b/i.test(name)) {
    score -= 45;
  }

  return score;
}

function getSortedEnglishVoices() {
  if (!window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return [];
  const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = enVoices.length > 0 ? enVoices : voices;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

function pickKidVoice() {
  const sorted = getSortedEnglishVoices();
  if (sorted.length === 0) return null;

  if (preferredVoiceName) {
    const manual = sorted.find((v) => v.name === preferredVoiceName);
    if (manual) {
      cachedKidVoice = manual;
      return cachedKidVoice;
    }
  }

  cachedKidVoice = sorted[0];
  return cachedKidVoice;
}

if (window.speechSynthesis) {
  pickKidVoice();
  const notifyVoices = () => {
    pickKidVoice();
    voiceListeners.forEach((cb) => {
      try { cb(); } catch (_) {}
    });
  };
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = notifyVoices;
  }
}

function cleanForSpeech(text) {
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let cachedNoiseBuf = null;

function getCtx() {
  if (muted) return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getNoiseBuffer(audio) {
  if (cachedNoiseBuf && cachedNoiseBuf.sampleRate === audio.sampleRate) {
    return cachedNoiseBuf;
  }
  const len = Math.floor(audio.sampleRate * 0.5);
  const buf = audio.createBuffer(1, len, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuf = buf;
  return buf;
}

let activePhonemeDest = null;

function createPhonemeBus(audio, start, boost = 2.8) {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(Math.max(1.0, boost), start);

  if (typeof audio.createDynamicsCompressor === 'function') {
    const comp = audio.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-14, start);
    comp.knee.setValueAtTime(12, start);
    comp.ratio.setValueAtTime(6, start);
    comp.attack.setValueAtTime(0.002, start);
    comp.release.setValueAtTime(0.12, start);
    gain.connect(comp);
    comp.connect(audio.destination);
  } else {
    gain.connect(audio.destination);
  }
  return gain;
}

function playNoiseBurst(audio, start, duration, filterType, freq, q, volume, fadeIn = 0.004) {
  const src = audio.createBufferSource();
  src.buffer = getNoiseBuffer(audio);

  const filter = audio.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(freq, start);
  filter.Q.setValueAtTime(q, start);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.002, volume), start + fadeIn);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(activePhonemeDest || audio.destination);

  src.start(start);
  src.stop(start + duration + 0.015);
}

// Clipped voiced stop burst (/b/, /d/, /g/) — crisp vocal-fold pulse + release, zero trailing schwa
function playClippedVoicedStop(audio, start, burstFreq, burstQ) {
  const osc = audio.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, start);
  osc.frequency.exponentialRampToValueAtTime(95, start + 0.072);

  const lp = audio.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(360, start);

  const g = audio.createGain();
  g.gain.setValueAtTime(0.001, start);
  g.gain.exponentialRampToValueAtTime(0.5, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

  osc.connect(lp);
  lp.connect(g);
  g.connect(activePhonemeDest || audio.destination);
  osc.start(start);
  osc.stop(start + 0.09);

  playNoiseBurst(audio, start + 0.026, 0.055, 'bandpass', burstFreq, burstQ, 0.48, 0.004);
}

// American English F1/F2/F3 formant synthesis for vowels, nasals, liquids & glides (zero schwa)
function playFormantPhoneme(audio, start, duration, fStart, fEnd, baseGain = 0.36, f0 = 188) {
  const osc = audio.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(f0, start);
  osc.frequency.linearRampToValueAtTime(f0 * 0.96, start + duration);

  const master = audio.createGain();
  master.gain.setValueAtTime(0.001, start);
  master.gain.exponentialRampToValueAtTime(baseGain, start + Math.min(0.025, duration * 0.2));
  master.gain.setValueAtTime(baseGain * 0.92, start + Math.max(0.04, duration - 0.045));
  master.gain.exponentialRampToValueAtTime(0.001, start + duration);
  master.connect(activePhonemeDest || audio.destination);

  const freqs0 = fStart;
  const freqs1 = fEnd || fStart;
  const qs = [5.5, 8.5, 11.0];
  const weights = [0.68, 0.36, 0.16];

  freqs0.forEach((hz0, idx) => {
    const bp = audio.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(qs[idx] || 7, start);
    bp.frequency.setValueAtTime(hz0, start);
    if (freqs1[idx] && freqs1[idx] !== hz0) {
      bp.frequency.exponentialRampToValueAtTime(freqs1[idx], start + duration * 0.85);
    }
    const g = audio.createGain();
    g.gain.setValueAtTime(weights[idx] || 0.2, start);
    osc.connect(bp);
    bp.connect(g);
    g.connect(master);
  });

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const PHONEME_SYNTH_MAP = {
  // Clipped unvoiced stops (UFLI: quick puff of air, no "uh")
  p: (a, s) => playNoiseBurst(a, s, 0.048, 'bandpass', 520, 1.3, 0.52, 0.003),
  t: (a, s) => playNoiseBurst(a, s, 0.042, 'bandpass', 3800, 1.8, 0.44, 0.003),
  k: (a, s) => playNoiseBurst(a, s, 0.05, 'bandpass', 1850, 2.1, 0.48, 0.003),
  c: (a, s) => playNoiseBurst(a, s, 0.05, 'bandpass', 1850, 2.1, 0.48, 0.003),
  ck: (a, s) => playNoiseBurst(a, s, 0.05, 'bandpass', 1850, 2.1, 0.48, 0.003),

  // Clipped voiced stops (UFLI: quick voice + release, zero trailing schwa)
  b: (a, s) => playClippedVoicedStop(a, s, 430, 1.3),
  d: (a, s) => playClippedVoicedStop(a, s, 2700, 1.7),
  g: (a, s) => playClippedVoicedStop(a, s, 1450, 2.0),

  // Unvoiced continuous fricatives & glottal /h/
  f: (a, s) => playNoiseBurst(a, s, 0.25, 'bandpass', 4700, 1.4, 0.28, 0.02),
  ff: (a, s) => playNoiseBurst(a, s, 0.25, 'bandpass', 4700, 1.4, 0.28, 0.02),
  ph: (a, s) => playNoiseBurst(a, s, 0.25, 'bandpass', 4700, 1.4, 0.28, 0.02),
  s: (a, s) => playNoiseBurst(a, s, 0.27, 'highpass', 5400, 1.0, 0.3, 0.02),
  ss: (a, s) => playNoiseBurst(a, s, 0.27, 'highpass', 5400, 1.0, 0.3, 0.02),
  sh: (a, s) => playNoiseBurst(a, s, 0.27, 'bandpass', 2350, 2.2, 0.34, 0.02),
  th: (a, s) => playNoiseBurst(a, s, 0.23, 'bandpass', 3300, 1.1, 0.26, 0.02),
  h: (a, s) => playNoiseBurst(a, s, 0.15, 'bandpass', 950, 1.1, 0.34, 0.015),

  // Voiced continuous fricatives (/v/, /z/)
  v: (a, s) => {
    playFormantPhoneme(a, s, 0.24, [240, 1100, 2200], null, 0.24, 165);
    playNoiseBurst(a, s, 0.24, 'bandpass', 3600, 1.3, 0.18, 0.02);
  },
  z: (a, s) => {
    playFormantPhoneme(a, s, 0.25, [250, 1550, 2500], null, 0.24, 170);
    playNoiseBurst(a, s, 0.25, 'highpass', 5100, 1.0, 0.22, 0.02);
  },
  zz: (a, s) => PHONEME_SYNTH_MAP.z(a, s),

  // Affricates (/ch/, /j/) & /ks/ cluster (x)
  ch: (a, s) => {
    playNoiseBurst(a, s, 0.025, 'bandpass', 3700, 2.0, 0.26, 0.002);
    playNoiseBurst(a, s + 0.018, 0.11, 'bandpass', 2500, 2.1, 0.24, 0.006);
  },
  j: (a, s) => {
    playClippedVoicedStop(a, s, 2600, 1.8);
    playFormantPhoneme(a, s + 0.02, 0.11, [260, 1950, 2600], null, 0.14, 165);
    playNoiseBurst(a, s + 0.02, 0.11, 'bandpass', 2350, 2.0, 0.18, 0.006);
  },
  x: (a, s) => {
    playNoiseBurst(a, s, 0.04, 'bandpass', 1850, 2.1, 0.3, 0.003);
    playNoiseBurst(a, s + 0.045, 0.16, 'highpass', 5400, 1.0, 0.15, 0.01);
  },

  // Continuous nasals (/m/, /n/, /ng/) & liquids (/l/, /r/)
  m: (a, s) => playFormantPhoneme(a, s, 0.26, [260, 880, 2100], null, 0.2, 175),
  n: (a, s) => playFormantPhoneme(a, s, 0.26, [260, 1450, 2350], null, 0.2, 175),
  ng: (a, s) => playFormantPhoneme(a, s, 0.26, [260, 2050, 2600], null, 0.2, 175),
  l: (a, s) => playFormantPhoneme(a, s, 0.25, [360, 1080, 2750], null, 0.22, 182),
  ll: (a, s) => playFormantPhoneme(a, s, 0.25, [360, 1080, 2750], null, 0.22, 182),
  r: (a, s) => playFormantPhoneme(a, s, 0.25, [420, 1250, 1640], null, 0.22, 180),

  // Glides (/w/, /y/, /qu/, /wh/) — crisp transition without schwa tail
  w: (a, s) => playFormantPhoneme(a, s, 0.18, [300, 620, 2150], [430, 950, 2250], 0.21, 185),
  y: (a, s) => playFormantPhoneme(a, s, 0.18, [270, 2250, 2950], [390, 1950, 2650], 0.21, 190),
  wh: (a, s) => {
    playNoiseBurst(a, s, 0.06, 'bandpass', 950, 1.0, 0.14, 0.01);
    playFormantPhoneme(a, s + 0.035, 0.16, [300, 620, 2150], [430, 950, 2250], 0.2, 185);
  },
  q: (a, s) => {
    playNoiseBurst(a, s, 0.04, 'bandpass', 1850, 2.1, 0.3, 0.003);
    playFormantPhoneme(a, s + 0.042, 0.15, [300, 620, 2150], [430, 950, 2250], 0.2, 185);
  },
  qu: (a, s) => PHONEME_SYNTH_MAP.q(a, s),

  // UFLI Vowel Valley — Short Vowels (Apple, Edge, Itch, Octopus, Up)
  a: (a, s) => playFormantPhoneme(a, s, 0.36, [660, 1720, 2410], null, 0.34, 192),
  e: (a, s) => playFormantPhoneme(a, s, 0.35, [530, 1840, 2480], null, 0.34, 192),
  i: (a, s) => playFormantPhoneme(a, s, 0.34, [390, 1990, 2550], null, 0.34, 195),
  o: (a, s) => playFormantPhoneme(a, s, 0.36, [730, 1090, 2440], null, 0.34, 190),
  u: (a, s) => playFormantPhoneme(a, s, 0.34, [520, 1190, 2390], null, 0.34, 190),

  // Long Vowels / VCe / Vowel Teams / R-Controlled Vowels
  ai: (a, s) => playFormantPhoneme(a, s, 0.38, [530, 1840, 2480], [360, 2120, 2750], 0.34, 195),
  ay: (a, s) => PHONEME_SYNTH_MAP.ai(a, s),
  a_e: (a, s) => PHONEME_SYNTH_MAP.ai(a, s),
  ee: (a, s) => playFormantPhoneme(a, s, 0.38, [270, 2290, 3010], null, 0.34, 196),
  ea: (a, s) => PHONEME_SYNTH_MAP.ee(a, s),
  e_e: (a, s) => PHONEME_SYNTH_MAP.ee(a, s),
  i_e: (a, s) => playFormantPhoneme(a, s, 0.38, [730, 1150, 2400], [390, 1990, 2550], 0.34, 194),
  oa: (a, s) => playFormantPhoneme(a, s, 0.38, [500, 900, 2350], [340, 720, 2240], 0.34, 192),
  ow: (a, s) => PHONEME_SYNTH_MAP.oa(a, s),
  o_e: (a, s) => PHONEME_SYNTH_MAP.oa(a, s),
  oo: (a, s) => playFormantPhoneme(a, s, 0.38, [300, 870, 2240], null, 0.34, 192),
  u_e: (a, s) => {
    playFormantPhoneme(a, s, 0.38, [270, 2250, 2900], [300, 870, 2240], 0.34, 194);
  },
  oo_short: (a, s) => playFormantPhoneme(a, s, 0.32, [440, 1020, 2240], null, 0.34, 190),
  ar: (a, s) => playFormantPhoneme(a, s, 0.38, [730, 1090, 2440], [490, 1350, 1690], 0.34, 190),
  or: (a, s) => playFormantPhoneme(a, s, 0.38, [570, 840, 2410], [490, 1350, 1690], 0.34, 190),
  er: (a, s) => playFormantPhoneme(a, s, 0.36, [490, 1350, 1690], null, 0.34, 188),
  ir: (a, s) => PHONEME_SYNTH_MAP.er(a, s),
  ur: (a, s) => PHONEME_SYNTH_MAP.er(a, s),

  // Additional K–8 diphthongs, schwa & contextual consonant/vowel variants
  oi: (a, s) => playFormantPhoneme(a, s, 0.29, [570, 840, 2410], [390, 1990, 2550], 0.24, 192),
  oy: (a, s) => PHONEME_SYNTH_MAP.oi(a, s),
  ou: (a, s) => playFormantPhoneme(a, s, 0.29, [730, 1150, 2400], [340, 720, 2240], 0.24, 192),
  ow_dip: (a, s) => PHONEME_SYNTH_MAP.ou(a, s),
  au: (a, s) => playFormantPhoneme(a, s, 0.26, [570, 840, 2410], null, 0.24, 190),
  aw: (a, s) => PHONEME_SYNTH_MAP.au(a, s),
  ew: (a, s) => PHONEME_SYNTH_MAP.oo(a, s),
  ue: (a, s) => PHONEME_SYNTH_MAP.oo(a, s),
  ui: (a, s) => PHONEME_SYNTH_MAP.oo(a, s),
  ie: (a, s) => PHONEME_SYNTH_MAP.ee(a, s),
  igh: (a, s) => PHONEME_SYNTH_MAP.i_e(a, s),
  schwa: (a, s) => playFormantPhoneme(a, s, 0.17, [500, 1450, 2450], null, 0.2, 186),
  zh: (a, s) => {
    playFormantPhoneme(a, s, 0.24, [270, 1900, 2600], null, 0.14, 168);
    playNoiseBurst(a, s, 0.24, 'bandpass', 2350, 2.1, 0.16, 0.02);
  },
  c_soft: (a, s) => PHONEME_SYNTH_MAP.s(a, s),
  g_soft: (a, s) => PHONEME_SYNTH_MAP.j(a, s),
  y_i: (a, s) => PHONEME_SYNTH_MAP.i_e(a, s),
  y_e: (a, s) => PHONEME_SYNTH_MAP.ee(a, s),
  y_short: (a, s) => PHONEME_SYNTH_MAP.i(a, s),
  kn: (a, s) => PHONEME_SYNTH_MAP.n(a, s),
  wr: (a, s) => PHONEME_SYNTH_MAP.r(a, s)
};

function playTone(freq, duration, type = 'sine', volume = 0.14, delay = 0) {
  const audio = getCtx();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(audio.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const AudioEngine = {
  isMuted() {
    return muted;
  },
  toggleMute() {
    muted = !muted;
    localStorage.setItem('mathcube_muted', String(muted));
    if (!muted) {
      playTone(523.25, 0.12, 'triangle', 0.12);
    }
    return muted;
  },
  pop() {
    playTone(440, 0.08, 'triangle', 0.1);
  },
  correct() {
    playTone(523.25, 0.12, 'triangle', 0.15, 0);
    playTone(659.25, 0.12, 'triangle', 0.15, 0.08);
    playTone(783.99, 0.22, 'triangle', 0.16, 0.16);
  },
  wrong() {
    playTone(260, 0.14, 'sawtooth', 0.07, 0);
    playTone(210, 0.2, 'sawtooth', 0.07, 0.11);
  },
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      playTone(n, 0.22, 'triangle', 0.15, idx * 0.1);
    });
  },
  flip() {
    playTone(587.33, 0.09, 'sine', 0.1);
  },
  magic() {
    const shimmer = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.5];
    shimmer.forEach((n, idx) => {
      playTone(n, 0.18, 'sine', 0.13, idx * 0.055);
    });
  },
  giggle() {
    [587.33, 783.99, 659.25, 880].forEach((n, idx) => {
      playTone(n, 0.1, 'triangle', 0.13, idx * 0.07);
    });
  },
  chomp() {
    playTone(340, 0.07, 'square', 0.06, 0);
    playTone(460, 0.08, 'triangle', 0.12, 0.09);
    playTone(660, 0.14, 'sine', 0.13, 0.18);
  },
  crack() {
    playTone(190, 0.08, 'sawtooth', 0.14, 0);
    playTone(130, 0.1, 'square', 0.1, 0.04);
  },
  boom() {
    playTone(150, 0.16, 'sawtooth', 0.18, 0);
    playTone(95, 0.24, 'triangle', 0.2, 0.05);
    playTone(580, 0.12, 'sine', 0.12, 0.08);
  },
  musicalChantNotes(twoBar = false) {
    // Warm, cheerful kids-song marimba + soft bass accompaniment under the phonics chant
    const audio = getCtx();
    if (!audio) return;

    const melody = twoBar
      ? [
          [523.25, 0.00, 0.24], // C5
          [659.25, 0.24, 0.24], // E5
          [783.99, 0.50, 0.28], // G5 ("sound")
          [880.00, 0.78, 0.24], // A5 (phonic 1)
          [783.99, 1.04, 0.30], // G5 (phonic 2)
          [659.25, 1.44, 0.24], // E5 (word)
          [587.33, 1.70, 0.24], // D5
          [523.25, 1.98, 0.36]  // C5
        ]
      : [
          [523.25, 0.00, 0.24], // C5
          [659.25, 0.24, 0.24], // E5
          [783.99, 0.50, 0.28], // G5
          [880.00, 0.78, 0.24], // A5 (phonic 1)
          [783.99, 1.06, 0.32], // G5 (phonic 2)
          [659.25, 1.42, 0.34]  // E5 (word)
        ];

    const bass = twoBar
      ? [
          [261.63, 0.00, 0.45], // C4
          [196.00, 0.50, 0.45], // G3
          [174.61, 1.00, 0.45], // F3
          [261.63, 1.50, 0.65]  // C4
        ]
      : [
          [261.63, 0.00, 0.48], // C4
          [196.00, 0.50, 0.48], // G3
          [261.63, 1.02, 0.62]  // C4
        ];

    melody.forEach(([freq, delay, dur]) => {
      playTone(freq, dur, 'triangle', 0.085, delay);
      playTone(freq * 2, dur * 0.6, 'sine', 0.025, delay);
    });
    bass.forEach(([freq, delay, dur]) => {
      playTone(freq, dur, 'sine', 0.065, delay);
    });
  },
  isVoiceOn() {
    return voiceOn && !muted;
  },
  toggleVoice() {
    voiceOn = !voiceOn;
    localStorage.setItem('mathcube_voice', String(voiceOn));
    if (!voiceOn && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return voiceOn;
  },
  stopSpeech() {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  },
  getAvailableVoices() {
    return getSortedEnglishVoices();
  },
  getSelectedVoiceName() {
    const active = pickKidVoice();
    return preferredVoiceName || (active ? active.name : '');
  },
  setVoiceByName(name) {
    preferredVoiceName = name || '';
    if (preferredVoiceName) localStorage.setItem(VOICE_PREF_KEY, preferredVoiceName);
    else localStorage.removeItem(VOICE_PREF_KEY);
    return pickKidVoice();
  },
  onVoicesChanged(cb) {
    if (typeof cb === 'function') voiceListeners.push(cb);
  },
  playPhoneme(key, delay = 0, boost = 4.2) {
    if (muted || !voiceOn || !key) return false;
    const norm = String(key).trim().toLowerCase().replace(/^\/|\/$/g, '');
    const fn = PHONEME_SYNTH_MAP[norm];
    if (!fn) return false;
    if (delay === 0) {
      const now = Date.now();
      if (lastPhonemeKey === norm && now - lastPhonemeTime < 120) {
        return true;
      }
      lastPhonemeKey = norm;
      lastPhonemeTime = now;
    }
    const audio = getCtx();
    if (!audio) return false;
    const start = audio.currentTime + delay;
    activePhonemeDest = createPhonemeBus(audio, start, boost);
    try {
      fn(audio, start);
      return true;
    } catch (_) {
      return false;
    } finally {
      activePhonemeDest = null;
    }
  },
  speak(text, mood = 'normal', onEnd = null, queue = false) {
    const doneCb = typeof onEnd === 'function' ? onEnd : null;
    if (muted || !voiceOn || !window.speechSynthesis || !text) {
      if (doneCb) setTimeout(doneCb, 60);
      return;
    }
    const clean = cleanForSpeech(text);
    if (!clean) {
      if (doneCb) setTimeout(doneCb, 60);
      return;
    }
    try {
      if (!queue) window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(clean);
      const voice = pickKidVoice();
      if (voice) utt.voice = voice;

      // Keep pitch at natural 1.0 and smooth natural rate so voices sound warm and human
      if (mood === 'cheer') {
        utt.rate = 0.98;
        utt.pitch = 1.02;
        utt.volume = 1.0;
      } else if (mood === 'slow') {
        utt.rate = 0.86;
        utt.pitch = 1.0;
        utt.volume = 1.0;
      } else if (mood === 'gentle') {
        utt.rate = 0.95;
        utt.pitch = 1.0;
        utt.volume = 1.0;
      } else {
        utt.rate = 0.96;
        utt.pitch = 1.0;
        utt.volume = 1.0;
      }

      if (doneCb) {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(guardId);
          doneCb();
        };
        const perChar = mood === 'slow' ? 105 : 75;
        const approxMs = Math.min(8000, Math.max(900, clean.length * perChar));
        const guardId = setTimeout(finish, approxMs);
        utt.onend = finish;
        utt.onerror = finish;
      }

      window.speechSynthesis.speak(utt);
    } catch (_) {
      if (doneCb) setTimeout(doneCb, 60);
    }
  }
};

  app.AudioEngine = AudioEngine;
})(window.KidApp = window.KidApp || {});
