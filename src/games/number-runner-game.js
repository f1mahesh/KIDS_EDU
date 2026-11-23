/* Number Runner AR — Camera Motion + Face + Touch 3-Lane Duck & Jump Math Game */
(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, drawTreasureCanvasItem } = app;

const SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   zSpeed: 0.0052, duration: 90, maxAdd: 6,  maxMul: 4 },
    medium: { label: '🚀 Medium (Ages 6–8)', zSpeed: 0.0078, duration: 60, maxAdd: 10, maxMul: 7 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  zSpeed: 0.0108, duration: 60, maxAdd: 12, maxMul: 10 }
  };

  const WORLDS = {
    jungle: {
      name: '🌲 Jungle',
      skyTop: 'rgba(6, 78, 59, 0.34)',
      skyBot: 'rgba(20, 83, 45, 0.48)',
      fullSkyTop: '#064e3b',
      fullSkyMid: '#0f766e',
      fullSkyBot: '#14532d',
      roadTop: '#5c4033',
      roadBot: '#3e2723',
      bandOdd: 'rgba(93, 64, 55, 0.84)',
      bandEven: 'rgba(78, 52, 46, 0.84)',
      curbOuter: '#15803d',
      curbInner: '#86efac',
      laneGlow: 'rgba(134, 239, 172, 0.20)',
      line: '#bef264',
      plankStroke: 'rgba(20, 83, 45, 0.55)',
      propLeft: '🌴',
      propRight: '🌿',
      lowEmoji: '🪵',
      lowLabel: 'JUMP LOG!',
      highEmoji: '🦇',
      highLabel: 'DUCK BAT!'
    },
    space: {
      name: '🚀 Space',
      skyTop: 'rgba(15, 23, 42, 0.42)',
      skyBot: 'rgba(49, 46, 129, 0.52)',
      fullSkyTop: '#020617',
      fullSkyMid: '#1e1b4b',
      fullSkyBot: '#312e81',
      roadTop: '#1e1b4b',
      roadBot: '#090d24',
      bandOdd: 'rgba(30, 41, 59, 0.82)',
      bandEven: 'rgba(15, 23, 42, 0.86)',
      curbOuter: '#4f46e5',
      curbInner: '#38bdf8',
      laneGlow: 'rgba(56, 189, 248, 0.22)',
      line: '#38bdf8',
      plankStroke: 'rgba(56, 189, 248, 0.45)',
      propLeft: '🪐',
      propRight: '✨',
      lowEmoji: '🪨',
      lowLabel: 'JUMP ROCK!',
      highEmoji: '☄️',
      highLabel: 'DUCK METEOR!'
    },
    snow: {
      name: '❄️ Snow',
      skyTop: 'rgba(12, 74, 110, 0.34)',
      skyBot: 'rgba(30, 58, 138, 0.48)',
      fullSkyTop: '#0c4a6e',
      fullSkyMid: '#0284c7',
      fullSkyBot: '#1e3a8a',
      roadTop: '#bae6fd',
      roadBot: '#7dd3fc',
      bandOdd: 'rgba(224, 242, 254, 0.86)',
      bandEven: 'rgba(186, 230, 253, 0.86)',
      curbOuter: '#0369a1',
      curbInner: '#ffffff',
      laneGlow: 'rgba(255, 255, 255, 0.34)',
      line: '#0284c7',
      plankStroke: 'rgba(14, 165, 233, 0.42)',
      propLeft: '🌲',
      propRight: '❄️',
      lowEmoji: '⛄',
      lowLabel: 'JUMP SNOW!',
      highEmoji: '🌨️',
      highLabel: 'DUCK CLOUD!'
    },
    lava: {
      name: '🌋 Lava',
      skyTop: 'rgba(127, 29, 29, 0.38)',
      skyBot: 'rgba(69, 10, 10, 0.52)',
      fullSkyTop: '#450a0a',
      fullSkyMid: '#991b1b',
      fullSkyBot: '#1c1917',
      roadTop: '#44403c',
      roadBot: '#1c1917',
      bandOdd: 'rgba(41, 37, 36, 0.88)',
      bandEven: 'rgba(28, 25, 23, 0.88)',
      curbOuter: '#dc2626',
      curbInner: '#fde047',
      laneGlow: 'rgba(251, 146, 60, 0.24)',
      line: '#fb923c',
      plankStroke: 'rgba(249, 115, 22, 0.5)',
      propLeft: '🌋',
      propRight: '🔥',
      lowEmoji: '🔥',
      lowLabel: 'JUMP LAVA!',
      highEmoji: '🦅',
      highLabel: 'DUCK HAWK!'
    }
  };

  class NumberRunnerGame {
    constructor(options) {
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onScore = options.onScore || (() => {});
      this.onFinish = options.onFinish || (() => {});
      this.onStatus = options.onStatus || (() => {});
      this.getAvatar = options.getAvatar || (() => '🦁');

      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.muted = true;

      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 84;
      this.motionCanvas.height = 64;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      this.prevFrame = null;

      this.faceDetector = null;
      if (typeof window.FaceDetector === 'function') {
        try {
          this.faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        } catch (_) {}
      }
      this.lastFaceAt = 0;
      this.faceBusy = false;
      this.neutralFaceY = null;
      this.faceLaneLock = 0;

      this.stream = null;
      this.hasCamera = false;
      this.showCamera = true;
      this.running = false;
      this.rafId = null;
      this.timerId = null;

      this.op = 'add';
      this.speed = 'slow';
      this.world = 'jungle';

      this.score = 0;
      this.streak = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = 90;

      // Runner state
      this.lane = 1; // 0 = Left, 1 = Center, 2 = Right
      this.visualLane = 1;
      this.jumpTimer = 0; // frames remaining
      this.jumpDuration = 38;
      this.duckTimer = 0; // frames remaining
      this.duckDuration = 42;
      this.actionCooldown = 0;
      this.laneCooldown = 0;
      this.shakeFrames = 0;
      this.tick = 0;
      this.trackScroll = 0;
      this.ambient = [];
      for (let i = 0; i < 34; i++) {
        this.ambient.push({
          x: Math.random(),
          y: Math.random(),
          r: 1 + Math.random() * 2.5,
          spd: 0.002 + Math.random() * 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }

      // Entities on track
      this.problem = null;
      this.gates = [];
      this.obstacles = [];
      this.treasures = [];
      this.particles = [];
      this.popups = [];
      this.waveCount = 0;
      this.spawnDelay = 0;

      this._bindControls();
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
        this.motionCanvas.width = 84;
        this.motionCanvas.height = Math.max(46, Math.round((84 * h) / w));
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

    _bindControls() {
      let startX = 0;
      let startY = 0;
      let tracking = false;

      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running) return;
        startX = e.clientX;
        startY = e.clientY;
        tracking = true;
      });

      this.canvas.addEventListener('pointerup', (e) => {
        if (!this.running || !tracking) return;
        tracking = false;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dist = Math.hypot(dx, dy);

        if (dist > 28) {
          if (Math.abs(dy) > Math.abs(dx)) {
            if (dy < 0) this.jump();
            else this.duck();
          } else {
            this.moveLane(dx < 0 ? -1 : 1);
          }
          return;
        }

        // Tap left/center/right third of track to jump straight to that lane
        const rect = this.canvas.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        if (relX < 0.36) this.setLane(0);
        else if (relX > 0.64) this.setLane(2);
        else this.setLane(1);
      });
    }

    setLane(idx) {
      const clamped = Math.max(0, Math.min(2, idx));
      if (clamped !== this.lane) {
        this.lane = clamped;
        if (AudioEngine) AudioEngine.pop();
      }
    }

    moveLane(delta) {
      this.setLane(this.lane + delta);
    }

    jump() {
      if (!this.running || this.jumpTimer > 0) return;
      this.duckTimer = 0;
      this.jumpTimer = this.jumpDuration;
      this.actionCooldown = 18;
      if (AudioEngine) AudioEngine.flip();
    }

    duck() {
      if (!this.running || this.duckTimer > 0) return;
      this.jumpTimer = 0;
      this.duckTimer = this.duckDuration;
      this.actionCooldown = 18;
      if (AudioEngine) AudioEngine.pop();
    }

    setOperation(op) {
      this.op = ['add', 'sub', 'mul', 'mix'].includes(op) ? op : 'add';
      this.gates = [];
      this._spawnMathWave();
    }

    setSpeed(speedKey) {
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = SPEED_PRESETS[this.speed];
      this.onStatus(`🏃 ${preset.label} — Step Left/Right, Jump over logs & Duck under flyers!`);
    }

    setWorld(worldKey) {
      this.world = WORLDS[worldKey] ? worldKey : 'jungle';
      const wObj = WORLDS[this.world];
      this.onStatus(`World: ${wObj.name} — Catch matching answers & dodge obstacles!`);
    }

    toggleCameraView() {
      this.showCamera = !this.showCamera;
      return this.showCamera;
    }

    recalibrate() {
      this.neutralFaceY = null;
      this.prevFrame = null;
      this.onStatus('🎯 Pose calibrated! Stand centered and move Left, Right, Jump, or Duck!');
    }

    async start(op = this.op, speedKey = this.speed, worldKey = this.world) {
      this.stop();
      this._syncCanvasSize();
      this.op = ['add', 'sub', 'mul', 'mix'].includes(op) ? op : 'add';
      this.speed = SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      this.world = WORLDS[worldKey] ? worldKey : 'jungle';
      const preset = SPEED_PRESETS[this.speed];

      this.score = 0;
      this.streak = 0;
      this.combo = 1;
      this.stars = 0;
      this.timeLeft = preset.duration;

      this.lane = 1;
      this.visualLane = 1;
      this.jumpTimer = 0;
      this.duckTimer = 0;
      this.actionCooldown = 0;
      this.laneCooldown = 0;
      this.shakeFrames = 0;
      this.tick = 0;
      this.trackScroll = 0;
      this.ambient = [];
      for (let i = 0; i < 34; i++) {
        this.ambient.push({
          x: Math.random(),
          y: Math.random(),
          r: 1 + Math.random() * 2.5,
          spd: 0.002 + Math.random() * 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }

      this.gates = [];
      this.obstacles = [];
      this.treasures = [];
      this.particles = [];
      this.popups = [];
      this.waveCount = 0;
      this.spawnDelay = 0;
      this.prevFrame = null;
      this.neutralFaceY = null;
      this.running = true;

      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');
      this.onStatus('📷 Starting Number Runner Camera...');
      await this._startCamera();
      this._spawnMathWave();
      this._emitScore();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this._emitScore();
        if (this.timeLeft <= 0) {
          this.stop();
          this.onFinish({
            score: this.score,
            stars: this.stars,
            streak: this.streak
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
        this.onStatus('🏃 Touch & Swipe Mode! Tap lanes or swipe Up/Down to Jump & Duck!');
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
        this.onStatus('🏃 Camera Ready! Move Left/Right, Jump high & Duck low (or tap controls)!');
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('🏃 Touch & Swipe Mode (Camera off)! Tap lanes or Jump/Duck buttons!');
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
      this.onScore({
        score: this.score,
        streak: this.streak,
        combo: this.combo,
        stars: this.stars,
        timeLeft: this.timeLeft,
        ...extra
      });
    }

    _generateProblem() {
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      let activeOp = this.op;
      if (activeOp === 'mix') {
        const pool = ['add', 'sub', 'mul'];
        activeOp = pool[Math.floor(Math.random() * pool.length)];
      }

      let a = 1;
      let b = 1;
      let ans = 2;
      let sym = '+';

      if (activeOp === 'add') {
        a = 1 + Math.floor(Math.random() * preset.maxAdd);
        b = 1 + Math.floor(Math.random() * preset.maxAdd);
        ans = a + b;
        sym = '+';
      } else if (activeOp === 'sub') {
        b = 1 + Math.floor(Math.random() * Math.max(4, preset.maxAdd - 1));
        ans = 1 + Math.floor(Math.random() * preset.maxAdd);
        a = ans + b;
        sym = '−';
      } else {
        a = 1 + Math.floor(Math.random() * preset.maxMul);
        b = 1 + Math.floor(Math.random() * preset.maxMul);
        ans = a * b;
        sym = '×';
      }

      const choices = new Set([ans]);
      let guard = 0;
      while (choices.size < 3 && guard < 25) {
        guard++;
        const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
        const cand = ans + offset;
        if (cand >= 0) choices.add(cand);
      }
      while (choices.size < 3) {
        choices.add(ans + choices.size + 1);
      }

      const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
      return { a, b, ans, sym, op: activeOp, choices: shuffled };
    }

    _spawnMathWave() {
      this.problem = this._generateProblem();
      this.gates = this.problem.choices.map((val, laneIdx) => ({
        lane: laneIdx,
        val,
        isCorrect: val === this.problem.ans,
        z: 0.04,
        resolved: false
      }));
      this.waveCount += 1;
    }

    _spawnObstacleWave() {
      const kind = Math.random() < 0.52 ? 'low' : 'high';
      const numObs = this.speed === 'fast' && Math.random() < 0.45 ? 2 : 1;
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, numObs);
      // Guarantee runner's current lane gets action or adjacent open lane
      lanes.forEach((laneIdx) => {
        this.obstacles.push({
          lane: laneIdx,
          kind,
          z: 0.04,
          resolved: false
        });
      });

      // Spawn shiny Bonus Treasure Materials in open lanes (or floating above low obstacles!)
      if (true) {
        const openLanes = [0, 1, 2].filter((l) => !lanes.includes(l));
        const pickLane = openLanes.length > 0
          ? openLanes[Math.floor(Math.random() * openLanes.length)]
          : lanes[0];
        const isHigh = openLanes.length === 0 && kind === 'low';
        this.treasures.push({
          lane: pickLane,
          z: 0.04,
          high: isHigh,
          resolved: false,
          mat: pickRandomTreasure()
        });
        if (openLanes.length === 2 && Math.random() < 0.55) {
          const secondLane = openLanes.find((l) => l !== pickLane);
          this.treasures.push({
            lane: secondLane,
            z: 0.04,
            high: false,
            resolved: false,
            mat: pickRandomTreasure()
          });
        }
      }
      this.waveCount += 1;
    }

    _detectMotionAndFace() {
      if (!this.hasCamera || this.video.readyState < 2) return;

      const mw = this.motionCanvas.width;
      const mh = this.motionCanvas.height;
      this._drawVideoCover(this.motionCtx, mw, mh);

      // Optional native FaceDetector for super smooth lane + jump/duck tracking
      const now = performance.now();
      if (this.faceDetector && !this.faceBusy && now - this.lastFaceAt > 130) {
        this.lastFaceAt = now;
        this.faceBusy = true;
        this.faceDetector
          .detect(this.motionCanvas)
          .then((faces) => {
            this.faceBusy = false;
            if (!this.running || !faces || faces.length === 0) return;
            const box = faces[0].boundingBox;
            const cx = (box.x + box.width / 2) / mw;
            const cy = (box.y + box.height / 2) / mh;

            if (cx < 0.37) this.setLane(0);
            else if (cx > 0.63) this.setLane(2);
            else this.setLane(1);
            this.faceLaneLock = 18;

            if (this.neutralFaceY === null) {
              this.neutralFaceY = cy;
            } else {
              const dy = cy - this.neutralFaceY;
              if (dy < -0.085 && this.actionCooldown <= 0) {
                this.jump();
              } else if (dy > 0.085 && this.actionCooldown <= 0) {
                this.duck();
              } else if (Math.abs(dy) < 0.055) {
                // Gently adapt baseline for posture shifts
                this.neutralFaceY = this.neutralFaceY * 0.94 + cy * 0.06;
              }
            }
          })
          .catch(() => {
            this.faceBusy = false;
          });
      }

      // Lightweight pixel-diff fallback across 3 horizontal lanes & vertical jump/duck bands
      const frame = this.motionCtx.getImageData(0, 0, mw, mh).data;
      if (this.prevFrame) {
        const laneSums = [0, 0, 0];
        let topSum = 0;
        let botSum = 0;
        const thirdW = mw / 3;
        const topCut = mh * 0.34;
        const botCut = mh * 0.62;

        for (let y = 0; y < mh; y += 2) {
          for (let x = 0; x < mw; x += 2) {
            const idx = (y * mw + x) * 4;
            const diff =
              Math.abs(frame[idx] - this.prevFrame[idx]) +
              Math.abs(frame[idx + 1] - this.prevFrame[idx + 1]) +
              Math.abs(frame[idx + 2] - this.prevFrame[idx + 2]);
            if (diff > 64) {
              const l = x < thirdW ? 0 : x < thirdW * 2 ? 1 : 2;
              laneSums[l] += 1;
              if (y < topCut) topSum += 1;
              else if (y > botCut) botSum += 1;
            }
          }
        }

        if (this.faceLaneLock <= 0 && this.laneCooldown <= 0) {
          const maxVal = Math.max(laneSums[0], laneSums[1], laneSums[2]);
          const total = laneSums[0] + laneSums[1] + laneSums[2];
          if (maxVal > 18 && total > 24) {
            const bestLane = laneSums.indexOf(maxVal);
            if (bestLane !== this.lane && maxVal > laneSums[this.lane] * 1.45) {
              this.setLane(bestLane);
              this.laneCooldown = 14;
            }
          }
        }

        if (this.actionCooldown <= 0) {
          if (topSum > 34 && topSum > botSum * 1.6) {
            this.jump();
          } else if (botSum > 38 && botSum > topSum * 1.6) {
            this.duck();
          }
        }
      }
      this.prevFrame = new Uint8ClampedArray(frame);
    }

    _spawnBurst(x, y, color, count = 18) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const spd = 2.5 + Math.random() * 5.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.5,
          r: 3 + Math.random() * 4.5,
          color,
          life: 24 + Math.random() * 14
        });
      }
    }

    _addPopup(x, y, text, color) {
      this.popups.push({ x, y, text, color, life: 44 });
    }

    _trackRow(z) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const hy = h * 0.27;
      const gy = h * 0.78;
      const t = Math.pow(Math.max(0, z), 1.45);
      const y = hy + (gy - hy) * t;
      const halfW = w * (0.16 + 0.25 * t);
      const scale = 0.28 + 0.72 * t;
      return { y, halfW, scale, t };
    }

    _project(lane, z) {
      const w = this.canvas.width;
      const row = this._trackRow(z);
      const laneW = (row.halfW * 2) / 3;
      const x = w / 2 + (lane - 1) * laneW;
      return { x, y: row.y, scale: row.scale, t: row.t, laneW };
    }

    _update() {
      this.tick += 1;
      const preset = SPEED_PRESETS[this.speed] || SPEED_PRESETS.slow;
      const step = preset.zSpeed;
      this.trackScroll = (this.trackScroll + step * 1.8) % 1;

      if (this.jumpTimer > 0) this.jumpTimer -= 1;
      if (this.duckTimer > 0) this.duckTimer -= 1;
      if (this.actionCooldown > 0) this.actionCooldown -= 1;
      if (this.laneCooldown > 0) this.laneCooldown -= 1;
      if (this.faceLaneLock > 0) this.faceLaneLock -= 1;
      if (this.shakeFrames > 0) this.shakeFrames -= 1;

      this.visualLane += (this.lane - this.visualLane) * 0.28;
      this._detectMotionAndFace();

      // Update Math Gates
      let allGatesDone = this.gates.length > 0;
      for (const g of this.gates) {
        g.z += step;
        if (!g.resolved && g.z >= 0.94 && g.z <= 1.06) {
          if (g.lane === this.lane) {
            g.resolved = true;
            const pt = this._project(g.lane, 1.0);
            if (g.isCorrect) {
              this.streak += 1;
              this.combo = Math.min(5, 1 + Math.floor(this.streak / 2));
              const pts = 25 * this.combo;
              this.score += pts;
              this.stars += 1;
              if (AudioEngine) AudioEngine.correct();
              this._spawnBurst(pt.x, pt.y - 45, '#fde047', 22);
              this._addPopup(pt.x, pt.y - 68, `🌟 +${pts}!`, '#4ade80');
              this._emitScore({ solvedOp: this.problem.op, correct: true });
            } else {
              this.streak = 0;
              this.combo = 1;
              this.shakeFrames = 10;
              if (AudioEngine) AudioEngine.wrong();
              this._spawnBurst(pt.x, pt.y - 40, '#ef4444', 14);
              this._addPopup(pt.x, pt.y - 65, `Oops! ${this.problem.ans}`, '#fb7185');
              this._emitScore({ solvedOp: this.problem.op, correct: false });
            }
          }
        }
        if (g.z < 1.12) allGatesDone = false;
      }

      if (this.gates.length > 0 && allGatesDone) {
        this.gates = [];
        this.spawnDelay = 16;
      }

      // Update Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const ob = this.obstacles[i];
        ob.z += step * 1.08;
        if (!ob.resolved && ob.z >= 0.94 && ob.z <= 1.05) {
          if (ob.lane === this.lane) {
            ob.resolved = true;
            const pt = this._project(ob.lane, 1.0);
            const cleared =
              (ob.kind === 'low' && this.jumpTimer > 0) ||
              (ob.kind === 'high' && this.duckTimer > 0);
            if (cleared) {
              this.score += 15;
              this.streak += 1;
              if (AudioEngine) AudioEngine.magic();
              this._spawnBurst(pt.x, pt.y - 36, '#38bdf8', 16);
              this._addPopup(
                pt.x,
                pt.y - 64,
                ob.kind === 'low' ? '🦘 JUMP +15!' : '🦆 DUCK +15!',
                '#fde047'
              );
              this._emitScore();
            } else {
              this.streak = 0;
              this.combo = 1;
              this.shakeFrames = 12;
              if (AudioEngine) AudioEngine.crack();
              this._spawnBurst(pt.x, pt.y - 32, '#f97316', 14);
              this._addPopup(
                pt.x,
                pt.y - 60,
                ob.kind === 'low' ? '🦘 JUMP NEXT TIME!' : '🦆 DUCK NEXT TIME!',
                '#fb7185'
              );
              this._emitScore();
            }
          }
        }
        if (ob.z >= 1.12) {
          this.obstacles.splice(i, 1);
        }
      }

      // Update Bonus Treasures
      for (let i = this.treasures.length - 1; i >= 0; i--) {
        const tr = this.treasures[i];
        tr.z += step * 1.04;
        if (!tr.resolved && tr.z >= 0.92 && tr.z <= 1.07 && tr.lane === this.lane) {
          if (!tr.high || this.jumpTimer > 0) {
            tr.resolved = true;
            const pt = this._project(tr.lane, 1.0);
            const mat = tr.mat;
            this.score += mat.pts;
            this.stars += mat.stars;
            if (AudioEngine) AudioEngine.magic();
            this._spawnBurst(pt.x, pt.y - (tr.high ? 75 : 34), mat.glow, 18);
            this._addPopup(pt.x, pt.y - (tr.high ? 96 : 62), `${mat.emoji} +${mat.pts} ${mat.short}!`, mat.glow);
            this._emitScore({ collectedMaterial: mat.id });
          }
        }
        if (tr.resolved || tr.z >= 1.12) {
          this.treasures.splice(i, 1);
        }
      }

      // Spawn next wave when clear
      if (this.gates.length === 0 && this.obstacles.length === 0) {
        if (this.spawnDelay > 0) {
          this.spawnDelay -= 1;
        } else {
          // Alternate between Math Gates and Jump/Duck Obstacles
          if (this.waveCount % 2 === 1) {
            this._spawnObstacleWave();
          } else {
            this._spawnMathWave();
          }
        }
      }

      // Particles & Popups
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= 1;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.y -= 1.25;
        pop.life -= 1;
        if (pop.life <= 0) this.popups.splice(i, 1);
      }
    }

    _drawWorldBackdrop(ctx, w, h, world) {
      const hy = h * 0.27;
      const camActive = this.hasCamera && this.showCamera && this.video.readyState >= 2;

      if (camActive) {
        this._drawVideoCover(ctx, w, h);
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, world.skyTop);
        sky.addColorStop(0.55, 'rgba(15, 23, 42, 0.18)');
        sky.addColorStop(1, world.skyBot);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      } else {
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, world.fullSkyTop);
        bg.addColorStop(0.42, world.fullSkyMid);
        bg.addColorStop(1, world.fullSkyBot);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Distant silhouette hills / peaks / craters at horizon
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, hy + 6);
        for (let i = 0; i <= 8; i++) {
          const px = (w * i) / 8;
          const peak = this.world === 'space' ? 14 : 26;
          const py = hy - (i % 2 === 0 ? 6 : peak + ((i * 7) % 14));
          ctx.lineTo(px, py);
        }
        ctx.lineTo(w, hy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Subtle atmospheric particles (stars / snow / embers / fireflies)
      ctx.save();
      for (const a of this.ambient) {
        const ax = a.x * w;
        let ay = ((a.y + this.tick * a.spd * (this.world === 'lava' ? -0.7 : 0.5)) % 1) * h;
        if (ay < 0) ay += h;
        if (this.world === 'space') {
          ctx.globalAlpha = camActive ? 0.45 : 0.85;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ax, ay * 0.45, a.r * (0.7 + 0.3 * Math.sin(this.tick * 0.08 + a.phase)), 0, Math.PI * 2);
          ctx.fill();
        } else if (this.world === 'snow') {
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc((ax + Math.sin(this.tick * 0.03 + a.phase) * 14 + w) % w, ay, a.r + 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.world === 'lava') {
          ctx.globalAlpha = 0.72;
          ctx.fillStyle = a.r > 2 ? '#fde047' : '#fb923c';
          ctx.beginPath();
          ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = '#bef264';
          ctx.beginPath();
          ctx.arc(ax, ay * 0.7, a.r * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    _drawRealisticTrack(ctx, w, h, world) {
      const topRow = this._trackRow(0);
      const botRow = this._trackRow(1.26);

      // Lava magma glow rivers or snow banks outside the track curbs
      if (this.world === 'lava') {
        const magmaGlow = ctx.createLinearGradient(0, topRow.y, 0, botRow.y);
        magmaGlow.addColorStop(0, 'rgba(234, 88, 12, 0.25)');
        magmaGlow.addColorStop(1, 'rgba(239, 68, 68, 0.65)');
        ctx.fillStyle = magmaGlow;
        ctx.beginPath();
        ctx.moveTo(w / 2 - topRow.halfW * 1.28, topRow.y);
        ctx.lineTo(w / 2 + topRow.halfW * 1.28, topRow.y);
        ctx.lineTo(w / 2 + botRow.halfW * 1.28, botRow.y);
        ctx.lineTo(w / 2 - botRow.halfW * 1.28, botRow.y);
        ctx.closePath();
        ctx.fill();
      }

      // Base road gradient
      const roadGrad = ctx.createLinearGradient(0, topRow.y, 0, botRow.y);
      roadGrad.addColorStop(0, world.roadTop);
      roadGrad.addColorStop(1, world.roadBot);
      ctx.fillStyle = roadGrad;
      ctx.beginPath();
      ctx.moveTo(w / 2 - topRow.halfW, topRow.y);
      ctx.lineTo(w / 2 + topRow.halfW, topRow.y);
      ctx.lineTo(w / 2 + botRow.halfW, botRow.y);
      ctx.lineTo(w / 2 - botRow.halfW, botRow.y);
      ctx.closePath();
      ctx.fill();

      // Perspective scrolling bands (planks, cyber tiles, ice slabs, basalt stones)
      const numBands = 12;
      const zMax = 1.26;
      const bandSpan = zMax / numBands;
      for (let i = -1; i < numBands; i++) {
        const z0 = Math.max(0, (i + this.trackScroll) * bandSpan);
        const z1 = Math.min(zMax, (i + 1 + this.trackScroll) * bandSpan);
        if (z1 <= z0) continue;

        const r0 = this._trackRow(z0);
        const r1 = this._trackRow(z1);
        const isOdd = ((i % 2) + 2) % 2 === 1;

        ctx.fillStyle = isOdd ? world.bandOdd : world.bandEven;
        ctx.beginPath();
        ctx.moveTo(w / 2 - r0.halfW, r0.y);
        ctx.lineTo(w / 2 + r0.halfW, r0.y);
        ctx.lineTo(w / 2 + r1.halfW, r1.y);
        ctx.lineTo(w / 2 - r1.halfW, r1.y);
        ctx.closePath();
        ctx.fill();

        // Cross-rib line (wooden plank gap / stone seam / neon grid line)
        ctx.strokeStyle = world.plankStroke;
        ctx.lineWidth = Math.max(1, 2.2 * r1.scale);
        ctx.beginPath();
        ctx.moveTo(w / 2 - r1.halfW, r1.y);
        ctx.lineTo(w / 2 + r1.halfW, r1.y);
        ctx.stroke();

        // Theme-specific center lane chevrons / icy glint / basalt cracks
        if (this.world === 'space' && isOdd) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 2 * r1.scale;
          for (let l = 0; l < 3; l++) {
            const cx = w / 2 + (l - 1) * ((r1.halfW * 2) / 3);
            const cy = (r0.y + r1.y) / 2;
            const cw = 18 * r1.scale;
            const ch = 6 * r1.scale;
            ctx.beginPath();
            ctx.moveTo(cx - cw, cy - ch);
            ctx.lineTo(cx, cy + ch);
            ctx.lineTo(cx + cw, cy - ch);
            ctx.stroke();
          }
        } else if (this.world === 'snow' && isOdd) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          const glintW = r1.halfW * 0.25;
          ctx.beginPath();
          ctx.moveTo(w / 2 - r0.halfW * 0.55, r0.y);
          ctx.lineTo(w / 2 - r0.halfW * 0.55 + glintW * 0.4, r0.y);
          ctx.lineTo(w / 2 - r1.halfW * 0.55 + glintW, r1.y);
          ctx.lineTo(w / 2 - r1.halfW * 0.55, r1.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Active lane glow strip
      const aTop = this._project(this.lane, 0);
      const aBot = this._project(this.lane, 1.26);
      ctx.fillStyle = world.laneGlow;
      ctx.beginPath();
      ctx.moveTo(aTop.x - aTop.laneW / 2, aTop.y);
      ctx.lineTo(aTop.x + aTop.laneW / 2, aTop.y);
      ctx.lineTo(aBot.x + aBot.laneW / 2, aBot.y);
      ctx.lineTo(aBot.x - aBot.laneW / 2, aBot.y);
      ctx.closePath();
      ctx.fill();

      // Perspective lane dividers
      for (const div of [-1 / 3, 1 / 3]) {
        ctx.save();
        ctx.strokeStyle = this.world === 'space' ? 'rgba(56, 189, 248, 0.72)' : 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([14, 14]);
        ctx.lineDashOffset = -(this.trackScroll * 110);
        ctx.beginPath();
        ctx.moveTo(w / 2 + topRow.halfW * div, topRow.y);
        ctx.lineTo(w / 2 + botRow.halfW * div, botRow.y);
        ctx.stroke();
        ctx.restore();
      }

      // Raised 3D beveled curbs along left & right edges
      for (const side of [-1, 1]) {
        const curbTopW = 8;
        const curbBotW = 24;
        ctx.fillStyle = world.curbOuter;
        ctx.beginPath();
        ctx.moveTo(w / 2 + side * topRow.halfW, topRow.y);
        ctx.lineTo(w / 2 + side * (topRow.halfW + curbTopW), topRow.y);
        ctx.lineTo(w / 2 + side * (botRow.halfW + curbBotW), botRow.y);
        ctx.lineTo(w / 2 + side * botRow.halfW, botRow.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = world.curbInner;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 + side * topRow.halfW, topRow.y);
        ctx.lineTo(w / 2 + side * botRow.halfW, botRow.y);
        ctx.stroke();
      }

      // Scrolling roadside scenery props (trees, planets, snow pines, volcano pillars)
      const propCount = 5;
      for (let i = 0; i < propCount; i++) {
        const pz = ((i / propCount) + this.trackScroll / propCount) % 1.15;
        if (pz < 0.06) continue;
        const r = this._trackRow(pz);
        const offset = r.halfW + 34 * r.scale;
        ctx.save();
        ctx.globalAlpha = Math.min(0.95, pz * 1.4);
        ctx.font = `${Math.max(14, Math.round(36 * r.scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(world.propLeft, w / 2 - offset, r.y + 4 * r.scale);
        ctx.fillText(world.propRight, w / 2 + offset, r.y + 4 * r.scale);
        ctx.restore();
      }

      // Horizon rim glow
      const hGlow = ctx.createLinearGradient(0, topRow.y - 16, 0, topRow.y + 12);
      hGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      hGlow.addColorStop(0.5, this.world === 'lava' ? 'rgba(251, 146, 60, 0.35)' : 'rgba(255, 255, 255, 0.22)');
      hGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, topRow.y - 16, w, 28);
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const world = WORLDS[this.world] || WORLDS.jungle;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      if (this.shakeFrames > 0) {
        ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
      }

      this._drawWorldBackdrop(ctx, w, h, world);
      this._drawRealisticTrack(ctx, w, h, world);

      // Equation Prompt Banner right under slim top scoreboard
      if (this.problem) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 135, 58, 270, 44, 22);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.problem.a} ${this.problem.sym} ${this.problem.b} = ?`, w / 2, 80);
        ctx.restore();
      }

      // Render Obstacles (back to front) with ground shadow for Jump/Duck depth clarity
      const sortedObs = [...this.obstacles].sort((a, b) => a.z - b.z);
      for (const ob of sortedObs) {
        const p = this._project(ob.lane, ob.z);
        const bw = 96 * p.scale;
        const bh = 46 * p.scale;
        const yOff = ob.kind === 'high' ? -68 * p.scale : -20 * p.scale;

        // Ground shadow on track floor
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, bw * 0.44, 9 * p.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(p.x, p.y + yOff);

        // 3D obstacle barrier card
        ctx.fillStyle = ob.kind === 'low' ? 'rgba(234, 88, 12, 0.92)' : 'rgba(124, 58, 237, 0.92)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 * p.scale;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14 * p.scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(14, Math.round(28 * p.scale))}px system-ui, sans-serif`;
        ctx.fillText(ob.kind === 'low' ? world.lowEmoji : world.highEmoji, 0, -2 * p.scale);

        ctx.font = `900 ${Math.max(9, Math.round(12 * p.scale))}px system-ui, sans-serif`;
        ctx.fillStyle = '#fde047';
        ctx.fillText(ob.kind === 'low' ? world.lowLabel : world.highLabel, 0, bh / 2 + 12 * p.scale);
        ctx.restore();
      }

      // Render Bonus Treasure Pickups (back to front)
      if (true) {
        const sortedTreasures = [...this.treasures].sort((a, b) => a.z - b.z);
        for (const tr of sortedTreasures) {
          const p = this._project(tr.lane, tr.z);
          const rad = 22 * p.scale;
          const bob = Math.sin(this.tick * 0.12 + tr.lane) * 5 * p.scale;
          const yOff = (tr.high ? -78 : -28) * p.scale + bob;

          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, rad * 0.85, 7 * p.scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.translate(p.x, p.y + yOff);
          drawTreasureCanvasItem(ctx, tr.mat.id, rad, this.tick);
          ctx.restore();
        }
      }

      // Render Math Answer Portals (back to front)
      const sortedGates = [...this.gates].sort((a, b) => a.z - b.z);
      for (const g of sortedGates) {
        if (g.resolved) continue;
        const p = this._project(g.lane, g.z);
        const rad = 34 * p.scale;
        const archW = rad * 2.25;
        const archH = rad * 2.45;

        // Portal ground shadow & glowing threshold pad
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, archW * 0.48, 10 * p.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Arch pillars
        ctx.strokeStyle = world.curbInner;
        ctx.lineWidth = Math.max(2, 5 * p.scale);
        ctx.beginPath();
        ctx.arc(p.x, p.y - archH * 0.42, archW * 0.42, Math.PI, 0);
        ctx.moveTo(p.x - archW * 0.42, p.y - archH * 0.42);
        ctx.lineTo(p.x - archW * 0.42, p.y);
        ctx.moveTo(p.x + archW * 0.42, p.y - archH * 0.42);
        ctx.lineTo(p.x + archW * 0.42, p.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(p.x, p.y - rad * 1.15);

        const grad = ctx.createRadialGradient(-rad * 0.25, -rad * 0.25, rad * 0.1, 0, 0, rad);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.55, '#38bdf8');
        grad.addColorStop(1, '#4f46e5');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3 * p.scale;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = `900 ${Math.max(14, Math.round(28 * p.scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(g.val), 0, 2 * p.scale);
        ctx.restore();
      }

      // Render Kid Runner Avatar at bottom lane position
      const runnerProj = this._project(this.visualLane, 1.0);
      let jumpLift = 0;
      if (this.jumpTimer > 0) {
        const prog = 1 - this.jumpTimer / this.jumpDuration;
        jumpLift = Math.sin(prog * Math.PI) * 86;
      }
      const isDucking = this.duckTimer > 0;
      const runBob = this.jumpTimer > 0 || isDucking ? 0 : Math.abs(Math.sin(this.tick * 0.28)) * 6;
      const leanAngle = (this.lane - this.visualLane) * 0.22;

      // Ground shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      const shadowScale = Math.max(0.45, 1 - jumpLift / 120);
      ctx.beginPath();
      ctx.ellipse(runnerProj.x, runnerProj.y + 4, 30 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Animated running feet / dust trail under avatar
      if (this.jumpTimer <= 0) {
        ctx.save();
        const footSwing = Math.sin(this.tick * 0.35) * 9;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(runnerProj.x - 10, runnerProj.y - 2 + (isDucking ? 2 : Math.max(0, footSwing) * 0.4), 7, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(runnerProj.x + 10, runnerProj.y - 2 + (isDucking ? 2 : Math.max(0, -footSwing) * 0.4), 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Runner body / avatar badge with banking tilt
      ctx.save();
      ctx.translate(runnerProj.x, runnerProj.y - 28 - jumpLift - runBob + (isDucking ? 14 : 0));
      ctx.rotate(leanAngle);
      if (isDucking) {
        ctx.scale(1.24, 0.66);
      }

      ctx.fillStyle = this.jumpTimer > 0 ? '#38bdf8' : isDucking ? '#a855f7' : '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getAvatar() || '🦁', 0, 2);
      ctx.restore();

      // Particles & Floating Popups
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const pop of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life / 18);
        ctx.font = '900 22px system-ui, sans-serif';
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

  app.NumberRunnerGame = NumberRunnerGame;
})(window.KidApp = window.KidApp || {});
