/* Mena BMS service worker — offline app shell + cached Supabase reads.
   Writes are NOT handled here: /js/offline-sync.js queues them in IndexedDB.
   BUMP `VERSION` ON EVERY DEPLOY so users receive the new files. */
const VERSION = 'bms-v3';
const SHELL_CACHE = VERSION + '-shell';
const DATA_CACHE = VERSION + '-data';

const PAGES = ['login', 'dashboard', 'sales', 'customers', 'purchases', 'suppliers', 'inventory',
  'milling', 'production', 'derkosh', 'pettycash', 'cashflow', 'overhead', 'budget', 'loans',
  'pl', 'profit', 'reports', 'settings'];
const LOCAL = ['/manifest.json', '/icon-192.png', '/icon-512.png',
  '/css/shared-shell.css', '/js/app-state.js', '/js/sidebar.js', '/js/header.js',
  '/js/report-engine.js', '/js/offline-sync.js'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap'
];

// A response that came through a redirect (Vercel cleanUrls: /dashboard.html -> /dashboard)
// can't be served to a page navigation, so store a clean, non-redirected copy.
async function clean(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function precache(cache, url, opts) {
  try {
    const res = await fetch(new Request(url, opts));
    if (res && (res.ok || res.type === 'opaque')) await cache.put(url, await clean(res));
  } catch (e) { /* missing/blocked file: skip, don't fail the install */ }
}

// Pages: try the clean URL first (/dashboard), then /dashboard.html; store under both.
async function precachePage(cache, name) {
  for (const u of ['/' + name, '/' + name + '.html']) {
    try {
      const res = await fetch(u, { cache: 'reload' });
      if (res && res.ok) {
        const c = await clean(res);
        await cache.put('/' + name, c.clone());
        await cache.put('/' + name + '.html', c);
        return;
      }
    } catch (e) { /* try next form */ }
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all([
      ...PAGES.map((p) => precachePage(cache, p)),
      precachePage(cache, 'offline'),
      ...LOCAL.map((u) => precache(cache, u, { cache: 'reload' })),
      ...CDN.map((u) => precache(cache, u, { mode: 'no-cors' }))
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Page asks us to wipe cached business data (when logged out).
self.addEventListener('message', (e) => {
  if (e.data === 'CLEAR_DATA') e.waitUntil(caches.delete(DATA_CACHE));
});

const isSupabase = (u) => u.hostname.endsWith('.supabase.co');
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

// Once one request has failed or timed out we know the connection is down, so for the next few
// seconds every other request goes straight to the saved copy instead of each waiting out its own
// timeout (a dashboard fires ~50 requests: waiting 8 s apiece left it "loading" for a minute).
let offlineUntil = 0;
const knownOffline = () => (self.navigator && self.navigator.onLine === false) || Date.now() < offlineUntil;

// Answers served from the saved copy are tagged so the page can tell "live" from "saved on this device".
async function tagged(res, header) {
  const h = new Headers(res.headers);
  h.set(header, '1');
  return new Response(await res.clone().blob(), { status: res.status, statusText: res.statusText, headers: h });
}

async function networkFirst(req, cacheName, ms) {
  const cache = await caches.open(cacheName);
  const isData = cacheName === DATA_CACHE;
  const find = () => cache.match(req, { ignoreVary: true });
  if (knownOffline()) {
    const hit = await find();
    if (hit) return isData ? tagged(hit, 'X-BMS-Cache') : hit;
    if (self.navigator && self.navigator.onLine === false) throw new Error('offline');
  }
  try {
    const res = await Promise.race([fetch(req), timeout(knownOffline() ? 2500 : ms)]);
    offlineUntil = 0;
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    offlineUntil = Date.now() + 12000;
    const hit = await find();
    if (hit) return isData ? tagged(hit, 'X-BMS-Cache') : hit;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(req);
  const refresh = fetch(req)
    .then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return hit || (await refresh) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (isSupabase(url) && url.pathname.startsWith('/auth/')) return;   // never touch auth

  // Supabase reads: network first, fall back to the last good copy.
  if (isSupabase(url) && url.pathname.startsWith('/rest/v1/')) {
    e.respondWith(
      networkFirst(req, DATA_CACHE, 5000).catch(() =>
        new Response(JSON.stringify({ message: 'offline', offline: true }), {
          status: 503, headers: { 'Content-Type': 'application/json', 'X-BMS-Offline': '1' } }))
    );
    return;
  }

  // Page navigations: network first, then saved copy (also /page -> /page.html), then offline page.
  if (req.mode === 'navigate') {
    e.respondWith(
      networkFirst(req, SHELL_CACHE, 3000).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        const p = url.pathname.replace(/\/$/, '');
        return (await cache.match(req, { ignoreSearch: true })) ||
               (await cache.match(p + '.html')) ||
               (await cache.match('/offline.html'));
      })
    );
    return;
  }

  e.respondWith(staleWhileRevalidate(req));
});

/* ───────────── Background Sync ─────────────
   When the browser regains a connection it fires "sync" — even if every tab is
   closed (Chrome/Edge). Replays the same IndexedDB queue that /js/offline-sync.js fills.
   Uses the access token the page last saved; if that has expired (401) the items stay
   queued and upload the next time the app is opened (the page can refresh the token). */
const OFFLINE_DB = 'bms-offline';
function openQueueDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(OFFLINE_DB, 2);   // keep identical to offline-sync.js
    r.onupgradeneeded = () => {
      const d = r.result;
      ['queue', 'failed'].forEach((n) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: 'id', autoIncrement: true }); });
      if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const idbTx = (d, store, mode, fn) => new Promise((res, rej) => {
  const t = d.transaction(store, mode);
  const rq = fn(t.objectStore(store));
  t.oncomplete = () => res(rq ? rq.result : undefined);
  t.onerror = () => rej(t.error);
});

async function backgroundSync() {
  const d = await openQueueDB();
  const items = await idbTx(d, 'queue', 'readonly', (o) => o.getAll());
  if (!items.length) return;
  const token = await idbTx(d, 'meta', 'readonly', (o) => o.get('token'));
  let sent = 0, retry = false;
  for (const it of items) {
    const headers = { ...it.headers };
    if (token) headers.authorization = 'Bearer ' + token;
    let res;
    try { res = await fetch(it.url, { method: it.method, headers, body: it.body }); }
    catch (e) { retry = true; break; }
    if (res.ok || (res.status === 409 && it.injected && it.method === 'POST')) {
      await idbTx(d, 'queue', 'readwrite', (o) => o.delete(it.id)); sent++; continue;
    }
    if (res.status === 401 || res.status === 408 || res.status === 429 || res.status >= 500) { retry = true; break; }
    let error = String(res.status);
    try { const j = await res.json(); error = j.message || j.hint || j.details || error; } catch (e) {}
    await idbTx(d, 'failed', 'readwrite', (o) => o.add({ ...it, status: res.status, error, failedAt: Date.now() }));
    await idbTx(d, 'queue', 'readwrite', (o) => o.delete(it.id));
  }
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
  clientsList.forEach((c) => c.postMessage({ type: 'bms-sync-done', sent }));
  if (retry) throw new Error('retry later');   // tells the browser to try the sync again
}

self.addEventListener('sync', (e) => {
  if (e.tag !== 'bms-sync') return;
  e.waitUntil(navigator.locks
    ? navigator.locks.request('bms-sync', backgroundSync)
    : backgroundSync());
});
