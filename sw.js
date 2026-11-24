const CACHE_NAME = 'playspark-v44';
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
  './src/games/games-hub-controller.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
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
