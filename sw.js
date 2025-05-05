const CACHE_NAME = 'quiz-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  // Explicitly list key icons
  '/assets/icons/android/android-launchericon-512-512.png',
  '/assets/icons/android/android-launchericon-192-192.png',
  '/assets/icons/android/android-launchericon-48-48.png',
  '/assets/icons/ios/16.png',
  '/assets/icons/ios/72.png',
  '/assets/icons/ios/152.png',
  '/assets/icons/ios/167.png',
  '/assets/icons/ios/180.png',
  '/assets/icons/ios/192.png',
  '/assets/icons/ios/512.png',
  '/assets/sounds/*',
  '/assets/images/*'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});