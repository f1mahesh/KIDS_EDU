/* PlaySpark — Enterprise Kid-First Application Bootstrap, Smart Router & Discovery */

(function (app) {
  'use strict';

  const {
    ACTIVITIES,
    ACTIVITY_BY_ID,
    AGE_BAND_BY_ID,
    AudioEngine,
    BADGES,
    ProfileStore,
    RANKS,
    getRankLabel,
    getTotalTreasures,
    TREASURE_ITEMS,
    $,
    closeHelpModal,
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

const TOPIC_META = [
  { key: 'add', label: '➕ Addition', color: '#10b981' },
  { key: 'sub', label: '➖ Subtraction', color: '#f97316' },
  { key: 'mul', label: '✖️ Multiplication', color: '#8b5cf6' },
  { key: 'en', label: '📖 English Phonics', color: '#14b8a6' }
];

const SECTION_FOR_VIEW = {
  home: 'home',
  math: 'math',
  setup: 'math',
  play: 'math',
  summary: 'math',
  tables: 'math',
  magic: 'math',
  snow: 'math',
  squirrel: 'math',
  rock: 'math',
  runner: 'math',
  games: 'math',
  english: 'english',
  enPop: 'english',
  enClap: 'english',
  enBlaster: 'english',
  enRunner: 'english',
  enTrace: 'english',
  enBuilder: 'english',
  learn: 'home',
  story: 'fun',
  funGames: 'fun',
  funRacer: 'fun',
  puzzle: 'fun',
  trophies: 'home'
};

const HUB_VIEWS = new Set(['home', 'math', 'english', 'funGames']);
const DOCK_VISIBLE_VIEWS = new Set(['home', 'math', 'english', 'funGames', 'trophies', 'learn']);

const PET_LINES = [
  'Yay! You are a learning superstar! 🌟',
  'Tap ❤️ on any game to save it to Favorites!',
  'Spin the 3D blocks — they love dancing!',
  'Every 5 ⭐ gets me a yummy cupcake! 🧁'
];

const GROWNUP_CHALLENGES = [
  { q: '3 × 4 = ?', a: 12 },
  { q: '4 × 6 = ?', a: 24 },
  { q: '7 × 3 = ?', a: 21 },
  { q: '5 × 6 = ?', a: 30 },
  { q: '8 × 4 = ?', a: 32 }
];

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

// 3D Scenes
new Math3DScene($('hero-3d-canvas'), { mode: 'hero', autoSpin: true });
const play3D = new Math3DScene($('play-3d-canvas'), { mode: 'add' });
const table3D = new Math3DScene($('table-3d-canvas'), { mode: 'mul' });
new Math3DScene($('summary-3d-canvas'), { mode: 'trophy', autoSpin: true });

let gamesHub = null;
let englishHub = null;
let storyController = null;
let currentView = 'home';
let lastHubView = 'home';
let homeFilter = 'recommended';
let grownupsUnlocked = false;
let currentGrownupChallenge = GROWNUP_CHALLENGES[0];

function closeArcadeSettings() {
  document.querySelectorAll('.arcade-settings-panel').forEach((panel) => panel.classList.add('hidden'));
  document.querySelectorAll('.arcade-settings-btn').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
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

  document.body.classList.toggle('in-gameplay', !DOCK_VISIBLE_VIEWS.has(name));

  const activeSection = SECTION_FOR_VIEW[name] || 'home';
  document.querySelectorAll('[data-nav-section]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.navSection === activeSection);
  });

  if (name === 'home') {
    renderHomeLaunchpad();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack(defaultFallback = 'home') {
  AudioEngine.pop();
  closeArcadeSettings();
  mathQuest.stopTimer();
  const target = lastHubView && HUB_VIEWS.has(lastHubView) && lastHubView !== currentView ? lastHubView : defaultFallback;
  showView(target || 'home');
}

function syncAgeBandUI() {
  const ageBand = profileStore.profile.ageBand || '4-6';
  const bandMeta = AGE_BAND_BY_ID[ageBand] || AGE_BAND_BY_ID['4-6'];
  const ageBadge = $('profile-age-badge');
  if (ageBadge && bandMeta) {
    ageBadge.textContent = bandMeta.short;
  }
  document.querySelectorAll('[data-age-band]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.ageBand === ageBand);
  });
  if (englishHub && bandMeta) {
    englishHub.syncTierUI(bandMeta.englishTier);
  }
}

function refreshHeader() {
  const profile = profileStore.profile;
  $('stat-stars').textContent = profile.stars;
  $('stat-streak').textContent = profileStore.currentStreak;
  $('profile-avatar').textContent = profile.avatar || '🦁';
  $('profile-name').textContent = profile.name || 'Kid';
  $('home-rank').textContent = getRankLabel(profile.stars);
  $('home-heading').textContent = profile.name
    ? `Hi ${profile.name}! Let's Play!`
    : `Let's Play & Learn Together!`;
  $('pet-emoji').textContent = profile.avatar || '🦁';
  $('pet-hearts').textContent = `❤️ ${profile.hearts || 0}`;
  const totalTreasures = getTotalTreasures(profile);
  $('home-treasure-count').textContent = totalTreasures;
  const topTreasure = $('top-treasure-count');
  if (topTreasure) topTreasure.textContent = totalTreasures;
  $('btn-feed-buddy').disabled = profile.stars < 5;
  syncAgeBandUI();
}

function updateSoundBtn() {
  $('btn-sound').textContent = AudioEngine.isMuted() ? '🔇' : '🔊';
}

function updateVoiceBtn() {
  $('btn-voice').textContent = AudioEngine.isVoiceOn() ? '🗣️' : '🤫';
}

// Controllers
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

// Unified Activity Launcher (Used by Jump Back In, Favorites, Discover Grid & Surprise Me)
function launchActivity(activityId) {
  const act = ACTIVITY_BY_ID[activityId];
  if (!act) return;
  profileStore.recordRecent(activityId);
  const ageMeta = AGE_BAND_BY_ID[profileStore.profile.ageBand || '4-6'] || AGE_BAND_BY_ID['4-6'];

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
      gamesHub.openPuzzle(currentView === 'games' ? 'games' : currentView === 'home' ? 'home' : 'funGames');
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

// Hydrate Static Hub Cards with Play-Style Pill & Favorite Heart Button
function hydrateStaticActivityCards() {
  document.querySelectorAll('.mode-card[data-activity-id]').forEach((card) => {
    const id = card.dataset.activityId;
    const act = ACTIVITY_BY_ID[id];
    if (!act) return;

    card.addEventListener('click', () => {
      profileStore.recordRecent(id);
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
        if (added) {
          spawnFloatingPop(heartBtn, '❤️ Saved!');
        }
        if (currentView === 'home') renderHomeLaunchpad();
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

function createCompactActivityCard(act, { showStyle = true } = {}) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `discover-card ${act.cardClass}`;
  const isFav = profileStore.isFavorite(act.id);

  card.innerHTML = `
    <span class="discover-emoji" aria-hidden="true">${act.emoji}</span>
    <div class="discover-body">
      <div class="discover-title">${act.title}</div>
      <div class="discover-desc">${act.shortDesc}</div>
      ${showStyle ? `<span class="style-chip ${act.style === 'ar' ? 'style-ar' : 'style-touch'}">${act.style === 'ar' ? '📷 Camera AR' : '✋ Touch'}</span>` : ''}
    </div>
    <span class="fav-heart-btn ${isFav ? 'is-fav' : ''}" role="button" tabindex="0" data-fav-id="${act.id}" aria-label="Favorite ${act.title}">${isFav ? '❤️' : '🤍'}</span>
  `;

  const heart = card.querySelector('.fav-heart-btn');
  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = profileStore.toggleFavorite(act.id);
    AudioEngine.pop();
    if (added) spawnFloatingPop(heart, '❤️ Saved!');
    renderHomeLaunchpad();
    syncFavoriteHearts();
  };
  heart.addEventListener('click', toggleFav);
  heart.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') toggleFav(e);
  });

  card.addEventListener('click', () => {
    AudioEngine.pop();
    launchActivity(act.id);
  });

  return card;
}

function renderHomeLaunchpad() {
  const profile = profileStore.profile;
  const ageBand = profile.ageBand || '4-6';

  // 1. Jump Back In (Last Played or Starter Recommendation)
  const continueSlot = $('home-continue-slot');
  if (continueSlot) {
    continueSlot.innerHTML = '';
    const recentList = Array.isArray(profile.recent) ? profile.recent : [];
    const lastValid = recentList.map((r) => ACTIVITY_BY_ID[r.id]).find(Boolean);
    const starter = ACTIVITIES.find((a) => a.ages.includes(ageBand)) || ACTIVITIES[0];
    const targetAct = lastValid || starter;
    const isReturning = Boolean(lastValid);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = `continue-card ${targetAct.cardClass}`;
    card.innerHTML = `
      <div class="continue-badge">${isReturning ? '⚡ Jump Back In' : '🌟 Great First Pick'}</div>
      <div class="continue-main">
        <span class="continue-emoji" aria-hidden="true">${targetAct.emoji}</span>
        <div class="continue-info">
          <h3>${targetAct.title}</h3>
          <p>${targetAct.shortDesc}</p>
        </div>
        <span class="continue-play-pill">▶ Play</span>
      </div>
    `;
    card.addEventListener('click', () => {
      AudioEngine.pop();
      launchActivity(targetAct.id);
    });
    continueSlot.appendChild(card);
  }

  // 2. My Favorites Strip
  const favWrap = $('home-favorites-wrap');
  const favRow = $('home-favorites-row');
  if (favWrap && favRow) {
    const favActivities = (profile.favorites || []).map((id) => ACTIVITY_BY_ID[id]).filter(Boolean);
    favRow.innerHTML = '';
    if (favActivities.length > 0) {
      favWrap.classList.remove('hidden');
      favActivities.forEach((act) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `fav-quick-chip ${act.cardClass}`;
        chip.innerHTML = `
          <span class="fav-chip-emoji">${act.emoji}</span>
          <span class="fav-chip-title">${act.title}</span>
        `;
        chip.addEventListener('click', () => {
          AudioEngine.pop();
          launchActivity(act.id);
        });
        favRow.appendChild(chip);
      });
    } else {
      favWrap.classList.add('hidden');
    }
  }

  // 3. Play-Style Discovery Grid
  const discoverGrid = $('home-discover-grid');
  if (discoverGrid) {
    discoverGrid.innerHTML = '';
    let filtered = ACTIVITIES;
    if (homeFilter === 'recommended') {
      filtered = ACTIVITIES.filter((a) => a.ages.includes(ageBand)).slice(0, 6);
    } else if (homeFilter === 'touch') {
      filtered = ACTIVITIES.filter((a) => a.style === 'touch');
    } else if (homeFilter === 'ar') {
      filtered = ACTIVITIES.filter((a) => a.style === 'ar');
    }
    filtered.forEach((act) => {
      discoverGrid.appendChild(createCompactActivityCard(act));
    });
  }

  syncFavoriteHearts();
}

// Progress Report & Kid-Safe Trophy Room
function buildReportSummary() {
  const profile = profileStore.profile;
  let totalAttempts = 0;
  let totalCorrect = 0;
  const topics = TOPIC_META.map((t) => {
    const s = profile.stats[t.key] || { attempts: 0, correct: 0, hints: 0 };
    totalAttempts += s.attempts;
    totalCorrect += s.correct;
    const pct = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null;
    return { ...t, ...s, pct };
  });
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  return { topics, overallPct };
}

function renderGrownupsGateState() {
  const gate = $('grownups-gate');
  const panel = $('grownups-panel');
  if (!gate || !panel) return;
  if (grownupsUnlocked) {
    gate.classList.add('hidden');
    panel.classList.remove('hidden');
  } else {
    currentGrownupChallenge = GROWNUP_CHALLENGES[Math.floor(Math.random() * GROWNUP_CHALLENGES.length)];
    $('grownups-math-q').textContent = currentGrownupChallenge.q;
    $('grownups-math-input').value = '';
    gate.classList.remove('hidden');
    panel.classList.add('hidden');
  }
}

function openTrophies() {
  AudioEngine.pop();
  mathQuest.stopTimer();
  const profile = profileStore.profile;
  const { topics, overallPct } = buildReportSummary();

  $('report-avatar').textContent = profile.avatar || '🦁';
  $('report-kid-name').textContent = profile.name || 'Math Explorer';
  $('report-kid-rank').textContent = getRankLabel(profile.stars);

  // Rank progress bar
  const nextRank = RANKS.find((r) => profile.stars < r.min);
  const prevRankMin = [...RANKS].reverse().find((r) => profile.stars >= r.min)?.min || 0;
  if (nextRank) {
    const pct = Math.min(100, Math.round(((profile.stars - prevRankMin) / (nextRank.min - prevRankMin)) * 100));
    $('report-next-rank').textContent = `Next: ${nextRank.label} (${nextRank.min} ⭐)`;
    $('report-rank-fill').style.width = `${Math.max(6, pct)}%`;
  } else {
    $('report-next-rank').textContent = '👑 Max Rank Unlocked!';
    $('report-rank-fill').style.width = '100%';
  }

  $('tr-stars').textContent = profile.stars;
  $('tr-solved').textContent = profile.solved;
  $('tr-accuracy').textContent = `${overallPct}%`;
  $('tr-arcade').textContent = profile.arcadeBest;

  const strengthsEl = $('report-strengths');
  const focusEl = $('report-focus');
  strengthsEl.innerHTML = '';
  focusEl.innerHTML = '';

  const practiced = topics.filter((t) => t.attempts > 0);
  const strong = practiced.filter((t) => t.pct >= 80);
  const needFocus = practiced.filter((t) => t.pct < 80);
  const unpracticed = topics.filter((t) => t.attempts === 0);

  if (practiced.length === 0) {
    strengthsEl.innerHTML = '<li>Play a quick round to discover strengths!</li>';
    focusEl.innerHTML = '<li>Try 3D Math Quests or English Phonics!</li>';
  } else {
    if (strong.length > 0) {
      strong.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = `${t.label}: ${t.pct}% accuracy (${t.correct}/${t.attempts})`;
        strengthsEl.appendChild(li);
      });
    } else {
      const best = [...practiced].sort((a, b) => b.pct - a.pct)[0];
      strengthsEl.innerHTML = `<li>Best so far: ${best.label} (${best.pct}%) — keep going!</li>`;
    }

    if (needFocus.length > 0) {
      needFocus.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = `${t.label} (${t.pct}% accuracy) — try Starter level or Mini Lessons!`;
        focusEl.appendChild(li);
      });
    } else if (unpracticed.length > 0) {
      unpracticed.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = `Not tried yet: ${t.label}`;
        focusEl.appendChild(li);
      });
    } else {
      focusEl.innerHTML = '<li>Awesome! 80%+ in every topic — try Master level or 60s Blitz!</li>';
    }
  }

  const chestEl = $('treasure-chest-grid');
  if (chestEl) {
    chestEl.innerHTML = '';
    TREASURE_ITEMS.forEach((mat) => {
      const count = (profile.treasures && profile.treasures[mat.id]) || 0;
      const card = document.createElement('div');
      card.className = `treasure-card ${count > 0 ? 'collected' : ''}`;
      card.innerHTML = `
        <span class="treasure-emoji">${mat.emoji}</span>
        <span class="treasure-count">${count}</span>
        <span class="treasure-name">${mat.name}</span>
      `;
      chestEl.appendChild(card);
    });
  }

  const barsEl = $('topic-bars');
  barsEl.innerHTML = '';
  topics.forEach((t) => {
    const pctText = t.pct === null ? 'Not tried yet' : `${t.pct}% (${t.correct}/${t.attempts})`;
    const width = t.pct === null ? 0 : t.pct;
    const row = document.createElement('div');
    row.className = 'topic-row';
    row.innerHTML = `
      <div class="topic-row-top">
        <span>${t.label}</span>
        <span>${pctText}</span>
      </div>
      <div class="topic-bar-bg">
        <div class="topic-bar-fill" style="width:${width}%; background:${t.color};"></div>
      </div>
      <div class="topic-meta">
        <span>Hints used: ${t.hints}</span>
        <button class="mini-btn" data-quick-op="${t.key}">▶ Practice</button>
      </div>
    `;
    row.querySelector('[data-quick-op]').addEventListener('click', () => {
      if (t.key === 'en') englishHub.openHub();
      else mathQuest.openSetup(t.key);
    });
    barsEl.appendChild(row);
  });

  const grid = $('badges-grid');
  grid.innerHTML = '';
  BADGES.forEach((b) => {
    const unlocked = b.check(profile);
    const el = document.createElement('div');
    el.className = `badge-card ${unlocked ? 'unlocked' : ''}`;
    el.innerHTML = `
      <span class="badge-emoji">${b.emoji}</span>
      <span class="badge-name">${b.name}</span>
      <span class="badge-req">${unlocked ? 'Unlocked!' : b.req}</span>
    `;
    grid.appendChild(el);
  });

  renderGrownupsGateState();
  showView('trophies');
}

// Section Navigation Wiring
function openMathSection() {
  AudioEngine.pop();
  mathQuest.stopTimer();
  showView('math');
}

function openGamesSection() {
  AudioEngine.pop();
  mathQuest.stopTimer();
  showView('games');
}

function openFunGamesSection() {
  AudioEngine.pop();
  mathQuest.stopTimer();
  showView('funGames');
}

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

$('btn-home').addEventListener('click', () => {
  AudioEngine.pop();
  mathQuest.stopTimer();
  showView('home');
});

document.querySelectorAll('[data-action="open-math"]').forEach((el) => {
  el.addEventListener('click', openMathSection);
});
document.querySelectorAll('[data-action="open-games"]').forEach((el) => {
  el.addEventListener('click', openGamesSection);
});
document.querySelectorAll('[data-action="open-fun-games"]').forEach((el) => {
  el.addEventListener('click', openFunGamesSection);
});
document.querySelectorAll('[data-action="open-learn"]').forEach((el) => {
  el.addEventListener('click', () => learnController.open('math', profileStore.profile.ageBand || '4-6'));
});
document.querySelectorAll('[data-action="open-learn-english"]').forEach((el) => {
  el.addEventListener('click', () => learnController.open('english', profileStore.profile.ageBand || '4-6'));
});
document.querySelectorAll('[data-action="open-story"]').forEach((el) => {
  el.addEventListener('click', () => {
    mathQuest.stopTimer();
    storyController.open();
  });
});
document.querySelectorAll('[data-action="open-trophies"]').forEach((el) => {
  el.addEventListener('click', openTrophies);
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

// Home Age-Band Quick Switcher & Play-Style Filter
document.querySelectorAll('[data-age-band]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const band = btn.dataset.ageBand;
    profileStore.setAgeBand(band);
    AudioEngine.pop();
    refreshHeader();
    renderHomeLaunchpad();
    const meta = AGE_BAND_BY_ID[band];
    if (meta) {
      AudioEngine.speak(`Showing games for ${meta.label}!`, 'cheer');
    }
  });
});

document.querySelectorAll('[data-home-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    homeFilter = btn.dataset.homeFilter;
    document.querySelectorAll('[data-home-filter]').forEach((b) => b.classList.toggle('active', b === btn));
    AudioEngine.pop();
    renderHomeLaunchpad();
  });
});

if ($('btn-surprise-me')) {
  $('btn-surprise-me').addEventListener('click', () => {
    const ageBand = profileStore.profile.ageBand || '4-6';
    const lastId = profileStore.profile.recent && profileStore.profile.recent[0] ? profileStore.profile.recent[0].id : null;
    let pool = ACTIVITIES.filter((a) => a.ages.includes(ageBand) && a.id !== lastId);
    if (pool.length === 0) pool = ACTIVITIES;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    AudioEngine.fanfare();
    launchConfetti(26);
    AudioEngine.speak(`Surprise! Let's play ${pick.title}!`, 'cheer');
    launchActivity(pick.id);
  });
}

// Grown-Ups Gate Handlers
if ($('btn-grownups-unlock')) {
  const tryUnlock = () => {
    const val = Number($('grownups-math-input').value.trim());
    if (val === currentGrownupChallenge.a) {
      grownupsUnlocked = true;
      AudioEngine.correct();
      renderGrownupsGateState();
    } else {
      AudioEngine.wrong();
      $('grownups-math-input').value = '';
      $('grownups-math-input').focus();
    }
  };
  $('btn-grownups-unlock').addEventListener('click', tryUnlock);
  $('grownups-math-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });
}

if ($('btn-grownups-lock')) {
  $('btn-grownups-lock').addEventListener('click', () => {
    grownupsUnlocked = false;
    AudioEngine.pop();
    renderGrownupsGateState();
  });
}

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
  if (e.target.closest('.arcade-settings-panel') || e.target.closest('.arcade-settings-btn')) return;
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

$('btn-close-help').addEventListener('click', closeHelpModal);
$('btn-modal-ok').addEventListener('click', closeHelpModal);
$('btn-modal-learn').addEventListener('click', () => {
  closeHelpModal();
  learnController.open('math', profileStore.profile.ageBand || '6-8');
});
$('help-modal').addEventListener('click', (e) => {
  if (e.target === $('help-modal')) closeHelpModal();
});

// Topbar Sound, Voice & Quick Play
$('btn-sound').addEventListener('click', () => {
  AudioEngine.toggleMute();
  updateSoundBtn();
  updateVoiceBtn();
  if (storyController) {
    if (AudioEngine.isMuted()) storyController.narrator.stop();
    storyController._syncMuteUI();
  }
});

$('btn-voice').addEventListener('click', () => {
  const on = AudioEngine.toggleVoice();
  updateVoiceBtn();
  if (on) {
    const name = profileStore.profile.name;
    AudioEngine.speak(`Hi${name ? ', ' + name : ''}! Let's play and learn together!`, 'cheer');
  }
});

$('btn-quick-play').addEventListener('click', () => {
  const ageMeta = AGE_BAND_BY_ID[profileStore.profile.ageBand || '4-6'] || AGE_BAND_BY_ID['4-6'];
  $('opt-mix').checked = true;
  $('opt-keypad').checked = false;
  profileStore.recordRecent('math-add');
  mathQuest.startQuest(ageMeta.mathLevel, 'add', true);
});

// Interactive Buddy Companion
$('btn-pet-buddy').addEventListener('click', () => {
  AudioEngine.giggle();
  const btn = $('btn-pet-buddy');
  btn.classList.add('happy');
  setTimeout(() => btn.classList.remove('happy'), 350);
  const line = PET_LINES[Math.floor(Math.random() * PET_LINES.length)];
  $('pet-speech').textContent = line;
  AudioEngine.speak(line.replace(/[^\w\s!’']/g, ''));
});

$('btn-home-treasure').addEventListener('click', openTrophies);

$('btn-feed-buddy').addEventListener('click', () => {
  const profile = profileStore.profile;
  if (profile.stars < 5) {
    $('pet-speech').textContent = `Need ${5 - profile.stars} more ⭐ to buy a treat!`;
    AudioEngine.pop();
    return;
  }
  profile.stars -= 5;
  profile.hearts = (profile.hearts || 0) + 1;
  profileStore.save(profile);
  refreshHeader();
  AudioEngine.chomp();
  launchConfetti(22);
  spawnFloatingPop($('btn-pet-buddy'), '❤️ +1!');
  $('pet-speech').textContent = `Yum!! Thank you, ${profile.name || 'friend'}! ❤️ (${profile.hearts} hearts!)`;
  AudioEngine.speak('Yum! Thank you!');
});

$('btn-reset-progress').addEventListener('click', () => {
  const name = profileStore.profile.name;
  if (confirm(`Reset all stars, scores, and progress for ${name || 'this kid'}?`)) {
    profileStore.resetCurrent();
    refreshHeader();
    renderHomeLaunchpad();
    openTrophies();
  }
});

$('btn-copy-report').addEventListener('click', async () => {
  const profile = profileStore.profile;
  const { topics, overallPct } = buildReportSummary();
  const trText = TREASURE_ITEMS.map(
    (m) => `${m.emoji} ${m.short}: ${(profile.treasures && profile.treasures[m.id]) || 0}`
  ).join(' | ');
  const lines = [
    `PlaySpark Progress Report — ${profile.name || 'Kid'} (${getRankLabel(profile.stars)})`,
    `Stars: ${profile.stars} | Solved: ${profile.solved} | Overall Accuracy: ${overallPct}% | Blitz Best: ${profile.arcadeBest}`,
    `Treasure Chest: ${trText}`,
    ...topics.map(
      (t) => `${t.label}: ${t.pct === null ? 'Not tried' : `${t.pct}% (${t.correct}/${t.attempts})`} | Hints: ${t.hints}`
    )
  ];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    $('btn-copy-report').textContent = '✅ Copied!';
    setTimeout(() => {
      $('btn-copy-report').textContent = '📋 Copy Report';
    }, 1800);
  } catch (_) {
    alert(lines.join('\n'));
  }
});

// Kid Name, Age & Avatar Modal
let selectedAvatar = profileStore.profile.avatar || '🦁';
let selectedModalAge = profileStore.profile.ageBand || '4-6';

function openNameModal() {
  const profile = profileStore.profile;
  selectedAvatar = profile.avatar || '🦁';
  selectedModalAge = profile.ageBand || '4-6';
  $('kid-name-input').value = profile.name || '';
  document.querySelectorAll('.avatar-opt').forEach((b) => {
    b.classList.toggle('active', b.dataset.avatar === selectedAvatar);
  });
  document.querySelectorAll('[data-modal-age]').forEach((b) => {
    b.classList.toggle('active', b.dataset.modalAge === selectedModalAge);
  });

  const entries = Object.entries(profileStore.store.profiles).filter(([, p]) => p.name);
  const wrap = $('saved-profiles-wrap');
  const list = $('saved-profiles-list');
  list.innerHTML = '';
  if (entries.length > 0) {
    wrap.classList.remove('hidden');
    entries.forEach(([id, p]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'saved-profile-chip';
      chip.textContent = `${p.avatar || '🦁'} ${p.name} (${p.stars}⭐)`;
      chip.addEventListener('click', () => {
        profileStore.switchProfile(id);
        refreshHeader();
        renderHomeLaunchpad();
        closeNameModal();
        if (views.trophies.classList.contains('active')) openTrophies();
      });
      list.appendChild(chip);
    });
  } else {
    wrap.classList.add('hidden');
  }

  $('name-modal').classList.remove('hidden');
  setTimeout(() => $('kid-name-input').focus(), 50);
}

function closeNameModal() {
  $('name-modal').classList.add('hidden');
}

document.querySelectorAll('.avatar-opt').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedAvatar = btn.dataset.avatar;
    document.querySelectorAll('.avatar-opt').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    AudioEngine.pop();
  });
});

document.querySelectorAll('[data-modal-age]').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedModalAge = btn.dataset.modalAge;
    document.querySelectorAll('[data-modal-age]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    AudioEngine.pop();
  });
});

function saveKidName() {
  profileStore.saveNameAndAvatar($('kid-name-input').value, selectedAvatar, selectedModalAge);
  refreshHeader();
  renderHomeLaunchpad();
  closeNameModal();
  if (views.trophies.classList.contains('active')) openTrophies();
}

$('btn-save-name').addEventListener('click', saveKidName);
$('kid-name-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveKidName();
});
$('btn-close-name').addEventListener('click', closeNameModal);
$('btn-profile').addEventListener('click', openNameModal);
$('btn-switch-kid').addEventListener('click', openNameModal);

// Desktop Keyboard Support for Runners, Racer, Air-Trace & Word Builder
window.addEventListener('keydown', (e) => {
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

// PWA Install Prompt
let deferredPrompt = null;
const installBtn = $('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshedForUpdate) return;
      refreshedForUpdate = true;
      window.location.reload();
    });
    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => reg.update().catch(() => {}))
      .catch(() => {});
  });
}

hydrateStaticActivityCards();
refreshHeader();
renderHomeLaunchpad();
updateSoundBtn();
updateVoiceBtn();
if (!profileStore.profile.name) {
  openNameModal();
}
})(window.KidApp = window.KidApp || {});
