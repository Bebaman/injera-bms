/* ============================================================
   MENA INJERA & DERKOSH BMS — SHARED APP STATE  (v2)
   Session/auth, Supabase REST helpers, confirm modal, toast,
   sign out — extracted from the live dashboard.html/purchases.html,
   not the outdated derkosh.html prototype.

   Include this ONE script on every page, before sidebar.js,
   header.js, and the page's own script:

     <script src="/js/app-state.js"></script>
     <script src="/js/sidebar.js"></script>
     <script src="/js/header.js"></script>
     <script>...page's own code...</script>
   
   v3 changes (hardening + mobile):
   - Token refresh is now single-flight per tab AND cross-tab safe
     (Web Locks API, localStorage fallback). Parallel requests on page
     load no longer race each other into a forced logout.
   - Only HTTP 401 means "session dead". 403 (permission / RLS denial)
     is surfaced as an error and no longer signs the user out.
   - Requests time out (30s) instead of hanging on flaky mobile data;
     empty (204) responses are handled; 4xx no longer turn the status
     pill red (only network failures / 5xx do).
   - Refresh re-checks on tab foreground / bfcache restore / reconnect
     (phones suspend timers while the screen is off).
   - Sign out revokes this device's refresh token server-side and
     signs out other open tabs.
   - Auto-adds viewport + theme-color meta if a page forgot them.
   - confirm modal: no stacked listeners, Esc/focus handling, ARIA.
   ============================================================ */

window.SB_URL = 'https://mfxkkaavgzyttasgqnmw.supabase.co/rest/v1';
window.SB_KEY = 'sb_publishable_ZaaVgQ3LCfq3qu7KSHh5CA_RZ3go9xH';

/* ── Page helpers ────────────────────────────────────────────── */
// cleanUrls (vercel.json) serves the login page at /login, not /login.html,
// so this matches both forms (and a trailing slash).
function _isLoginPage(){
  return /(^|\/)login(\.html)?\/?$/i.test(window.location.pathname);
}
function _isHardExpired(s){
  return !!(s && s.hard_expiry && s.hard_expiry < Date.now());
}
let _redirectingToLogin = false;
function _redirectToLogin(delayMs){
  if (_redirectingToLogin || _isLoginPage()) return;
  _redirectingToLogin = true;
  setTimeout(() => { window.location.replace('login'); }, delayMs || 0);
}

/* shared-shell.css (v3) declares :root{--bms-shell-v3:1}. When it's present the
   mobile/drawer/header rules come from the stylesheet and the JS below does NOT
   inject its own copy; with an older cached/missing stylesheet it injects the
   same rules itself so the shell still works. */
function _shellCssLoaded(){
  try{ return getComputedStyle(document.documentElement).getPropertyValue('--bms-shell-v3').trim() === '1'; }
  catch(e){ return false; }
}

/* ── Mobile meta + shared touch/mobile CSS ───────────────────
   A page that forgets <meta name="viewport"> renders as a zoomed-out
   980px desktop page on phones, so every media query in the shell is
   silently ignored. Add it (and theme-color for the browser bar) if
   missing. Pages that already declare them are left untouched. */
(function ensureMobileMeta(){
  try{
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    if (!document.querySelector('meta[name="viewport"]')){
      const m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      head.appendChild(m);
    }
    if (!document.querySelector('meta[name="theme-color"]')){
      const t = document.createElement('meta');
      t.name = 'theme-color';
      t.content = '#1B4332';
      head.appendChild(t);
    }
  }catch(e){}
})();

/* Additive only: tap behaviour, focus rings, 44px touch targets on touch
   devices, and keeping toasts / the confirm dialog inside narrow screens.
   Nothing here changes desktop layout. */
(function ensureSharedMobileCSS(){
  try{
    if (document.getElementById('bms-shared-mobile-css') || _shellCssLoaded()) return;
    const style = document.createElement('style');
    style.id = 'bms-shared-mobile-css';
    style.textContent = `
      .tb-ham,.bell,.uchip,.arr,.exp-trigger,.exp-menu-item,.user-panel-item,
      .notif-mark-all,.sb-a,.sb-logout,.cfm-btn,.alert-bar-x{
        touch-action:manipulation; -webkit-tap-highlight-color:transparent;
      }
      .tb-ham:focus-visible,.bell:focus-visible,.uchip:focus-visible,.arr:focus-visible,
      .exp-trigger:focus-visible,.exp-menu-item:focus-visible,.user-panel-item:focus-visible,
      .notif-mark-all:focus-visible,.sb-a:focus-visible,.sb-logout:focus-visible,.cfm-btn:focus-visible{
        outline:2px solid #52B788; outline-offset:2px;
      }
      @media (pointer:coarse){
        .sb-a,.user-panel-item,.exp-menu-item,.cfm-btn{ min-height:44px; }
        .tb-ham,.bell,.arr,.uchip,.exp-trigger{ min-width:44px; min-height:44px; }
      }
      @media (max-width:640px){
        .toast-stack{ max-width:calc(100vw - 24px); }
        .toast{ max-width:100%; box-sizing:border-box; overflow-wrap:anywhere; }
        .cfm-ov{ padding:16px; box-sizing:border-box; overflow-y:auto; }
        .cfm-box{ max-width:calc(100vw - 32px); box-sizing:border-box; }
        .cfm-actions{ flex-wrap:wrap; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }catch(e){}
})();

/* ── Early auth check ────────────────────────────────────────
   Runs immediately (before CDN libs / DOM), matching dashboard.html,
   so an expired/missing session bounces to login before anything
   renders. Skips itself on the login page (no redirect loop). */
(function earlyAuthCheck(){
  if (_isLoginPage()) return;
  function loadSessionEarly(){
    try {
      const raw = localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  const s = loadSessionEarly();
  if (!s || !s.access_token || _isHardExpired(s)){
    try{ localStorage.removeItem('injera_session'); sessionStorage.removeItem('injera_session'); }catch(e){}
    _redirectToLogin();
  }
})();

/* ── Access-token refresh ────────────────────────────────────
   Supabase access tokens expire ~1hr. This decodes the JWT's exp claim
   and proactively refreshes with the stored refresh_token a few minutes
   before it expires; every request path also refreshes on demand.

   CONCURRENCY (this is what used to log people out):
   Supabase rotates the refresh_token on every use and revokes the whole
   session if an old one is replayed. So only ONE refresh may be in
   flight at a time, across ALL tabs:
     1. Same tab: refreshAccessToken() is single-flight — a page that
        fires ten requests at once shares one refresh instead of ten.
     2. Across tabs: serialized with the Web Locks API (waits its turn
        instead of failing), with a localStorage lock as a fallback for
        browsers without it. After winning the lock we re-read the
        session: if another tab already rotated the token we just use it.
   Retries: 3 attempts with short backoff for network blips; a definitive
   400/401 from Supabase is never retried. */
function _decodeJwtExp(token){
  try{
    let b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64));
    return payload.exp ? payload.exp * 1000 : null; // ms since epoch
  } catch(e){ return null; }
}
const REFRESH_LOCK_KEY = 'injera_refresh_lock';
const REFRESH_LOCK_TTL = 10000; // 10s — comfortably longer than one refresh round-trip
function _acquireRefreshLock(){
  try{
    const held = parseInt(localStorage.getItem(REFRESH_LOCK_KEY) || '0', 10);
    if (held && (Date.now() - held) < REFRESH_LOCK_TTL) return false; // another tab has it
    localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()));
    return true;
  }catch(e){ return true; } // localStorage unavailable — don't block refresh over it
}
function _releaseRefreshLock(){
  try{ localStorage.removeItem(REFRESH_LOCK_KEY); }catch(e){}
}
async function _withStorageLock(fn){
  // Fallback when navigator.locks is unavailable: wait (poll) for the other
  // tab to finish rather than giving up. A lock older than the TTL counts
  // as abandoned, so this loop always terminates.
  while (!_acquireRefreshLock()) await new Promise(r => setTimeout(r, 250));
  try{ return await fn(); } finally { _releaseRefreshLock(); }
}
function _withRefreshLock(fn){
  if (typeof navigator !== 'undefined' && navigator.locks && typeof navigator.locks.request === 'function'){
    return navigator.locks.request('injera_token_refresh', fn);
  }
  return _withStorageLock(fn);
}
function _timeoutSignal(ms){
  // Returns { signal, done } — done() clears the timer. Degrades to no
  // timeout on browsers without AbortController.
  if (typeof AbortController === 'undefined') return { signal: undefined, done(){} };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done(){ clearTimeout(t); } };
}

let _refreshTimer = null;
let _refreshInFlight = null;
/* true only when the server DEFINITIVELY rejected the refresh token (or the
   Remember-Me ceiling passed). A refresh that fails because the network is
   down/flaky leaves this false, so we never sign someone out over bad signal. */
let _refreshFatal = false;
const REFRESH_RETRY_DELAYS_MS = [500, 1500]; // between attempt 1→2 and 2→3

function refreshAccessToken(){
  if (_refreshInFlight) return _refreshInFlight;
  const start = loadSession();
  if (!start || !start.refresh_token){ _refreshFatal = true; return Promise.resolve(false); }
  _refreshInFlight = _withRefreshLock(() => _doRefresh(start.refresh_token))
    .catch(e => { console.error('[app-state] token refresh error', e); return false; })
    .finally(() => { _refreshInFlight = null; });
  return _refreshInFlight;
}
async function _doRefresh(staleRefreshToken){
  _refreshFatal = false;
  // We may have waited on the lock while another tab refreshed. If the stored
  // refresh_token is no longer the one we started with, that tab already did
  // the work — adopt its result instead of replaying a now-revoked token.
  let session = loadSession();
  if (!session || !session.refresh_token){ _refreshFatal = true; return false; }
  if (session.refresh_token !== staleRefreshToken){ scheduleTokenRefresh(); return true; }
  if (_isHardExpired(session)){ _refreshFatal = true; return false; }

  const authBase = window.SB_URL.replace(/\/rest\/v1\/?$/, '');
  const maxAttempts = REFRESH_RETRY_DELAYS_MS.length + 1;
  for (let attempt = 0; attempt < maxAttempts; attempt++){
    const t = _timeoutSignal(15000);
    try{
      const res = await fetch(`${authBase}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'apikey': window.SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
        signal: t.signal
      });
      if (!res.ok){
        if (res.status === 400 || res.status === 401){
          // Definitive rejection. One last check: a browser without Web Locks
          // may have lost a cross-tab race — if the stored token changed
          // under us, the other tab won and the session is fine.
          const now = loadSession();
          if (now && now.refresh_token && now.refresh_token !== session.refresh_token){
            scheduleTokenRefresh();
            return true;
          }
          throw Object.assign(new Error(`Refresh rejected (${res.status})`), { fatal: true });
        }
        throw new Error(`Refresh failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.access_token) throw new Error('Refresh response had no access_token');
      // hard_expiry (the "Remember Me" ceiling) is intentionally left untouched —
      // a refreshed access_token must not extend that separate hard cutoff.
      const updated = Object.assign({}, session, {
        access_token: data.access_token,
        refresh_token: data.refresh_token || session.refresh_token
      });
      const usedLocal = !!localStorage.getItem('injera_session');
      (usedLocal ? localStorage : sessionStorage).setItem('injera_session', JSON.stringify(updated));
      scheduleTokenRefresh();
      return true;
    }catch(e){
      const isLastAttempt = attempt === maxAttempts - 1;
      if (e.fatal || isLastAttempt){
        if (e.fatal) _refreshFatal = true;
        console.error('[app-state] token refresh failed', e);
        return false;
      }
      await new Promise(r => setTimeout(r, REFRESH_RETRY_DELAYS_MS[attempt]));
    } finally {
      t.done();
    }
  }
  return false;
}
function scheduleTokenRefresh(){
  if (_refreshTimer) clearTimeout(_refreshTimer);
  const session = loadSession();
  if (!session || !session.access_token) return;
  const expMs = _decodeJwtExp(session.access_token);
  if (!expMs) return;
  // +0-3s jitter so tabs that computed the exact same delay from the exact
  // same token don't all fire in the same instant.
  const jitter = Math.floor(Math.random() * 3000);
  let delay = Math.max(expMs - Date.now() - 5*60*1000, 10*1000) + jitter; // ~5min early, floor 10s
  delay = Math.min(delay, 2147483647); // setTimeout's max
  _refreshTimer = setTimeout(refreshAccessToken, delay);
}

/* Phones suspend timers while the screen is off or the tab is in the
   background, so the scheduled refresh can silently miss its slot. Re-check
   whenever the page comes back (tab focus, bfcache restore, network back). */
function _onForeground(){
  if (_isLoginPage()) return;
  const s = loadSession();
  if (!s || !s.access_token || _isHardExpired(s)){ clearSession(); _redirectToLogin(); return; }
  const expMs = _decodeJwtExp(s.access_token);
  if (expMs && expMs - Date.now() < 5*60*1000){
    refreshAccessToken().then(ok => { if (!ok) scheduleTokenRefresh(); });
  } else {
    scheduleTokenRefresh();
  }
}
if (!_isLoginPage()) scheduleTokenRefresh();
document.addEventListener('visibilitychange', () => { if (!document.hidden) _onForeground(); });
window.addEventListener('pageshow', (e) => { if (e.persisted) _onForeground(); });
window.addEventListener('online', _onForeground);
// Whenever ANY tab updates (or clears) the stored session, react: reschedule
// off a new token, or follow another tab that signed out.
window.addEventListener('storage', (e) => {
  if (e.key !== null && e.key !== 'injera_session') return;
  if (!loadSession()){ _redirectToLogin(); return; }
  scheduleTokenRefresh();
});

/* ── Session ─────────────────────────────────────────────────
   Shape matches what login.html writes:
   { access_token, refresh_token, user_id, email, name, role, hard_expiry } */
function loadSession(){
  try {
    const raw = localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearSession(){
  try{ localStorage.removeItem('injera_session'); }catch(e){}
  try{ sessionStorage.removeItem('injera_session'); }catch(e){}
}
window.currentUser = null;

/* Populates sidebar/topbar user info (avatar initials, name, role)
   and hides role-gated nav items. Called automatically by
   sidebar.js/header.js after they render — you don't need to call
   this yourself. */
function populateUserChrome(){
  const session = loadSession();
  if (!session) return;
  window.currentUser = { id: session.user_id, name: session.name, email: session.email, role: session.role };
  // filter(Boolean) so "Abebe  Kebede" (double space) still gives "AK";
  // Array.from handles characters outside the BMP.
  const initials = (session.name || '')
    .split(/\s+/).filter(Boolean).map(p => Array.from(p)[0]).slice(0,2).join('').toUpperCase() || '??';
  const roleLbl = session.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : '';

  document.querySelectorAll('.sb-foot .av, .uchip .av, .user-panel-top .av').forEach(el => el.textContent = initials);
  const sbName = document.querySelector('.sb-foot-txt h4'); if (sbName) sbName.textContent = session.name || 'Unknown User';
  const sbRole = document.querySelector('.sb-foot-txt span'); if (sbRole) sbRole.textContent = roleLbl;
  const chipName = document.querySelector('.uchip-txt h4'); if (chipName) chipName.textContent = session.name || 'Unknown User';
  const chipRole = document.querySelector('.uchip-txt span'); if (chipRole) chipRole.textContent = roleLbl;
  const panelName = document.querySelector('.user-panel-name h4'); if (panelName) panelName.textContent = session.name || 'Unknown User';
  const panelRole = document.querySelector('.user-panel-name span'); if (panelRole) panelRole.textContent = `${roleLbl} · ${window.APP_SETTINGS.companyName}`;

  // Only owners/managers see the "Manage Users" shortcut in the user panel.
  // (User management lives in Settings > Users & Roles, which gates its own
  // tab visibility itself.)
  const isOwnerOrManager = ['owner','manager'].includes(session.role);
  const addUserItem = document.getElementById('userPanelAddUser');
  if (addUserItem) addUserItem.style.display = isOwnerOrManager ? '' : 'none';
}

/* ── Supabase REST helpers ───────────────────────────────────── */
/* authHeaders() is kept (sync, no validity check) for any callers that
   still reference it directly. All sbGet/sbPost/sbPatch/sbDelete below
   use authHeadersAsync() instead, which verifies the access_token isn't
   expired (or about to expire) before using it, and refreshes inline if
   needed. With no session, only the `apikey` header is sent (a publishable
   key is not a JWT, so it must not go in Authorization). */
function _buildHeaders(session, extra){
  const h = { 'apikey': window.SB_KEY, 'Content-Type': 'application/json' };
  if (session && session.access_token) h['Authorization'] = `Bearer ${session.access_token}`;
  return Object.assign(h, extra || {});
}
function authHeaders(extra){
  return _buildHeaders(loadSession(), extra);
}
async function authHeadersAsync(extra){
  let session = loadSession();
  if (session && session.access_token){
    const expMs = _decodeJwtExp(session.access_token);
    // Expiring within 30s — refresh now and wait for it rather than firing
    // the request on a token that's dead or about to be. (If the exp claim
    // can't be read we don't guess; the 401 path in _sbRequest recovers.)
    if (expMs && expMs - Date.now() < 30000){
      // Known offline: don't wait on a refresh that can't succeed — go on with the saved token
      // (reads come from the device copy, writes are queued). On a dead connection that merely
      // looks online the refresh can hang for ~45 s, so wait at most 2 s; if it is still not done
      // the request goes out and the existing 401 path finishes the refresh if the server needs it.
      const _off = navigator.onLine === false || window.getSyncState?.() === 'offline';
      if (!_off){
        const ok = await Promise.race([refreshAccessToken(), new Promise(r => setTimeout(() => r(null), 2000))]);
        if (ok) session = loadSession();
      }
    }
  }
  return _buildHeaders(session, extra);
}

const SB_REQUEST_TIMEOUT_MS = 30000;
async function _errorDetail(res){
  try{
    const txt = await res.text();
    if (!txt) return '';
    try{
      const j = JSON.parse(txt);
      return j.message || j.error_description || j.msg || j.error || '';
    }catch{ return txt.slice(0, 200); }
  }catch{ return ''; }
}
async function _parseBody(res){
  if (res.status === 204) return [];
  const txt = await res.text();
  if (!txt) return [];
  try{ return JSON.parse(txt); }
  catch{ throw new Error('The server sent an unexpected response.'); }
}

/* Shared request core for sbGet/sbPost/sbPatch/sbDelete.
   - 401 (and only 401): force one real refresh and retry ONCE. If that still
     fails the session is genuinely dead → clear it and go to login.
   - 403 is a permission/RLS denial, NOT a dead session — surfaced as an
     error, the user stays signed in.
   - Network failure / timeout → friendly error + red status pill.
   - Drives the shared status pill (header.js setSyncStatus): only network
     failures and 5xx turn it red; a 400/409 validation error on a save
     means the server is reachable, so the pill stays green. */
async function _sbRequest(method, path, body, extraHeaders, fallbackMsg){
  const send = async () => {
    const headers = await authHeadersAsync(extraHeaders);
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);
    else delete headers['Content-Type']; // no body → no preflight-triggering header
    const t = _timeoutSignal(SB_REQUEST_TIMEOUT_MS);
    opts.signal = t.signal;
    try{
      return await fetch(`${window.SB_URL}/${path}`, opts);
    }catch(err){
      const timedOut = err && err.name === 'AbortError';
      // No connection at all is "offline", not a server fault.
      window.setSyncStatus?.(timedOut ? 'error' : 'offline', { message: 'Connection lost — retrying…' });
      throw Object.assign(new Error(timedOut
        ? 'The server took too long to respond. Please try again.'
        : 'Could not reach the server. Check your internet connection.'), { offline: !timedOut });
    }finally{
      t.done();
    }
  };

  let res = await send();
  let _refreshedOk = false, _hadSession = false;
  if (res.status === 401 && loadSession()){
    _hadSession = true;
    _refreshedOk = await refreshAccessToken();
    if (_refreshedOk) res = await send();
  }

  if (!res.ok){
    const detail = await _errorDetail(res);
    if (res.status === 401 && _hadSession && !_refreshedOk && !_refreshFatal && !_isHardExpired(loadSession())){
      // The access token is stale and the refresh couldn't complete because of
      // the connection (offline / weak signal) — NOT because the session is
      // dead. Keep the user signed in; the next request retries the refresh.
      window.setSyncStatus?.('error', { message: 'Connection unstable — retrying…' });
      throw new Error('Connection problem — please try again in a moment.');
    }
    if (res.status === 401){
      // Genuinely dead session — refresh (and the retry above) couldn't save
      // it. Clear it and bounce to login instead of leaving a raw error.
      clearSession();
      if (typeof toast === 'function') toast('Your session has expired. Please sign in again.', 'error');
      _redirectToLogin(1200);
      throw Object.assign(new Error('Your session has expired. Please sign in again.'), { sessionExpired: true });
    }
    // The service worker answers 503 + X-BMS-Offline when there is no connection AND no saved copy.
    const _noConn = !!(res.headers && res.headers.get('x-bms-offline'));
    if (_noConn) window.setSyncStatus?.('offline');
    else if (res.status >= 500) window.setSyncStatus?.('error', { message: 'Some data failed to load' });
    else window.setSyncStatus?.('live');
    if (_noConn) throw Object.assign(new Error('You are offline and this data was not saved on this device yet.'), { offline: true });
    if (res.status === 403) throw new Error(detail || "You don't have permission to do that.");
    throw new Error(detail || fallbackMsg(res.status));
  }
  // A reply the service worker took from its saved copy is not live data: keep the pill on "offline".
  if (res.headers && res.headers.get('x-bms-cache')) window.setSyncStatus?.('offline');
  else window.setSyncStatus?.('live');
  return _parseBody(res);
}
async function sbGet(path){
  return _sbRequest('GET', path, undefined, undefined,
    (status) => `Supabase ${status} on ${path.split('?')[0]}`);
}
async function sbPost(path, body){
  return _sbRequest('POST', path, body, { 'Prefer':'return=representation' },
    (status) => `Save failed (${status})`);
}
async function sbPatch(path, body){
  return _sbRequest('PATCH', path, body, { 'Prefer':'return=representation' },
    (status) => `Update failed (${status})`);
}
async function sbDelete(path){
  return _sbRequest('DELETE', path, undefined, { 'Prefer':'return=representation' },
    (status) => `Delete failed (${status})`);
}

/* ── Company settings (name / currency) ─────────────────
   Cached on window.APP_SETTINGS; falls back to current defaults.
   Reads from the real `business_settings` table (business_name column).
   There is no currency column in the schema — ETB is fixed for this
   business, so it stays a hardcoded default rather than a lookup. */
window.APP_SETTINGS = {
  companyName: 'Mena Injera',
  currency: 'ETB'
};
async function loadCompanySettings(){
  try{
    const rows = await sbGet('business_settings?select=business_name&limit=1');
    if (rows && rows[0] && rows[0].business_name){
      window.APP_SETTINGS.companyName = rows[0].business_name;
    }
  }catch(e){ /* business_settings may be unreachable — keep defaults */ }
  document.querySelectorAll('[data-company-name]').forEach(el => el.textContent = window.APP_SETTINGS.companyName);
  // The user panel's "Role · Company" line was painted with the default name
  // before this finished — repaint now that the real name is known.
  populateUserChrome();
}

/* ── Confirm modal (replaces browser confirm()) ─────────────────
   Injects the modal markup once, lazily, on first use. Matches
   dashboard.html's showConfirm() exactly, plus: Esc cancels, focus moves
   into the dialog and returns afterwards, and calling it while one is
   already open replaces it cleanly (listeners never stack up). */
function ensureConfirmModal(){
  if (document.getElementById('cfmOverlay')) return;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="cfm-ov" id="cfmOverlay">
      <div class="cfm-box" role="dialog" aria-modal="true" aria-labelledby="cfmTitle" aria-describedby="cfmMsg">
        <div class="cfm-ico"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
        <h3 id="cfmTitle">Confirm</h3>
        <p id="cfmMsg"></p>
        <div class="cfm-actions">
          <button type="button" class="cfm-btn cfm-btn-cancel" id="cfmCancel">Cancel</button>
          <button type="button" class="cfm-btn cfm-btn-danger" id="cfmConfirm">Confirm</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
}
let _cfmCleanup = null;
function showConfirm({title, message, confirmLabel = 'Confirm', onConfirm, onCancel} = {}){
  ensureConfirmModal();
  if (_cfmCleanup) _cfmCleanup(); // replace any dialog that's still open

  const ov = document.getElementById('cfmOverlay');
  const confirmBtn = document.getElementById('cfmConfirm');
  const cancelBtn = document.getElementById('cfmCancel');
  document.getElementById('cfmTitle').textContent = title || 'Confirm';
  document.getElementById('cfmMsg').textContent = message || '';
  confirmBtn.textContent = confirmLabel;
  const previouslyFocused = document.activeElement;
  ov.classList.add('show');
  // Focus Cancel, not Confirm — these dialogs guard destructive actions.
  setTimeout(() => cancelBtn.focus(), 0);

  const cleanup = () => {
    ov.classList.remove('show');
    confirmBtn.removeEventListener('click', onConfirmClick);
    cancelBtn.removeEventListener('click', onCancelClick);
    ov.removeEventListener('click', onOverlayClick);
    document.removeEventListener('keydown', onKey, true);
    _cfmCleanup = null;
    try{ if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus(); }catch(e){}
  };
  const onConfirmClick = () => { cleanup(); if (typeof onConfirm === 'function') onConfirm(); };
  const onCancelClick = () => { cleanup(); if (typeof onCancel === 'function') onCancel(); };
  const onOverlayClick = (e) => { if (e.target === ov) onCancelClick(); };
  const onKey = (e) => {
    if (e.key === 'Escape'){ e.stopPropagation(); onCancelClick(); }
    else if (e.key === 'Tab'){
      // Keep keyboard focus inside the dialog while it's open.
      const first = cancelBtn, last = confirmBtn;
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  };
  _cfmCleanup = cleanup;

  confirmBtn.addEventListener('click', onConfirmClick);
  cancelBtn.addEventListener('click', onCancelClick);
  ov.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKey, true);
}

/* ── Toast ─────────────────────────────────────────────────────
   toast(msg, type) — type is 'success' | 'error' | omitted (info).
   showToast(msg) is kept as an alias since some existing pages
   (e.g. purchases.html) already call that name. */
// Escapes untrusted text before it's interpolated into an innerHTML
// template string — customer names, notification text, and other
// free-entry fields have no format restriction, so without this a name
// containing e.g. "<img src=x onerror=...>" runs as real script for
// anyone who views a page rendering it. Shared here (not per-module) so
// every page's toast()/notifications/tables get the same protection.
function esc(str){
  return String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function toast(msg, type){
  let stack = document.getElementById('toastStack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.id = 'toastStack';
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  el.innerHTML = `<svg class="toast-ic" viewBox="0 0 24 24">${icons[type] || icons.info}</svg><span>${esc(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, 3200);
}
function showToast(msg){ toast(msg); }

/* ── Sign out ──────────────────────────────────────────────────
   Confirms via the modal (matching dashboard.html's UX), then revokes THIS
   device's refresh token on the server (scope=local — other devices stay
   signed in), clears the session, and redirects to login. Other open tabs
   follow via the `storage` listener above. */
function signOut(){
  showConfirm({
    title: 'Sign Out',
    message: `Are you sure you want to sign out of ${window.APP_SETTINGS.companyName} BMS?`,
    confirmLabel: 'Sign Out',
    onConfirm: _performSignOut
  });
}
function _performSignOut(){
  const session = loadSession();
  try{ if (window.db && window.db.auth) window.db.auth.signOut(); }catch(e){}
  if (session && session.access_token){
    try{
      const authBase = window.SB_URL.replace(/\/rest\/v1\/?$/, '');
      // keepalive lets the request finish even though we navigate away at once.
      fetch(`${authBase}/auth/v1/logout?scope=local`, {
        method: 'POST', keepalive: true,
        headers: { 'apikey': window.SB_KEY, 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => {});
    }catch(e){}
  }
  if (_refreshTimer) clearTimeout(_refreshTimer);
  _releaseRefreshLock();
  clearSession();
  _redirectingToLogin = true; // storage event from this tab's own clear must not race us
  window.location.href = 'login';
}

/* ── Global outside-click / keyboard handling ───────────────────
   sidebar.js/header.js call this once after they render.
   - Click outside closes the notif / user / export panels.
   - Escape closes the shared chrome (sidebar, panels).
   - Enter/Space activates role="button" elements inside the sidebar and
     header (they're <div>s, which browsers don't make keyboard-activatable).
   Page-specific Escape behavior (e.g. closing a page's own modal) still
   belongs in that page's own listener. */
let _globalChromeHandlersBound = false;
function bindGlobalChromeHandlers(){
  if (_globalChromeHandlersBound) return;
  _globalChromeHandlersBound = true;

  document.addEventListener('click', (e) => {
    const inside = (sel) => !!(e.target && e.target.closest && e.target.closest(sel));
    if (window._notifOpen && !inside('#notifPanel') && typeof closeNotif === 'function') closeNotif();
    if (window._userPanelOpen && typeof closeUserPanel === 'function') closeUserPanel();
    if (typeof closeExportMenu === 'function') closeExportMenu();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches &&
        e.target.matches('[role="button"][tabindex]') && e.target.closest('#sidebar, #header-root')){
      e.preventDefault();
      e.target.click();
      return;
    }
    if (e.key !== 'Escape') return;
    if (window._notifOpen && typeof closeNotif === 'function') closeNotif();
    if (window._userPanelOpen && typeof closeUserPanel === 'function') closeUserPanel();
    if (typeof closeExportMenu === 'function') closeExportMenu();
    const sb = document.getElementById('sidebar');
    if (sb?.classList.contains('open') && typeof closeSidebar === 'function') closeSidebar();
    if (sb?.classList.contains('pinned-open') && typeof unpinSidebar === 'function') unpinSidebar();
  });
}
