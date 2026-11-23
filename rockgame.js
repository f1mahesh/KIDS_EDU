/* Rock Blaster AR — Variety Punch & Kick Action Arcade Game */
(function (global) {
  const ROCK_SPEED_PRESETS = {
    slow:   { label: '🐢 Slow (Ages 4–6)',   fallSpeed: 0.90, duration: 90, hardThreshold: 16, maxRocks: 3 },
    medium: { label: '🚀 Medium (Ages 6–8)', fallSpeed: 1.45, duration: 60, hardThreshold: 22, maxRocks: 4 },
    fast:   { label: '⚡ Fast (Ages 8–10)',  fallSpeed: 2.15, duration: 60, hardThreshold: 28, maxRocks: 5 }
  };

  const TARGET_VARIETIES = [
    { type: 'rock',     pts: [10, 20, 25], shardColors: ['#94a3b8', '#64748b'], glow: '#94a3b8', r: 48 },
    { type: 'lava',     pts: [30, 50],     shardColors: ['#ef4444', '#f97316'], glow: '#f97316', r: 52 },
    { type: 'snow',     pts: [15, 25],     shardColors: ['#ffffff', '#bae6fd'], glow: '#38bdf8', r: 48 },
    { type: 'ornament', pts: [40, 50],     shardColors: ['#ef4444', '#22c55e', '#fde047'], glow: '#fde047', r: 50 },
    { type: 'crystal',  pts: [75, 100],    shardColors: ['#c084fc', '#38bdf8', '#fde047'], glow: '#c084fc', r: 54 },
    { type: 'candy',    pts: [20, 35],     shardColors: ['#fb7185', '#fde047'], glow: '#f472b6', r: 48 }
  ];

  const HAZARD_VARIETY = {
    type: 'hazard',
    pts: [-10, -20, -30, -50],
    shardColors: ['#dc2626', '#7f1d1d', '#1e293b'],
    glow: '#ef4444',
    r: 48
  };

  class RockBlasterArcade {
    constructor(options) {
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

      this.speed = 'slow';
      this.score = 0;
      this.blasted = 0;
      this.timeLeft = 90;
      this.shakeFrames = 0;
      this.globalHitCooldown = 0;
      this.tick = 0;

      this.rocks = [];
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

        // One tap blasts strictly ONE item at a time!
        for (let i = this.rocks.length - 1; i >= 0; i--) {
          const rk = this.rocks[i];
          if (Math.hypot(x - rk.x, y - rk.y) <= rk.r + 12) {
            this._blastTarget(rk, i);
            break;
          }
        }
      });
    }

    setSpeed(speedKey) {
      this.speed = ROCK_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = ROCK_SPEED_PRESETS[this.speed];
      this.onStatus(`🥊 ${preset.label} — Punch & Kick HARD to blast one target at a time!`);
    }

    async start(speedKey = this.speed) {
      this.stop();
      this._syncCanvasSize();
      this.speed = ROCK_SPEED_PRESETS[speedKey] ? speedKey : 'slow';
      const preset = ROCK_SPEED_PRESETS[this.speed];

      this.score = 0;
      this.blasted = 0;
      this.timeLeft = preset.duration;
      this.shakeFrames = 0;
      this.globalHitCooldown = 0;
      this.prevFrame = null;
      this.rocks = [];
      this.shards = [];
      this.popups = [];
      this.running = true;

      this.onStatus('📷 Starting Punch & Kick Camera...');
      await this._startCamera();
      this._ensureRocks();

      this.timerId = setInterval(() => {
        if (!this.running) return;
        this.timeLeft -= 1;
        this.onScore({
          score: this.score,
          blasted: this.blasted,
          timeLeft: this.timeLeft
        });
        if (this.timeLeft <= 0) {
          this.stop();
          this.onFinish({ score: this.score, blasted: this.blasted });
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
        this.onStatus('💥 Touch Smash Mode! Tap Rocks, Lava, Snow & Christmas Balls for points!');
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
        this.onStatus('🥊 PUNCH upper & 🦶 KICK lower targets HARD — 1 fist blasts 1 target!');
      } catch (_) {
        this.hasCamera = false;
        this.onStatus('💥 Touch Smash Mode (Camera off)! Tap targets to BLAST them!');
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

    _makePolygon(r, sides = 9, variance = 0.24) {
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const ang = (Math.PI * 2 * i) / sides;
        const rad = r * (1 - variance * 0.5 + Math.random() * variance);
        pts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
      }
      return pts;
    }

    _ensureRocks() {
      const preset = ROCK_SPEED_PRESETS[this.speed] || ROCK_SPEED_PRESETS.slow;
      const w = this.canvas.width;

      let guard = 0;
      while (this.rocks.length < preset.maxRocks && guard < 30) {
        guard++;
        const isHazard = Math.random() < 0.28;
        const variety = isHazard
          ? HAZARD_VARIETY
          : TARGET_VARIETIES[Math.floor(Math.random() * TARGET_VARIETIES.length)];
        const pts = variety.pts[Math.floor(Math.random() * variety.pts.length)];
        const r = variety.r;
        const x = 85 + Math.random() * (w - 170);
        const y = -r - 20 - Math.random() * 140;

        // Keep falling targets well-separated so one fist hits only one target!
        const tooClose = this.rocks.some((other) => Math.hypot(x - other.x, y - other.y) < r + other.r + 36);
        if (tooClose) continue;

        this.rocks.push({
          x,
          y,
          r,
          vx: (Math.random() - 0.5) * 0.45,
          vy: preset.fallSpeed + Math.random() * 0.45,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.02,
          type: variety.type,
          shardColors: variety.shardColors,
          glow: variety.glow,
          ornamentRed: Math.random() < 0.5,
          points: pts,
          isHazard,
          wobble: 0,
          poly:
            variety.type === 'rock'
              ? this._makePolygon(r, 8, 0.28)
              : variety.type === 'crystal'
              ? this._makePolygon(r, 6, 0.08)
              : variety.type === 'hazard'
              ? this._makePolygon(r, 12, 0.35)
              : null
        });
      }
    }

    _blastTarget(rk, index) {
      // Strictly one target blasted per punch/kick!
      this.globalHitCooldown = 16;
      this.rocks.splice(index, 1);
      this.shakeFrames = 10;

      if (rk.points < 0) {
        this.score = Math.max(0, this.score + rk.points);
        if (global.MathAudio) global.MathAudio.wrong();
      } else {
        this.score += rk.points;
        this.blasted += 1;
        if (global.MathAudio) global.MathAudio.boom();
      }

      // Burst shards matching the blasted item's theme
      for (let i = 0; i < 22; i++) {
        const ang = (Math.PI * 2 * i) / 22 + Math.random() * 0.25;
        const spd = 3 + Math.random() * 6.5;
        this.shards.push({
          x: rk.x,
          y: rk.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.6,
          size: 6 + Math.random() * 10,
          color: rk.shardColors[i % rk.shardColors.length],
          life: 28 + Math.random() * 14
        });
      }

      this.popups.push({
        x: rk.x,
        y: rk.y - 12,
        text: rk.points < 0 ? `🚫 ${rk.points}! SKIP!` : `💥 +${rk.points}!`,
        color: rk.points < 0 ? '#ef4444' : rk.points >= 50 ? '#fde047' : '#4ade80',
        life: 46
      });

      this.onScore({
        score: this.score,
        blasted: this.blasted,
        timeLeft: this.timeLeft,
        lastPoints: rk.points
      });
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
      const preset = ROCK_SPEED_PRESETS[this.speed] || ROCK_SPEED_PRESETS.slow;

      // Find ONLY the single target receiving the strongest hard punch/kick!
      let bestIdx = -1;
      let bestEnergy = 0;

      for (let i = 0; i < this.rocks.length; i++) {
        const rk = this.rocks[i];
        const cx = Math.round((rk.x / w) * mw);
        const cy = Math.round((rk.y / h) * mh);
        const rad = Math.max(4, Math.round((rk.r / w) * mw));

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
          rk.wobble = 6; // Too gentle — hit harder!
        }
      }

      this.prevFrame.set(data);

      // Blast ONLY the single best-hit target!
      if (bestIdx !== -1) {
        this._blastTarget(this.rocks[bestIdx], bestIdx);
      }
    }

    _update() {
      this.tick += 1;
      if (this.shakeFrames > 0) this.shakeFrames -= 1;
      if (this.globalHitCooldown > 0) this.globalHitCooldown -= 1;

      const w = this.canvas.width;
      const h = this.canvas.height;

      this._ensureRocks();

      for (let i = this.rocks.length - 1; i >= 0; i--) {
        const rk = this.rocks[i];
        if (rk.wobble > 0) rk.wobble -= 1;
        rk.x += rk.vx;
        rk.y += rk.vy;
        rk.rot += rk.vrot;

        if (rk.x < rk.r + 18 || rk.x > w - rk.r - 18) rk.vx *= -1;
        if (rk.y > h + rk.r + 24) {
          this.rocks.splice(i, 1);
          continue;
        }

        // Keep targets gently separated so one fist hits only one object
        for (let j = i - 1; j >= 0; j--) {
          const ot = this.rocks[j];
          const dx = ot.x - rk.x;
          const dy = ot.y - rk.y;
          const dist = Math.hypot(dx, dy);
          const minDist = rk.r + ot.r + 24;
          if (dist > 0 && dist < minDist) {
            const push = (minDist - dist) * 0.05;
            const nx = dx / dist;
            const ny = dy / dist;
            rk.x -= nx * push;
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

    _drawTarget(rk) {
      const ctx = this.ctx;
      const jx = rk.wobble > 0 ? (Math.random() - 0.5) * 6 : 0;
      const jy = rk.wobble > 0 ? (Math.random() - 0.5) * 6 : 0;

      ctx.save();
      ctx.translate(rk.x + jx, rk.y + jy);
      ctx.shadowColor = rk.glow;
      ctx.shadowBlur = 16;

      if (rk.type === 'rock' || rk.type === 'crystal' || rk.type === 'hazard') {
        ctx.save();
        ctx.rotate(rk.rot);
        ctx.beginPath();
        rk.poly.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        const grad = ctx.createLinearGradient(-rk.r, -rk.r, rk.r, rk.r);
        if (rk.type === 'crystal') {
          grad.addColorStop(0, '#f5d0fe');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#3b82f6');
        } else if (rk.type === 'hazard') {
          grad.addColorStop(0, '#7f1d1d');
          grad.addColorStop(0.55, '#450a0a');
          grad.addColorStop(1, '#0f172a');
        } else {
          grad.addColorStop(0, '#94a3b8');
          grad.addColorStop(0.55, '#64748b');
          grad.addColorStop(1, '#334155');
        }
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = rk.type === 'crystal' ? '#e9d5ff' : rk.type === 'hazard' ? '#ef4444' : '#cbd5e1';
        ctx.stroke();
        ctx.restore();
      } else if (rk.type === 'lava') {
        // Glowing Lava Ball
        const grad = ctx.createRadialGradient(-rk.r * 0.25, -rk.r * 0.25, rk.r * 0.15, 0, 0, rk.r);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.45, '#f97316');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
        // Magma cracks
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-rk.r * 0.6, -12); ctx.lineTo(-10, 4); ctx.lineTo(14, -18);
        ctx.moveTo(-10, 4); ctx.lineTo(18, 24);
        ctx.stroke();
      } else if (rk.type === 'snow') {
        // Fluffy Snowball
        const grad = ctx.createRadialGradient(-rk.r * 0.3, -rk.r * 0.3, rk.r * 0.1, 0, 0, rk.r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.75, '#e0f2fe');
        grad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#bae6fd';
        ctx.stroke();
      } else if (rk.type === 'ornament') {
        // Shiny Christmas Ornament Ball with golden cap!
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-10, -rk.r - 8, 20, 11);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -rk.r - 10, 6, 0, Math.PI * 2);
        ctx.stroke();

        const grad = ctx.createRadialGradient(-rk.r * 0.3, -rk.r * 0.3, rk.r * 0.1, 0, 0, rk.r);
        if (rk.ornamentRed) {
          grad.addColorStop(0, '#fecaca');
          grad.addColorStop(0.45, '#ef4444');
          grad.addColorStop(1, '#991b1b');
        } else {
          grad.addColorStop(0, '#bbf7d0');
          grad.addColorStop(0.45, '#22c55e');
          grad.addColorStop(1, '#14532d');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();
      } else {
        // Candy Swirl Ball
        const grad = ctx.createRadialGradient(-rk.r * 0.25, -rk.r * 0.25, rk.r * 0.15, 0, 0, rk.r);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#9d174d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbcfe8';
        ctx.stroke();
      }

      // Big Point Value printed clearly
      ctx.shadowBlur = 0;
      ctx.fillStyle = rk.type === 'snow' ? '#0f172a' : rk.isHazard ? '#fecaca' : '#ffffff';
      ctx.strokeStyle = rk.type === 'snow' ? '#ffffff' : '#0f172a';
      ctx.lineWidth = 5;
      ctx.font = `900 ${Math.abs(rk.points) >= 100 ? 26 : 30}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(String(rk.points), 0, -2);
      ctx.fillText(String(rk.points), 0, -2);

      // Dynamic Punch / Kick / Skip tag pill
      const inKickZone = rk.y >= this.canvas.height * 0.64;
      ctx.fillStyle = rk.isHazard ? '#dc2626' : inKickZone ? '#ec4899' : '#f97316';
      ctx.beginPath();
      ctx.roundRect(-30, rk.r - 12, 60, 19, 9);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 10.5px system-ui, sans-serif';
      ctx.fillText(rk.isHazard ? '🚫 SKIP!' : inKickZone ? '🦶 KICK' : '🥊 PUNCH', 0, rk.r - 2);

      ctx.restore();
    }

    _drawGalaxyBackground() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const camActive = this.hasCamera && this.showCamera && this.video.readyState >= 2;

      if (camActive) {
        this._drawVideoCover(ctx, w, h);
        // Cosmic galaxy tint over camera feed
        const tint = ctx.createLinearGradient(0, 0, w, h);
        tint.addColorStop(0, 'rgba(30, 27, 75, 0.34)');
        tint.addColorStop(0.5, 'rgba(88, 28, 135, 0.24)');
        tint.addColorStop(1, 'rgba(15, 23, 42, 0.34)');
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Deep Space Galaxy Gradient
        const sky = ctx.createLinearGradient(0, 0, w, h);
        sky.addColorStop(0, '#090d24');
        sky.addColorStop(0.45, '#1e1b4b');
        sky.addColorStop(0.8, '#3b0764');
        sky.addColorStop(1, '#0f172a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      }

      // Glowing Nebula Clouds (subtle when camera active, vivid in full galaxy)
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

      // Distant Ringed Galaxy Planet (positioned below top scoreboard)
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

      // Twinkling Galaxy Stars
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

      for (const rk of this.rocks) {
        this._drawTarget(rk);
      }

      for (const s of this.shards) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.rect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        ctx.fill();
      }

      for (const p of this.popups) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.font = '900 26px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  global.RockBlasterArcade = RockBlasterArcade;
})(window);
