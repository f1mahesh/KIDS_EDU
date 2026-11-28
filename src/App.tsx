import { useCallback, useEffect, useRef, useState } from 'react';
import { AdaptiveOverlay } from './components/AdaptiveOverlay';
import { ChartsInsightsView } from './components/ChartsInsightsView';
import { DevicePreviewShell, PreviewDevice } from './components/DevicePreviewShell';
import { ContextFilter, HomeFourZoneView } from './components/HomeFourZoneView';
import { LegacyGamesHost } from './components/LegacyGamesHost';
import { PwaSettingsView } from './components/PwaSettingsView';
import { RefractiveBackdrop } from './components/RefractiveBackdrop';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { usePwaSetup } from './pwa/usePwaSetup';
import { AgeBandId, HelpTopicData, KidProfile, getKidApp } from './types/kidapp';

type NavTab = 'home' | 'charts' | 'settings';

const THEME_STORAGE_KEY = 'playspark_glass_theme';

const CONTEXT_PILLS: Array<{ id: ContextFilter; label: string }> = [
  { id: 'recommended', label: '🌟 For Me' },
  { id: 'english', label: '📖 ABC' },
  { id: 'math', label: '🔢 123' },
  { id: 'fun', label: '🎨 Play' },
  { id: 'touch', label: '✋ Touch' },
  { id: 'ar', label: '📷 Camera AR' },
  { id: 'all', label: '✨ All' }
];

const AVATAR_OPTIONS = ['🦁', '🐼', '🦊', '🐸', '🦄', '🤖'];

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('web');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [legacyView, setLegacyView] = useState<string>('home');
  const [inGameplay, setInGameplay] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [contextFilter, setContextFilter] = useState<ContextFilter>('recommended');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [tick, setTick] = useState(0);
  const [muted, setMuted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);

  // Overlays
  const [profileOpen, setProfileOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAvatar, setDraftAvatar] = useState('🦁');
  const [draftAge, setDraftAge] = useState<AgeBandId>('4-6');
  const [helpOverlay, setHelpOverlay] = useState<{ topic: string; data: HelpTopicData } | null>(
    null
  );

  const { pwaStatus, triggerInstallPrompt } = usePwaSetup(isDark, {
    id: 'playspark-kids-edu',
    name: 'PlaySpark — Math, English & AR Games',
    shortName: 'PlaySpark',
    description:
      'Interactive 3D Math, K-5 English Phonics, Learning Guides, and AR Camera Motion Games for kids.',
    glyph: '✨',
    accentFrom: '#4F46E5',
    accentMid: '#0EA5E9',
    accentTo: '#10B981'
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  useGlobalShortcuts(searchInputRef, !inGameplay);

  const syncFromBridge = useCallback(() => {
    const app = getKidApp();
    if (!app) return;
    setMuted(app.AudioEngine.isMuted());
    setVoiceOn(app.AudioEngine.isVoiceOn());
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initBridge = () => {
      const app = getKidApp();
      if (!app || typeof app.boot !== 'function') {
        if (!cancelled) setTimeout(initBridge, 40);
        return;
      }
      app.boot();
      syncFromBridge();
      const prof = app.bridge?.profileStore.profile;
      if (prof && !prof.name) {
        setDraftName('');
        setDraftAvatar(prof.avatar || '🦁');
        setDraftAge(prof.ageBand || '4-6');
        setProfileOpen(true);
      }
    };

    initBridge();

    const onReady = () => initBridge();
    const onStateChange = () => syncFromBridge();
    const onViewChange = (e: Event) => {
      const detail = (e as CustomEvent<{ view: string; inGameplay: boolean }>).detail;
      if (!detail) return;
      setLegacyView(detail.view);
      setInGameplay(detail.inGameplay);
      if (detail.view === 'home') {
        setActiveTab('home');
      } else if (detail.view === 'trophies') {
        setActiveTab('charts');
      }
    };
    const onHelp = (e: Event) => {
      const detail = (e as CustomEvent<{ topic: string; data: HelpTopicData }>).detail;
      if (detail) setHelpOverlay(detail);
    };
    const onHelpClose = () => setHelpOverlay(null);

    window.addEventListener('kidapp:ready', onReady);
    window.addEventListener('kidapp:state-change', onStateChange);
    window.addEventListener('kidapp:view-change', onViewChange);
    window.addEventListener('kidapp:help', onHelp);
    window.addEventListener('kidapp:help-close', onHelpClose);

    return () => {
      cancelled = true;
      window.removeEventListener('kidapp:ready', onReady);
      window.removeEventListener('kidapp:state-change', onStateChange);
      window.removeEventListener('kidapp:view-change', onViewChange);
      window.removeEventListener('kidapp:help', onHelp);
      window.removeEventListener('kidapp:help-close', onHelpClose);
    };
  }, [syncFromBridge]);

  const app = getKidApp();
  const bridge = app?.bridge;
  const profile: KidProfile = bridge?.profileStore.profile ?? {
    name: '',
    avatar: '🦁',
    ageBand: '4-6',
    stars: 0,
    hearts: 0,
    solved: 0,
    bestStreak: 0,
    arcadeBest: 0,
    rockBest: 0,
    favorites: [],
    recent: [],
    puzzleCompleted: [],
    treasures: { stone: 0, bronze: 0, gold: 0, jewel: 0, diamond: 0 },
    stats: {
      add: { attempts: 0, correct: 0, hints: 0 },
      sub: { attempts: 0, correct: 0, hints: 0 },
      mul: { attempts: 0, correct: 0, hints: 0 },
      en: { attempts: 0, correct: 0, hints: 0 }
    }
  };
  const streak = bridge?.profileStore.currentStreak ?? 0;
  const activities = app?.ACTIVITIES ?? [];
  const ageBands = app?.AGE_BANDS ?? [];
  const savedProfiles = Object.entries(bridge?.profileStore.store.profiles ?? {}).filter(
    ([, p]) => p.name
  );

  // Force re-read when tick increments
  void tick;

  const isLegacyActive = legacyView !== 'home' && legacyView !== 'trophies';
  const isCompact = previewDevice !== 'web';

  const openProfileModal = () => {
    setDraftName(profile.name || '');
    setDraftAvatar(profile.avatar || '🦁');
    setDraftAge(profile.ageBand || '4-6');
    setProfileOpen(true);
  };

  const handleSaveProfile = () => {
    if (!bridge) return;
    bridge.profileStore.saveNameAndAvatar(draftName, draftAvatar, draftAge);
    app?.AudioEngine.pop();
    setProfileOpen(false);
    syncFromBridge();
  };

  const switchToTab = (tab: NavTab) => {
    app?.AudioEngine.pop();
    setActiveTab(tab);
    if (tab === 'home') {
      bridge?.showView('home');
    } else if (tab === 'charts') {
      bridge?.showView('trophies');
    } else {
      setLegacyView('home');
      setInGameplay(false);
    }
  };

  const handleToggleSound = () => {
    if (!app) return;
    app.AudioEngine.toggleMute();
    bridge?.syncStoryMute();
    syncFromBridge();
  };

  const handleToggleVoice = () => {
    if (!app) return;
    const on = app.AudioEngine.toggleVoice();
    syncFromBridge();
    if (on) {
      app.AudioEngine.speak(
        `Hi${profile.name ? ', ' + profile.name : ''}! Let's play and learn together!`,
        'cheer'
      );
    }
  };

  const handleSelectAgeBand = (band: AgeBandId) => {
    if (!bridge || !app) return;
    bridge.profileStore.setAgeBand(band);
    app.AudioEngine.pop();
    const meta = app.AGE_BAND_BY_ID[band];
    if (meta) app.AudioEngine.speak(`Showing games for ${meta.label}!`, 'cheer');
    syncFromBridge();
  };

  const handleToggleFavorite = (id: string, el: HTMLElement | null) => {
    if (!bridge || !app) return;
    const added = bridge.profileStore.toggleFavorite(id);
    app.AudioEngine.pop();
    if (added) app.spawnFloatingPop(el, '❤️ Saved!');
    syncFromBridge();
  };

  const handleQuickCreateAction = () => {
    app?.AudioEngine.pop();
    bridge?.quickMath();
  };

  return (
    <>
      <div id="confetti-layer" aria-hidden="true" />
      <RefractiveBackdrop isDark={isDark} />

      <div
        className={`min-h-[100dvh] pt-[max(0.75rem,env(safe-area-inset-top))] ${
          inGameplay
            ? 'pb-4'
            : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-8'
        }`}
      >
        <DevicePreviewShell device={previewDevice}>
          {/* ZONE 1: STICKY TOP GLASS BAR & HORIZONTAL CONTEXT STRIP */}
          {!inGameplay && (
            <header className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-30 mb-4 flex flex-col gap-2.5">
              <div className="liquid-glass-elevated flex flex-wrap items-center justify-between gap-2 rounded-[26px] px-3 py-2 sm:px-4">
                {/* Brand + Kid Stats */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchToTab('home')}
                    className="flex items-center gap-1.5 rounded-full px-1.5 py-1 text-left transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <span className="text-xl" aria-hidden="true">
                      ✨
                    </span>
                    <span className="text-base font-extrabold tracking-tight">PlaySpark</span>
                  </button>

                  <button
                    type="button"
                    onClick={openProfileModal}
                    title="Switch Kid Profile or Age"
                    className="liquid-glass flex min-h-[38px] items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <span>{profile.avatar || '🦁'}</span>
                    <span className="max-w-[76px] truncate">{profile.name || 'Kid'}</span>
                    <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px]">
                      {profile.ageBand || '4-6'}
                    </span>
                  </button>

                  <div
                    className="tabular-nums flex min-h-[36px] items-center gap-1 rounded-full bg-amber-400/20 px-2.5 text-xs font-extrabold text-amber-800 dark:text-amber-200"
                    title="Total Stars"
                  >
                    <span>⭐</span>
                    <span>{profile.stars}</span>
                  </div>

                  <div
                    className="tabular-nums hidden min-h-[36px] items-center gap-1 rounded-full bg-orange-400/20 px-2.5 text-xs font-extrabold text-orange-800 sm:flex dark:text-orange-200"
                    title="Current Streak"
                  >
                    <span>🔥</span>
                    <span>{streak}</span>
                  </div>
                </div>

                {/* Desktop / Tablet Inline Navigation Tabs (>=768px unless compact preview) */}
                {!isCompact && (
                  <nav
                    aria-label="Primary navigation"
                    className="hidden items-center gap-1 rounded-full bg-black/5 p-1 md:flex dark:bg-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => switchToTab('home')}
                      className={`min-h-[36px] rounded-full px-3.5 text-xs font-extrabold transition ${
                        activeTab === 'home' && !isLegacyActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      🏠 Home
                    </button>
                    <button
                      type="button"
                      onClick={() => switchToTab('charts')}
                      className={`min-h-[36px] rounded-full px-3.5 text-xs font-extrabold transition ${
                        activeTab === 'charts' && !isLegacyActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      📊 Charts
                    </button>
                    <button
                      type="button"
                      onClick={() => switchToTab('settings')}
                      className={`min-h-[36px] rounded-full px-3.5 text-xs font-extrabold transition ${
                        activeTab === 'settings' && !isLegacyActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      ⚙️ Settings
                    </button>
                  </nav>
                )}

                {/* Search + Controls + Theme + Preview */}
                <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-initial">
                  {activeTab === 'home' && !isLegacyActive && (
                    <div className="relative min-w-[130px] flex-1 sm:w-44 sm:flex-initial">
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search games ( / )"
                        aria-label="Search games and lessons"
                        className="min-h-[38px] w-full rounded-full border border-white/40 bg-white/60 px-3 text-xs font-semibold outline-none placeholder:opacity-65 focus:border-indigo-500 dark:border-white/15 dark:bg-black/25"
                      />
                    </div>
                  )}

                  {!isCompact && (
                    <button
                      type="button"
                      onClick={handleQuickCreateAction}
                      className="hidden min-h-[38px] items-center gap-1 rounded-full bg-indigo-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] md:inline-flex"
                    >
                      + Quick Math
                    </button>
                  )}

                  {/* Desktop Device Preview Toggle (>=1024px) */}
                  <div className="hidden items-center rounded-full bg-black/5 p-0.5 lg:flex dark:bg-white/10">
                    {(['web', 'iphone', 'android'] as PreviewDevice[]).map((dev) => (
                      <button
                        key={dev}
                        type="button"
                        onClick={() => setPreviewDevice(dev)}
                        className={`rounded-full px-2 py-1 text-[11px] font-bold capitalize transition ${
                          previewDevice === dev
                            ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        {dev === 'web' ? 'Web' : dev === 'iphone' ? 'iPhone' : 'Android'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    aria-label="Toggle Sound"
                    title="Sound On/Off"
                    className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full text-sm transition hover:brightness-105 active:scale-95"
                  >
                    {muted ? '🔇' : '🔊'}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    aria-label="Toggle Voice Read-Aloud"
                    title="Voice On/Off"
                    className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full text-sm transition hover:brightness-105 active:scale-95"
                  >
                    {voiceOn ? '🗣️' : '🤫'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDark((d) => !d)}
                    aria-label="Toggle Light or Dark Glass"
                    title={isDark ? 'Switch to Light Glass' : 'Switch to Dark Glass'}
                    className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full text-sm transition hover:brightness-105 active:scale-95"
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>

              {/* Horizontal Context Strip (Visible on Home tab) */}
              {activeTab === 'home' && !isLegacyActive && (
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-0.5 pb-0.5">
                  {CONTEXT_PILLS.map((pill) => {
                    const active = contextFilter === pill.id;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => {
                          app?.AudioEngine.pop();
                          setContextFilter(pill.id);
                        }}
                        className={`min-h-[38px] shrink-0 rounded-full px-3.5 text-xs font-extrabold transition duration-200 active:scale-[0.98] ${
                          active
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'liquid-glass opacity-85 hover:opacity-100'
                        }`}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </header>
          )}

          {/* MAIN CONTENT */}
          <main>
            {!isLegacyActive && activeTab === 'home' && (
              <HomeFourZoneView
                profile={profile}
                activities={activities}
                ageBands={ageBands}
                searchQuery={searchQuery}
                contextFilter={contextFilter}
                isCompact={isCompact}
                onSelectAgeBand={handleSelectAgeBand}
                onLaunchActivity={(id) => bridge?.launchActivity(id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenWorld={(w) => bridge?.openWorld(w)}
                onOpenLearn={(sub) => bridge?.openLearn(sub)}
                onOpenCharts={() => switchToTab('charts')}
                onQuickMath={() => bridge?.quickMath()}
                onSurpriseMe={() => bridge?.surpriseMe()}
                onPetBuddy={() => bridge?.petBuddy() ?? ''}
                onFeedBuddy={() =>
                  bridge?.feedBuddy() ?? { ok: false, message: 'Loading buddy...' }
                }
              />
            )}

            {!isLegacyActive && activeTab === 'charts' && (
              <ChartsInsightsView
                profile={profile}
                onOpenProfileModal={openProfileModal}
                onPracticeTopic={(key) => {
                  if (key === 'en') bridge?.openWorld('english');
                  else bridge?.launchActivity(`math-${key}`);
                }}
              />
            )}

            {!isLegacyActive && activeTab === 'settings' && (
              <PwaSettingsView
                pwaStatus={pwaStatus}
                onTriggerInstall={triggerInstallPrompt}
                isDark={isDark}
                onToggleTheme={() => setIsDark((d) => !d)}
                profile={profile}
                onStoreUpdated={syncFromBridge}
              />
            )}

            <LegacyGamesHost visible={isLegacyActive} />
          </main>
        </DevicePreviewShell>
      </div>

      {/* MOBILE FLOATING BOTTOM GLASS CAPSULE (3 Tabs) + DETACHED + FAB */}
      {!inGameplay && (
        <div
          className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 ${
            isCompact ? '' : 'md:hidden'
          }`}
        >
          <nav
            aria-label="Mobile navigation"
            className="liquid-glass-elevated flex items-center gap-1 rounded-full p-1.5"
          >
            <button
              type="button"
              onClick={() => switchToTab('home')}
              className={`min-h-[48px] rounded-full px-4 text-xs font-extrabold transition ${
                activeTab === 'home' && !isLegacyActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              🏠 Home
            </button>
            <button
              type="button"
              onClick={() => switchToTab('charts')}
              className={`min-h-[48px] rounded-full px-4 text-xs font-extrabold transition ${
                activeTab === 'charts' && !isLegacyActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              📊 Charts
            </button>
            <button
              type="button"
              onClick={() => switchToTab('settings')}
              className={`min-h-[48px] rounded-full px-4 text-xs font-extrabold transition ${
                activeTab === 'settings' && !isLegacyActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              ⚙️ Settings
            </button>
          </nav>

          <button
            type="button"
            onClick={handleQuickCreateAction}
            aria-label="Quick Math Challenge"
            title="Quick Math Challenge"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-extrabold text-white shadow-xl transition hover:brightness-105 active:scale-95"
          >
            +
          </button>
        </div>
      )}

      {/* ADAPTIVE OVERLAY: KID NAME, AGE & AVATAR PICKER */}
      <AdaptiveOverlay
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="👋 Welcome! Kid Profile"
        compact={isCompact}
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs opacity-75">
            We save your stars, scores, and progress report right on this device.
          </p>

          <div>
            <label htmlFor="react-kid-name" className="mb-1 block text-xs font-extrabold">
              Kid&apos;s Name
            </label>
            <input
              id="react-kid-name"
              type="text"
              maxLength={20}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveProfile();
              }}
              placeholder="Enter name (e.g. Maya)"
              className="min-h-[48px] w-full rounded-2xl border border-slate-400/35 bg-white/70 px-3.5 text-sm font-bold outline-none focus:border-indigo-500 dark:bg-black/25"
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-extrabold">
              Age Stage (Tailors Games For You)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ageBands.map((band) => {
                const active = draftAge === band.id;
                return (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setDraftAge(band.id)}
                    className={`min-h-[54px] rounded-2xl border p-2 text-center text-xs font-extrabold transition ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-slate-400/25 bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    <div>
                      {band.emoji} {band.short}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-extrabold">Pick Your Buddy</div>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setDraftAvatar(av)}
                  className={`flex min-h-[48px] items-center justify-center rounded-2xl border text-2xl transition ${
                    draftAvatar === av
                      ? 'border-indigo-500 bg-indigo-500/20 scale-105'
                      : 'border-slate-400/25 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {savedProfiles.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-extrabold">Switch Saved Profile</div>
              <div className="flex flex-wrap gap-2">
                {savedProfiles.map(([id, p]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      bridge?.profileStore.switchProfile(id);
                      setProfileOpen(false);
                      syncFromBridge();
                    }}
                    className="liquid-glass min-h-[44px] rounded-full px-3 text-xs font-bold"
                  >
                    {p.avatar || '🦁'} {p.name} ({p.stars}⭐)
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
          >
            Let&apos;s Play! 🚀
          </button>
        </div>
      </AdaptiveOverlay>

      {/* ADAPTIVE OVERLAY: CONTEXTUAL HELP */}
      <AdaptiveOverlay
        open={Boolean(helpOverlay)}
        onClose={() => setHelpOverlay(null)}
        title={helpOverlay?.data.title ?? '❓ Quick Help'}
        compact={isCompact}
      >
        {helpOverlay && (
          <div className="flex flex-col gap-4">
            <div
              className="text-sm leading-relaxed [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: helpOverlay.data.body }}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setHelpOverlay(null);
                  bridge?.openLearn('math');
                }}
                className="liquid-glass min-h-[48px] rounded-full px-4 text-xs font-bold"
              >
                📚 Open Learning Guides
              </button>
              <button
                type="button"
                onClick={() => setHelpOverlay(null)}
                className="min-h-[48px] rounded-full bg-indigo-600 px-5 text-xs font-extrabold text-white"
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </AdaptiveOverlay>
    </>
  );
}
