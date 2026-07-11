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
   ============================================================ */

window.SB_URL = 'https://mfxkkaavgzyttasgqnmw.supabase.co/rest/v1';
window.SB_KEY = 'sb_publishable_ZaaVgQ3LCfq3qu7KSHh5CA_RZ3go9xH';

/* ── Early auth check ────────────────────────────────────────
   Runs immediately (before CDN libs / DOM), matching dashboard.html,
   so an expired/missing session bounces to login before anything
   renders. Skips itself on login.html (no redirect loop). */
(function earlyAuthCheck(){
  // cleanUrls (vercel.json) serves this page at /login, not /login.html, so
  // window.location.pathname never ends in ".html" — the old /login\.html$/
  // check never matched, meaning this guard never skipped itself on the
  // login page and a missing/expired session there could redirect-loop.
  if (/(^|\/)login(\.html)?\/?$/i.test(window.location.pathname)) return;
  function loadSessionEarly(){
    try {
      const raw = localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  const s = loadSessionEarly();
  if (!s || !s.access_token || (s.hard_expiry && s.hard_expiry < Date.now())){
    try{ localStorage.removeItem('injera_session'); sessionStorage.removeItem('injera_session'); }catch(e){}
    window.location.replace('login');
  }
})();

/* ── Access-token refresh ────────────────────────────────────
   Supabase access tokens expire ~1hr; nothing was renewing them,
   so a tab left open past that got silent auth failures (every
   request quietly falling back to the anon key) until a manual
   reload. This decodes the JWT's exp claim and proactively
   refreshes using the stored refresh_token a few minutes before
   it expires. Purely additive — every page's own fetch helpers
   already call loadSession() fresh per-request, so they pick up
   the renewed token automatically with no changes on their end.

   MULTI-TAB SAFETY: this runs independently in every open tab. An
   earlier version had no coordination between tabs, so two tabs
   open around the same ~1hr mark would both fire a refresh within
   moments of each other; the first rotated the refresh_token, the
   second then reused the now-stale one, which Supabase's reuse
   detection rejects (400 refresh_token_already_used) — and it
   revokes the whole session, forcing a full re-login. That's what
   was actually behind "have to log in again every day". Fixed via
   a short localStorage lock (only one tab refreshes at a time),
   jitter (despreads simultaneous timers across tabs), and a
   `storage` listener so other tabs reschedule off the winning
   tab's new token instead of racing their own refresh. */
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
let _refreshTimer = null;
async function refreshAccessToken(){
  const session = loadSession();
  if (!session || !session.refresh_token) return false;
  if (!_acquireRefreshLock()){
    // Another tab is refreshing right now. Don't race it — just check back
    // shortly and reschedule off whatever token it ends up saving.
    setTimeout(scheduleTokenRefresh, 2000);
    return false;
  }
  try{
    const authBase = window.SB_URL.replace(/\/rest\/v1\/?$/, '');
    const res = await fetch(`${authBase}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'apikey': window.SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
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
    console.error('[app-state] token refresh failed', e);
    return false;
  }finally{
    _releaseRefreshLock();
  }
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
  const delay = Math.max(expMs - Date.now() - 5*60*1000, 10*1000) + jitter; // refresh ~5min early, floor 10s
  _refreshTimer = setTimeout(refreshAccessToken, delay);
}
if (!/(^|\/)login(\.html)?\/?$/i.test(window.location.pathname)) scheduleTokenRefresh();
// Whenever ANY tab (including a successful refresh in this one) updates the
// stored session, every other tab reschedules off the new token instead of
// keeping its own stale timer — this is what actually closes the race.
window.addEventListener('storage', (e) => {
  if (e.key === 'injera_session') scheduleTokenRefresh();
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
  localStorage.removeItem('injera_session');
  sessionStorage.removeItem('injera_session');
}
window.currentUser = null;

/* Populates sidebar/topbar user info (avatar initials, name, role)
   and hides role-gated nav items. Called automatically by
   sidebar.js/header.js after they render — you don't need to call
   this yourself. */
function populateUserChrome(){
  const session = loadSession();
  if (!session) return;
  window.currentUser = { id: session.user_id, name: session.name, role: session.role };
  const initials = (session.name || '')
    .split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || '??';
  const roleLbl = session.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : '';

  document.querySelectorAll('.sb-foot .av, .uchip .av, .user-panel-top .av').forEach(el => el.textContent = initials);
  const sbName = document.querySelector('.sb-foot-txt h4'); if (sbName) sbName.textContent = session.name || 'Unknown User';
  const sbRole = document.querySelector('.sb-foot-txt span'); if (sbRole) sbRole.textContent = roleLbl;
  const chipName = document.querySelector('.uchip-txt h4'); if (chipName) chipName.textContent = session.name || 'Unknown User';
  const chipRole = document.querySelector('.uchip-txt span'); if (chipRole) chipRole.textContent = roleLbl;
  const panelName = document.querySelector('.user-panel-name h4'); if (panelName) panelName.textContent = session.name || 'Unknown User';
  const panelRole = document.querySelector('.user-panel-name span'); if (panelRole) panelRole.textContent = `${roleLbl} · ${window.APP_SETTINGS.companyName}`;

  // Only owners/managers see the "Add User" shortcut in the user panel.
  // (The old separate "Manage Users" sidebar link is gone — user management now
  // lives in Settings > Users & Roles, which gates its own tab visibility itself.)
  const isOwnerOrManager = ['owner','manager'].includes(session.role);
  const addUserItem = document.getElementById('userPanelAddUser');
  if (addUserItem) addUserItem.style.display = isOwnerOrManager ? '' : 'none';
}

/* ── Supabase REST helpers ───────────────────────────────────── */
function authHeaders(extra){
  const session = loadSession();
  const token = (session && session.access_token) || window.SB_KEY;
  return Object.assign({
    'apikey': window.SB_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }, extra || {});
}
async function sbGet(path){
  const res = await fetch(`${window.SB_URL}/${path}`, { headers: authHeaders() });
  if(!res.ok){
    let detail=''; try{ detail=(await res.json()).message||''; }catch{}
    throw new Error(`Supabase ${res.status} on ${path.split('?')[0]}${detail?': '+detail:''}`);
  }
  return res.json();
}
async function sbPost(path, body){
  const res = await fetch(`${window.SB_URL}/${path}`, {
    method:'POST',
    headers: authHeaders({ 'Prefer':'return=representation' }),
    body: JSON.stringify(body)
  });
  if(!res.ok){
    let detail=''; try{ detail=(await res.json()).message||''; }catch{}
    throw new Error(detail || `Save failed (${res.status})`);
  }
  return res.json();
}
async function sbPatch(path, body){
  const res = await fetch(`${window.SB_URL}/${path}`, {
    method:'PATCH',
    headers: authHeaders({ 'Prefer':'return=representation' }),
    body: JSON.stringify(body)
  });
  if(!res.ok){
    let detail=''; try{ detail=(await res.json()).message||''; }catch{}
    throw new Error(detail || `Update failed (${res.status})`);
  }
  return res.json();
}
async function sbDelete(path){
  const res = await fetch(`${window.SB_URL}/${path}`, {
    method:'DELETE',
    headers: authHeaders({ 'Prefer':'return=representation' })
  });
  if(!res.ok){
    let detail=''; try{ detail=(await res.json()).message||''; }catch{}
    throw new Error(detail || `Delete failed (${res.status})`);
  }
  return res.json();
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
}

/* ── Confirm modal (replaces browser confirm()) ─────────────────
   Injects the modal markup once, lazily, on first use. Matches
   dashboard.html's showConfirm() exactly. */
function ensureConfirmModal(){
  if (document.getElementById('cfmOverlay')) return;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="cfm-ov" id="cfmOverlay">
      <div class="cfm-box">
        <div class="cfm-ico"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
        <h3 id="cfmTitle">Confirm</h3>
        <p id="cfmMsg"></p>
        <div class="cfm-actions">
          <button class="cfm-btn cfm-btn-cancel" id="cfmCancel">Cancel</button>
          <button class="cfm-btn cfm-btn-danger" id="cfmConfirm">Confirm</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
}
function showConfirm({title, message, confirmLabel = 'Confirm', onConfirm}){
  ensureConfirmModal();
  const ov = document.getElementById('cfmOverlay');
  document.getElementById('cfmTitle').textContent = title;
  document.getElementById('cfmMsg').textContent = message;
  const confirmBtn = document.getElementById('cfmConfirm');
  confirmBtn.textContent = confirmLabel;
  ov.classList.add('show');

  const cancelBtn = document.getElementById('cfmCancel');
  const cleanup = () => {
    ov.classList.remove('show');
    confirmBtn.removeEventListener('click', onConfirmClick);
    cancelBtn.removeEventListener('click', onCancelClick);
    ov.removeEventListener('click', onOverlayClick);
  };
  const onConfirmClick = () => { cleanup(); onConfirm(); };
  const onCancelClick = () => cleanup();
  const onOverlayClick = (e) => { if (e.target === ov) cleanup(); };

  confirmBtn.addEventListener('click', onConfirmClick);
  cancelBtn.addEventListener('click', onCancelClick);
  ov.addEventListener('click', onOverlayClick);
}

/* ── Toast ─────────────────────────────────────────────────────
   toast(msg, type) — type is 'success' | 'error' | omitted (info).
   showToast(msg) is kept as an alias since some existing pages
   (e.g. purchases.html) already call that name. */
function toast(msg, type){
  let stack = document.getElementById('toastStack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.id = 'toastStack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  el.innerHTML = `<svg class="toast-ic" viewBox="0 0 24 24">${icons[type] || icons.info}</svg><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, 3200);
}
function showToast(msg){ toast(msg); }

/* ── Sign out ──────────────────────────────────────────────────
   Confirms via the modal (matching dashboard.html's UX), then
   clears the session, best-effort signs out of Supabase auth if
   the `db` client is on the page, and redirects to login.html. */
function signOut(){
  showConfirm({
    title: 'Sign Out',
    message: `Are you sure you want to sign out of ${window.APP_SETTINGS.companyName} BMS?`,
    confirmLabel: 'Sign Out',
    onConfirm: () => {
      try{ if (window.db && window.db.auth) window.db.auth.signOut(); }catch(e){}
      clearSession();
      window.location.href = 'login';
    }
  });
}

/* ── Global outside-click handling for notif/user/export panels ──
   sidebar.js/header.js call this once after they render. */
let _globalChromeHandlersBound = false;
function bindGlobalChromeHandlers(){
  if (_globalChromeHandlersBound) return;
  _globalChromeHandlersBound = true;
  document.addEventListener('click', () => {
    if (typeof window._notifOpen !== 'undefined' && window._notifOpen){ closeNotif(); }
    if (typeof window._userPanelOpen !== 'undefined' && window._userPanelOpen){
      const panel = document.getElementById('userPanel');
      const chip = document.getElementById('userChip');
      if (panel) panel.classList.remove('open');
      if (chip) chip.classList.remove('open');
      window._userPanelOpen = false;
    }
    const expMenu = document.getElementById('exportMenu');
    if (expMenu && expMenu.classList.contains('show')) expMenu.classList.remove('show');
  });
}
