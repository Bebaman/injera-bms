/* ============================================================
   MENA INJERA & DERKOSH BMS — SHARED SIDEBAR  (v3)
   Nav data + rendering matches dashboard.html exactly (Main group
   includes Purchases). User management lives in Settings > Users & Roles
   (added 2026-07) — no separate Manage Users page/nav item anymore.
   2026-07: added 'Milling / Conversion' (Main group, between Production
   and Derkosh) — new module per the Injera Blend Costing change order.

   Usage — right after <body>:

     <div class="sb-overlay" id="sbOverlay" onclick="closeSidebar()"></div>
     <div id="sidebar-root"></div>
     <div class="main" id="mainContent">
       ...topbar goes in #header-root, then .content...
     </div>

   v3 (mobile): swipe-left / tap-link / bfcache close the drawer, page scroll
   locks while it's open, rotation or resize to desktop width never leaves a
   stuck overlay, re-rendering never duplicates the sidebar.

   Then include, in order:
     <script src="js/app-state.js"></script>
     <script src="js/sidebar.js"></script>
   ============================================================ */

const NAV_ITEMS = [
  { group: 'Main', items: [
    { label: 'Dashboard',  href: 'dashboard.html', aliases: [], icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
    { label: 'Purchases',  href: 'purchases.html', aliases: ['purchases-27.html'], icon: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>' },
    { label: 'Milling / Conversion', href: 'milling.html', aliases: ['milling-1.html','milling-conversion.html'], icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M4.76 7.5l14.48 9M4.76 16.5l14.48-9"/><circle cx="12" cy="12" r="2.2"/>' },
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
  // cleanUrls (vercel.json) serves pages without the .html extension, so
  // window.location.pathname is e.g. "/pettycash-9", not "/pettycash-9.html".
  // NAV_ITEMS' href/aliases are still .html-suffixed (they're also used as
  // real hrefs), so normalize back to that form for the comparison in
  // isActiveNavItem() below — otherwise the active-page highlight never matches.
  const path = window.location.pathname.replace(/\/+$/, '');
  let base = (path.substring(path.lastIndexOf('/') + 1) || 'dashboard').toLowerCase();
  if (!/\.html$/.test(base)) base += '.html';
  if (base === 'index.html') base = 'dashboard.html';
  return base;
}
function isActiveNavItem(item){
  const current = currentPageFilename();
  return current === item.href || item.aliases.includes(current);
}

function sidebarHTML(){
  const groups = NAV_ITEMS.map(g => {
    const links = g.items.map(item => {
      const active = isActiveNavItem(item);
      // item.label is already HTML-escaped ("P&amp;L"), which is exactly what
      // an attribute value needs — the browser shows it as "P&L".
      return `
      <a class="sb-a${active ? ' active' : ''}" href="${item.href}" title="${item.label}"${active ? ' aria-current="page"' : ''}>
        <svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg><span>${item.label}</span>
      </a>`;
    }).join('');
    return `<div class="sb-grp"><div class="sb-lbl">${g.group}</div>${links}</div>`;
  }).join('');

  return `
    <div class="sb-logo">
      <div class="logo-circle">
        <img src="/favicon/white-logo-192.png" alt="Mena Injera &amp; Derkosh" style="width:100%;height:100%;object-fit:contain;display:block;">
      </div>
      <div class="logo-txt"><h2>MENA INJERA<br>&amp; DERKOSH</h2><p>Business Management System</p></div>
    </div>
    ${groups}
    <div class="sb-foot">
      <div class="av">--</div>
      <div class="sb-foot-txt"><h4>Loading…</h4><span></span></div>
      <div class="sb-logout" title="Sign out" role="button" tabindex="0" aria-label="Sign out"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
    </div>`;
}

/* ── Mobile drawer CSS ─────────────────────────────────────────
   Media-query-only and additive (shared-shell.css still owns the look).
   At ≤900px the sidebar is an off-canvas drawer, so:
   - it must never be wider than the screen and must scroll on short
     screens (17 links + header + footer don't fit a phone in landscape);
   - .main must never reserve rail/pinned margin for it (guards against a
     stale sb-collapsed / sb-pinned class leaving a dead gutter);
   - the page behind must not scroll while the drawer is open. */
function ensureSidebarResponsiveCSS(){
  if (document.getElementById('sidebar-responsive-css') || _shellCssLoaded()) return;
  const style = document.createElement('style');
  style.id = 'sidebar-responsive-css';
  style.textContent = `
    @media (max-width: 900px){
      /* shared-shell.css already makes the drawer a transform-only slide at a
         fixed width. What it can't do is stop the desktop ".collapsed" rail
         rules (centred icons) from applying to the drawer, then flipping to
         left-aligned on the sticky :hover a tap leaves behind — that was the
         visible jump. sidebar.js no longer puts .collapsed on phones; the rules
         below finish the job. */
      .sb{ max-width:86vw; min-height:0; height:100%; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch;
           transition:transform .26s cubic-bezier(.32,.72,0,1); will-change:transform; backface-visibility:hidden; }
      /* 100vh is taller than the visible area on iOS/Android (URL bar), which
         pushed the sign-out button below the fold — fixed to the real viewport. */
      @supports (height:100dvh){ .sb{ height:100dvh; } }
      .sb:hover, .sb.collapsed:hover{ box-shadow:4px 0 20px rgba(0,0,0,.25); }
      /* Belt and braces: even if something puts .collapsed on the drawer, it keeps
         the full left-aligned layout (same values as .pinned-open) — never the
         centred icon-rail layout that jumps on touch. */
      .sb.collapsed .sb-logo, .sb.collapsed:hover .sb-logo{ justify-content:flex-start; padding:15px 14px 14px; }
      .sb.collapsed .sb-a, .sb.collapsed:hover .sb-a{ justify-content:flex-start; margin:1px 10px; padding:9px 14px; }
      .sb.collapsed .sb-foot, .sb.collapsed:hover .sb-foot{ justify-content:flex-start; padding:12px 14px; }
      .sb-a:hover{ transform:none; }
      /* user + sign-out stay pinned at the bottom of the drawer instead of
         scrolling out of reach on a long menu */
      .sb-foot{ position:sticky; bottom:0; z-index:1; background:#10271a; }
      .sb-overlay.show{ animation:sbOvIn .26s ease both; }
      .sb-overlay.hiding{ display:block; pointer-events:none; animation:sbOvOut .26s ease both; }
      .main, .main.sb-collapsed, .main.sb-pinned{ margin-left:0 !important; max-width:100%; min-width:0; }
      body.sb-scroll-lock{ overflow:hidden; }
    }
    @keyframes sbOvIn{ from{ opacity:0 } to{ opacity:1 } }
    @keyframes sbOvOut{ from{ opacity:1 } to{ opacity:0 } }
    /* Set for a moment on first render and when crossing the phone/desktop
       breakpoint, so layout snapping into place is never animated (this also
       stops the content area visibly sliding 220px→68px on every desktop load). */
    html.sb-no-anim .sb, html.sb-no-anim .sb *, html.sb-no-anim .main, html.sb-no-anim .sb-overlay{ transition:none !important; animation:none !important; }
  `;
  document.head.appendChild(style);
}

function _suppressSidebarAnim(){
  const root = document.documentElement;
  root.classList.add('sb-no-anim');
  // two frames: one to apply the new layout, one to paint it
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('sb-no-anim')));
}
function _isPhoneWidth(){ return window.innerWidth <= 900; }
function _syncHam(expanded){
  document.querySelector('.tb-ham')?.setAttribute('aria-expanded', String(!!expanded));
}

function renderSidebar(){
  ensureSidebarResponsiveCSS();

  // Second call (e.g. a page re-rendering its chrome): refresh in place.
  // Previously this inserted a brand-new sidebar and left the old one behind.
  let aside = document.getElementById('sidebar');
  if (aside){
    aside.innerHTML = sidebarHTML();
    bindLogoFallback(aside);
    if (typeof populateUserChrome === 'function') populateUserChrome();
    return;
  }

  let root = document.getElementById('sidebar-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'sidebar-root';
    document.body.insertBefore(root, document.body.firstChild);
  }
  aside = document.createElement('aside');
  aside.className = _isPhoneWidth() ? 'sb' : 'sb collapsed';
  aside.id = 'sidebar';
  aside.setAttribute('role', 'navigation');
  aside.setAttribute('aria-label', 'Main navigation');
  aside.innerHTML = sidebarHTML();
  _suppressSidebarAnim(); // first paint: place everything without animating
  root.replaceWith(aside);

  // One delegated listener (survives re-renders): sign-out button, and on
  // phones tapping any nav link closes the drawer (matters for same-page
  // links and for bfcache back-navigation that would show it still open).
  aside.addEventListener('click', (e) => {
    if (e.target.closest('.sb-logout')){ signOut(); return; }
    if (e.target.closest('.sb-a') && window.innerWidth <= 900) closeSidebar();
  });
  bindLogoFallback(aside);

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
  // between the rail and the content.
  if (main) main.classList.add('sb-collapsed');

  if (typeof populateUserChrome === 'function') populateUserChrome();
  if (typeof bindGlobalChromeHandlers === 'function') bindGlobalChromeHandlers();

  autoSidebarForWidth();
}

// If the logo image fails to load (offline, missing file) show initials
// instead of a broken-image icon.
function bindLogoFallback(aside){
  const img = aside.querySelector('.logo-circle img');
  if (!img) return;
  img.addEventListener('error', () => {
    const circle = img.parentElement;
    img.remove();
    if (circle) circle.textContent = 'MI';
  }, { once: true });
}

/* ── Sidebar toggle (matches dashboard.html + purchases.html merged) ──
   Desktop (>900px): hamburger click toggles "pinned-open" — locks the
   sidebar open and pushes .main over, bypassing hover-to-expand.
   Mobile (≤900px): hamburger click toggles an off-canvas drawer
   with a tap-outside-to-close overlay, swipe-left-to-close, and page
   scroll locked while it's open. */
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  const overlay = document.getElementById('sbOverlay');
  let expanded;
  if (window.innerWidth > 900){
    const pinned = sb.classList.toggle('pinned-open');
    if (main){
      main.classList.toggle('sb-pinned', pinned);
      main.classList.toggle('sb-collapsed', !pinned); // pinned open needs the full-width margin, not the collapsed one
    }
    expanded = pinned;
  } else {
    const open = sb.classList.toggle('open');
    if (overlay){ overlay.classList.remove('hiding'); overlay.classList.toggle('show', open); }
    document.body.classList.toggle('sb-scroll-lock', open);
    expanded = open;
  }
  _syncHam(expanded);
}
function closeSidebar(){
  const sb = document.getElementById('sidebar');
  const overlay = document.getElementById('sbOverlay');
  const wasOpen = !!(sb && sb.classList.contains('open'));
  if (sb) sb.classList.remove('open');
  if (overlay){
    const wasShown = overlay.classList.contains('show');
    overlay.classList.remove('show');
    // fade the backdrop out in step with the drawer sliding away
    if (wasShown && wasOpen && window.innerWidth <= 900){
      overlay.classList.add('hiding');
      setTimeout(() => overlay.classList.remove('hiding'), 270);
    }
  }
  document.body.classList.remove('sb-scroll-lock');
  _syncHam(sb ? sb.classList.contains('pinned-open') : false);
}
function unpinSidebar(){
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  if (sb) sb.classList.remove('pinned-open');
  if (main){ main.classList.remove('sb-pinned'); main.classList.add('sb-collapsed'); }
  _syncHam(sb ? sb.classList.contains('open') : false);
}
function autoSidebarForWidth(){
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('mainContent') || document.querySelector('.main');
  if (!sb) return;
  const w = window.innerWidth;
  const phone = w <= 900;
  if (sb.dataset.phone !== String(phone)){
    // crossed the phone/desktop breakpoint (or first run): snap, don't animate
    if (sb.dataset.phone !== undefined) _suppressSidebarAnim();
    sb.dataset.phone = String(phone);
  }
  if (w <= 900){
    // Phone / small tablet: pinning is a desktop concept — drop it so the
    // content isn't left with a stale pinned margin.
    if (sb.classList.contains('pinned-open')) unpinSidebar();
  } else if (sb.classList.contains('open')){
    // Rotated / resized up to desktop width while the drawer was open:
    // leave drawer mode, otherwise the overlay + scroll lock get stuck.
    closeSidebar();
  }
  // "collapsed" is the desktop/tablet icon-rail state. The phone drawer is
  // always the full-width layout, so labels are there from the first frame of
  // the slide instead of fading in after it.
  if (phone) sb.classList.remove('collapsed');
  else sb.classList.add('collapsed'); // desktop always starts as the rail (hover / pin expands it)
  // Never clobber a pinned layout (.sb-pinned and .sb-collapsed together
  // would fight over .main's margin).
  if (main && !sb.classList.contains('pinned-open')){
    main.classList.add('sb-collapsed');
    main.classList.remove('sb-pinned');
  }
}
// Debounced — a raw per-pixel resize listener was firing this on every
// single resize event during a drag/rotation instead of once at the end.
let _resizeDebounceTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeDebounceTimer);
  _resizeDebounceTimer = setTimeout(autoSidebarForWidth, 120);
});
window.addEventListener('orientationchange', () => {
  clearTimeout(_resizeDebounceTimer);
  _resizeDebounceTimer = setTimeout(autoSidebarForWidth, 250);
});
// Back/forward cache restore on phones can resurrect the page with the
// drawer still open.
window.addEventListener('pageshow', (e) => { if (e.persisted) closeSidebar(); });

// Clicking outside a pinned-open sidebar un-pins it (desktop safety net)
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900) return;
  const sb = document.getElementById('sidebar');
  if (!sb || !sb.classList.contains('pinned-open')) return;
  if (!e.target.closest('#sidebar') && !e.target.closest('.tb-ham')) unpinSidebar();
});

// Swipe left on the open drawer to close it (phones/tablets).
(function bindDrawerSwipe(){
  let sx = 0, sy = 0, tracking = false;
  document.addEventListener('touchstart', (e) => {
    const sb = document.getElementById('sidebar');
    tracking = !!(sb && sb.classList.contains('open') && e.target.closest && e.target.closest('#sidebar') && e.touches.length === 1);
    if (tracking){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.5) closeSidebar();
  }, { passive: true });
  document.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
})();

// Run now if the DOM is already parsed (script loaded late / deferred /
// injected), otherwise wait — a bare DOMContentLoaded listener never fires
// in the former case and the sidebar would silently never render.
function _sbOnReady(fn){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}
_sbOnReady(() => {
  renderSidebar();
  if (typeof loadCompanySettings === 'function') loadCompanySettings();
});
