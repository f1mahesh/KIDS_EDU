/* Snow Clap AR — Camera Motion + Touch Hybrid Arcade Math Game */
(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, drawTreasureCanvasItem } = app;

const SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   vyMin: 0.52, vyRange: 0.30, maxAdd: 5,  maxMul: 4, duration: 90, fontSize: 54 },
    medium: { label: '🚀 Medium (Ages 6–8)', vyMin: 0.95, vyRange: 0.50, maxAdd: 9,  maxMul: 7, duration: 60, fontSize: 48 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  vyMin: 1.55, vyRange: 0.70, maxAdd: 12, maxMul: 9, duration: 60, fontSize: 44 }
  };

  class SnowClapGame {
    constructor(options) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      // Offscreen canvas for lightweight 80x60 motion detection
      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;

      // Microphone clap-sound detector
      this.audioCtx = null;
      this.analyser = null;
      this.audioBuf = null;
      this.hasMic = false;
      this.micLiveSignal = false;
      this.micLevel = 0;
      this.avgNoise = 0.03;
      this.clapSoundWindow = 0;

      this.stream = null;
      this.hasCamera = false;
      this.running = false;
      this.rafId = null;
      this.timerId = null;

      this.op = 'add';
      this.speed = 'slow';
      this.theme = 'snow-num';
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = 90;

      this.flakes = [];
      this.fallingSnowballs = [];
      this.fallingTreasures = [];
      this.particles = [];
      this.popups = [];
      this.heldLeft = null;
      this.heldRight = null;
      this.bigSnow = null;
      this.clapCooldown = 0;
      this.catchGrace = 0;
      this.handsWereApart = false;
      this.tick = 0;
      this.motionGrid = { left: 0, center: 0, right: 0 };
      this.leftHand = { x: 110, y: this.canvas.height - 82, active: false };
      this.rightHand = { x: this.canvas.width - 110, y: this.canvas.height - 82, active: false };

      this._initAmbientSnow();
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
        // Keep motionCanvas aspect-matched so portrait iPhone & landscape desktop track accurately
        this.motionCanvas.width = 80;
        this.motionCanvas.height = Math.max(44, Math.round((80 * h) / w));
        this.prevFrame = null;
        this.leftHand.x = w * 0.22;
        this.leftHand.y = h - 135;
        this.rightHand.x = w * 0.78;
        this.rightHand.y = h - 135;
        this._initAmbientSnow();
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

    _initAmbientSnow() {
      this.flakes = [];
      for (let i = 0; i < 45; i++) {
        this.flakes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          r: 1.5 + Math.random() * 3.5,
          vy: 0.8 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.8
        });
      }
    }

    _bindPointer() {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running || this.bigSnow) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

        // If holding both and tapping center -> trigger clap!
        if (this.heldLeft !== null && this.heldRight !== null) {
          if (Math.abs(x - this.canvas.width / 2) < this.canvas.width * 0.28) {
            this.triggerClap();
            return;
          }
        }

        // Tap a falling bonus treasure first!
        for (let i = this.fallingTreasures.length - 1; i >= 0; i--) {
          const tr = this.fallingTreasures[i];
          if (Math.hypot(x - tr.x, y - tr.y) <= tr.r + 18) {
            this._collectTreasure(tr, i);
            return;
          }
        }

        // Otherwise tap a falling snowball to catch it!
        for (let i = this.fallingSnowballs.length - 1; i >= 0; i--) {
          const sb = this.fallingSnowballs[i];
          if (Math.hypot(x - sb.x, y - sb.y) <= sb.r + 16) {
            this._catchSnowball(sb, i);
            break;
          }
        }
      });
    }

    setOperation(op) {
      this.op = op;
      this.heldLeft = null;
      this.heldRight = null;
      this.bigSnow = null;
      this.fallingSnowballs = [];
      this._spawnWave();
    }

    setSpeed(speedKey) {
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.fallingSnowballs = [];
      this._spawnWave();
      this.onStatus(`Snow Flow: ${preset.label} — Hold 2 items, then 👏 CLAP!`);
    }

    setTheme(themeKey) {
      const valid = ['snow-num', 'snowflake', 'apple', 'star'];
      this.theme = valid.includes(themeKey) ? themeKey : 'snow-num';
      const names = {
        'snow-num': '🧊 Snow Numbers',
        snowflake: '❄️ Real Snowflakes',
        apple: '🍎 Juicy Apples',
        star: '🌟 Magic Stars'
      };
      this.onStatus(`Switched to ${names[this.theme]}! Catch 2 in your palms & 👏 CLAP!`);
    }

    async start(op = 'add', speedKey = this.speed, themeKey = this.theme) {
      this.stop();
      this._syncCanvasSize();
      this.op = op;
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.theme = ['snow-num', 'snowflake', 'apple', 'star'].includes(themeKey) ? themeKey : 'snow-num';
      const preset = SPEED_PRESETS[this.speed];
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.heldLeft = null;
      this.heldRight = null;
      this.bigSnow = null;
      this.fallingSnowballs = [];
      this.fallingTreasures = [];
      this.particles = [];
      this.popups = [];
      this.prevFrame = null;
      this.catchGrace = 0;
      this.handsWereApart = false;
      this.clapSoundWindow = 0;
      this.micLiveSignal = false;
      this.running = true;

      // Unlock AudioContext synchronously inside user click/tap for iOS Safari!
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioCtx = new AudioCtx();
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
        } catch (_) {
          this.audioCtx = null;
        }
      }

      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.onStatus('📷 Starting Snow Camera & Clap Mic...');
      await this._startCamera();
      this._spawnWave();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this.onScore({
          score: this.score,
          combo: this.combo,
          stars: this.stars,
          timeLeft: this.timeLeft,
          heldLeft: this.heldLeft,
          heldRight: this.heldRight
        });
        if (this.timeLeft <= 0) {
          this.stop();
          this.onFinish({ score: this.score, stars: this.stars });
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

    _setupMic(stream) {
      try {
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks || audioTracks.length === 0 || !this.audioCtx) {
          this.hasMic = false;
          return;
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        const src = this.audioCtx.createMediaStreamSource(stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        // Connect through a muted GainNode(0) to destination — REQUIRED on iOS Safari so AnalyserNode pulls samples!
        const silentGain = this.audioCtx.createGain();
        silentGain.gain.value = 0;
        src.connect(this.analyser);
        this.analyser.connect(silentGain);
        silentGain.connect(this.audioCtx.destination);

        this.audioBuf = new Uint8Array(this.analyser.fftSize);
        this.hasMic = true;
      } catch (_) {
        this.hasMic = false;
      }
    }

    async _startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.hasCamera = false;
        this.hasMic = false;
        this.onStatus('❄️ Touch Snow Mode! Tap 2 snow numbers into your palms & tap CLAP!');
        return;
      }
      try {
        // Use simple audio: true (most reliable across iOS Safari, Android Chrome & Desktop)
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        this._setupMic(this.stream);
      } catch (_) {
        // Fallback: try video-only if mic was denied
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          this.hasMic = false;
        } catch (__) {
          this.hasCamera = false;
          this.hasMic = false;
          this.onStatus('❄️ Touch Snow Mode (Camera off)! Tap 2 snow numbers into your palms & tap CLAP!');
          return;
        }
      }

      try {
        this.video.srcObject = this.stream;
        await this.video.play();
        this.hasCamera = true;
        this.onStatus(
          this.hasMic
            ? '🙌 Hold 2 snow numbers in open palms, then 👏 CLAP (Sound + Gesture)!'
            : '🙌 Hold 2 snow numbers in open palms, then 👏 bring palms together to CLAP!'
        );
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('❄️ Touch Snow Mode! Tap 2 snow numbers & tap CLAP!');
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
      if (this.audioCtx) {
        this.audioCtx.close().catch(() => {});
        this.audioCtx = null;
        this.analyser = null;
        this.hasMic = false;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    _spawnWave() {
      const w = this.canvas.width;
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const maxNum = this.op === 'mul' ? preset.maxMul : preset.maxAdd;
      for (let i = 0; i < 4; i++) {
        const isLeft = i % 2 === 0;
        const x = isLeft ? 75 + Math.random() * (w * 0.3) : w * 0.58 + Math.random() * (w * 0.28);
        const val = 1 + Math.floor(Math.random() * maxNum);
        this.fallingSnowballs.push({
          x,
          y: -30 - Math.random() * 140,
          r: 28,
          vy: preset.vyMin + Math.random() * preset.vyRange,
          side: isLeft ? 'left' : 'right',
          val,
          fontSize: preset.fontSize,
          wobble: Math.random() * Math.PI * 2
        });
      }
      if (true && this.fallingTreasures.length < 2 && Math.random() < 0.72) {
        const mat = pickRandomTreasure();
        this.fallingTreasures.push({
          x: 65 + Math.random() * (w - 130),
          y: -28 - Math.random() * 90,
          r: 23,
          vy: preset.vyMin * 0.9 + Math.random() * 0.35,
          wobble: Math.random() * Math.PI * 2,
          mat
        });
      }
    }

    _analyzeMotion() {
      if (!this.hasCamera || this.video.readyState < 2) return;
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;

      this._drawVideoCover(this.motionCtx, mw, mh);

      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      const bothHeld = this.heldLeft !== null && this.heldRight !== null;
      const yStart = Math.round(mh * 0.34); // Skip upper face/head region so head movement doesn't shake palms
      const yEnd = Math.round(mh * 0.88);
      const leftBound = bothHeld ? mw * 0.56 : mw * 0.44;
      const rightBound = bothHeld ? mw * 0.44 : mw * 0.56;

      let leftSum = 0;
      let leftX = 0;
      let leftY = 0;
      let centerSum = 0;
      let rightSum = 0;
      let rightX = 0;
      let rightY = 0;

      for (let y = yStart; y < yEnd; y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const diff =
            Math.abs(data[idx] - this.prevFrame[idx]) +
            Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
            Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
          if (diff > 62) {
            if (x < leftBound) {
              leftSum++;
              leftX += x;
              leftY += y;
            }
            if (x > rightBound) {
              rightSum++;
              rightX += x;
              rightY += y;
            }
            if (x >= mw * 0.32 && x <= mw * 0.68 && diff > 72) {
              centerSum++;
            }
          }
        }
      }

      this.prevFrame.set(data);
      this.motionGrid = { left: leftSum, center: centerSum, right: rightSum };

      const w = this.canvas.width;
      const h = this.canvas.height;
      const minMotionPixels = Math.max(14, Math.round((mw * mh) * 0.0035));

      if (leftSum > minMotionPixels) {
        const rawX = (leftX / leftSum / mw) * w;
        const rawY = (leftY / leftSum / mh) * h;
        const tx = Math.max(w * 0.12, Math.min(bothHeld ? w * 0.54 : w * 0.44, rawX));
        const ty = Math.max(h * 0.36, Math.min(h - 125, rawY));
        this.leftHand.x += (tx - this.leftHand.x) * 0.25;
        this.leftHand.y += (ty - this.leftHand.y) * 0.25;
        this.leftHand.active = true;
      } else {
        this.leftHand.active = false;
      }

      if (rightSum > minMotionPixels) {
        const rawX = (rightX / rightSum / mw) * w;
        const rawY = (rightY / rightSum / mh) * h;
        const tx = Math.max(bothHeld ? w * 0.46 : w * 0.56, Math.min(w * 0.88, rawX));
        const ty = Math.max(h * 0.36, Math.min(h - 125, rawY));
        this.rightHand.x += (tx - this.rightHand.x) * 0.25;
        this.rightHand.y += (ty - this.rightHand.y) * 0.25;
        this.rightHand.active = true;
      } else {
        this.rightHand.active = false;
      }
    }

    _sampleClapAudio() {
      if (!this.hasMic || !this.analyser || !this.audioBuf || !this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
        return;
      }
      this.analyser.getByteTimeDomainData(this.audioBuf);
      let peak = 0;
      for (let i = 0; i < this.audioBuf.length; i++) {
        const amp = Math.abs(this.audioBuf[i] - 128) / 128;
        if (amp > peak) peak = amp;
      }
      if (peak > 0.0015) {
        this.micLiveSignal = true;
      }
      this.micLevel = peak;
      this.avgNoise = this.avgNoise * 0.90 + peak * 0.10;

      // Crisp clap spike detection tuned for iPhone, Android, and Laptop mics
      if (peak > 0.09 && peak > this.avgNoise * 1.65) {
        this.clapSoundWindow = 26;
      } else if (this.clapSoundWindow > 0) {
        this.clapSoundWindow -= 1;
      }
    }

    _catchSnowball(sb, index) {
      let caught = false;
      if (sb.side === 'left' && !this.heldLeft) {
        this.heldLeft = sb.val;
        caught = true;
      } else if (sb.side === 'right' && !this.heldRight) {
        this.heldRight = sb.val;
        caught = true;
      } else if (!this.heldLeft) {
        this.heldLeft = sb.val;
        caught = true;
      } else if (!this.heldRight) {
        this.heldRight = sb.val;
        caught = true;
      }

      if (caught) {
        this.fallingSnowballs.splice(index, 1);
        this.catchGrace = 28; // Prevent catch motion from triggering an accidental clap
        this.handsWereApart = false;
        if (AudioEngine) AudioEngine.pop();
      }

      this.onScore({
        score: this.score,
        combo: this.combo,
        stars: this.stars,
        timeLeft: this.timeLeft,
        heldLeft: this.heldLeft,
        heldRight: this.heldRight
      });
    }

    _collectTreasure(tr, index) {
      this.fallingTreasures.splice(index, 1);
      const mat = tr.mat;
      this.score += mat.pts;
      this.stars += mat.stars;
      if (AudioEngine) AudioEngine.magic();
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 * i) / 16;
        const spd = 2 + Math.random() * 4;
        this.particles.push({
          x: tr.x,
          y: tr.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2.5 + Math.random() * 3.5,
          color: mat.glow,
          life: 28 + Math.random() * 12
        });
      }
      this.popups.push({
        x: tr.x,
        y: tr.y - 10,
        text: `${mat.emoji} +${mat.pts} ${mat.short}!`,
        color: mat.glow,
        life: 44
      });
      this.onScore({
        score: this.score,
        combo: this.combo,
        stars: this.stars,
        timeLeft: this.timeLeft,
        heldLeft: this.heldLeft,
        heldRight: this.heldRight,
        collectedMaterial: mat.id
      });
    }

    triggerClap() {
      if (this.heldLeft === null || this.heldRight === null || this.bigSnow) return;
      let a = this.heldLeft;
      let b = this.heldRight;
      if (this.op === 'sub' && b > a) {
        [a, b] = [b, a];
      }
      const result = this.op === 'add' ? a + b : this.op === 'sub' ? a - b : a * b;
      const opSym = this.op === 'add' ? '+' : this.op === 'sub' ? '−' : '×';

      this.bigSnow = {
        result,
        expr: `${a} ${opSym} ${b}`,
        scale: 0.2,
        life: 85
      };

      const pts = 100 * this.combo;
      this.score += pts;
      this.stars += 2;
      this.combo = Math.min(5, this.combo + 1);
      this.clapCooldown = 45;

      // Snow explosion particles
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      for (let i = 0; i < 36; i++) {
        const ang = (Math.PI * 2 * i) / 36;
        const spd = 2.5 + Math.random() * 5;
        this.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 3 + Math.random() * 5,
          life: 40 + Math.random() * 20
        });
      }

      if (AudioEngine) {
        AudioEngine.magic();
        AudioEngine.speak(`${a} ${this.op === 'add' ? 'plus' : this.op === 'sub' ? 'minus' : 'times'} ${b} is ${result}!`, 'cheer');
      }

      const clapBonus = true ? pickRandomTreasure() : null;
      if (clapBonus) {
        this.popups.push({
          x: cx,
          y: cy + 78,
          text: `${clapBonus.emoji} Bonus ${clapBonus.name}!`,
          color: clapBonus.glow,
          life: 62
        });
      }

      this.heldLeft = null;
      this.heldRight = null;
      this.onScore({
        score: this.score,
        combo: this.combo,
        stars: this.stars,
        timeLeft: this.timeLeft,
        heldLeft: null,
        heldRight: null,
        lastExpr: `${a} ${opSym} ${b} = ${result}`,
        pts,
        collectedMaterial: clapBonus ? clapBonus.id : null
      });
    }

    _update() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.tick += 1;
      if (this.clapCooldown > 0) this.clapCooldown--;
      if (this.catchGrace > 0) this.catchGrace--;

      // Ambient snowflakes
      for (const f of this.flakes) {
        f.y += f.vy;
        f.x += f.vx;
        if (f.y > h) { f.y = -6; f.x = Math.random() * w; }
        if (f.x < 0) f.x = w;
        if (f.x > w) f.x = 0;
      }

      // Motion & Microphone Clap Audio detection
      this._analyzeMotion();
      this._sampleClapAudio();

      // Gently settle idle hands back toward resting palm spots if no camera or still
      if (!this.leftHand.active) {
        this.leftHand.x += (w * 0.22 - this.leftHand.x) * 0.04;
        this.leftHand.y += (h - 135 - this.leftHand.y) * 0.04;
      }
      if (!this.rightHand.active) {
        this.rightHand.x += (w * 0.78 - this.rightHand.x) * 0.04;
        this.rightHand.y += (h - 135 - this.rightHand.y) * 0.04;
      }

      // Big Snow result timer
      if (this.bigSnow) {
        this.bigSnow.scale = Math.min(1, this.bigSnow.scale + 0.1);
        this.bigSnow.life -= 1;
        if (this.bigSnow.life <= 0) {
          this.bigSnow = null;
          this._spawnWave();
        }
      }

      // Falling snow-numbers
      if (!this.bigSnow) {
        if (this.fallingSnowballs.length < 3) {
          this._spawnWave();
        }
        const catchRadius = Math.max(68, Math.round(w * 0.14));
        const sideMotionMin = Math.max(30, Math.round((this.motionCanvas.width * this.motionCanvas.height) * 0.008));

        for (let i = this.fallingSnowballs.length - 1; i >= 0; i--) {
          const sb = this.fallingSnowballs[i];
          sb.y += sb.vy;
          sb.wobble += 0.05;
          sb.x += Math.sin(sb.wobble) * 0.6;

          // Catch when open palm moves near the falling snow number
          if (this.hasCamera && sb.y > h * 0.24 && sb.y < h * 0.90) {
            const distL = Math.hypot(sb.x - this.leftHand.x, sb.y - this.leftHand.y);
            const distR = Math.hypot(sb.x - this.rightHand.x, sb.y - this.rightHand.y);
            if (!this.heldLeft && (distL < catchRadius || (sb.side === 'left' && this.motionGrid.left > sideMotionMin))) {
              this._catchSnowball(sb, i);
              continue;
            }
            if (!this.heldRight && (distR < catchRadius || (sb.side === 'right' && this.motionGrid.right > sideMotionMin))) {
              this._catchSnowball(sb, i);
              continue;
            }
          }

          if (sb.y > h + 40) {
            this.fallingSnowballs.splice(i, 1);
          }
        }

        for (let i = this.fallingTreasures.length - 1; i >= 0; i--) {
          const tr = this.fallingTreasures[i];
          tr.y += tr.vy;
          tr.wobble += 0.06;
          tr.x += Math.sin(tr.wobble) * 0.7;
          if (this.hasCamera && tr.y > h * 0.22 && tr.y < h * 0.90) {
            const distL = Math.hypot(tr.x - this.leftHand.x, tr.y - this.leftHand.y);
            const distR = Math.hypot(tr.x - this.rightHand.x, tr.y - this.rightHand.y);
            if (distL < catchRadius || distR < catchRadius) {
              this._collectTreasure(tr, i);
              continue;
            }
          }
          if (tr.y > h + 36) {
            this.fallingTreasures.splice(i, 1);
          }
        }

        // Cross-device Clap Detection (scales proportionally for portrait iPhone & widescreen desktop!)
        if (
          this.hasCamera &&
          this.heldLeft !== null &&
          this.heldRight !== null &&
          this.clapCooldown === 0 &&
          this.catchGrace === 0
        ) {
          const palmDist = Math.hypot(this.leftHand.x - this.rightHand.x, this.leftHand.y - this.rightHand.y);
          const apartDist = w * 0.30;
          const closeDist = w * 0.28;
          const centerBurstMin = Math.max(24, Math.round((this.motionCanvas.width * this.motionCanvas.height) * 0.007));

          if (palmDist > apartDist) {
            this.handsWereApart = true;
          }

          const gestureClap =
            this.handsWereApart &&
            (this.leftHand.active || this.rightHand.active) &&
            palmDist < closeDist &&
            this.motionGrid.center > centerBurstMin;

          const micWorking = this.hasMic && this.micLiveSignal && this.audioCtx && this.audioCtx.state === 'running';
          if (micWorking) {
            const soundClap = this.clapSoundWindow > 0;
            const visualAction = palmDist < w * 0.48 || this.motionGrid.center > centerBurstMin * 0.6;
            if ((soundClap && visualAction) || (gestureClap && this.motionGrid.center > centerBurstMin * 1.4)) {
              this.clapSoundWindow = 0;
              this.triggerClap();
            }
          } else if (gestureClap) {
            this.triggerClap();
          }
        }
      }

      // Explosion snow crystals
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    }

    _drawOpenPalm(x, y, side, hasSnow) {
      const ctx = this.ctx;
      const flip = side === 'right' ? -1 : 1;
      ctx.save();
      ctx.translate(x, y + 14);
      ctx.scale(flip, 1);

      // Soft frosty glow under open palm
      ctx.shadowColor = hasSnow ? '#34d399' : '#7dd3fc';
      ctx.shadowBlur = hasSnow ? 20 : 12;
      ctx.fillStyle = hasSnow ? 'rgba(224, 242, 254, 0.42)' : 'rgba(255, 255, 255, 0.22)';
      ctx.strokeStyle = hasSnow ? '#6ee7b7' : 'rgba(186, 230, 253, 0.85)';
      ctx.lineWidth = 2.4;

      // Stylized Open Palm + 5 spread fingers
      ctx.beginPath();
      // Palm base
      ctx.roundRect(-24, -10, 48, 34, 16);
      ctx.fill();
      ctx.stroke();

      // 4 upright fingers + thumb
      const fingers = [
        { fx: -28, fy: -6, fw: 10, fh: 22, rot: -0.55 }, // thumb
        { fx: -18, fy: -32, fw: 9, fh: 24, rot: -0.15 }, // index
        { fx: -6, fy: -36, fw: 9, fh: 28, rot: 0 },      // middle
        { fx: 6, fy: -34, fw: 9, fh: 26, rot: 0.12 },    // ring
        { fx: 17, fy: -28, fw: 8, fh: 21, rot: 0.28 }    // pinky
      ];
      for (const fg of fingers) {
        ctx.save();
        ctx.translate(fg.fx, fg.fy + fg.fh / 2);
        ctx.rotate(fg.rot);
        ctx.beginPath();
        ctx.roundRect(-fg.fw / 2, -fg.fh / 2, fg.fw, fg.fh, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Snow cushion resting in the open palm when holding a number
      if (hasSnow) {
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, -10, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _drawSnowNumber(x, y, fontSize, label, glowColor = '#7dd3fc') {
      const ctx = this.ctx;
      const str = String(label);
      ctx.save();
      ctx.font = `900 ${Math.round(fontSize)}px "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // 1. 3D Icy Depth Shadow under the snow-shaped number
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 18;
      ctx.lineWidth = Math.max(8, fontSize * 0.24);
      ctx.strokeStyle = '#0369a1';
      ctx.strokeText(str, x, y + fontSize * 0.06);

      // 2. Fluffy Puffy Outer Snow Mound Outline
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.max(6, fontSize * 0.19);
      ctx.strokeStyle = '#bae6fd';
      ctx.strokeText(str, x, y);

      // 3. Packed Pure White-to-Ice Snow Gradient Fill
      ctx.shadowBlur = 0;
      const grad = ctx.createLinearGradient(x, y - fontSize * 0.5, x, y + fontSize * 0.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.55, '#f0f9ff');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillText(str, x, y);

      // 4. Crisp frosty inner highlight
      ctx.lineWidth = Math.max(1.5, fontSize * 0.035);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(str, x, y - 1);

      // 5. Fluffy Snow Tufts & Twinkling Ice Crystals around the snow number
      const spread = fontSize * (str.length > 1 ? 0.65 : 0.42);
      const tufts = [
        { dx: -spread * 0.6, dy: -fontSize * 0.36, r: fontSize * 0.085 },
        { dx: spread * 0.55, dy: -fontSize * 0.32, r: fontSize * 0.075 },
        { dx: -spread * 0.72, dy: fontSize * 0.25, r: fontSize * 0.07 },
        { dx: spread * 0.7, dy: fontSize * 0.28, r: fontSize * 0.08 }
      ];
      for (let i = 0; i < tufts.length; i++) {
        const tf = tufts[i];
        const shimmer = 0.7 + 0.3 * Math.sin(this.tick * 0.12 + i * 1.6);
        ctx.fillStyle = `rgba(255, 255, 255, ${shimmer})`;
        ctx.beginPath();
        ctx.arc(x + tf.dx, y + tf.dy, tf.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _drawSnowflakeWithNumber(x, y, size, label, glowColor = '#7dd3fc') {
      const ctx = this.ctx;
      const r = size * 0.78;
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 16;

      // Rotate gently
      ctx.save();
      ctx.rotate(this.tick * 0.015);
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(2.5, r * 0.09);

      // 6 dendritic crystal arms with side branches
      for (let a = 0; a < 6; a++) {
        ctx.save();
        ctx.rotate((Math.PI / 3) * a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r);
        // Side branches
        ctx.moveTo(0, -r * 0.45);
        ctx.lineTo(-r * 0.24, -r * 0.65);
        ctx.moveTo(0, -r * 0.45);
        ctx.lineTo(r * 0.24, -r * 0.65);
        ctx.moveTo(0, -r * 0.72);
        ctx.lineTo(-r * 0.16, -r * 0.88);
        ctx.moveTo(0, -r * 0.72);
        ctx.lineTo(r * 0.16, -r * 0.88);
        ctx.stroke();

        // Tiny crystal tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -r, Math.max(2, r * 0.08), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // Frosted hexagonal center medallion holding the number
      const medR = r * 0.56;
      const grad = ctx.createRadialGradient(0, -medR * 0.3, medR * 0.1, 0, 0, medR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, medR, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0c4a6e';
      ctx.font = `900 ${Math.round(size * 0.56)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(label), 0, 2);
      ctx.restore();
    }

    _drawAppleWithNumber(x, y, size, label, glowColor = '#f87171', isGolden = false) {
      const ctx = this.ctx;
      const r = size * 0.68;
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = isGolden ? '#fde047' : glowColor;
      ctx.shadowBlur = 16;

      // Brown curved stem
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = Math.max(3, r * 0.12);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.72);
      ctx.quadraticCurveTo(r * 0.12, -r * 1.15, r * 0.28, -r * 1.18);
      ctx.stroke();

      // Fresh green leaf
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(r * 0.34, -r * 0.92, r * 0.28, r * 0.14, -0.45, 0, Math.PI * 2);
      ctx.fill();

      // Plump Apple Body (two overlapping curves)
      const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.12, 0, 0, r * 1.1);
      if (isGolden) {
        grad.addColorStop(0, '#fef9c3');
        grad.addColorStop(0.5, '#fbbf24');
        grad.addColorStop(1, '#b45309');
      } else {
        grad.addColorStop(0, '#fecaca');
        grad.addColorStop(0.42, '#ef4444');
        grad.addColorStop(1, '#991b1b');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.72);
      ctx.bezierCurveTo(r * 0.85, -r * 1.05, r * 1.15, r * 0.25, r * 0.42, r * 0.88);
      ctx.quadraticCurveTo(0, r * 1.05, -r * 0.42, r * 0.88);
      ctx.bezierCurveTo(-r * 1.15, r * 0.25, -r * 0.85, -r * 1.05, 0, -r * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isGolden ? '#fef08a' : '#fecaca';
      ctx.stroke();

      // Glossy shine
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.36, -r * 0.22, r * 0.14, r * 0.28, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Bold Number on the Apple
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = Math.max(3, size * 0.08);
      ctx.font = `900 ${Math.round(size * 0.58)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(String(label), 0, r * 0.08);
      ctx.fillText(String(label), 0, r * 0.08);
      ctx.restore();
    }

    _drawStarWithNumber(x, y, size, label, glowColor = '#fde047') {
      const ctx = this.ctx;
      const outer = size * 0.78;
      const inner = size * 0.40;
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const ang = -Math.PI / 2 + (Math.PI * i) / 5;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(0, -outer * 0.2, inner * 0.1, 0, 0, outer);
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.55, '#fbbf24');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#451a03';
      ctx.font = `900 ${Math.round(size * 0.52)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(label), 0, 3);
      ctx.restore();
    }

    _drawThemedItem(x, y, size, label, glowColor, isResult = false) {
      if (this.theme === 'snowflake') {
        this._drawSnowflakeWithNumber(x, y, size, label, glowColor);
      } else if (this.theme === 'apple') {
        this._drawAppleWithNumber(x, y, size, label, glowColor, isResult);
      } else if (this.theme === 'star') {
        this._drawStarWithNumber(x, y, size, label, glowColor);
      } else {
        this._drawSnowNumber(x, y, size, label, glowColor);
      }
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background: Full-Screen Mirrored Camera OR Winter Night Sky
      if (this.hasCamera && this.video.readyState >= 2) {
        this._drawVideoCover(ctx, w, h);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        ctx.fillRect(0, 0, w, h);
      } else {
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#0f172a');
        bg.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
      }

      // Ambient falling snow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (const f of this.flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Open Palm Hand Cradles (follow real palm position when camera tracks movement!)
      const lx = this.leftHand.x;
      const ly = this.leftHand.y;
      const rx = this.rightHand.x;
      const ry = this.rightHand.y;

      this._drawOpenPalm(lx, ly, 'left', this.heldLeft !== null);
      this._drawOpenPalm(rx, ry, 'right', this.heldRight !== null);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPEN LEFT PALM', lx, ly + 52);
      ctx.fillText('OPEN RIGHT PALM', rx, ry + 52);

      // Falling Themed Numbers (Snow Digits / Real Snowflakes / Apples / Stars)
      for (const sb of this.fallingSnowballs) {
        this._drawThemedItem(sb.x, sb.y, sb.fontSize || 48, sb.val, sb.side === 'left' ? '#38bdf8' : '#f472b6', false);
      }

      // Falling Bonus Treasure Materials
      if (true) {
        for (const tr of this.fallingTreasures) {
          ctx.save();
          ctx.translate(tr.x, tr.y);
          drawTreasureCanvasItem(ctx, tr.mat.id, tr.r, this.tick);
          ctx.restore();
        }
      }

      // Live Mic Clap Sound Indicator (positioned below slim top scoreboard)
      if (this.hasMic) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.roundRect(14, 62, 118, 26, 999);
        ctx.fill();
        ctx.fillStyle = this.clapSoundWindow > 0 ? '#fde047' : '#bae6fd';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.clapSoundWindow > 0 ? '🎤 CLAP HEARD!' : '🎤 Clap Mic', 24, 79);
        ctx.restore();
      }

      // Held Numbers resting inside each Open Palm!
      if (this.heldLeft !== null) {
        this._drawThemedItem(lx, ly - 16, 56, this.heldLeft, '#34d399', false);
      }
      if (this.heldRight !== null) {
        this._drawThemedItem(rx, ry - 16, 56, this.heldRight, '#34d399', false);
      }

      // Prompt when both open palms are holding numbers
      if (this.heldLeft !== null && this.heldRight !== null && !this.bigSnow) {
        const opSym = this.op === 'add' ? '+' : this.op === 'sub' ? '−' : '×';
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 150, 58, 300, 48, 20);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 19px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`👏 CLAP PALMS! (${this.heldLeft} ${opSym} ${this.heldRight})`, w / 2, 88);
        ctx.restore();
      }

      // Giant Themed Result when clapped!
      if (this.bigSnow) {
        const cx = w / 2;
        const cy = h / 2;
        const size = 148 * this.bigSnow.scale;
        this._drawThemedItem(cx, cy + 12, size, this.bigSnow.result, '#fde047', true);
        const resIcon = this.theme === 'apple' ? '🍎' : this.theme === 'star' ? '🌟' : '❄️';
        ctx.fillStyle = '#fde047';
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${resIcon} ${this.bigSnow.expr} = ${this.bigSnow.result}! ${resIcon}`, cx, cy - size * 0.65);
      }

      // Explosion snow crystals & treasure popups
      for (const p of this.particles) {
        ctx.fillStyle = p.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 1.1;
        pop.life -= 1;
        if (pop.life <= 0) {
          this.popups.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life / 18);
        ctx.font = '900 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(pop.text, pop.x, pop.y);
        ctx.fillStyle = pop.color || '#fde047';
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }
    }
  }

  app.SnowClapGame = SnowClapGame;
})(window.KidApp = window.KidApp || {});
