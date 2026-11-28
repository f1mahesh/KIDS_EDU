/* Squirrel Bridge AR — Crosses Over Kid's Real Outstretched Hands & Shoulders */
(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, drawTreasureCanvasItem } = app;

const SQ_SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   crossSpeed: 1.9, maxAdd: 5,  maxMul: 4, holdStep: 0.11 },
    medium: { label: '🚀 Medium (Ages 6–8)', crossSpeed: 3.1, maxAdd: 8,  maxMul: 6, holdStep: 0.14 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  crossSpeed: 4.8, maxAdd: 12, maxMul: 9, holdStep: 0.18 }
  };

  class SquirrelBridgeGame {
    constructor(options) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onStatus = options.onStatus || (() => {});

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;
      this.bgFrame = null;

      this.stream = null;
      this.hasCamera = false;
      this.showCamera = true;
      this.running = false;
      this.rafId = null;

      this.op = 'add';
      this.speed = 'slow';
      this.quizMode = false;
      this.score = 0;
      this.stars = 0;
      this.crossedCount = 0;
      this.tick = 0;

      const w = this.canvas.width;
      const h = this.canvas.height;
      // Left & Right Cliff entry/exit points comfortably within webcam arm-reach
      this.pointA = { x: 115, y: h * 0.56, connected: false };
      this.pointB = { x: w - 115, y: h * 0.56, connected: false };

      this.leftHand = { x: w * 0.42, y: h * 0.58, active: false };
      this.rightHand = { x: w * 0.58, y: h * 0.58, active: false };
      this.shoulderY = h * 0.54;
      this.faceDetected = false;
      this.faceCenter = { x: w / 2, y: h * 0.34 };
      this.nativeFaceAt = 0;
      this.faceDetector = null;
      if (typeof window.FaceDetector === 'function') {
        try {
          this.faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
        } catch (_) {}
      }
      this.zoneHandA = 0;
      this.zoneHandB = 0;
      this.holdA = 0;
      this.holdB = 0;
      this.roundGrace = 30;

      this.bridgeBuilt = false;
      this.waitingQuiz = false;
      this.squirrel = { x: 46, y: h * 0.58 - 20, crossing: false, crossed: false, bob: 0 };
      this.pawSparkles = [];
      this.popups = [];
      this.bridgeTreasure = null;
      this.problem = { a: 3, b: 4, answer: 7, sym: '+', choices: [6, 7, 8] };
      this.acorns = [];
      this.butterflies = [
        { x: 150, y: 78, phase: 0, color: '#fde047' },
        { x: 490, y: 96, phase: 2.1, color: '#f472b6' }
      ];

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
        const margin = Math.min(125, Math.round(w * 0.18));
        this.pointA.x = margin;
        this.pointA.y = h * 0.56;
        this.pointB.x = w - margin;
        this.pointB.y = h * 0.56;
        this.bgFrame = null;
        this.prevFrame = null;
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

    _bindPointer() {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - rect.left) / rect.width) * this.canvas.width,
          y: ((e.clientY - rect.top) / rect.height) * this.canvas.height
        };
      };

      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        const pos = getPos(e);

        if (this.waitingQuiz) {
          for (const ac of this.acorns) {
            if (Math.hypot(pos.x - ac.x, pos.y - ac.y) <= 34) {
              this._pickQuizAnswer(ac.val);
              return;
            }
          }
          return;
        }

        if (this.bridgeTreasure && !this.bridgeTreasure.collected) {
          const ty = this._getArmBridgeY(this.bridgeTreasure.x) - 22;
          if (Math.hypot(pos.x - this.bridgeTreasure.x, pos.y - ty) <= 36) {
            this._collectBridgeTreasure(this.bridgeTreasure.x, ty);
            return;
          }
        }

        if (this.bridgeBuilt) return;

        if (Math.hypot(pos.x - this.pointA.x, pos.y - this.pointA.y) < 60) {
          this.pointA.connected = true;
          if (AudioEngine) AudioEngine.pop();
        } else if (Math.hypot(pos.x - this.pointB.x, pos.y - this.pointB.y) < 60) {
          this.pointB.connected = true;
          if (AudioEngine) AudioEngine.pop();
        }

        if (this.pointA.connected && this.pointB.connected) {
          this._completeBridge();
        }
      });
    }

    setOperation(op) {
      this.op = op;
      this.nextRound();
    }

    setQuizMode(enabled) {
      this.quizMode = enabled;
      this.nextRound();
    }

    toggleCameraView() {
      this.showCamera = !this.showCamera;
      return this.showCamera;
    }

    setSpeed(speedKey) {
      this.speed = SQ_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SQ_SPEED_PRESETS[this.speed];
      this.nextRound();
      this.onStatus(`Squirrel Flow: ${preset.label} — Touch BOTH numbers with stretched hands!`);
    }

    async start(op = 'add', speedKey = this.speed) {
      this.stop();
      this._syncCanvasSize();
      this.op = op;
      this.speed = SQ_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.score = 0;
      this.stars = 0;
      this.crossedCount = 0;
      this.prevFrame = null;
      this.bgFrame = null;
      this.tick = 0;
      this.running = true;
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');

      this.onStatus('📷 Starting Park Camera...');
      await this._startCamera();
      this.nextRound();

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
        this.onStatus('🌴 No camera found — tap Point A & Point B (or Connect Bridge) so Squirrel crosses!');
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
        this.onStatus('🙌 Stretch BOTH arms wide across the park! Squirrel will walk right over your real hands & shoulders!');
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('🌴 Camera off — tap Point A & Point B (or Connect Bridge) to help Squirrel cross!');
      }
    }

    stop() {
      this.running = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    nextRound() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.pointA.connected = false;
      this.pointB.connected = false;
      this.holdA = 0;
      this.holdB = 0;
      this.zoneHandA = 0;
      this.zoneHandB = 0;
      this.roundGrace = 30;
      this.leftHand = { x: w * 0.42, y: h * 0.58, active: false };
      this.rightHand = { x: w * 0.58, y: h * 0.58, active: false };
      this.bridgeBuilt = false;
      this.waitingQuiz = false;
      this.pawSparkles = [];
      this.popups = [];
      this.bridgeTreasure = true ? {
            x: w * (0.36 + Math.random() * 0.28),
            collected: false,
            mat: pickRandomTreasure()
          }
        : null;
      this.squirrel = { x: 46, y: h * 0.58 - 20, crossing: false, crossed: false, bob: 0 };

      const preset = SQ_SPEED_PRESETS[this.speed] || SQ_SPEED_PRESETS.slow;
      let a, b, answer, sym;
      if (this.op === 'add') {
        a = 1 + Math.floor(Math.random() * preset.maxAdd);
        b = 1 + Math.floor(Math.random() * preset.maxAdd);
        answer = a + b;
        sym = '+';
      } else if (this.op === 'sub') {
        a = 4 + Math.floor(Math.random() * preset.maxAdd);
        b = 1 + Math.floor(Math.random() * (a - 1));
        answer = a - b;
        sym = '−';
      } else {
        a = 2 + Math.floor(Math.random() * preset.maxMul);
        b = 2 + Math.floor(Math.random() * preset.maxMul);
        answer = a * b;
        sym = '×';
      }

      const set = new Set([answer]);
      while (set.size < 3) {
        const cand = Math.max(1, answer + (Math.floor(Math.random() * 5) - 2));
        set.add(cand);
      }
      const choices = Array.from(set).sort(() => Math.random() - 0.5);
      this.problem = { a, b, answer, sym, choices };

      this.acorns = choices.map((val, idx) => ({
        val,
        x: w * 0.34 + idx * (w * 0.16),
        y: 108
      }));

      this.onScore({
        score: this.score,
        stars: this.stars,
        crossed: this.crossedCount,
        problem: this.problem,
        bridgeBuilt: false
      });
    }

    connectNow() {
      if (this.bridgeBuilt) return;
      this.pointA.connected = true;
      this.pointB.connected = true;
      this._completeBridge();
    }

    _completeBridge() {
      if (this.bridgeBuilt) return;
      this.bridgeBuilt = true;
      if (AudioEngine) AudioEngine.magic();

      if (this.quizMode) {
        this.waitingQuiz = true;
        this.onStatus(`🌰 Hands stretched! Tap the Acorn with ${this.problem.a} ${this.problem.sym} ${this.problem.b} so Squirrel walks over your arms!`);
        if (AudioEngine) {
          const opWord = this.op === 'add' ? 'plus' : this.op === 'sub' ? 'minus' : 'times';
          AudioEngine.speak(`Hands ready! Pick ${this.problem.a} ${opWord} ${this.problem.b}!`, 'normal');
        }
      } else {
        this._startSquirrelCross();
      }
    }

    _pickQuizAnswer(val) {
      if (!this.waitingQuiz) return;
      if (val === this.problem.answer) {
        this.waitingQuiz = false;
        this._startSquirrelCross();
      } else {
        if (AudioEngine) AudioEngine.wrong();
        this.onStatus(`💡 Almost! Count ${this.problem.a} ${this.problem.sym} ${this.problem.b} again!`);
      }
    }

    _startSquirrelCross() {
      this.squirrel.crossing = true;
      this.onStatus(`🐿️ Hold steady! Sammy the Squirrel is walking over your real hands & shoulders!`);
      if (AudioEngine) {
        const opWord = this.op === 'add' ? 'plus' : this.op === 'sub' ? 'minus' : 'times';
        AudioEngine.speak(`Hold steady! ${this.problem.a} ${opWord} ${this.problem.b} is ${this.problem.answer}! Look at the squirrel walk across your hands!`, 'cheer');
      }
    }

    _isHumanSkinYCbCr(r, g, b) {
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      if (y < 42) return false;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      return cb >= 76 && cb <= 129 && cr >= 133 && cr <= 175;
    }

    _analyzeMotion() {
      if (!this.hasCamera || this.video.readyState < 2) return;
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;

      this._drawVideoCover(this.motionCtx, mw, mh);

      // Native browser FaceDetector boost if available (runs every ~10 frames)
      if (this.faceDetector && this.tick % 10 === 0) {
        this.faceDetector.detect(this.motionCanvas).then((faces) => {
          if (faces && faces.length > 0) {
            const f = faces[0].boundingBox;
            this.nativeFaceAt = this.tick;
            this.faceCenter = {
              x: ((f.x + f.width / 2) / mw) * this.canvas.width,
              y: ((f.y + f.height / 2) / mh) * this.canvas.height
            };
          }
        }).catch(() => {});
      }

      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      if (!this.bgFrame && this.tick >= 16) {
        this.bgFrame = new Uint8ClampedArray(data);
      }

      const w = this.canvas.width;
      const h = this.canvas.height;
      const ax = (this.pointA.x / w) * mw;
      const ay = ((this.pointA.y - 18) / h) * mh;
      const bx = (this.pointB.x / w) * mw;
      const by = ((this.pointB.y - 18) / h) * mh;

      // Estimate global lighting shift so room brightness changes don't look like hands
      let lumDeltaSum = 0;
      let sampleCount = 0;
      if (this.bgFrame) {
        for (let i = 0; i < data.length; i += 32) {
          lumDeltaSum += (data[i] + data[i + 1] + data[i + 2]) - (this.bgFrame[i] + this.bgFrame[i + 1] + this.bgFrame[i + 2]);
          sampleCount++;
        }
      }
      const avgLumShift = sampleCount > 0 ? lumDeltaSum / sampleCount / 3 : 0;

      let totalSkin = 0;
      let faceSkin = 0, faceXSum = 0, faceYSum = 0;
      let faceMinX = mw, faceMaxX = 0, faceMinY = mh, faceMaxY = 0;

      let leftSum = 0, leftX = 0, leftY = 0;
      let rightSum = 0, rightX = 0, rightY = 0;
      let zoneHandA = 0, zoneHandB = 0;

      for (let y = 4; y < mh - 4; y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const isSkin = this._isHumanSkinYCbCr(r, g, b);
          if (isSkin) totalSkin++;

          // Face cluster search in upper-center region
          if (isSkin && x >= mw * 0.25 && x <= mw * 0.75 && y >= mh * 0.06 && y <= mh * 0.65) {
            faceSkin++;
            faceXSum += x;
            faceYSum += y;
            if (x < faceMinX) faceMinX = x;
            if (x > faceMaxX) faceMaxX = x;
            if (y < faceMinY) faceMinY = y;
            if (y > faceMaxY) faceMaxY = y;
          }

          const diffPrev =
            Math.abs(r - this.prevFrame[idx]) +
            Math.abs(g - this.prevFrame[idx + 1]) +
            Math.abs(b - this.prevFrame[idx + 2]);

          const diffBgNorm = this.bgFrame
            ? Math.abs((r - avgLumShift) - this.bgFrame[idx]) +
              Math.abs((g - avgLumShift) - this.bgFrame[idx + 1]) +
              Math.abs((b - avgLumShift) - this.bgFrame[idx + 2])
            : 0;

          // Hand presence in outer zones: require (skin-tone OR strong real motion/foreground change)
          const fgActive = diffPrev > 38 || diffBgNorm > 72;
          const handPixel = isSkin && (fgActive || this.faceDetected);

          if (Math.hypot(x - ax, y - ay) < 12 && (handPixel || diffPrev > 48)) {
            zoneHandA++;
          }
          if (Math.hypot(x - bx, y - by) < 12 && (handPixel || diffPrev > 48)) {
            zoneHandB++;
          }

          if (handPixel || fgActive) {
            if (x < mw * 0.30) {
              leftSum++; leftX += x; leftY += y;
            } else if (x > mw * 0.70) {
              rightSum++; rightX += x; rightY += y;
            }
          }
        }
      }
      this.prevFrame.set(data);

      // Verify genuine human face (compact skin cluster, not a whole beige wall)
      const faceW = faceMaxX - faceMinX;
      const faceH = faceMaxY - faceMinY;
      const skinRatio = totalSkin / (mw * mh);
      const ycbcrFaceValid =
        faceSkin >= 22 &&
        skinRatio < 0.52 &&
        faceW >= 5 && faceW <= 34 &&
        faceH >= 6 && faceH <= 36;
      const nativeFaceValid = this.tick - this.nativeFaceAt < 25;

      this.faceDetected = nativeFaceValid || ycbcrFaceValid;
      if (ycbcrFaceValid && !nativeFaceValid) {
        this.faceCenter = {
          x: (faceXSum / faceSkin / mw) * w,
          y: (faceYSum / faceSkin / mh) * h
        };
      }

      if (this.faceDetected) {
        // Set bridge shoulder height naturally right below the detected face!
        const targetShoulder = Math.max(h * 0.44, Math.min(h * 0.68, this.faceCenter.y + 66));
        this.shoulderY += (targetShoulder - this.shoulderY) * 0.25;
      }

      this.zoneHandA = zoneHandA;
      this.zoneHandB = zoneHandB;

      if (this.faceDetected && leftSum > 10) {
        const tx = (leftX / leftSum / mw) * w;
        const ty = (leftY / leftSum / mh) * h;
        this.leftHand.x += (tx - this.leftHand.x) * 0.35;
        this.leftHand.y += (ty - this.leftHand.y) * 0.35;
        this.leftHand.active = true;
      } else {
        this.leftHand.active = false;
      }

      if (this.faceDetected && rightSum > 10) {
        const tx = (rightX / rightSum / mw) * w;
        const ty = (rightY / rightSum / mh) * h;
        this.rightHand.x += (tx - this.rightHand.x) * 0.35;
        this.rightHand.y += (ty - this.rightHand.y) * 0.35;
        this.rightHand.active = true;
      } else {
        this.rightHand.active = false;
      }
    }

    _getArmBridgeY(x) {
      // Smooth quadratic curve from Left Hand (pointA) -> Over Shoulders -> Right Hand (pointB)
      const x0 = this.pointA.x;
      const x2 = this.pointB.x;
      const t = Math.max(0, Math.min(1, (x - x0) / (x2 - x0)));
      const y0 = this.leftHand.active ? this.leftHand.y : this.pointA.y;
      const y2 = this.rightHand.active ? this.rightHand.y : this.pointB.y;
      const yMid = this.shoulderY;
      const yc = 2 * yMid - 0.5 * (y0 + y2);
      return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y2;
    }

    recalibrate() {
      this.bgFrame = null;
      this.prevFrame = null;
      this.holdA = 0;
      this.holdB = 0;
      this.pointA.connected = false;
      this.pointB.connected = false;
      this.onStatus('📷 Background refreshed! Stand in front of camera & stretch both hands!');
    }

    _collectBridgeTreasure(tx, ty) {
      if (!this.bridgeTreasure || this.bridgeTreasure.collected) return;
      this.bridgeTreasure.collected = true;
      const mat = this.bridgeTreasure.mat;
      this.score += mat.pts;
      this.stars += mat.stars;
      if (AudioEngine) AudioEngine.magic();
      for (let i = 0; i < 14; i++) {
        this.pawSparkles.push({
          x: tx + (Math.random() - 0.5) * 32,
          y: ty + (Math.random() - 0.5) * 28,
          life: 24
        });
      }
      this.popups.push({
        x: tx,
        y: ty - 16,
        text: `${mat.emoji} +${mat.pts} ${mat.short}!`,
        color: mat.glow,
        life: 48
      });
      this.onScore({
        score: this.score,
        stars: this.stars,
        crossed: this.crossedCount,
        problem: this.problem,
        bridgeBuilt: this.bridgeBuilt,
        collectedMaterial: mat.id
      });
    }

    _update() {
      this.tick += 1;
      if (this.roundGrace > 0) this.roundGrace -= 1;
      const w = this.canvas.width;

      for (const bf of this.butterflies) {
        bf.phase += 0.06;
        bf.x += Math.sin(bf.phase * 0.5) * 0.7;
        bf.y += Math.cos(bf.phase) * 0.45;
      }

      this._analyzeMotion();

      // Strictly require a human face AND both stretched hands touching both numbers!
      const preset = SQ_SPEED_PRESETS[this.speed] || SQ_SPEED_PRESETS.slow;
      if (!this.bridgeBuilt && this.hasCamera && this.roundGrace === 0) {
        if (!this.faceDetected) {
          this.holdA = Math.max(0, this.holdA - 0.08);
          this.holdB = Math.max(0, this.holdB - 0.08);
          this.pointA.connected = false;
          this.pointB.connected = false;
        } else {
          const touchA =
            this.zoneHandA >= 8 ||
            (this.leftHand.active && Math.hypot(this.leftHand.x - this.pointA.x, this.leftHand.y - (this.pointA.y - 18)) < 78);
          const touchB =
            this.zoneHandB >= 8 ||
            (this.rightHand.active && Math.hypot(this.rightHand.x - this.pointB.x, this.rightHand.y - (this.pointB.y - 18)) < 78);

          if (touchA) {
            this.holdA = Math.min(1, this.holdA + preset.holdStep);
          } else {
            this.holdA = Math.max(0, this.holdA - 0.025);
          }

          if (touchB) {
            this.holdB = Math.min(1, this.holdB + preset.holdStep);
          } else {
            this.holdB = Math.max(0, this.holdB - 0.025);
          }

          this.pointA.connected = this.holdA >= 0.35;
          this.pointB.connected = this.holdB >= 0.35;

          if (this.holdA >= 0.85 && this.holdB >= 0.85) {
            this.pointA.connected = true;
            this.pointB.connected = true;
            this._completeBridge();
          }
        }
      }

      // Squirrel running over the kid's real outstretched hands & shoulders!
      if (this.squirrel.crossing && !this.squirrel.crossed) {
        this.squirrel.x += preset.crossSpeed;
        this.squirrel.bob += 0.38;

        if (this.squirrel.x >= this.pointA.x && this.squirrel.x <= this.pointB.x) {
          this.squirrel.y = this._getArmBridgeY(this.squirrel.x) - 18;
          if (this.tick % 3 === 0) {
            this.pawSparkles.push({ x: this.squirrel.x, y: this.squirrel.y + 18, life: 22 });
          }
          if (
            this.bridgeTreasure &&
            !this.bridgeTreasure.collected &&
            Math.abs(this.squirrel.x - this.bridgeTreasure.x) < 24
          ) {
            this._collectBridgeTreasure(this.bridgeTreasure.x, this.squirrel.y);
          }
        } else {
          this.squirrel.y = this.pointB.y - 20;
        }

        if (this.squirrel.x >= w - 52) {
          this.squirrel.crossing = false;
          this.squirrel.crossed = true;
          this.score += 100;
          this.stars += 2;
          this.crossedCount += 1;
          this.onScore({
            score: this.score,
            stars: this.stars,
            crossed: this.crossedCount,
            problem: this.problem,
            bridgeBuilt: true,
            completedRound: true
          });
          setTimeout(() => {
            if (this.running) this.nextRound();
          }, 1350);
        }
      }

      for (let i = this.pawSparkles.length - 1; i >= 0; i--) {
        this.pawSparkles[i].life -= 1;
        if (this.pawSparkles[i].life <= 0) this.pawSparkles.splice(i, 1);
      }
    }

    _drawParkJungleBackground() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Full-screen Real Camera Feed of kid's hands & shoulders (or Park backdrop if off)
      if (this.hasCamera && this.showCamera && this.video.readyState >= 2) {
        this._drawVideoCover(ctx, w, h);
      } else {
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#7dd3fc');
        sky.addColorStop(0.6, '#bae6fd');
        sky.addColorStop(1, '#dcfce7');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(w * 0.5, 58, 28, 0, Math.PI * 2);
        ctx.fill();

        // Friendly silhouette guide showing outstretched arms over shoulders when camera is off
        ctx.save();
        ctx.fillStyle = 'rgba(22, 163, 74, 0.22)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 32, 0, Math.PI * 2); // head
        ctx.roundRect(w / 2 - 58, h * 0.53, 116, 110, 28); // torso/shoulders
        ctx.roundRect(90, h * 0.55, w - 180, 26, 13); // outstretched arms
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Park River & Mossy Banks along bottom edge only (keeps hands & shoulders 100% clear!)
      const riverGrad = ctx.createLinearGradient(0, h * 0.80, 0, h);
      riverGrad.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
      riverGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
      ctx.fillStyle = riverGrad;
      ctx.fillRect(88, h * 0.82, w - 176, h * 0.18);

      // Animated water ripples
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const rx = 140 + i * 105 + Math.sin(this.tick * 0.06 + i) * 14;
        const ry = h * 0.88 + (i % 2) * 14;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + 42, ry);
        ctx.stroke();
      }

      // Left & Right Park/Jungle Cliff Platforms (on outer edges only)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, h * 0.60, 96, h * 0.40);
      ctx.fillRect(w - 96, h * 0.60, 96, h * 0.40);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(-8, h * 0.58, 108, 20, 10);
      ctx.roundRect(w - 100, h * 0.58, 108, 20, 10);
      ctx.fill();

      // Framing Jungle Trees on far Left & Right corners
      const drawTree = (tx) => {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(tx - 8, h * 0.25, 16, h * 0.35);
        ctx.fillStyle = 'rgba(21, 128, 61, 0.92)';
        ctx.beginPath();
        ctx.arc(tx, h * 0.24, 34, 0, Math.PI * 2);
        ctx.arc(tx - 20, h * 0.30, 22, 0, Math.PI * 2);
        ctx.arc(tx + 20, h * 0.30, 22, 0, Math.PI * 2);
        ctx.fill();
      };
      drawTree(24);
      drawTree(w - 24);

      // Butterflies
      for (const bf of this.butterflies) {
        const wing = 5 + Math.abs(Math.sin(bf.phase * 2)) * 6;
        ctx.fillStyle = bf.color;
        ctx.beginPath();
        ctx.ellipse(bf.x - 5, bf.y, wing, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(bf.x + 5, bf.y, wing, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    _drawSquirrel(x, y) {
      const ctx = this.ctx;
      const bounce = this.squirrel.crossing ? Math.abs(Math.sin(this.squirrel.bob)) * 9 : Math.sin(this.tick * 0.08) * 2;
      const sy = y - bounce;
      ctx.save();
      ctx.translate(x, sy);

      // Fluffy curled tail
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(-18, -8, 12, 18, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, 4, 15, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head & Ears
      ctx.beginPath();
      ctx.arc(10, -10, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(4, -19); ctx.lineTo(8, -28); ctx.lineTo(12, -18);
      ctx.moveTo(11, -18); ctx.lineTo(16, -27); ctx.lineTo(18, -17);
      ctx.fill();

      // Cute eye
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(14, -12, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(15, -12, 1.8, 0, Math.PI * 2); ctx.fill();

      if (this.bridgeBuilt) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(22, -2, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      this._drawParkJungleBackground();

      // Two glowing hand-touch markers (Point A & Point B) — NO bridge line drawn!
      const drawMarker = (pt, label, numVal, holdProg) => {
        ctx.save();
        ctx.shadowColor = pt.connected ? '#34d399' : '#fde047';
        ctx.shadowBlur = pt.connected ? 20 : 12;
        ctx.fillStyle = pt.connected ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.88)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y - 18, 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Circular touch-hold fill ring
        if (holdProg > 0.02) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y - 18, 29, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, holdProg));
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(numVal), pt.x, pt.y - 17);

        ctx.font = '800 11px system-ui, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(label, pt.x, pt.y + 20);
        ctx.restore();
      };

      drawMarker(this.pointA, 'TOUCH LEFT', this.problem.a, this.bridgeBuilt ? 1 : this.holdA);
      drawMarker(this.pointB, 'TOUCH RIGHT', this.problem.b, this.bridgeBuilt ? 1 : this.holdB);

      // Human Face Detection Status Pill (positioned below slim top scoreboard)
      if (this.hasCamera) {
        ctx.save();
        ctx.fillStyle = this.faceDetected ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.roundRect(14, 62, 118, 28, 999);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.faceDetected ? '😊 Face Ready' : '👀 Show Face', 73, 80);
        ctx.restore();
      }

      // Tiny paw sparkles left on kid's real hands/shoulders as the squirrel trots across!
      for (const sp of this.pawSparkles) {
        ctx.fillStyle = `rgba(253, 224, 71, ${sp.life / 22})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Math Banner (below slim top scoreboard, keeping shoulders & hands unobstructed)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 155, 58, 310, 40, 16);
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.bridgeBuilt
          ? `🐿️ Over Your Hands: ${this.problem.a} ${this.problem.sym} ${this.problem.b} = ${this.waitingQuiz ? '?' : this.problem.answer}`
          : `🙌 Stretch Arms: ${this.problem.a} ${this.problem.sym} ${this.problem.b}`,
        w / 2,
        83
      );
      ctx.restore();

      // Quiz Acorn Choices if in Quiz Mode
      if (this.waitingQuiz) {
        for (const ac of this.acorns) {
          ctx.save();
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ac.x, ac.y, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '900 22px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(ac.val), ac.x, ac.y + 1);
          ctx.restore();
        }
      }

      // Bonus Treasure Material hovering along the bridge path!
      if (this.bridgeTreasure && !this.bridgeTreasure.collected ) {
        const tx = this.bridgeTreasure.x;
        const ty = this._getArmBridgeY(tx) - 22 + Math.sin(this.tick * 0.1) * 5;
        ctx.save();
        ctx.translate(tx, ty);
        drawTreasureCanvasItem(ctx, this.bridgeTreasure.mat.id, 18, this.tick);
        ctx.restore();
      }

      // Sammy the Squirrel!
      this._drawSquirrel(this.squirrel.x, this.squirrel.y);

      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 1.05;
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

  app.SquirrelBridgeGame = SquirrelBridgeGame;
})(window.KidApp = window.KidApp || {});
