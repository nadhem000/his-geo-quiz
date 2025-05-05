const CACHE_NAME = 'quiz-v2';
const ASSETS = [
	'/',
	'/icons.json',
	'/index.html',
	'/log.txt',
	'/manifest.json',
	'/README.md',
	'/sw.js',
	// Explicitly list key icons
	'/assets\images\ww2.jpg',
	'/assets\icons\android\android-launchericon-48-48.png',
	'/assets\icons\android\android-launchericon-192-192.png',
	'/assets\icons\android\android-launchericon-512-512.png',
	'/assets\icons\ios\16.png',
	'/assets\icons\ios\72.png',
	'/assets\icons\ios\152.png',
	'/assets\icons\ios\167.png',
	'/assets\icons\ios\180.png',
	'/assets\icons\ios\192.png',
	'/assets\icons\ios\512.png',
	'/assets\icons\windows11\Square44x44Logo.scale-400.png',
	'/assets\icons\windows11\Square44x44Logo.targetsize-60.png',
	'/assets\icons\windows11\Square44x44Logo.targetsize-72.png',
	'/assets\icons\windows11\Square44x44Logo.targetsize-96.png',
	'/assets\icons\windows11\StoreLogo.scale-400.png',
	'/assets\icons\windows11\Wide310x150Logo.scale-125.png',
	'/assets\backgrounds\3d-render-sunrise-view-from-space-planet-earth.jpg',
	'/assets\sounds\correct.wav',
	'/assets\sounds\levelup.wav',
	'/assets\sounds\wrong.wav'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});