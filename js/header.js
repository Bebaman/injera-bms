/* ============================================================
   MENA INJERA & DERKOSH BMS — SHARED HEADER (TOPBAR)  (v2)
   Matches dashboard.html's real markup/IDs: notif-panel (not
   .dropdown), user-panel, optional export menu, optional month
   picker, optional alert bar.

   Usage inside <div class="main" id="mainContent">:
     <div id="header-root"></div>
     <div class="content">...page content...</div>

   Then call once your page's data is ready:

     renderHeader({
       title: 'Dashboard',
       subtitle: 'Overview of your business',
       showMonthPicker: true,
       months: ['Jan 2026', 'Feb 2026', ...],
       selectedMonth: 'May 2026',
       onMonthChange: (label) => { ...your refresh logic... },
       showExport: true,                 // adds the Export button + menu
       onExportPdf: () => { ... },
       onExportXlsx: () => { ... },
       notifications: [
         { type:'r', title:'Gomen Zere stock is below reorder level', sub:'Current: 2.50 kg', time:'10 min ago' }
       ],                                 // type: r|o|p|b|g — matches notif-item-ico colors
       onViewAllNotifications: () => { ...open your page's full alerts view... }, // optional — adds a "View All" link next to "Mark all read"; omitted entirely if not supplied
       alert: {                           // optional red banner (off by default — no live page uses it yet)
         message: '<strong>2 items</strong> need reorder.',
         linkText: 'View Inventory',
         onLinkClick: () => { window.location.href = 'inventory.html'; }
       }
     });

   Optional extras:
       onProfileClick: () => {...}   // "My Profile" item (default: settings.html#profile)
       onHelpClick:    () => {...}   // "Help & Support" item (default: info toast)

   Today's date: shown on every screen size (chip beside the bell on tablet/
   desktop, a small line under the page title on phones), read from the device
   clock and refreshed at midnight / when a sleeping phone wakes. Turn off with
   showDate:false. A `bms:daychange` window event fires with { date:'YYYY-MM-DD' }.
   getTodayLabel() -> "Wed, 7 Oct 2026", getTodayISO() -> "2026-10-07".

   Month picker (showMonthPicker) is self-maintaining:
     - `months` is optional. Any "Mon YYYY" list you pass is extended to cover
       the CURRENT month plus `monthsAhead` months (default 24) into the
       future, using the device clock — so a hard-coded list never goes stale.
     - `selectedMonth` defaults to the current month if omitted / not in list.
     - When the calendar month rolls over (even in a tab left open overnight,
       or a phone waking up) the list extends itself, the user's selection is
       kept, `onMonthRollover(label)` is called and a `bms:monthchange`
       window event fires. getCurrentMonthLabel() returns e.g. "Oct 2026".

   Everything is optional except `title`.

   v3 changes: keyboard/screen-reader support on every control, month picker
   + connection dot stay available on tablets/phones, floating panels are
   positioned and sized to the phone viewport, export menu no longer needs
   a double-click after an outside-click, status pill no longer resets to
   "Connecting…" when the header renders after data has loaded.
   ============================================================ */

/* ── Favicon (shared across every page) ───────────────────────
   Injected once, here, so individual HTML files no longer need
   to hardcode <link rel="icon"> tags in their own <head>. Safe to
   run even if a page still has old tags left over — it skips any
   rel+href pair that's already present instead of duplicating it. */
(function ensureFavicons(){
  const FAVICONS = [
    { rel: 'icon',             type: 'image/x-icon', href: '/favicon/favicon.ico' },
    { rel: 'icon',             type: 'image/png',     sizes: '16x16',  href: '/favicon/favicon-16x16.png' },
    { rel: 'icon',             type: 'image/png',     sizes: '32x32',  href: '/favicon/favicon-32x32.png' },
    { rel: 'icon',             type: 'image/png',     sizes: '48x48',  href: '/favicon/favicon-48x48.png' },
    { rel: 'icon',             type: 'image/png',     sizes: '192x192', href: '/favicon/android-chrome-192x192.png' },
    { rel: 'icon',             type: 'image/png',     sizes: '512x512', href: '/favicon/android-chrome-512x512.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
    { rel: 'manifest',         href: '/favicon/site.webmanifest' }
  ];
  const existing = Array.from(document.querySelectorAll('link')).map(l => l.rel + '|' + (l.getAttribute('href') || ''));
  FAVICONS.forEach(f => {
    if (existing.includes(f.rel + '|' + f.href)) return;
    const link = document.createElement('link');
    Object.keys(f).forEach(k => link.setAttribute(k, f[k]));
    document.head.appendChild(link);
  });
})();

let _headerConfig = {};

/* ── Month engine ──────────────────────────────────────────────
   Fixed English short names on purpose (not toLocaleString): a phone set
   to Amharic or any other locale must still produce the same "Oct 2026"
   labels pages compare against. */
const _MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function _monthIndex(label){
  const m = /^([A-Za-z]{3})\s+(\d{4})$/.exec(String(label == null ? '' : label).trim());
  if (!m) return null;
  const i = _MONTH_NAMES.findIndex(n => n.toLowerCase() === m[1].toLowerCase());
  return i < 0 ? null : parseInt(m[2], 10) * 12 + i;
}
function _monthLabel(idx){ return _MONTH_NAMES[idx % 12] + ' ' + Math.floor(idx / 12); }
function _currentMonthIndex(){ const d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
function getCurrentMonthLabel(){ return _monthLabel(_currentMonthIndex()); }
window.getCurrentMonthLabel = getCurrentMonthLabel;

/* ── Today's date ──────────────────────────────────────────────
   Fixed English names (not toLocale…) so every device shows the same text. */
const _DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const _DAY_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const _MONTH_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function getTodayLabel(){
  const d = new Date();
  return `${_DAY_SHORT[d.getDay()]}, ${d.getDate()} ${_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
function getTodayISO(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function _getTodayLong(){
  const d = new Date();
  return `${_DAY_LONG[d.getDay()]}, ${d.getDate()} ${_MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
}
window.getTodayLabel = getTodayLabel;
window.getTodayISO = getTodayISO;
function _updateDateDisplay(){
  const label = getTodayLabel(), iso = getTodayISO();
  document.querySelectorAll('.tb-date-txt').forEach(el => { el.textContent = label; el.setAttribute('datetime', iso); });
  const chip = document.getElementById('tbDate');
  if (chip){ chip.title = _getTodayLong(); chip.setAttribute('aria-label', 'Today is ' + _getTodayLong()); }
}

// Returns a contiguous list that always covers [earliest given … current month
// + monthsAhead] and the selected month, in the same direction (oldest-first or
// newest-first) the page supplied. A list in some other label format is
// returned untouched rather than guessed at.
function buildMonthList(months, selected, monthsAhead){
  const given = Array.isArray(months) ? months : [];
  const idxs = given.map(_monthIndex);
  if (idxs.some(i => i === null)) return given.slice();
  const cur = _currentMonthIndex();
  const ahead = Number.isFinite(monthsAhead) ? monthsAhead : 24;
  let start = idxs.length ? Math.min(...idxs) : (Math.floor(cur / 12) - 1) * 12; // default: Jan of last year
  let end = Math.max(cur + ahead, ...idxs);
  const sel = _monthIndex(selected);
  if (sel !== null){ start = Math.min(start, sel); end = Math.max(end, sel); }
  const out = [];
  for (let i = start; i <= end; i++) out.push(_monthLabel(i));
  const descending = idxs.length > 1 && idxs[0] > idxs[idxs.length - 1];
  return descending ? out.reverse() : out;
}

let _monthWatchTimer = null;
let _lastMonthLabel = null;
let _lastDayKey = null;
function _armMonthWatch(){
  clearTimeout(_monthWatchTimer);
  _lastMonthLabel = getCurrentMonthLabel();
  _lastDayKey = getTodayISO();
  _updateDateDisplay();
  const n = new Date();
  const nextMidnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 1);
  _monthWatchTimer = setTimeout(_checkMonthRollover, Math.max(nextMidnight - n, 1000));
}
function _checkMonthRollover(){
  const cur = getCurrentMonthLabel();
  const rolled = _lastMonthLabel && cur !== _lastMonthLabel;
  const today = getTodayISO();
  const dayChanged = _lastDayKey && today !== _lastDayKey;
  if (rolled && _headerConfig.showMonthPicker){
    const sel = document.getElementById('msel');
    const keep = sel ? sel.value : _headerConfig.selectedMonth;
    const list = buildMonthList(_headerConfig.months, keep, _headerConfig.monthsAhead);
    _headerConfig.months = list;
    if (sel) populateMonthSelect(list, keep);
  }
  _armMonthWatch(); // also refreshes the on-screen date
  if (dayChanged){
    try{ window.dispatchEvent(new CustomEvent('bms:daychange', { detail: { date: today } })); }catch(e){}
  }
  if (rolled){
    try{ window.dispatchEvent(new CustomEvent('bms:monthchange', { detail: { month: cur } })); }catch(e){}
    if (typeof _headerConfig.onMonthRollover === 'function') _headerConfig.onMonthRollover(cur);
  }
}
// Phones suspend timers while asleep/backgrounded, so also re-check whenever
// the page becomes visible again (or is restored from the back/forward cache).
document.addEventListener('visibilitychange', () => { if (!document.hidden && _lastMonthLabel) _checkMonthRollover(); });
window.addEventListener('pageshow', (e) => { if (e.persisted && _lastMonthLabel) _checkMonthRollover(); });

function renderHeader(config){
  _headerConfig = config || {};
  ensureHeaderResponsiveCSS();
  ensureSyncStatusCSS();
  // The replacement <header> keeps id="header-root" so any SECOND call on the
  // same page finds and replaces the same single node instead of stacking
  // another topbar (see loans.html's refreshHeaderNotifications()).
  let root = document.getElementById('header-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'header-root';
    const main = document.getElementById('mainContent') || document.querySelector('.main') || document.body;
    main.insertBefore(root, main.firstChild);
  }
  const header = document.createElement('header');
  header.id = 'header-root';
  header.className = 'topbar' + (_headerConfig.showMonthPicker ? ' has-month' : '');
  header.innerHTML = topbarInnerHTML(_headerConfig);
  root.replaceWith(header);
  // The old DOM (and any open panel in it) is gone — reset the open-state
  // flags so the first click on the bell/chip opens instead of "closing".
  window._notifOpen = false; window._userPanelOpen = false; _exportMenuOpen = false;

  renderAlertBar(_headerConfig.alert, header);
  renderNotifications(_headerConfig.notifications || []);
  if (_headerConfig.showMonthPicker){
    const wanted = _headerConfig.selectedMonth || getCurrentMonthLabel();
    const list = buildMonthList(_headerConfig.months, wanted, _headerConfig.monthsAhead);
    _headerConfig.months = list;
    _headerConfig.selectedMonth = list.includes(wanted) ? wanted : (list.includes(getCurrentMonthLabel()) ? getCurrentMonthLabel() : list[0]);
    populateMonthSelect(list, _headerConfig.selectedMonth);
  }
  _armMonthWatch();

  document.getElementById('bellBtn')?.addEventListener('click', toggleNotif);
  document.getElementById('notifViewAllBtn')?.addEventListener('click', () => { closeNotif(); _headerConfig.onViewAllNotifications?.(); });
  document.getElementById('userChip')?.addEventListener('click', toggleUserPanel);
  document.getElementById('exportBtn')?.addEventListener('click', toggleExportMenu);
  document.getElementById('exportPdfBtn')?.addEventListener('click', () => { closeExportMenu(); _headerConfig.onExportPdf?.(); });
  document.getElementById('exportXlsBtn')?.addEventListener('click', () => { closeExportMenu(); _headerConfig.onExportXlsx?.(); });
  document.getElementById('userPanelSignOut')?.addEventListener('click', signOut);
  document.getElementById('userPanelAddUser')?.addEventListener('click', () => window.location.href = 'settings.html#users');
  document.getElementById('userPanelSettings')?.addEventListener('click', () => window.location.href = 'settings.html');
  // These two used to have no handler at all (dead buttons).
  document.getElementById('userPanelProfile')?.addEventListener('click', () => {
    if (typeof _headerConfig.onProfileClick === 'function') return _headerConfig.onProfileClick();
    window.location.href = 'settings.html#profile';
  });
  document.getElementById('userPanelHelp')?.addEventListener('click', () => {
    if (typeof _headerConfig.onHelpClick === 'function') return _headerConfig.onHelpClick();
    if (typeof toast === 'function') toast('For help or support, please contact your system administrator.', 'info');
  });

  if (typeof populateUserChrome === 'function') populateUserChrome();
  if (typeof bindGlobalChromeHandlers === 'function') bindGlobalChromeHandlers();

  // Reflect the sidebar's current state on the hamburger (it may already be
  // open/pinned if the page rendered the header late).
  const sb = document.getElementById('sidebar');
  document.querySelector('.tb-ham')?.setAttribute('aria-expanded',
    String(!!(sb && (sb.classList.contains('open') || sb.classList.contains('pinned-open')))));

  // Paint the CURRENT connection state. Pages usually render the header after
  // their data has loaded, i.e. after the first request already reported
  // 'live' — resetting to "Connecting…" here would stick until the next request.
  if (navigator.onLine === false) setSyncStatus('offline');
  else _paintSyncStatus();
}

/* ── Real connectivity / sync status ──────────────────────────
   app-state.js's shared request layer (_sbRequest) calls setSyncStatus on
   every Supabase call's success/failure, so every module gets a truthful
   status with zero page-specific code. On phones/tablets the pill collapses
   to just the coloured dot (label in its tooltip / aria-label). */
let _syncState = 'connecting';
let _syncMessage = null;
let _lastSyncedAt = null;
let _syncRelativeTimer = null;
/* Offline-queue info (from /js/offline-sync.js) so the pill can say what is
   saved on the device / syncing / rejected, not just online-or-offline. */
function _osInfo(){
  try{ return (window.OfflineSync && window.OfflineSync.status && window.OfflineSync.status()) || {}; }
  catch(e){ return {}; }
}
function _effSyncState(){ return navigator.onLine === false ? 'offline' : _syncState; }
function _chg(n){ return `${n} change${n === 1 ? '' : 's'}`; }
function _syncLabel(){
  const o = _osInfo(), n = o.pending || 0, f = o.failed || 0, st = _effSyncState();
  if (st === 'offline') return n ? `Offline — ${_chg(n)} saved on this device` : 'You appear to be offline';
  if (st === 'connecting') return 'Connecting…';
  if (o.syncing) return `Syncing ${_chg(n)}…`;
  if (f) return `${_chg(f)} rejected — tap to review`;
  if (st === 'error') return _syncMessage || 'Connection lost — retrying…';
  if (n) return `${_chg(n)} waiting to sync`;
  const mins = _lastSyncedAt ? Math.floor((Date.now() - _lastSyncedAt) / 60000) : 0;
  if (mins < 1) return 'Data is up to date';
  if (mins < 60) return `Synced ${mins}m ago`;
  return `Synced ${Math.floor(mins / 60)}h ago`;
}
function _syncDotClass(){
  const o = _osInfo(), st = _effSyncState();
  if (st === 'offline') return 'stat-dot-offline';
  if (st === 'connecting' || o.syncing || o.pending) return 'stat-dot-connecting';
  if (o.failed || st === 'error') return 'stat-dot-error';
  return 'stat-dot-live';
}
function _setSyncText(){
  const text = document.getElementById('statText');
  const pill = document.getElementById('statPill');
  const label = _syncLabel();
  if (text) text.textContent = label;
  if (pill){ pill.title = label; pill.setAttribute('aria-label', label); }
}
function _paintSyncStatus(){
  const dot = document.getElementById('statDot');
  if (!dot || !document.getElementById('statText')) return; // header not rendered yet
  dot.classList.remove('stat-dot-live','stat-dot-connecting','stat-dot-error','stat-dot-offline');
  clearInterval(_syncRelativeTimer);
  _syncRelativeTimer = null;
  dot.classList.add(_syncDotClass());
  _setSyncText();
  // After a minute without requests, show "synced Xm ago" so a long-idle tab
  // doesn't silently claim to be current.
  if (_syncDotClass() === 'stat-dot-live') _syncRelativeTimer = setInterval(_setSyncText, 15000);
}
function setSyncStatus(state, opts){
  _syncState = state;
  _syncMessage = (opts && opts.message) || null;
  if (state === 'live') _lastSyncedAt = Date.now();
  _paintSyncStatus();
}
window.setSyncStatus = setSyncStatus;
window.getSyncState = () => _syncState;
window.addEventListener('offline-sync:status', _paintSyncStatus);
window.addEventListener('online', () => setSyncStatus('connecting'));
window.addEventListener('offline', () => setSyncStatus('offline'));

function ensureSyncStatusCSS(){
  if (document.getElementById('sync-status-css') || _shellCssLoaded()) return;
  const style = document.createElement('style');
  style.id = 'sync-status-css';
  style.textContent = `
    .stat-dot-live{ background:#52B788; }
    .stat-dot-connecting{ background:#E9B949; animation:statPulse 1s ease-in-out infinite; }
    .stat-dot-error{ background:#E05555; }
    .stat-dot-offline{ background:#8D99A6; }
    @keyframes statPulse{ 0%,100%{ opacity:1; } 50%{ opacity:.35; } }
  `;
  document.head.appendChild(style);
}

/* ── Responsive (tablet / mobile) ─────────────────────────────
   shared-shell.css owns the desktop topbar layout untouched.
   This injects ONE extra stylesheet (once) with media-query-only
   rules, so nothing here changes desktop styling at desktop widths.
   Nothing is hidden that the user needs: the month picker moves to its
   own row, and the connection indicator shrinks to its dot. */
function ensureHeaderResponsiveCSS(){
  if (document.getElementById('header-responsive-css') || _shellCssLoaded()) return;
  const style = document.createElement('style');
  style.id = 'header-responsive-css';
  style.textContent = `
    /* ── Today's date ── chip on tablet/desktop, a line under the title on phones */
    .tb-date-chip{ display:flex; align-items:center; gap:6px; flex-shrink:0; white-space:nowrap; background:#f4f8f6; border:1px solid var(--border,#e3ece7); border-radius:20px; padding:5px 12px; font-size:var(--fs-sm,11.5px); font-weight:600; color:var(--tm,#5e7268); }
    .tb-date-chip svg{ width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; }
    .tb-date-line{ display:none; }
    /* ── Tablet & below (≤1024px) ── */
    @media (max-width: 1024px){
      .topbar{ padding-left:max(14px, env(safe-area-inset-left,0px)); padding-right:max(14px, env(safe-area-inset-right,0px)); gap:10px; }
      /* basis 0 (not auto): a long title truncates with … instead of pushing the
         bell/export/avatar group onto a second row */
      .tb-ttl{ flex:1 1 0%; min-width:0; }
      .tb-ttl h1{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .tb-ttl p{ display:none; }
      /* month picker: own full-width row instead of disappearing */
      .topbar.has-month{ flex-wrap:wrap; height:auto; row-gap:8px; padding-top:8px; padding-bottom:8px; }
      .topbar.has-month .tb-mid{ order:5; flex:1 0 100%; display:flex; align-items:center; justify-content:center; gap:8px; margin:0; }
      .mpick select{ font-size:16px; } /* <16px makes iOS zoom the page on focus */
      /* connection pill: dot only (label stays in tooltip / aria-label) */
      .stat-pill{ display:flex; padding:6px 8px; min-width:0; } /* shared-shell.css hides the pill ≤900px */
      .stat-pill #statText{ display:none; }
      .uchip-txt span{ display:none; }
      .notif-panel, .user-panel{ width:320px; max-width:calc(100vw - 24px); }
      .exp-menu{ max-width:calc(100vw - 20px); }
    }
    /* ── Phone (≤640px) ── */
    @media (max-width: 640px){
      .topbar{ padding-left:max(10px, env(safe-area-inset-left,0px)); padding-right:max(10px, env(safe-area-inset-right,0px)); gap:8px; }
      .tb-ttl h1{ font-size:16px; }
      .tb-right{ gap:6px; flex-shrink:0; }
      .tb-date-chip{ display:none; }
      .tb-date-line{ display:block; margin-top:2px; font-size:var(--fs-xs,10.5px); font-weight:600; color:var(--tl,#94a89f); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .exp-trigger .exp-lbl{ display:none; }
      .exp-trigger{ padding:8px; }
      .uchip{ padding:4px 6px; }
      .uchip-txt{ display:none; }
      .alert-bar-in span{ font-size:12px; }
      .alert-bar-actions{ flex-shrink:0; }
      /* floating panels span the screen; top/max-height are set from JS
         (_positionFloating) so they sit right under the real topbar height */
      .notif-panel, .user-panel, .exp-menu{
        position:fixed; left:10px; right:10px; top:60px; width:auto; max-width:none; margin:0;
        max-height:calc(100vh - 80px); overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain;
      }
    }
  `;
  document.head.appendChild(style);
}

function topbarInnerHTML(cfg){
  const showDate = cfg.showDate !== false;
  const monthPicker = cfg.showMonthPicker ? `
    <div class="tb-mid">
      <div class="mpick">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <select id="msel" aria-label="Select month" onchange="_onHeaderMonthChange()"></select>
        <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:#aab8b2;stroke-width:3"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="arr" role="button" tabindex="0" aria-label="Previous month" onclick="_headerMonthStep(-1)">&#8249;</div>
      <div class="arr" role="button" tabindex="0" aria-label="Next month" onclick="_headerMonthStep(1)">&#8250;</div>
    </div>` : '';

  const exportBlock = cfg.showExport ? `
    <div class="exp-wrap" id="exportWrap">
      <button type="button" class="exp-trigger" id="exportBtn" aria-haspopup="menu" aria-expanded="false" aria-label="Export">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span class="exp-lbl">Export</span>
      </button>
      <div class="exp-menu" id="exportMenu">
        <div class="exp-menu-item" id="exportPdfBtn" role="button" tabindex="0"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div><h5>Export as PDF</h5><span>Print-ready report</span></div></div>
        <div class="exp-menu-item" id="exportXlsBtn" role="button" tabindex="0"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><div><h5>Export as Excel</h5><span>Full data workbook (.xlsx)</span></div></div>
      </div>
    </div>` : '';

  return `
    <div class="tb-ham" onclick="toggleSidebar()" title="Toggle sidebar" role="button" tabindex="0" aria-label="Toggle sidebar" aria-expanded="false" aria-controls="sidebar">
      <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </div>
    <div class="tb-ttl">
      <h1>${cfg.title || ''}</h1>
      ${cfg.subtitle ? `<p>${cfg.subtitle}</p>` : ''}
      ${showDate ? `<div class="tb-date-line"><time class="tb-date-txt"></time></div>` : ''}
    </div>
    ${monthPicker}
    <div class="tb-right">
      ${showDate ? `<div class="tb-date-chip" id="tbDate"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><time class="tb-date-txt"></time></div>` : ''}
      <div class="bell" id="bellBtn" role="button" tabindex="0" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div class="bell-badge" id="bellBadge">0</div>
      </div>
      <div class="notif-panel" id="notifPanel">
        <div class="notif-panel-hd">
          <span class="notif-panel-title">Notifications</span>
          <div style="display:flex;align-items:center;gap:10px">
            ${cfg.onViewAllNotifications ? `<span class="notif-mark-all" id="notifViewAllBtn" role="button" tabindex="0">View All</span>` : ''}
            <span class="notif-mark-all" role="button" tabindex="0" onclick="markAllRead()">Mark all read</span>
          </div>
        </div>
        <div id="notifList"></div>
      </div>

      <div class="stat-pill" id="statPill"><div class="stat-dot" id="statDot"></div><span id="statText">Connecting…</span></div>

      ${exportBlock}

      <div class="uchip" id="userChip" role="button" tabindex="0" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">
        <div class="av av-lg">--</div>
        <div class="uchip-txt"><h4>Loading…</h4><span></span></div>
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="user-panel" id="userPanel">
        <div class="user-panel-top">
          <div class="av" style="width:40px;height:40px;font-size:15px">--</div>
          <div class="user-panel-name"><h4>Loading…</h4><span></span></div>
        </div>
        <div class="user-panel-item" id="userPanelProfile" role="button" tabindex="0"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile</div>
        <div class="user-panel-item" id="userPanelAddUser" role="button" tabindex="0"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg> Manage Users</div>
        <div class="user-panel-item" id="userPanelSettings" role="button" tabindex="0"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Settings</div>
        <div class="user-panel-item" id="userPanelHelp" role="button" tabindex="0"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Help &amp; Support</div>
        <div class="user-panel-divider"></div>
        <div class="user-panel-item danger" id="userPanelSignOut" role="button" tabindex="0"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign Out</div>
      </div>
    </div>`;
}

/* ── Alert bar (optional, off by default) ─────────────────── */
function renderAlertBar(alertCfg, headerEl){
  document.getElementById('alertBar')?.remove();
  if (!alertCfg) return;
  const bar = document.createElement('div');
  bar.className = 'alert-bar';
  bar.id = 'alertBar';
  bar.setAttribute('role', 'alert');
  bar.innerHTML = `
    <div class="alert-bar-in">
      <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>${alertCfg.message}</span>
    </div>
    <div class="alert-bar-actions">
      ${alertCfg.linkText ? `<a href="#" class="alert-bar-link" id="alertBarLink">${alertCfg.linkText}</a>` : ''}
      <button class="alert-bar-x" onclick="this.closest('.alert-bar').remove()" aria-label="Dismiss">&times;</button>
    </div>`;
  headerEl.insertAdjacentElement('afterend', bar);
  if (alertCfg.onLinkClick){
    document.getElementById('alertBarLink').addEventListener('click', e => { e.preventDefault(); alertCfg.onLinkClick(); });
  }
}

/* ── Notifications ─────────────────────────────────────────
   notifications: [{ type:'r'|'o'|'p'|'b'|'g', title, sub, time }]
   Call refreshNotifications(newList) whenever the page's own
   data changes (real stock levels, loan due dates, etc). */
const NOTIF_ICONS = {
  r: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  o: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  p: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  b: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  g: '<polyline points="20 6 9 17 4 12"/>'
};
function renderNotifications(list){
  if (!Array.isArray(list)) list = [];
  const container = document.getElementById('notifList');
  const badge = document.getElementById('bellBadge');
  if (!container) return;
  container.innerHTML = list.map(n => `
    <div class="notif-item">
      <div class="notif-item-ico ni-${n.type || 'g'}"><svg viewBox="0 0 24 24">${NOTIF_ICONS[n.type] || NOTIF_ICONS.g}</svg></div>
      <div class="notif-item-bd"><h5>${esc(n.title)}</h5><p>${esc(n.sub || '')}</p></div>
      <div class="notif-item-time">${esc(n.time || '')}</div>
    </div>`).join('') || `<div class="notif-item"><div class="notif-item-bd"><p>No notifications right now.</p></div></div>`;
  if (badge){
    if (list.length > 0){ badge.textContent = list.length > 99 ? '99+' : list.length; badge.style.display = ''; }
    else { badge.style.display = 'none'; }
  }
}
function refreshNotifications(list){
  _headerConfig.notifications = list;
  renderNotifications(list);
}

/* ── Month picker ─────────────────────────────────────────── */
function populateMonthSelect(months, selected){
  const sel = document.getElementById('msel');
  if (!sel) return;
  sel.innerHTML = months.map(m => `<option value="${esc(m)}"${m === selected ? ' selected' : ''}>${esc(m)}</option>`).join('');
}
function _headerMonthStep(d){
  const s = document.getElementById('msel');
  if (!s) return;
  const i = s.selectedIndex + d;
  if (i >= 0 && i < s.options.length){ s.selectedIndex = i; _onHeaderMonthChange(); }
}
function _onHeaderMonthChange(){
  const sel = document.getElementById('msel');
  if (!sel) return;
  if (typeof _headerConfig.onMonthChange === 'function') _headerConfig.onMonthChange(sel.value);
}

/* ── Notification / user / export panels ─────────────────────
   Open-state flags are shared so app-state.js's global outside-click /
   Escape handler can close them. Every close path goes through the
   close*() functions below so flags, classes and aria-expanded can never
   drift apart (a drifted export flag used to make the menu need two
   clicks to open after an outside-click). */
window._notifOpen = false;
window._userPanelOpen = false;
let _exportMenuOpen = false;

function _setExpanded(id, open){
  document.getElementById(id)?.setAttribute('aria-expanded', String(!!open));
}
/* Phones: panels are position:fixed. Place them just under the real topbar
   (whatever height it has when wrapped) and cap their height to the visible
   viewport so they scroll internally instead of running off-screen —
   including landscape. Measures where top:0 actually lands, so it also works
   if an ancestor creates its own containing block for fixed elements. */
function _positionFloating(el){
  if (!el) return;
  el.style.overflowY = 'auto';
  if (window.innerWidth > 640){
    // Not the full-width phone layout, but a short viewport (phone in
    // landscape) must still never push a long list off the bottom of the
    // screen: cap to the space below the panel's own top edge.
    el.style.top = '';
    el.style.maxHeight = '';
    const r = el.getBoundingClientRect();
    el.style.maxHeight = Math.max(160, window.innerHeight - r.top - 12) + 'px';
    return;
  }
  const hdr = document.getElementById('header-root');
  const desired = Math.max(hdr ? hdr.getBoundingClientRect().bottom : 56, 0) + 6;
  el.style.top = '0px';
  const origin = el.getBoundingClientRect().top;
  el.style.top = (desired - origin) + 'px';
  el.style.maxHeight = Math.max(160, window.innerHeight - desired - 12) + 'px';
}
window.addEventListener('resize', () => {
  if (window._notifOpen) _positionFloating(document.getElementById('notifPanel'));
  if (window._userPanelOpen) _positionFloating(document.getElementById('userPanel'));
  if (_exportMenuOpen) _positionFloating(document.getElementById('exportMenu'));
});

function closeNotif(){
  window._notifOpen = false;
  document.getElementById('notifPanel')?.classList.remove('open');
  _setExpanded('bellBtn', false);
}
function closeUserPanel(){
  window._userPanelOpen = false;
  document.getElementById('userPanel')?.classList.remove('open');
  document.getElementById('userChip')?.classList.remove('open');
  _setExpanded('userChip', false);
}
function closeExportMenu(){
  _exportMenuOpen = false;
  document.getElementById('exportMenu')?.classList.remove('show');
  _setExpanded('exportBtn', false);
}
function toggleNotif(e){
  e?.stopPropagation();
  const open = !window._notifOpen;
  closeUserPanel(); closeExportMenu();
  window._notifOpen = open;
  const panel = document.getElementById('notifPanel');
  panel?.classList.toggle('open', open);
  _setExpanded('bellBtn', open);
  if (open) _positionFloating(panel);
}
function markAllRead(){
  const badge = document.getElementById('bellBadge');
  if (badge) badge.style.display = 'none';
  closeNotif();
}
function toggleUserPanel(e){
  e?.stopPropagation();
  const open = !window._userPanelOpen;
  closeNotif(); closeExportMenu();
  window._userPanelOpen = open;
  const panel = document.getElementById('userPanel');
  panel?.classList.toggle('open', open);
  document.getElementById('userChip')?.classList.toggle('open', open);
  _setExpanded('userChip', open);
  if (open) _positionFloating(panel);
}
function toggleExportMenu(e){
  e?.stopPropagation();
  const open = !_exportMenuOpen;
  closeNotif(); closeUserPanel();
  _exportMenuOpen = open;
  const menu = document.getElementById('exportMenu');
  menu?.classList.toggle('show', open);
  _setExpanded('exportBtn', open);
  if (open) _positionFloating(menu);
}
