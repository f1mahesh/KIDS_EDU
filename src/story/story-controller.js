/* Interactive Children's Storybook Controller — The Story of Little Ganesha */

(function (app) {
  'use strict';

  const { AudioEngine, $ } = app;

  const LOGICAL_W = 960;
  const LOGICAL_H = 540;

  const IMAGE_SOURCES = {
    mountain: './mountain.jpeg',
    shiva: './shiv%20ji.jpeg',
    parvati: './parvati.jpeg',
    youngGanesha: './ganesha%20before%20elephant.jpeg',
    babyGanesha: './ganeshsa.jpeg'
  };

  const SCENES = [
    {
      id: 1,
      heading: '✨ The Story of Little Ganesha',
      hint: '💡 Tap Baby Ganesha, the bells, or the lotus flowers!',
      text: 'Gather close, little friend, and open your heart to a magical tale from long, long ago! High above the misty clouds and snowy mountain peaks begins the wonderful story of Little Ganesha—the joyful, clever, and loving guardian of wisdom. Tap Start Story whenever you are ready!',
      narration: [
        'Gather close, little friend, and open your heart to a magical tale from long, long ago!',
        'High above the misty clouds and snowy mountain peaks begins the wonderful story of Little Ganesha, the joyful, clever, and loving guardian of wisdom.',
        'Tap Start Story whenever you are ready to begin!'
      ]
    },
    {
      id: 2,
      heading: '🌼 Parvati’s Loving Creation',
      hint: '💡 Tap the golden turmeric bowl, Parvati, or the lotus pond!',
      text: 'Once upon a time, in a sunlit palace courtyard, kind Goddess Parvati wished for a loyal little guard while she rested. She shaped bright golden turmeric paste with loving hands, whispered a gentle blessing, and—oh!—a sweet little boy came to life with bright sparkling eyes!',
      narration: [
        'Once upon a time, in a sunlit palace courtyard, kind Goddess Parvati wished for a loyal little guard while she rested.',
        'She shaped bright golden turmeric paste with loving hands, whispered a gentle blessing, and, oh! A sweet little boy came to life with bright sparkling eyes!'
      ]
    },
    {
      id: 3,
      heading: '🛡️ The Brave Little Guard',
      hint: '💡 Tap Little Ganesha to cheer him on, or ring the palace bells!',
      text: 'How proud the little boy felt! Standing tall before the grand carved palace doors, he promised his mother faithfully: “Do not worry, Mama! No one shall pass through this gate without your permission!”',
      narration: [
        'How proud the little boy felt!',
        'Standing tall before the grand carved palace doors, he promised his mother faithfully:',
        'Do not worry, Mama! No one shall pass through this gate without your permission!'
      ]
    },
    {
      id: 4,
      heading: '🏔️ Lord Shiva Arrives from the Mountains',
      hint: '💡 Tap Lord Shiva for mountain starlight, or tap Little Ganesha at the gate!',
      text: 'Far away among the glowing peaks of Mount Kailash, serene Lord Shiva finished his deep meditation and journeyed down the mountain with gentle Nandi. When he reached the palace gate, brave little Ganesha did not know this was his own father—so he politely stood his ground and said, “Please wait!”',
      narration: [
        'Far away among the glowing peaks of Mount Kailash, serene Lord Shiva finished his deep meditation and journeyed down the mountain with gentle Nandi.',
        'When he reached the palace gate, brave little Ganesha did not know this was his own father.',
        'So he politely stood his ground and said, Please wait!'
      ]
    },
    {
      id: 5,
      heading: '🌟 A Magical Transformation',
      hint: '💡 Tap the glowing star cloud or the helper carrying the sleeping baby elephant!',
      text: 'In a dazzling swirl of golden starlight, Shiva’s cosmic power lifted the little boy’s crown into the sky. Seeing Parvati’s tears, gentle Shiva comforted her at once. “Dry your tears, my dear,” he promised softly, and sent helpers north—where they returned with the blessing of a noble sleeping baby elephant.',
      narration: [
        'In a dazzling swirl of golden starlight, Shiva’s cosmic power lifted the little boy’s crown into the sky.',
        'Seeing Parvati’s tears, gentle Shiva comforted her at once.',
        'Dry your tears, my dear, he promised softly, and sent his helpers north, where they returned in a cloud of stars with the blessing of a noble sleeping baby elephant.'
      ]
    },
    {
      id: 6,
      heading: '🪷 The Blessing of Ganesha',
      hint: '💡 Tap Baby Ganesha to share sweet modaks, or tap the lotus flowers!',
      text: 'With a warm swirl of divine magic, Little Ganesha awakened with his adorable elephant head, twinkling eyes, and big gentle ears! Parvati and Shiva hugged him tight and blessed him as the Remover of Obstacles and Lord of Wisdom, celebrating with sweet modaks and showering petals!',
      narration: [
        'With a warm swirl of divine magic, Little Ganesha awakened with his adorable elephant head, twinkling eyes, and big gentle ears!',
        'Parvati and Shiva hugged him tight and blessed him as the Remover of Obstacles and Lord of Wisdom, celebrating together with sweet modaks and showering flower petals!',
        'And from that day on, Little Ganesha was loved by everyone, forever!'
      ]
    }
  ];

  /* =========================================================================
     FEMALE STORYTELLER VOICE ENGINE + MUSICAL CHIMES
  ========================================================================= */
  const FEMALE_VOICE_HINTS = [
    'ava', 'aria', 'jenny', 'emma', 'sonia', 'libby', 'samantha', 'victoria',
    'ana', 'clara', 'michelle', 'nicky', 'allison', 'karen', 'serena',
    'moira', 'tessa', 'flo', 'sandy', 'zira', 'heera', 'hazel', 'susan',
    'catherine', 'female', 'woman', 'google uk english female', 'google us english'
  ];

  const MALE_VOICE_HINTS = [
    'male', 'man', 'guy', 'andrew', 'brian', 'christopher', 'eric', 'ryan',
    'roger', 'steffan', 'liam', 'thomas', 'william', 'daniel', 'alex',
    'oliver', 'david', 'mark', 'george', 'ravi', 'fred', 'albert'
  ];

  function scoreFemaleStoryVoice(v) {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    let score = 0;

    if (lang.startsWith('en-us') || lang.startsWith('en-gb') || lang.startsWith('en-in') || lang.startsWith('en-au')) {
      score += 24;
    } else if (lang.startsWith('en')) {
      score += 12;
    } else {
      score -= 40;
    }

    if (name.includes('natural') || name.includes('neural')) score += 130;
    if (name.includes('online')) score += 55;
    if (name.includes('enhanced') || name.includes('premium')) score += 70;
    if (name.includes('female')) score += 60;

    FEMALE_VOICE_HINTS.forEach((kw, idx) => {
      if (name.includes(kw)) {
        score += (FEMALE_VOICE_HINTS.length - idx) * 4 + 36;
      }
    });

    MALE_VOICE_HINTS.forEach((bad) => {
      const re = new RegExp(`\\b${bad}\\b`, 'i');
      if (re.test(name)) score -= 180;
    });

    if (name.includes('espeak') || name.includes('compact')) score -= 90;
    return score;
  }

  function pickFemaleStoryVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const enPool = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    const pool = enPool.length ? enPool : voices;
    const sorted = [...pool].sort((a, b) => scoreFemaleStoryVoice(b) - scoreFemaleStoryVoice(a));
    return sorted[0] || null;
  }

  class StoryNarrator {
    constructor(onStateChange) {
      this.onStateChange = onStateChange;
      this.speaking = false;
      this.sessionToken = 0;
      this.timerId = null;

      if (window.speechSynthesis && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          pickFemaleStoryVoice();
        });
      }
    }

    stop() {
      this.sessionToken += 1;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
      if (this.speaking) {
        this.speaking = false;
        this.onStateChange(false);
      }
    }

    speakLines(lines, isMutedFn) {
      this.stop();
      if (isMutedFn() || !window.speechSynthesis || !lines || !lines.length) return;

      const token = ++this.sessionToken;
      const voice = pickFemaleStoryVoice();
      this.speaking = true;
      this.onStateChange(true);

      let idx = 0;
      const speakNext = () => {
        if (token !== this.sessionToken || isMutedFn()) {
          this.stop();
          return;
        }
        if (idx >= lines.length) {
          this.speaking = false;
          this.onStateChange(false);
          return;
        }

        const sentence = lines[idx++];
        try {
          const utt = new SpeechSynthesisUtterance(sentence);
          if (voice) utt.voice = voice;
          utt.rate = 0.91;  // Gentle, expressive storytelling cadence
          utt.pitch = 1.07; // Warm female storyteller tone
          utt.volume = 1.0;

          let done = false;
          const finishSentence = () => {
            if (done) return;
            done = true;
            if (token !== this.sessionToken) return;
            this.timerId = setTimeout(speakNext, 260);
          };

          const safetyMs = Math.min(14000, Math.max(1800, sentence.length * 95));
          const guard = setTimeout(finishSentence, safetyMs);
          utt.onend = () => {
            clearTimeout(guard);
            finishSentence();
          };
          utt.onerror = () => {
            clearTimeout(guard);
            finishSentence();
          };

          window.speechSynthesis.speak(utt);
        } catch (_) {
          this.stop();
        }
      };

      speakNext();
    }
  }

  class StorySoundEngine {
    constructor() {
      this.ctx = null;
      this.localMuted = false;
    }

    isMuted() {
      return this.localMuted || (AudioEngine && AudioEngine.isMuted());
    }

    ensureContext() {
      if (this.isMuted()) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    toggleMute() {
      this.localMuted = !this.localMuted;
      if (!this.localMuted) {
        this.ensureContext();
        this.playSparkle();
      }
      return this.localMuted;
    }

    playTone(freq, startOffset, duration, type = 'sine', volume = 0.08) {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + startOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    }

    playPageChime() {
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this.playTone(n, idx * 0.07, 0.55, 'sine', 0.055);
        this.playTone(n * 2, idx * 0.07, 0.25, 'triangle', 0.014);
      });
    }

    playSparkle() {
      const notes = [880, 1046.5, 1318.5, 1567.98];
      notes.forEach((n, idx) => {
        this.playTone(n, idx * 0.055, 0.36, 'sine', 0.045);
      });
    }

    playGaneshaJoy() {
      this.playTone(587.33, 0, 0.16, 'triangle', 0.06);
      this.playTone(783.99, 0.09, 0.22, 'sine', 0.07);
      this.playTone(1046.5, 0.19, 0.35, 'sine', 0.055);
    }

    playBell() {
      this.playTone(440, 0, 1.15, 'sine', 0.075);
      this.playTone(880, 0, 0.75, 'sine', 0.035);
      this.playTone(1056, 0, 0.5, 'triangle', 0.02);
    }

    playMagicBurst() {
      const chord = [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66];
      chord.forEach((n, idx) => {
        this.playTone(n, idx * 0.045, 0.9, 'sine', 0.045);
      });
    }

    playCelebration() {
      const melody = [
        { f: 523.25, t: 0.0, d: 0.35 },
        { f: 659.25, t: 0.12, d: 0.35 },
        { f: 783.99, t: 0.24, d: 0.38 },
        { f: 880.0, t: 0.36, d: 0.42 },
        { f: 1046.5, t: 0.50, d: 0.85 },
        { f: 1318.51, t: 0.64, d: 0.9 }
      ];
      melody.forEach((m) => {
        this.playTone(m.f, m.t, m.d, 'sine', 0.06);
        this.playTone(m.f * 1.5, m.t, m.d * 0.6, 'triangle', 0.018);
      });
    }
  }

  /* =========================================================================
     CHARACTER CUTOUT PROCESSOR (REMOVES SOLID WHITE/GRAY BACKGROUNDS)
  ========================================================================= */
  function createCutoutCanvas(img, tolerance = 42, feather = 24) {
    try {
      const maxDim = 680;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, w, h);

      const imgData = octx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample exterior corner color (works for pure white & soft studio gray)
      const cornerIdx = (2 * w + 2) * 4;
      const bgR = data[cornerIdx];
      const bgG = data[cornerIdx + 1];
      const bgB = data[cornerIdx + 2];

      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      const enqueue = (px, py) => {
        const pos = py * w + px;
        if (visited[pos]) return;
        const i = pos * 4;
        const dist = Math.max(
          Math.abs(data[i] - bgR),
          Math.abs(data[i + 1] - bgG),
          Math.abs(data[i + 2] - bgB)
        );
        if (dist <= tolerance + feather) {
          visited[pos] = 1;
          queue[tail++] = pos;
        }
      };

      for (let x = 0; x < w; x++) {
        enqueue(x, 0);
        enqueue(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        enqueue(0, y);
        enqueue(w - 1, y);
      }

      while (head < tail) {
        const pos = queue[head++];
        const i = pos * 4;
        const dist = Math.max(
          Math.abs(data[i] - bgR),
          Math.abs(data[i + 1] - bgG),
          Math.abs(data[i + 2] - bgB)
        );

        if (dist <= tolerance) {
          data[i + 3] = 0;
        } else {
          const alphaFrac = (dist - tolerance) / feather;
          data[i + 3] = Math.round(data[i + 3] * Math.min(1, Math.max(0, alphaFrac)));
          continue; // stop expanding past feathered boundary
        }

        const x = pos % w;
        const y = (pos / w) | 0;
        if (x > 0) enqueue(x - 1, y);
        if (x < w - 1) enqueue(x + 1, y);
        if (y > 0) enqueue(x, y - 1);
        if (y < h - 1) enqueue(x, y + 1);
      }

      octx.putImageData(imgData, 0, 0);
      return { drawable: off, width: w, height: h, hasCutout: true };
    } catch (_) {
      // Fallback on file:// where getImageData is restricted
      return {
        drawable: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        hasCutout: false
      };
    }
  }

  /* =========================================================================
     PROCEDURAL CANVAS PROPS & FRAMES
  ========================================================================= */
  function roundRectPath(c, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rad, y);
    c.lineTo(x + w - rad, y);
    c.quadraticCurveTo(x + w, y, x + w, y + rad);
    c.lineTo(x + w, y + h - rad);
    c.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    c.lineTo(x + rad, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - rad);
    c.lineTo(x, y + rad);
    c.quadraticCurveTo(x, y, x + rad, y);
    c.closePath();
  }

  function drawFourPointStar(c, x, y, r, color, alpha = 1) {
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, alpha));
    c.translate(x, y);
    c.fillStyle = color;
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? r : r * 0.34;
      const a = (i * Math.PI) / 4;
      if (i === 0) c.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    c.closePath();
    c.fill();
    c.restore();
  }

  function drawCloud(c, x, y, scale, alpha = 0.85, tint = '#fffaf0') {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    c.globalAlpha = alpha;
    c.fillStyle = tint;
    c.beginPath();
    c.arc(0, 0, 26, 0, Math.PI * 2);
    c.arc(26, -6, 22, 0, Math.PI * 2);
    c.arc(-25, -3, 20, 0, Math.PI * 2);
    c.arc(44, 6, 16, 0, Math.PI * 2);
    c.arc(-42, 7, 15, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function drawLotus(c, x, y, scale, t, bloomBoost = 0, phase = 0) {
    const sway = Math.sin(t * 1.6 + phase) * 0.05;
    const openFactor = 1 + bloomBoost * 0.36;

    c.save();
    c.translate(x, y);
    c.scale(scale, scale);

    c.fillStyle = '#2e8b57';
    c.beginPath();
    c.ellipse(0, 12, 34, 10, 0, 0.25, Math.PI * 1.9);
    c.lineTo(0, 12);
    c.closePath();
    c.fill();
    c.strokeStyle = '#48b074';
    c.lineWidth = 1.5;
    c.stroke();

    c.rotate(sway);

    if (bloomBoost > 0.05) {
      const glow = c.createRadialGradient(0, -6, 4, 0, -6, 44);
      glow.addColorStop(0, `rgba(255, 224, 120, ${0.45 * bloomBoost})`);
      glow.addColorStop(1, 'rgba(255, 224, 120, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, -6, 44, 0, Math.PI * 2);
      c.fill();
    }

    [-0.72, -0.38, 0.38, 0.72].forEach((a) => {
      c.save();
      c.rotate(a * openFactor);
      const grad = c.createLinearGradient(0, 6, 0, -32);
      grad.addColorStop(0, '#d8437f');
      grad.addColorStop(1, '#ff9ec4');
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(0, 6);
      c.quadraticCurveTo(-13, -12, 0, -32);
      c.quadraticCurveTo(13, -12, 0, 6);
      c.fill();
      c.restore();
    });

    [-0.22, 0, 0.22].forEach((a, idx) => {
      c.save();
      c.rotate(a * openFactor);
      const grad = c.createLinearGradient(0, 6, 0, -34);
      grad.addColorStop(0, '#eb5e98');
      grad.addColorStop(1, '#ffd6e8');
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(0, 6);
      c.quadraticCurveTo(-11, -14, 0, idx === 1 ? -35 : -30);
      c.quadraticCurveTo(11, -14, 0, 6);
      c.fill();
      c.restore();
    });

    c.fillStyle = '#ffd35c';
    c.beginPath();
    c.arc(0, -8, 4.5 + bloomBoost * 2.5, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function drawModak(c, x, y, scale = 1, rot = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(scale, scale);

    const grad = c.createLinearGradient(-12, -14, 12, 14);
    grad.addColorStop(0, '#fff4d6');
    grad.addColorStop(0.55, '#f7c774');
    grad.addColorStop(1, '#e29837');

    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(0, -18);
    c.bezierCurveTo(9, -11, 17, -1, 15, 8);
    c.quadraticCurveTo(12, 15, 0, 15);
    c.quadraticCurveTo(-12, 15, -15, 8);
    c.bezierCurveTo(-17, -1, -9, -11, 0, -18);
    c.fill();

    c.strokeStyle = 'rgba(182, 111, 20, 0.55)';
    c.lineWidth = 1.4;
    [-7, 0, 7].forEach((ox) => {
      c.beginPath();
      c.moveTo(0, -16);
      c.quadraticCurveTo(ox * 1.4, 0, ox, 13);
      c.stroke();
    });

    c.fillStyle = '#e65100';
    c.beginPath();
    c.arc(0, -16, 1.8, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function drawHangingBell(c, x, y, scale, t, swingBoost = 0) {
    const swing = Math.sin(t * (2.2 + swingBoost * 5)) * (0.06 + swingBoost * 0.22);
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    c.rotate(swing);

    c.strokeStyle = '#f2c14e';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, 26);
    c.stroke();

    const bellGrad = c.createLinearGradient(-16, 26, 16, 62);
    bellGrad.addColorStop(0, '#ffe596');
    bellGrad.addColorStop(0.5, '#e0a52c');
    bellGrad.addColorStop(1, '#9c6610');
    c.fillStyle = bellGrad;
    c.beginPath();
    c.moveTo(0, 25);
    c.quadraticCurveTo(13, 29, 14, 48);
    c.lineTo(19, 58);
    c.quadraticCurveTo(0, 63, -19, 58);
    c.lineTo(-14, 48);
    c.quadraticCurveTo(-13, 29, 0, 25);
    c.fill();

    c.fillStyle = '#ffd35c';
    c.beginPath();
    c.arc(0, 61, 4.5, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function drawDiya(c, x, y, scale, t) {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    const flicker = Math.sin(t * 11 + x) * 1.4;

    const glow = c.createRadialGradient(0, -12, 2, 0, -12, 34);
    glow.addColorStop(0, 'rgba(255, 222, 110, 0.7)');
    glow.addColorStop(1, 'rgba(255, 170, 50, 0)');
    c.fillStyle = glow;
    c.beginPath();
    c.arc(0, -12, 34, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#b85c2b';
    c.beginPath();
    c.moveTo(-18, 0);
    c.quadraticCurveTo(0, 14, 18, 0);
    c.quadraticCurveTo(0, 4, -18, 0);
    c.fill();

    c.fillStyle = '#ff8c1a';
    c.beginPath();
    c.moveTo(0, -2);
    c.quadraticCurveTo(-8, -11, flicker * 0.4, -22 - flicker * 0.3);
    c.quadraticCurveTo(8, -11, 0, -2);
    c.fill();

    c.fillStyle = '#fff5b5';
    c.beginPath();
    c.moveTo(0, -3);
    c.quadraticCurveTo(-4, -9, flicker * 0.25, -16);
    c.quadraticCurveTo(4, -9, 0, -3);
    c.fill();

    c.restore();
  }

  function drawCrown(c, x, y, scale = 1) {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    const gold = c.createLinearGradient(-18, -28, 18, 4);
    gold.addColorStop(0, '#fff2a6');
    gold.addColorStop(0.5, '#f2b830');
    gold.addColorStop(1, '#b87a14');
    c.fillStyle = gold;

    roundRectPath(c, -22, -4, 44, 10, 5);
    c.fill();

    c.beginPath();
    c.moveTo(-17, -4);
    c.quadraticCurveTo(-13, -24, 0, -34);
    c.quadraticCurveTo(13, -24, 17, -4);
    c.closePath();
    c.fill();

    c.beginPath();
    c.arc(0, -37, 4, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#e53935';
    c.beginPath();
    c.arc(0, -14, 4.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffcdd2';
    c.beginPath();
    c.arc(-1.3, -15.4, 1.5, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function drawPalaceArchFrame(c, t, bellBoost, fullOrnate = true) {
    c.save();
    if (fullOrnate) {
      const pillarGrad = c.createLinearGradient(0, 0, 74, 0);
      pillarGrad.addColorStop(0, '#7c3f26');
      pillarGrad.addColorStop(0.6, '#b5693d');
      pillarGrad.addColorStop(1, '#df9e67');

      c.fillStyle = pillarGrad;
      c.fillRect(0, 0, 64, LOGICAL_H);
      c.fillRect(LOGICAL_W - 64, 0, 64, LOGICAL_H);

      c.fillStyle = '#ffd35c';
      [75, 220, 440].forEach((py) => {
        c.fillRect(6, py, 52, 8);
        c.fillRect(LOGICAL_W - 58, py, 52, 8);
      });

      const archGrad = c.createLinearGradient(0, 0, 0, 128);
      archGrad.addColorStop(0, '#5e1f2d');
      archGrad.addColorStop(1, '#94353e');
      c.fillStyle = archGrad;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(LOGICAL_W, 0);
      c.lineTo(LOGICAL_W, 130);
      c.lineTo(LOGICAL_W - 64, 130);
      c.quadraticCurveTo(840, 70, 760, 72);
      c.quadraticCurveTo(680, 40, 595, 45);
      c.quadraticCurveTo(530, 18, 480, 14);
      c.quadraticCurveTo(430, 18, 365, 45);
      c.quadraticCurveTo(280, 40, 200, 72);
      c.quadraticCurveTo(120, 70, 64, 130);
      c.lineTo(0, 130);
      c.closePath();
      c.fill();

      c.strokeStyle = '#ffd35c';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(64, 130);
      c.quadraticCurveTo(120, 70, 200, 72);
      c.quadraticCurveTo(280, 40, 365, 45);
      c.quadraticCurveTo(430, 18, 480, 14);
      c.quadraticCurveTo(530, 18, 595, 45);
      c.quadraticCurveTo(680, 40, 760, 72);
      c.quadraticCurveTo(840, 70, LOGICAL_W - 64, 130);
      c.stroke();

      const marigoldPositions = [110, 140, 175, 225, 260, 300, 660, 700, 735, 785, 820, 850];
      marigoldPositions.forEach((mx, idx) => {
        const my = mx < 480
          ? 100 - (mx - 110) * 0.22 + Math.sin(idx) * 8
          : 58 + (mx - 660) * 0.22 + Math.sin(idx) * 8;
        c.fillStyle = idx % 2 === 0 ? '#ffb300' : '#ff6f00';
        c.beginPath();
        c.arc(mx, my, 9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffe082';
        c.beginPath();
        c.arc(mx - 2, my - 2, 3, 0, Math.PI * 2);
        c.fill();
      });

      drawHangingBell(c, 128, 96, 0.85, t, bellBoost);
      drawHangingBell(c, LOGICAL_W - 128, 96, 0.85, t + 0.8, bellBoost);
    } else {
      c.strokeStyle = 'rgba(255, 211, 92, 0.72)';
      c.lineWidth = 3;
      roundRectPath(c, 12, 12, LOGICAL_W - 24, LOGICAL_H - 24, 16);
      c.stroke();
    }
    c.restore();
  }

  /* =========================================================================
     STORY CONTROLLER
  ========================================================================= */
  class StoryController {
    constructor({ showView }) {
      this.showView = showView;
      this.canvas = $('story-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.sound = new StorySoundEngine();

      this.startBtn = $('btn-story-start');
      this.prevBtn = $('btn-story-prev');
      this.nextBtn = $('btn-story-next');
      this.replayBtn = $('btn-story-replay');
      this.muteBtn = $('btn-story-mute');
      this.muteIcon = $('story-mute-icon');
      this.muteLabel = $('story-mute-label');
      this.speakBtn = $('btn-story-speak');
      this.pageBadge = $('story-page-badge');
      this.headingEl = $('story-scene-heading');
      this.hintEl = $('story-interact-hint');
      this.textEl = $('story-text');
      this.dotStrip = $('story-dot-strip');

      this.narrator = new StoryNarrator((isSpeaking) => this._syncSpeakBtn(isSpeaking));
      this.assets = {};
      this.rafId = null;

      this.state = {
        scene: 0,
        time: 0,
        lastTimestamp: 0,
        transitionAlpha: 1,
        ganeshaAction: 0,
        shivaAction: 0,
        parvatiAction: 0,
        bellAction: 0,
        magicAction: 0,
        lotusBlooms: [0, 0, 0],
        ambientMotes: [],
        burstParticles: [],
        petals: [],
        stars: [],
        hitRegions: []
      };

      this._loadImages();
      this._initParticles();
      this._buildDots();
      this._bindEvents();
      this._resizeCanvasHiDPI();
      this._syncSceneUI(0, true);
    }

    _loadImages() {
      if (typeof Image === 'undefined') return;
      Object.entries(IMAGE_SOURCES).forEach(([key, src]) => {
        const img = new Image();
        img.onload = () => {
          if (key === 'shiva' || key === 'babyGanesha') {
            this.assets[key] = createCutoutCanvas(img, 36, 22);
          } else if (key === 'youngGanesha') {
            this.assets[key] = createCutoutCanvas(img, 42, 24);
          } else {
            this.assets[key] = {
              drawable: img,
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
              hasCutout: false
            };
          }
        };
        img.src = src;
      });
    }

    _initParticles() {
      this.state.stars = Array.from({ length: 48 }, () => ({
        x: Math.random() * LOGICAL_W,
        y: Math.random() * 290,
        r: 0.9 + Math.random() * 1.9,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 2.2
      }));

      this.state.ambientMotes = Array.from({ length: 28 }, () => ({
        x: Math.random() * LOGICAL_W,
        y: Math.random() * LOGICAL_H,
        vx: (Math.random() - 0.5) * 14,
        vy: -8 - Math.random() * 14,
        r: 1.6 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2
      }));

      this.state.petals = Array.from({ length: 24 }, (_, i) => ({
        x: Math.random() * LOGICAL_W,
        y: Math.random() * LOGICAL_H,
        vy: 24 + Math.random() * 26,
        vx: (Math.random() - 0.5) * 18,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 2.4,
        size: 6 + Math.random() * 5,
        kind: i % 4 === 0 ? 'modak' : (i % 2 === 0 ? 'pink' : 'gold')
      }));
    }

    _resizeCanvasHiDPI() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = LOGICAL_W * dpr;
      this.canvas.height = LOGICAL_H * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    _spawnBurst(x, y, count = 16, palette = ['#ffd35c', '#ff8ab8', '#fff5b8']) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 45 + Math.random() * 115;
        this.state.burstParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 24,
          life: 1,
          decay: 0.75 + Math.random() * 0.55,
          size: 4 + Math.random() * 6,
          color: palette[i % palette.length],
          star: i % 2 === 0
        });
      }
    }

    _buildDots() {
      this.dotStrip.innerHTML = '';
      SCENES.forEach((sc, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'story-scene-dot';
        btn.setAttribute('aria-label', `Go to Scene ${idx + 1}: ${sc.heading}`);
        btn.addEventListener('click', () => this.goToScene(idx));
        this.dotStrip.appendChild(btn);
      });
    }

    _bindEvents() {
      window.addEventListener('resize', () => this._resizeCanvasHiDPI());

      this.startBtn.addEventListener('click', () => this.goToScene(1));
      this.prevBtn.addEventListener('click', () => this.goToScene(this.state.scene - 1));
      this.nextBtn.addEventListener('click', () => this.goToScene(this.state.scene + 1));
      this.replayBtn.addEventListener('click', () => this.goToScene(0, true));

      this.muteBtn.addEventListener('click', () => {
        const muted = this.sound.toggleMute();
        if (muted) this.narrator.stop();
        this._syncMuteUI(muted);
      });

      if (this.speakBtn) {
        this.speakBtn.addEventListener('click', () => {
          if (this.narrator.speaking) {
            this.narrator.stop();
          } else {
            this.speakCurrentScene();
          }
        });
      }

      this.canvas.addEventListener('pointermove', (evt) => {
        const pt = this._toLogicalCoords(evt);
        const hit = this._findHit(pt.x, pt.y);
        this.canvas.style.cursor = hit ? 'pointer' : 'default';
      });

      this.canvas.addEventListener('pointerdown', (evt) => {
        const pt = this._toLogicalCoords(evt);
        const hit = this._findHit(pt.x, pt.y);
        if (!hit) {
          this._spawnBurst(pt.x, pt.y, 7, ['#ffe57f', '#ffffff']);
          this.sound.playSparkle();
          return;
        }

        if (hit.type === 'ganesha' || hit.type === 'modak') {
          this.state.ganeshaAction = 1;
          this._spawnBurst(hit.x, hit.y - 18, 18, ['#ffd35c', '#ff8ab8', '#fff7c2']);
          this.sound.playGaneshaJoy();
        } else if (hit.type === 'lotus') {
          this.state.lotusBlooms[hit.idx] = 1;
          this._spawnBurst(hit.x, hit.y - 14, 14, ['#ff9ec4', '#ffd35c', '#ffffff']);
          this.sound.playSparkle();
        } else if (hit.type === 'bell') {
          this.state.bellAction = 1;
          this._spawnBurst(hit.x, hit.y, 12, ['#ffd35c', '#fff5b8']);
          this.sound.playBell();
        } else if (hit.type === 'shiva') {
          this.state.shivaAction = 1;
          this._spawnBurst(hit.x, hit.y - 24, 18, ['#90caf9', '#e1f5fe', '#ffffff']);
          this.sound.playMagicBurst();
        } else if (hit.type === 'parvati' || hit.type === 'turmeric' || hit.type === 'magic') {
          this.state.parvatiAction = 1;
          this.state.magicAction = 1;
          this.state.ganeshaAction = 0.85;
          this._spawnBurst(hit.x, hit.y - 12, 20, ['#ffe57f', '#ffab91', '#ffffff']);
          this.sound.playMagicBurst();
        }
      });
    }

    _syncMuteUI(muted = this.sound.isMuted()) {
      this.muteBtn.classList.toggle('muted', muted);
      this.muteBtn.setAttribute('aria-pressed', String(muted));
      this.muteIcon.textContent = muted ? '🔇' : '🔊';
      this.muteLabel.textContent = muted ? 'Muted' : 'Sound On';
    }

    _syncSpeakBtn(isSpeaking) {
      if (!this.speakBtn) return;
      this.speakBtn.classList.toggle('speaking', isSpeaking);
      this.speakBtn.textContent = isSpeaking ? '⏹️ Pause Voice' : '🗣️ Tell Story';
    }

    _syncSceneUI(index, silent = false) {
      const clamped = Math.max(0, Math.min(SCENES.length - 1, index));
      this.state.scene = clamped;
      this.state.transitionAlpha = silent ? 1 : 0.15;
      this.state.burstParticles = [];
      this.state.ganeshaAction = 0;
      this.state.shivaAction = 0;
      this.state.parvatiAction = 0;
      this.state.bellAction = 0;
      this.state.magicAction = 0;
      this.state.lotusBlooms = [0, 0, 0];

      const data = SCENES[clamped];
      this.pageBadge.textContent = `Scene ${clamped + 1} of ${SCENES.length}`;
      this.headingEl.textContent = data.heading;
      this.hintEl.textContent = data.hint;
      this.textEl.textContent = data.text;

      this.startBtn.classList.toggle('hidden', clamped !== 0);
      this.prevBtn.disabled = clamped === 0;
      this.nextBtn.disabled = clamped === SCENES.length - 1;
      this.replayBtn.classList.toggle('highlight', clamped === SCENES.length - 1);

      Array.from(this.dotStrip.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === clamped);
      });
    }

    speakCurrentScene() {
      const data = SCENES[this.state.scene];
      if (!data) return;
      this.narrator.speakLines(data.narration, () => this.sound.isMuted());
    }

    open() {
      if (AudioEngine) AudioEngine.pop();
      this.showView('story');
      this._resizeCanvasHiDPI();
      this._syncMuteUI();
      this.state.lastTimestamp = 0;
      if (!this.rafId) {
        this.rafId = requestAnimationFrame((ts) => this._renderFrame(ts));
      }
      this.speakCurrentScene();
    }

    stopIfInactive(viewName) {
      if (viewName !== 'story') {
        this.narrator.stop();
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }
    }

    handleKey(key) {
      if (key === 'ArrowRight' && this.state.scene < SCENES.length - 1) {
        this.goToScene(this.state.scene + 1);
      } else if (key === 'ArrowLeft' && this.state.scene > 0) {
        this.goToScene(this.state.scene - 1);
      }
    }

    goToScene(index, isReplay = false) {
      const clamped = Math.max(0, Math.min(SCENES.length - 1, index));
      this._syncSceneUI(clamped, false);

      if (isReplay) {
        this.sound.playPageChime();
      } else if (clamped === 5) {
        this.sound.playCelebration();
        this._spawnBurst(480, 260, 26, ['#ffd35c', '#ff8ab8', '#fff5b8']);
      } else if (clamped === 4) {
        this.sound.playMagicBurst();
      } else {
        this.sound.playPageChime();
      }

      this.speakCurrentScene();
    }

    _toLogicalCoords(evt) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((evt.clientX - rect.left) / rect.width) * LOGICAL_W,
        y: ((evt.clientY - rect.top) / rect.height) * LOGICAL_H
      };
    }

    _findHit(x, y) {
      for (const r of this.state.hitRegions) {
        const dx = x - r.x;
        const dy = y - r.y;
        if (dx * dx + dy * dy <= r.r * r.r) return r;
      }
      return null;
    }

    /* =========================================================================
       SHARED CHARACTER PHOTO DRAWING HELPERS (ANIMATED + BLENDED)
    ========================================================================= */
    _drawMountainBackdrop(c, t, alpha = 1, yShift = 0) {
      const asset = this.assets.mountain;
      if (!asset || !asset.drawable) return false;
      const w = asset.width;
      const h = asset.height;
      // Crop cleanly inside screenshot corner UI icons
      const sx = w * 0.04;
      const sy = h * 0.075;
      const sw = w * 0.92;
      const sh = h * 0.84;
      const gentlePan = Math.sin(t * 0.25) * 6;

      c.save();
      c.globalAlpha = alpha;
      c.drawImage(asset.drawable, sx, sy, sw, sh, gentlePan - 10, yShift, LOGICAL_W + 20, LOGICAL_H - yShift);
      c.restore();
      return true;
    }

    _drawCutoutCharacter(c, assetKey, cx, cy, targetH, t, bobAmp = 3, actionBoost = 0, glowColor = 'rgba(255, 224, 118, 0.45)', flipX = false) {
      const asset = this.assets[assetKey];
      if (!asset || !asset.drawable || !asset.height) return false;

      const aspect = asset.width / asset.height;
      const drawH = targetH;
      const drawW = drawH * aspect;
      const bob = Math.sin(t * 2.4) * bobAmp + Math.sin(actionBoost * Math.PI) * -10;
      const tilt = actionBoost > 0.05 ? Math.sin(actionBoost * Math.PI * 3) * 0.045 : 0;

      c.save();
      c.translate(cx, cy + bob);
      c.rotate(tilt);
      if (flipX) c.scale(-1, 1);

      // Warm divine halo behind character
      const halo = c.createRadialGradient(0, 0, drawW * 0.14, 0, 0, Math.max(drawW, drawH) * 0.62);
      halo.addColorStop(0, glowColor);
      halo.addColorStop(1, 'rgba(255, 224, 118, 0)');
      c.fillStyle = halo;
      c.beginPath();
      c.arc(0, 0, Math.max(drawW, drawH) * 0.62, 0, Math.PI * 2);
      c.fill();

      if (asset.hasCutout) {
        c.drawImage(asset.drawable, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        // Safe oval vignette fallback when running over file://
        c.beginPath();
        c.ellipse(0, 0, drawW * 0.44, drawH * 0.47, 0, 0, Math.PI * 2);
        c.clip();
        c.drawImage(asset.drawable, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      c.restore();
      return true;
    }

    _drawParvatiPortrait(c, cx, cy, targetH, t, pose = 'warm', actionBoost = 0) {
      const asset = this.assets.parvati;
      if (!asset || !asset.drawable || !asset.height) return false;

      const aspect = asset.width / asset.height;
      const drawH = targetH;
      const drawW = drawH * aspect;
      const bob = Math.sin(t * 2.0 + 0.6) * 2.6 + Math.sin(actionBoost * Math.PI) * -6;

      c.save();
      c.translate(cx, cy + bob);

      // Glowing golden lotus aura
      const aura = c.createRadialGradient(0, -10, drawW * 0.15, 0, -10, drawH * 0.64);
      aura.addColorStop(0, pose === 'sad' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(255, 214, 118, 0.58)');
      aura.addColorStop(1, 'rgba(255, 214, 118, 0)');
      c.fillStyle = aura;
      c.beginPath();
      c.arc(0, -10, drawH * 0.64, 0, Math.PI * 2);
      c.fill();

      // Ornate Indian arched medallion frame
      c.save();
      c.beginPath();
      c.ellipse(0, 0, drawW * 0.44, drawH * 0.48, 0, 0, Math.PI * 2);
      c.clip();
      c.drawImage(asset.drawable, -drawW / 2, -drawH / 2, drawW, drawH);

      if (pose === 'sad') {
        c.fillStyle = 'rgba(28, 36, 92, 0.22)';
        c.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
      }
      c.restore();

      // Golden filigree rim
      c.strokeStyle = '#ffd35c';
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(0, 0, drawW * 0.44, drawH * 0.48, 0, 0, Math.PI * 2);
      c.stroke();

      c.restore();
      return true;
    }

    _drawStarsAndSky(c, topColor, midColor, botColor, t, starOpacity = 0.8) {
      const sky = c.createLinearGradient(0, 0, 0, LOGICAL_H);
      sky.addColorStop(0, topColor);
      sky.addColorStop(0.55, midColor);
      sky.addColorStop(1, botColor);
      c.fillStyle = sky;
      c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      if (starOpacity > 0) {
        this.state.stars.forEach((s) => {
          const tw = 0.45 + 0.55 * Math.sin(t * s.speed + s.phase);
          c.fillStyle = `rgba(255, 248, 200, ${tw * starOpacity})`;
          c.beginPath();
          c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          c.fill();
        });
      }
    }

    _renderScene1(c, t) {
      this._drawStarsAndSky(c, '#14164a', '#3d296e', '#e68567', t, 0.85);
      // Blend Himalayan mountain vista softly in background
      this._drawMountainBackdrop(c, t, 0.42, 0);

      drawCloud(c, ((t * 14) % 1120) - 80, 145, 0.95, 0.25, '#ffd4b8');
      drawCloud(c, ((t * 10 + 480) % 1120) - 80, 195, 0.8, 0.22, '#ffe5c4');

      const floor = c.createLinearGradient(0, 405, 0, LOGICAL_H);
      floor.addColorStop(0, 'rgba(49, 72, 122, 0.92)');
      floor.addColorStop(1, '#18244a');
      c.fillStyle = floor;
      c.fillRect(0, 405, LOGICAL_W, 135);

      drawLotus(c, 480, 412, 2.25, t, this.state.lotusBlooms[0], 0);
      this._drawCutoutCharacter(c, 'babyGanesha', 480, 278, 275, t, 4, this.state.ganeshaAction, 'rgba(255, 224, 118, 0.65)');

      drawLotus(c, 190, 462, 1.05, t, this.state.lotusBlooms[1], 1.2);
      drawLotus(c, 770, 462, 1.05, t, this.state.lotusBlooms[2], 2.4);
      drawDiya(c, 118, 432, 1.05, t);
      drawDiya(c, 842, 432, 1.05, t);

      drawPalaceArchFrame(c, t, this.state.bellAction, true);

      c.save();
      const bannerGrad = c.createLinearGradient(255, 52, 705, 118);
      bannerGrad.addColorStop(0, '#fff5d6');
      bannerGrad.addColorStop(0.5, '#ffe69e');
      bannerGrad.addColorStop(1, '#fff5d6');
      c.fillStyle = bannerGrad;
      c.strokeStyle = '#c98614';
      c.lineWidth = 3;
      roundRectPath(c, 255, 52, 450, 58, 29);
      c.fill();
      c.stroke();

      c.fillStyle = '#2b1647';
      c.textAlign = 'center';
      c.font = 'bold 29px Georgia, serif';
      c.fillText('The Story of Little Ganesha', 480, 90);
      c.restore();

      this.state.hitRegions = [
        { type: 'ganesha', x: 480, y: 278, r: 115 },
        { type: 'bell', x: 128, y: 135, r: 42 },
        { type: 'bell', x: 832, y: 135, r: 42 },
        { type: 'lotus', idx: 1, x: 190, y: 455, r: 48 },
        { type: 'lotus', idx: 2, x: 770, y: 455, r: 48 }
      ];
    }

    _renderScene2(c, t) {
      this._drawStarsAndSky(c, '#ffb78c', '#ffdcb8', '#fff3db', t, 0);
      drawCloud(c, ((t * 16 + 120) % 1120) - 80, 88, 0.9, 0.85, '#ffffff');
      drawCloud(c, ((t * 11 + 600) % 1120) - 80, 122, 0.72, 0.75, '#fff8eb');

      c.fillStyle = '#f2d3ae';
      c.fillRect(0, 0, LOGICAL_W, 56);
      c.fillStyle = '#e2b887';
      c.fillRect(68, 48, 44, 330);
      c.fillRect(LOGICAL_W - 112, 48, 44, 330);

      const marble = c.createLinearGradient(0, 365, 0, LOGICAL_H);
      marble.addColorStop(0, '#f9ead7');
      marble.addColorStop(1, '#dec2a2');
      c.fillStyle = marble;
      c.fillRect(0, 365, LOGICAL_W, 175);

      // Turquoise lotus pool on right
      const pool = c.createRadialGradient(735, 455, 25, 735, 455, 195);
      pool.addColorStop(0, '#4dd0e1');
      pool.addColorStop(1, '#00838f');
      c.fillStyle = pool;
      c.beginPath();
      c.ellipse(735, 455, 185, 58, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#e6cfa8';
      c.lineWidth = 6;
      c.stroke();

      c.strokeStyle = 'rgba(255,255,255,0.4)';
      c.lineWidth = 1.6;
      const rip = (t * 22) % 40;
      c.beginPath();
      c.ellipse(715, 452, 22 + rip, 7 + rip * 0.28, 0, 0, Math.PI * 2);
      c.stroke();

      drawLotus(c, 675, 444, 0.92, t, this.state.lotusBlooms[0], 0.5);
      drawLotus(c, 792, 464, 1.0, t, this.state.lotusBlooms[1], 1.7);

      // Golden turmeric paste bowl
      c.save();
      c.translate(412, 405);
      const bowlGlow = c.createRadialGradient(0, -10, 4, 0, -10, 44);
      bowlGlow.addColorStop(0, `rgba(255, 220, 80, ${0.55 + this.state.magicAction * 0.4})`);
      bowlGlow.addColorStop(1, 'rgba(255, 220, 80, 0)');
      c.fillStyle = bowlGlow;
      c.beginPath();
      c.arc(0, -10, 44, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#ffd54f';
      c.beginPath();
      c.ellipse(0, -4, 30, 10, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#d99b26';
      c.beginPath();
      c.moveTo(-31, -4);
      c.quadraticCurveTo(0, 30, 31, -4);
      c.closePath();
      c.fill();
      c.restore();

      // Golden breath-of-life ribbons flowing from Parvati to Young Ganesha
      for (let i = 0; i < 10; i++) {
        const prog = (t * 0.55 + i / 10) % 1;
        const px = 315 + prog * 235;
        const py = 265 - Math.sin(prog * Math.PI) * 44 + Math.sin(t * 4 + i) * 6;
        drawFourPointStar(c, px, py, 5 + Math.sin(prog * Math.PI) * 4.5, '#ffe57f', 0.92);
      }

      this._drawParvatiPortrait(c, 228, 265, 285, t, 'warm', this.state.parvatiAction);
      this._drawCutoutCharacter(c, 'youngGanesha', 605, 280, 265, t, 4, this.state.ganeshaAction, 'rgba(255, 224, 92, 0.6)');

      drawPalaceArchFrame(c, t, 0, false);

      this.state.hitRegions = [
        { type: 'turmeric', x: 412, y: 405, r: 46 },
        { type: 'ganesha', x: 605, y: 280, r: 105 },
        { type: 'parvati', x: 228, y: 265, r: 110 },
        { type: 'lotus', idx: 0, x: 675, y: 440, r: 44 },
        { type: 'lotus', idx: 1, x: 792, y: 460, r: 44 }
      ];
    }

    _renderScene3(c, t) {
      this._drawStarsAndSky(c, '#5aa9e6', '#9ad4f5', '#fff0c4', t, 0);
      drawCloud(c, ((t * 18) % 1140) - 90, 82, 1.0, 0.9, '#ffffff');
      drawCloud(c, ((t * 13 + 520) % 1140) - 90, 128, 0.85, 0.85, '#ffffff');

      c.fillStyle = '#e8c599';
      c.fillRect(0, 125, LOGICAL_W, 290);

      const doorArchGrad = c.createLinearGradient(0, 72, 0, 395);
      doorArchGrad.addColorStop(0, '#8d4925');
      doorArchGrad.addColorStop(1, '#5c2b14');
      c.fillStyle = doorArchGrad;
      c.beginPath();
      c.moveTo(345, 395);
      c.lineTo(345, 165);
      c.quadraticCurveTo(480, 62, 615, 165);
      c.lineTo(615, 395);
      c.closePath();
      c.fill();

      c.strokeStyle = '#ffd35c';
      c.lineWidth = 6;
      c.stroke();
      c.beginPath();
      c.moveTo(480, 114);
      c.lineTo(480, 395);
      c.stroke();

      for (let i = 0; i < 12; i++) {
        const lx = 360 + i * 21.8;
        const sag = Math.sin((i / 11) * Math.PI) * 18;
        const sway = Math.sin(t * 2.5 + i * 0.5) * 2;
        c.fillStyle = '#2e7d32';
        c.beginPath();
        c.ellipse(lx + sway, 178 + sag, 5, 13, 0.1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = i % 2 === 0 ? '#ffb300' : '#ff6f00';
        c.beginPath();
        c.arc(lx, 168 + sag, 7, 0, Math.PI * 2);
        c.fill();
      }

      drawHangingBell(c, 275, 132, 0.85, t, this.state.bellAction);
      drawHangingBell(c, 685, 132, 0.85, t + 0.6, this.state.bellAction);

      c.fillStyle = '#f7e7ce';
      c.fillRect(0, 395, LOGICAL_W, 145);
      c.fillStyle = '#e3caa5';
      c.fillRect(260, 395, 440, 20);
      c.fillRect(220, 415, 520, 22);

      drawLotus(c, 165, 445, 1.05, t, this.state.lotusBlooms[0], 0.2);
      drawLotus(c, 795, 445, 1.05, t, this.state.lotusBlooms[1], 1.4);

      this._drawCutoutCharacter(c, 'youngGanesha', 480, 290, 285, t, 3.5, this.state.ganeshaAction, 'rgba(255, 224, 110, 0.65)');

      // Little wooden guard staff beside him
      c.save();
      c.translate(585, 285);
      c.rotate(0.08 + Math.sin(this.state.ganeshaAction * Math.PI) * -0.15);
      c.strokeStyle = '#795548';
      c.lineWidth = 7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, -85);
      c.lineTo(0, 95);
      c.stroke();
      c.fillStyle = '#ffd35c';
      c.beginPath();
      c.moveTo(0, -100);
      c.lineTo(-8, -82);
      c.lineTo(8, -82);
      c.closePath();
      c.fill();
      c.restore();

      if (this.state.ganeshaAction > 0.05) {
        c.strokeStyle = `rgba(255, 211, 92, ${this.state.ganeshaAction})`;
        c.lineWidth = 4;
        c.beginPath();
        c.arc(480, 290, 92 + (1 - this.state.ganeshaAction) * 45, 0, Math.PI * 2);
        c.stroke();
      }

      drawPalaceArchFrame(c, t, 0, false);

      this.state.hitRegions = [
        { type: 'ganesha', x: 480, y: 290, r: 115 },
        { type: 'bell', x: 275, y: 170, r: 42 },
        { type: 'bell', x: 685, y: 170, r: 42 },
        { type: 'lotus', idx: 0, x: 165, y: 440, r: 46 },
        { type: 'lotus', idx: 1, x: 795, y: 440, r: 46 }
      ];
    }

    _renderScene4(c, t) {
      this._drawStarsAndSky(c, '#1a1f5c', '#3e488f', '#a3b5e8', t, 0.65);
      // Full Himalayan mountain landscape photo!
      this._drawMountainBackdrop(c, t, 0.92, 0);

      // Soft twilight overlay to unify courtyard & mountain
      const veil = c.createLinearGradient(0, 0, LOGICAL_W, 0);
      veil.addColorStop(0, 'rgba(30, 22, 68, 0.55)');
      veil.addColorStop(0.45, 'rgba(30, 22, 68, 0.15)');
      veil.addColorStop(1, 'rgba(20, 32, 75, 0.18)');
      c.fillStyle = veil;
      c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Palace doorway on the left
      c.fillStyle = 'rgba(201, 150, 107, 0.95)';
      c.fillRect(0, 95, 295, 315);
      c.fillStyle = '#6e3419';
      c.beginPath();
      c.moveTo(65, 410);
      c.lineTo(65, 200);
      c.quadraticCurveTo(155, 125, 245, 200);
      c.lineTo(245, 410);
      c.closePath();
      c.fill();
      c.strokeStyle = '#ffd35c';
      c.lineWidth = 4.5;
      c.stroke();

      // Courtyard floor
      const floor = c.createLinearGradient(0, 405, 0, LOGICAL_H);
      floor.addColorStop(0, 'rgba(225, 214, 232, 0.92)');
      floor.addColorStop(1, 'rgba(176, 165, 204, 0.96)');
      c.fillStyle = floor;
      c.fillRect(0, 405, LOGICAL_W, 135);

      drawDiya(c, 45, 392, 1.05, t);
      drawLotus(c, 855, 462, 0.95, t, this.state.lotusBlooms[0], 0.8);

      // Young Ganesha standing guard by palace doorway + Lord Shiva arriving with Nandi
      this._drawCutoutCharacter(c, 'youngGanesha', 270, 315, 230, t, 3, this.state.ganeshaAction, 'rgba(255, 224, 110, 0.6)');
      this._drawCutoutCharacter(c, 'shiva', 665, 265, 330, t, 3.5, this.state.shivaAction, 'rgba(144, 202, 249, 0.65)');

      drawPalaceArchFrame(c, t, 0, false);

      this.state.hitRegions = [
        { type: 'ganesha', x: 270, y: 315, r: 95 },
        { type: 'shiva', x: 665, y: 265, r: 125 },
        { type: 'lotus', idx: 0, x: 855, y: 458, r: 44 }
      ];
    }

    _renderScene5(c, t) {
      this._drawStarsAndSky(c, '#121545', '#2c2463', '#5a3d7a', t, 0.95);
      this._drawMountainBackdrop(c, t, 0.3, 0);

      const pulse = 1 + Math.sin(t * 2.5) * 0.08 + this.state.magicAction * 0.2;
      const burst = c.createRadialGradient(515, 175, 10, 515, 175, 155 * pulse);
      burst.addColorStop(0, 'rgba(255, 243, 176, 0.9)');
      burst.addColorStop(0.45, 'rgba(255, 198, 92, 0.42)');
      burst.addColorStop(1, 'rgba(255, 198, 92, 0)');
      c.fillStyle = burst;
      c.beginPath();
      c.arc(515, 175, 155 * pulse, 0, Math.PI * 2);
      c.fill();

      for (let i = 0; i < 10; i++) {
        const a = t * 1.4 + (i * Math.PI * 2) / 10;
        const sx = 515 + Math.cos(a) * 66;
        const sy = 158 + Math.sin(a) * 28;
        drawFourPointStar(c, sx, sy, 6 + (i % 3) * 2, '#ffe57f', 0.9);
      }
      drawCrown(c, 515, 162 + Math.sin(t * 2.5) * 6, 0.95);

      c.fillStyle = 'rgba(43, 40, 92, 0.92)';
      c.fillRect(0, 400, LOGICAL_W, 140);

      drawFourPointStar(c, 775, 74, 16 + Math.sin(t * 3) * 3, '#fff6b8', 1);

      // Parvati & Shiva on left
      this._drawParvatiPortrait(c, 175, 285, 240, t, 'sad', this.state.parvatiAction);
      this._drawCutoutCharacter(c, 'shiva', 360, 275, 275, t, 2.8, this.state.shivaAction, 'rgba(144, 202, 249, 0.55)');

      // Helper carrying the peaceful sleeping baby elephant blessing from the north
      const floatY = Math.sin(t * 2.2) * 8;
      c.save();
      c.translate(745, 250 + floatY);

      const orb = c.createRadialGradient(0, -10, 12, 0, -10, 78);
      orb.addColorStop(0, 'rgba(255, 240, 168, 0.95)');
      orb.addColorStop(0.65, 'rgba(255, 200, 92, 0.45)');
      orb.addColorStop(1, 'rgba(255, 200, 92, 0)');
      c.fillStyle = orb;
      c.beginPath();
      c.arc(0, -10, 78, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#ffe0b8';
      c.beginPath();
      c.ellipse(-26, -12, 16, 20, -0.2, 0, Math.PI * 2);
      c.ellipse(26, -12, 16, 20, 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffcf94';
      c.beginPath();
      c.arc(0, -14, 24, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#4e2a12';
      c.lineWidth = 2.2;
      c.beginPath();
      c.arc(-10, -16, 4.5, 0.15, Math.PI - 0.15);
      c.stroke();
      c.beginPath();
      c.arc(10, -16, 4.5, 0.15, Math.PI - 0.15);
      c.stroke();
      c.strokeStyle = '#f2a45e';
      c.lineWidth = 9;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, -8);
      c.quadraticCurveTo(4, 6, -7, 8);
      c.stroke();

      c.fillStyle = '#9fa8da';
      c.beginPath();
      c.arc(0, 62, 22, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1f2354';
      c.beginPath();
      c.arc(-7, 58, 2.8, 0, Math.PI * 2);
      c.arc(7, 58, 2.8, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Golden healing beam toward lotus pedestal
      c.save();
      const beamGrad = c.createLinearGradient(710, 265, 520, 420);
      beamGrad.addColorStop(0, 'rgba(255, 234, 150, 0.45)');
      beamGrad.addColorStop(1, 'rgba(255, 211, 92, 0.12)');
      c.strokeStyle = beamGrad;
      c.lineWidth = 14 + Math.sin(t * 3) * 3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(700, 268);
      c.quadraticCurveTo(608, 340, 525, 412);
      c.stroke();
      c.restore();

      drawLotus(c, 520, 455, 1.18, t, this.state.lotusBlooms[0], 0.3);
      drawPalaceArchFrame(c, t, 0, false);

      this.state.hitRegions = [
        { type: 'magic', x: 515, y: 175, r: 85 },
        { type: 'magic', x: 745, y: 250, r: 88 },
        { type: 'lotus', idx: 0, x: 520, y: 450, r: 48 }
      ];
    }

    _renderScene6(c, t) {
      this._drawStarsAndSky(c, '#212066', '#914179', '#ffbe7b', t, 0.55);
      this._drawMountainBackdrop(c, t, 0.28, 0);

      const halo = c.createRadialGradient(480, 285, 30, 480, 285, 280);
      halo.addColorStop(0, 'rgba(255, 243, 175, 0.85)');
      halo.addColorStop(0.5, 'rgba(255, 195, 110, 0.32)');
      halo.addColorStop(1, 'rgba(255, 195, 110, 0)');
      c.fillStyle = halo;
      c.beginPath();
      c.arc(480, 285, 280, 0, Math.PI * 2);
      c.fill();

      c.save();
      c.translate(480, 280);
      c.rotate(t * 0.14);
      c.fillStyle = 'rgba(255, 232, 145, 0.14)';
      for (let i = 0; i < 12; i++) {
        c.rotate(Math.PI / 6);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-16, -240);
        c.lineTo(16, -240);
        c.closePath();
        c.fill();
      }
      c.restore();

      const terrace = c.createLinearGradient(0, 395, 0, LOGICAL_H);
      terrace.addColorStop(0, '#fae6c8');
      terrace.addColorStop(1, '#e6c191');
      c.fillStyle = terrace;
      c.fillRect(0, 395, LOGICAL_W, 145);

      // Reunited family using the user's shared character photos!
      this._drawParvatiPortrait(c, 225, 268, 255, t, 'warm', this.state.parvatiAction);
      this._drawCutoutCharacter(c, 'shiva', 715, 262, 295, t, 2.5, this.state.shivaAction, 'rgba(144, 202, 249, 0.55)');
      this._drawCutoutCharacter(c, 'babyGanesha', 480, 285, 265, t, 4, this.state.ganeshaAction, 'rgba(255, 224, 118, 0.72)');

      c.fillStyle = '#d99b26';
      c.beginPath();
      c.ellipse(480, 466, 62, 14, 0, 0, Math.PI * 2);
      c.fill();
      drawModak(c, 456, 454, 0.85, -0.08);
      drawModak(c, 504, 454, 0.85, 0.08);
      drawModak(c, 480, 446, 0.95, 0);

      drawDiya(c, 115, 428, 1.0, t);
      drawDiya(c, 845, 428, 1.0, t);
      drawLotus(c, 215, 458, 1.0, t, this.state.lotusBlooms[0], 0.4);
      drawLotus(c, 745, 458, 1.0, t, this.state.lotusBlooms[1], 1.8);

      this.state.petals.forEach((p) => {
        if (p.kind === 'modak') {
          drawModak(c, p.x, p.y, 0.55, Math.sin(t * 2 + p.rot) * 0.25);
        } else {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.fillStyle = p.kind === 'pink' ? 'rgba(255, 130, 172, 0.86)' : 'rgba(255, 200, 72, 0.88)';
          c.beginPath();
          c.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      });

      drawPalaceArchFrame(c, t, 0, false);

      this.state.hitRegions = [
        { type: 'ganesha', x: 480, y: 285, r: 105 },
        { type: 'modak', x: 480, y: 454, r: 58 },
        { type: 'parvati', x: 225, y: 268, r: 95 },
        { type: 'shiva', x: 715, y: 262, r: 105 },
        { type: 'lotus', idx: 0, x: 215, y: 454, r: 46 },
        { type: 'lotus', idx: 1, x: 745, y: 454, r: 46 }
      ];
    }

    _updateSimulation(dt) {
      const s = this.state;
      s.time += dt;
      s.transitionAlpha = Math.min(1, s.transitionAlpha + dt * 3.5);

      s.ganeshaAction = Math.max(0, s.ganeshaAction - dt * 0.85);
      s.shivaAction = Math.max(0, s.shivaAction - dt * 0.85);
      s.parvatiAction = Math.max(0, s.parvatiAction - dt * 0.85);
      s.bellAction = Math.max(0, s.bellAction - dt * 0.65);
      s.magicAction = Math.max(0, s.magicAction - dt * 0.75);

      for (let i = 0; i < s.lotusBlooms.length; i++) {
        if (s.lotusBlooms[i] > 0) {
          s.lotusBlooms[i] = Math.max(0, s.lotusBlooms[i] - dt * 0.25);
        }
      }

      s.ambientMotes.forEach((m) => {
        m.x += m.vx * dt + Math.sin(s.time + m.phase) * 5 * dt;
        m.y += m.vy * dt;
        if (m.y < -12) {
          m.y = LOGICAL_H + 12;
          m.x = Math.random() * LOGICAL_W;
        }
        if (m.x < -12) m.x = LOGICAL_W + 12;
        if (m.x > LOGICAL_W + 12) m.x = -12;
      });

      if (s.scene === 5) {
        s.petals.forEach((p) => {
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(s.time * 1.6 + p.rot) * 14) * dt;
          p.rot += p.vrot * dt;
          if (p.y > LOGICAL_H + 20) {
            p.y = -20;
            p.x = Math.random() * LOGICAL_W;
          }
        });
      }

      for (let i = s.burstParticles.length - 1; i >= 0; i--) {
        const b = s.burstParticles[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += 85 * dt;
        b.life -= b.decay * dt;
        if (b.life <= 0) {
          s.burstParticles.splice(i, 1);
        }
      }
    }

    _renderFrame(ts) {
      if (!this.state.lastTimestamp) this.state.lastTimestamp = ts;
      const dt = Math.min(0.05, (ts - this.state.lastTimestamp) / 1000);
      this.state.lastTimestamp = ts;

      this._updateSimulation(dt);

      const c = this.ctx;
      c.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      const renderers = [
        (ctx2, t) => this._renderScene1(ctx2, t),
        (ctx2, t) => this._renderScene2(ctx2, t),
        (ctx2, t) => this._renderScene3(ctx2, t),
        (ctx2, t) => this._renderScene4(ctx2, t),
        (ctx2, t) => this._renderScene5(ctx2, t),
        (ctx2, t) => this._renderScene6(ctx2, t)
      ];
      renderers[this.state.scene](c, this.state.time);

      this.state.ambientMotes.forEach((m) => {
        const a = 0.25 + 0.45 * Math.sin(this.state.time * 2 + m.phase);
        const color = this.state.scene === 3 ? '#b3e5fc' : '#ffe688';
        drawFourPointStar(c, m.x, m.y, m.r * 1.4, color, a);
      });

      this.state.burstParticles.forEach((b) => {
        if (b.star) {
          drawFourPointStar(c, b.x, b.y, b.size, b.color, b.life);
        } else {
          c.save();
          c.globalAlpha = Math.max(0, b.life);
          c.fillStyle = b.color;
          c.beginPath();
          c.arc(b.x, b.y, b.size * 0.55, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      });

      if (this.state.transitionAlpha < 1) {
        c.fillStyle = `rgba(255, 246, 220, ${1 - this.state.transitionAlpha})`;
        c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      }

      this.rafId = requestAnimationFrame((nextTs) => this._renderFrame(nextTs));
    }
  }

  app.StoryController = StoryController;
})(window.KidApp = window.KidApp || {});
