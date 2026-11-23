/* Shared Bonus Treasure Materials & Vector Canvas Renderer */

(function (app) {
  'use strict';

const TREASURE_ITEMS = [
  {
    id: 'stone',
    name: 'Magic Stone',
    short: 'Stone',
    emoji: '🪨',
    pts: 10,
    stars: 1,
    weight: 30,
    color: '#94a3b8',
    glow: '#cbd5e1',
    shardColors: ['#cbd5e1', '#64748b', '#38bdf8']
  },
  {
    id: 'bronze',
    name: 'Bronze Coin',
    short: 'Bronze',
    emoji: '🥉',
    pts: 15,
    stars: 1,
    weight: 28,
    color: '#d97706',
    glow: '#fb923c',
    shardColors: ['#fdba74', '#d97706', '#92400e']
  },
  {
    id: 'gold',
    name: 'Gold Coin',
    short: 'Gold',
    emoji: '🪙',
    pts: 25,
    stars: 2,
    weight: 22,
    color: '#fbbf24',
    glow: '#fde047',
    shardColors: ['#fef08a', '#f59e0b', '#fbbf24']
  },
  {
    id: 'jewel',
    name: 'Ruby Jewel',
    short: 'Jewel',
    emoji: '♦️',
    pts: 35,
    stars: 2,
    weight: 12,
    color: '#ec4899',
    glow: '#f472b6',
    shardColors: ['#fbcfe8', '#ec4899', '#be185d']
  },
  {
    id: 'diamond',
    name: 'Diamond',
    short: 'Diamond',
    emoji: '💎',
    pts: 50,
    stars: 3,
    weight: 8,
    color: '#38bdf8',
    glow: '#bae6fd',
    shardColors: ['#ffffff', '#bae6fd', '#38bdf8']
  }
];

const TREASURE_BY_ID = Object.fromEntries(TREASURE_ITEMS.map((item) => [item.id, item]));

function pickRandomTreasure(poolIds = null) {
  const pool = poolIds ? TREASURE_ITEMS.filter((it) => poolIds.includes(it.id)) : TREASURE_ITEMS;
  const total = pool.reduce((sum, it) => sum + it.weight, 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[0];
}

function drawTreasureCanvasItem(ctx, id, r, tick = 0) {
  const item = TREASURE_BY_ID[id] || TREASURE_ITEMS[0];
  ctx.save();
  ctx.shadowColor = item.glow;
  ctx.shadowBlur = Math.max(8, r * 0.45);

  if (item.id === 'stone') {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, '#cbd5e1');
    grad.addColorStop(0.55, '#64748b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, r * 0.25);
    ctx.lineTo(-r * 0.65, -r * 0.68);
    ctx.lineTo(r * 0.15, -r * 0.92);
    ctx.lineTo(r * 0.88, -r * 0.32);
    ctx.lineTo(r * 0.72, r * 0.72);
    ctx.lineTo(-r * 0.25, r * 0.88);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.25);
    ctx.lineTo(r * 0.05, r * 0.05);
    ctx.lineTo(r * 0.35, -r * 0.32);
    ctx.moveTo(r * 0.05, r * 0.05);
    ctx.lineTo(r * 0.15, r * 0.48);
    ctx.stroke();
  } else if (item.id === 'bronze' || item.id === 'gold') {
    const isGold = item.id === 'gold';
    const spinScale = 0.78 + 0.22 * Math.abs(Math.cos(tick * 0.08));
    ctx.scale(spinScale, 1);

    const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.1, 0, 0, r);
    if (isGold) {
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.45, '#fbbf24');
      grad.addColorStop(1, '#b45309');
    } else {
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(0.45, '#d97706');
      grad.addColorStop(1, '#78350f');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = Math.max(2, r * 0.1);
    ctx.strokeStyle = isGold ? '#fef08a' : '#fdba74';
    ctx.stroke();

    ctx.lineWidth = Math.max(1.2, r * 0.06);
    ctx.strokeStyle = isGold ? 'rgba(146, 64, 14, 0.55)' : 'rgba(69, 26, 3, 0.55)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isGold ? '#fef08a' : '#ffedd5';
    ctx.font = `900 ${Math.max(10, Math.round(r * 0.72))}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isGold ? '★' : '¢', 0, r * 0.04);
  } else if (item.id === 'jewel') {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, '#fbcfe8');
    grad.addColorStop(0.45, '#ec4899');
    grad.addColorStop(1, '#831843');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.78, -r * 0.42);
    ctx.lineTo(r * 0.78, r * 0.42);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.78, r * 0.42);
    ctx.lineTo(-r * 0.78, -r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = Math.max(1.8, r * 0.08);
    ctx.strokeStyle = '#fdf2f8';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.52);
    ctx.lineTo(r * 0.4, -r * 0.22);
    ctx.lineTo(r * 0.4, r * 0.22);
    ctx.lineTo(0, r * 0.52);
    ctx.lineTo(-r * 0.4, r * 0.22);
    ctx.lineTo(-r * 0.4, -r * 0.22);
    ctx.closePath();
    ctx.fill();
  } else {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#7dd3fc');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.72);
    ctx.lineTo(r * 0.55, -r * 0.72);
    ctx.lineTo(r * 0.96, -r * 0.14);
    ctx.lineTo(0, r * 0.95);
    ctx.lineTo(-r * 0.96, -r * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1.2, r * 0.05);
    ctx.beginPath();
    ctx.moveTo(-r * 0.96, -r * 0.14);
    ctx.lineTo(r * 0.96, -r * 0.14);
    ctx.moveTo(-r * 0.55, -r * 0.72);
    ctx.lineTo(-r * 0.32, -r * 0.14);
    ctx.lineTo(0, r * 0.95);
    ctx.moveTo(r * 0.55, -r * 0.72);
    ctx.lineTo(r * 0.32, -r * 0.14);
    ctx.lineTo(0, r * 0.95);
    ctx.stroke();

    if (Math.sin(tick * 0.15) > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.45, -r * 0.45, Math.max(2, r * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

  app.TREASURE_ITEMS = TREASURE_ITEMS;
  app.TREASURE_BY_ID = TREASURE_BY_ID;
  app.pickRandomTreasure = pickRandomTreasure;
  app.drawTreasureCanvasItem = drawTreasureCanvasItem;
})(window.KidApp = window.KidApp || {});
