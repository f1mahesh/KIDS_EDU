/* Games Hub Controller — Manages AR & Arcade Games (Snow, Squirrel, Rock, Runner, Magic) */

(function (app) {
  'use strict';

  const { AudioEngine, $, launchConfetti, MagicMixerGame, NumberRunnerGame, RockBlasterGame, SnowClapGame, SquirrelBridgeGame, CarRacerGame, PicturePuzzleGame } = app;

class GamesHubController {
  constructor({ profileStore, showView, goBack, refreshHeader, stopMathTimer, closeArcadeSettings }) {
    this.profileStore = profileStore;
    this.showView = showView;
    this.goBack = goBack || ((fallback) => showView(fallback));
    this.refreshHeader = refreshHeader;
    this.stopMathTimer = stopMathTimer;
    this.closeArcadeSettings = closeArcadeSettings;

    this.snowGame = null;
    this.squirrelGame = null;
    this.rockGame = null;
    this.runnerGame = null;
    this.racerGame = null;
    this.magicMixer = new MagicMixerGame({
      profileStore,
      showView,
      refreshHeader,
      stopMathTimer
    });
    this.picturePuzzle = new PicturePuzzleGame({
      profileStore,
      refreshHeader
    });
    this.puzzleReturnView = 'funGames';

    this.snowOp = 'add';
    this.snowSpeed = 'slow';
    this.snowTheme = 'snow-num';

    this.sqOp = 'add';
    this.sqSpeed = 'slow';
    this.sqQuizMode = false;

    this.rockSpeed = 'slow';
    this.rockPack = 'mix';

    this.runnerOp = 'add';
    this.runnerSpeed = 'slow';
    this.runnerWorld = 'jungle';

    this.racerSpeed = 'slow';
    this.racerCar = 'racer';
    this.racerTrack = 'highway';

    this._bindEvents();
  }

  stopAll(exceptView = '') {
    if (exceptView !== 'snow' && this.snowGame) this.snowGame.stop();
    if (exceptView !== 'squirrel' && this.squirrelGame) this.squirrelGame.stop();
    if (exceptView !== 'rock' && this.rockGame) this.rockGame.stop();
    if (exceptView !== 'runner' && this.runnerGame) this.runnerGame.stop();
    if (exceptView !== 'funRacer' && this.racerGame) this.racerGame.stop();
    if (exceptView !== 'puzzle' && this.picturePuzzle) this.picturePuzzle.stop();
  }

  getActiveRunner() {
    if ($('view-runner').classList.contains('active') && this.runnerGame) {
      return this.runnerGame;
    }
    return null;
  }

  getActiveRacer() {
    if ($('view-fun-racer').classList.contains('active') && this.racerGame) {
      return this.racerGame;
    }
    return null;
  }

  getActivePuzzle() {
    if ($('view-puzzle').classList.contains('active') && this.picturePuzzle) {
      return this.picturePuzzle;
    }
    return null;
  }

  _bindEvents() {
    this._bindSnowEvents();
    this._bindSquirrelEvents();
    this._bindRockEvents();
    this._bindRunnerEvents();
    this._bindRacerEvents();
    this._bindPuzzleEvents();
  }

  // --- Snow Clap AR ---
  _initSnowGame() {
    if (this.snowGame) return this.snowGame;
    this.snowGame = new SnowClapGame({
      canvas: $('snow-canvas'),
      onStatus: (msg) => {
        $('snow-status').textContent = msg;
      },
      onScore: (info) => {
        $('snow-score').textContent = info.score;
        $('snow-combo').textContent = `x${info.combo}`;
        $('snow-timer').textContent = info.timeLeft;
        $('snow-stars').textContent = info.stars;
        $('snow-left-readout').textContent = `✋ Left: ${info.heldLeft !== null ? info.heldLeft : '--'}`;
        $('snow-right-readout').textContent = `Right: ${info.heldRight !== null ? info.heldRight : '--'} 🤚`;
        $('btn-snow-clap').disabled = !(info.heldLeft !== null && info.heldRight !== null);

        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.lastExpr) {
          this.profileStore.profile.stars += 2;
          this.profileStore.recordAttempt(this.snowOp, true);
          this.refreshHeader();
          launchConfetti(18);
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! Score: ${res.score} • +${res.stars} ⭐`;
        $('snow-status').textContent = `${msg} Tap Restart to play again!`;
        $('snow-finish-text').textContent = msg;
        $('snow-finish-banner').classList.remove('hidden');
        if (res.score > this.profileStore.profile.arcadeBest) {
          this.profileStore.profile.arcadeBest = res.score;
          this.profileStore.save();
        }
      }
    });
    return this.snowGame;
  }

  openSnow() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('snow-finish-banner').classList.add('hidden');
    const game = this._initSnowGame();
    $('snow-score').textContent = '0';
    $('snow-combo').textContent = 'x1';
    $('snow-timer').textContent = this.snowSpeed === 'slow' ? '90' : '60';
    $('snow-stars').textContent = '0';
    $('snow-left-readout').textContent = '✋ Left: --';
    $('snow-right-readout').textContent = 'Right: -- 🤚';
    $('btn-snow-clap').disabled = true;
    this.showView('snow');
    game.start(this.snowOp, this.snowSpeed, this.snowTheme);
  }

  _bindSnowEvents() {
    document.querySelectorAll('[data-action="open-snow"]').forEach((el) => {
      el.addEventListener('click', () => this.openSnow());
    });
    $('btn-snow-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('math');
    });
    $('btn-snow-clap').addEventListener('click', () => {
      if (this.snowGame) this.snowGame.triggerClap();
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('snow-finish-banner').classList.add('hidden');
      if (this.snowGame) this.snowGame.start(this.snowOp, this.snowSpeed, this.snowTheme);
    };
    $('btn-snow-restart').addEventListener('click', restart);
    $('btn-snow-play-again').addEventListener('click', restart);

    document.querySelectorAll('[data-snow-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.snowOp = btn.dataset.snowOp;
        document.querySelectorAll('[data-snow-op]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.snowGame) this.snowGame.setOperation(this.snowOp);
      });
    });
    document.querySelectorAll('[data-snow-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.snowSpeed = btn.dataset.snowSpeed;
        document.querySelectorAll('[data-snow-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.snowGame) this.snowGame.setSpeed(this.snowSpeed);
      });
    });
    document.querySelectorAll('[data-snow-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.snowTheme = btn.dataset.snowTheme;
        document.querySelectorAll('[data-snow-theme]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.snowGame) this.snowGame.setTheme(this.snowTheme);
      });
    });
  }

  // --- Squirrel Bridge AR ---
  _initSquirrelGame() {
    if (this.squirrelGame) return this.squirrelGame;
    this.squirrelGame = new SquirrelBridgeGame({
      canvas: $('squirrel-canvas'),
      onStatus: (msg) => {
        $('sq-status').textContent = msg;
      },
      onScore: (info) => {
        $('sq-score').textContent = info.score;
        $('sq-crossed').textContent = info.crossed;
        $('sq-stars').textContent = info.stars;
        if (info.problem) {
          $('sq-expr').textContent = `${info.problem.a} ${info.problem.sym} ${info.problem.b}`;
        }
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.completedRound) {
          this.profileStore.awardTreasure(null, false);
          this.profileStore.profile.stars += 2;
          this.profileStore.recordAttempt(this.sqOp, true);
          this.refreshHeader();
          launchConfetti(24);
        }
      }
    });
    return this.squirrelGame;
  }

  openSquirrel() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    const game = this._initSquirrelGame();
    $('sq-score').textContent = '0';
    $('sq-crossed').textContent = '0';
    $('sq-stars').textContent = '0';
    this.showView('squirrel');
    game.start(this.sqOp, this.sqSpeed);
  }

  _bindSquirrelEvents() {
    document.querySelectorAll('[data-action="open-squirrel"]').forEach((el) => {
      el.addEventListener('click', () => this.openSquirrel());
    });
    $('btn-squirrel-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('math');
    });
    $('btn-sq-connect').addEventListener('click', () => {
      if (this.squirrelGame) this.squirrelGame.connectNow();
    });
    $('btn-sq-next').addEventListener('click', () => {
      AudioEngine.pop();
      if (this.squirrelGame) this.squirrelGame.nextRound();
    });
    $('btn-sq-mode').addEventListener('click', () => {
      this.sqQuizMode = !this.sqQuizMode;
      $('btn-sq-mode').textContent = this.sqQuizMode ? '🌰 Math Quiz Mode' : '🌉 Stretch & Cross';
      AudioEngine.pop();
      if (this.squirrelGame) this.squirrelGame.setQuizMode(this.sqQuizMode);
    });
    $('btn-sq-cam').addEventListener('click', () => {
      if (!this.squirrelGame) return;
      const on = this.squirrelGame.toggleCameraView();
      $('btn-sq-cam').textContent = on ? '📷 Cam' : '🌴 Jungle';
      AudioEngine.pop();
    });
    $('btn-sq-cal').addEventListener('click', () => {
      if (this.squirrelGame) this.squirrelGame.recalibrate();
      AudioEngine.pop();
    });
    document.querySelectorAll('[data-sq-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sqOp = btn.dataset.sqOp;
        document.querySelectorAll('[data-sq-op]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.squirrelGame) this.squirrelGame.setOperation(this.sqOp);
      });
    });
    document.querySelectorAll('[data-sq-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sqSpeed = btn.dataset.sqSpeed;
        document.querySelectorAll('[data-sq-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.squirrelGame) this.squirrelGame.setSpeed(this.sqSpeed);
      });
    });
  }

  // --- Rock Blaster AR ---
  _initRockGame() {
    if (this.rockGame) return this.rockGame;
    this.rockGame = new RockBlasterGame({
      canvas: $('rock-canvas'),
      onStatus: (msg) => {
        $('rock-status').textContent = msg;
      },
      onScore: (info) => {
        $('rock-score').textContent = info.score;
        $('rock-blasted').textContent = info.blasted;
        $('rock-timer').textContent = info.timeLeft;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        const profile = this.profileStore.profile;
        if (info.score > (profile.rockBest || 0)) {
          profile.rockBest = info.score;
          $('rock-best').textContent = info.score;
          this.profileStore.save();
        }
        if (info.lastPoints >= 50) {
          launchConfetti(16);
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const starsWon = Math.max(1, Math.floor(res.blasted / 3));
        this.profileStore.profile.stars += starsWon;
        this.profileStore.save();
        this.refreshHeader();
        const msg = `🏆 Time Up! ${res.score} pts (${res.blasted} blasted) • +${starsWon} ⭐`;
        $('rock-status').textContent = msg;
        $('rock-finish-text').textContent = msg;
        $('rock-finish-banner').classList.remove('hidden');
      }
    });
    return this.rockGame;
  }

  openRock() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('rock-finish-banner').classList.add('hidden');
    const game = this._initRockGame();
    $('rock-score').textContent = '0';
    $('rock-blasted').textContent = '0';
    $('rock-timer').textContent = this.rockSpeed === 'slow' ? '90' : '60';
    $('rock-best').textContent = this.profileStore.profile.rockBest || 0;
    this.showView('rock');
    game.start(this.rockSpeed, this.rockPack);
  }

  _bindRockEvents() {
    document.querySelectorAll('[data-action="open-rock"]').forEach((el) => {
      el.addEventListener('click', () => this.openRock());
    });
    $('btn-rock-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('math');
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('rock-finish-banner').classList.add('hidden');
      if (this.rockGame) this.rockGame.start(this.rockSpeed, this.rockPack);
    };
    $('btn-rock-restart').addEventListener('click', restart);
    $('btn-rock-play-again').addEventListener('click', restart);
    $('btn-rock-cam').addEventListener('click', () => {
      if (!this.rockGame) return;
      const on = this.rockGame.toggleCameraView();
      $('btn-rock-cam').textContent = on ? '📷 Cam + Galaxy' : '🌌 Full Galaxy';
      AudioEngine.pop();
    });
    document.querySelectorAll('[data-rock-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.rockSpeed = btn.dataset.rockSpeed;
        document.querySelectorAll('[data-rock-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.rockGame) this.rockGame.setSpeed(this.rockSpeed);
      });
    });
    document.querySelectorAll('[data-rock-pack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.rockPack = btn.dataset.rockPack;
        document.querySelectorAll('[data-rock-pack]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.rockGame) this.rockGame.setPack(this.rockPack);
      });
    });
  }

  // --- Number Runner AR ---
  _initRunnerGame() {
    if (this.runnerGame) return this.runnerGame;
    this.runnerGame = new NumberRunnerGame({
      canvas: $('runner-canvas'),
      getAvatar: () => this.profileStore.profile.avatar || '🦁',
      onStatus: (msg) => {
        $('runner-status').textContent = msg;
      },
      onScore: (info) => {
        $('runner-score').textContent = info.score;
        $('runner-streak').textContent = info.streak;
        $('runner-timer').textContent = info.timeLeft;
        $('runner-stars').textContent = info.stars;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.solvedOp) {
          const profile = this.profileStore.profile;
          if (info.correct) {
            profile.stars += 1;
            if (info.streak > profile.bestStreak) {
              profile.bestStreak = info.streak;
            }
            launchConfetti(14);
          }
          this.profileStore.recordAttempt(info.solvedOp, Boolean(info.correct));
          this.refreshHeader();
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏆 Time Up! ${res.score} pts • +${res.stars} ⭐`;
        $('runner-status').textContent = `${msg} Tap Restart to run again!`;
        $('runner-finish-text').textContent = msg;
        $('runner-finish-banner').classList.remove('hidden');
      }
    });
    return this.runnerGame;
  }

  openRunner() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('runner-finish-banner').classList.add('hidden');
    const game = this._initRunnerGame();
    $('runner-score').textContent = '0';
    $('runner-streak').textContent = '0';
    $('runner-timer').textContent = this.runnerSpeed === 'slow' ? '90' : '60';
    $('runner-stars').textContent = '0';
    this.showView('runner');
    game.start(this.runnerOp, this.runnerSpeed, this.runnerWorld);
  }

  _bindRunnerEvents() {
    document.querySelectorAll('[data-action="open-runner"]').forEach((el) => {
      el.addEventListener('click', () => this.openRunner());
    });
    $('btn-runner-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('math');
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('runner-finish-banner').classList.add('hidden');
      if (this.runnerGame) this.runnerGame.start(this.runnerOp, this.runnerSpeed, this.runnerWorld);
    };
    $('btn-runner-restart').addEventListener('click', restart);
    $('btn-runner-play-again').addEventListener('click', restart);
    $('btn-runner-cam').addEventListener('click', () => {
      if (!this.runnerGame) return;
      const on = this.runnerGame.toggleCameraView();
      $('btn-runner-cam').textContent = on ? '📷 Cam + World' : '🏃 Full World';
      AudioEngine.pop();
    });
    $('btn-runner-cal').addEventListener('click', () => {
      if (this.runnerGame) this.runnerGame.recalibrate();
      AudioEngine.pop();
    });
    $('btn-runner-left').addEventListener('click', () => {
      if (this.runnerGame) this.runnerGame.moveLane(-1);
    });
    $('btn-runner-right').addEventListener('click', () => {
      if (this.runnerGame) this.runnerGame.moveLane(1);
    });
    $('btn-runner-jump').addEventListener('click', () => {
      if (this.runnerGame) this.runnerGame.jump();
    });
    $('btn-runner-duck').addEventListener('click', () => {
      if (this.runnerGame) this.runnerGame.duck();
    });

    document.querySelectorAll('[data-runner-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.runnerOp = btn.dataset.runnerOp;
        document.querySelectorAll('[data-runner-op]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.runnerGame) this.runnerGame.setOperation(this.runnerOp);
      });
    });
    document.querySelectorAll('[data-runner-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.runnerSpeed = btn.dataset.runnerSpeed;
        document.querySelectorAll('[data-runner-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.runnerGame) this.runnerGame.setSpeed(this.runnerSpeed);
      });
    });
    document.querySelectorAll('[data-runner-world]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.runnerWorld = btn.dataset.runnerWorld;
        document.querySelectorAll('[data-runner-world]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.runnerGame) this.runnerGame.setWorld(this.runnerWorld);
      });
    });
  }

  // --- Turbo Hand Racer AR (Fun Games) ---
  _initRacerGame() {
    if (this.racerGame) return this.racerGame;
    this.racerGame = new CarRacerGame({
      canvas: $('racer-canvas'),
      onStatus: (msg) => {
        $('racer-status').textContent = msg;
      },
      onScore: (info) => {
        $('racer-score').textContent = info.score;
        $('racer-mph').textContent = info.mph;
        $('racer-timer').textContent = info.timeLeft;
        $('racer-stars').textContent = info.stars;
        if (info.collectedMaterial) {
          this.profileStore.awardTreasure(info.collectedMaterial, true);
          this.refreshHeader();
        }
        if (info.collectedStar) {
          this.profileStore.profile.stars += 1;
          this.profileStore.save();
          this.refreshHeader();
        }
      },
      onFinish: (res) => {
        AudioEngine.fanfare();
        launchConfetti(40);
        const msg = `🏁 Finish Line! ${res.score} pts • +${res.stars} ⭐`;
        $('racer-status').textContent = msg;
        $('racer-finish-text').textContent = msg;
        $('racer-finish-banner').classList.remove('hidden');
      }
    });
    return this.racerGame;
  }

  openRacer() {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    $('racer-finish-banner').classList.add('hidden');
    const game = this._initRacerGame();
    $('racer-score').textContent = '0';
    $('racer-mph').textContent = this.racerSpeed === 'slow' ? '45' : this.racerSpeed === 'medium' ? '75' : '105';
    $('racer-timer').textContent = this.racerSpeed === 'slow' ? '90' : this.racerSpeed === 'medium' ? '75' : '60';
    $('racer-stars').textContent = '0';
    this.showView('funRacer');
    game.start(this.racerSpeed, this.racerCar, this.racerTrack);
  }

  _bindRacerEvents() {
    document.querySelectorAll('[data-action="open-fun-racer"]').forEach((el) => {
      el.addEventListener('click', () => this.openRacer());
    });
    $('btn-racer-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack('funGames');
    });
    const restart = () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      $('racer-finish-banner').classList.add('hidden');
      if (this.racerGame) this.racerGame.start(this.racerSpeed, this.racerCar, this.racerTrack);
    };
    $('btn-racer-restart').addEventListener('click', restart);
    $('btn-racer-play-again').addEventListener('click', restart);
    $('btn-racer-cam').addEventListener('click', () => {
      if (!this.racerGame) return;
      const on = this.racerGame.toggleCameraView();
      $('btn-racer-cam').textContent = on ? '📷 Cam + Road' : '🛣️ Full Road';
      AudioEngine.pop();
    });
    $('btn-racer-boost').addEventListener('click', () => {
      if (this.racerGame) this.racerGame.triggerBoost();
    });

    const bindSteerHold = (btn, dir) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.racerGame) this.racerGame.setManualSteer(dir);
      });
      const stopSteer = () => {
        if (this.racerGame) this.racerGame.setManualSteer(0);
      };
      btn.addEventListener('pointerup', stopSteer);
      btn.addEventListener('pointercancel', stopSteer);
      btn.addEventListener('pointerleave', stopSteer);
    };
    bindSteerHold($('btn-racer-left'), -1);
    bindSteerHold($('btn-racer-right'), 1);

    document.querySelectorAll('[data-racer-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.racerSpeed = btn.dataset.racerSpeed;
        document.querySelectorAll('[data-racer-speed]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.racerGame) this.racerGame.setSpeed(this.racerSpeed);
      });
    });
    document.querySelectorAll('[data-racer-car]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.racerCar = btn.dataset.racerCar;
        document.querySelectorAll('[data-racer-car]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.racerGame) this.racerGame.setCar(this.racerCar);
      });
    });
    document.querySelectorAll('[data-racer-track]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.racerTrack = btn.dataset.racerTrack;
        document.querySelectorAll('[data-racer-track]').forEach((b) => b.classList.toggle('active', b === btn));
        AudioEngine.pop();
        if (this.racerGame) this.racerGame.setTrack(this.racerTrack);
      });
    });
  }

  // --- Picture Puzzle ---
  openPuzzle(fromView = 'funGames') {
    AudioEngine.pop();
    this.stopMathTimer();
    this.closeArcadeSettings();
    this.puzzleReturnView = fromView || 'funGames';
    this.showView('puzzle');
    this.picturePuzzle.open();
  }

  _bindPuzzleEvents() {
    document.querySelectorAll('[data-action="open-puzzle"]').forEach((el) => {
      el.addEventListener('click', () => this.openPuzzle(el.dataset.puzzleFrom || 'funGames'));
    });
    $('btn-puzzle-back').addEventListener('click', () => {
      AudioEngine.pop();
      this.closeArcadeSettings();
      this.goBack(this.puzzleReturnView || 'funGames');
    });
  }
}

  app.GamesHubController = GamesHubController;
})(window.KidApp = window.KidApp || {});
