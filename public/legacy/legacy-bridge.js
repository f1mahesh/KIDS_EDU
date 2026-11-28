/* PlaySpark — Legacy Game Engine Bridge for Liquid Glass React Shell */

(function (app) {
  'use strict';

  const PET_LINES = [
    'Yay! You are a learning superstar! 🌟',
    'Tap ❤️ on any game to save it to Favorites!',
    'Spin the 3D blocks — they love dancing!',
    'Every 5 ⭐ gets me a yummy cupcake! 🧁'
  ];

  const DOCK_VISIBLE_VIEWS = new Set([
    'home',
    'math',
    'english',
    'funGames',
    'trophies',
    'learn'
  ]);

  const HUB_VIEWS = new Set(['home', 'math', 'english', 'funGames']);

  let booted = false;
  let heroScene = null;

  app.boot = function boot() {
    if (booted) return;
    booted = true;

    const {
      ACTIVITIES,
      ACTIVITY_BY_ID,
      AGE_BAND_BY_ID,
      AudioEngine,
      ProfileStore,
      $,
      launchConfetti,
      openHelpModal,
      spawnFloatingPop,
      EnglishHubController,
      GamesHubController,
      LearnController,
      Math3DScene,
      MathQuestController,
      StoryController,
      TimesTablesController
    } = app;

    const profileStore = new ProfileStore();

    const views = {
      home: $('view-home'),
      math: $('view-math'),
      setup: $('view-setup'),
      play: $('view-play'),
      summary: $('view-summary'),
      tables: $('view-tables'),
      trophies: $('view-trophies'),
      learn: $('view-learn'),
      story: $('view-story'),
      magic: $('view-magic'),
      games: $('view-games'),
      snow: $('view-snow'),
      squirrel: $('view-squirrel'),
      rock: $('view-rock'),
      runner: $('view-runner'),
      english: $('view-english'),
      enPop: $('view-en-pop'),
      enClap: $('view-en-clap'),
      enBlaster: $('view-en-blaster'),
      enRunner: $('view-en-runner'),
      enTrace: $('view-en-trace'),
      enBuilder: $('view-en-builder'),
      funGames: $('view-fun-games'),
      funRacer: $('view-fun-racer'),
      puzzle: $('view-puzzle')
    };

    const play3D = $('play-3d-canvas')
      ? new Math3DScene($('play-3d-canvas'), { mode: 'add' })
      : null;
    const table3D = $('table-3d-canvas')
      ? new Math3DScene($('table-3d-canvas'), { mode: 'mul' })
      : null;
    if ($('summary-3d-canvas')) {
      new Math3DScene($('summary-3d-canvas'), { mode: 'trophy', autoSpin: true });
    }

    let gamesHub = null;
    let englishHub = null;
    let storyController = null;
    let currentView = 'home';
    let lastHubView = 'home';

    function emitStateChange() {
      window.dispatchEvent(new CustomEvent('kidapp:state-change'));
    }

    function emitViewChange(name) {
      const inGameplay = !DOCK_VISIBLE_VIEWS.has(name);
      document.body.classList.toggle('in-gameplay', inGameplay);
      window.dispatchEvent(
        new CustomEvent('kidapp:view-change', { detail: { view: name, inGameplay } })
      );
    }

    function closeArcadeSettings() {
      document
        .querySelectorAll('.arcade-settings-panel')
        .forEach((panel) => panel.classList.add('hidden'));
      document
        .querySelectorAll('.arcade-settings-btn')
        .forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    }

    function showView(name) {
      if (HUB_VIEWS.has(currentView) && currentView !== name) {
        lastHubView = currentView;
      }
      currentView = name;

      if (gamesHub) gamesHub.stopAll(name);
      if (englishHub) englishHub.stopAll(name);
      if (storyController) storyController.stopIfInactive(name);

      Object.values(views).forEach((v) => {
        if (v) v.classList.remove('active');
      });
      if (views[name]) views[name].classList.add('active');

      emitViewChange(name);
      emitStateChange();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goBack(defaultFallback = 'home') {
      AudioEngine.pop();
      closeArcadeSettings();
      mathQuest.stopTimer();
      const target =
        lastHubView && HUB_VIEWS.has(lastHubView) && lastHubView !== currentView
          ? lastHubView
          : defaultFallback;
      showView(target || 'home');
    }

    function syncAgeBandUI() {
      const ageBand = profileStore.profile.ageBand || '4-6';
      const bandMeta = AGE_BAND_BY_ID[ageBand] || AGE_BAND_BY_ID['4-6'];
      if (englishHub && bandMeta) {
        englishHub.syncTierUI(bandMeta.englishTier);
      }
    }

    function refreshHeader() {
      syncAgeBandUI();
      emitStateChange();
    }

    const learnController = new LearnController({
      showView,
      onPracticeMath: (op, level) => mathQuest.startQuest(level, op, false),
      onPracticeEnglish: (tierId) => englishHub.openHub(tierId)
    });

    const mathQuest = new MathQuestController({
      profileStore,
      play3D,
      showView,
      refreshHeader,
      openLearn: (subject, age) => learnController.open(subject, age)
    });

    const timesTables = new TimesTablesController({
      table3D,
      showView,
      onStartTableQuiz: (tableNum) => mathQuest.startTableQuiz(tableNum)
    });

    gamesHub = new GamesHubController({
      profileStore,
      showView,
      goBack,
      refreshHeader,
      stopMathTimer: () => mathQuest.stopTimer(),
      closeArcadeSettings
    });

    englishHub = new EnglishHubController({
      profileStore,
      showView,
      goBack,
      refreshHeader,
      stopMathTimer: () => mathQuest.stopTimer(),
      closeArcadeSettings
    });

    storyController = new StoryController({
      showView
    });

    function launchActivity(activityId) {
      const act = ACTIVITY_BY_ID[activityId];
      if (!act) return;
      profileStore.recordRecent(activityId);
      emitStateChange();
      const ageMeta =
        AGE_BAND_BY_ID[profileStore.profile.ageBand || '4-6'] || AGE_BAND_BY_ID['4-6'];

      switch (act.action) {
        case 'open-en-trace':
          englishHub.openTrace();
          break;
        case 'open-en-builder':
          englishHub.openBuilder();
          break;
        case 'open-en-pop':
          englishHub.openPop();
          break;
        case 'open-en-clap':
          englishHub.openClap();
          break;
        case 'open-en-blaster':
          englishHub.openBlaster();
          break;
        case 'open-en-runner':
          englishHub.openRunner();
          break;
        case 'start-setup':
          mathQuest.openSetup(act.op || 'add');
          break;
        case 'open-tables':
          timesTables.open(2);
          break;
        case 'open-magic':
          gamesHub.magicMixer.open();
          break;
        case 'start-arcade':
          mathQuest.startArcade();
          break;
        case 'open-runner':
          gamesHub.openRunner();
          break;
        case 'open-snow':
          gamesHub.openSnow();
          break;
        case 'open-rock':
          gamesHub.openRock();
          break;
        case 'open-squirrel':
          gamesHub.openSquirrel();
          break;
        case 'open-puzzle':
          gamesHub.openPuzzle(
            currentView === 'games' ? 'games' : currentView === 'home' ? 'home' : 'funGames'
          );
          break;
        case 'open-fun-racer':
          gamesHub.openRacer();
          break;
        case 'open-story':
          mathQuest.stopTimer();
          storyController.open();
          break;
        default:
          mathQuest.startQuest(ageMeta.mathLevel, 'add', true);
          break;
      }
    }

    function hydrateStaticActivityCards() {
      document.querySelectorAll('.mode-card[data-activity-id]').forEach((card) => {
        const id = card.dataset.activityId;
        const act = ACTIVITY_BY_ID[id];
        if (!act) return;

        card.addEventListener('click', () => {
          profileStore.recordRecent(id);
          emitStateChange();
        });

        if (!card.querySelector('.fav-heart-btn')) {
          const info = card.querySelector('.mode-info');
          if (info && !info.querySelector('.style-chip')) {
            const chip = document.createElement('span');
            chip.className = `style-chip ${act.style === 'ar' ? 'style-ar' : 'style-touch'}`;
            chip.textContent = act.style === 'ar' ? '📷 Camera AR' : '✋ Touch';
            info.appendChild(chip);
          }

          const heartBtn = document.createElement('span');
          heartBtn.className = 'fav-heart-btn';
          heartBtn.setAttribute('role', 'button');
          heartBtn.setAttribute('tabindex', '0');
          heartBtn.setAttribute('aria-label', `Favorite ${act.title}`);
          heartBtn.title = 'Save to My Favorites';
          heartBtn.dataset.favId = id;

          const toggleFav = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = profileStore.toggleFavorite(id);
            AudioEngine.pop();
            syncFavoriteHearts();
            emitStateChange();
            if (added) {
              spawnFloatingPop(heartBtn, '❤️ Saved!');
            }
          };

          heartBtn.addEventListener('click', toggleFav);
          heartBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleFav(e);
          });

          const arrow = card.querySelector('.mode-arrow');
          if (arrow) card.insertBefore(heartBtn, arrow);
          else card.appendChild(heartBtn);
        }
      });
      syncFavoriteHearts();
    }

    function syncFavoriteHearts() {
      document.querySelectorAll('[data-fav-id]').forEach((btn) => {
        const fav = profileStore.isFavorite(btn.dataset.favId);
        btn.textContent = fav ? '❤️' : '🤍';
        btn.classList.toggle('is-fav', fav);
      });
    }

    // Wire legacy DOM navigation buttons inside #legacy-views-host
    document.querySelectorAll('[data-action="go-home"]').forEach((el) => {
      el.addEventListener('click', () => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        showView('home');
      });
    });

    document.querySelectorAll('[data-action="go-back"]').forEach((el) => {
      el.addEventListener('click', () => {
        goBack(el.dataset.fallback || 'home');
      });
    });

    document.querySelectorAll('[data-action="open-math"]').forEach((el) => {
      el.addEventListener('click', () => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        showView('math');
      });
    });
    document.querySelectorAll('[data-action="open-games"]').forEach((el) => {
      el.addEventListener('click', () => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        showView('games');
      });
    });
    document.querySelectorAll('[data-action="open-fun-games"]').forEach((el) => {
      el.addEventListener('click', () => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        showView('funGames');
      });
    });
    document.querySelectorAll('[data-action="open-learn"]').forEach((el) => {
      el.addEventListener('click', () =>
        learnController.open('math', profileStore.profile.ageBand || '4-6')
      );
    });
    document.querySelectorAll('[data-action="open-learn-english"]').forEach((el) => {
      el.addEventListener('click', () =>
        learnController.open('english', profileStore.profile.ageBand || '4-6')
      );
    });
    document.querySelectorAll('[data-action="open-story"]').forEach((el) => {
      el.addEventListener('click', () => {
        mathQuest.stopTimer();
        storyController.open();
      });
    });
    document.querySelectorAll('[data-action="open-trophies"]').forEach((el) => {
      el.addEventListener('click', () => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        showView('trophies');
      });
    });
    document.querySelectorAll('[data-action="start-setup"]').forEach((el) => {
      el.addEventListener('click', () => mathQuest.openSetup(el.dataset.op));
    });
    document.querySelectorAll('.level-btn').forEach((el) => {
      el.addEventListener('click', () => mathQuest.startQuest(el.dataset.level));
    });
    document.querySelectorAll('[data-action="open-tables"]').forEach((el) => {
      el.addEventListener('click', () => timesTables.open(2));
    });
    document.querySelectorAll('[data-action="start-arcade"]').forEach((el) => {
      el.addEventListener('click', () => mathQuest.startArcade());
    });

    // Arcade Settings Popovers
    function bindArcadeSettings(btnId, panelId) {
      const btn = $(btnId);
      const panel = $(panelId);
      if (!btn || !panel) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = panel.classList.contains('hidden');
        closeArcadeSettings();
        if (willOpen) {
          panel.classList.remove('hidden');
          btn.setAttribute('aria-expanded', 'true');
        }
        AudioEngine.pop();
      });
    }

    [
      ['btn-snow-settings', 'snow-settings-panel'],
      ['btn-sq-settings', 'sq-settings-panel'],
      ['btn-rock-settings', 'rock-settings-panel'],
      ['btn-runner-settings', 'runner-settings-panel'],
      ['btn-en-pop-settings', 'en-pop-settings-panel'],
      ['btn-en-clap-settings', 'en-clap-settings-panel'],
      ['btn-en-blaster-settings', 'en-blaster-settings-panel'],
      ['btn-en-runner-settings', 'en-runner-settings-panel'],
      ['btn-en-trace-settings', 'en-trace-settings-panel'],
      ['btn-racer-settings', 'racer-settings-panel']
    ].forEach(([btnId, panelId]) => bindArcadeSettings(btnId, panelId));

    document.querySelectorAll('[data-close-settings]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeArcadeSettings();
        AudioEngine.pop();
      });
    });

    document.addEventListener('pointerdown', (e) => {
      if (
        e.target.closest('.arcade-settings-panel') ||
        e.target.closest('.arcade-settings-btn')
      ) {
        return;
      }
      closeArcadeSettings();
    });

    // Contextual Help Buttons
    const HELP_BINDINGS = [
      ['btn-help-setup', 'setup'],
      ['btn-help-tables', 'tables'],
      ['btn-help-magic', 'magic'],
      ['btn-help-snow', 'snow'],
      ['btn-help-squirrel', 'squirrel'],
      ['btn-help-rock', 'rock'],
      ['btn-help-runner', 'runner'],
      ['btn-help-english', 'english'],
      ['btn-help-en-pop', 'en-pop'],
      ['btn-help-en-clap', 'en-clap'],
      ['btn-help-en-blaster', 'en-blaster'],
      ['btn-help-en-runner', 'en-runner'],
      ['btn-help-en-trace', 'en-trace'],
      ['btn-help-en-builder', 'en-builder'],
      ['btn-help-racer', 'fun-racer'],
      ['btn-help-puzzle', 'puzzle']
    ];
    HELP_BINDINGS.forEach(([id, topic]) => {
      const el = $(id);
      if (el) {
        el.addEventListener('click', () => {
          closeArcadeSettings();
          openHelpModal(topic);
        });
      }
    });

    // Desktop Keyboard Support for active gameplay
    window.addEventListener('keydown', (e) => {
      const target = e.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isTyping) return;

      const activeRacer = gamesHub.getActiveRacer();
      if (activeRacer) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          activeRacer.setManualSteer(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          activeRacer.setManualSteer(1);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
          e.preventDefault();
          activeRacer.triggerBoost();
        }
        return;
      }

      const activeRunner = gamesHub.getActiveRunner() || englishHub.getActiveRunner();
      if (activeRunner) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          activeRunner.moveLane(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          activeRunner.moveLane(1);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
          e.preventDefault();
          activeRunner.jump();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          activeRunner.duck();
        }
        return;
      }

      const activeTrace = englishHub.getActiveTrace();
      if (activeTrace) {
        if (/^[a-zA-Z]$/.test(e.key)) {
          activeTrace.submitLetterChoice(e.key.toLowerCase());
        } else if (e.key === 'Backspace') {
          activeTrace.clearActiveBox();
        }
        return;
      }

      const activeBuilder = englishHub.getActiveBuilder();
      if (activeBuilder) {
        if (/^[a-zA-Z]$/.test(e.key) || e.key === 'Backspace' || e.key === 'Enter') {
          activeBuilder.handleKey(e.key);
        }
        return;
      }

      const activePop = englishHub.getActivePop();
      if (activePop) {
        if (/^[a-zA-Z]$/.test(e.key) || e.key === ' ') {
          if (e.key === ' ') e.preventDefault();
          activePop.handleKey(e.key);
        }
        return;
      }

      if (views.story && views.story.classList.contains('active')) {
        storyController.handleKey(e.key);
        return;
      }

      const activePuzzle = gamesHub.getActivePuzzle();
      if (activePuzzle) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          activePuzzle.handleKey(e.key);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const activeRacer = gamesHub.getActiveRacer();
      if (
        activeRacer &&
        ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)
      ) {
        activeRacer.setManualSteer(0);
      }
    });

    app.bridge = {
      profileStore,
      showView,
      launchActivity,
      openLearn: (subject) =>
        learnController.open(subject, profileStore.profile.ageBand || '4-6'),
      openWorld: (world) => {
        AudioEngine.pop();
        mathQuest.stopTimer();
        if (world === 'english') {
          englishHub.openHub();
        } else {
          showView(world);
        }
      },
      quickMath: () => {
        const ageMeta =
          AGE_BAND_BY_ID[profileStore.profile.ageBand || '4-6'] || AGE_BAND_BY_ID['4-6'];
        if ($('opt-mix')) $('opt-mix').checked = true;
        if ($('opt-keypad')) $('opt-keypad').checked = false;
        profileStore.recordRecent('math-add');
        emitStateChange();
        mathQuest.startQuest(ageMeta.mathLevel, 'add', true);
      },
      surpriseMe: () => {
        const ageBand = profileStore.profile.ageBand || '4-6';
        const lastId =
          profileStore.profile.recent && profileStore.profile.recent[0]
            ? profileStore.profile.recent[0].id
            : null;
        let pool = ACTIVITIES.filter((a) => a.ages.includes(ageBand) && a.id !== lastId);
        if (pool.length === 0) pool = ACTIVITIES;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        AudioEngine.fanfare();
        launchConfetti(26);
        AudioEngine.speak(`Surprise! Let's play ${pick.title}!`, 'cheer');
        launchActivity(pick.id);
        return pick;
      },
      petBuddy: () => {
        AudioEngine.giggle();
        const line = PET_LINES[Math.floor(Math.random() * PET_LINES.length)];
        AudioEngine.speak(line.replace(/[^\w\s!’']/g, ''));
        return line;
      },
      feedBuddy: () => {
        const profile = profileStore.profile;
        if (profile.stars < 5) {
          AudioEngine.pop();
          return {
            ok: false,
            message: `Need ${5 - profile.stars} more ⭐ to buy a treat!`
          };
        }
        profile.stars -= 5;
        profile.hearts = (profile.hearts || 0) + 1;
        profileStore.save(profile);
        refreshHeader();
        AudioEngine.chomp();
        launchConfetti(22);
        AudioEngine.speak('Yum! Thank you!');
        return {
          ok: true,
          message: `Yum!! Thank you, ${profile.name || 'friend'}! ❤️ (${profile.hearts} hearts!)`
        };
      },
      syncStoryMute: () => {
        if (storyController) {
          if (AudioEngine.isMuted()) storyController.narrator.stop();
          storyController._syncMuteUI();
        }
      },
      mountHeroCanvas: (canvas) => {
        if (!canvas) {
          if (heroScene && typeof heroScene.stop === 'function') {
            heroScene.stop();
            heroScene = null;
          }
          return;
        }
        if (!heroScene || heroScene.canvas !== canvas) {
          if (heroScene && typeof heroScene.stop === 'function') {
            heroScene.stop();
          }
          heroScene = new Math3DScene(canvas, { mode: 'hero', autoSpin: true });
        }
      },
      getCurrentView: () => currentView,
      isInGameplay: () => !DOCK_VISIBLE_VIEWS.has(currentView)
    };

    hydrateStaticActivityCards();
    refreshHeader();
    profileStore.hydrateFromDevice().then((restored) => {
      if (restored) {
        refreshHeader();
      }
      window.dispatchEvent(new CustomEvent('kidapp:storage-change'));
    });
  };

  window.dispatchEvent(new CustomEvent('kidapp:ready'));
})(window.KidApp = window.KidApp || {});
