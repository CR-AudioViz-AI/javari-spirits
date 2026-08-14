// Javari Spirits Service Worker
// Version: 1.0.0

const CACHE_NAME = 'javarispirits-v1';
const STATIC_CACHE = 'javarispirits-static-v1';
const DYNAMIC_CACHE = 'javarispirits-dynamic-v1';
const IMAGE_CACHE = 'javarispirits-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/explore',
  '/scan',
  '/games',
  '/cocktails/genius',
  '/rewards',
  '/profile',
  '/offline',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('javarispirits-') && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE &&
                     name !== IMAGE_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip API requests (except for certain endpoints)
  if (url.pathname.startsWith('/api/')) {
    // Cache trivia questions for offline play
    if (url.pathname.includes('/api/games/trivia')) {
      event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
      return;
    }
    // Don't cache other API requests
    return;
  }
  
  // Handle image requests - cache first
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE));
    return;
  }
  
  // Handle page navigation - network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
    return;
  }
  
  // Handle other static assets - cache first
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }
  
  // Default - network first
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Cache first, then network
async function cacheFirstWithNetwork(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response and update cache in background
    updateCache(request, cacheName);
    return cachedResponse;
  }
  
  return fetchAndCache(request, cacheName);
}

// Network first, then cache
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Fetch and cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Update cache in background
async function updateCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response);
    }
  } catch (error) {
    // Silent fail - we already have cached version
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = { title: 'Javari Spirits', body: 'New update available!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-collection') {
    event.waitUntil(syncCollection());
  }
  
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews());
  }
});

// Sync collection data when online
async function syncCollection() {
  try {
    // Get pending collection updates from IndexedDB
    // and sync them to the server
    console.log('[SW] Syncing collection...');
  } catch (error) {
    console.error('[SW] Collection sync failed:', error);
  }
}

// Sync reviews when online
async function syncReviews() {
  try {
    // Get pending reviews from IndexedDB
    // and sync them to the server
    console.log('[SW] Syncing reviews...');
  } catch (error) {
    console.error('[SW] Reviews sync failed:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-spirits') {
    event.waitUntil(updateSpiritsCache());
  }
});

// Update spirits cache periodically
async function updateSpiritsCache() {
  try {
    const response = await fetch('/api/spirits?limit=100');
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/spirits?limit=100', response);
      console.log('[SW] Spirits cache updated');
    }
  } catch (error) {
    console.error('[SW] Failed to update spirits cache:', error);
  }
}

console.log('[SW] Service worker loaded');
