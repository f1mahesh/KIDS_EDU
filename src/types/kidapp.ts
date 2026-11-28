export type AgeBandId = '4-6' | '6-8' | '8-10';

export interface AgeBandMeta {
  id: AgeBandId;
  label: string;
  emoji: string;
  short: string;
  englishTier: string;
  mathLevel: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  shortDesc: string;
  emoji: string;
  category: 'english' | 'math' | 'fun';
  group: string;
  style: 'touch' | 'ar';
  ages: AgeBandId[];
  badge: string;
  cardClass: string;
  action: string;
  op?: string;
}

export interface TopicStat {
  attempts: number;
  correct: number;
  hints: number;
}

export interface TreasuresMap {
  stone: number;
  bronze: number;
  gold: number;
  jewel: number;
  diamond: number;
  [key: string]: number;
}

export interface KidProfile {
  name: string;
  avatar: string;
  ageBand: AgeBandId;
  stars: number;
  hearts: number;
  solved: number;
  bestStreak: number;
  arcadeBest: number;
  rockBest: number;
  favorites: string[];
  recent: Array<{ id: string; ts: number }>;
  puzzleCompleted: string[];
  treasures: TreasuresMap;
  stats: {
    add: TopicStat;
    sub: TopicStat;
    mul: TopicStat;
    en: TopicStat;
    [key: string]: TopicStat;
  };
}

export interface ProfilesStoreData {
  activeId: string;
  profiles: Record<string, KidProfile>;
  updatedAt?: number;
}

export interface DeviceStorageStatus {
  persisted: boolean;
  idbReady: boolean;
  opfsReady: boolean;
  supportsFilePicker: boolean;
  supportsShareFiles: boolean;
  usageBytes: number;
  quotaBytes: number;
  linkedFileName: string | null;
  filePermission: 'none' | 'granted' | 'prompt';
}

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  req: string;
  check: (p: KidProfile) => boolean;
}

export interface TreasureItemDef {
  id: string;
  emoji: string;
  name: string;
  short: string;
  stars: number;
}

export interface RankDef {
  min: number;
  label: string;
}

export interface HelpTopicData {
  title: string;
  body: string;
}

export interface KidAppBridge {
  AGE_BANDS: AgeBandMeta[];
  AGE_BAND_BY_ID: Record<string, AgeBandMeta>;
  ACTIVITIES: ActivityItem[];
  ACTIVITY_BY_ID: Record<string, ActivityItem>;
  RANKS: RankDef[];
  BADGES: BadgeDef[];
  TREASURE_ITEMS: TreasureItemDef[];
  HELP_TOPICS?: Record<string, HelpTopicData>;
  getRankLabel: (stars: number) => string;
  getTotalTreasures: (p: KidProfile) => number;
  ensureProfileShape: (p: Partial<KidProfile>) => KidProfile;
  AudioEngine: {
    pop: () => void;
    correct: () => void;
    wrong: () => void;
    fanfare: () => void;
    giggle: () => void;
    chomp: () => void;
    speak: (text: string, mood?: string) => void;
    toggleMute: () => boolean;
    toggleVoice: () => boolean;
    isMuted: () => boolean;
    isVoiceOn: () => boolean;
  };
  launchConfetti: (count?: number) => void;
  spawnFloatingPop: (el: HTMLElement | null, text?: string) => void;
  DeviceStorage?: {
    requestPersistence: () => Promise<boolean>;
    persistProfiles: (store: ProfilesStoreData) => Promise<void>;
    loadDurableProfiles: () => Promise<ProfilesStoreData | null>;
    getStatus: () => Promise<DeviceStorageStatus>;
    linkSaveFile: (store: ProfilesStoreData) => Promise<{ ok: boolean; fileName?: string; reason?: string }>;
    reconnectSaveFile: (store: ProfilesStoreData) => Promise<{ ok: boolean; fileName?: string }>;
    unlinkSaveFile: () => Promise<void>;
    shareOrDownloadBackup: (store: ProfilesStoreData) => Promise<{ ok: boolean; method: string }>;
  };
  boot?: () => void;
  bridge?: {
    profileStore: {
      store: ProfilesStoreData;
      profile: KidProfile;
      currentStreak: number;
      save: (next?: KidProfile) => KidProfile;
      switchProfile: (id: string) => KidProfile;
      saveNameAndAvatar: (name: string, avatar: string, ageBand?: AgeBandId | null) => KidProfile;
      setAgeBand: (ageBand: AgeBandId) => AgeBandId;
      isFavorite: (id: string) => boolean;
      toggleFavorite: (id: string) => boolean;
      recordRecent: (id: string) => void;
      resetCurrent: () => KidProfile;
      replaceStore: (nextStore: ProfilesStoreData) => KidProfile;
    };
    showView: (name: string) => void;
    launchActivity: (activityId: string) => void;
    openLearn: (subject: 'math' | 'english') => void;
    openWorld: (world: 'math' | 'english' | 'funGames') => void;
    quickMath: () => void;
    surpriseMe: () => ActivityItem | null;
    petBuddy: () => string;
    feedBuddy: () => { ok: boolean; message: string };
    syncStoryMute: () => void;
    mountHeroCanvas: (canvas: HTMLCanvasElement | null) => void;
    getCurrentView: () => string;
    isInGameplay: () => boolean;
  };
}

export function getKidApp(): KidAppBridge | undefined {
  return (window as unknown as { KidApp?: KidAppBridge }).KidApp;
}
