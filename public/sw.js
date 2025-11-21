const CACHE_NAME = 'ebt-finder-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/e67ca403-7d95-4937-99e0-b6a0c646f9cb.png',
  '/ebt-logo.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Handle other requests with cache-first strategy for static assets
  if (event.request.url.includes('/assets/') || 
      event.request.url.includes('/lovable-uploads/') ||
      event.request.url.includes('.png') ||
      event.request.url.includes('.jpg') ||
      event.request.url.includes('.svg')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
            return response;
          });
        })
    );
    return;
  }

  // Network-first strategy for API calls
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});