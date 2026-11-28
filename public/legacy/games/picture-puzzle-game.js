/* Picture Puzzle Game — Built-in Pictures, Custom Photo Upload, Difficulty Levels & Real Jigsaw / Swap / Slide Modes */

(function (app) {
  'use strict';

  const {
    AudioEngine,
    $,
    launchConfetti,
    spawnFloatingPop
  } = app;

  const CANVAS_SIZE = 720;
  const BEST_STORAGE_KEY = 'playspark_puzzle_best_v1';

  const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'master'];

  const DIFFICULTIES = {
    easy: { id: 'easy', size: 2, label: '🐣 Starter (2×2)', short: '2×2', stars: 2 },
    medium: { id: 'medium', size: 3, label: '🌱 Explorer (3×3)', short: '3×3', stars: 3 },
    hard: { id: 'hard', size: 4, label: '🚀 Challenger (4×4)', short: '4×4', stars: 5 },
    master: { id: 'master', size: 5, label: '👑 Master (5×5)', short: '5×5', stars: 8 }
  };

  /* -------------------------------------------------------------------------
     Built-in Procedural Kid-Friendly Illustrations + Local Story Pictures
     ------------------------------------------------------------------------- */
  function drawSpaceAdventure(ctx, s) {
    const bg = ctx.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.55, '#312e81');
    bg.addColorStop(1, '#581c87');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    const stars = [
      [0.1, 0.12, 4], [0.22, 0.08, 3], [0.35, 0.18, 5], [0.55, 0.09, 3],
      [0.72, 0.14, 4], [0.88, 0.1, 5], [0.15, 0.34, 3], [0.46, 0.28, 3],
      [0.85, 0.36, 4], [0.12, 0.65, 4], [0.28, 0.82, 3], [0.76, 0.72, 4],
      [0.9, 0.85, 5], [0.62, 0.88, 3], [0.42, 0.76, 4]
    ];
    stars.forEach(([rx, ry, r], idx) => {
      ctx.fillStyle = idx % 3 === 0 ? '#fde047' : idx % 3 === 1 ? '#bae6fd' : '#ffffff';
      ctx.beginPath();
      ctx.arc(rx * s, ry * s, r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.beginPath();
    ctx.arc(s * 0.16, s * 0.86, s * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(s * 0.12, s * 0.82, s * 0.07, s * 0.05, 0.3, 0, Math.PI * 2);
    ctx.ellipse(s * 0.22, s * 0.9, s * 0.06, s * 0.04, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(s * 0.18, s * 0.2, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(s * 0.15, s * 0.18, s * 0.018, 0, Math.PI * 2);
    ctx.arc(s * 0.21, s * 0.23, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(s * 0.155, s * 0.19, 4, 0, Math.PI * 2);
    ctx.arc(s * 0.205, s * 0.19, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(s * 0.18, s * 0.2, s * 0.032, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(s * 0.78, s * 0.24);
    ctx.rotate(-0.3);
    const pGrad = ctx.createRadialGradient(-20, -20, 10, 0, 0, s * 0.12);
    pGrad.addColorStop(0, '#fdba74');
    pGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.19, s * 0.045, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(s * 0.52, s * 0.52);
    ctx.rotate(-0.42);

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-26, 95);
    ctx.quadraticCurveTo(0, 200, 26, 95);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-14, 95);
    ctx.quadraticCurveTo(0, 158, 14, 95);
    ctx.fill();

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(-48, 30);
    ctx.lineTo(-92, 105);
    ctx.lineTo(-42, 85);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(48, 30);
    ctx.lineTo(92, 105);
    ctx.lineTo(42, 85);
    ctx.closePath();
    ctx.fill();

    const rGrad = ctx.createLinearGradient(-55, -120, 55, 100);
    rGrad.addColorStop(0, '#ffffff');
    rGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.quadraticCurveTo(70, -40, 50, 95);
    ctx.lineTo(-50, 95);
    ctx.quadraticCurveTo(-70, -40, 0, -145);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.quadraticCurveTo(36, -90, 40, -68);
    ctx.lineTo(-40, -68);
    ctx.quadraticCurveTo(-36, -90, 0, -145);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, -12, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(-10, -22, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDinoMeadow(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s * 0.72);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    const rColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    rColors.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.72, s * 0.44 - i * 14, Math.PI, 0);
      ctx.stroke();
    });

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(s * 0.14, s * 0.15, s * 0.085, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(s * 0.56, s * 0.72);
    ctx.lineTo(s * 0.73, s * 0.36);
    ctx.lineTo(s * 0.83, s * 0.36);
    ctx.lineTo(s * 0.98, s * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(s * 0.73, s * 0.36);
    ctx.lineTo(s * 0.83, s * 0.36);
    ctx.lineTo(s * 0.8, s * 0.44);
    ctx.lineTo(s * 0.76, s * 0.42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(s * 0.25, s * 0.82, s * 0.45, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(s * 0.75, s * 0.85, s * 0.5, s * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, s * 0.78, s, s * 0.22);

    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.14, s * 0.8);
    ctx.quadraticCurveTo(s * 0.11, s * 0.56, s * 0.17, s * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#15803d';
    [[-65, -18], [55, -25], [-50, 26], [60, 22], [0, -48]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.ellipse(s * 0.17 + dx, s * 0.4 + dy, 46, 16, Math.atan2(dy, dx), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(s * 0.48, s * 0.68, s * 0.17, s * 0.12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.34, s * 0.68);
    ctx.quadraticCurveTo(s * 0.18, s * 0.72, s * 0.16, s * 0.6);
    ctx.quadraticCurveTo(s * 0.24, s * 0.76, s * 0.38, s * 0.75);
    ctx.fill();

    ctx.lineWidth = 54;
    ctx.strokeStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(s * 0.58, s * 0.64);
    ctx.quadraticCurveTo(s * 0.65, s * 0.45, s * 0.62, s * 0.36);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(s * 0.66, s * 0.34, 62, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#bbf7d0';
    ctx.beginPath();
    ctx.ellipse(s * 0.51, s * 0.71, s * 0.11, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    [[0.42, 0.64, 14], [0.49, 0.61, 10], [0.37, 0.69, 9]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(s * x, s * y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#15803d';
    ctx.fillRect(s * 0.38, s * 0.76, 36, 56);
    ctx.fillRect(s * 0.53, s * 0.76, 36, 56);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s * 0.68, s * 0.31, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(s * 0.685, s * 0.31, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(s * 0.69, s * 0.35, 22, 0.15, Math.PI * 0.65);
    ctx.stroke();
    ctx.restore();
  }

  function drawOceanReef(ctx, s) {
    const sea = ctx.createLinearGradient(0, 0, 0, s);
    sea.addColorStop(0, '#06b6d4');
    sea.addColorStop(0.55, '#0284c7');
    sea.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(s * (0.1 + i * 0.22), 0);
      ctx.lineTo(s * (0.2 + i * 0.22), 0);
      ctx.lineTo(s * (0.32 + i * 0.2), s);
      ctx.lineTo(s * (0.12 + i * 0.2), s);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.82);
    ctx.quadraticCurveTo(s * 0.35, s * 0.76, s * 0.65, s * 0.83);
    ctx.quadraticCurveTo(s * 0.85, s * 0.86, s, s * 0.8);
    ctx.lineTo(s, s);
    ctx.lineTo(0, s);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    [0.1, 0.16, 0.86, 0.92].forEach((rx, idx) => {
      ctx.beginPath();
      ctx.moveTo(s * rx, s * 0.86);
      ctx.quadraticCurveTo(s * (rx + (idx % 2 ? 0.04 : -0.04)), s * 0.7, s * rx, s * 0.56);
      ctx.stroke();
    });

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(s * 0.26, s * 0.82, 34, Math.PI, 0);
    ctx.arc(s * 0.32, s * 0.8, 26, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#92400e';
    ctx.fillRect(s * 0.66, s * 0.72, 110, 72);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(s * 0.66, s * 0.74, 110, 12);
    ctx.beginPath();
    ctx.arc(s * 0.735, s * 0.74, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(s * 0.71, s * 0.71, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(s * 0.44, s * 0.42);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 145, 92, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-130, 10);
    ctx.lineTo(-205, -45);
    ctx.lineTo(-185, 10);
    ctx.lineTo(-205, 65);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(15, 36, 102, 42, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(78, -14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(81, -18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(76, 14, 28, 0.15, Math.PI * 0.7);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(s * 0.78, s * 0.28);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(42, 0);
    ctx.lineTo(74, -22);
    ctx.lineTo(74, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, -28, 14, 56);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-26, -6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 4;
    [[0.62, 0.26, 16], [0.66, 0.18, 11], [0.22, 0.24, 18], [0.26, 0.15, 10]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(s * x, s * y, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  function drawRainbowCastle(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s * 0.75);
    sky.addColorStop(0, '#60a5fa');
    sky.addColorStop(1, '#fce7f3');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    ['#ef4444', '#f97316', '#facc15', '#4ade80', '#38bdf8', '#a855f7'].forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.68, s * 0.45 - i * 14, Math.PI, 0);
      ctx.stroke();
    });

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(s * 0.84, s * 0.16, s * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.92, s * 0.7, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(s * 0.26, s * 0.44, s * 0.48, s * 0.34);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(s * 0.2, s * 0.38, s * 0.1, s * 0.4);
    ctx.fillRect(s * 0.7, s * 0.38, s * 0.1, s * 0.4);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(s * 0.43, s * 0.28, s * 0.14, s * 0.5);

    const drawRoof = (cx, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, y - h);
      ctx.lineTo(cx + w / 2, y);
      ctx.lineTo(cx - w / 2, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - 2, y - h - 26, 4, 26);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(cx + 2, y - h - 26);
      ctx.lineTo(cx + 30, y - h - 18);
      ctx.lineTo(cx + 2, y - h - 10);
      ctx.closePath();
      ctx.fill();
    };
    drawRoof(s * 0.25, s * 0.38, s * 0.14, s * 0.14, '#ec4899');
    drawRoof(s * 0.75, s * 0.38, s * 0.14, s * 0.14, '#8b5cf6');
    drawRoof(s * 0.5, s * 0.28, s * 0.19, s * 0.16, '#3b82f6');

    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.68, s * 0.065, Math.PI, 0);
    ctx.lineTo(s * 0.565, s * 0.78);
    ctx.lineTo(s * 0.435, s * 0.78);
    ctx.closePath();
    ctx.fill();

    ['#ec4899', '#facc15', '#a855f7', '#fb7185'].forEach((col, i) => {
      const fx = s * (0.16 + i * 0.22);
      const fy = s * (0.85 + (i % 2) * 0.04);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(fx, fy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSaturnRings(ctx, s) {
    const bg = ctx.createRadialGradient(s * 0.5, s * 0.45, 30, s * 0.5, s * 0.5, s * 0.72);
    bg.addColorStop(0, '#312e81');
    bg.addColorStop(0.55, '#1e1b4b');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#ffffff';
      ctx.beginPath();
      ctx.arc(((i * 97) % 92 + 4) * s / 100, ((i * 53) % 90 + 5) * s / 100, (i % 3) + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Nebula Swirl
    ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';
    ctx.beginPath();
    ctx.ellipse(s * 0.25, s * 0.28, s * 0.22, s * 0.09, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Saturn Back Rings
    ctx.save();
    ctx.translate(s * 0.5, s * 0.52);
    ctx.rotate(-0.28);
    [
      [s * 0.38, s * 0.11, 20, '#fde68a'],
      [s * 0.32, s * 0.088, 16, '#fb923c'],
      [s * 0.27, s * 0.072, 10, '#bae6fd']
    ].forEach(([rx, ry, lw, col]) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    // Planet Body
    const pGrad = ctx.createLinearGradient(0, -s * 0.19, 0, s * 0.19);
    pGrad.addColorStop(0, '#fef08a');
    pGrad.addColorStop(0.45, '#f59e0b');
    pGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.19, 0, Math.PI * 2);
    ctx.fill();

    // Front Rings
    [
      [s * 0.38, s * 0.11, 20, '#fde68a'],
      [s * 0.32, s * 0.088, 16, '#fb923c'],
      [s * 0.27, s * 0.072, 10, '#bae6fd']
    ].forEach(([rx, ry, lw, col]) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
      ctx.stroke();
    });
    ctx.restore();

    // Titan Moon
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(s * 0.82, s * 0.2, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSolarSystem(ctx, s) {
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, '#090d24');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#bae6fd';
      ctx.beginPath();
      ctx.arc(((i * 71) % 94 + 3) * s / 100, ((i * 41) % 92 + 4) * s / 100, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbit Rings
    [0.24, 0.34, 0.45, 0.57, 0.69].forEach((r) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s * 0.16, s * 0.5, s * r, -0.7, 0.7);
      ctx.stroke();
    });

    // Sun
    const sunGrad = ctx.createRadialGradient(s * 0.14, s * 0.48, 10, s * 0.14, s * 0.5, s * 0.18);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.65, '#f59e0b');
    sunGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(s * 0.12, s * 0.5, s * 0.17, 0, Math.PI * 2);
    ctx.fill();

    // Planets
    const planets = [
      { x: 0.37, y: 0.37, r: 0.04, c1: '#fb923c', c2: '#ea580c' },
      { x: 0.48, y: 0.58, r: 0.06, c1: '#38bdf8', c2: '#16a34a' },
      { x: 0.6, y: 0.34, r: 0.048, c1: '#f87171', c2: '#b91c1c' },
      { x: 0.73, y: 0.55, r: 0.085, c1: '#fdba74', c2: '#c2410c' },
      { x: 0.87, y: 0.35, r: 0.062, c1: '#60a5fa', c2: '#2563eb' }
    ];
    planets.forEach((p) => {
      const g = ctx.createRadialGradient(p.x * s - 8, p.y * s - 8, 3, p.x * s, p.y * s, p.r * s);
      g.addColorStop(0, p.c1);
      g.addColorStop(1, p.c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x * s, p.y * s, p.r * s, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBerryBasket(ctx, s) {
    const bg = ctx.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, '#fef3c7');
    bg.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    // Tablecloth Stripes
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(0, s * 0.72, s, s * 0.28);
    ctx.fillStyle = '#fecdd3';
    for (let x = 0; x < s; x += 60) {
      ctx.fillRect(x, s * 0.72, 28, s * 0.28);
    }

    // Basket
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.48);
    ctx.lineTo(s * 0.8, s * 0.48);
    ctx.lineTo(s * 0.72, s * 0.82);
    ctx.lineTo(s * 0.28, s * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Big Smiling Strawberry
    const drawStrawberry = (cx, cy, sc) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, 88);
      ctx.bezierCurveTo(-82, 35, -72, -62, 0, -55);
      ctx.bezierCurveTo(72, -62, 82, 35, 0, 88);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      [[-28, -15], [26, -18], [-15, 22], [18, 20], [0, 48], [0, -8]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(-22, -58, 24, 12, -0.4, 0, Math.PI * 2);
      ctx.ellipse(22, -58, 24, 12, 0.4, 0, Math.PI * 2);
      ctx.ellipse(0, -64, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawStrawberry(s * 0.5, s * 0.4, 1.35);
    drawStrawberry(s * 0.31, s * 0.46, 0.9);
    drawStrawberry(s * 0.69, s * 0.46, 0.9);

    // Blueberries
    [[0.36, 0.3], [0.64, 0.31], [0.22, 0.75], [0.78, 0.75]].forEach(([bx, by]) => {
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(s * bx, s * by, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.arc(s * bx - 8, s * by - 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawTropicalTrio(ctx, s) {
    const bg = ctx.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, '#bae6fd');
    bg.addColorStop(0.65, '#fef9c3');
    bg.addColorStop(1, '#fde68a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    // Pineapple
    ctx.save();
    ctx.translate(s * 0.32, s * 0.52);
    ctx.fillStyle = '#16a34a';
    [-0.5, -0.2, 0, 0.2, 0.5].forEach((ang) => {
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, -138, 18, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 82, 108, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    for (let y = -70; y <= 70; y += 35) {
      ctx.beginPath();
      ctx.moveTo(-64, y);
      ctx.lineTo(64, y + 25);
      ctx.moveTo(64, y);
      ctx.lineTo(-64, y + 25);
      ctx.stroke();
    }
    ctx.restore();

    // Watermelon Slice
    ctx.save();
    ctx.translate(s * 0.68, s * 0.64);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dcfce7';
    ctx.beginPath();
    ctx.arc(0, 0, 124, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 112, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    [[-45, 34], [0, 52], [45, 34], [-22, 74], [24, 74]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Kiwi Slice
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(s * 0.72, s * 0.28, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(s * 0.72, s * 0.28, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ecfccb';
    ctx.beginPath();
    ctx.arc(s * 0.72, s * 0.28, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRainbowOrchard(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s * 0.75);
    sky.addColorStop(0, '#60a5fa');
    sky.addColorStop(1, '#dbeafe');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(s * 0.84, s * 0.16, s * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, s * 0.72, s, s * 0.28);

    // Big Apple Tree
    ctx.fillStyle = '#92400e';
    ctx.fillRect(s * 0.42, s * 0.48, s * 0.16, s * 0.34);
    ctx.fillStyle = '#15803d';
    [[0.5, 0.36, 0.24], [0.34, 0.42, 0.16], [0.66, 0.42, 0.16]].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(s * cx, s * cy, s * r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Apples on Tree + Oranges & Mango on Grass
    [[0.4, 0.3], [0.56, 0.27], [0.64, 0.42], [0.36, 0.44], [0.5, 0.41]].forEach(([ax, ay]) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(s * ax, s * ay, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.ellipse(s * ax + 8, s * ay - 22, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Basket of Oranges & Grapes on Grass
    [[0.22, 0.82, '#f97316'], [0.29, 0.84, '#fb923c'], [0.74, 0.83, '#8b5cf6'], [0.79, 0.83, '#a855f7'], [0.76, 0.88, '#7c3aed']].forEach(([fx, fy, col]) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(s * fx, s * fy, 24, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawForestFox(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(0.55, '#a7f3d0');
    sky.addColorStop(1, '#15803d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    // Pine Trees
    const drawPine = (x, y, h, col) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 14, y, 28, 70);
      ctx.fillStyle = col;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y - h + i * 48);
        ctx.lineTo(x + 76 - i * 10, y - i * 38);
        ctx.lineTo(x - 76 + i * 10, y - i * 38);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawPine(s * 0.18, s * 0.65, 220, '#166534');
    drawPine(s * 0.82, s * 0.63, 240, '#15803d');
    drawPine(s * 0.52, s * 0.56, 190, '#22c55e');

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, s * 0.72, s, s * 0.28);

    // Mushrooms
    [[0.2, 0.84], [0.8, 0.85]].forEach(([mx, my]) => {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(s * mx - 12, s * my - 10, 24, 38);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(s * mx, s * my - 10, 34, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * mx - 12, s * my - 24, 6, 0, Math.PI * 2);
      ctx.arc(s * mx + 12, s * my - 22, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cute Forest Fox
    ctx.save();
    ctx.translate(s * 0.5, s * 0.7);
    // Tail
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(88, 12, 65, 30, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(135, -6, 20, 0, Math.PI * 2);
    ctx.fill();
    // Body & Head
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 22, 62, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-66, -34);
    ctx.lineTo(-42, -108);
    ctx.lineTo(-14, -56);
    ctx.closePath();
    ctx.moveTo(66, -34);
    ctx.lineTo(42, -108);
    ctx.lineTo(14, -56);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -34, 72, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-28, -14, 34, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(28, -14, 34, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-26, -38, 8, 0, Math.PI * 2);
    ctx.arc(26, -38, 8, 0, Math.PI * 2);
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNightOwl(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(0.6, '#1e1b4b');
    sky.addColorStop(1, '#064e3b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    // Moon & Stars
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(s * 0.2, s * 0.2, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(s * 0.24, s * 0.18, 46, 0, Math.PI * 2);
    ctx.fill();

    [[0.46, 0.14], [0.72, 0.16], [0.88, 0.28], [0.12, 0.42], [0.6, 0.22]].forEach(([sx, sy]) => {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(s * sx, s * sy, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tree Branch
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.72);
    ctx.quadraticCurveTo(s * 0.48, s * 0.65, s * 0.92, s * 0.72);
    ctx.stroke();

    // Cute Wise Owl
    ctx.save();
    ctx.translate(s * 0.52, s * 0.5);
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(0, 20, 92, 108, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.ellipse(0, 44, 58, 66, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-34, -22, 34, 0, Math.PI * 2);
    ctx.arc(34, -22, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-30, -22, 16, 0, Math.PI * 2);
    ctx.arc(30, -22, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(14, -4);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawWaterfallGlade(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s * 0.6);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(1, '#dcfce7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    // Cliffs & Waterfall
    ctx.fillStyle = '#64748b';
    ctx.fillRect(s * 0.25, s * 0.2, s * 0.5, s * 0.52);
    const wf = ctx.createLinearGradient(0, s * 0.2, 0, s * 0.75);
    wf.addColorStop(0, '#bae6fd');
    wf.addColorStop(1, '#0284c7');
    ctx.fillStyle = wf;
    ctx.fillRect(s * 0.4, s * 0.2, s * 0.2, s * 0.55);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, s * 0.68, s, s * 0.32);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.82, s * 0.32, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Forest Pines & Butterflies
    ctx.fillStyle = '#15803d';
    [[0.14, 0.52], [0.86, 0.52]].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.moveTo(s * tx, s * (ty - 0.3));
      ctx.lineTo(s * (tx + 0.12), s * (ty + 0.16));
      ctx.lineTo(s * (tx - 0.12), s * (ty + 0.16));
      ctx.closePath();
      ctx.fill();
    });
    [[0.28, 0.36, '#f472b6'], [0.74, 0.3, '#facc15']].forEach(([bx, by, col]) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(s * bx - 10, s * by, 14, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(s * bx + 10, s * by, 14, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPolarFriends(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, s * 0.65);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(0.55, '#14b8a6');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, s, s);

    // Aurora Wave
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.65)';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.08, s * 0.24);
    ctx.quadraticCurveTo(s * 0.42, s * 0.08, s * 0.92, s * 0.26);
    ctx.stroke();

    // Iceberg & Ocean
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, s * 0.66, s, s * 0.34);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.72, s * 0.4, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy Penguin
    ctx.save();
    ctx.translate(s * 0.5, s * 0.58);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 74, 102, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 14, 52, 74, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-22, -40, 8, 0, Math.PI * 2);
    ctx.arc(22, -40, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-16, -24);
    ctx.lineTo(16, -24);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-28, 102, 24, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(28, 102, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const PUZZLE_CATEGORIES = [
    { id: 'space', label: 'Planets & Space', emoji: '🪐' },
    { id: 'fruits', label: 'Yummy Fruits', emoji: '🍓' },
    { id: 'forest', label: 'Forest', emoji: '🌲' },
    { id: 'animals', label: 'Dinos & Ocean', emoji: '🦕' },
    { id: 'stories', label: 'Castles & Stories', emoji: '🏰' }
  ];

  const DEFAULT_PICTURES = [
    { id: 'rocket', category: 'space', title: 'Space Rocket', emoji: '🚀', draw: drawSpaceAdventure, fact: 'Rockets fly at over 25,000 mph to escape Earth’s gravity!' },
    { id: 'saturn', category: 'space', title: 'Ringed Saturn', emoji: '🪐', draw: drawSaturnRings, fact: 'Saturn’s glowing rings are made of billions of ice and rock pieces!' },
    { id: 'solar', category: 'space', title: 'Solar System', emoji: '☀️', draw: drawSolarSystem, fact: 'Eight planets orbit around our giant star, the Sun!' },

    { id: 'strawberry', category: 'fruits', title: 'Berry Basket', emoji: '🍓', draw: drawBerryBasket, fact: 'Strawberries are the only fruit with seeds on the outside!' },
    { id: 'tropical', category: 'fruits', title: 'Tropical Trio', emoji: '🍍', draw: drawTropicalTrio, fact: 'Watermelon is over 90% water—super refreshing!' },
    { id: 'orchard', category: 'fruits', title: 'Rainbow Orchard', emoji: '🍎', draw: drawRainbowOrchard, fact: 'Apples float in water because 25% of an apple is air!' },

    { id: 'fox', category: 'forest', title: 'Forest Fox', emoji: '🦊', draw: drawForestFox, fact: 'Foxes use their fluffy tails like warm blankets in winter!' },
    { id: 'owl', category: 'forest', title: 'Night Owl', emoji: '🦉', draw: drawNightOwl, fact: 'Owls can turn their heads almost all the way around!' },
    { id: 'waterfall', category: 'forest', title: 'Waterfall Glade', emoji: '🦌', draw: drawWaterfallGlade, fact: 'Forest trees clean the air and give homes to thousands of animals!' },

    { id: 'dino', category: 'animals', title: 'Dino Meadow', emoji: '🦕', draw: drawDinoMeadow, fact: 'Some long-necked dinosaurs were as tall as a 4-story building!' },
    { id: 'ocean', category: 'animals', title: 'Ocean Reef', emoji: '🐠', draw: drawOceanReef, fact: 'Octopuses are super smart and have three hearts!' },
    { id: 'arctic', category: 'animals', title: 'Polar Friends', emoji: '🐧', draw: drawPolarFriends, fact: 'Emperor penguins can dive deeper than 1,500 feet in icy oceans!' },

    { id: 'castle', category: 'stories', title: 'Rainbow Castle', emoji: '🏰', draw: drawRainbowCastle, fact: 'Fairytale castles had tall lookout towers to spot visitors!' },
    { id: 'ganesha', category: 'stories', title: 'Little Ganesha', emoji: '🪷', src: './ganeshsa.jpeg', fact: 'Ganesha is loved as the friendly helper of wisdom and new beginnings!' },
    { id: 'mountain', category: 'stories', title: 'Mount Kailash', emoji: '🏔️', src: './mountain.jpeg', fact: 'High snowy mountains feed clean rivers far down into the valleys!' }
  ];

  function createSquareCanvasFromImage(img) {
    const c = document.createElement('canvas');
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    const ctx = c.getContext('2d');
    const minSide = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const sx = Math.floor(((img.naturalWidth || img.width) - minSide) / 2);
    const sy = Math.floor(((img.naturalHeight || img.height) - minSide) / 2);
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    return c;
  }

  function renderPictureToCanvas(pic) {
    return new Promise((resolve, reject) => {
      if (pic.canvas) {
        resolve(pic.canvas);
        return;
      }
      if (typeof pic.draw === 'function') {
        const c = document.createElement('canvas');
        c.width = CANVAS_SIZE;
        c.height = CANVAS_SIZE;
        pic.draw(c.getContext('2d'), CANVAS_SIZE);
        pic.canvas = c;
        pic.thumbUrl = c.toDataURL('image/jpeg', 0.85);
        resolve(c);
        return;
      }
      if (pic.src) {
        const img = new Image();
        img.onload = () => {
          const c = createSquareCanvasFromImage(img);
          pic.canvas = c;
          pic.thumbUrl = c.toDataURL('image/jpeg', 0.85);
          resolve(c);
        };
        img.onerror = () => reject(new Error('Could not load picture'));
        img.src = pic.src;
        return;
      }
      reject(new Error('Invalid picture'));
    });
  }

  function sliceCanvasToTiles(sourceCanvas, gridSize) {
    const tiles = [];
    const tilePx = Math.floor(CANVAS_SIZE / gridSize);
    const temp = document.createElement('canvas');
    temp.width = tilePx;
    temp.height = tilePx;
    const tCtx = temp.getContext('2d');

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const sx = Math.floor((c * CANVAS_SIZE) / gridSize);
        const sy = Math.floor((r * CANVAS_SIZE) / gridSize);
        const sw = Math.floor(((c + 1) * CANVAS_SIZE) / gridSize) - sx;
        const sh = Math.floor(((r + 1) * CANVAS_SIZE) / gridSize) - sy;
        tCtx.clearRect(0, 0, tilePx, tilePx);
        tCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, tilePx, tilePx);
        tiles.push(temp.toDataURL('image/jpeg', 0.9));
      }
    }
    return tiles;
  }

  /* -------------------------------------------------------------------------
     Real Interlocking Jigsaw Geometry & Piece Slicing
     ------------------------------------------------------------------------- */
  function generateJigsawTopology(gridSize) {
    const hEdges = Array.from({ length: gridSize + 1 }, (_, r) =>
      Array.from({ length: gridSize }, () =>
        r === 0 || r === gridSize ? 0 : Math.random() < 0.5 ? 1 : -1
      )
    );
    const vEdges = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize + 1 }, (_, c) =>
        c === 0 || c === gridSize ? 0 : Math.random() < 0.5 ? 1 : -1
      )
    );
    return { hEdges, vEdges };
  }

  function drawJigsawSide(ctx, x1, y1, x2, y2, tabDir) {
    if (!tabDir) {
      ctx.lineTo(x2, y2);
      return;
    }
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    // Outward normal for clockwise rectangle traversal in screen coords (+x right, +y down)
    const nx = (dy / len) * tabDir;
    const ny = (-dx / len) * tabDir;
    const px = (t, n) => x1 + t * dx + n * len * nx;
    const py = (t, n) => y1 + t * dy + n * len * ny;

    ctx.lineTo(px(0.35, 0), py(0.35, 0));
    ctx.bezierCurveTo(
      px(0.38, 0.02), py(0.38, 0.02),
      px(0.42, 0.06), py(0.42, 0.06),
      px(0.40, 0.12), py(0.40, 0.12)
    );
    ctx.bezierCurveTo(
      px(0.36, 0.22), py(0.36, 0.22),
      px(0.64, 0.22), py(0.64, 0.22),
      px(0.60, 0.12), py(0.60, 0.12)
    );
    ctx.bezierCurveTo(
      px(0.58, 0.06), py(0.58, 0.06),
      px(0.62, 0.02), py(0.62, 0.02),
      px(0.65, 0), py(0.65, 0)
    );
    ctx.lineTo(x2, y2);
  }

  function traceJigsawPath(ctx, x, y, cell, edges) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawJigsawSide(ctx, x, y, x + cell, y, edges.top);
    drawJigsawSide(ctx, x + cell, y, x + cell, y + cell, edges.right);
    drawJigsawSide(ctx, x + cell, y + cell, x, y + cell, edges.bottom);
    drawJigsawSide(ctx, x, y + cell, x, y, edges.left);
    ctx.closePath();
  }

  function sliceCanvasToJigsawPieces(sourceCanvas, gridSize) {
    const { hEdges, vEdges } = generateJigsawTopology(gridSize);
    const cell = CANVAS_SIZE / gridSize;
    const pad = Math.ceil(cell * 0.24);
    const fullSize = Math.ceil(cell + pad * 2);

    const pieceUrls = [];
    const pieceEdges = [];
    const temp = document.createElement('canvas');
    temp.width = fullSize;
    temp.height = fullSize;
    const tCtx = temp.getContext('2d');

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const edges = {
          top: hEdges[r][c] ? -hEdges[r][c] : 0,
          right: vEdges[r][c + 1],
          bottom: hEdges[r + 1][c],
          left: vEdges[r][c] ? -vEdges[r][c] : 0
        };
        pieceEdges.push(edges);

        tCtx.clearRect(0, 0, fullSize, fullSize);
        tCtx.save();
        traceJigsawPath(tCtx, pad, pad, cell, edges);
        tCtx.clip();

        // Draw expanded source region so protruding tabs carry exact image pixels
        const srcX = c * cell - pad;
        const srcY = r * cell - pad;
        tCtx.drawImage(sourceCanvas, srcX, srcY, fullSize, fullSize, 0, 0, fullSize, fullSize);
        tCtx.restore();

        // Crisp bevel highlight + dark seam outline
        tCtx.save();
        traceJigsawPath(tCtx, pad, pad, cell, edges);
        tCtx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
        tCtx.lineWidth = 4;
        tCtx.stroke();
        tCtx.strokeStyle = 'rgba(15, 23, 42, 0.36)';
        tCtx.lineWidth = 1.8;
        tCtx.stroke();
        tCtx.restore();

        pieceUrls.push(temp.toDataURL('image/png'));
      }
    }

    return {
      pieceUrls,
      pieceEdges,
      overhangPct: (pad / cell) * 100,
      sizePct: ((cell + pad * 2) / cell) * 100
    };
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function createDerangedBoard(total) {
    const arr = Array.from({ length: total }, (_, i) => i);
    for (let attempt = 0; attempt < 15; attempt++) {
      for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      if (arr.every((val, idx) => val !== idx)) return arr;
    }
    for (let i = 0; i < total; i++) {
      if (arr[i] === i) {
        const j = (i + 1) % total;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }

  function createSolvableSlideBoard(gridSize) {
    const total = gridSize * gridSize;
    const emptyVal = total - 1;
    const board = Array.from({ length: total }, (_, i) => i);
    let emptyIdx = emptyVal;
    let prevIdx = -1;
    const steps = total * 22;

    for (let s = 0; s < steps; s++) {
      const r = Math.floor(emptyIdx / gridSize);
      const c = emptyIdx % gridSize;
      const neighbors = [];
      if (r > 0) neighbors.push(emptyIdx - gridSize);
      if (r < gridSize - 1) neighbors.push(emptyIdx + gridSize);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < gridSize - 1) neighbors.push(emptyIdx + 1);
      const filtered = neighbors.filter((n) => n !== prevIdx);
      const next = filtered[Math.floor(Math.random() * filtered.length)];
      [board[emptyIdx], board[next]] = [board[next], board[emptyIdx]];
      prevIdx = emptyIdx;
      emptyIdx = next;
    }

    if (board.every((v, i) => v === i)) {
      const r = Math.floor(emptyIdx / gridSize);
      const swapWith = r > 0 ? emptyIdx - gridSize : emptyIdx + gridSize;
      [board[emptyIdx], board[swapWith]] = [board[swapWith], board[emptyIdx]];
    }
    return board;
  }

  class PicturePuzzleGame {
    constructor({ profileStore, refreshHeader }) {
      this.profileStore = profileStore;
      this.refreshHeader = refreshHeader;

      this.pictures = DEFAULT_PICTURES.map((p) => ({ ...p }));
      this.customPicture = null;
      this.activeCategory = PUZZLE_CATEGORIES[0].id;
      this.activePictureId = 'rocket';
      this.difficulty = 'easy';
      this.mode = 'jigsaw'; // 'jigsaw' | 'swap' | 'slide'
      this.showNumbers = false;
      this.peeking = false;
      this.screen = 'setup'; // 'setup' | 'play'

      this.board = [];
      this.trayPieces = [];
      this.tileUrls = [];
      this.jigsawData = null;
      this.fullImageUrl = '';
      this.moves = 0;
      this.elapsedSec = 0;
      this.timerId = null;
      this.selectedPos = null;
      this.selectedTrayPiece = null;
      this.hintPositions = [];
      this.hintTrayPiece = null;
      this.hintTimer = null;
      this.breakTimer = null;
      this.solved = false;
      this.loadToken = 0;

      this.bestRecords = this._loadBest();
      this._bindEvents();
      this._renderCategoryTabs();
      this._renderPictureGallery();
    }

    _loadBest() {
      try {
        const raw = localStorage.getItem(BEST_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (_) {
        return {};
      }
    }

    _saveBest() {
      try {
        localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(this.bestRecords));
      } catch (_) {}
    }

    _getCompletedSet() {
      const list = this.profileStore && this.profileStore.profile && Array.isArray(this.profileStore.profile.puzzleCompleted)
        ? this.profileStore.profile.puzzleCompleted
        : [];
      return new Set(list);
    }

    _getCategoryPictures(categoryId = this.activeCategory) {
      return this.pictures.filter((p) => p.category === categoryId);
    }

    _isPictureUnlocked(picId) {
      if (picId === 'custom' && this.customPicture) return true;
      const pic = this.pictures.find((p) => p.id === picId);
      if (!pic) return false;
      const catPics = this._getCategoryPictures(pic.category);
      const idx = catPics.findIndex((p) => p.id === picId);
      if (idx <= 0) return idx === 0;
      const completed = this._getCompletedSet();
      return completed.has(picId) || completed.has(catPics[idx - 1].id);
    }

    _getNextSuggestedPictureId(categoryId = this.activeCategory) {
      const completed = this._getCompletedSet();
      const catPics = this._getCategoryPictures(categoryId);
      for (let i = 0; i < catPics.length; i++) {
        const pic = catPics[i];
        if (this._isPictureUnlocked(pic.id) && !completed.has(pic.id)) {
          return pic.id;
        }
      }
      return (catPics[0] || this.pictures[0]).id;
    }

    _markPictureCompleted(picId) {
      if (picId === 'custom') return null;
      const profile = this.profileStore.profile;
      if (!Array.isArray(profile.puzzleCompleted)) {
        profile.puzzleCompleted = [];
      }
      const pic = this.pictures.find((p) => p.id === picId);
      const catPics = pic ? this._getCategoryPictures(pic.category) : [];
      const idx = catPics.findIndex((p) => p.id === picId);
      const nextPic = idx >= 0 && idx + 1 < catPics.length ? catPics[idx + 1] : null;
      const wasNextUnlocked = nextPic ? this._isPictureUnlocked(nextPic.id) : true;

      if (!profile.puzzleCompleted.includes(picId)) {
        profile.puzzleCompleted.push(picId);
      }
      this.profileStore.save(profile);

      if (nextPic && !wasNextUnlocked && this._isPictureUnlocked(nextPic.id)) {
        return nextPic;
      }
      return null;
    }

    _getActivePicture() {
      if (this.activePictureId === 'custom' && this.customPicture) {
        return this.customPicture;
      }
      return this.pictures.find((p) => p.id === this.activePictureId) || this.pictures[0];
    }

    setCategory(categoryId) {
      if (!PUZZLE_CATEGORIES.some((c) => c.id === categoryId)) return;
      this.activeCategory = categoryId;
      const currentPic = this._getActivePicture();
      if (!currentPic || (currentPic.id !== 'custom' && currentPic.category !== categoryId)) {
        this.activePictureId = this._getNextSuggestedPictureId(categoryId);
      }
      const toast = $('puzzle-lock-toast');
      if (toast) toast.textContent = '';
      this._renderCategoryTabs();
      this._renderPictureGallery();
    }

    _renderCategoryTabs() {
      const tabsEl = $('puzzle-cat-tabs');
      if (!tabsEl) return;
      tabsEl.innerHTML = '';
      const completed = this._getCompletedSet();

      PUZZLE_CATEGORIES.forEach((cat) => {
        const catPics = this._getCategoryPictures(cat.id);
        const doneCount = catPics.filter((p) => completed.has(p.id)).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `puzzle-cat-tab ${cat.id === this.activeCategory ? 'active' : ''}`;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(cat.id === this.activeCategory));
        btn.innerHTML = `
          <span class="puzzle-cat-emoji">${cat.emoji}</span>
          <span class="puzzle-cat-label">${cat.label}</span>
          ${doneCount > 0 ? `<span class="puzzle-cat-count">${doneCount}/${catPics.length}</span>` : ''}
        `;
        btn.addEventListener('click', () => {
          AudioEngine.pop();
          this.setCategory(cat.id);
        });
        tabsEl.appendChild(btn);
      });
    }

    _bindEvents() {
      document.querySelectorAll('[data-puzzle-diff]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.setDifficulty(btn.dataset.puzzleDiff);
          AudioEngine.pop();
        });
      });

      document.querySelectorAll('[data-puzzle-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.setMode(btn.dataset.puzzleMode);
          AudioEngine.pop();
        });
      });

      const startBtn = $('btn-puzzle-start');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          AudioEngine.pop();
          this.startPuzzlePlay();
        });
      }

      const toSetupBtn = $('btn-puzzle-to-setup');
      if (toSetupBtn) {
        toSetupBtn.addEventListener('click', () => {
          AudioEngine.pop();
          this.showSetupScreen();
        });
      }

      const allPicsBtn = $('btn-puzzle-all-pics');
      if (allPicsBtn) {
        allPicsBtn.addEventListener('click', () => {
          AudioEngine.pop();
          this.showSetupScreen();
        });
      }

      $('btn-puzzle-shuffle').addEventListener('click', () => {
        this.breakPuzzle();
      });

      $('btn-puzzle-hint').addEventListener('click', () => this.showHint());

      const togglePeek = () => {
        this.peeking = !this.peeking;
        $('btn-puzzle-peek').classList.toggle('active', this.peeking);
        $('puzzle-peek-overlay').classList.toggle('hidden', !this.peeking);
        AudioEngine.pop();
      };

      $('btn-puzzle-peek').addEventListener('click', togglePeek);
      const mobileGoalBtn = $('puzzle-mobile-goal-btn');
      if (mobileGoalBtn) mobileGoalBtn.addEventListener('click', togglePeek);

      $('puzzle-upload-input').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) this.handleUploadFile(file);
        e.target.value = '';
      });

      const dropStage = $('puzzle-board-wrap');
      dropStage.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropStage.classList.add('file-drag-over');
      });
      dropStage.addEventListener('dragleave', () => {
        dropStage.classList.remove('file-drag-over');
      });
      dropStage.addEventListener('drop', (e) => {
        e.preventDefault();
        dropStage.classList.remove('file-drag-over');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) this.handleUploadFile(file);
      });

      $('btn-puzzle-again').addEventListener('click', () => {
        AudioEngine.pop();
        this.breakPuzzle();
      });

      $('btn-puzzle-next-pic').addEventListener('click', () => {
        AudioEngine.pop();
        this.playNextUnlockedPicture();
      });
    }

    open() {
      this.start();
    }

    start() {
      if (!this._isPictureUnlocked(this.activePictureId)) {
        this.activePictureId = this._getNextSuggestedPictureId(this.activeCategory);
      }
      this.showSetupScreen();
    }

    showSetupScreen() {
      this.stop();
      this.screen = 'setup';
      const setupEl = $('puzzle-screen-setup');
      const playEl = $('puzzle-screen-play');
      if (setupEl) setupEl.classList.remove('hidden');
      if (playEl) playEl.classList.add('hidden');
      const toast = $('puzzle-lock-toast');
      if (toast) toast.textContent = '';

      const pic = this._getActivePicture();
      if (pic && pic.category) this.activeCategory = pic.category;
      if (!this._isPictureUnlocked(this.activePictureId)) {
        this.activePictureId = this._getNextSuggestedPictureId(this.activeCategory);
      }
      this._syncToolbarUI();
      this._renderCategoryTabs();
      this._renderPictureGallery();
    }

    startPuzzlePlay() {
      if (!this._isPictureUnlocked(this.activePictureId)) {
        this.activePictureId = this._getNextSuggestedPictureId(this.activeCategory);
      }
      this.screen = 'play';
      const setupEl = $('puzzle-screen-setup');
      const playEl = $('puzzle-screen-play');
      if (setupEl) setupEl.classList.add('hidden');
      if (playEl) playEl.classList.remove('hidden');
      const pic = this._getActivePicture();
      const titleChip = $('puzzle-play-title');
      if (titleChip && pic) titleChip.textContent = `${pic.emoji} ${pic.title}`;
      this.newRound(true);
    }

    stop() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.hintTimer) {
        clearTimeout(this.hintTimer);
        this.hintTimer = null;
      }
      if (this.breakTimer) {
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }
    }

    setDifficulty(diffId) {
      if (!DIFFICULTIES[diffId]) return;
      this.difficulty = diffId;
      this._syncToolbarUI();
      if (this.screen === 'play') {
        this.newRound();
      }
    }

    setMode(mode) {
      if (mode !== 'jigsaw' && mode !== 'swap' && mode !== 'slide') return;
      this.mode = mode;
      this._syncToolbarUI();
      if (this.screen === 'play') {
        this.newRound();
      }
    }

    selectPicture(picId) {
      if (!this._isPictureUnlocked(picId)) return false;
      this.activePictureId = picId;
      const pic = this._getActivePicture();
      if (pic && pic.category) this.activeCategory = pic.category;
      const toast = $('puzzle-lock-toast');
      if (toast) toast.textContent = '';
      this._renderCategoryTabs();
      this._renderPictureGallery();
      if (this.screen === 'play') {
        const titleChip = $('puzzle-play-title');
        if (titleChip && pic) titleChip.textContent = `${pic.emoji} ${pic.title}`;
        this.newRound();
      }
      return true;
    }

    playNextUnlockedPicture() {
      const catPics = this._getCategoryPictures(this.activeCategory);
      const idx = catPics.findIndex((p) => p.id === this.activePictureId);
      if (idx >= 0 && idx + 1 < catPics.length && this._isPictureUnlocked(catPics[idx + 1].id)) {
        this.activePictureId = catPics[idx + 1].id;
      } else {
        const catIdx = PUZZLE_CATEGORIES.findIndex((c) => c.id === this.activeCategory);
        const nextCat = PUZZLE_CATEGORIES[(catIdx + 1) % PUZZLE_CATEGORIES.length];
        this.activeCategory = nextCat.id;
        this.activePictureId = this._getNextSuggestedPictureId(nextCat.id);
      }
      this.startPuzzlePlay();
    }

    breakPuzzle() {
      if (this.breakTimer) {
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }
      AudioEngine.crack();
      const wrap = $('puzzle-board-wrap');
      if (wrap) {
        wrap.classList.remove('breaking-burst');
        void wrap.offsetWidth;
        wrap.classList.add('breaking-burst');
        this.breakTimer = setTimeout(() => {
          wrap.classList.remove('breaking-burst');
        }, 420);
      }
      this.newRound(true);
    }

    handleUploadFile(file) {
      if (!file.type.startsWith('image/') && !/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || '')) {
        const toast = $('puzzle-lock-toast');
        if (toast) toast.textContent = 'Please pick an image file (PNG, JPG, WebP, or GIF)! 🖼️';
        AudioEngine.wrong();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = createSquareCanvasFromImage(img);
          const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
          this.customPicture = {
            id: 'custom',
            title: 'My Photo',
            emoji: '📸',
            canvas,
            thumbUrl,
            fact: 'You made your very own custom photo puzzle!'
          };
          this.activePictureId = 'custom';
          AudioEngine.magic();
          this._renderCategoryTabs();
          this._renderPictureGallery();
          this.startPuzzlePlay();
        };
        img.onerror = () => {
          const toast = $('puzzle-lock-toast');
          if (toast) toast.textContent = 'Oops! Could not read that picture. Try another photo!';
          AudioEngine.wrong();
        };
        img.src = String(reader.result);
      };
      reader.onerror = () => {
        const toast = $('puzzle-lock-toast');
        if (toast) toast.textContent = 'Oops! Could not open that file. Try another photo!';
        AudioEngine.wrong();
      };
      reader.readAsDataURL(file);
    }

    _syncToolbarUI() {
      document.querySelectorAll('[data-puzzle-diff]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.puzzleDiff === this.difficulty);
      });
      document.querySelectorAll('[data-puzzle-mode]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.puzzleMode === this.mode);
      });
    }

    _renderPictureGallery() {
      const grid = $('puzzle-gallery-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const completed = this._getCompletedSet();
      const catPics = this._getCategoryPictures(this.activeCategory);
      const unlockedCount = catPics.filter((p) => this._isPictureUnlocked(p.id)).length;
      const counterEl = $('puzzle-unlock-counter');
      if (counterEl) {
        counterEl.textContent = `${unlockedCount} / ${catPics.length} Unlocked`;
      }

      const all = this.customPicture ? [this.customPicture, ...catPics] : catPics;

      all.forEach((pic) => {
        const isCustom = pic.id === 'custom';
        const unlocked = this._isPictureUnlocked(pic.id);
        const isDone = !isCustom && completed.has(pic.id);
        const isNextUp = unlocked && !isDone && !isCustom;
        const idx = catPics.findIndex((p) => p.id === pic.id);
        const prevPic = idx > 0 ? catPics[idx - 1] : null;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'puzzle-pic-card';
        if (pic.id === this.activePictureId) btn.classList.add('active');
        if (isDone) btn.classList.add('completed');
        if (!unlocked) btn.classList.add('locked');
        btn.dataset.picId = pic.id;
        btn.setAttribute('aria-label', unlocked ? `${pic.title}` : `${pic.title} (Locked)`);

        const thumb = document.createElement('div');
        thumb.className = 'puzzle-pic-card-thumb';
        if (pic.thumbUrl) {
          const img = document.createElement('img');
          img.src = pic.thumbUrl;
          img.alt = pic.title;
          thumb.appendChild(img);
        } else if (typeof pic.draw === 'function') {
          renderPictureToCanvas(pic).then(() => {
            const img = document.createElement('img');
            img.src = pic.thumbUrl;
            img.alt = pic.title;
            thumb.innerHTML = '';
            thumb.appendChild(img);
            if (!unlocked) {
              const lockEl = document.createElement('div');
              lockEl.className = 'puzzle-pic-lock-overlay';
              lockEl.textContent = '🔒';
              thumb.appendChild(lockEl);
            }
          });
        } else if (pic.src) {
          const img = document.createElement('img');
          img.src = pic.src;
          img.alt = pic.title;
          thumb.appendChild(img);
        } else {
          thumb.textContent = pic.emoji;
        }

        if (!unlocked) {
          const lockEl = document.createElement('div');
          lockEl.className = 'puzzle-pic-lock-overlay';
          lockEl.textContent = '🔒';
          thumb.appendChild(lockEl);
        } else if (isDone) {
          const badge = document.createElement('span');
          badge.className = 'puzzle-pic-status-badge done';
          badge.textContent = '✅ Done';
          btn.appendChild(badge);
        } else if (isNextUp) {
          const badge = document.createElement('span');
          badge.className = 'puzzle-pic-status-badge next-up';
          badge.textContent = '⭐ Next';
          btn.appendChild(badge);
        }

        const label = document.createElement('span');
        label.className = 'puzzle-pic-card-title';
        label.textContent = `${pic.emoji} ${pic.title}`;

        btn.appendChild(thumb);
        btn.appendChild(label);

        btn.addEventListener('click', () => {
          if (!unlocked) {
            AudioEngine.wrong();
            btn.classList.remove('shake-lock');
            void btn.offsetWidth;
            btn.classList.add('shake-lock');
            const msg = prevPic
              ? `🔒 Finish ${prevPic.emoji} ${prevPic.title} first to unlock ${pic.title}!`
              : `🔒 Complete the puzzle before this to unlock!`;
            const toast = $('puzzle-lock-toast');
            if (toast) toast.textContent = msg;
            AudioEngine.speak(prevPic ? `Finish ${prevPic.title} first!` : 'Finish the previous puzzle first!', 'gentle');
            return;
          }
          AudioEngine.pop();
          this.selectPicture(pic.id);
        });

        grid.appendChild(btn);
      });

      // Always-available "Upload My Photo" card
      const uploadCard = document.createElement('button');
      uploadCard.type = 'button';
      uploadCard.className = 'puzzle-pic-card puzzle-upload-card';
      uploadCard.innerHTML = `
        <div class="puzzle-pic-card-thumb" aria-hidden="true">📷</div>
        <span class="puzzle-pic-card-title">My Photo</span>
      `;
      uploadCard.addEventListener('click', () => {
        AudioEngine.pop();
        $('puzzle-upload-input').click();
      });
      grid.appendChild(uploadCard);
    }

    async newRound(animateScatter = false) {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.hintTimer) {
        clearTimeout(this.hintTimer);
        this.hintTimer = null;
      }

      this.solved = false;
      this.moves = 0;
      this.elapsedSec = 0;
      this.selectedPos = null;
      this.selectedTrayPiece = null;
      this.hintPositions = [];
      this.hintTrayPiece = null;
      this.peeking = false;
      $('btn-puzzle-peek').classList.remove('active');
      $('puzzle-peek-overlay').classList.add('hidden');
      $('puzzle-win-banner').classList.add('hidden');
      const factEl = $('puzzle-fact-box');
      if (factEl) factEl.classList.add('hidden');
      $('puzzle-board').classList.remove('solved-board');

      const token = ++this.loadToken;
      const pic = this._getActivePicture();
      const diff = DIFFICULTIES[this.difficulty] || DIFFICULTIES.easy;

      try {
        const canvas = await renderPictureToCanvas(pic);
        if (token !== this.loadToken) return;

        this.fullImageUrl = pic.thumbUrl || canvas.toDataURL('image/jpeg', 0.9);
        $('puzzle-preview-img').src = this.fullImageUrl;
        $('puzzle-peek-img').src = this.fullImageUrl;
        $('puzzle-board-ghost').src = this.fullImageUrl;
        const mobileGoalImg = $('puzzle-mobile-goal-img');
        if (mobileGoalImg) mobileGoalImg.src = this.fullImageUrl;

        const total = diff.size * diff.size;
        if (this.mode === 'jigsaw') {
          this.jigsawData = sliceCanvasToJigsawPieces(canvas, diff.size);
          this.tileUrls = this.jigsawData.pieceUrls;
          this.board = Array(total).fill(null);
          this.trayPieces = shuffleArray(Array.from({ length: total }, (_, i) => i));
        } else {
          this.jigsawData = null;
          this.tileUrls = sliceCanvasToTiles(canvas, diff.size);
          this.trayPieces = [];
          this.board = this.mode === 'slide'
            ? createSolvableSlideBoard(diff.size)
            : createDerangedBoard(total);
        }

        this._updateStats();
        this._setStatus(
          this.mode === 'jigsaw'
            ? `Drag or tap a piece into its matching spot!`
            : this.mode === 'swap'
              ? `Drag or tap two pieces to swap!`
              : `Tap a tile next to the empty space to slide!`
        );
        this._renderAll(animateScatter);
        this._startTimer();
      } catch (_) {
        if (token !== this.loadToken) return;
        this._setStatus('Oops! Could not load that picture — switching to Space Rocket!');
        this.activePictureId = 'rocket';
        this.newRound();
      }
    }

    _startTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        if (this.solved) return;
        this.elapsedSec += 1;
      }, 1000);
    }

    _formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    _updateStats() {
      const diff = DIFFICULTIES[this.difficulty];
      const total = diff.size * diff.size;
      const correctCount = this.board.reduce((acc, val, idx) => acc + (val === idx ? 1 : 0), 0);
      const placedEl = $('puzzle-placed');
      if (placedEl) placedEl.textContent = `${correctCount}/${total}`;
    }

    _setStatus(msg) {
      const el = $('puzzle-status');
      if (el) el.textContent = msg;
    }

    _isSwapLocked(pos) {
      return this.mode === 'swap' && this.board[pos] === pos;
    }

    _canSlidePos(pos) {
      const size = DIFFICULTIES[this.difficulty].size;
      const emptyVal = size * size - 1;
      const emptyPos = this.board.indexOf(emptyVal);
      if (pos === emptyPos) return false;
      const r1 = Math.floor(pos / size);
      const c1 = pos % size;
      const r2 = Math.floor(emptyPos / size);
      const c2 = emptyPos % size;
      return r1 === r2 || c1 === c2;
    }

    _renderAll(animateScatter = false) {
      const isJigsaw = this.mode === 'jigsaw';
      $('puzzle-board').classList.toggle('jigsaw-mode', isJigsaw);
      $('puzzle-board-ghost').classList.toggle('hidden', !isJigsaw || this.solved);
      $('puzzle-tray-wrap').classList.toggle('hidden', !isJigsaw);

      this._renderBoard();
      if (isJigsaw) {
        this._renderJigsawTray(animateScatter);
      }
    }

    _renderBoard() {
      const grid = $('puzzle-board');
      if (!grid) return;
      const size = DIFFICULTIES[this.difficulty].size;
      grid.style.setProperty('--puzzle-cols', String(size));
      grid.innerHTML = '';

      if (this.mode === 'jigsaw') {
        this._renderJigsawBoard(grid);
        return;
      }

      const emptyVal = size * size - 1;

      this.board.forEach((pieceId, pos) => {
        const isEmpty = this.mode === 'slide' && pieceId === emptyVal && !this.solved;
        const isCorrect = pieceId === pos;
        const isLocked = this.mode === 'swap' && isCorrect && !this.solved;
        const isSelected = this.selectedPos === pos;
        const isHint = this.hintPositions.includes(pos);

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.dataset.pos = String(pos);
        cell.className = 'puzzle-tile';
        if (isEmpty) cell.classList.add('empty');
        if (isLocked) cell.classList.add('locked');
        if (isSelected) cell.classList.add('selected');
        if (isHint) cell.classList.add('hint-glow');
        if (this.solved) cell.classList.add('solved');

        if (isEmpty) {
          cell.setAttribute('aria-label', 'Empty puzzle space');
          cell.innerHTML = '<span class="puzzle-empty-dot">✨</span>';
        } else {
          cell.setAttribute('aria-label', `Puzzle piece ${pieceId + 1}`);
          const img = document.createElement('img');
          img.src = this.tileUrls[pieceId];
          img.alt = '';
          img.draggable = false;
          cell.appendChild(img);

          if (this.showNumbers && !this.solved) {
            const num = document.createElement('span');
            num.className = 'puzzle-num-badge';
            num.textContent = String(pieceId + 1);
            cell.appendChild(num);
          }

          if (isLocked) {
            const ok = document.createElement('span');
            ok.className = 'puzzle-lock-badge';
            ok.textContent = '✓';
            cell.appendChild(ok);
          }

          this._attachTilePointer(cell, pos);
        }

        grid.appendChild(cell);
      });
    }

    _renderJigsawBoard(grid) {
      const { overhangPct, sizePct } = this.jigsawData || { overhangPct: 24, sizePct: 148 };

      this.board.forEach((pieceId, pos) => {
        const isPlaced = pieceId !== null;
        const isHint = this.hintPositions.includes(pos);

        const slot = document.createElement('button');
        slot.type = 'button';
        slot.dataset.pos = String(pos);
        slot.className = 'puzzle-jigsaw-slot';
        if (isPlaced) slot.classList.add('placed');
        if (isHint) slot.classList.add('hint-glow');
        if (this.solved) slot.classList.add('solved');

        if (isPlaced) {
          slot.setAttribute('aria-label', `Placed puzzle piece ${pieceId + 1}`);
          const img = document.createElement('img');
          img.className = 'puzzle-jigsaw-placed-img';
          img.src = this.tileUrls[pieceId];
          img.alt = '';
          img.draggable = false;
          img.style.width = `${sizePct}%`;
          img.style.height = `${sizePct}%`;
          img.style.left = `-${overhangPct}%`;
          img.style.top = `-${overhangPct}%`;
          slot.appendChild(img);
        } else {
          slot.setAttribute('aria-label', `Empty puzzle spot ${pos + 1}`);
          if (this.showNumbers) {
            const num = document.createElement('span');
            num.className = 'puzzle-slot-num';
            num.textContent = String(pos + 1);
            slot.appendChild(num);
          }
          slot.addEventListener('click', () => {
            if (this.selectedTrayPiece !== null) {
              this._placeJigsawPiece(this.selectedTrayPiece, pos);
            }
          });
        }

        grid.appendChild(slot);
      });
    }

    _renderJigsawTray(animateScatter = false) {
      const tray = $('puzzle-tray');
      if (!tray) return;
      tray.innerHTML = '';

      if (this.trayPieces.length === 0) {
        tray.innerHTML = '<div class="puzzle-tray-done">🎉 All jigsaw pieces placed!</div>';
        return;
      }

      this.trayPieces.forEach((pieceId, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'puzzle-jigsaw-piece-btn';
        if (animateScatter) {
          btn.classList.add('scatter-in');
          btn.style.animationDelay = `${Math.min(idx * 22, 260)}ms`;
        }
        if (this.selectedTrayPiece === pieceId) btn.classList.add('selected');
        if (this.hintTrayPiece === pieceId) btn.classList.add('hint-glow');
        btn.dataset.pieceId = String(pieceId);
        btn.setAttribute('aria-label', `Jigsaw piece ${pieceId + 1}`);

        const img = document.createElement('img');
        img.src = this.tileUrls[pieceId];
        img.alt = '';
        img.draggable = false;
        btn.appendChild(img);

        if (this.showNumbers) {
          const num = document.createElement('span');
          num.className = 'puzzle-num-badge';
          num.textContent = String(pieceId + 1);
          btn.appendChild(num);
        }

        this._attachJigsawTrayPointer(btn, pieceId);
        tray.appendChild(btn);
      });
    }

    _attachJigsawTrayPointer(btn, pieceId) {
      if (this.solved) return;

      btn.addEventListener('pointerdown', (e) => {
        if (this.solved) return;
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        let dragging = false;
        let ghost = null;
        let hoverSlot = null;

        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (!dragging && Math.hypot(dx, dy) > 8) {
            dragging = true;
            this.selectedTrayPiece = null;
            btn.classList.add('dragging-src');

            const sampleSlot = $('puzzle-board').querySelector('.puzzle-jigsaw-slot');
            const slotSize = sampleSlot ? sampleSlot.getBoundingClientRect().width : 90;
            const factor = this.jigsawData ? this.jigsawData.sizePct / 100 : 1.48;
            const ghostSize = Math.round(slotSize * factor);

            ghost = document.createElement('div');
            ghost.className = 'puzzle-jigsaw-ghost';
            ghost.style.width = `${ghostSize}px`;
            ghost.style.height = `${ghostSize}px`;
            const img = document.createElement('img');
            img.src = this.tileUrls[pieceId];
            img.alt = '';
            ghost.appendChild(img);
            document.body.appendChild(ghost);
          }

          if (dragging && ghost) {
            ghost.style.left = `${ev.clientX - ghost.offsetWidth / 2}px`;
            ghost.style.top = `${ev.clientY - ghost.offsetHeight / 2}px`;

            ghost.style.visibility = 'hidden';
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            ghost.style.visibility = '';

            const slotEl = el && el.closest ? el.closest('.puzzle-jigsaw-slot[data-pos]') : null;
            const pos = slotEl ? Number(slotEl.dataset.pos) : null;
            document.querySelectorAll('.puzzle-jigsaw-slot.drag-over').forEach((n) => n.classList.remove('drag-over'));

            if (pos !== null && this.board[pos] === null) {
              slotEl.classList.add('drag-over');
              hoverSlot = pos;
            } else {
              hoverSlot = null;
            }
          }
        };

        const cleanup = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          btn.classList.remove('dragging-src');
          document.querySelectorAll('.puzzle-jigsaw-slot.drag-over').forEach((n) => n.classList.remove('drag-over'));
          if (ghost) ghost.remove();
        };

        const onUp = () => {
          cleanup();
          if (dragging) {
            if (hoverSlot !== null) {
              this._placeJigsawPiece(pieceId, hoverSlot);
            } else {
              this._renderAll();
            }
          } else {
            this.selectedTrayPiece = this.selectedTrayPiece === pieceId ? null : pieceId;
            AudioEngine.pop();
            this._renderJigsawTray();
          }
        };

        const onCancel = () => {
          cleanup();
          this._renderAll();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
      });
    }

    _placeJigsawPiece(pieceId, pos) {
      if (this.solved || this.board[pos] !== null) return;
      this.moves += 1;
      this.hintPositions = [];
      this.hintTrayPiece = null;

      if (pieceId === pos) {
        this.board[pos] = pieceId;
        this.trayPieces = this.trayPieces.filter((id) => id !== pieceId);
        this.selectedTrayPiece = null;
        AudioEngine.correct();
        this._setStatus('Nice snap! Keep going! 🧩');
        this._checkCompletionOrRender();
        return;
      }

      AudioEngine.wrong();
      this._setStatus('Almost! Look closely at the puzzle tabs and picture colors!');
      this._updateStats();
      const slotEl = $('puzzle-board').querySelector(`.puzzle-jigsaw-slot[data-pos="${pos}"]`);
      if (slotEl) {
        slotEl.classList.add('slot-shake');
        setTimeout(() => slotEl.classList.remove('slot-shake'), 360);
      }
    }

    _attachTilePointer(cell, pos) {
      if (this.solved) return;
      if (this.mode === 'swap' && this._isSwapLocked(pos)) return;

      cell.addEventListener('pointerdown', (e) => {
        if (this.solved) return;
        if (this.mode === 'slide') {
          this._handleSlideTap(pos);
          return;
        }
        if (this._isSwapLocked(pos)) return;

        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        let dragging = false;
        let ghost = null;
        let hoverPos = null;

        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (!dragging && Math.hypot(dx, dy) > 8) {
            dragging = true;
            this.selectedPos = null;
            cell.classList.add('dragging-src');

            const rect = cell.getBoundingClientRect();
            ghost = document.createElement('div');
            ghost.className = 'puzzle-tile-ghost';
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;
            const img = document.createElement('img');
            img.src = this.tileUrls[this.board[pos]];
            img.alt = '';
            ghost.appendChild(img);
            document.body.appendChild(ghost);
          }

          if (dragging && ghost) {
            ghost.style.left = `${ev.clientX - ghost.offsetWidth / 2}px`;
            ghost.style.top = `${ev.clientY - ghost.offsetHeight / 2}px`;

            ghost.style.visibility = 'hidden';
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            ghost.style.visibility = '';

            const targetCell = el && el.closest ? el.closest('.puzzle-tile[data-pos]') : null;
            const nextHover = targetCell ? Number(targetCell.dataset.pos) : null;
            document.querySelectorAll('.puzzle-tile.drag-over').forEach((n) => n.classList.remove('drag-over'));
            if (
              nextHover !== null &&
              nextHover !== pos &&
              !this._isSwapLocked(nextHover)
            ) {
              targetCell.classList.add('drag-over');
              hoverPos = nextHover;
            } else {
              hoverPos = null;
            }
          }
        };

        const cleanup = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          cell.classList.remove('dragging-src');
          document.querySelectorAll('.puzzle-tile.drag-over').forEach((n) => n.classList.remove('drag-over'));
          if (ghost) ghost.remove();
        };

        const onUp = () => {
          cleanup();
          if (dragging) {
            if (hoverPos !== null && hoverPos !== pos && !this._isSwapLocked(hoverPos)) {
              this._swapPositions(pos, hoverPos);
            } else {
              this._renderBoard();
            }
          } else {
            this._handleSwapTap(pos);
          }
        };

        const onCancel = () => {
          cleanup();
          this._renderBoard();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
      });
    }

    _handleSwapTap(pos) {
      if (this._isSwapLocked(pos)) return;
      if (this.selectedPos === null) {
        this.selectedPos = pos;
        AudioEngine.pop();
        this._renderBoard();
        return;
      }
      if (this.selectedPos === pos) {
        this.selectedPos = null;
        AudioEngine.pop();
        this._renderBoard();
        return;
      }
      const fromPos = this.selectedPos;
      this.selectedPos = null;
      this._swapPositions(fromPos, pos);
    }

    _swapPositions(posA, posB) {
      if (this.solved) return;
      if (this._isSwapLocked(posA) || this._isSwapLocked(posB)) return;

      [this.board[posA], this.board[posB]] = [this.board[posB], this.board[posA]];
      this.moves += 1;
      this.hintPositions = [];

      const lockedNow = (this.board[posA] === posA) || (this.board[posB] === posB);
      if (lockedNow) {
        AudioEngine.correct();
      } else {
        AudioEngine.pop();
      }

      this._checkCompletionOrRender();
    }

    _handleSlideTap(pos) {
      if (this.solved || !this._canSlidePos(pos)) {
        if (!this.solved) AudioEngine.wrong();
        return;
      }
      const size = DIFFICULTIES[this.difficulty].size;
      const emptyVal = size * size - 1;
      const emptyPos = this.board.indexOf(emptyVal);

      const r1 = Math.floor(pos / size);
      const c1 = pos % size;
      const r2 = Math.floor(emptyPos / size);
      const c2 = emptyPos % size;

      if (r1 === r2) {
        const step = c1 < c2 ? -1 : 1;
        for (let c = c2; c !== c1; c += step) {
          const toIdx = r2 * size + c;
          const fromIdx = r2 * size + (c + step);
          this.board[toIdx] = this.board[fromIdx];
        }
        this.board[pos] = emptyVal;
      } else if (c1 === c2) {
        const step = r1 < r2 ? -1 : 1;
        for (let r = r2; r !== r1; r += step) {
          const toIdx = r * size + c2;
          const fromIdx = (r + step) * size + c2;
          this.board[toIdx] = this.board[fromIdx];
        }
        this.board[pos] = emptyVal;
      }

      this.moves += 1;
      this.hintPositions = [];
      AudioEngine.pop();
      this._checkCompletionOrRender();
    }

    handleKey(key) {
      if (this.screen !== 'play' || this.solved || this.mode !== 'slide') return;
      const size = DIFFICULTIES[this.difficulty].size;
      const emptyVal = size * size - 1;
      const emptyPos = this.board.indexOf(emptyVal);
      const er = Math.floor(emptyPos / size);
      const ec = emptyPos % size;

      let targetPos = -1;
      if (key === 'ArrowUp' && er < size - 1) targetPos = emptyPos + size;
      else if (key === 'ArrowDown' && er > 0) targetPos = emptyPos - size;
      else if (key === 'ArrowLeft' && ec < size - 1) targetPos = emptyPos + 1;
      else if (key === 'ArrowRight' && ec > 0) targetPos = emptyPos - 1;

      if (targetPos !== -1) {
        this._handleSlideTap(targetPos);
      }
    }

    showHint() {
      if (this.solved) return;
      if (this.hintTimer) {
        clearTimeout(this.hintTimer);
        this.hintTimer = null;
      }

      if (this.mode === 'jigsaw') {
        if (this.trayPieces.length === 0) return;
        const pieceId = this.trayPieces[0];
        this.hintTrayPiece = pieceId;
        this.hintPositions = [pieceId];
        this._setStatus('💡 Hint: Drag the glowing jigsaw piece into the glowing spot!');
      } else if (this.mode === 'swap') {
        const wrongPos = this.board.findIndex((val, idx) => val !== idx);
        if (wrongPos === -1) return;
        const neededFrom = this.board.indexOf(wrongPos);
        this.hintPositions = [wrongPos, neededFrom];
        this._setStatus('💡 Hint: Swap the two glowing pieces!');
      } else {
        const size = DIFFICULTIES[this.difficulty].size;
        const emptyVal = size * size - 1;
        const emptyPos = this.board.indexOf(emptyVal);
        const er = Math.floor(emptyPos / size);
        const ec = emptyPos % size;

        const candidates = [];
        if (er > 0) candidates.push(emptyPos - size);
        if (er < size - 1) candidates.push(emptyPos + size);
        if (ec > 0) candidates.push(emptyPos - 1);
        if (ec < size - 1) candidates.push(emptyPos + 1);

        let bestMove = candidates[0];
        let bestGain = -999;
        for (const cand of candidates) {
          const piece = this.board[cand];
          const hr = Math.floor(piece / size);
          const hc = piece % size;
          const cr = Math.floor(cand / size);
          const cc = cand % size;
          const beforeDist = Math.abs(cr - hr) + Math.abs(cc - hc);
          const afterDist = Math.abs(er - hr) + Math.abs(ec - hc);
          const gain = beforeDist - afterDist;
          if (gain > bestGain) {
            bestGain = gain;
            bestMove = cand;
          }
        }
        this.hintPositions = [bestMove];
        this._setStatus('💡 Hint: Slide the glowing piece into the empty space!');
      }

      AudioEngine.flip();
      this._renderAll();
      this.hintTimer = setTimeout(() => {
        this.hintPositions = [];
        this.hintTrayPiece = null;
        this._renderAll();
      }, 2200);
    }

    _checkCompletionOrRender() {
      const isSolved = this.board.every((val, idx) => val === idx);
      if (!isSolved) {
        this._updateStats();
        this._renderAll();
        return;
      }

      this.solved = true;
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.selectedPos = null;
      this.selectedTrayPiece = null;
      this.hintPositions = [];
      this.hintTrayPiece = null;

      const diff = DIFFICULTIES[this.difficulty];
      const bestKey = `${this.difficulty}_${this.mode}`;
      const prevBest = this.bestRecords[bestKey];
      const isNewBest = !prevBest || this.moves < prevBest.moves;
      if (isNewBest) {
        this.bestRecords[bestKey] = { moves: this.moves, time: this.elapsedSec };
        this._saveBest();
      }

      this._updateStats();
      this._renderAll();
      $('puzzle-board').classList.add('solved-board');

      const profile = this.profileStore.profile;
      profile.stars += diff.stars;
      profile.solved += 1;
      const treasure = this.profileStore.awardTreasure(null, false);
      this.profileStore.save(profile);
      this.refreshHeader();

      AudioEngine.fanfare();
      launchConfetti(48);
      spawnFloatingPop($('puzzle-board'), `+${diff.stars} ⭐ & ${treasure.emoji}`);

      const pic = this._getActivePicture();
      const newlyUnlocked = this._markPictureCompleted(pic.id);
      this._renderCategoryTabs();
      this._renderPictureGallery();

      const catPics = pic.category ? this._getCategoryPictures(pic.category) : [];
      const idx = catPics.findIndex((p) => p.id === pic.id);
      const nextInCat = idx >= 0 && idx + 1 < catPics.length ? catPics[idx + 1] : null;
      let nextPic = nextInCat;
      if (!nextPic) {
        const catIdx = PUZZLE_CATEGORIES.findIndex((c) => c.id === this.activeCategory);
        const nextCat = PUZZLE_CATEGORIES[(catIdx + 1) % PUZZLE_CATEGORIES.length];
        const nextCatPics = this._getCategoryPictures(nextCat.id);
        nextPic = nextCatPics[0] || null;
      }

      const winMsg = `🎉 Awesome! You solved ${pic.emoji} ${pic.title}! +${diff.stars} ⭐ + ${treasure.emoji} ${treasure.name}!`;
      this._setStatus(winMsg);
      $('puzzle-win-text').textContent = winMsg;

      const unlockPill = $('puzzle-unlock-pill');
      if (unlockPill) {
        if (newlyUnlocked) {
          unlockPill.textContent = `🔓 Unlocked: ${newlyUnlocked.emoji} ${newlyUnlocked.title}!`;
          unlockPill.classList.remove('hidden');
        } else {
          unlockPill.classList.add('hidden');
        }
      }

      const factEl = $('puzzle-fact-box');
      if (factEl) {
        if (pic.fact) {
          factEl.textContent = `💡 Did you know? ${pic.fact}`;
          factEl.classList.remove('hidden');
        } else {
          factEl.classList.add('hidden');
        }
      }

      const nextBtn = $('btn-puzzle-next-pic');
      if (nextBtn) {
        if (nextPic) {
          nextBtn.textContent = `➡ Play ${nextPic.emoji} ${nextPic.title}`;
          nextBtn.classList.remove('hidden');
        } else {
          nextBtn.classList.add('hidden');
        }
      }

      $('puzzle-win-banner').classList.remove('hidden');

      AudioEngine.speak(
        newlyUnlocked
          ? `Awesome job! You finished ${pic.title} and unlocked ${newlyUnlocked.title}!`
          : `Awesome job! You solved the ${pic.title} puzzle! ${pic.fact || ''}`,
        'cheer'
      );
    }
  }

  app.PicturePuzzleGame = PicturePuzzleGame;
})(window.KidApp = window.KidApp || {});
