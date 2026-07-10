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

   Everything is optional except `title`.
   ============================================================ */

let _headerConfig = {};

function renderHeader(config){
  _headerConfig = config || {};
  ensureHeaderResponsiveCSS();
  let root = document.getElementById('header-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'header-root';
    const main = document.getElementById('mainContent') || document.querySelector('.main') || document.body;
    main.insertBefore(root, main.firstChild);
  }
  const header = document.createElement('header');
  header.className = 'topbar';
  header.innerHTML = topbarInnerHTML(_headerConfig);
  root.replaceWith(header);

  renderAlertBar(_headerConfig.alert, header);
  renderNotifications(_headerConfig.notifications || []);
  if (_headerConfig.showMonthPicker) populateMonthSelect(_headerConfig.months || [], _headerConfig.selectedMonth);

  document.getElementById('bellBtn')?.addEventListener('click', toggleNotif);
  document.getElementById('notifViewAllBtn')?.addEventListener('click', () => { closeNotif(); _headerConfig.onViewAllNotifications?.(); });
  document.getElementById('userChip')?.addEventListener('click', toggleUserPanel);
  document.getElementById('exportBtn')?.addEventListener('click', toggleExportMenu);
  document.getElementById('exportPdfBtn')?.addEventListener('click', () => { closeExportMenu(); _headerConfig.onExportPdf?.(); });
  document.getElementById('exportXlsBtn')?.addEventListener('click', () => { closeExportMenu(); _headerConfig.onExportXlsx?.(); });
  document.getElementById('userPanelSignOut')?.addEventListener('click', signOut);
  document.getElementById('userPanelAddUser')?.addEventListener('click', () => window.location.href = 'settings.html#users');
  document.getElementById('userPanelSettings')?.addEventListener('click', () => window.location.href = 'settings.html');

  if (typeof populateUserChrome === 'function') populateUserChrome();
  if (typeof bindGlobalChromeHandlers === 'function') bindGlobalChromeHandlers();
}

/* ── Responsive (tablet / mobile) ─────────────────────────────
   shared-shell.css owns the desktop topbar layout untouched.
   This injects ONE extra stylesheet (once) with media-query-only
   rules, so nothing here overrides desktop styling at desktop
   widths — it only reflows things at narrower viewports. */
function ensureHeaderResponsiveCSS(){
  if (document.getElementById('header-responsive-css')) return;
  const style = document.createElement('style');
  style.id = 'header-responsive-css';
  style.textContent = `
    /* ── Tablet (≤1024px) ── */
    @media (max-width: 1024px){
      .topbar{ padding-left:14px; padding-right:14px; gap:10px; }
      .tb-ttl p{ display:none; }
      .tb-mid{ display:none; }
      .stat-pill{ display:none; }
      .exp-trigger span, .exp-trigger{ font-size:12.5px; }
      .uchip-txt span{ display:none; }
      .notif-panel, .user-panel{ width:320px; max-width:calc(100vw - 24px); }
    }
    /* ── Mobile (≤640px) ── */
    @media (max-width: 640px){
      .topbar{ padding-left:10px; padding-right:10px; gap:8px; flex-wrap:wrap; }
      .tb-ttl h1{ font-size:16px; }
      .tb-ttl p{ display:none; }
      .tb-mid{ display:none; }
      .stat-pill{ display:none; }
      .exp-wrap .exp-trigger span{ display:none; }
      .exp-trigger{ padding:8px; }
      .uchip{ padding:4px 6px; }
      .uchip-txt{ display:none; }
      .alert-bar-in span{ font-size:12px; }
      .alert-bar-actions{ flex-shrink:0; }
      .notif-panel, .user-panel{ position:fixed; left:10px; right:10px; width:auto; max-width:none; top:60px; }
    }
  `;
  document.head.appendChild(style);
}

function topbarInnerHTML(cfg){
  const monthPicker = cfg.showMonthPicker ? `
    <div class="tb-mid">
      <div class="mpick">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <select id="msel" onchange="_onHeaderMonthChange()"></select>
        <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:#aab8b2;stroke-width:3"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="arr" onclick="_headerMonthStep(-1)">&#8249;</div>
      <div class="arr" onclick="_headerMonthStep(1)">&#8250;</div>
    </div>` : '';

  const exportBlock = cfg.showExport ? `
    <div class="exp-wrap" id="exportWrap">
      <button class="exp-trigger" id="exportBtn">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
      <div class="exp-menu" id="exportMenu">
        <div class="exp-menu-item" id="exportPdfBtn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div><h5>Export as PDF</h5><span>Print-ready report</span></div></div>
        <div class="exp-menu-item" id="exportXlsBtn"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><div><h5>Export as Excel</h5><span>Full data workbook (.xlsx)</span></div></div>
      </div>
    </div>` : '';

  return `
    <div class="tb-ham" onclick="toggleSidebar()" title="Toggle sidebar">
      <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </div>
    <div class="tb-ttl">
      <h1>${cfg.title || ''}</h1>
      ${cfg.subtitle ? `<p>${cfg.subtitle}</p>` : ''}
    </div>
    ${monthPicker}
    <div class="tb-right">
      <div class="bell" id="bellBtn">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div class="bell-badge" id="bellBadge">0</div>
      </div>
      <div class="notif-panel" id="notifPanel">
        <div class="notif-panel-hd">
          <span class="notif-panel-title">Notifications</span>
          <div style="display:flex;align-items:center;gap:10px">
            ${cfg.onViewAllNotifications ? `<span class="notif-mark-all" id="notifViewAllBtn">View All</span>` : ''}
            <span class="notif-mark-all" onclick="markAllRead()">Mark all read</span>
          </div>
        </div>
        <div id="notifList"></div>
      </div>

      <div class="stat-pill"><div class="stat-dot"></div>Data is up to date</div>

      ${exportBlock}

      <div class="uchip" id="userChip">
        <div class="av av-lg">--</div>
        <div class="uchip-txt"><h4>Loading…</h4><span></span></div>
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="user-panel" id="userPanel">
        <div class="user-panel-top">
          <div class="av" style="width:40px;height:40px;font-size:15px">--</div>
          <div class="user-panel-name"><h4>Loading…</h4><span></span></div>
        </div>
        <div class="user-panel-item" id="userPanelProfile"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile</div>
        <div class="user-panel-item" id="userPanelAddUser"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg> Manage Users</div>
        <div class="user-panel-item" id="userPanelSettings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Settings</div>
        <div class="user-panel-item" id="userPanelHelp"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Help &amp; Support</div>
        <div class="user-panel-divider"></div>
        <div class="user-panel-item danger" id="userPanelSignOut"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign Out</div>
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
  const container = document.getElementById('notifList');
  const badge = document.getElementById('bellBadge');
  if (!container) return;
  container.innerHTML = list.map(n => `
    <div class="notif-item">
      <div class="notif-item-ico ni-${n.type || 'g'}"><svg viewBox="0 0 24 24">${NOTIF_ICONS[n.type] || NOTIF_ICONS.g}</svg></div>
      <div class="notif-item-bd"><h5>${n.title}</h5><p>${n.sub || ''}</p></div>
      <div class="notif-item-time">${n.time || ''}</div>
    </div>`).join('') || `<div class="notif-item"><div class="notif-item-bd"><p>No notifications right now.</p></div></div>`;
  if (badge){
    if (list.length > 0){ badge.textContent = list.length; badge.style.display = ''; }
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
  sel.innerHTML = months.map(m => `<option value="${m}"${m === selected ? ' selected' : ''}>${m}</option>`).join('');
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
   Mirrors dashboard.html's toggleNotif/toggleUserPanel/closeNotif
   exactly (including the shared open-state flags so the global
   outside-click handler in app-state.js can close them). */
window._notifOpen = false;
window._userPanelOpen = false;
let _exportMenuOpen = false;

function toggleNotif(e){
  e?.stopPropagation();
  window._notifOpen = !window._notifOpen;
  document.getElementById('notifPanel')?.classList.toggle('open', window._notifOpen);
  document.getElementById('userPanel')?.classList.remove('open');
  document.getElementById('userChip')?.classList.remove('open');
  window._userPanelOpen = false;
}
function closeNotif(){
  window._notifOpen = false;
  document.getElementById('notifPanel')?.classList.remove('open');
}
function markAllRead(){
  const badge = document.getElementById('bellBadge');
  if (badge) badge.style.display = 'none';
  closeNotif();
}
function toggleUserPanel(e){
  e?.stopPropagation();
  window._userPanelOpen = !window._userPanelOpen;
  document.getElementById('userPanel')?.classList.toggle('open', window._userPanelOpen);
  document.getElementById('userChip')?.classList.toggle('open', window._userPanelOpen);
  document.getElementById('notifPanel')?.classList.remove('open');
  window._notifOpen = false;
}
function toggleExportMenu(e){
  e?.stopPropagation();
  _exportMenuOpen = !_exportMenuOpen;
  document.getElementById('exportMenu')?.classList.toggle('show', _exportMenuOpen);
  document.getElementById('notifPanel')?.classList.remove('open');
  document.getElementById('userPanel')?.classList.remove('open');
  document.getElementById('userChip')?.classList.remove('open');
  window._notifOpen = false; window._userPanelOpen = false;
}
function closeExportMenu(){
  _exportMenuOpen = false;
  document.getElementById('exportMenu')?.classList.remove('show');
}
