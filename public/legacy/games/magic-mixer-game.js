/* Magic Mixer Lab — Interactive Drag & Mix Math Game */

(function (app) {
  'use strict';

  const { AudioEngine, pickRandomTreasure, $, launchConfetti } = app;

const MAGIC_ICONS = {
  bubbles: ['🫧', '🫧', '💧', '✨', '🫧', '🌊'],
  planets: ['🪐', '🌍', '🌕', '☄️', '🌟', '🚀'],
  fruits: ['🍓', '🍎', '🍊', '🍉', '🍇', '🍍']
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class MagicMixerGame {
  constructor({ profileStore, showView, refreshHeader, stopMathTimer }) {
    this.profileStore = profileStore;
    this.showView = showView;
    this.refreshHeader = refreshHeader;
    this.stopMathTimer = stopMathTimer;

    this.state = {
      theme: 'bubbles',
      op: 'add',
      mode: 'challenge',
      items: [],
      slotA: null,
      slotB: null,
      target: 10,
      mixed: false,
      streak: 0
    };

    this._bindEvents();
  }

  _bindEvents() {
    $('magic-slot-a').addEventListener('click', () => {
      if (!this.state.slotA || this.state.mixed) return;
      this.state.slotA.used = false;
      this.state.slotA = null;
      AudioEngine.pop();
      this._renderUI();
    });

    $('magic-slot-b').addEventListener('click', () => {
      if (!this.state.slotB || this.state.mixed) return;
      this.state.slotB.used = false;
      this.state.slotB = null;
      AudioEngine.pop();
      this._renderUI();
    });

    document.querySelectorAll('[data-action="open-magic"]').forEach((el) => {
      el.addEventListener('click', () => this.open());
    });
    $('btn-magic-mix').addEventListener('click', () => this.triggerMix());
    $('btn-magic-clear').addEventListener('click', () => this.clearSlots());
    $('btn-magic-new').addEventListener('click', () => {
      AudioEngine.pop();
      this.generateRound();
    });

    document.querySelectorAll('[data-magic-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.theme = btn.dataset.magicTheme;
        document.querySelectorAll('[data-magic-theme]').forEach((b) => b.classList.toggle('active', b === btn));
        const icons = MAGIC_ICONS[this.state.theme];
        this.state.items.forEach((it, i) => {
          it.icon = icons[i % icons.length];
        });
        AudioEngine.pop();
        this._renderUI();
      });
    });

    document.querySelectorAll('[data-magic-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.op = btn.dataset.magicOp;
        document.querySelectorAll('[data-magic-op]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        this.generateRound();
      });
    });

    document.querySelectorAll('[data-magic-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.mode = btn.dataset.magicMode;
        document.querySelectorAll('[data-magic-mode]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        this.generateRound();
      });
    });
  }

  _getOpSymbol(op) {
    return op === 'add' ? '➕' : op === 'sub' ? '➖' : '✖️';
  }

  _computeResult(op, a, b) {
    if (op === 'add') return a + b;
    if (op === 'sub') return a - b;
    return a * b;
  }

  open() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.generateRound();
    this.showView('magic');
  }

  generateRound() {
    this.state.slotA = null;
    this.state.slotB = null;
    this.state.mixed = false;

    const op = this.state.op;
    let a;
    let b;
    if (op === 'add') {
      a = randInt(2, 10);
      b = randInt(1, 10);
    } else if (op === 'sub') {
      a = randInt(5, 16);
      b = randInt(1, a - 1);
    } else {
      a = randInt(2, 9);
      b = randInt(2, 9);
    }
    this.state.target = this._computeResult(op, a, b);

    const nums = [a, b];
    while (nums.length < 7) {
      nums.push(op === 'mul' ? randInt(1, 10) : randInt(1, 15));
    }
    nums.sort(() => Math.random() - 0.5);
    const icons = MAGIC_ICONS[this.state.theme];
    this.state.items = nums.map((val, idx) => ({
      id: idx,
      val,
      icon: icons[idx % icons.length],
      used: false
    }));

    this._renderUI();
  }

  _renderUI() {
    $('magic-op-symbol').textContent = this._getOpSymbol(this.state.op);
    const banner = $('magic-target-banner');
    if (this.state.mode === 'challenge') {
      banner.classList.remove('hidden');
      $('magic-target-text').innerHTML = `🎯 Drag or tap 2 items to make <strong>${this.state.target}</strong> using <strong>${this._getOpSymbol(this.state.op)}</strong>!`;
    } else {
      banner.classList.add('hidden');
    }

    const tray = $('magic-tray');
    tray.innerHTML = '';
    this.state.items.forEach((item) => {
      const orb = document.createElement('div');
      orb.className = `magic-orb theme-${this.state.theme} ${item.used ? 'used' : ''}`;
      orb.innerHTML = `<span class="orb-icon">${item.icon}</span><span class="orb-num">${item.val}</span>`;
      this._attachOrbDrag(orb, item);
      tray.appendChild(orb);
    });

    const slotAEl = $('magic-slot-a');
    const slotBEl = $('magic-slot-b');
    const resEl = $('magic-result-orb');

    if (this.state.slotA) {
      slotAEl.classList.add('filled');
      slotAEl.innerHTML = `<span class="orb-icon">${this.state.slotA.icon}</span><span>${this.state.slotA.val}</span>`;
    } else {
      slotAEl.classList.remove('filled');
      slotAEl.textContent = '?';
    }

    if (this.state.slotB) {
      slotBEl.classList.add('filled');
      slotBEl.innerHTML = `<span class="orb-icon">${this.state.slotB.icon}</span><span>${this.state.slotB.val}</span>`;
    } else {
      slotBEl.classList.remove('filled');
      slotBEl.textContent = '?';
    }

    if (!this.state.mixed) {
      resEl.classList.remove('revealed');
      resEl.textContent = '✨';
      $('magic-feedback').textContent = '';
      $('magic-visual-parade').innerHTML = '';
    }
    $('magic-streak-pill').textContent = `🪄 Streak: ${this.state.streak}`;
    $('btn-magic-mix').disabled = !(this.state.slotA && this.state.slotB) || this.state.mixed;
  }

  _dropIntoSlot(item) {
    if (item.used || this.state.mixed) return;
    if (!this.state.slotA) {
      this.state.slotA = item;
      item.used = true;
    } else if (!this.state.slotB) {
      this.state.slotB = item;
      item.used = true;
    } else {
      return;
    }
    AudioEngine.pop();
    this._renderUI();
    if (this.state.slotA && this.state.slotB) {
      setTimeout(() => this.triggerMix(), 220);
    }
  }

  _attachOrbDrag(orbEl, item) {
    let startX = 0;
    let startY = 0;
    let ghost = null;
    let moved = false;

    orbEl.addEventListener('pointerdown', (e) => {
      if (item.used || this.state.mixed) return;
      e.preventDefault();
      orbEl.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      moved = false;

      ghost = orbEl.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;
      document.body.appendChild(ghost);
    });

    orbEl.addEventListener('pointermove', (e) => {
      if (!ghost) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) moved = true;
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;

      const portalRect = $('magic-portal').getBoundingClientRect();
      const over =
        e.clientX >= portalRect.left &&
        e.clientX <= portalRect.right &&
        e.clientY >= portalRect.top &&
        e.clientY <= portalRect.bottom;
      $('magic-portal').classList.toggle('drag-over', over);
    });

    const cleanup = (e) => {
      if (!ghost) return;
      const portalRect = $('magic-portal').getBoundingClientRect();
      const over =
        e.clientX >= portalRect.left &&
        e.clientX <= portalRect.right &&
        e.clientY >= portalRect.top &&
        e.clientY <= portalRect.bottom;
      $('magic-portal').classList.remove('drag-over');
      ghost.remove();
      ghost = null;

      if (over || !moved) {
        this._dropIntoSlot(item);
      }
    };

    orbEl.addEventListener('pointerup', cleanup);
    orbEl.addEventListener('pointercancel', cleanup);
  }

  _spawnSparkles() {
    const container = $('magic-sparkles');
    container.innerHTML = '';
    const icons = ['✨', '⭐', '💫', '🌟', '🪄'];
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('span');
      dot.className = 'sparkle-dot';
      dot.textContent = icons[i % icons.length];
      dot.style.left = '50%';
      dot.style.top = '45%';
      const angle = (Math.PI * 2 * i) / 18;
      const dist = 70 + Math.random() * 90;
      dot.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      dot.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }
  }

  triggerMix() {
    if (!this.state.slotA || !this.state.slotB || this.state.mixed) return;
    this.state.mixed = true;

    const a = this.state.slotA.val;
    const b = this.state.slotB.val;
    const result = this._computeResult(this.state.op, a, b);

    AudioEngine.magic();
    this._spawnSparkles();
    $('magic-portal').classList.add('burst');
    setTimeout(() => $('magic-portal').classList.remove('burst'), 650);

    const resEl = $('magic-result-orb');
    resEl.textContent = result;
    resEl.classList.add('revealed');
    $('btn-magic-mix').disabled = true;

    const paradeEl = $('magic-visual-parade');
    paradeEl.innerHTML = '';
    const showCount = Math.min(Math.max(0, result), 24);
    for (let i = 0; i < showCount; i++) {
      const sp = document.createElement('span');
      sp.className = 'parade-icon';
      sp.style.animationDelay = `${i * 0.025}s`;
      sp.textContent = i < a ? this.state.slotA.icon : this.state.slotB.icon;
      paradeEl.appendChild(sp);
    }
    if (result > 24) {
      const more = document.createElement('span');
      more.className = 'parade-icon';
      more.textContent = `+${result - 24}!`;
      paradeEl.appendChild(more);
    }

    const fb = $('magic-feedback');
    const profile = this.profileStore.profile;
    if (this.state.mode === 'challenge') {
      if (result === this.state.target) {
        this.state.streak += 1;
        profile.stars += 2;
        this.profileStore.recordAttempt(this.state.op, true);
        const bonusMat = this.profileStore.awardTreasure(pickRandomTreasure().id, true);
        this.refreshHeader();
        launchConfetti(28);
        $('magic-streak-pill').textContent = `🪄 Streak: ${this.state.streak}`;
        fb.textContent = `🎉 Magical Match! ${a} ${this._getOpSymbol(this.state.op)} ${b} = ${result} (+2⭐ & ${bonusMat.emoji} ${bonusMat.name}!)`;
        AudioEngine.speak(`Magical match! ${result}!`);
        setTimeout(() => this.generateRound(), 1550);
      } else {
        this.state.streak = 0;
        this.profileStore.recordAttempt(this.state.op, false);
        $('magic-streak-pill').textContent = '🪄 Streak: 0';
        fb.textContent = `✨ Poof! ${a} ${this._getOpSymbol(this.state.op)} ${b} = ${result}. Try again for ${this.state.target}!`;
        setTimeout(() => this.clearSlots(), 1250);
      }
    } else {
      const freeMat = Math.random() < 0.55 ? this.profileStore.awardTreasure(pickRandomTreasure().id, true) : null;
      if (freeMat) this.refreshHeader();
      fb.textContent = freeMat
        ? `✨ Magic Result: ${a} ${this._getOpSymbol(this.state.op)} ${b} = ${result}! Conjured ${freeMat.emoji} ${freeMat.name}!`
        : `✨ Magic Result: ${a} ${this._getOpSymbol(this.state.op)} ${b} = ${result}!`;
    }
  }

  clearSlots() {
    AudioEngine.pop();
    if (this.state.slotA) this.state.slotA.used = false;
    if (this.state.slotB) this.state.slotB.used = false;
    this.state.slotA = null;
    this.state.slotB = null;
    this.state.mixed = false;
    this._renderUI();
  }
}

  app.MagicMixerGame = MagicMixerGame;
})(window.KidApp = window.KidApp || {});
