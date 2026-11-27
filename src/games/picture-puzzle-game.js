/* Picture Puzzle Game — Built-in Pictures, Custom Photo Upload, Difficulty Levels & Swap/Slide Modes */

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

    // Stars
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

    // Earth bottom-left
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

    // Smiling Moon top-left
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

    // Ringed Planet top-right
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

    // Rainbow Rocket in center
    ctx.save();
    ctx.translate(s * 0.52, s * 0.52);
    ctx.rotate(-0.42);

    // Flame
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

    // Fins
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

    // Body
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

    // Nose cone
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.quadraticCurveTo(36, -90, 40, -68);
    ctx.lineTo(-40, -68);
    ctx.quadraticCurveTo(-36, -90, 0, -145);
    ctx.fill();

    // Window
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, -12, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute shine in window
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

    // Rainbow
    const rColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    rColors.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.72, s * 0.44 - i * 14, Math.PI, 0);
      ctx.stroke();
    });

    // Sun
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(s * 0.14, s * 0.15, s * 0.085, 0, Math.PI * 2);
    ctx.fill();

    // Distant friendly volcano
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

    // Hills
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(s * 0.25, s * 0.82, s * 0.45, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(s * 0.75, s * 0.85, s * 0.5, s * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, s * 0.78, s, s * 0.22);

    // Palm tree left
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

    // Cute green Dinosaur
    ctx.save();
    // Tail & body
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(s * 0.48, s * 0.68, s * 0.17, s * 0.12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.34, s * 0.68);
    ctx.quadraticCurveTo(s * 0.18, s * 0.72, s * 0.16, s * 0.6);
    ctx.quadraticCurveTo(s * 0.24, s * 0.76, s * 0.38, s * 0.75);
    ctx.fill();

    // Neck & head
    ctx.lineWidth = 54;
    ctx.strokeStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(s * 0.58, s * 0.64);
    ctx.quadraticCurveTo(s * 0.65, s * 0.45, s * 0.62, s * 0.36);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(s * 0.66, s * 0.34, 62, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly & spots
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

    // Legs
    ctx.fillStyle = '#15803d';
    ctx.fillRect(s * 0.38, s * 0.76, 36, 56);
    ctx.fillRect(s * 0.53, s * 0.76, 36, 56);

    // Eye & smile
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

    // Sunbeams
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

    // Sandy floor
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.82);
    ctx.quadraticCurveTo(s * 0.35, s * 0.76, s * 0.65, s * 0.83);
    ctx.quadraticCurveTo(s * 0.85, s * 0.86, s, s * 0.8);
    ctx.lineTo(s, s);
    ctx.lineTo(0, s);
    ctx.closePath();
    ctx.fill();

    // Seaweed & coral
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    [0.1, 0.16, 0.86, 0.92].forEach((rx, idx) => {
      ctx.beginPath();
      ctx.moveTo(s * rx, s * 0.86);
      ctx.quadraticCurveTo(s * (rx + (idx % 2 ? 0.04 : -0.04)), s * 0.7, s * rx, s * 0.56);
      ctx.stroke();
    });

    // Coral pink
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(s * 0.26, s * 0.82, 34, Math.PI, 0);
    ctx.arc(s * 0.32, s * 0.8, 26, Math.PI, 0);
    ctx.fill();

    // Treasure chest bottom right
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

    // Friendly Blue Whale center
    ctx.save();
    ctx.translate(s * 0.44, s * 0.42);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 145, 92, -0.06, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-130, 10);
    ctx.lineTo(-205, -45);
    ctx.lineTo(-185, 10);
    ctx.lineTo(-205, 65);
    ctx.closePath();
    ctx.fill();
    // Belly
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(15, 36, 102, 42, 0, 0, Math.PI);
    ctx.fill();
    // Eye & smile
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

    // Orange clownfish
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

    // Bubbles
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

    // Rainbow
    ['#ef4444', '#f97316', '#facc15', '#4ade80', '#38bdf8', '#a855f7'].forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.68, s * 0.45 - i * 14, Math.PI, 0);
      ctx.stroke();
    });

    // Sun
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(s * 0.84, s * 0.16, s * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Green hills
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.92, s * 0.7, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Castle main walls
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(s * 0.26, s * 0.44, s * 0.48, s * 0.34);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(s * 0.2, s * 0.38, s * 0.1, s * 0.4);
    ctx.fillRect(s * 0.7, s * 0.38, s * 0.1, s * 0.4);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(s * 0.43, s * 0.28, s * 0.14, s * 0.5);

    // Turret roofs
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

    // Arched door
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.68, s * 0.065, Math.PI, 0);
    ctx.lineTo(s * 0.565, s * 0.78);
    ctx.lineTo(s * 0.435, s * 0.78);
    ctx.closePath();
    ctx.fill();

    // Flowers in grass
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

  const DEFAULT_PICTURES = [
    { id: 'rocket', title: 'Space Rocket', emoji: '🚀', draw: drawSpaceAdventure },
    { id: 'dino', title: 'Dino Meadow', emoji: '🦕', draw: drawDinoMeadow },
    { id: 'ocean', title: 'Ocean Reef', emoji: '🐠', draw: drawOceanReef },
    { id: 'castle', title: 'Rainbow Castle', emoji: '🏰', draw: drawRainbowCastle },
    { id: 'ganesha', title: 'Little Ganesha', emoji: '🪷', src: './ganeshsa.jpeg' },
    { id: 'mountain', title: 'Mount Kailash', emoji: '🏔️', src: './mountain.jpeg' }
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

  function createDerangedBoard(total) {
    const arr = Array.from({ length: total }, (_, i) => i);
    for (let attempt = 0; attempt < 15; attempt++) {
      for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      if (arr.every((val, idx) => val !== idx)) return arr;
    }
    // Fallback explicit derangement fix
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

    // Ensure it is not accidentally solved
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
      this.activePictureId = 'rocket';
      this.difficulty = 'easy';
      this.mode = 'swap'; // 'swap' | 'slide'
      this.showNumbers = false;
      this.peeking = false;

      this.board = [];
      this.tileUrls = [];
      this.fullImageUrl = '';
      this.moves = 0;
      this.elapsedSec = 0;
      this.timerId = null;
      this.selectedPos = null;
      this.hintPositions = [];
      this.hintTimer = null;
      this.solved = false;
      this.loadToken = 0;

      this.bestRecords = this._loadBest();
      this._bindEvents();
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

    _getActivePicture() {
      if (this.activePictureId === 'custom' && this.customPicture) {
        return this.customPicture;
      }
      return this.pictures.find((p) => p.id === this.activePictureId) || this.pictures[0];
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

      $('btn-puzzle-shuffle').addEventListener('click', () => {
        AudioEngine.pop();
        this.newRound();
      });

      $('btn-puzzle-numbers').addEventListener('click', () => {
        this.showNumbers = !this.showNumbers;
        $('btn-puzzle-numbers').classList.toggle('active', this.showNumbers);
        $('btn-puzzle-numbers').textContent = this.showNumbers ? '🔢 Numbers: On' : '🔢 Numbers: Off';
        AudioEngine.pop();
        this._renderBoard();
      });

      $('btn-puzzle-hint').addEventListener('click', () => this.showHint());

      const peekBtn = $('btn-puzzle-peek');
      peekBtn.addEventListener('click', () => {
        this.peeking = !this.peeking;
        peekBtn.classList.toggle('active', this.peeking);
        $('puzzle-peek-overlay').classList.toggle('hidden', !this.peeking);
        AudioEngine.pop();
      });

      $('btn-puzzle-upload').addEventListener('click', () => {
        AudioEngine.pop();
        $('puzzle-upload-input').click();
      });

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
        this.newRound();
      });

      $('btn-puzzle-next-pic').addEventListener('click', () => {
        AudioEngine.pop();
        this.cycleNextPicture();
      });

      $('btn-puzzle-harder').addEventListener('click', () => {
        AudioEngine.pop();
        const order = ['easy', 'medium', 'hard', 'master'];
        const next = order[Math.min(order.length - 1, order.indexOf(this.difficulty) + 1)];
        this.setDifficulty(next);
      });
    }

    open() {
      this.start();
    }

    start() {
      this._syncToolbarUI();
      this._renderPictureGallery();
      this.newRound();
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
    }

    setDifficulty(diffId) {
      if (!DIFFICULTIES[diffId]) return;
      this.difficulty = diffId;
      this._syncToolbarUI();
      this.newRound();
    }

    setMode(mode) {
      if (mode !== 'swap' && mode !== 'slide') return;
      this.mode = mode;
      this._syncToolbarUI();
      this.newRound();
    }

    selectPicture(picId) {
      this.activePictureId = picId;
      this._renderPictureGallery();
      this.newRound();
    }

    cycleNextPicture() {
      const all = this.customPicture ? [...this.pictures, this.customPicture] : this.pictures;
      const idx = all.findIndex((p) => p.id === this.activePictureId);
      const next = all[(idx + 1) % all.length];
      this.selectPicture(next.id);
    }

    handleUploadFile(file) {
      if (!file.type.startsWith('image/') && !/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || '')) {
        this._setStatus('Please pick an image file (PNG, JPG, WebP, or GIF)! 🖼️');
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
            thumbUrl
          };
          this.activePictureId = 'custom';
          AudioEngine.magic();
          this._renderPictureGallery();
          this.newRound();
        };
        img.onerror = () => {
          this._setStatus('Oops! Could not read that picture. Try another photo!');
          AudioEngine.wrong();
        };
        img.src = String(reader.result);
      };
      reader.onerror = () => {
        this._setStatus('Oops! Could not open that file. Try another photo!');
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
      const strip = $('puzzle-pic-strip');
      if (!strip) return;
      strip.innerHTML = '';

      const all = this.customPicture ? [this.customPicture, ...this.pictures] : this.pictures;
      all.forEach((pic) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `puzzle-pic-chip ${pic.id === this.activePictureId ? 'active' : ''}`;
        btn.dataset.picId = pic.id;

        const thumb = document.createElement('span');
        thumb.className = 'puzzle-pic-thumb';
        if (pic.thumbUrl) {
          const img = document.createElement('img');
          img.src = pic.thumbUrl;
          img.alt = pic.title;
          thumb.appendChild(img);
        } else {
          // Pre-render procedural thumbnails immediately
          if (typeof pic.draw === 'function') {
            renderPictureToCanvas(pic).then(() => {
              const img = document.createElement('img');
              img.src = pic.thumbUrl;
              img.alt = pic.title;
              thumb.innerHTML = '';
              thumb.appendChild(img);
            });
          } else if (pic.src) {
            const img = document.createElement('img');
            img.src = pic.src;
            img.alt = pic.title;
            thumb.appendChild(img);
          } else {
            thumb.textContent = pic.emoji;
          }
        }

        const label = document.createElement('span');
        label.className = 'puzzle-pic-label';
        label.textContent = `${pic.emoji} ${pic.title}`;

        btn.appendChild(thumb);
        btn.appendChild(label);
        btn.addEventListener('click', () => {
          AudioEngine.pop();
          this.selectPicture(pic.id);
        });
        strip.appendChild(btn);
      });
    }

    async newRound() {
      this.stop();
      this.solved = false;
      this.moves = 0;
      this.elapsedSec = 0;
      this.selectedPos = null;
      this.hintPositions = [];
      this.peeking = false;
      $('btn-puzzle-peek').classList.remove('active');
      $('puzzle-peek-overlay').classList.add('hidden');
      $('puzzle-win-banner').classList.add('hidden');
      $('puzzle-board').classList.remove('solved-board');

      const token = ++this.loadToken;
      const pic = this._getActivePicture();
      const diff = DIFFICULTIES[this.difficulty] || DIFFICULTIES.easy;

      try {
        const canvas = await renderPictureToCanvas(pic);
        if (token !== this.loadToken) return;

        this.fullImageUrl = pic.thumbUrl || canvas.toDataURL('image/jpeg', 0.9);
        this.tileUrls = sliceCanvasToTiles(canvas, diff.size);

        $('puzzle-preview-img').src = this.fullImageUrl;
        $('puzzle-peek-img').src = this.fullImageUrl;

        const total = diff.size * diff.size;
        this.board = this.mode === 'slide'
          ? createSolvableSlideBoard(diff.size)
          : createDerangedBoard(total);

        this._updateStats();
        this._setStatus(
          this.mode === 'swap'
            ? `Drag or tap two pieces to swap! (${diff.label})`
            : `Tap or slide tiles next to the empty space! (${diff.label})`
        );
        this._renderBoard();
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
        this._updateTimerLabel();
      }, 1000);
    }

    _formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    _updateTimerLabel() {
      const el = $('puzzle-timer');
      if (el) el.textContent = this._formatTime(this.elapsedSec);
    }

    _updateStats() {
      const diff = DIFFICULTIES[this.difficulty];
      const total = diff.size * diff.size;
      const correctCount = this.board.reduce((acc, val, idx) => acc + (val === idx ? 1 : 0), 0);
      const bestKey = `${this.difficulty}_${this.mode}`;
      const best = this.bestRecords[bestKey];

      $('puzzle-moves').textContent = this.moves;
      $('puzzle-placed').textContent = `${correctCount}/${total}`;
      $('puzzle-best').textContent = best ? `${best.moves} moves` : '—';
      this._updateTimerLabel();
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

    _renderBoard() {
      const grid = $('puzzle-board');
      if (!grid) return;
      const size = DIFFICULTIES[this.difficulty].size;
      const emptyVal = size * size - 1;

      grid.style.setProperty('--puzzle-cols', String(size));
      grid.innerHTML = '';

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

      // Support single or multi-tile line slide toward empty slot
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
      if (this.solved || this.mode !== 'slide') return;
      const size = DIFFICULTIES[this.difficulty].size;
      const emptyVal = size * size - 1;
      const emptyPos = this.board.indexOf(emptyVal);
      const er = Math.floor(emptyPos / size);
      const ec = emptyPos % size;

      let targetPos = -1;
      // Pressing ArrowUp slides the tile BELOW the empty slot up into the empty slot
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

      if (this.mode === 'swap') {
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

        // Prefer moving a tile closer to its home coordinate
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
      this._renderBoard();
      this.hintTimer = setTimeout(() => {
        this.hintPositions = [];
        this._renderBoard();
      }, 2200);
    }

    _checkCompletionOrRender() {
      const isSolved = this.board.every((val, idx) => val === idx);
      if (!isSolved) {
        this._updateStats();
        this._renderBoard();
        return;
      }

      this.solved = true;
      this.stop();
      this.selectedPos = null;
      this.hintPositions = [];

      const diff = DIFFICULTIES[this.difficulty];
      const bestKey = `${this.difficulty}_${this.mode}`;
      const prevBest = this.bestRecords[bestKey];
      const isNewBest = !prevBest || this.moves < prevBest.moves;
      if (isNewBest) {
        this.bestRecords[bestKey] = { moves: this.moves, time: this.elapsedSec };
        this._saveBest();
      }

      this._updateStats();
      this._renderBoard();
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
      const winMsg = `🎉 You solved ${pic.emoji} ${pic.title} in ${this.moves} moves (${this._formatTime(this.elapsedSec)})! +${diff.stars} ⭐ + ${treasure.emoji} ${treasure.name}!${isNewBest ? ' 🏆 New Best!' : ''}`;
      this._setStatus(winMsg);
      $('puzzle-win-text').textContent = winMsg;
      $('puzzle-win-banner').classList.remove('hidden');
      $('btn-puzzle-harder').classList.toggle('hidden', this.difficulty === 'master');

      AudioEngine.speak(`Awesome job! You solved the ${pic.title} puzzle!`, 'cheer');
    }
  }

  app.PicturePuzzleGame = PicturePuzzleGame;
})(window.KidApp = window.KidApp || {});
