/* Word Builder Board — Drag Letters from Letter Board Using Sound or Picture Clues */

(function (app) {
  'use strict';

  const {
    AudioEngine,
    EnglishPhonics,
    pickRandomTreasure,
    $,
    launchConfetti,
    spawnFloatingPop
  } = app;

  const AGE_LABELS = {
    k: '🐣 K (Ages 4–6)',
    g1: '🌱 Grade 1 (Ages 6–7)',
    g2: '🚀 Grade 2 (Ages 7–8)',
    g3: '✨ Grade 3 (Ages 8–9)',
    g4_5: '📘 Grades 4–5 (Ages 9–11)',
    g6: '🔭 Grade 6 (Ages 11–12)',
    g7_8: '👑 Grades 7–8 (Ages 12–14)',
    all: '🎲 All (K–8)'
  };

  const WB_DECK_STORAGE_KEY = 'playspark_wb_decks_v1';

  const PHONICS_DISTRACTORS = {
    a: ['e', 'o', 'u'],
    c: ['k', 's'],
    e: ['a', 'i', 'u'],
    f: ['v', 'p'],
    g: ['j', 'k'],
    i: ['e', 'y', 'a'],
    j: ['g', 'y'],
    k: ['c', 'g'],
    m: ['n'],
    n: ['m'],
    o: ['a', 'u'],
    p: ['b', 'f'],
    s: ['c', 'z'],
    u: ['o', 'a', 'e'],
    v: ['f', 'w'],
    w: ['v', 'u'],
    y: ['i', 'e'],
    z: ['s']
  };

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const CHEER_LINES = [
    (w) => `Woohoo!! "${w.toUpperCase()}" is AWESOME! 🌟`,
    (w) => `High five!! You built "${w.toUpperCase()}"! 🙌`,
    (w) => `Superstar speller!! "${w.toUpperCase()}"! 🏆`,
    (w) => `Yay!! "${w.toUpperCase()}" unlocked a cheer! 🎉`
  ];

  const EXTRA_LETTERS = 'etaoinsrhldcumfpgwybvkjxqz'.split('');

  class WordBuilderGame {
    constructor({ profileStore, refreshHeader, onCompleteWord }) {
      this.profileStore = profileStore;
      this.refreshHeader = refreshHeader;
      this.onCompleteWord = onCompleteWord || (() => {});

      this.tier = 'k';
      this.clueMode = 'both'; // 'both' | 'picture' | 'sound'
      this.score = 0;
      this.wordsDone = 0;
      this.streak = 0;
      this.starsEarned = 0;

      this.currentEntry = null;
      this.slots = []; // Array of { letter, locked, tileId, state }
      this.boardTiles = []; // Array of { id, letter, used, colorIdx }
      this.completed = false;
      this.cheerTimer = null;
      this.nextTimer = null;
      this.hintTileId = null;
      this.deckState = this._loadDeckState();

      this._bindEvents();
    }

    _loadDeckState() {
      try {
        const raw = localStorage.getItem(WB_DECK_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return {
              decks: parsed.decks && typeof parsed.decks === 'object' ? parsed.decks : {},
              recent: Array.isArray(parsed.recent) ? parsed.recent : []
            };
          }
        }
      } catch (_) {}
      return { decks: {}, recent: [] };
    }

    _saveDeckState() {
      try {
        localStorage.setItem(WB_DECK_STORAGE_KEY, JSON.stringify(this.deckState));
      } catch (_) {}
    }

    _pickNextDeckWord(tier, excludeWord = '') {
      const pool = typeof EnglishPhonics.getBuilderWords === 'function'
        ? EnglishPhonics.getBuilderWords(tier)
        : EnglishPhonics.getWords(tier);
      if (!pool || pool.length === 0) {
        return EnglishPhonics.pickWord(tier, excludeWord);
      }

      const poolMap = new Map();
      pool.forEach((entry) => poolMap.set(entry.word, entry));

      let deck = Array.isArray(this.deckState.decks[tier])
        ? this.deckState.decks[tier].filter((w) => poolMap.has(w))
        : [];

      if (deck.length === 0) {
        deck = shuffleArray(pool.map((e) => e.word));
        const avoidCount = Math.min(20, Math.floor(pool.length / 2));
        const recentAvoid = new Set(this.deckState.recent.slice(-avoidCount));
        if (excludeWord) recentAvoid.add(excludeWord.toLowerCase());

        // Push any recently seen words toward the back of the freshly shuffled deck
        const freshFront = [];
        const cooledBack = [];
        for (const w of deck) {
          if (recentAvoid.has(w)) cooledBack.push(w);
          else freshFront.push(w);
        }
        deck = freshFront.concat(cooledBack);
      }

      let chosenWord = deck.shift();
      if (chosenWord === excludeWord && deck.length > 0) {
        deck.push(chosenWord);
        chosenWord = deck.shift();
      }

      this.deckState.decks[tier] = deck;
      this.deckState.recent.push(chosenWord);
      if (this.deckState.recent.length > 60) {
        this.deckState.recent = this.deckState.recent.slice(-60);
      }
      this._saveDeckState();

      return poolMap.get(chosenWord) || pool[0];
    }

    _bindEvents() {
      document.querySelectorAll('[data-wb-tier]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.setTier(btn.dataset.wbTier);
          AudioEngine.pop();
        });
      });

      document.querySelectorAll('[data-wb-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.clueMode = btn.dataset.wbClue;
          document.querySelectorAll('[data-wb-clue]').forEach((b) => b.classList.toggle('active', b === btn));
          AudioEngine.pop();
          this._renderPrompt();
          if (this.clueMode !== 'picture') {
            this.speakWord();
          }
        });
      });

      $('btn-wb-hear').addEventListener('click', () => this.speakWord());
      $('btn-wb-sounds').addEventListener('click', () => this.speakPhonemes());
      $('btn-wb-hint').addEventListener('click', () => this.showHint());
      $('btn-wb-clear').addEventListener('click', () => this.clearUnlocked());
      $('btn-wb-next').addEventListener('click', () => {
        AudioEngine.pop();
        this.nextWord();
      });
    }

    start(tier = this.tier) {
      this.stop();
      this.score = 0;
      this.wordsDone = 0;
      this.streak = 0;
      this.starsEarned = 0;
      this.setTier(tier, false);
      this.nextWord();
    }

    stop() {
      if (this.cheerTimer) {
        clearTimeout(this.cheerTimer);
        this.cheerTimer = null;
      }
      if (this.nextTimer) {
        clearTimeout(this.nextTimer);
        this.nextTimer = null;
      }
    }

    setTier(tier, startNew = true) {
      this.tier = AGE_LABELS[tier] ? tier : 'k';
      document.querySelectorAll('[data-wb-tier]').forEach((b) => {
        b.classList.toggle('active', b.dataset.wbTier === this.tier);
      });
      if (startNew && $('view-en-builder').classList.contains('active')) {
        this.nextWord();
      }
    }

    nextWord() {
      this.stop();
      this.completed = false;
      this.hintTileId = null;
      $('wb-stage').classList.remove('burst');

      const prevWord = this.currentEntry ? this.currentEntry.word : '';
      const entry = this._pickNextDeckWord(this.tier, prevWord);
      this.currentEntry = entry;

      const letters = entry.word.split('');
      this.slots = letters.map(() => ({ letter: null, locked: false, tileId: null, state: '' }));

      // Build age-appropriate letter board (exact letters + phonics/common extras)
      const extraCount = letters.length >= 8 ? 3 : entry.tier === 'k' ? 2 : entry.tier === 'g1' || entry.tier === 'g2' ? 3 : 4;
      const pool = [...letters];

      // Seed 1-2 phonics-confusable distractors first so kids truly use phonics to choose!
      const confusableCandidates = [];
      letters.forEach((ch) => {
        const list = PHONICS_DISTRACTORS[ch];
        if (list) {
          list.forEach((d) => {
            if (!pool.includes(d) && !confusableCandidates.includes(d)) {
              confusableCandidates.push(d);
            }
          });
        }
      });
      shuffleArray(confusableCandidates);
      while (pool.length < letters.length + Math.min(2, extraCount) && confusableCandidates.length > 0) {
        pool.push(confusableCandidates.shift());
      }

      let guard = 0;
      while (pool.length < letters.length + extraCount && guard < 40) {
        guard++;
        const ch = EXTRA_LETTERS[Math.floor(Math.random() * Math.min(18, EXTRA_LETTERS.length))];
        if (!pool.includes(ch) || Math.random() < 0.25) {
          pool.push(ch);
        }
      }
      shuffleArray(pool);

      this.boardTiles = pool.map((letter, idx) => ({
        id: idx,
        letter,
        used: false,
        colorIdx: idx % 5
      }));

      this._updateStats();
      this._renderPrompt();
      this._renderSlots();
      this._renderBoard();
      this._setCheer('Drag letters from the board below into the boxes!', false);

      if (this.clueMode !== 'picture') {
        this.speakWord();
      }
    }

    speakWord() {
      if (!this.currentEntry) return;
      EnglishPhonics.speakWord(this.currentEntry.word, 'Build the word');
    }

    speakPhonemes() {
      if (!this.currentEntry) return;
      const cleanList = this.currentEntry.phonemes
        .map((p) => (String(p).startsWith('/') ? p : `/${p}/`))
        .join(' • ');
      this._setCheer(`🔊 UFLI Sounds: ${cleanList}`, false);
      if (typeof EnglishPhonics.speakWordSounds === 'function') {
        EnglishPhonics.speakWordSounds(this.currentEntry);
      } else {
        this.speakWord();
      }
    }

    showHint() {
      if (!this.currentEntry || this.completed) return;
      const idx = this.slots.findIndex((s) => !s.locked);
      if (idx === -1) return;

      // Never highlight the exact answer tile or reveal the letter/word — give phonics only!
      this.hintTileId = null;
      this.profileStore.recordHint('en');

      if (typeof EnglishPhonics.getPhonicsHintForSlot === 'function') {
        const hint = EnglishPhonics.getPhonicsHintForSlot(this.currentEntry, idx);
        this._setCheer(hint.text, false);
        if (typeof EnglishPhonics.speakSlotPhonicsHint === 'function') {
          EnglishPhonics.speakSlotPhonicsHint(hint);
        } else if (hint.phonemeKey) {
          EnglishPhonics.speakPhoneme(hint.phonemeKey);
        }
      } else {
        const neededLetter = this.currentEntry.word[idx];
        const soundCue = EnglishPhonics.getLetterSound(neededLetter);
        this._setCheer(`💡 Box ${idx + 1} phonics: ${soundCue} — find the matching letter!`, false);
        EnglishPhonics.speakPhoneme(neededLetter);
      }

      this._renderSlots(idx);
      this._renderBoard();
    }

    clearUnlocked() {
      if (this.completed) return;
      AudioEngine.pop();
      this.hintTileId = null;
      this.slots.forEach((slot) => {
        if (!slot.locked && slot.tileId !== null) {
          const tile = this.boardTiles.find((t) => t.id === slot.tileId);
          if (tile) tile.used = false;
          slot.letter = null;
          slot.tileId = null;
          slot.state = '';
        }
      });
      this._renderSlots();
      this._renderBoard();
    }

    handleKey(key) {
      if (this.completed || !this.currentEntry) return;
      if (key === 'Backspace') {
        for (let i = this.slots.length - 1; i >= 0; i--) {
          if (!this.slots[i].locked && this.slots[i].tileId !== null) {
            this._removeFromSlot(i);
            break;
          }
        }
        return;
      }
      if (key === 'Enter') {
        this.speakWord();
        return;
      }
      const lower = String(key).toLowerCase();
      const tile = this.boardTiles.find((t) => !t.used && t.letter === lower);
      if (tile) {
        const nextIdx = this.slots.findIndex((s) => !s.letter);
        if (nextIdx !== -1) this._placeTileInSlot(tile, nextIdx);
      }
    }

    _updateStats() {
      $('wb-score').textContent = this.score;
      $('wb-words').textContent = this.wordsDone;
      $('wb-streak').textContent = this.streak;
      $('wb-stars').textContent = this.starsEarned;
      $('wb-buddy-avatar').textContent = this.profileStore.profile.avatar || '🦁';
    }

    _renderPrompt() {
      if (!this.currentEntry) return;
      const entry = this.currentEntry;
      const tierInfo = AGE_LABELS[entry.tier] || AGE_LABELS[this.tier];
      $('wb-tier-badge').textContent = `${tierInfo} • ${entry.word.length} Letters`;

      const emojiEl = $('wb-emoji');
      const clueEl = $('wb-clue-text');

      if (this.clueMode === 'sound') {
        emojiEl.textContent = '🎧';
        emojiEl.classList.add('mystery');
        clueEl.textContent = 'Listen carefully and drag the matching letters!';
      } else {
        emojiEl.textContent = entry.emoji;
        emojiEl.classList.remove('mystery');
        clueEl.textContent = entry.meaning || 'Drag the letters to spell this picture!';
      }
    }

    _setCheer(text, happy = false) {
      $('wb-cheer-text').textContent = text;
      const strip = $('wb-cheer-strip');
      strip.classList.toggle('happy', happy);
    }

    _renderSlots(hintSlotIdx = -1) {
      const container = $('wb-slots');
      container.innerHTML = '';
      container.classList.toggle('long-word', this.slots.length >= 7 && this.slots.length < 9);
      container.classList.toggle('xl-word', this.slots.length >= 9);

      this.slots.forEach((slot, idx) => {
        const box = document.createElement('button');
        box.type = 'button';
        box.dataset.slotIndex = String(idx);

        const classes = ['wb-slot'];
        if (slot.letter) classes.push('filled');
        if (slot.locked) classes.push('locked');
        if (slot.state) classes.push(slot.state);
        if (idx === hintSlotIdx) classes.push('hint-target');
        if (this.completed) classes.push('celebrate');
        box.className = classes.join(' ');
        box.style.animationDelay = this.completed ? `${idx * 0.08}s` : '0s';

        box.textContent = slot.letter ? slot.letter : idx === hintSlotIdx ? '🔊' : '?';
        box.title = slot.letter && !slot.locked ? 'Tap to remove letter' : `Letter ${idx + 1}`;

        box.addEventListener('click', () => {
          if (this.completed || slot.locked || !slot.letter) return;
          this._removeFromSlot(idx);
        });

        container.appendChild(box);
      });
    }

    _renderBoard() {
      const board = $('wb-board');
      board.innerHTML = '';

      this.boardTiles.forEach((tile) => {
        const btn = document.createElement('div');
        btn.className = `wb-tile wb-color-${tile.colorIdx}${tile.used ? ' used' : ''}${
          this.hintTileId === tile.id ? ' hint-glow' : ''
        }`;
        btn.textContent = tile.letter;
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', tile.used ? '-1' : '0');
        btn.setAttribute('aria-label', `Letter ${tile.letter}`);
        this._attachDrag(btn, tile);
        board.appendChild(btn);
      });
    }

    _attachDrag(tileEl, tile) {
      let startX = 0;
      let startY = 0;
      let ghost = null;
      let moved = false;

      const findHoveredSlot = (x, y) => {
        const slotEls = document.querySelectorAll('#wb-slots .wb-slot');
        for (const el of slotEls) {
          const r = el.getBoundingClientRect();
          if (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10) {
            return Number(el.dataset.slotIndex);
          }
        }
        return -1;
      };

      const highlightHovered = (hoverIdx) => {
        document.querySelectorAll('#wb-slots .wb-slot').forEach((el) => {
          el.classList.toggle('drag-over', Number(el.dataset.slotIndex) === hoverIdx);
        });
      };

      tileEl.addEventListener('pointerdown', (e) => {
        if (tile.used || this.completed) return;
        e.preventDefault();
        tileEl.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        moved = false;

        ghost = tileEl.cloneNode(true);
        ghost.classList.add('drag-ghost', 'wb-tile-ghost');
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
        document.body.appendChild(ghost);
      });

      tileEl.addEventListener('pointermove', (e) => {
        if (!ghost) return;
        if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) moved = true;
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
        highlightHovered(findHoveredSlot(e.clientX, e.clientY));
      });

      const cleanup = (e) => {
        if (!ghost) return;
        const dropIdx = findHoveredSlot(e.clientX, e.clientY);
        highlightHovered(-1);
        ghost.remove();
        ghost = null;

        if (dropIdx !== -1) {
          this._placeTileInSlot(tile, dropIdx);
        } else if (!moved) {
          const nextOpen = this.slots.findIndex((s) => !s.letter);
          if (nextOpen !== -1) {
            this._placeTileInSlot(tile, nextOpen);
          }
        }
      };

      tileEl.addEventListener('pointerup', cleanup);
      tileEl.addEventListener('pointercancel', cleanup);
    }

    _removeFromSlot(slotIdx) {
      const slot = this.slots[slotIdx];
      if (!slot || slot.locked || slot.tileId === null) return;
      const tile = this.boardTiles.find((t) => t.id === slot.tileId);
      if (tile) tile.used = false;
      slot.letter = null;
      slot.tileId = null;
      slot.state = '';
      AudioEngine.pop();
      this._renderSlots();
      this._renderBoard();
    }

    _placeTileInSlot(tile, slotIdx) {
      if (this.completed || tile.used) return;
      const slot = this.slots[slotIdx];
      if (!slot || slot.locked) return;

      const expected = this.currentEntry.word[slotIdx];
      if (tile.letter === expected) {
        if (slot.tileId !== null) {
          const oldTile = this.boardTiles.find((t) => t.id === slot.tileId);
          if (oldTile) oldTile.used = false;
        }
        tile.used = true;
        slot.letter = tile.letter;
        slot.tileId = tile.id;
        slot.locked = true;
        slot.state = 'slot-correct';
        if (this.hintTileId === tile.id) this.hintTileId = null;

        AudioEngine.correct();
        if (typeof EnglishPhonics.speakSlotPhoneme === 'function') {
          EnglishPhonics.speakSlotPhoneme(this.currentEntry, slotIdx);
        } else {
          EnglishPhonics.speakPhoneme(tile.letter);
        }
        this._renderSlots();
        this._renderBoard();

        if (this.slots.every((s) => s.locked)) {
          this._celebrateCompletion();
        } else {
          this._setCheer(`Nice "${tile.letter.toUpperCase()}"! Keep going! 🌟`, false);
        }
      } else {
        // Gentle bounce back for wrong letter!
        AudioEngine.wrong();
        this.streak = 0;
        this.profileStore.currentStreak = 0;
        this.profileStore.recordAttempt('en', false);
        this.refreshHeader();
        this._updateStats();

        slot.state = 'slot-wrong';
        slot.letter = tile.letter;
        this._renderSlots();
        this._setCheer(`💡 Almost! Listen again for box ${slotIdx + 1}!`, false);

        setTimeout(() => {
          if (!this.completed && !slot.locked) {
            slot.letter = null;
            slot.state = '';
            this._renderSlots();
          }
        }, 420);
      }
    }

    _spawnSparkles() {
      const container = $('wb-sparkles');
      if (!container) return;
      container.innerHTML = '';
      const icons = ['✨', '⭐', '🌟', '🎉', '💫', '💎'];
      for (let i = 0; i < 20; i++) {
        const dot = document.createElement('span');
        dot.className = 'sparkle-dot';
        dot.textContent = icons[i % icons.length];
        dot.style.left = '50%';
        dot.style.top = '48%';
        const angle = (Math.PI * 2 * i) / 20;
        const dist = 75 + Math.random() * 110;
        dot.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        dot.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        container.appendChild(dot);
        setTimeout(() => dot.remove(), 950);
      }
    }

    _celebrateCompletion() {
      this.completed = true;
      const entry = this.currentEntry;
      this.wordsDone += 1;
      this.streak += 1;
      this.profileStore.currentStreak += 1;

      const profile = this.profileStore.profile;
      profile.bestStreak = Math.max(profile.bestStreak, this.profileStore.currentStreak);

      const starBonus = this.streak >= 3 ? 2 : 1;
      const pts = 20 * Math.min(4, this.streak);
      this.score += pts;
      this.starsEarned += starBonus;
      profile.stars += starBonus;

      this.profileStore.recordAttempt('en', true);
      const rewardMat = this.profileStore.awardTreasure(pickRandomTreasure().id, true);
      this.starsEarned += rewardMat.stars;
      this.refreshHeader();
      this._updateStats();
      this.onCompleteWord(entry, rewardMat);

      // Show picture even if it was Sound Only mode!
      $('wb-emoji').textContent = entry.emoji;
      $('wb-emoji').classList.remove('mystery');
      $('wb-clue-text').textContent = `${entry.emoji} ${entry.meaning || entry.word.toUpperCase()}`;

      const cheerFn = CHEER_LINES[Math.floor(Math.random() * CHEER_LINES.length)];
      this._setCheer(`${cheerFn(entry.word)} (+${starBonus}⭐ & ${rewardMat.emoji} ${rewardMat.name}!)`, true);

      $('wb-stage').classList.add('burst');
      this._spawnSparkles();
      this._renderSlots();
      this._renderBoard();
      launchConfetti(34);
      AudioEngine.fanfare();
      spawnFloatingPop($('wb-slots'), `${rewardMat.emoji} +${starBonus + rewardMat.stars}⭐!`);

      // Pause briefly so the final placed tile's phonics sound finishes before speaking the completed word,
      // then take a comfortable pause after the cheer before advancing to the next word.
      const voiceActive = typeof AudioEngine.isVoiceOn === 'function' ? AudioEngine.isVoiceOn() : true;
      const postCheerPauseMs = voiceActive ? 1200 : 2500;
      this.cheerTimer = setTimeout(() => {
        this.cheerTimer = null;
        if (!$('view-en-builder').classList.contains('active') || this.currentEntry !== entry) return;
        AudioEngine.speak(`Woohoo! You built ${entry.word}!`, 'cheer', () => {
          if (!$('view-en-builder').classList.contains('active') || this.currentEntry !== entry) return;
          this.nextTimer = setTimeout(() => {
            this.nextTimer = null;
            if ($('view-en-builder').classList.contains('active') && this.currentEntry === entry) {
              this.nextWord();
            }
          }, postCheerPauseMs);
        });
      }, 450);
    }
  }

  app.WordBuilderGame = WordBuilderGame;
})(window.KidApp = window.KidApp || {});
