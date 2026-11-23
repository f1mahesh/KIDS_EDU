/* Kid Profile Store — Persistence, Ranks, Badges & Treasure Chest */

(function (app) {
  'use strict';

  const { TREASURE_BY_ID, pickRandomTreasure } = app;

const LEGACY_PROFILE_KEY = 'mathcube_3d_profile_v1';
const PROFILES_STORE_KEY = 'mathcube_3d_profiles_v2';

const RANKS = [
  { min: 0, label: '🌱 Number Sprout' },
  { min: 25, label: '🧱 Block Builder' },
  { min: 75, label: '🚀 Explorer Star' },
  { min: 150, label: '⭐ Star Captain' },
  { min: 300, label: '🧙 3D Learning Wizard' }
];

function createEmptyTreasures() {
  return { stone: 0, bronze: 0, gold: 0, jewel: 0, diamond: 0 };
}

function getTotalTreasures(profile) {
  const t = (profile && profile.treasures) || {};
  return (t.stone || 0) + (t.bronze || 0) + (t.gold || 0) + (t.jewel || 0) + (t.diamond || 0);
}

const BADGES = [
  { id: 'first_star', emoji: '🌟', name: 'First Star', req: 'Earn 1 star', check: (p) => p.stars >= 1 },
  { id: 'streak_5', emoji: '🔥', name: 'Hot Streak', req: '5 in a row', check: (p) => p.bestStreak >= 5 },
  { id: 'streak_10', emoji: '⚡', name: 'Unstoppable', req: '10 in a row', check: (p) => p.bestStreak >= 10 },
  { id: 'solved_25', emoji: '🧩', name: 'Puzzle Kid', req: 'Solve 25 tasks', check: (p) => p.solved >= 25 },
  { id: 'solved_100', emoji: '🎓', name: 'Super Scholar', req: 'Solve 100 tasks', check: (p) => p.solved >= 100 },
  { id: 'arcade_10', emoji: '🏎️', name: 'Speed Racer', req: 'Score 10+ in Blitz', check: (p) => p.arcadeBest >= 10 },
  {
    id: 'english_10',
    emoji: '📖',
    name: 'Word Wizard',
    req: 'Solve 10 English words',
    check: (p) => (p.stats && p.stats.en ? p.stats.en.correct >= 10 : false)
  },
  {
    id: 'treasure_10',
    emoji: '🪙',
    name: 'Treasure Hunter',
    req: 'Collect 10 treasures',
    check: (p) => getTotalTreasures(p) >= 10
  },
  {
    id: 'diamond_finder',
    emoji: '💎',
    name: 'Diamond Finder',
    req: 'Find 1 Diamond',
    check: (p) => Boolean(p.treasures && p.treasures.diamond >= 1)
  },
  {
    id: 'all_materials',
    emoji: '🏴‍☠️',
    name: 'Master Collector',
    req: 'Collect all 5 materials',
    check: (p) =>
      Boolean(
        p.treasures &&
          p.treasures.stone >= 1 &&
          p.treasures.bronze >= 1 &&
          p.treasures.gold >= 1 &&
          p.treasures.jewel >= 1 &&
          p.treasures.diamond >= 1
      )
  }
];

function createEmptyProfile(name = '', avatar = '🦁') {
  return {
    name,
    avatar,
    stars: 0,
    hearts: 0,
    solved: 0,
    bestStreak: 0,
    arcadeBest: 0,
    rockBest: 0,
    treasures: createEmptyTreasures(),
    stats: {
      add: { attempts: 0, correct: 0, hints: 0 },
      sub: { attempts: 0, correct: 0, hints: 0 },
      mul: { attempts: 0, correct: 0, hints: 0 },
      en: { attempts: 0, correct: 0, hints: 0 }
    }
  };
}

function ensureProfileShape(p) {
  const base = createEmptyProfile(p.name || '', p.avatar || '🦁');
  return {
    ...base,
    ...p,
    treasures: { ...base.treasures, ...(p.treasures || {}) },
    stats: {
      add: { ...base.stats.add, ...(p.stats && p.stats.add) },
      sub: { ...base.stats.sub, ...(p.stats && p.stats.sub) },
      mul: { ...base.stats.mul, ...(p.stats && p.stats.mul) },
      en: { ...base.stats.en, ...(p.stats && p.stats.en) }
    }
  };
}

function getRankLabel(stars) {
  let rank = RANKS[0].label;
  for (const r of RANKS) {
    if (stars >= r.min) rank = r.label;
  }
  return rank;
}

class ProfileStore {
  constructor() {
    this.store = this._load();
    this.profile = ensureProfileShape(this.store.profiles[this.store.activeId] || createEmptyProfile());
    this.currentStreak = 0;
  }

  _load() {
    try {
      const raw = localStorage.getItem(PROFILES_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profiles) return parsed;
      }
      const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacy) {
        const p = ensureProfileShape(JSON.parse(legacy));
        return { activeId: 'default', profiles: { default: p } };
      }
    } catch (_) {}
    return { activeId: 'default', profiles: { default: createEmptyProfile() } };
  }

  save(nextProfile = this.profile) {
    this.profile = ensureProfileShape(nextProfile);
    this.store.profiles[this.store.activeId] = this.profile;
    localStorage.setItem(PROFILES_STORE_KEY, JSON.stringify(this.store));
    return this.profile;
  }

  switchProfile(id) {
    this.store.activeId = id;
    this.profile = ensureProfileShape(this.store.profiles[id] || createEmptyProfile());
    this.currentStreak = 0;
    this.save(this.profile);
    return this.profile;
  }

  saveNameAndAvatar(rawName, avatar) {
    const cleanName = rawName.trim() || 'Explorer';
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default';
    if (!this.store.profiles[slug]) {
      if (!this.profile.name && this.store.activeId === 'default') {
        delete this.store.profiles.default;
      }
      this.store.activeId = slug;
      this.profile = this.profile.name
        ? createEmptyProfile(cleanName, avatar)
        : { ...this.profile, name: cleanName, avatar };
    } else {
      this.store.activeId = slug;
      this.profile = ensureProfileShape(this.store.profiles[slug]);
      this.profile.name = cleanName;
      this.profile.avatar = avatar;
    }
    this.save(this.profile);
    return this.profile;
  }

  resetCurrent() {
    const keepName = this.profile.name;
    const keepAvatar = this.profile.avatar;
    this.profile = createEmptyProfile(keepName, keepAvatar);
    this.currentStreak = 0;
    this.save(this.profile);
    return this.profile;
  }

  recordAttempt(statKey, isCorrect) {
    const stat = this.profile.stats[statKey];
    if (stat) {
      stat.attempts += 1;
      if (isCorrect) stat.correct += 1;
    }
    if (isCorrect) {
      this.profile.solved += 1;
    }
    this.save(this.profile);
  }

  recordHint(statKey) {
    const stat = this.profile.stats[statKey];
    if (stat) {
      stat.hints += 1;
      this.save(this.profile);
    }
  }

  awardTreasure(materialId = null, awardStars = true) {
    const mat = (materialId && TREASURE_BY_ID[materialId]) || pickRandomTreasure();
    if (!this.profile.treasures) {
      this.profile.treasures = createEmptyTreasures();
    }
    this.profile.treasures[mat.id] = (this.profile.treasures[mat.id] || 0) + 1;
    if (awardStars) {
      this.profile.stars += mat.stars;
    }
    this.save(this.profile);
    return mat;
  }
}

  app.RANKS = RANKS;
  app.createEmptyTreasures = createEmptyTreasures;
  app.getTotalTreasures = getTotalTreasures;
  app.BADGES = BADGES;
  app.createEmptyProfile = createEmptyProfile;
  app.ensureProfileShape = ensureProfileShape;
  app.getRankLabel = getRankLabel;
  app.ProfileStore = ProfileStore;
})(window.KidApp = window.KidApp || {});
