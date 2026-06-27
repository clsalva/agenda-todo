const CACHE_NAME = 'agenda-todo-pwa-v1';
const APP_SHELL = ['./','./agenda-todo-pwa.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./badge-icon.png','./screenshot-mobile.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
    const clone = resp.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
    return resp;
  }).catch(() => caches.match('./agenda-todo-pwa.html'))));
});
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Agenda Todo', body: 'Nuovo promemoria disponibile.', url: './agenda-todo-pwa.html' };
  event.waitUntil(self.registration.showNotification(data.title || 'Agenda Todo', {
    body: data.body || 'Nuovo promemoria disponibile.',
    icon: './icon-192.png',
    badge: './badge-icon.png',
    data: { url: data.url || './agenda-todo-pwa.html' },
    tag: data.tag || 'agenda-todo-push'
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) {
      if ('focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(event.notification.data?.url || './agenda-todo-pwa.html');
  }));
});
