/* Pure HTML5 Canvas 3D Engine for MathCube 3D (Zero external dependencies) */

(function (app) {
  'use strict';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function shadeColor(hex, factor, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
  const nb = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `rgba(${nr}, ${ng}, ${nb}, ${alpha})`;
}

function rotatePoint(p, yaw, pitch) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  const y1 = p.y;

  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = y1 * cp - z1 * sp;
  const z2 = y1 * sp + z1 * cp;

  return { x: x1, y: y2, z: z2 };
}

function projectPoint(p, cx, cy, fov, camDist) {
  const depth = camDist + p.z;
  const scale = fov / Math.max(0.5, depth);
  return {
    x: cx + p.x * scale,
    y: cy - p.y * scale,
    z: depth,
    scale
  };
}

const CUBE_VERTS = [
  { x: -0.5, y: -0.5, z: -0.5 },
  { x: 0.5, y: -0.5, z: -0.5 },
  { x: 0.5, y: 0.5, z: -0.5 },
  { x: -0.5, y: 0.5, z: -0.5 },
  { x: -0.5, y: -0.5, z: 0.5 },
  { x: 0.5, y: -0.5, z: 0.5 },
  { x: 0.5, y: 0.5, z: 0.5 },
  { x: -0.5, y: 0.5, z: 0.5 }
];

const CUBE_FACES = [
  { idx: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 }, shade: 0.95 },
  { idx: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 }, shade: 0.78 },
  { idx: [0, 1, 5, 4], normal: { x: 0, y: -1, z: 0 }, shade: 0.65 },
  { idx: [3, 2, 6, 7], normal: { x: 0, y: 1, z: 0 }, shade: 1.12 },
  { idx: [0, 3, 7, 4], normal: { x: -1, y: 0, z: 0 }, shade: 0.85 },
  { idx: [1, 2, 6, 5], normal: { x: 1, y: 0, z: 0 }, shade: 0.9 }
];

const ROW_PALETTE = [
  '#10b981', '#0ea5e9', '#f59e0b', '#ec4899',
  '#8b5cf6', '#f97316', '#14b8a6', '#6366f1',
  '#ef4444', '#84cc16', '#06b6d4', '#d946ef'
];

class Math3DScene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.yaw = options.yaw ?? -0.45;
    this.pitch = options.pitch ?? -0.38;
    this.autoSpin = options.autoSpin ?? false;
    this.mode = options.mode ?? 'hero';
    this.a = 3;
    this.b = 4;
    this.animProgress = 0;
    this.isAnimating = false;
    this.time = 0;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.rafId = null;

    this._bindEvents();
    this.start();
  }

  _bindEvents() {
    const onDown = (x, y) => {
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
    };
    const onMove = (x, y) => {
      if (!this.dragging) return;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      this.yaw += dx * 0.012;
      this.pitch = Math.max(-1.25, Math.min(0.35, this.pitch + dy * 0.01));
    };
    const onUp = () => {
      this.dragging = false;
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      onDown(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      onMove(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('pointerup', onUp);
    this.canvas.addEventListener('pointercancel', onUp);
  }

  setQuestion(op, a, b) {
    this.mode = op;
    this.a = a;
    this.b = b;
    this.animProgress = 0;
    this.isAnimating = false;
    this.yaw = op === 'mul' ? -0.55 : -0.35;
    this.pitch = op === 'mul' ? -0.52 : -0.35;
  }

  triggerAnimation() {
    this.animProgress = 0;
    this.isAnimating = true;
  }

  start() {
    if (this.rafId) return;
    const loop = () => {
      this.time += 0.025;
      if (this.autoSpin && !this.dragging) {
        this.yaw += 0.012;
      }
      if (this.isAnimating) {
        this.animProgress = Math.min(1, this.animProgress + 0.025);
        if (this.animProgress >= 1) {
          this.isAnimating = false;
        }
      }
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _buildCubes() {
    const cubes = [];
    const t = this.animProgress;

    if (this.mode === 'hero') {
      const bob1 = Math.sin(this.time) * 0.14;
      const bob2 = Math.sin(this.time + 1.5) * 0.14;
      const bob3 = Math.sin(this.time + 3.0) * 0.14;
      cubes.push({ x: -1.4, y: bob1, z: 0, s: 1.05, color: '#10b981', alpha: 1 });
      cubes.push({ x: 0, y: 0.35 + bob2, z: 0.3, s: 1.15, color: '#fbbf24', alpha: 1 });
      cubes.push({ x: 1.4, y: bob3, z: -0.2, s: 1.05, color: '#38bdf8', alpha: 1 });
      cubes.push({ x: -0.7, y: -1.05 + bob2 * 0.5, z: 0.5, s: 0.85, color: '#f472b6', alpha: 1 });
      cubes.push({ x: 0.75, y: -1.05 + bob1 * 0.5, z: -0.4, s: 0.85, color: '#a78bfa', alpha: 1 });
      return { cubes, camDist: 7.5 };
    }

    if (this.mode === 'trophy') {
      const bob = Math.sin(this.time * 1.4) * 0.15;
      cubes.push({ x: 0, y: -1.1 + bob, z: 0, s: 1.4, color: '#b45309', alpha: 1 });
      cubes.push({ x: 0, y: -0.2 + bob, z: 0, s: 0.65, color: '#d97706', alpha: 1 });
      cubes.push({ x: 0, y: 0.65 + bob, z: 0, s: 1.1, color: '#fbbf24', alpha: 1 });
      cubes.push({ x: -0.95, y: 0.65 + bob, z: 0, s: 0.65, color: '#fde047', alpha: 1 });
      cubes.push({ x: 0.95, y: 0.65 + bob, z: 0, s: 0.65, color: '#fde047', alpha: 1 });
      cubes.push({ x: 0, y: 1.55 + bob, z: 0, s: 0.65, color: '#fde047', alpha: 1 });
      return { cubes, camDist: 7.2 };
    }

    if (this.mode === 'add') {
      const maxShow = 24;
      const showA = Math.min(this.a, maxShow);
      const showB = Math.min(this.b, maxShow);
      const cols = 4;
      const gap = 1.15;
      const slideOffset = (1 - t) * 1.25;

      for (let i = 0; i < showA; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        cubes.push({
          x: -2.3 - slideOffset * 0.5 + col * 0.88,
          y: row * 0.92 - 0.8,
          z: 0,
          s: 0.78,
          color: '#10b981',
          alpha: 1
        });
      }
      for (let j = 0; j < showB; j++) {
        const col = j % cols;
        const row = Math.floor(j / cols);
        cubes.push({
          x: 0.9 + slideOffset * 0.5 + col * 0.88 - t * 0.6,
          y: row * 0.92 - 0.8,
          z: gap * (1 - t * 0.35) - 0.4,
          s: 0.78,
          color: '#0ea5e9',
          alpha: 1
        });
      }
      const total = showA + showB;
      return { cubes, camDist: total > 20 ? 12.5 : 9.8 };
    }

    if (this.mode === 'sub') {
      const showA = Math.min(this.a, 28);
      const removeCount = Math.min(this.b, showA);
      const cols = 5;

      for (let i = 0; i < showA; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const isRemoved = i >= showA - removeCount;
        const lift = isRemoved ? t * 2.3 : 0;
        const alpha = isRemoved ? Math.max(0.18, 1 - t * 0.82) : 1;
        cubes.push({
          x: (col - (cols - 1) / 2) * 0.92,
          y: row * 0.92 - 0.9 + lift,
          z: isRemoved ? t * 0.8 : 0,
          s: 0.8,
          color: isRemoved ? '#ef4444' : '#f97316',
          alpha
        });
      }
      return { cubes, camDist: showA > 18 ? 11.5 : 9.2 };
    }

    if (this.mode === 'mul') {
      const rows = Math.min(this.a, 12);
      const cols = Math.min(this.b, 12);
      const spacing = 0.96;
      const offsetX = ((cols - 1) * spacing) / 2;
      const offsetZ = ((rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        const rowColor = ROW_PALETTE[r % ROW_PALETTE.length];
        for (let c = 0; c < cols; c++) {
          const popScale = this.isAnimating
            ? Math.min(1, Math.max(0.2, t * rows - r + 0.5))
            : 1;
          cubes.push({
            x: c * spacing - offsetX,
            y: Math.sin(this.time + r * 0.4) * 0.05,
            z: r * spacing - offsetZ,
            s: 0.82 * popScale,
            color: rowColor,
            alpha: 1
          });
        }
      }
      const maxDim = Math.max(rows, cols);
      return { cubes, camDist: 5.5 + maxDim * 1.15 };
    }

    return { cubes, camDist: 8 };
  }

  render() {
    const { canvas, ctx } = this;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const { cubes, camDist } = this._buildCubes();
    const cx = w / 2;
    const cy = h / 2 + 6;
    const fov = Math.min(w, h) * 1.45;

    const facesToDraw = [];

    for (const cube of cubes) {
      const s = cube.s;
      const worldVerts = CUBE_VERTS.map((v) => {
        const local = {
          x: cube.x + v.x * s,
          y: cube.y + v.y * s,
          z: cube.z + v.z * s
        };
        return rotatePoint(local, this.yaw, this.pitch);
      });

      for (const face of CUBE_FACES) {
        const rn = rotatePoint(face.normal, this.yaw, this.pitch);
        if (rn.z > 0.28) continue;

        const pts = face.idx.map((idx) => projectPoint(worldVerts[idx], cx, cy, fov, camDist));
        const avgZ = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;

        facesToDraw.push({
          pts,
          avgZ,
          fill: shadeColor(cube.color, face.shade, cube.alpha),
          stroke: shadeColor(cube.color, 0.52, cube.alpha * 0.55)
        });
      }
    }

    facesToDraw.sort((a, b) => b.avgZ - a.avgZ);

    for (const f of facesToDraw) {
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      ctx.lineTo(f.pts[1].x, f.pts[1].y);
      ctx.lineTo(f.pts[2].x, f.pts[2].y);
      ctx.lineTo(f.pts[3].x, f.pts[3].y);
      ctx.closePath();
      ctx.fillStyle = f.fill;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = f.stroke;
      ctx.stroke();
    }
  }
}

  app.Math3DScene = Math3DScene;
})(window.KidApp = window.KidApp || {});
