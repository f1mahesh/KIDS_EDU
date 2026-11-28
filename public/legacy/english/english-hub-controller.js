/* English Hub Controller — K-5 Phonics Arcade & 4 Interactive Games */

(function (app) {
  'use strict';

  const { AudioEngine, $, launchConfetti, PhonicsBlasterGame, PhonicsClapGame, PhonicsPopGame, PhonicsRunnerGame, PhonicsTraceGame, WordBuilderGame } = app;

class EnglishHubController {
  constructor({ profileStore, showView, goBack, refreshHeader, stopMathTimer, closeArcadeSettings }) {
    this.profileStore = profileStore;
    this.showView = showView;
    this.goBack = goBack || ((fallback) => showView(fallback));
    this.refreshHeader = refreshHeader;
    this.stopMathTimer = stopMathTimer;
    this.closeArcadeSettings = closeArcadeSettings;

    this.englishTier = 'all';
    this.enPopSpeed = 'slow';
    this.enPopClue = 'clue';
    this.enClapSpeed = 'slow';
    this.enClapMode = 'blend';
    this.enBlasterSpeed = 'slow';
    this.enRunnerSpeed = 'slow';
    this.enRunnerWorld = 'jungle';
    this.enTraceMode = 'trace';

    this.enPopGame = null;
    this.enClapGame = null;
    this.enBlasterGame = null;
    this.enRunnerGame = null;
    this.enTraceGame = null;
    this.enBuilderGame = null;

    this._bindEvents();
  }

  stopAll(exceptView = '') {
    if (exceptView !== 'enPop' && this.enPopGame) this.enPopGame.stop();
    if (exceptView !== 'enClap' && this.enClapGame) this.enClapGame.stop();
    if (exceptView !== 'enBlaster' && this.enBlasterGame) this.enBlasterGame.stop();
    if (exceptView !== 'enRunner' && this.enRunnerGame) this.enRunnerGame.stop();
    if (exceptView !== 'enTrace' && this.enTraceGame) this.enTraceGame.stop();
    if (exceptView !== 'enBuilder' && this.enBuilderGame) this.enBuilderGame.stop();
  }

  getActivePop() {
    if ($('view-en-pop').classList.contains('active') && this.enPopGame) {
      return this.enPopGame;
    }
    return null;
  }

  getActiveRunner() {
    if ($('view-en-runner').classList.contains('active') && this.enRunnerGame) {
      return this.enRunnerGame;
    }
    return null;
  }

  getActiveTrace() {
    if ($('view-en-trace').classList.contains('active') && this.enTraceGame) {
      return this.enTraceGame;
    }
    return null;
  }

  getActiveBuilder() {
    if ($('view-en-builder').classList.contains('active') && this.enBuilderGame) {
      return this.enBuilderGame;
    }
    return null;
  }

  syncTierUI(tier) {
    this.englishTier = tier;
    document.querySelectorAll('[data-en-tier]').forEach((b) => b.classList.toggle('active', b.dataset.enTier === tier));
    document.querySelectorAll('[data-en-tier-sync]').forEach((b) => b.classList.toggle('active', b.dataset.enTierSync === tier));
  }

  openHub(tier = null) {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    if (tier) this.syncTierUI(tier);
    this.showView('english');
  }

  _recordEnglishResult(correct = true) {
    if (correct) {
      this.profileStore.profile.stars += 1;
      launchConfetti(14);
    }
    this.profileStore.recordAttempt('en', correct);
    this.refreshHeader();
  }

  _bindEvents() {
    document.querySelectorAll('[data-action="open-english"]').forEach((el) => {
      el.addEventListener('click', () => this.openHub());
    });

    document.querySelectorAll('[data-en-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enTier);
        AudioEngine.pop();
      });
    });

    this._bindPopEvents();
    this._bindClapEvents();
    this._bindBlasterEvents();
    this._bindRunnerEvents();
    this._bindTraceEvents();
    this._bindBuilderEvents();
  }

  // --- Phonics Bubble Pop AR ---
  _initPop() {
    if (this.enPopGame) return this.enPopGame;
    this.enPopGame = new PhonicsPopGame({
      canvas: $('en-pop-canvas'),
      onStatus: (msg) => {
        $('en-pop-status').textContent = msg;
      },
      onScore: (info) => {
        $('en-pop-score').textContent = info.score;
        $('en-pop-combo').textContent = `x${info.combo}`;
        $('en-pop-timer').textContent = info.timeLeft;
        $('en-pop-stars').textContent = info.stars;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.solvedSound) {
          this._recordEnglishResult(true);
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! ${res.score} pts (${res.popped} popped) • +${res.stars} ⭐`;
        $('en-pop-status').textContent = `${msg} Tap Play Again!`;
        $('en-pop-finish-text').textContent = msg;
        $('en-pop-finish-banner').classList.remove('hidden');
      }
    });
    return this.enPopGame;
  }

  openPop() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('en-pop-finish-banner').classList.add('hidden');
    const game = this._initPop();
    $('en-pop-score').textContent = '0';
    $('en-pop-combo').textContent = 'x1';
    $('en-pop-timer').textContent = this.enPopSpeed === 'slow' ? '90' : this.enPopSpeed === 'medium' ? '75' : '60';
    $('en-pop-stars').textContent = '0';
    $('btn-en-pop-cam').textContent = game.showCamera ? '📷 Cam + Sky' : '🌈 Sky Only';
    this._refreshPopVoices();
    this.showView('enPop');
    game.start(this.englishTier, this.enPopSpeed, this.enPopClue);
  }

  _refreshPopVoices() {
    const sel = $('en-pop-voice-select');
    if (!sel || typeof AudioEngine.getAvailableVoices !== 'function') return;
    const voices = AudioEngine.getAvailableVoices();
    const activeName = AudioEngine.getSelectedVoiceName();
    sel.innerHTML = '';
    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Auto (Warm Female Voice)';
      sel.appendChild(opt);
      return;
    }
    voices.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.name;
      const cleanName = v.name.replace(/^Microsoft\s+/i, '').replace(/\s*\(United States\)/i, '');
      opt.textContent = cleanName;
      if (v.name === activeName) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  _bindPopEvents() {
    if (typeof AudioEngine.onVoicesChanged === 'function') {
      AudioEngine.onVoicesChanged(() => this._refreshPopVoices());
    }
    const voiceSel = $('en-pop-voice-select');
    if (voiceSel) {
      voiceSel.addEventListener('change', () => {
        if (typeof AudioEngine.setVoiceByName === 'function') {
          AudioEngine.setVoiceByName(voiceSel.value);
        }
        AudioEngine.pop();
        if (this.enPopGame && this.enPopGame.running) {
          this.enPopGame.repeatSound(false);
        }
      });
    }
    const voiceTestBtn = $('btn-en-pop-voice-test');
    if (voiceTestBtn) {
      voiceTestBtn.addEventListener('click', () => {
        if (typeof AudioEngine.musicalChantNotes === 'function') {
          AudioEngine.musicalChantNotes(false);
        }
        AudioEngine.speak('A, sound ah, ah! Alligator!', 'gentle');
      });
    }
    document.querySelectorAll('[data-action="open-en-pop"]').forEach((el) => {
      el.addEventListener('click', () => this.openPop());
    });
    $('btn-en-pop-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('english');
    });
    $('btn-en-pop-hear').addEventListener('click', () => {
      if (this.enPopGame) this.enPopGame.repeatSound(false);
    });
    $('btn-en-pop-example').addEventListener('click', () => {
      if (this.enPopGame) this.enPopGame.repeatSound(true);
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('en-pop-finish-banner').classList.add('hidden');
      if (this.enPopGame) this.enPopGame.start(this.englishTier, this.enPopSpeed, this.enPopClue);
    };
    $('btn-en-pop-restart').addEventListener('click', restart);
    $('btn-en-pop-play-again').addEventListener('click', restart);
    $('btn-en-pop-cam').addEventListener('click', () => {
      if (!this.enPopGame) return;
      const on = this.enPopGame.toggleCameraView();
      $('btn-en-pop-cam').textContent = on ? '📷 Cam + Sky' : '🌈 Sky Only';
      AudioEngine.pop();
    });
    document.querySelectorAll('[data-en-pop-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enPopTier);
        AudioEngine.pop();
        if (this.enPopGame) this.enPopGame.setTier(this.englishTier);
      });
    });
    document.querySelectorAll('[data-en-pop-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enPopSpeed = btn.dataset.enPopSpeed;
        document.querySelectorAll('[data-en-pop-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enPopGame) this.enPopGame.setSpeed(this.enPopSpeed);
      });
    });
    document.querySelectorAll('[data-en-pop-clue]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enPopClue = btn.dataset.enPopClue;
        document.querySelectorAll('[data-en-pop-clue]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enPopGame) this.enPopGame.setClueMode(this.enPopClue);
      });
    });
  }

  // --- Option 1: Phonics Clap Blender AR ---
  _initClap() {
    if (this.enClapGame) return this.enClapGame;
    this.enClapGame = new PhonicsClapGame({
      canvas: $('en-clap-canvas'),
      onStatus: (msg) => {
        $('en-clap-status').textContent = msg;
      },
      onScore: (info) => {
        $('en-clap-score').textContent = info.score;
        $('en-clap-combo').textContent = `x${info.combo}`;
        $('en-clap-timer').textContent = info.timeLeft;
        $('en-clap-stars').textContent = info.stars;
        $('en-clap-left-readout').textContent = `✋ Left: ${info.heldLeft !== null ? info.heldLeft : '--'}`;
        $('en-clap-right-readout').textContent = `Right: ${info.heldRight !== null ? info.heldRight : '--'} 🤚`;
        $('btn-en-clap-trigger').disabled = !(info.heldLeft !== null && info.heldRight !== null);
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.lastWord) {
          this._recordEnglishResult(true);
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! Score: ${res.score} • +${res.stars} ⭐`;
        $('en-clap-status').textContent = `${msg} Tap Restart to play again!`;
        $('en-clap-finish-text').textContent = msg;
        $('en-clap-finish-banner').classList.remove('hidden');
      }
    });
    return this.enClapGame;
  }

  openClap() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('en-clap-finish-banner').classList.add('hidden');
    const game = this._initClap();
    $('en-clap-score').textContent = '0';
    $('en-clap-combo').textContent = 'x1';
    $('en-clap-timer').textContent = this.enClapSpeed === 'slow' ? '90' : this.enClapSpeed === 'medium' ? '75' : '60';
    $('en-clap-stars').textContent = '0';
    $('en-clap-left-readout').textContent = '✋ Left: --';
    $('en-clap-right-readout').textContent = 'Right: -- 🤚';
    $('btn-en-clap-trigger').disabled = true;
    this.showView('enClap');
    game.start(this.englishTier, this.enClapSpeed, this.enClapMode);
  }

  _bindClapEvents() {
    document.querySelectorAll('[data-action="open-en-clap"]').forEach((el) => {
      el.addEventListener('click', () => this.openClap());
    });
    $('btn-en-clap-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('english');
    });
    $('btn-en-clap-trigger').addEventListener('click', () => {
      if (this.enClapGame) this.enClapGame.triggerClap();
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('en-clap-finish-banner').classList.add('hidden');
      if (this.enClapGame) this.enClapGame.start(this.englishTier, this.enClapSpeed, this.enClapMode);
    };
    $('btn-en-clap-restart').addEventListener('click', restart);
    $('btn-en-clap-play-again').addEventListener('click', restart);
    document.querySelectorAll('[data-en-clap-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enClapTier);
        AudioEngine.pop();
        if (this.enClapGame) this.enClapGame.setTier(this.englishTier);
      });
    });
    document.querySelectorAll('[data-en-clap-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enClapSpeed = btn.dataset.enClapSpeed;
        document.querySelectorAll('[data-en-clap-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enClapGame) this.enClapGame.setSpeed(this.enClapSpeed);
      });
    });
    document.querySelectorAll('[data-en-clap-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enClapMode = btn.dataset.enClapMode;
        document.querySelectorAll('[data-en-clap-mode]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enClapGame) this.enClapGame.setMode(this.enClapMode);
      });
    });
  }

  // --- Option 2: Letter Blaster AR ---
  _initBlaster() {
    if (this.enBlasterGame) return this.enBlasterGame;
    this.enBlasterGame = new PhonicsBlasterGame({
      canvas: $('en-blaster-canvas'),
      onStatus: (msg) => {
        $('en-blaster-status').textContent = msg;
      },
      onScore: (info) => {
        $('en-blaster-score').textContent = info.score;
        $('en-blaster-words').textContent = info.wordsDone;
        $('en-blaster-timer').textContent = info.timeLeft;
        $('en-blaster-streak').textContent = info.streak;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.solvedWord) {
          this._recordEnglishResult(true);
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! ${res.score} pts (${res.wordsDone} words) • +${res.stars} ⭐`;
        $('en-blaster-status').textContent = msg;
        $('en-blaster-finish-text').textContent = msg;
        $('en-blaster-finish-banner').classList.remove('hidden');
      }
    });
    return this.enBlasterGame;
  }

  openBlaster() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('en-blaster-finish-banner').classList.add('hidden');
    const game = this._initBlaster();
    $('en-blaster-score').textContent = '0';
    $('en-blaster-words').textContent = '0';
    $('en-blaster-timer').textContent = this.enBlasterSpeed === 'slow' ? '90' : this.enBlasterSpeed === 'medium' ? '75' : '60';
    $('en-blaster-streak').textContent = '0';
    this.showView('enBlaster');
    game.start(this.englishTier, this.enBlasterSpeed);
  }

  _bindBlasterEvents() {
    document.querySelectorAll('[data-action="open-en-blaster"]').forEach((el) => {
      el.addEventListener('click', () => this.openBlaster());
    });
    $('btn-en-blaster-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('english');
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('en-blaster-finish-banner').classList.add('hidden');
      if (this.enBlasterGame) this.enBlasterGame.start(this.englishTier, this.enBlasterSpeed);
    };
    $('btn-en-blaster-restart').addEventListener('click', restart);
    $('btn-en-blaster-play-again').addEventListener('click', restart);
    $('btn-en-blaster-repeat').addEventListener('click', () => {
      if (this.enBlasterGame) this.enBlasterGame.repeatWord();
    });
    $('btn-en-blaster-cam').addEventListener('click', () => {
      if (!this.enBlasterGame) return;
      const on = this.enBlasterGame.toggleCameraView();
      $('btn-en-blaster-cam').textContent = on ? '📷 Cam + Galaxy' : '🌌 Full Galaxy';
      AudioEngine.pop();
    });
    document.querySelectorAll('[data-en-blaster-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enBlasterTier);
        AudioEngine.pop();
        if (this.enBlasterGame) this.enBlasterGame.setTier(this.englishTier);
      });
    });
    document.querySelectorAll('[data-en-blaster-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enBlasterSpeed = btn.dataset.enBlasterSpeed;
        document.querySelectorAll('[data-en-blaster-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enBlasterGame) this.enBlasterGame.setSpeed(this.enBlasterSpeed);
      });
    });
  }

  // --- Option 3: Phonics Runner AR ---
  _initRunner() {
    if (this.enRunnerGame) return this.enRunnerGame;
    this.enRunnerGame = new PhonicsRunnerGame({
      canvas: $('en-runner-canvas'),
      getAvatar: () => this.profileStore.profile.avatar || '🦁',
      onStatus: (msg) => {
        $('en-runner-status').textContent = msg;
      },
      onScore: (info) => {
        $('en-runner-score').textContent = info.score;
        $('en-runner-streak').textContent = info.streak;
        $('en-runner-timer').textContent = info.timeLeft;
        $('en-runner-stars').textContent = info.stars;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.solvedWord !== null && info.correct !== null) {
          this._recordEnglishResult(Boolean(info.correct));
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! ${res.score} pts • +${res.stars} ⭐`;
        $('en-runner-status').textContent = `${msg} Tap Restart to run again!`;
        $('en-runner-finish-text').textContent = msg;
        $('en-runner-finish-banner').classList.remove('hidden');
      }
    });
    return this.enRunnerGame;
  }

  openRunner() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('en-runner-finish-banner').classList.add('hidden');
    const game = this._initRunner();
    $('en-runner-score').textContent = '0';
    $('en-runner-streak').textContent = '0';
    $('en-runner-timer').textContent = this.enRunnerSpeed === 'slow' ? '90' : '60';
    $('en-runner-stars').textContent = '0';
    this.showView('enRunner');
    game.start(this.englishTier, this.enRunnerSpeed, this.enRunnerWorld);
  }

  _bindRunnerEvents() {
    document.querySelectorAll('[data-action="open-en-runner"]').forEach((el) => {
      el.addEventListener('click', () => this.openRunner());
    });
    $('btn-en-runner-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('english');
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('en-runner-finish-banner').classList.add('hidden');
      if (this.enRunnerGame) this.enRunnerGame.start(this.englishTier, this.enRunnerSpeed, this.enRunnerWorld);
    };
    $('btn-en-runner-restart').addEventListener('click', restart);
    $('btn-en-runner-play-again').addEventListener('click', restart);
    $('btn-en-runner-repeat').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.repeatWord();
    });
    $('btn-en-runner-cam').addEventListener('click', () => {
      if (!this.enRunnerGame) return;
      const on = this.enRunnerGame.toggleCameraView();
      $('btn-en-runner-cam').textContent = on ? '📷 Cam + World' : '🏃 Full World';
      AudioEngine.pop();
    });
    $('btn-en-runner-cal').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.recalibrate();
      AudioEngine.pop();
    });
    $('btn-en-runner-left').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.moveLane(-1);
    });
    $('btn-en-runner-right').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.moveLane(1);
    });
    $('btn-en-runner-jump').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.jump();
    });
    $('btn-en-runner-duck').addEventListener('click', () => {
      if (this.enRunnerGame) this.enRunnerGame.duck();
    });
    document.querySelectorAll('[data-en-runner-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enRunnerTier);
        AudioEngine.pop();
        if (this.enRunnerGame) this.enRunnerGame.setTier(this.englishTier);
      });
    });
    document.querySelectorAll('[data-en-runner-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enRunnerSpeed = btn.dataset.enRunnerSpeed;
        document.querySelectorAll('[data-en-runner-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enRunnerGame) this.enRunnerGame.setSpeed(this.enRunnerSpeed);
      });
    });
    document.querySelectorAll('[data-en-runner-world]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enRunnerWorld = btn.dataset.enRunnerWorld;
        document.querySelectorAll('[data-en-runner-world]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enRunnerGame) this.enRunnerGame.setWorld(this.enRunnerWorld);
      });
    });
  }

  // --- Option 4: Air-Trace & Glow Pad ---
  _initTrace() {
    if (this.enTraceGame) return this.enTraceGame;
    this.enTraceGame = new PhonicsTraceGame({
      canvas: $('en-trace-canvas'),
      onStatus: (msg) => {
        $('en-trace-status').textContent = msg;
      },
      onScore: (info) => {
        $('en-trace-score').textContent = info.score;
        $('en-trace-words').textContent = info.wordsDone;
        $('en-trace-streak').textContent = info.streak;
        $('en-trace-stars').textContent = info.stars;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.solvedWord) {
          this._recordEnglishResult(true);
        }
      }
    });
    return this.enTraceGame;
  }

  openTrace() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    const game = this._initTrace();
    $('en-trace-score').textContent = '0';
    $('en-trace-words').textContent = '0';
    $('en-trace-streak').textContent = '0';
    $('en-trace-stars').textContent = '0';
    $('btn-en-trace-cam').textContent = game.showCamera ? '📷 Air-Cam: On' : '📷 Air-Cam: Off';
    this.showView('enTrace');
    game.start(this.englishTier, this.enTraceMode);
  }

  _bindTraceEvents() {
    document.querySelectorAll('[data-action="open-en-trace"]').forEach((el) => {
      el.addEventListener('click', () => this.openTrace());
    });
    $('btn-en-trace-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('english');
    });
    $('btn-en-trace-clear').addEventListener('click', () => {
      AudioEngine.pop();
      if (this.enTraceGame) this.enTraceGame.clearActiveBox();
    });
    $('btn-en-trace-speak').addEventListener('click', () => {
      if (this.enTraceGame) this.enTraceGame.speakCurrentWord();
    });
    $('btn-en-trace-skip').addEventListener('click', () => {
      AudioEngine.pop();
      if (this.enTraceGame) this.enTraceGame.nextWord();
    });
    $('btn-en-trace-next').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      if (this.enTraceGame) this.enTraceGame.nextWord();
    });
    $('btn-en-trace-cam').addEventListener('click', async () => {
      if (!this.enTraceGame) return;
      const on = await this.enTraceGame.toggleCameraView();
      $('btn-en-trace-cam').textContent = on ? '📷 Air-Cam: On' : '📷 Air-Cam: Off';
      AudioEngine.pop();
    });
    document.querySelectorAll('[data-en-trace-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.syncTierUI(btn.dataset.enTraceTier);
        AudioEngine.pop();
        if (this.enTraceGame) this.enTraceGame.setTier(this.englishTier);
      });
    });
    document.querySelectorAll('[data-en-trace-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.enTraceMode = btn.dataset.enTraceMode;
        document.querySelectorAll('[data-en-trace-mode]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.enTraceGame) this.enTraceGame.setMode(this.enTraceMode);
      });
    });
  }

  // --- Option 5: Word Builder Board (Drag & Drop Letters) ---
  _initBuilder() {
    if (this.enBuilderGame) return this.enBuilderGame;
    this.enBuilderGame = new WordBuilderGame({
      profileStore: this.profileStore,
      refreshHeader: this.refreshHeader
    });
    return this.enBuilderGame;
  }

  openBuilder() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    const game = this._initBuilder();
    const startTier = this.englishTier === 'all' ? 'k' : this.englishTier;
    this.showView('enBuilder');
    game.start(startTier);
  }

  _bindBuilderEvents() {
    document.querySelectorAll('[data-action="open-en-builder"]').forEach((el) => {
      el.addEventListener('click', () => this.openBuilder());
    });
    $('btn-wb-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.goBack('english');
    });
  }
}

  app.EnglishHubController = EnglishHubController;
})(window.KidApp = window.KidApp || {});
