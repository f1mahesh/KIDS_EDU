import { useState } from 'react';
import { KidProfile, getKidApp } from '../types/kidapp';

interface ChartsInsightsViewProps {
  profile: KidProfile;
  onOpenProfileModal: () => void;
  onPracticeTopic: (key: string) => void;
}

const TOPIC_META = [
  { key: 'add', label: '➕ Addition', color: '#10b981' },
  { key: 'sub', label: '➖ Subtraction', color: '#f97316' },
  { key: 'mul', label: '✖️ Multiplication', color: '#8b5cf6' },
  { key: 'en', label: '📖 English Phonics', color: '#14b8a6' }
];

const GROWNUP_CHALLENGES = [
  { q: '3 × 4 = ?', a: 12 },
  { q: '4 × 6 = ?', a: 24 },
  { q: '7 × 3 = ?', a: 21 },
  { q: '5 × 6 = ?', a: 30 },
  { q: '8 × 4 = ?', a: 32 }
];

export function ChartsInsightsView({
  profile,
  onOpenProfileModal,
  onPracticeTopic
}: ChartsInsightsViewProps) {
  const app = getKidApp();
  const ranks = app?.RANKS ?? [];
  const badges = app?.BADGES ?? [];
  const treasures = app?.TREASURE_ITEMS ?? [];
  const rankLabel = app?.getRankLabel(profile.stars) ?? '🌱 Number Sprout';

  const [unlocked, setUnlocked] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(() =>
    Math.floor(Math.random() * GROWNUP_CHALLENGES.length)
  );
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [copied, setCopied] = useState(false);

  const challenge = GROWNUP_CHALLENGES[challengeIdx];

  const nextRank = ranks.find((r) => profile.stars < r.min);
  const prevRankMin = [...ranks].reverse().find((r) => profile.stars >= r.min)?.min ?? 0;
  const rankPct = nextRank
    ? Math.max(
        6,
        Math.min(100, Math.round(((profile.stars - prevRankMin) / (nextRank.min - prevRankMin)) * 100))
      )
    : 100;

  let totalAttempts = 0;
  let totalCorrect = 0;
  const topics = TOPIC_META.map((t) => {
    const s = profile.stats?.[t.key] || { attempts: 0, correct: 0, hints: 0 };
    totalAttempts += s.attempts;
    totalCorrect += s.correct;
    const pct = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null;
    return { ...t, ...s, pct };
  });
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const practiced = topics.filter((t) => t.attempts > 0);
  const strong = practiced.filter((t) => (t.pct ?? 0) >= 80);
  const needFocus = practiced.filter((t) => (t.pct ?? 0) < 80);
  const unpracticed = topics.filter((t) => t.attempts === 0);

  const tryUnlock = () => {
    if (Number(gateInput.trim()) === challenge.a) {
      app?.AudioEngine.correct();
      setUnlocked(true);
      setGateError(false);
      setGateInput('');
    } else {
      app?.AudioEngine.wrong();
      setGateError(true);
      setGateInput('');
    }
  };

  const handleCopyReport = async () => {
    const trText = treasures
      .map((m) => `${m.emoji} ${m.short}: ${(profile.treasures && profile.treasures[m.id]) || 0}`)
      .join(' | ');
    const lines = [
      `PlaySpark Progress Report — ${profile.name || 'Kid'} (${rankLabel})`,
      `Stars: ${profile.stars} | Solved: ${profile.solved} | Overall Accuracy: ${overallPct}% | Blitz Best: ${profile.arcadeBest}`,
      `Treasure Chest: ${trText}`,
      ...topics.map(
        (t) =>
          `${t.label}: ${
            t.pct === null ? 'Not tried' : `${t.pct}% (${t.correct}/${t.attempts})`
          } | Hints: ${t.hints}`
      )
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert(lines.join('\n'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Kid Banner & Rank Progress */}
      <section className="liquid-glass rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-3xl">
              {profile.avatar || '🦁'}
            </span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                {profile.name || 'Math Explorer'}
              </h1>
              <p className="text-xs font-semibold opacity-75">{rankLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfileModal}
            className="liquid-glass min-h-[44px] rounded-full px-4 text-xs font-bold transition hover:brightness-105 active:scale-[0.98]"
          >
            ✏️ Switch Kid
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
            <span className="opacity-75">
              {nextRank ? `Next: ${nextRank.label} (${nextRank.min} ⭐)` : '👑 Max Rank Unlocked!'}
            </span>
            <span className="tabular-nums">{rankPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${rankPct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="liquid-glass rounded-2xl p-3 text-center">
            <div className="tabular-nums text-xl font-extrabold">{profile.stars}</div>
            <div className="text-xs font-semibold opacity-70">Total Stars</div>
          </div>
          <div className="liquid-glass rounded-2xl p-3 text-center">
            <div className="tabular-nums text-xl font-extrabold">{profile.solved}</div>
            <div className="text-xs font-semibold opacity-70">Tasks Solved</div>
          </div>
          <div className="liquid-glass rounded-2xl p-3 text-center">
            <div className="tabular-nums text-xl font-extrabold">{overallPct}%</div>
            <div className="text-xs font-semibold opacity-70">Accuracy</div>
          </div>
          <div className="liquid-glass rounded-2xl p-3 text-center">
            <div className="tabular-nums text-xl font-extrabold">{profile.arcadeBest}</div>
            <div className="text-xs font-semibold opacity-70">Blitz Best</div>
          </div>
        </div>
      </section>

      {/* Treasure Chest & Badges */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="liquid-glass rounded-[26px] p-4 sm:p-5 lg:col-span-5">
          <h2 className="text-base font-extrabold tracking-tight">🏴‍☠️ Treasure Chest</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {treasures.map((mat) => {
              const count = (profile.treasures && profile.treasures[mat.id]) || 0;
              return (
                <div
                  key={mat.id}
                  className={`flex flex-col items-center rounded-2xl border p-2.5 text-center ${
                    count > 0
                      ? 'border-amber-400/50 bg-amber-400/15'
                      : 'border-slate-400/20 bg-black/5 opacity-60 dark:bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{mat.emoji}</span>
                  <span className="tabular-nums mt-1 text-sm font-extrabold">{count}</span>
                  <span className="text-[10px] font-semibold opacity-75">{mat.short}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="liquid-glass rounded-[26px] p-4 sm:p-5 lg:col-span-7">
          <h2 className="text-base font-extrabold tracking-tight">🏆 Sticker Badges</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {badges.map((b) => {
              const isUnlocked = b.check(profile);
              return (
                <div
                  key={b.id}
                  className={`flex flex-col items-center rounded-2xl border p-2.5 text-center ${
                    isUnlocked
                      ? 'border-emerald-400/50 bg-emerald-400/15'
                      : 'border-slate-400/20 bg-black/5 opacity-55 dark:bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="mt-1 text-xs font-extrabold">{b.name}</span>
                  <span className="mt-0.5 text-[10px] font-semibold opacity-75">
                    {isUnlocked ? 'Unlocked!' : b.req}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Kid-Safe Grown-Ups Corner */}
      <section className="liquid-glass rounded-[26px] p-4 sm:p-5">
        {!unlocked ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                🔒
              </span>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  👨‍👩‍👧 Grown-Ups Corner
                </h2>
                <p className="text-xs opacity-70">
                  Solve to view topic accuracy breakdown &amp; progress insights
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-extrabold text-indigo-700 dark:text-indigo-200">
                {challenge.q}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') tryUnlock();
                }}
                placeholder="?"
                aria-label="Grown-up verification answer"
                className="tabular-nums min-h-[44px] w-20 rounded-xl border border-slate-400/40 bg-white/70 px-3 text-center text-sm font-extrabold dark:bg-black/30"
              />
              <button
                type="button"
                onClick={tryUnlock}
                className="min-h-[44px] rounded-full bg-indigo-600 px-4 text-xs font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]"
              >
                🔓 Unlock
              </button>
              {gateError && (
                <span className="text-xs font-bold text-rose-500">Try again!</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold tracking-tight">
                📊 Grown-Up Progress Report
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="liquid-glass min-h-[40px] rounded-full px-3 text-xs font-bold transition hover:brightness-105"
                >
                  {copied ? '✅ Copied!' : '📋 Copy Report'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnlocked(false);
                    setChallengeIdx(Math.floor(Math.random() * GROWNUP_CHALLENGES.length));
                  }}
                  className="liquid-glass min-h-[40px] rounded-full px-3 text-xs font-bold transition hover:brightness-105"
                >
                  🔒 Lock
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 p-3.5">
                <h3 className="text-sm font-extrabold">🌟 Doing Well</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs opacity-85">
                  {practiced.length === 0 ? (
                    <li>Play a quick round to discover strengths!</li>
                  ) : strong.length > 0 ? (
                    strong.map((t) => (
                      <li key={t.key} className="tabular-nums">
                        {t.label}: {t.pct}% accuracy ({t.correct}/{t.attempts})
                      </li>
                    ))
                  ) : (
                    <li>
                      Best so far: {[...practiced].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))[0].label}
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3.5">
                <h3 className="text-sm font-extrabold">🎯 Where to Focus</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs opacity-85">
                  {practiced.length === 0 ? (
                    <li>Try 3D Math Quests or English Phonics!</li>
                  ) : needFocus.length > 0 ? (
                    needFocus.map((t) => (
                      <li key={t.key} className="tabular-nums">
                        {t.label} ({t.pct}% accuracy) — try Starter level or Mini Lessons!
                      </li>
                    ))
                  ) : unpracticed.length > 0 ? (
                    unpracticed.map((t) => <li key={t.key}>Not tried yet: {t.label}</li>)
                  ) : (
                    <li>Awesome! 80%+ in every topic — try Master level!</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {topics.map((t) => (
                <div key={t.key} className="liquid-glass rounded-2xl p-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.label}</span>
                    <span className="tabular-nums opacity-80">
                      {t.pct === null ? 'Not tried yet' : `${t.pct}% (${t.correct}/${t.attempts})`}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.pct ?? 0}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="tabular-nums opacity-70">Hints used: {t.hints}</span>
                    <button
                      type="button"
                      onClick={() => onPracticeTopic(t.key)}
                      className="min-h-[34px] rounded-full bg-indigo-600 px-3 text-xs font-bold text-white transition hover:brightness-105"
                    >
                      ▶ Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
