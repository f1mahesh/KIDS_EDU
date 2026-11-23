/* Snow Clap AR — Camera Motion + Touch Hybrid Arcade Math Game */
(function (global) {
  const SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   vyMin: 0.52, vyRange: 0.30, maxAdd: 5,  maxMul: 4, duration: 90, fontSize: 54 },
    medium: { label: '🚀 Medium (Ages 6–8)', vyMin: 0.95, vyRange: 0.50, maxAdd: 9,  maxMul: 7, duration: 60, fontSize: 48 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  vyMin: 1.55, vyRange: 0.70, maxAdd: 12, maxMul: 9, duration: 60, fontSize: 44 }
  };

  class SnowClapArcade {
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
      this.micLevel = 0;
      this.avgNoise = 0.04;
      this.clapSoundWindow = 0;

      this.stream = null;
      this.hasCamera = false;
      this.running = false;
      this.rafId = null;
      this.timerId = null;

      this.op = 'add';
      this.speed = 'slow';
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = 90;

      this.flakes = [];
      this.fallingSnowballs = [];
      this.particles = [];
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
        this.leftHand.x = w * 0.2;
        this.leftHand.y = h - 130;
        this.rightHand.x = w * 0.8;
        this.rightHand.y = h - 130;
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
        if (this.heldLeft && this.heldRight) {
          if (Math.abs(x - this.canvas.width / 2) < 120) {
            this.triggerClap();
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
      this.onStatus(`Snow Flow: ${preset.label} — Hold 2 snow numbers, then 👏 CLAP!`);
    }

    async start(op = 'add', speedKey = this.speed) {
      this.stop();
      this._syncCanvasSize();
      this.op = op;
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.score = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.heldLeft = null;
      this.heldRight = null;
      this.bigSnow = null;
      this.fallingSnowballs = [];
      this.particles = [];
      this.prevFrame = null;
      this.catchGrace = 0;
      this.handsWereApart = false;
      this.clapSoundWindow = 0;
      this.running = true;

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
        if (!audioTracks || audioTracks.length === 0) {
          this.hasMic = false;
          return;
        }
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (!AudioCtx) {
          this.hasMic = false;
          return;
        }
        this.audioCtx = new AudioCtx();
        const src = this.audioCtx.createMediaStreamSource(stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        src.connect(this.analyser);
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
        // Request camera + mic so we can hear real clap sounds!
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true }
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

      let leftSum = 0;
      let leftX = 0;
      let leftY = 0;
      let centerSum = 0;
      let rightSum = 0;
      let rightX = 0;
      let rightY = 0;

      for (let y = 8; y < mh - 4; y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const diff =
            Math.abs(data[idx] - this.prevFrame[idx]) +
            Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
            Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
          if (diff > 65) {
            if (x < mw * 0.44) {
              leftSum++;
              leftX += x;
              leftY += y;
            }
            if (x > mw * 0.56) {
              rightSum++;
              rightX += x;
              rightY += y;
            }
            if (x >= mw * 0.32 && x <= mw * 0.68) {
              centerSum++;
            }
          }
        }
      }

      this.prevFrame.set(data);
      this.motionGrid = { left: leftSum, center: centerSum, right: rightSum };

      const w = this.canvas.width;
      const h = this.canvas.height;
      if (leftSum > 22) {
        const tx = (leftX / leftSum / mw) * w;
        const ty = (leftY / leftSum / mh) * h;
        this.leftHand.x += (tx - this.leftHand.x) * 0.35;
        this.leftHand.y += (ty - this.leftHand.y) * 0.35;
        this.leftHand.active = true;
      } else {
        this.leftHand.active = false;
      }

      if (rightSum > 22) {
        const tx = (rightX / rightSum / mw) * w;
        const ty = (rightY / rightSum / mh) * h;
        this.rightHand.x += (tx - this.rightHand.x) * 0.35;
        this.rightHand.y += (ty - this.rightHand.y) * 0.35;
        this.rightHand.active = true;
      } else {
        this.rightHand.active = false;
      }
    }

    _sampleClapAudio() {
      if (!this.hasMic || !this.analyser || !this.audioBuf) return;
      this.analyser.getByteTimeDomainData(this.audioBuf);
      let peak = 0;
      for (let i = 0; i < this.audioBuf.length; i++) {
        const amp = Math.abs(this.audioBuf[i] - 128) / 128;
        if (amp > peak) peak = amp;
      }
      this.micLevel = peak;
      this.avgNoise = this.avgNoise * 0.92 + peak * 0.08;

      // A clap creates a sharp short transient louder than steady talking/background noise
      if (peak > 0.20 && peak > this.avgNoise * 2.1) {
        this.clapSoundWindow = 22; // ~0.35s window to match the visual clap gesture
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
        if (global.MathAudio) global.MathAudio.pop();
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

      if (global.MathAudio) {
        global.MathAudio.magic();
        global.MathAudio.speak(`${a} ${this.op === 'add' ? 'plus' : this.op === 'sub' ? 'minus' : 'times'} ${b} is ${result}!`, 'cheer');
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
        pts
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
        this.leftHand.x += (w * 0.2 - this.leftHand.x) * 0.04;
        this.leftHand.y += (h - 135 - this.leftHand.y) * 0.04;
      }
      if (!this.rightHand.active) {
        this.rightHand.x += (w * 0.8 - this.rightHand.x) * 0.04;
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
        for (let i = this.fallingSnowballs.length - 1; i >= 0; i--) {
          const sb = this.fallingSnowballs[i];
          sb.y += sb.vy;
          sb.wobble += 0.05;
          sb.x += Math.sin(sb.wobble) * 0.6;

          // Catch when open palm moves near the falling snow number
          if (this.hasCamera && sb.y > h * 0.25 && sb.y < h * 0.92) {
            const distL = Math.hypot(sb.x - this.leftHand.x, sb.y - this.leftHand.y);
            const distR = Math.hypot(sb.x - this.rightHand.x, sb.y - this.rightHand.y);
            if (!this.heldLeft && (distL < 80 || (sb.side === 'left' && this.motionGrid.left > 48))) {
              this._catchSnowball(sb, i);
              continue;
            }
            if (!this.heldRight && (distR < 80 || (sb.side === 'right' && this.motionGrid.right > 48))) {
              this._catchSnowball(sb, i);
              continue;
            }
          }

          if (sb.y > h + 40) {
            this.fallingSnowballs.splice(i, 1);
          }
        }

        // Strict Clap Detection: wait for clap gesture AND clap sound!
        if (
          this.hasCamera &&
          this.heldLeft !== null &&
          this.heldRight !== null &&
          this.clapCooldown === 0 &&
          this.catchGrace === 0
        ) {
          const palmDist = Math.hypot(this.leftHand.x - this.rightHand.x, this.leftHand.y - this.rightHand.y);
          if (palmDist > 165) {
            this.handsWereApart = true;
          }

          const gestureClap =
            this.handsWereApart &&
            this.leftHand.active &&
            this.rightHand.active &&
            palmDist < 128 &&
            this.motionGrid.center > 50;

          if (this.hasMic) {
            // Require BOTH a clap sound spike AND a clapping palm gesture!
            const soundClap = this.clapSoundWindow > 0;
            const visualAction = palmDist < 155 || this.motionGrid.center > 55;
            if (soundClap && visualAction) {
              this.clapSoundWindow = 0;
              this.triggerClap();
            }
          } else if (gestureClap) {
            // If mic is off, require hands to start apart and actively clap together
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

      // Falling Snow-Shaped Numbers
      for (const sb of this.fallingSnowballs) {
        this._drawSnowNumber(sb.x, sb.y, sb.fontSize || 48, sb.val, sb.side === 'left' ? '#38bdf8' : '#f472b6');
      }

      // Live Mic Clap Sound Indicator (positioned below top scoreboard)
      if (this.hasMic) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.roundRect(14, 146, 118, 26, 999);
        ctx.fill();
        ctx.fillStyle = this.clapSoundWindow > 0 ? '#fde047' : '#bae6fd';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.clapSoundWindow > 0 ? '🎤 CLAP HEARD!' : '🎤 Clap Mic', 24, 163);
        ctx.restore();
      }

      // Snow-Shaped Numbers resting inside each Open Palm!
      if (this.heldLeft !== null) {
        this._drawSnowNumber(lx, ly - 16, 58, this.heldLeft, '#34d399');
      }
      if (this.heldRight !== null) {
        this._drawSnowNumber(rx, ry - 16, 58, this.heldRight, '#34d399');
      }

      // Prompt when both open palms are holding snow numbers
      if (this.heldLeft !== null && this.heldRight !== null && !this.bigSnow) {
        const opSym = this.op === 'add' ? '+' : this.op === 'sub' ? '−' : '×';
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 150, 142, 300, 52, 20);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 19px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`👏 CLAP PALMS! (${this.heldLeft} ${opSym} ${this.heldRight})`, w / 2, 174);
        ctx.restore();
      }

      // Giant Snow-Shaped Result Number when clapped!
      if (this.bigSnow) {
        const cx = w / 2;
        const cy = h / 2;
        const fontSize = 148 * this.bigSnow.scale;
        this._drawSnowNumber(cx, cy + 12, fontSize, this.bigSnow.result, '#fde047');
        ctx.fillStyle = '#fde047';
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`❄️ ${this.bigSnow.expr} = ${this.bigSnow.result}! ❄️`, cx, cy - fontSize * 0.65);
      }

      // Explosion snow crystals
      ctx.fillStyle = '#ffffff';
      for (const p of this.particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  global.SnowClapArcade = SnowClapArcade;
})(window);
