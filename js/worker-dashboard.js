/* Mena BMS — simplified dashboard for the "worker" role.
   Shows only day-to-day numbers: today's production and derkosh, stock levels with low-stock alerts, and the
   worker's own recent sales. No money totals, no exports. Data comes from tables workers may read (production_batches,
   derkosh_batches, sales) and the cost-free database function worker_stock_levels(). */
(function(){
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = (v) => Number(v || 0);
  const fmt = (v, d) => num(v).toLocaleString('en-US', { maximumFractionDigits: d == null ? 1 : d });

  function ensureCss(){
    if (!document.getElementById('wd-css')){
      const st = document.createElement('style');
      st.id = 'wd-css';
      st.textContent =
        '.wd-wrap{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}' +
        '.wd-card{background:var(--card,#fff);border:1px solid var(--border,#e6ece9);border-radius:14px;padding:16px 18px}' +
        '.wd-card h3{margin:0 0 12px;font-size:15px}' +
        '.wd-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}' +
        '.wd-stat{display:flex;flex-direction:column;gap:2px}' +
        '.wd-lbl{font-size:12px;color:#6b7a74}.wd-val{font-size:24px;font-weight:800}.wd-val small{font-size:12px;font-weight:600;color:#6b7a74}' +
        '.wd-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}' +
        '.wd-list li{display:flex;justify-content:space-between;gap:10px;font-size:14px;border-bottom:1px solid #eef2f0;padding-bottom:6px}' +
        '.wd-low{color:#e5484d;font-weight:700}.wd-ok{color:#27ae60;font-weight:700}.wd-empty{color:#6b7a74;font-size:14px}' +
        '.wd-wide{grid-column:1/-1}';
      document.head.appendChild(st);
    }
  }

  function card(title, body, extra){
    return '<section class="wd-card"' + (extra || '') + '><h3>' + title + '</h3>' + body + '</section>';
  }
  function stat(label, value, unit){
    return '<div class="wd-stat"><span class="wd-lbl">' + label + '</span><span class="wd-val">' + value + '<small>' + (unit ? ' ' + unit : '') + '</small></span></div>';
  }

  async function renderWorkerDashboard(){
    const root = document.querySelector('.content');
    if (!root) return;
    const me = (window.currentUser && window.currentUser.id) || (loadSession() || {}).user_id;
    const today = appToday();

    ensureCss();
    root.innerHTML = '<div class="wd-wrap" id="wdWrap"><div class="wd-empty">Loading…</div></div>';

    const safe = (p) => p.catch(() => null);
    const [batches, derk, stock, mine] = await Promise.all([
      safe(sbGet('production_batches?select=id,batch_number,type,injera_qty&date=eq.' + today + '&is_deleted=eq.false')),
      safe(sbGet('derkosh_batches?select=id,produced_kg,injera_used&date=eq.' + today + '&is_deleted=eq.false')),
      safe(workerStockLevels()),
      safe(sbGet('sales?select=id,date,product_type,quantity,payment_method,customers(name)&created_by=eq.' + encodeURIComponent(me) +
                 '&is_deleted=eq.false&order=date.desc,created_at.desc&limit=8'))
    ]);

    const injeraToday = (batches || []).reduce((s, r) => s + num(r.injera_qty), 0);
    const derkoshToday = (derk || []).reduce((s, r) => s + num(r.produced_kg), 0);
    const mineToday = (mine || []).filter(r => r.date === today);
    const salesToday = mineToday.length;
    const unitsToday = mineToday.reduce((s, r) => s + num(r.quantity), 0);
    const low = (stock || []).filter(r => r.low_stock);

    let html = '';
    html += card('Today', '<div class="wd-stats">' +
      stat('Injera produced', fmt(injeraToday, 0), 'pcs') +
      stat('Batches', fmt((batches || []).length, 0)) +
      stat('Derkosh produced', fmt(derkoshToday, 1), 'kg') +
      stat('My sales today', fmt(salesToday, 0), unitsToday ? '(' + fmt(unitsToday, 0) + ' units)' : '') + '</div>');

    html += card('Low-stock alerts', low.length
      ? '<ul class="wd-list">' + low.map(r => '<li><span>' + esc(r.name) + '</span><span class="wd-low">' + fmt(r.closing_qty, 1) + ' ' + esc(r.unit) + '</span></li>').join('') + '</ul>'
      : (stock ? '<div class="wd-ok">All stock levels are fine.</div>' : '<div class="wd-empty">Stock levels unavailable right now.</div>'));

    html += card('Stock on hand', (stock && stock.length)
      ? '<ul class="wd-list">' + stock.map(r => '<li><span>' + esc(r.name) + '</span><span class="' + (r.low_stock ? 'wd-low' : '') + '">' + fmt(r.closing_qty, 1) + ' ' + esc(r.unit) + '</span></li>').join('') + '</ul>'
      : '<div class="wd-empty">No stock information.</div>');

    html += card('My recent sales', (mine && mine.length)
      ? '<ul class="wd-list">' + mine.map(r => '<li><span>' + esc(r.date) + ' · ' + esc((r.customers && r.customers.name) || 'Walk-in') + ' · ' + esc(r.product_type) + '</span><span>' + fmt(r.quantity, 0) + '</span></li>').join('') + '</ul>'
      : '<div class="wd-empty">You have not recorded any sales yet.</div>', ' style="grid-column:1/-1"');

    document.getElementById('wdWrap').innerHTML = html;

    // Bell: low-stock alerts only (no finance alerts for workers).
    try{
      if (typeof refreshNotifications === 'function'){
        refreshNotifications(low.map(r => ({ type: 'r', title: 'Low stock: ' + r.name, sub: fmt(r.closing_qty, 1) + ' ' + r.unit + ' left', time: 'now' })));
      }
    }catch(e){}
  }
  window.renderWorkerDashboard = renderWorkerDashboard;

  /* Inventory page for workers: stock on hand (no costs) + a simple "record usage" form. */
  async function renderWorkerInventory(){
    const root = document.querySelector('.content');
    if (!root) return;
    ensureCss();
    root.innerHTML = '<div class="wd-wrap" id="wiWrap"><div class="wd-empty">Loading…</div></div>';
    let stock = null;
    try{ stock = await workerStockLevels(true); }catch(e){}
    const wrap = document.getElementById('wiWrap');
    if (!stock){ wrap.innerHTML = '<div class="wd-empty">Stock levels are unavailable right now. Check your connection.</div>'; return; }
    const rows = stock.map(r => '<li><span>' + esc(r.name) + '</span><span class="' + (r.low_stock ? 'wd-low' : '') + '">' + fmt(r.closing_qty, 1) + ' ' + esc(r.unit) + (r.low_stock ? ' · low' : '') + '</span></li>').join('');
    const opts = stock.map(r => '<option value="' + esc(r.item_id) + '">' + esc(r.name) + ' (' + esc(r.unit) + ')</option>').join('');
    wrap.innerHTML =
      card('Stock on hand', '<ul class="wd-list">' + rows + '</ul>') +
      card('Record usage', '<div style="display:grid;gap:10px">' +
        '<label class="wd-lbl">Item<select id="wiItem" style="width:100%;padding:9px;border:1px solid #dfe7e3;border-radius:8px">' + opts + '</select></label>' +
        '<label class="wd-lbl">Quantity used<input id="wiQty" type="number" min="0" step="0.01" style="width:100%;padding:9px;border:1px solid #dfe7e3;border-radius:8px"></label>' +
        '<label class="wd-lbl">Note (optional)<input id="wiNote" type="text" style="width:100%;padding:9px;border:1px solid #dfe7e3;border-radius:8px"></label>' +
        '<button id="wiSave" type="button" style="padding:11px;border:0;border-radius:10px;background:#1D5C38;color:#fff;font-weight:700;cursor:pointer">Save usage</button></div>');
    document.getElementById('wiSave').addEventListener('click', async () => {
      const item_id = document.getElementById('wiItem').value;
      const qty = parseFloat(document.getElementById('wiQty').value);
      const note = document.getElementById('wiNote').value.trim() || null;
      if (!item_id || !(qty > 0)){ toast('Enter a quantity greater than 0.', 'error'); return; }
      const btn = document.getElementById('wiSave'); btn.disabled = true;
      try{
        await sbPost('inventory_usage_log', { date: appToday(), item_id, quantity: qty, note });
        toast('Usage recorded.', 'success');
        document.getElementById('wiQty').value = ''; document.getElementById('wiNote').value = '';
        renderWorkerInventory();
      }catch(e){ toast('Could not save: ' + (e.message || 'check your connection'), 'error'); }
      finally{ btn.disabled = false; }
    });
  }
  window.renderWorkerInventory = renderWorkerInventory;
})();
