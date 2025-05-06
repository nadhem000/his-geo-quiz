importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = 'quiz-v3';
const OFFLINE_FALLBACK = '/offline.html';

const ASSETS = [
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

// Workbox configuration
workbox.setConfig({ debug: false });

// Cache-first strategy for core assets
workbox.routing.registerRoute(
  ({url}) => ASSETS.includes(url.pathname),
  new workbox.strategies.CacheFirst()
);

// Stale-While-Revalidate for other assets
workbox.routing.registerRoute(
  ({request}) => ['style', 'script', 'image', 'audio'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate()
);

// NetworkFirst only for navigation (will fallback to offline.html)
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10
      })
    ]
  })
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Offline fallback
workbox.routing.setCatchHandler(async ({event}) => {
  if (event.request.destination === 'document') {
    return caches.match(OFFLINE_FALLBACK);
  }
  return Response.error();
});