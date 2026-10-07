/* offline-sync.js — loaded FIRST in <head> of every page.
   - Registers the service worker (/sw.js).
   - Wraps window.fetch: Supabase writes (POST/PATCH/PUT/DELETE on /rest/v1/)
     that can't reach the server are saved in IndexedDB and replayed, in
     order, when the connection returns. Existing sbPost/sbPatch/sbDelete
     code needs no changes.
   - New rows get a client-made uuid `id` so follow-up writes that need the id
     (production batch -> materials, purchases, cash transfers) still work offline.
   - Rows the database rejects at sync time (period locked, constraints) are
     kept in a "rejected" list for review — never silently dropped. */
(function () {
  'use strict';
  if (window.OfflineSync) return;

  const realFetch = window.fetch.bind(window);
  const DB_NAME = 'bms-offline', QUEUE = 'queue', FAILED = 'failed';
  const WRITE = ['POST', 'PATCH', 'PUT', 'DELETE'];
  // Tables whose primary key is NOT a plain `id` uuid — never inject an id.
  const NO_ID = new Set(['channel_opening_balances', 'inventory_opening_balances',
    'period_closes', 'report_notes', 'batch_standards', 'notification_engagement', 'users']);

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(() => {
        // Logged out (or on the login page) → drop cached business data.
        let has = false;
        try { has = !!(localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session')); } catch (e) {}
        if (!has && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('CLEAR_DATA');
      }).catch(() => {});
    });
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  /* ---------- IndexedDB ---------- */
  let dbp;
  function openDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 2);   // same schema/version as sw.js
      r.onupgradeneeded = () => {
        const d = r.result;
        [QUEUE, FAILED].forEach((n) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: 'id', autoIncrement: true }); });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  const getDB = () => dbp || (dbp = openDB());
  async function tx(store, mode, fn) {
    const d = await getDB();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const rq = fn(t.objectStore(store));
      t.oncomplete = () => res(rq ? rq.result : undefined);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  }
  const add = (s, v) => tx(s, 'readwrite', (o) => o.add(v));
  const all = (s) => tx(s, 'readonly', (o) => o.getAll());
  const del = (s, id) => tx(s, 'readwrite', (o) => o.delete(id));
  const count = (s) => tx(s, 'readonly', (o) => o.count());

  /* ---------- helpers ---------- */
  const restPath = (url) => { try { const u = new URL(url, location.href);
    return u.hostname.endsWith('.supabase.co') && u.pathname.startsWith('/rest/v1/') ? u.pathname.slice(9) : null; }
    catch (e) { return null; } };
  const tableOf = (url) => (restPath(url) || '').split('?')[0].split('/')[0];
  const isQueueable = (url) => { const p = restPath(url); return p !== null && !p.startsWith('rpc/'); };

  function headersToObject(h) {
    const out = {};
    if (!h) return out;
    if (h instanceof Headers) h.forEach((v, k) => (out[k.toLowerCase()] = v));
    else if (Array.isArray(h)) h.forEach(([k, v]) => (out[String(k).toLowerCase()] = v));
    else Object.keys(h).forEach((k) => (out[k.toLowerCase()] = h[k]));
    return out;
  }
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));

  async function snapshot(input, init, method, url) {
    let headers = {}, body = null;
    if (input instanceof Request) {
      headers = headersToObject(input.headers);
      if (method !== 'DELETE') body = await input.clone().text();
    }
    if (init) {
      Object.assign(headers, headersToObject(init.headers));
      if (init.body !== undefined && init.body !== null) {
        if (typeof init.body !== 'string') return null; // FormData/Blob: don't queue
        body = init.body;
      }
    }
    return { url, method, headers, body, ts: Date.now() };
  }

  // Give new rows an id now, so dependent writes can reference it before sync.
  function injectIds(snap) {
    if (snap.method !== 'POST' || !snap.body || NO_ID.has(tableOf(snap.url))) return [];
    if (/on_conflict=/i.test(snap.url) || /resolution=/i.test(snap.headers.prefer || '')) return [];
    try {
      const b = JSON.parse(snap.body);
      const rows = Array.isArray(b) ? b : [b];
      if (!rows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) return [];
      rows.forEach((r) => { if (!r.id) { r.id = uuid(); snap.injected = true; } });
      snap.body = JSON.stringify(Array.isArray(b) ? rows : rows[0]);
      return rows;
    } catch (e) { return []; }
  }

  /* ---------- background sync (works with the app closed on Chrome/Edge) ---------- */
  // The service worker can't read localStorage, so keep a copy of the latest access
  // token in IndexedDB for it to use. (Safari/iOS has no Background Sync: there the
  // queue uploads the next time the site is opened.)
  async function saveToken() {
    try {
      const raw = localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session');
      const t = raw && JSON.parse(raw).access_token;
      if (t) { const d = await getDB(); await new Promise((res, rej) => { const x = d.transaction('meta', 'readwrite'); x.objectStore('meta').put(t, 'token'); x.oncomplete = res; x.onerror = () => rej(x.error); }); }
    } catch (e) {}
  }
  function requestBackgroundSync() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => reg.sync && reg.sync.register('bms-sync')).catch(() => {});
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'bms-sync-done') {
        refreshCounts();
        if (e.data.sent) {
          window.dispatchEvent(new CustomEvent('offline-sync:done', { detail: { sent: e.data.sent } }));
          if (window.setSyncStatus && navigator.onLine) window.setSyncStatus('live');
        }
      }
    });
  }
  setInterval(saveToken, 120000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveToken(); });
  window.addEventListener('DOMContentLoaded', saveToken);

  /* ---------- status + badge ---------- */
  const state = { online: navigator.onLine, syncing: false, pending: 0, failed: 0 };
  let badge;
  async function refreshCounts() {
    try { state.pending = await count(QUEUE); state.failed = await count(FAILED); } catch (e) {}
    state.online = navigator.onLine;
    paint();
    window.dispatchEvent(new CustomEvent('offline-sync:status', { detail: { ...state } }));
  }
  function paint() {
    if (!document.body) return;
    if (!badge) {
      badge = document.createElement('div');
      badge.setAttribute('role', 'status');
      badge.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:99999;' +
        'padding:8px 16px;border-radius:999px;font:700 13px Nunito,system-ui,sans-serif;color:#fff;' +
        'box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;display:none;max-width:90vw;text-align:center';
      badge.addEventListener('click', showFailed);
      document.body.appendChild(badge);
    }
    // The header status pill already shows all of this when its text is visible;
    // use the floating badge only on phones (pill collapses to a dot) or pages without a header.
    const pillText = document.getElementById('statText');
    const pillVisible = !!(pillText && getComputedStyle(pillText).display !== 'none');
    if (pillVisible) { badge.style.display = 'none'; return; }
    let text = '', bg = '#2D6A4F';
    if (state.failed) { text = state.failed + ' offline change(s) rejected — tap to review'; bg = '#B42318'; }
    else if (state.syncing) text = 'Syncing ' + state.pending + '…';
    else if (!state.online) { text = 'Offline' + (state.pending ? ' · ' + state.pending + ' saved on this device' : ''); bg = '#8A6D1D'; }
    else if (state.pending) { text = state.pending + ' waiting to sync'; bg = '#8A6D1D'; }
    badge.textContent = text; badge.style.background = bg; badge.style.display = text ? 'block' : 'none';
  }
  async function showFailed() {
    if (!state.failed) return;
    const list = await all(FAILED);
    const msg = list.map((f) => f.method + ' ' + (tableOf(f.url)) + '\n  → ' + (f.error || f.status)).join('\n\n');
    if (confirm('The database rejected these changes made offline:\n\n' + msg +
      '\n\nOK = discard them.  Cancel = keep for now.')) {
      for (const f of list) await del(FAILED, f.id);
      refreshCounts();
    }
  }
  // _sbRequest reports "live" after our fake success; re-assert the offline pill.
  function reassertOffline() {
    if (navigator.onLine === false) setTimeout(() => window.setSyncStatus && window.setSyncStatus('offline'), 80);
  }

  /* ---------- offline-aware fetch ---------- */
  window.fetch = async function (input, init) {
    const url = input instanceof Request ? input.url : String(input);
    const method = String((init && init.method) || (input instanceof Request && input.method) || 'GET').toUpperCase();
    if (restPath(url) !== null && navigator.onLine === false) reassertOffline();
    if (!WRITE.includes(method) || !isQueueable(url)) return realFetch(input, init);

    const snap = await snapshot(input, init, method, url);
    if (!snap) return realFetch(input, init);
    const rows = injectIds(snap);
    // Online: send the (id-stamped) request. Offline: skip straight to the queue.
    if (navigator.onLine) {
      try {
        return await realFetch(input instanceof Request && snap.injected ? input.url : input,
          snap.injected ? { ...(init || {}), method, headers: snap.headers, body: snap.body } : init);
      } catch (err) {
        if (!(err instanceof TypeError) && !(err && err.name === 'AbortError')) throw err;
      }
    }
    await saveToken();
    await add(QUEUE, snap);
    await refreshCounts();
    requestBackgroundSync();
    reassertOffline();

    const wantsRows = /return=representation/i.test(snap.headers.prefer || '');
    const payload = method === 'POST' && wantsRows ? rows.map((r) => ({ ...r, _offline: true })) : (wantsRows ? [] : null);
    return new Response(payload ? JSON.stringify(payload) : null, {
      status: payload ? (method === 'POST' ? 201 : 200) : (method === 'POST' ? 201 : 204),
      headers: { 'Content-Type': 'application/json', 'X-Offline-Queued': '1' }
    });
  };

  /* ---------- replay ---------- */
  let authProvider = null;
  async function freshAuth(headers) {
    try {
      if (authProvider) { const t = await authProvider(); if (t) headers.authorization = 'Bearer ' + t; }
      else if (typeof authHeadersAsync === 'function') {   // app-state.js: refreshes an expired JWT
        const h = await authHeadersAsync();
        if (h && h.Authorization) headers.authorization = h.Authorization;
      }
    } catch (e) {}
  }
  function sync() {
    if (state.syncing || !navigator.onLine) return Promise.resolve();
    if (!navigator.locks) return runSync();
    // ifAvailable: if the service worker is already uploading, don't double-send.
    return navigator.locks.request('bms-sync', { ifAvailable: true }, (lock) => (lock ? runSync() : undefined));
  }
  async function runSync() {
    if (state.syncing || !navigator.onLine) return;
    let items;
    try { items = await all(QUEUE); } catch (e) { return; }
    if (!items.length) return refreshCounts();
    state.syncing = true; paint();
    let sent = 0;
    for (const it of items) {
      const headers = { ...it.headers };
      await freshAuth(headers);
      let res;
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);   // a dead connection must not leave "Syncing…" pulsing forever
      try { res = await realFetch(it.url, { method: it.method, headers, body: it.body, signal: ctl.signal }); }
      catch (e) { break; }                                   // still offline: stop, keep order
      finally { clearTimeout(to); }
      if (res.ok) { await del(QUEUE, it.id); sent++; continue; }
      // Our own retry of a row that already reached the server → treat as done.
      if (res.status === 409 && it.injected && it.method === 'POST') { await del(QUEUE, it.id); sent++; continue; }
      if (res.status === 401 || res.status === 408 || res.status === 429 || res.status >= 500) break; // retry later
      let error = String(res.status);
      try { const j = await res.json(); error = j.message || j.hint || j.details || error; } catch (e) {}
      await add(FAILED, { ...it, status: res.status, error, failedAt: Date.now() });
      await del(QUEUE, it.id);
    }
    state.syncing = false;
    await refreshCounts();
    if (sent) {
      window.dispatchEvent(new CustomEvent('offline-sync:done', { detail: { sent } }));
      if (window.setSyncStatus) window.setSyncStatus('live');
    }
  }

  window.addEventListener('online', () => { refreshCounts(); setTimeout(sync, 800); });
  window.addEventListener('offline', refreshCounts);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
  setInterval(sync, 30000);
  window.addEventListener('DOMContentLoaded', () => { refreshCounts(); setTimeout(sync, 1500); });

  /* ---------- real connectivity check (drives the header status pill) ----------
     navigator.onLine only knows if there is a network link, not whether Supabase is
     reachable. Ping the auth health endpoint (the service worker never touches
     /auth/, so it can't be answered from cache). Any HTTP response = reachable. */
  let probeFails = 0, probing = false;
  async function probe() {
    if (probing) return;
    const base = String(window.SB_URL || '').replace(/\/rest\/v1\/?$/, '');
    if (!base || !window.SB_KEY || !window.setSyncStatus) return;
    if (navigator.onLine === false) { window.setSyncStatus('offline'); return; }
    probing = true;
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 5000);
    try {
      await realFetch(base + '/auth/v1/health', { headers: { apikey: window.SB_KEY }, signal: ctl.signal, cache: 'no-store' });
      probeFails = 0;
      const cur = window.getSyncState ? window.getSyncState() : 'live';
      if (cur !== 'live') window.setSyncStatus('live');
    } catch (e) {
      // Wi-Fi / mobile data that is connected but has no internet leaves navigator.onLine true, so
      // the probe is the only thing that can say so. Re-check once quickly, then call it offline.
      if (++probeFails >= 2) window.setSyncStatus('offline');
      else setTimeout(probe, 1500);
    } finally { clearTimeout(to); probing = false; }
  }
  window.addEventListener('online', () => setTimeout(probe, 300));
  window.addEventListener('DOMContentLoaded', () => setTimeout(probe, 1200));
  // every 20 s while live; every 5 s while offline / reconnecting so the pill recovers quickly
  let probeTick = 0;
  setInterval(() => {
    if (document.hidden) return;
    const st = window.getSyncState ? window.getSyncState() : 'live';
    if (st !== 'live' || ++probeTick % 4 === 0) probe();
  }, 5000);
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('#statPill') && state.failed) showFailed();
  });

  window.OfflineSync = {
    sync, probe, status: () => ({ ...state }), failed: () => all(FAILED), review: showFailed,
    setAuthProvider: (fn) => { authProvider = fn; }
  };
})();
