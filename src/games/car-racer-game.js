/* Turbo Hand Racer AR — Kid-Friendly Car Racing Game with MediaPipe Hand-Gesture Steering */

(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, drawTreasureCanvasItem } = app;

  const SPEED_PRESETS = {
    slow:   { label: '🐢 Cruise (Ages 4–6)',  roadSpeed: 0.0085, duration: 90, maxObs: 2 },
    medium: { label: '🚀 Turbo (Ages 6–8)',   roadSpeed: 0.0125, duration: 75, maxObs: 3 },
    fast:   { label: '⚡ Super (Ages 8–10)',  roadSpeed: 0.0170, duration: 60, maxObs: 4 }
  };

  const CARS = {
    racer:  { label: '🏎️ Racer',  body: '#ef4444', accent: '#fde047', roof: '#991b1b' },
    police: { label: '🚓 Police', body: '#1e293b', accent: '#38bdf8', roof: '#ffffff', siren: true },
    taxi:   { label: '🚕 Taxi',   body: '#facc15', accent: '#0f172a', roof: '#fef08a' },
    rocket: { label: '🚀 Rocket', body: '#8b5cf6', accent: '#f472b6', roof: '#38bdf8' }
  };

  const TRACKS = {
    highway: {
      skyTop: '#0284c7', skyBot: '#38bdf8',
      grass: '#15803d', roadA: '#334155', roadB: '#1e293b',
      curbA: '#ef4444', curbB: '#ffffff', line: '#fde047', prop: '🌲'
    },
    beach: {
      skyTop: '#0ea5e9', skyBot: '#bae6fd',
      grass: '#fde68a', roadA: '#475569', roadB: '#334155',
      curbA: '#06b6d4', curbB: '#ffffff', line: '#ffffff', prop: '🌴'
    },
    snow: {
      skyTop: '#1e3a8a', skyBot: '#7dd3fc',
      grass: '#e0f2fe', roadA: '#475569', roadB: '#64748b',
      curbA: '#38bdf8', curbB: '#ffffff', line: '#bae6fd', prop: '⛄'
    },
    neon: {
      skyTop: '#090d24', skyBot: '#312e81',
      grass: '#1e1b4b', roadA: '#0f172a', roadB: '#1e1b4b',
      curbA: '#ec4899', curbB: '#38bdf8', line: '#22d3ee', prop: '🌟'
    }
  };

  const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
  const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
  const MEDIAPIPE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

  class CarRacerGame {
    constructor(options) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      // Lightweight fallback motion canvas (used when offline or file:// blocks MediaPipe CDN)
      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 80;
      this.motionCanvas.height = 60;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;

      // MediaPipe HandLandmarker state
      this.handLandmarker = null;
      this.mpLoading = false;
      this.mpReady = false;
      this.lastVideoTime = -1;
      this.detectedHands = []; // Mirrored normalized coordinates [{ x, y, landmarks }]

      this.stream = null;
      this.hasCamera = false;
      this.showCamera = true;
      this.running = false;
      this.rafId = null;
      this.timerId = null;

      this.speed = 'slow';
      this.carKey = 'racer';
      this.trackKey = 'highway';

      this.score = 0;
      this.stars = 0;
      this.timeLeft = 90;
      this.tick = 0;

      // Continuous steering state (-1 = far left, 0 = center, +1 = far right)
      this.carX = 0;
      this.targetSteer = 0;
      this.wheelAngle = 0;
      this.manualSteerDir = 0;
      this.heading = 0;
      this.distance = 0;
      this.roadCurve = 0;
      this.targetCurve = 0;
      this.boostTimer = 0;
      this.hitSlowTimer = 0;
      this.shakeFrames = 0;
      this.scroll = 0;

      this.items = []; // Collectibles (treasures, stars, boost) + Obstacles (cones, barrels)
      this.particles = [];
      this.popups = [];
      this.spawnTick = 0;

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
        this.motionCanvas.height = Math.max(46, Math.round((80 * h) / w));
        this.prevFrame = null;
      }
    }

    _bindPointer() {
      let dragging = false;
      const steerFromEvent = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const rel = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.targetSteer = Math.max(-1, Math.min(1, rel * 1.15));
      };

      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        dragging = true;
        this.canvas.setPointerCapture(e.pointerId);
        steerFromEvent(e);
      });
      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.running || !dragging) return;
        steerFromEvent(e);
      });
      const end = () => {
        dragging = false;
      };
      this.canvas.addEventListener('pointerup', end);
      this.canvas.addEventListener('pointercancel', end);
    }

    setSpeed(speedKey) {
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.onStatus(`🏎️ ${preset.label} — Steer with both hands like a wheel!`);
    }

    setCar(carKey) {
      this.carKey = CARS[carKey] ? carKey : 'racer';
    }

    setTrack(trackKey) {
      this.trackKey = TRACKS[trackKey] ? trackKey : 'highway';
    }

    toggleCameraView() {
      this.showCamera = !this.showCamera;
      return this.showCamera;
    }

    setManualSteer(dir) {
      this.manualSteerDir = dir;
    }

    triggerBoost() {
      if (!this.running) return;
      this.boostTimer = 75;
      if (AudioEngine) AudioEngine.magic();
      this._addPopup(this.canvas.width / 2, this.canvas.height * 0.65, '⚡ TURBO BOOST!', '#fde047');
    }

    async _initMediaPipeHands() {
      if (this.mpReady || this.mpLoading) return;
      // Dynamic ES module CDN import works on http/https; skip cleanly on offline/file:// fallback
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
          this.onStatus('🖐️ MediaPipe Hand Steering Ready! Hold & tilt both hands like a steering wheel!');
        }
      } catch (_) {
        this.mpReady = false;
      } finally {
        this.mpLoading = false;
      }
    }

    async start(speedKey = this.speed, carKey = this.carKey, trackKey = this.trackKey) {
      this.stop();
      this._syncCanvasSize();
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.carKey = CARS[carKey] ? carKey : 'racer';
      this.trackKey = TRACKS[trackKey] ? trackKey : 'highway';
      const preset = SPEED_PRESETS[this.speed];

      this.score = 0;
      this.stars = 0;
      this.timeLeft = preset.duration;
      this.tick = 0;
      this.carX = 0;
      this.targetSteer = 0;
      this.wheelAngle = 0;
      this.manualSteerDir = 0;
      this.heading = 0;
      this.distance = 0;
      this.roadCurve = 0;
      this.targetCurve = 0;
      this.boostTimer = 0;
      this.hitSlowTimer = 0;
      this.shakeFrames = 0;
      this.scroll = 0;
      this.items = [];
      this.particles = [];
      this.popups = [];
      this.detectedHands = [];
      this.spawnTick = 0;
      this.prevFrame = null;
      this.running = true;

      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');
      this.onStatus('📷 Starting Hand Steering Camera...');
      await this._startCamera();
      if (!this.running) return;
      if (this.hasCamera) {
        this._initMediaPipeHands();
      }
      this._emitScore();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this._emitScore();
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

    async _startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.hasCamera = false;
        this.onStatus('🏎️ Touch & Key Steering Ready! Drag steering wheel or tap ⬅️ ➡️!');
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
        this.onStatus(
          this.mpReady
            ? '🖐️ MediaPipe Hand Steering Ready! Hold & tilt both hands like a wheel!'
            : '🙌 Hand Steering Camera Ready! Tilt both hands or move left/right!'
        );
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('🏎️ Touch Steering Mode (Camera off) — Drag wheel or tap ⬅️ ➡️!');
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
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this.video.srcObject = null;
    }

    _emitScore(extra = {}) {
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const baseMph = this.speed === 'slow' ? 45 : this.speed === 'medium' ? 75 : 105;
      const mph = this.hitSlowTimer > 0 ? Math.round(baseMph * 0.6) : this.boostTimer > 0 ? baseMph + 40 : baseMph;
      this.onScore({
        score: this.score,
        stars: this.stars,
        mph,
        timeLeft: this.timeLeft,
        presetLabel: preset.label,
        ...extra
      });
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

    _detectHandSteering() {
      if (!this.hasCamera || this.video.readyState < 2) return;

      // 1. Primary: MediaPipe HandLandmarker (21 landmarks per hand)
      if (this.mpReady && this.handLandmarker) {
        try {
          if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const res = this.handLandmarker.detectForVideo(this.video, performance.now());
            this.detectedHands = [];
            if (res && res.landmarks && res.landmarks.length > 0) {
              for (const lm of res.landmarks) {
                // Mirror X so moving right in real life steers right on screen
                const palm = lm[9] || lm[0];
                this.detectedHands.push({
                  x: 1 - palm.x,
                  y: palm.y,
                  landmarks: lm.map((p) => ({ x: 1 - p.x, y: p.y }))
                });
              }
            }
          }

          if (this.detectedHands.length >= 2) {
            const sorted = [...this.detectedHands].sort((a, b) => a.x - b.x);
            const leftH = sorted[0];
            const rightH = sorted[sorted.length - 1];
            const dx = Math.max(0.08, rightH.x - leftH.x);
            const dy = rightH.y - leftH.y;
            const angle = Math.atan2(dy, dx); // >0 tilts right hand lower = steer right!
            this.targetSteer = Math.max(-1, Math.min(1, angle * 1.85));
            this.wheelAngle += (angle - this.wheelAngle) * 0.3;
            return;
          }
          if (this.detectedHands.length === 1) {
            const hand = this.detectedHands[0];
            const steer = (hand.x - 0.5) * 2.3;
            this.targetSteer = Math.max(-1, Math.min(1, steer));
            this.wheelAngle += (this.targetSteer * 0.7 - this.wheelAngle) * 0.25;
            return;
          }
        } catch (_) {
          // Fall through seamlessly to optical motion steering
        }
      }

      // 2. Fallback: Lightweight Optical Left/Right Hand Steering Wheel Tracker
      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;
      this._drawVideoCover(this.motionCtx, mw, mh);
      const data = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (!this.prevFrame) {
        this.prevFrame = new Uint8ClampedArray(data);
        return;
      }

      let leftSum = 0;
      let leftY = 0;
      let rightSum = 0;
      let rightY = 0;
      let totalX = 0;
      let totalSum = 0;

      for (let y = Math.round(mh * 0.22); y < Math.round(mh * 0.9); y++) {
        for (let x = 0; x < mw; x++) {
          const idx = (y * mw + x) * 4;
          const diff =
            Math.abs(data[idx] - this.prevFrame[idx]) +
            Math.abs(data[idx + 1] - this.prevFrame[idx + 1]) +
            Math.abs(data[idx + 2] - this.prevFrame[idx + 2]);
          if (diff > 52) {
            totalSum++;
            totalX += x;
            if (x < mw * 0.45) {
              leftSum++;
              leftY += y;
            } else if (x > mw * 0.55) {
              rightSum++;
              rightY += y;
            }
          }
        }
      }
      this.prevFrame.set(data);

      if (leftSum > 14 && rightSum > 14) {
        const ly = leftY / leftSum / mh;
        const ry = rightY / rightSum / mh;
        const tilt = (ry - ly) * 3.4;
        this.targetSteer = Math.max(-1, Math.min(1, tilt));
        this.wheelAngle += (this.targetSteer * 0.8 - this.wheelAngle) * 0.22;
      } else if (totalSum > 22) {
        const cx = totalX / totalSum / mw;
        const steer = (cx - 0.5) * 2.2;
        this.targetSteer = Math.max(-1, Math.min(1, steer));
        this.wheelAngle += (this.targetSteer * 0.7 - this.wheelAngle) * 0.2;
      }
    }

    _spawnWave() {
      const lanes = [-0.66, 0, 0.66];
      const obsLane = lanes[Math.floor(Math.random() * lanes.length)];
      const rewardLanes = lanes.filter((l) => l !== obsLane);
      const rewardLane = rewardLanes[Math.floor(Math.random() * rewardLanes.length)];

      // Spawn a kid-friendly obstacle cone or barrel
      const isCone = Math.random() < 0.6;
      this.items.push({
        kind: 'obstacle',
        emoji: isCone ? '🚧' : '🛢️',
        laneX: obsLane,
        z: 0.04,
        resolved: false
      });

      // Spawn a shiny Bonus Treasure Material or Turbo Star/Boost!
      const roll = Math.random();
      if (roll < 0.16) {
        this.items.push({
          kind: 'boost',
          emoji: '⚡',
          laneX: rewardLane,
          z: 0.04,
          resolved: false
        });
      } else if (roll < 0.78 && pickRandomTreasure) {
        this.items.push({
          kind: 'treasure',
          mat: pickRandomTreasure(),
          laneX: rewardLane,
          z: 0.04,
          resolved: false
        });
      } else {
        this.items.push({
          kind: 'star',
          emoji: '⭐',
          laneX: rewardLane,
          z: 0.04,
          resolved: false
        });
      }
    }

    _spawnBurst(x, y, color, count = 16) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const spd = 2 + Math.random() * 4.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          r: 2.5 + Math.random() * 4,
          color,
          life: 24 + Math.random() * 10
        });
      }
    }

    _addPopup(x, y, text, color) {
      this.popups.push({ x, y, text, color, life: 42 });
    }

    _roadRow(z) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const hy = h * 0.30;
      const gy = h * 0.88;
      const t = Math.pow(Math.max(0, z), 1.45);
      const y = hy + (gy - hy) * t;
      const halfW = w * (0.11 + 0.37 * t);
      const scale = 0.24 + 0.76 * t;
      const curveFactor = Math.pow(Math.max(0, 1 - z), 1.85);
      const curveOffset = this.roadCurve * w * 0.26 * curveFactor;
      const panOffset = -this.carX * w * 0.14 * (1 - z * 0.45);
      const centerX = w / 2 + curveOffset + panOffset;
      return { y, halfW, scale, t, centerX };
    }

    _update() {
      this.tick += 1;
      if (this.boostTimer > 0) this.boostTimer -= 1;
      if (this.hitSlowTimer > 0) this.hitSlowTimer -= 1;
      if (this.shakeFrames > 0) this.shakeFrames -= 1;

      this._detectHandSteering();
      if (this.manualSteerDir !== 0) {
        this.targetSteer = Math.max(-1, Math.min(1, this.targetSteer + this.manualSteerDir * 0.065));
        this.wheelAngle += (this.targetSteer * 0.75 - this.wheelAngle) * 0.25;
      }

      const prevX = this.carX;
      this.carX += (this.targetSteer - this.carX) * 0.16;

      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const speedMult = this.boostTimer > 0 ? 1.45 : this.hitSlowTimer > 0 ? 0.65 : 1.0;
      const step = preset.roadSpeed * speedMult;
      this.scroll = (this.scroll + step * 2.2) % 1;
      this.distance += step * 1.4;

      // Smooth winding S-curves & subtle centrifugal pull in turns
      this.targetCurve =
        Math.sin(this.distance * 0.42) * 0.65 +
        Math.sin(this.distance * 0.17) * 0.35;
      this.roadCurve += (this.targetCurve - this.roadCurve) * 0.04;
      this.carX = Math.max(-1.02, Math.min(1.02, this.carX - this.roadCurve * step * 0.22));

      const steerVel = this.carX - prevX;
      this.heading += ((this.targetSteer * 0.45 + steerVel * 2.4) - this.heading) * 0.22;

      this.spawnTick += 1;
      const spawnInterval = this.speed === 'slow' ? 68 : this.speed === 'medium' ? 52 : 40;
      if (this.spawnTick >= spawnInterval && this.items.length < preset.maxObs * 3) {
        this.spawnTick = 0;
        this._spawnWave();
      }

      const carRow = this._roadRow(0.96);
      const carScreenX = carRow.centerX + this.carX * carRow.halfW * 0.78;

      // Tire drift / nitro trail particles for dynamic road feel
      if (this.tick % 2 === 0 && (Math.abs(this.heading) > 0.26 || this.boostTimer > 0)) {
        const sparkColor = this.boostTimer > 0 ? '#38bdf8' : '#fde047';
        this.particles.push({
          x: carScreenX - 24 + (Math.random() - 0.5) * 6,
          y: carRow.y - 2,
          vx: -this.heading * 2 + (Math.random() - 0.5) * 1.2,
          vy: 1.4 + Math.random() * 1.2,
          r: 2 + Math.random() * 2,
          color: sparkColor,
          life: 10
        });
        this.particles.push({
          x: carScreenX + 24 + (Math.random() - 0.5) * 6,
          y: carRow.y - 2,
          vx: -this.heading * 2 + (Math.random() - 0.5) * 1.2,
          vy: 1.4 + Math.random() * 1.2,
          r: 2 + Math.random() * 2,
          color: sparkColor,
          life: 10
        });
      }

      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        it.z += step;
        if (!it.resolved && it.z >= 0.88 && it.z <= 1.04) {
          const itemRow = this._roadRow(it.z);
          const itemX = itemRow.centerX + it.laneX * itemRow.halfW * 0.78;
          if (Math.abs(itemX - carScreenX) < 48 * itemRow.scale + 22) {
            it.resolved = true;
            if (it.kind === 'obstacle') {
              if (this.boostTimer > 0) {
                this.score += 15;
                if (AudioEngine) AudioEngine.boom();
                this._spawnBurst(itemX, itemRow.y - 16, '#fb923c', 14);
                this._addPopup(itemX, itemRow.y - 36, '💥 SMASH +15!', '#fde047');
                this._emitScore();
              } else {
                this.hitSlowTimer = 35;
                this.shakeFrames = 10;
                if (AudioEngine) AudioEngine.crack();
                this._spawnBurst(itemX, itemRow.y - 16, '#ef4444', 12);
                this._addPopup(itemX, itemRow.y - 36, '🚧 Watch out!', '#fb7185');
                this._emitScore();
              }
            } else if (it.kind === 'boost') {
              this.boostTimer = 85;
              this.score += 30;
              if (AudioEngine) AudioEngine.magic();
              this._spawnBurst(itemX, itemRow.y - 18, '#38bdf8', 18);
              this._addPopup(itemX, itemRow.y - 40, '⚡ TURBO +30!', '#38bdf8');
              this._emitScore();
            } else if (it.kind === 'treasure') {
              const mat = it.mat;
              this.score += mat.pts;
              this.stars += mat.stars;
              if (AudioEngine) AudioEngine.magic();
              this._spawnBurst(itemX, itemRow.y - 18, mat.glow, 18);
              this._addPopup(itemX, itemRow.y - 42, `${mat.emoji} +${mat.pts} ${mat.short}!`, mat.glow);
              this._emitScore({ collectedMaterial: mat.id });
            } else {
              this.score += 20;
              this.stars += 1;
              if (AudioEngine) AudioEngine.correct();
              this._spawnBurst(itemX, itemRow.y - 18, '#fde047', 16);
              this._addPopup(itemX, itemRow.y - 40, '⭐ +20!', '#fde047');
              this._emitScore({ collectedStar: true });
            }
          }
        }
        if (it.resolved || it.z >= 1.12) {
          this.items.splice(i, 1);
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 1;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 1.2;
        pop.life -= 1;
        if (pop.life <= 0) this.popups.splice(i, 1);
      }
    }

    _drawCar(ctx, x, y, steerAngle) {
      const car = CARS[this.carKey] || CARS.racer;
      const bob = Math.sin(this.tick * 0.45) * (this.boostTimer > 0 ? 2.1 : 1.0);
      const shift = steerAngle * 7;

      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(steerAngle * 0.24);

      // Soft ground shadow + turbo underglow
      ctx.fillStyle = this.boostTimer > 0 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 21 - bob * 0.5, 52, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wide sculpted rear tires with alloy rims
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 38, 6);
        ctx.rotate(steerAngle * 0.1);
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(-9, -15, 18, 28, 5);
        ctx.fill();
        // Tire tread / fender inner rim glint
        ctx.fillStyle = '#475569';
        ctx.fillRect(-5, -10, 10, 4);
        ctx.fillRect(-5, 4, 10, 4);
        ctx.restore();
      }

      // Rocket side fins (for rocket car)
      if (this.carKey === 'rocket') {
        ctx.fillStyle = car.accent;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * 36, -4);
          ctx.lineTo(side * 54, -18);
          ctx.lineTo(side * 45, 10);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Lower rear diffuser & widebody lower chassis
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-42, 16);
      ctx.lineTo(42, 16);
      ctx.lineTo(45, 3);
      ctx.lineTo(-45, 3);
      ctx.closePath();
      ctx.fill();

      // Dual chrome exhaust ports (or thruster pods for rocket)
      for (const ex of [-20, 20]) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(ex, 13, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(ex, 13, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nitro / turbo exhaust flames
      if (this.boostTimer > 0 || this.carKey === 'rocket') {
        const flameLen = this.boostTimer > 0 ? 22 + Math.random() * 14 : 11 + Math.random() * 5;
        for (const ex of [-20, 20]) {
          ctx.fillStyle = this.boostTimer > 0 ? '#38bdf8' : '#f97316';
          ctx.beginPath();
          ctx.moveTo(ex - 5, 14);
          ctx.lineTo(ex, 14 + flameLen);
          ctx.lineTo(ex + 5, 14);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(ex - 2.5, 14);
          ctx.lineTo(ex, 14 + flameLen * 0.55);
          ctx.lineTo(ex + 2.5, 14);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Flared rear supercar body shell (metallic vertical gradient)
      const bodyGrad = ctx.createLinearGradient(0, -18, 0, 14);
      bodyGrad.addColorStop(0, car.body);
      bodyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-45, 8);
      ctx.quadraticCurveTo(-48, -4, -39, -11);
      ctx.lineTo(-27 + shift * 0.4, -18);
      ctx.lineTo(27 + shift * 0.4, -18);
      ctx.lineTo(39, -11);
      ctx.quadraticCurveTo(48, -4, 45, 8);
      ctx.quadraticCurveTo(0, 14, -45, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glossy rear deck + racing stripes
      ctx.fillStyle = car.accent;
      ctx.beginPath();
      ctx.moveTo(-8 + shift * 0.35, -17);
      ctx.lineTo(8 + shift * 0.35, -17);
      ctx.lineTo(10, 9);
      ctx.lineTo(-10, 9);
      ctx.closePath();
      ctx.fill();

      // Tapered fastback roof & dark glass rear window
      ctx.fillStyle = car.roof;
      ctx.beginPath();
      ctx.moveTo(-29 + shift * 0.5, -13);
      ctx.lineTo(-20 + shift, -32);
      ctx.lineTo(20 + shift, -32);
      ctx.lineTo(29 + shift * 0.5, -13);
      ctx.closePath();
      ctx.fill();

      const glassGrad = ctx.createLinearGradient(0, -30, 0, -14);
      glassGrad.addColorStop(0, '#38bdf8');
      glassGrad.addColorStop(0.35, '#0f172a');
      glassGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.moveTo(-24 + shift * 0.55, -14);
      ctx.lineTo(-17 + shift * 0.95, -28);
      ctx.lineTo(17 + shift * 0.95, -28);
      ctx.lineTo(24 + shift * 0.55, -14);
      ctx.closePath();
      ctx.fill();

      // Glass reflection highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-12 + shift * 0.9, -26);
      ctx.lineTo(6 + shift * 0.7, -17);
      ctx.stroke();

      // Sculpted aerodynamic rear spoiler wing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-26 + shift * 0.35, -22, 5, 7);
      ctx.fillRect(21 + shift * 0.35, -22, 5, 7);
      ctx.fillStyle = car.body;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-38 + shift * 0.4, -27, 76, 7, 3);
      ctx.fill();
      ctx.stroke();

      // Glowing full-width LED taillight bar + bright twin brake lights
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.roundRect(-36, -4, 72, 6, 3);
      ctx.fill();

      ctx.fillStyle = '#ff2e4c';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-35, -4, 17, 6, 3);
      ctx.roundRect(18, -4, 17, 6, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center license / turbo emblem
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-9, 1, 18, 7, 2);
      ctx.fill();

      // Special vehicle roof details
      if (car.siren) {
        // Dual Police lightbar
        const flashLeft = this.tick % 12 < 6;
        ctx.fillStyle = flashLeft ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.roundRect(-14 + shift, -37, 13, 5, 2);
        ctx.fill();
        ctx.fillStyle = flashLeft ? '#1e3a8a' : '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(1 + shift, -37, 13, 5, 2);
        ctx.fill();
      } else if (this.carKey === 'taxi') {
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-11 + shift, -38, 22, 6, 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    _drawSteeringWheelHUD(ctx, w, h) {
      // Draw tracked hand dots when MediaPipe detects hands
      for (const hand of this.detectedHands) {
        ctx.save();
        ctx.fillStyle = '#fde047';
        for (const lm of hand.landmarks) {
          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h * 0.45, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Compact translucent steering wheel icon at top-center under HUD
      const cx = w / 2;
      const cy = Math.max(92, h * 0.16);
      const r = 28;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.wheelAngle);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Red top center marker on wheel
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2 - 0.25, -Math.PI / 2 + 0.25);
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-r + 3, 0);
      ctx.lineTo(r - 3, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r - 3);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const track = TRACKS[this.trackKey] || TRACKS.highway;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      if (this.shakeFrames > 0) {
        ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
      }

      // Sky / Webcam backdrop
      const camActive = this.hasCamera && this.showCamera && this.video.readyState >= 2;
      if (camActive) {
        this._drawVideoCover(ctx, w, h);
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.35);
        sky.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
        sky.addColorStop(1, 'rgba(15, 23, 42, 0.15)');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      } else {
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.34);
        sky.addColorStop(0, track.skyTop);
        sky.addColorStop(1, track.skyBot);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h * 0.34);
      }

      // Ground & scrolling curved road
      const topRow = this._roadRow(0);

      // Distant parallax hills silhouette along the horizon
      if (!camActive) {
        const bgShift = (-this.roadCurve * w * 0.22 - this.carX * w * 0.08);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.moveTo(0, topRow.y + 4);
        for (let hx = -120; hx <= w + 120; hx += 60) {
          const hillH = 14 + Math.sin((hx - bgShift) * 0.018) * 12 + Math.cos((hx - bgShift) * 0.042) * 6;
          ctx.lineTo(hx, topRow.y - Math.max(4, hillH));
        }
        ctx.lineTo(w, topRow.y + 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = camActive ? 'rgba(20, 83, 45, 0.55)' : track.grass;
      ctx.fillRect(0, topRow.y, w, h - topRow.y);

      const numBands = 14;
      const zMax = 1.25;
      const span = zMax / numBands;
      for (let i = -1; i < numBands; i++) {
        const z0 = Math.max(0, (i + this.scroll) * span);
        const z1 = Math.min(zMax, (i + 1 + this.scroll) * span);
        if (z1 <= z0) continue;

        const r0 = this._roadRow(z0);
        const r1 = this._roadRow(z1);
        const isOdd = ((i % 2) + 2) % 2 === 1;

        // Road surface band (projected around curved centerX)
        ctx.fillStyle = isOdd ? track.roadA : track.roadB;
        ctx.beginPath();
        ctx.moveTo(r0.centerX - r0.halfW, r0.y);
        ctx.lineTo(r0.centerX + r0.halfW, r0.y);
        ctx.lineTo(r1.centerX + r1.halfW, r1.y);
        ctx.lineTo(r1.centerX - r1.halfW, r1.y);
        ctx.closePath();
        ctx.fill();

        // Curbs
        const cw0 = 8 * r0.scale;
        const cw1 = 16 * r1.scale;
        ctx.fillStyle = isOdd ? track.curbA : track.curbB;
        ctx.beginPath();
        ctx.moveTo(r0.centerX - r0.halfW - cw0, r0.y);
        ctx.lineTo(r0.centerX - r0.halfW, r0.y);
        ctx.lineTo(r1.centerX - r1.halfW, r1.y);
        ctx.lineTo(r1.centerX - r1.halfW - cw1, r1.y);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(r0.centerX + r0.halfW, r0.y);
        ctx.lineTo(r0.centerX + r0.halfW + cw0, r0.y);
        ctx.lineTo(r1.centerX + r1.halfW + cw1, r1.y);
        ctx.lineTo(r1.centerX + r1.halfW, r1.y);
        ctx.closePath();
        ctx.fill();

        // Dashed lane lines
        if (isOdd) {
          ctx.strokeStyle = track.line;
          ctx.lineWidth = Math.max(1.5, 3 * r1.scale);
          for (const div of [-1 / 3, 1 / 3]) {
            ctx.beginPath();
            ctx.moveTo(r0.centerX + r0.halfW * div, r0.y);
            ctx.lineTo(r1.centerX + r1.halfW * div, r1.y);
            ctx.stroke();
          }
        }
      }

      // Edge motion speed streaks for driving immersion
      const streakCount = this.boostTimer > 0 ? 10 : 5;
      ctx.save();
      ctx.strokeStyle = this.boostTimer > 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = this.boostTimer > 0 ? 3 : 2;
      for (let s = 0; s < streakCount; s++) {
        const phase = ((this.tick * (this.boostTimer > 0 ? 18 : 11) + s * 97) % 100) / 100;
        const side = s % 2 === 0 ? 1 : -1;
        const sx = side < 0 ? w * (0.04 + phase * 0.04) : w * (0.96 - phase * 0.04);
        const sy = h * (0.38 + phase * 0.52);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - side * 12, sy + 28);
        ctx.stroke();
      }
      ctx.restore();

      // Roadside scenery props
      for (let i = 0; i < 6; i++) {
        const pz = ((i / 6) + this.scroll / 6) % 1.15;
        if (pz < 0.08) continue;
        const r = this._roadRow(pz);
        const off = r.halfW + 38 * r.scale;
        ctx.save();
        ctx.font = `${Math.max(14, Math.round(36 * r.scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(track.prop, r.centerX - off, r.y + 4);
        ctx.fillText(track.prop, r.centerX + off, r.y + 4);
        ctx.restore();
      }

      // Road items (back to front)
      const sorted = [...this.items].sort((a, b) => a.z - b.z);
      for (const it of sorted) {
        const r = this._roadRow(it.z);
        const ix = r.centerX + it.laneX * r.halfW * 0.78;
        const iy = r.y - 16 * r.scale;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(ix, r.y, 20 * r.scale, 6 * r.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        if (it.kind === 'treasure' && drawTreasureCanvasItem) {
          ctx.translate(ix, iy);
          drawTreasureCanvasItem(ctx, it.mat.id, 22 * r.scale, this.tick);
        } else {
          ctx.font = `${Math.max(16, Math.round(38 * r.scale))}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(it.emoji, ix, iy);
        }
        ctx.restore();
      }

      // Player car
      const carRow = this._roadRow(0.96);
      const carScreenX = carRow.centerX + this.carX * carRow.halfW * 0.78;
      this._drawCar(ctx, carScreenX, carRow.y - 14, this.heading);

      // Virtual Steering Wheel HUD
      this._drawSteeringWheelHUD(ctx, w, h);

      // Particles & popups
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const pop of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life / 18);
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(pop.text, pop.x, pop.y);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  app.CarRacerGame = CarRacerGame;
})(window.KidApp = window.KidApp || {});
