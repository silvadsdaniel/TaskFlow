// Service worker mínimo: só o necessário para o critério de instalabilidade
// (registro + handler de fetch). Sem cache offline nesta fase.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evento) => {
  evento.respondWith(fetch(evento.request));
});
