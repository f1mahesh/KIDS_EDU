import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaAppConfig {
  id: string;
  name: string;
  /** Keep <= 11 chars so iOS, Android, and macOS Dock never truncate */
  shortName: string;
  description: string;
  glyph: string;
  accentFrom?: string;
  accentMid?: string;
  accentTo?: string;
}

export type PlatformInstallTarget =
  | 'installed'
  | 'native-prompt'
  | 'ios-safari'
  | 'macos-safari'
  | 'browser-manual';

export interface PwaStatus {
  manifestReady: boolean;
  appleMetaReady: boolean;
  swStatus: 'initializing' | 'active' | 'sandboxed';
  isStandalone: boolean;
  installTarget: PlatformInstallTarget;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface IconOptions {
  size: number;
  maskable?: boolean;
  opaque?: boolean;
  glyph: string;
  colors: [string, string, string];
}

function generateCanvasPngIcon({
  size,
  maskable = false,
  opaque = false,
  glyph,
  colors
}: IconOptions): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);

    if (maskable || opaque) {
      // Full-bleed background required for iOS opaque icons & Android maskable icons
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    } else {
      const r = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = Math.max(2, size * 0.02);
      ctx.stroke();
    }

    // Center artwork inside the 80% safe-zone circle (radius <= 0.4 * size)
    const safeFactor = maskable ? 0.52 : 0.62;
    const badgeSize = size * safeFactor;
    const badgeOffset = (size - badgeSize) / 2;
    const badgeRadius = badgeSize * 0.26;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeOffset, badgeOffset, badgeSize, badgeSize, badgeRadius);
    } else {
      ctx.rect(badgeOffset, badgeOffset, badgeSize, badgeSize);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = Math.max(1.5, size * 0.012);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    const fontScale = maskable ? 0.34 : 0.42;
    ctx.font = `700 ${Math.round(
      size * fontScale
    )}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, size / 2, size / 2 + size * 0.02);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

function detectInstallTarget(
  isStandalone: boolean,
  hasPrompt: boolean
): PlatformInstallTarget {
  if (isStandalone) return 'installed';
  if (hasPrompt) return 'native-prompt';

  const ua = navigator.userAgent;
  const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/i.test(ua);
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) return 'ios-safari';
  if (isSafari) return 'macos-safari';
  return 'browser-manual';
}

export function usePwaSetup(isDark: boolean, config: PwaAppConfig) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    return Boolean(
      window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true
    );
  });
  const [pwaStatus, setPwaStatus] = useState<PwaStatus>({
    manifestReady: false,
    appleMetaReady: false,
    swStatus: 'initializing',
    isStandalone: isInstalled,
    installTarget: detectInstallTarget(isInstalled, false),
    deferredPrompt: null
  });

  useEffect(() => {
    const ensureMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const shortName = config.shortName.slice(0, 11);
    const themeColor = isDark ? '#070913' : '#EEF2F8';

    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensureMeta('apple-mobile-web-app-title', shortName);
    ensureMeta('theme-color', themeColor);

    const colors: [string, string, string] = [
      config.accentFrom ?? '#4F46E5',
      config.accentMid ?? '#0EA5E9',
      config.accentTo ?? '#10B981'
    ];

    const icon180 = generateCanvasPngIcon({
      size: 180,
      opaque: true,
      glyph: config.glyph,
      colors
    });
    const icon192 = generateCanvasPngIcon({ size: 192, glyph: config.glyph, colors });
    const icon512Any = generateCanvasPngIcon({ size: 512, glyph: config.glyph, colors });
    const icon512Maskable = generateCanvasPngIcon({
      size: 512,
      maskable: true,
      glyph: config.glyph,
      colors
    });

    if (icon180) {
      let touchLink = document.querySelector('link[rel="apple-touch-icon"]');
      if (!touchLink) {
        touchLink = document.createElement('link');
        touchLink.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(touchLink);
      }
      touchLink.setAttribute('href', icon180);
    }

    const baseScope = new URL('.', window.location.href).pathname;
    const manifestObj = {
      id: config.id,
      name: config.name,
      short_name: shortName,
      description: config.description,
      start_url: baseScope,
      scope: baseScope,
      display: 'standalone',
      orientation: 'any',
      background_color: themeColor,
      theme_color: themeColor,
      categories: ['education', 'games', 'kids'],
      icons: [
        ...(icon192
          ? [{ src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' }]
          : []),
        ...(icon512Any
          ? [{ src: icon512Any, sizes: '512x512', type: 'image/png', purpose: 'any' }]
          : []),
        ...(icon512Maskable
          ? [{ src: icon512Maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' }]
          : [])
      ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifestObj)], {
      type: 'application/manifest+json'
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestUrl);

    setPwaStatus((prev) => ({
      ...prev,
      manifestReady: true,
      appleMetaReady: true
    }));

    return () => {
      URL.revokeObjectURL(manifestUrl);
    };
  }, [
    isDark,
    config.id,
    config.name,
    config.shortName,
    config.description,
    config.glyph,
    config.accentFrom,
    config.accentMid,
    config.accentTo
  ]);

  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      navigator.serviceWorker
        .register('./sw.js', { scope: './', updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => undefined);
          setPwaStatus((prev) => ({ ...prev, swStatus: 'active' }));
        })
        .catch(() => setPwaStatus((prev) => ({ ...prev, swStatus: 'sandboxed' })));
    } else {
      setPwaStatus((prev) => ({ ...prev, swStatus: 'sandboxed' }));
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setPwaStatus((prev) => ({
        ...prev,
        deferredPrompt: promptEvent,
        installTarget: detectInstallTarget(prev.isStandalone, true)
      }));
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setPwaStatus((prev) => ({
        ...prev,
        isStandalone: true,
        deferredPrompt: null,
        installTarget: 'installed'
      }));
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const triggerInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setPwaStatus((prev) => ({
      ...prev,
      deferredPrompt: null,
      installTarget: detectInstallTarget(prev.isStandalone, false)
    }));
    return choice?.outcome === 'accepted';
  };

  return { pwaStatus, triggerInstallPrompt };
}
