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

export function HomeFourZoneView({
  profile,
  activities,
  ageBands,
  searchQuery,
  contextFilter,
  isCompact,
  onSelectAgeBand,
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

  useEffect(() => {
    const app = getKidApp();
    if (heroCanvasRef.current && app?.bridge) {
      app.bridge.mountHeroCanvas(heroCanvasRef.current);
    }
  }, [activities.length]);

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

  const query = searchQuery.trim().toLowerCase();
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

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        isCompact ? '' : 'lg:grid-cols-12 lg:items-start lg:gap-5'
      }`}
    >
      {/* LEFT COLUMN (Desktop >=1024px: 5/12) -> Zone 2 Hero + Buddy + Zone 3 Squircle Shelf */}
      <div className={`flex flex-col gap-4 ${isCompact ? '' : 'lg:col-span-5'}`}>
        {/* ZONE 2: HERO SUMMARY & PRIMARY ACTION CARD */}
        <section
          aria-labelledby="home-hero-heading"
          className="liquid-glass rounded-[28px] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
              {rankLabel}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
              {ageBands.map((band) => {
                const active = (profile.ageBand || '4-6') === band.id;
                return (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => onSelectAgeBand(band.id)}
                    className={`min-h-[34px] rounded-full px-2.5 text-xs font-bold transition duration-200 active:scale-[0.98] ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    {band.emoji} {band.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <h1
                id="home-hero-heading"
                className="text-xl font-extrabold tracking-tight sm:text-2xl"
              >
                {profile.name ? `Hi ${profile.name}! Let's Play!` : "Let's Play & Learn Together!"}
              </h1>
              <p className="mt-1 text-xs leading-relaxed opacity-75 sm:text-sm">
                Spin the 3D cubes, jump back into a favorite, or roll a surprise quest.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSurpriseMe}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-bold text-white shadow-md transition duration-200 hover:brightness-105 active:scale-[0.98]"
                >
                  🎲 Surprise Me!
                </button>
                <button
                  type="button"
                  onClick={onQuickMath}
                  className="liquid-glass inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-bold transition duration-200 hover:brightness-105 active:scale-[0.98]"
                >
                  🚀 Quick Math
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <canvas
                ref={heroCanvasRef}
                id="hero-3d-canvas"
                width={200}
                height={150}
                aria-label="Interactive 3D Math Cubes"
                className="cursor-grab rounded-2xl bg-indigo-500/10 active:cursor-grabbing dark:bg-indigo-400/10"
              />
              <span className="mt-1 text-[11px] font-semibold opacity-65">
                👆 Spin 3D Blocks!
              </span>
            </div>
          </div>

          {/* Jump Back In Pill */}
          {continueActivity && (
            <button
              type="button"
              onClick={() => onLaunchActivity(continueActivity.id)}
              className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-sky-500/90 p-3 text-left text-white shadow-md transition duration-200 hover:brightness-105 active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
                {continueActivity.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  {recentId ? '⚡ Jump Back In' : '🌟 Great First Pick'}
                </div>
                <div className="truncate text-sm font-extrabold">{continueActivity.title}</div>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-900">
                ▶ Play
              </span>
            </button>
          )}
        </section>

        {/* Interactive Buddy Companion Strip */}
        <section
          aria-label="Buddy Companion"
          className="liquid-glass flex items-center gap-3 rounded-[22px] p-3"
        >
          <button
            type="button"
            onClick={handlePet}
            title="Tap your buddy!"
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-2xl transition duration-200 hover:brightness-105 active:scale-95 ${
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
            className="tabular-nums min-h-[40px] shrink-0 rounded-full bg-amber-500 px-3 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
          >
            🧁 5⭐
          </button>
        </section>

        {/* ZONE 3: QUICK-ACCESS SQUIRCLE SHELF */}
        <section aria-label="Worlds and Favorites">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold tracking-tight opacity-85">
              ✨ Worlds &amp; Quick Access
            </h2>
            <span className="text-xs font-medium opacity-60">Tap any tile</span>
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
                className="liquid-glass flex min-w-[114px] shrink-0 flex-col items-start gap-2 rounded-[18px] p-3.5 text-left transition duration-200 hover:brightness-105 active:scale-[0.98] md:min-w-0"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br ${tile.gradient} text-xl text-white shadow-sm`}
                >
                  {tile.emoji}
                </span>
                <span className="line-clamp-1 text-xs font-semibold opacity-75">
                  {tile.label}
                </span>
                <span className="tabular-nums text-sm font-extrabold tracking-tight">
                  {tile.metric}
                </span>
              </button>
            ))}
          </div>

          {favoriteActivities.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-xs font-bold opacity-75">❤️ My Favorites</span>
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {favoriteActivities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => onLaunchActivity(act.id)}
                    className="liquid-glass flex min-w-[130px] shrink-0 items-center gap-2 rounded-[16px] px-3 py-2 text-left transition duration-200 hover:brightness-105 active:scale-[0.98]"
                  >
                    <span className="text-lg">{act.emoji}</span>
                    <span className="line-clamp-1 text-xs font-bold">{act.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* RIGHT COLUMN (Desktop >=1024px: 7/12) -> Zone 4 Grouped Activity Feed */}
      <section
        aria-label="Activities Feed"
        className={`liquid-glass rounded-[28px] p-4 sm:p-5 ${isCompact ? '' : 'lg:col-span-7'}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">
              🎯 Pick How You Play
            </h2>
            <p className="text-xs opacity-65">
              {query
                ? `Matching "${searchQuery}"`
                : 'Tap any adventure or tap ❤️ to pin a favorite'}
            </p>
          </div>
          <span className="tabular-nums rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold opacity-75 dark:bg-white/10">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'game' : 'games'}
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-400/35 p-8 text-center">
            <div className="text-3xl">🔍</div>
            <p className="mt-2 text-sm font-bold">No matching games found</p>
            <p className="mt-1 text-xs opacity-70">
              Try clearing your search or switching the category pill above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredActivities.map((act) => {
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
                  className="liquid-glass flex min-h-[64px] cursor-pointer items-center gap-3 rounded-[20px] p-3 transition duration-200 hover:brightness-105 active:scale-[0.99]"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${gradient} text-xl text-white shadow-sm`}
                  >
                    {act.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold tracking-tight">
                      {act.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs opacity-75">
                      <span className="truncate">{act.shortDesc}</span>
                      <span>•</span>
                      <span className="font-semibold">
                        {act.style === 'ar' ? '📷 Camera AR' : '✋ Quiet Touch'}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-base transition hover:scale-110 active:scale-95 dark:bg-white/10"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
