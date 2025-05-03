const CACHE_NAME = 'quiz-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/assets/sounds/*',
  '/assets/images/*'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});