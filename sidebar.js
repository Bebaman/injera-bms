/* ============================================================
   MENA INJERA & DERKOSH BMS — SHARED SIDEBAR  (v2)
   Nav data + rendering matches dashboard.html exactly (Main group
   includes Purchases). User management lives in Settings > Users & Roles
   (added 2026-07) — no separate Manage Users page/nav item anymore.

   Usage — right after <body>:

     <div class="sb-overlay" id="sbOverlay" onclick="closeSidebar()"></div>
     <div id="sidebar-root"></div>
     <div class="main" id="mainContent">
       ...topbar goes in #header-root, then .content...
     </div>

   Then include, in order:
     <script src="js/app-state.js"></script>
     <script src="js/sidebar.js"></script>
   ============================================================ */

const NAV_ITEMS = [
  { group: 'Main', items: [
    { label: 'Dashboard',  href: 'dashboard.html', aliases: [], icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
    { label: 'Purchases',  href: 'purchases.html', aliases: ['purchases-27.html'], icon: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>' },
    { label: 'Production', href: 'production.html', aliases: ['production-6.html'], icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { label: 'Derkosh',    href: 'derkosh.html', aliases: ['derkosh-17.html'], icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' },
    { label: 'Sales',      href: 'sales.html', aliases: ['sales-17.html'], icon: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    { label: 'Petty Cash', href: 'pettycash.html', aliases: ['pettycash-9.html'], icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' }
  ]},
  { group: 'Finance', items: [
    { label: 'P&amp;L Statement', href: 'pl.html', aliases: ['pl-7.html'], icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { label: 'Cash Flow',         href: 'cashflow.html', aliases: ['cashflow-3.html'], icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
    { label: 'Monthly Overhead',  href: 'overhead.html', aliases: ['monthly-overhead.html'], icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
    { label: 'Budget vs Actual',  href: 'budget.html', aliases: ['budget-vs-actual-1.html'], icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { label: 'Loans',             href: 'loans.html', aliases: ['loans-1.html'], icon: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>' },
    /* Existing pages link to this as "profit.html" (a legacy name) even though
       the page is Distribution — kept as-is to match what's already live. */
    { label: 'Distribution',      href: 'profit.html', aliases: ['distribution-1.html'], icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' }
  ]},
  { group: 'Records', items: [
    { label: 'Customers', href: 'customers.html', aliases: ['customers-1.html'], icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { label: 'Suppliers', href: 'suppliers.html', aliases: ['suppliers-1.html'], icon: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
    { label: 'Inventory', href: 'inventory.html', aliases: ['inventory-5.html'], icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>' }
  ]},
  { group: 'Reports', items: [
    { label: 'Multi-Year', href: 'reports.html', aliases: ['reports-1.html'], icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' }
  ]},
  { group: 'Settings', items: [
    { label: 'Settings', href: 'settings.html', aliases: ['settings-1.html'], icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' }
  ]}
];

function currentPageFilename(){
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';
}
function isActiveNavItem(item){
  const current = currentPageFilename();
  return current === item.href || item.aliases.includes(current);
}

function sidebarHTML(){
  const groups = NAV_ITEMS.map(g => {
    const links = g.items.map(item => `
      <a class="sb-a${isActiveNavItem(item) ? ' active' : ''}" href="${item.href}" title="${item.label.replace(/&amp;/,'&')}">
        <svg viewBox="0 0 24 24">${item.icon}</svg><span>${item.label}</span>
      </a>`).join('');
    return `<div class="sb-grp"><div class="sb-lbl">${g.group}</div>${links}</div>`;
  }).join('');

  return `
    <div class="sb-logo">
      <div class="logo-circle">
        <svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" fill="rgba(255,255,255,0.15)"/><ellipse cx="14" cy="14" rx="9" ry="6" fill="white"/><path d="M7 12 Q14 10 21 12" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/><path d="M6 14 Q14 12 22 14" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/><path d="M7 16 Q14 14 21 16" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/><path d="M14 4 L14 9" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/><path d="M11 6 L14 4 L17 6" stroke="rgba(255,255,255,0.8)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="logo-txt"><h2>MENA INJERA<br>&amp; DERKOSH</h2><p>Business Management System</p></div>
    </div>
    ${groups}
    <div class="sb-foot">
      <div class="av">--</div>
      <div class="sb-foot-txt"><h4>Loading…</h4><span></span></div>
      <div class="sb-logout" title="Sign out"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
    </div>`;
}

function renderSidebar(){
  let root = document.getElementById('sidebar-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'sidebar-root';
    document.body.insertBefore(root, document.body.firstChild);
  }
  const aside = document.createElement('aside');
  aside.className = 'sb collapsed';
  aside.id = 'sidebar';
  aside.innerHTML = sidebarHTML();
  root.replaceWith(aside);

  if (!document.getElementById('sbOverlay')){
    const overlay = document.createElement('div');
    overlay.className = 'sb-overlay';
    overlay.id = 'sbOverlay';
    overlay.setAttribute('onclick', 'closeSidebar()');
    aside.insertAdjacentElement('beforebegin', overlay);
  }

  const main = document.querySelector('.main');
  if (main && !main.id) main.id = 'mainContent';
  // Sidebar starts collapsed (68px rail) by default at every width — .main must
  // reserve exactly that much space from the start, or you get a dead gap
  // between the rail and the content (the margin was sized for the full
  // 220px width until JS narrowed it, which only happened under 1100px).
  if (main) main.classList.add('sb-collapsed');

  document.querySelector('.sb-logout')?.addEventListener('click', signOut);

  if (typeof populateUserChrome === 'function') populateUserChrome();
  if (typeof bindGlobalChromeHandlers === 'function') bindGlobalChromeHandlers();

  autoSidebarForWidth();
}

/* ── Sidebar toggle (matches dashboard.html + purchases.html merged) ──
   Desktop (>900px): hamburger click toggles "pinned-open" — locks the
   sidebar open and pushes .main over, bypassing hover-to-expand.
   Mobile (≤900px): hamburger click toggles an off-canvas drawer
   with a tap-outside-to-close overlay. */
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  const overlay = document.getElementById('sbOverlay');
  if (window.innerWidth > 900){
    const pinned = sb.classList.toggle('pinned-open');
    if (main){
      main.classList.toggle('sb-pinned', pinned);
      main.classList.toggle('sb-collapsed', !pinned); // pinned open needs the full-width margin, not the collapsed one
    }
  } else {
    sb.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  }
}
function closeSidebar(){
  const sb = document.getElementById('sidebar');
  const overlay = document.getElementById('sbOverlay');
  if (sb) sb.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}
function unpinSidebar(){
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  if (sb) sb.classList.remove('pinned-open');
  if (main){ main.classList.remove('sb-pinned'); main.classList.add('sb-collapsed'); }
}
function autoSidebarForWidth(){
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  if (!sb) return;
  if (window.innerWidth <= 1100){
    sb.classList.add('collapsed');
    if (main) main.classList.add('sb-collapsed');
  }
}
window.addEventListener('resize', autoSidebarForWidth);

// Clicking outside a pinned-open sidebar un-pins it (desktop safety net)
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900) return;
  const sb = document.getElementById('sidebar');
  if (!sb || !sb.classList.contains('pinned-open')) return;
  if (!e.target.closest('#sidebar') && !e.target.closest('.tb-ham')) unpinSidebar();
});

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  if (typeof loadCompanySettings === 'function') loadCompanySettings();
});
