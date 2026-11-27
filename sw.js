const CACHE_NAME = 'playspark-v53';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './src/main.js',
  './src/core/audio-engine.js',
  './src/core/profile-store.js',
  './src/core/treasure-registry.js',
  './src/core/ui-effects.js',
  './src/math/math-3d-scene.js',
  './src/math/math-quest-controller.js',
  './src/math/times-tables-controller.js',
  './src/english/phonics-curriculum.js',
  './src/english/phonics-pop-game.js',
  './src/english/phonics-clap-game.js',
  './src/english/phonics-blaster-game.js',
  './src/english/phonics-runner-game.js',
  './src/english/phonics-trace-game.js',
  './src/english/word-builder-game.js',
  './src/english/english-hub-controller.js',
  './src/learn/learn-curriculum.js',
  './src/learn/learn-controller.js',
  './src/games/magic-mixer-game.js',
  './src/games/snow-clap-game.js',
  './src/games/squirrel-bridge-game.js',
  './src/games/rock-blaster-game.js',
  './src/games/number-runner-game.js',
  './src/games/car-racer-game.js',
  './src/games/picture-puzzle-game.js',
  './src/games/games-hub-controller.js',
  './src/story/story-controller.js',
  './mountain.jpeg',
  './shiv%20ji.jpeg',
  './parvati.jpeg',
  './ganesha%20before%20elephant.jpeg',
  './ganeshsa.jpeg'
];

function isCodeOrDocumentRequest(request) {
  if (request.mode === 'navigate') return true;
  const dest = request.destination || '';
  if (dest === 'document' || dest === 'script' || dest === 'style' || dest === 'manifest') {
    return true;
  }
  const url = request.url.split('?')[0].toLowerCase();
  return (
    url.endsWith('/') ||
    url.endsWith('.html') ||
    url.endsWith('.js') ||
    url.endsWith('.css') ||
    url.endsWith('.webmanifest')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((asset) =>
          fetch(new Request(asset, { cache: 'reload' }))
            .then((res) => (res && res.ok ? cache.put(asset, res) : null))
            .catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first for HTML, JS, CSS, and manifest so deployed updates appear immediately
  if (isCodeOrDocumentRequest(event.request)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache-first with background refresh for images and static media
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
