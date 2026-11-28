import { useEffect, useRef, useState } from 'react';
import {
  ActivityItem,
  AgeBandId,
  AgeBandMeta,
  KidProfile,
  getKidApp
} from '../types/kidapp';

export type ContextFilter = 'recommended' | 'english' | 'math' | 'fun' | 'touch' | 'ar' | 'all';

interface HomeFourZoneViewProps {
  profile: KidProfile;
  activities: ActivityItem[];
  ageBands: AgeBandMeta[];
  searchQuery: string;
  contextFilter: ContextFilter;
  isCompact: boolean;
  onSelectAgeBand: (band: AgeBandId) => void;
  onResetFilter: () => void;
  onLaunchActivity: (id: string) => void;
  onToggleFavorite: (id: string, el: HTMLElement | null) => void;
  onOpenWorld: (world: 'math' | 'english' | 'funGames') => void;
  onOpenLearn: (subject: 'math' | 'english') => void;
  onOpenCharts: () => void;
  onQuickMath: () => void;
  onSurpriseMe: () => void;
  onPetBuddy: () => string;
  onFeedBuddy: () => { ok: boolean; message: string };
}

const CARD_ACCENTS: Record<string, string> = {
  english: 'from-teal-500 to-emerald-500',
  math: 'from-indigo-500 to-violet-500',
  fun: 'from-amber-500 to-rose-500'
};

const FILTER_TITLES: Record<ContextFilter, string> = {
  recommended: '🌟 Recommended For You',
  english: '📖 ABC & Reading Games',
  math: '🔢 123 & Math Games',
  fun: '🎨 Play & Stories',
  touch: '✋ Quiet Touch Games',
  ar: '📷 Camera AR Games',
  all: '✨ All Adventures'
};

export function HomeFourZoneView({
  profile,
  activities,
  ageBands,
  searchQuery,
  contextFilter,
  isCompact,
  onSelectAgeBand,
  onResetFilter,
  onLaunchActivity,
  onToggleFavorite,
  onOpenWorld,
  onOpenLearn,
  onOpenCharts,
  onQuickMath,
  onSurpriseMe,
  onPetBuddy,
  onFeedBuddy
}: HomeFourZoneViewProps) {
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [buddySpeech, setBuddySpeech] = useState(
    'Tap me! Earn 5 ⭐ to feed me a yummy treat!'
  );
  const [buddyHappy, setBuddyHappy] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const isFiltered = contextFilter !== 'recommended' || query.length > 0;

  useEffect(() => {
    const app = getKidApp();
    if (!app?.bridge) return;
    if (!isFiltered && heroCanvasRef.current) {
      app.bridge.mountHeroCanvas(heroCanvasRef.current);
    } else {
      app.bridge.mountHeroCanvas(null);
    }
    return () => {
      app.bridge?.mountHeroCanvas(null);
    };
  }, [isFiltered, activities.length]);

  const app = getKidApp();
  const rankLabel = app?.getRankLabel(profile.stars) ?? '🌱 Number Sprout';
  const totalTreasures = app?.getTotalTreasures(profile) ?? 0;

  const recentId = profile.recent?.[0]?.id;
  const continueActivity =
    activities.find((a) => a.id === recentId) ||
    activities.find((a) => a.ages.includes(profile.ageBand || '4-6')) ||
    activities[0];

  const favoriteActivities = (profile.favorites || [])
    .map((id) => activities.find((a) => a.id === id))
    .filter((a): a is ActivityItem => Boolean(a));

  const filteredActivities = activities.filter((act) => {
    if (query) {
      const hay = `${act.title} ${act.shortDesc} ${act.badge} ${act.category}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (contextFilter === 'all') return true;
    if (contextFilter === 'recommended') return act.ages.includes(profile.ageBand || '4-6');
    if (contextFilter === 'touch' || contextFilter === 'ar') return act.style === contextFilter;
    return act.category === contextFilter;
  });

  const worldSquircles = [
    {
      id: 'english',
      emoji: '📖',
      label: 'ABC & Read',
      metric: `${activities.filter((a) => a.category === 'english').length} Games`,
      gradient: 'from-teal-500 to-cyan-500',
      onClick: () => onOpenWorld('english')
    },
    {
      id: 'math',
      emoji: '🔢',
      label: '123 & Math',
      metric: `${activities.filter((a) => a.category === 'math').length} Games`,
      gradient: 'from-indigo-500 to-purple-500',
      onClick: () => onOpenWorld('math')
    },
    {
      id: 'fun',
      emoji: '🎨',
      label: 'Play & Story',
      metric: `${activities.filter((a) => a.category === 'fun').length} Fun`,
      gradient: 'from-pink-500 to-orange-500',
      onClick: () => onOpenWorld('funGames')
    },
    {
      id: 'learn',
      emoji: '📚',
      label: 'Guides',
      metric: 'Math & ABC',
      gradient: 'from-emerald-500 to-teal-500',
      onClick: () => onOpenLearn('math')
    },
    {
      id: 'trophies',
      emoji: '🏆',
      label: 'Trophies',
      metric: `${totalTreasures} Gems`,
      gradient: 'from-amber-500 to-yellow-500',
      onClick: onOpenCharts
    }
  ];

  const handlePet = () => {
    const line = onPetBuddy();
    setBuddySpeech(line);
    setBuddyHappy(true);
    setTimeout(() => setBuddyHappy(false), 380);
  };

  const handleFeed = () => {
    const res = onFeedBuddy();
    setBuddySpeech(res.message);
  };

  const renderActivityCard = (act: ActivityItem) => {
    const isFav = (profile.favorites || []).includes(act.id);
    const gradient = CARD_ACCENTS[act.category] || CARD_ACCENTS.math;
    return (
      <div
        key={act.id}
        onClick={() => onLaunchActivity(act.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onLaunchActivity(act.id);
          }
        }}
        role="button"
        tabIndex={0}
        className="liquid-glass flex min-h-[60px] cursor-pointer items-center gap-3 rounded-[18px] p-2.5 transition duration-200 hover:brightness-105 active:scale-[0.99]"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br ${gradient} text-lg text-white shadow-sm`}
        >
          {act.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold tracking-tight">{act.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs opacity-75">
            <span className="truncate">{act.shortDesc}</span>
            <span>•</span>
            <span className="font-semibold">
              {act.style === 'ar' ? '📷 Camera AR' : '✋ Touch'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-bold opacity-80 sm:inline-block dark:bg-white/10">
            {act.badge}
          </span>
          <button
            type="button"
            aria-label={`Favorite ${act.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(act.id, e.currentTarget);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-base transition hover:scale-110 active:scale-95 dark:bg-white/10"
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        isCompact || isFiltered ? '' : 'lg:grid-cols-12 lg:items-start lg:gap-5'
      }`}
    >
      {/* HOME-ONLY COMPACT HERO + BUDDY + SQUIRCLE SHELF (Hidden when filtering or searching) */}
      {!isFiltered && (
        <div className={`flex flex-col gap-3.5 ${isCompact ? '' : 'lg:col-span-5'}`}>
          {/* COMPACT ZONE 2: HERO BANNER */}
          <section
            aria-labelledby="home-hero-heading"
            className="liquid-glass rounded-[24px] p-3.5 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                {rankLabel}
              </span>
              <div className="flex items-center gap-1 rounded-full bg-black/5 p-0.5 dark:bg-white/10">
                {ageBands.map((band) => {
                  const active = (profile.ageBand || '4-6') === band.id;
                  return (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => onSelectAgeBand(band.id)}
                      className={`min-h-[30px] rounded-full px-2 text-[11px] font-bold transition duration-200 active:scale-[0.98] ${
                        active ? 'liquid-glass-active' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {band.emoji} {band.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1
                  id="home-hero-heading"
                  className="text-lg font-extrabold tracking-tight sm:text-xl"
                >
                  {profile.name ? `Hi ${profile.name}! Let's Play!` : "Let's Play!"}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSurpriseMe}
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-xs font-bold text-white shadow-sm transition duration-200 hover:brightness-105 active:scale-[0.98]"
                  >
                    🎲 Surprise
                  </button>
                  <button
                    type="button"
                    onClick={onQuickMath}
                    className="liquid-glass inline-flex min-h-[38px] items-center gap-1 rounded-full px-3.5 text-xs font-bold transition duration-200 hover:brightness-105 active:scale-[0.98]"
                  >
                    🚀 Quick Math
                  </button>
                </div>
              </div>

              <canvas
                ref={heroCanvasRef}
                id="hero-3d-canvas"
                width={112}
                height={84}
                aria-label="Interactive 3D Math Cubes"
                className="shrink-0 cursor-grab rounded-2xl bg-indigo-500/10 active:cursor-grabbing dark:bg-indigo-400/10"
              />
            </div>

            {continueActivity && (
              <button
                type="button"
                onClick={() => onLaunchActivity(continueActivity.id)}
                className="mt-2.5 flex w-full items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-sky-500/90 p-2.5 text-left text-white shadow-sm transition duration-200 hover:brightness-105 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
                  {continueActivity.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                    {recentId ? '⚡ Jump Back In' : '🌟 First Pick'}
                  </div>
                  <div className="truncate text-xs font-extrabold">{continueActivity.title}</div>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-900">
                  ▶ Play
                </span>
              </button>
            )}
          </section>

          {/* Compact Buddy Companion Strip */}
          <section
            aria-label="Buddy Companion"
            className="liquid-glass flex items-center gap-2.5 rounded-[20px] p-2.5"
          >
            <button
              type="button"
              onClick={handlePet}
              title="Tap your buddy!"
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-xl transition duration-200 hover:brightness-105 active:scale-95 ${
                buddyHappy ? 'scale-110' : ''
              }`}
            >
              <span>{profile.avatar || '🦁'}</span>
              <span className="tabular-nums absolute -bottom-1 -right-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                ❤️ {profile.hearts || 0}
              </span>
            </button>
            <p className="min-w-0 flex-1 text-xs font-semibold leading-snug opacity-85">
              {buddySpeech}
            </p>
            <button
              type="button"
              onClick={handleFeed}
              disabled={profile.stars < 5}
              className="tabular-nums min-h-[36px] shrink-0 rounded-full bg-amber-500 px-3 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
            >
              🧁 5⭐
            </button>
          </section>

          {/* ZONE 3: QUICK-ACCESS SQUIRCLE SHELF */}
          <section aria-label="Worlds and Favorites">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wider opacity-75">
                ✨ Worlds
              </h2>
            </div>

            <div
              className={
                isCompact
                  ? 'no-scrollbar flex gap-2.5 overflow-x-auto pb-1'
                  : 'no-scrollbar flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible'
              }
            >
              {worldSquircles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={tile.onClick}
                  className="liquid-glass flex min-w-[106px] shrink-0 flex-col items-start gap-1.5 rounded-[18px] p-3 text-left transition duration-200 hover:brightness-105 active:scale-[0.98] md:min-w-0"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br ${tile.gradient} text-lg text-white shadow-sm`}
                  >
                    {tile.emoji}
                  </span>
                  <span className="line-clamp-1 text-[11px] font-semibold opacity-75">
                    {tile.label}
                  </span>
                  <span className="tabular-nums text-xs font-extrabold tracking-tight">
                    {tile.metric}
                  </span>
                </button>
              ))}
            </div>

            {favoriteActivities.length > 0 && (
              <div className="mt-2.5">
                <div className="mb-1 px-1 text-xs font-bold opacity-75">❤️ My Favorites</div>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {favoriteActivities.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => onLaunchActivity(act.id)}
                      className="liquid-glass flex min-w-[124px] shrink-0 items-center gap-2 rounded-[14px] px-2.5 py-2 text-left transition duration-200 hover:brightness-105 active:scale-[0.98]"
                    >
                      <span className="text-base">{act.emoji}</span>
                      <span className="line-clamp-1 text-xs font-bold">{act.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ZONE 4: FILTERED / RECOMMENDED GAMES FEED */}
      <section
        aria-label="Activities Feed"
        className={`liquid-glass rounded-[26px] p-4 sm:p-5 ${
          isCompact || isFiltered ? '' : 'lg:col-span-7'
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">
              {query ? `🔍 Results for "${searchQuery}"` : FILTER_TITLES[contextFilter]}
            </h2>
            {!isFiltered && (
              <p className="text-xs opacity-65">Tap any game or ❤️ to pin to Favorites</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilter}
                className="liquid-glass min-h-[34px] rounded-full px-3 text-xs font-bold transition hover:brightness-105 active:scale-[0.98]"
              >
                ← Home
              </button>
            )}
            <span className="tabular-nums rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold opacity-75 dark:bg-white/10">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'game' : 'games'}
            </span>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-400/35 p-8 text-center">
            <div className="text-3xl">🔍</div>
            <p className="mt-2 text-sm font-bold">No matching games found</p>
            <p className="mt-1 text-xs opacity-70">
              Try clearing your search or switching back to Home.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-2.5 ${
              isFiltered && !isCompact ? 'md:grid-cols-2' : ''
            }`}
          >
            {filteredActivities.map(renderActivityCard)}
          </div>
        )}
      </section>
    </div>
  );
}
