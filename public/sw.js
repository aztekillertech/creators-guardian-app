const CACHE = 'creatorsguardian-v1';
const SHELL = ['/', '/mobile.html', '/src/main.jsx'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return; // IGNORAR EXTENSIONES Y OTROS PROTOCOLOS
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('/api/')) return;
  if (e.request.headers.get('Authorization')) return;
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const cacheControl = res.headers.get('Cache-Control') || '';
        if (cacheControl.includes('no-store') || cacheControl.includes('private')) return res;
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
