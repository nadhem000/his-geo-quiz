
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = 'quiz-v4'; // Updated version
const OFFLINE_FALLBACK = '/offline.html';
const PRECACHE_ASSETS = [
	'/',
	'/icons.json',
	'/index.html',
	'/log.txt',
	'/manifest.json',
	'/offline.html',
	'/README.md',
	'/sw.js',
	// Explicitly list key icons
	'/assets/images/ww2.jpg',
	'/assets/icons/android/android-launchericon-48-48.png',
	'/assets/icons/android/android-launchericon-192-192.png',
	'/assets/icons/android/android-launchericon-512-512.png',
	'/assets/icons/ios/16.png',
	'/assets/icons/ios/72.png',
	'/assets/icons/ios/152.png',
	'/assets/icons/ios/167.png',
	'/assets/icons/ios/180.png',
	'/assets/icons/ios/192.png',
	'/assets/icons/ios/512.png',
	'/assets/icons/windows11/Square44x44Logo.scale-400.png',
	'/assets/icons/windows11/Square44x44Logo.targetsize-60.png',
	'/assets/icons/windows11/Square44x44Logo.targetsize-72.png',
	'/assets/icons/windows11/Square44x44Logo.targetsize-96.png',
	'/assets/icons/windows11/StoreLogo.scale-400.png',
	'/assets/icons/windows11/Wide310x150Logo.scale-125.png',
	'/assets/backgrounds/3d-render-sunrise-view-from-space-planet-earth.jpg',
	'/assets/screenshots/screenshot_01.png',
	'/assets/screenshots/screenshot_02.png',
	'/assets/screenshots/screenshot_03.png',
	'/assets/sounds/correct.wav',
	'/assets/sounds/levelup.wav',
	'/assets/sounds/wrong.wav'
];

// Workbox Configuration
workbox.setConfig({
  debug: false,
  clientsClaim: true,
  skipWaiting: true
});

// Precaching Strategy
workbox.precaching.precacheAndRoute(PRECACHE_ASSETS);

// Cache Strategies
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        purgeOnQuotaError: true
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({request}) => ['style', 'script'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: `${CACHE_NAME}-assets`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({request}) => ['image', 'audio'].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: `${CACHE_NAME}-media`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 60 // 60 Days
      })
    ]
  })
);

// Offline Fallback
workbox.routing.setCatchHandler(async ({event}) => {
  if (event.request.destination === 'document') {
    return caches.match(OFFLINE_FALLBACK);
  }
  return Response.error();
});

// Service Worker Lifecycle Management
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== `${CACHE_NAME}-assets` && 
              cacheName !== `${CACHE_NAME}-media`) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync (if needed later)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Message Handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Utility Functions
const handleBackgroundSync = async () => {
  // Implement your background sync logic here
};