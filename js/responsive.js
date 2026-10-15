/* Responsive helpers — phones only (≤640px). Nothing here runs on tablets/PCs.
   1. List tables marked class="rcards" are shown as cards on phones; this script copies each column heading into
      the cells (data-label) so every value keeps its caption. It re-labels after the page redraws a table.
   2. Chart.js: on phones, line charts drop their per-point value labels (they overlap on a narrow screen; the values
      stay in the tooltip when a point is tapped). */
(function(){
  'use strict';
  var mq = window.matchMedia('(max-width:640px)');
  function clean(t){ return String(t || '').replace(/[↑↓▲▼⇅⇵]/g,'').replace(/\s+/g,' ').trim(); }

  function labelTable(tbl){
    var head = tbl.tHead && tbl.tHead.rows.length ? tbl.tHead.rows[tbl.tHead.rows.length - 1] : null;
    if (!head) return;
    var names = [];
    function headText(th){   // join child nodes with spaces so 'Injera Used' + <span>pcs</span> reads 'Injera Used pcs'
      var parts = []; th.childNodes.forEach(function(n){ var t = n.textContent; if (t && t.trim()) parts.push(t.trim()); });
      return clean(parts.join(' '));
    }
    Array.prototype.forEach.call(head.cells, function(th){
      var span = parseInt(th.getAttribute('colspan') || '1', 10) || 1, txt = headText(th);
      for (var i = 0; i < span; i++) names.push(txt);
    });
    Array.prototype.forEach.call(tbl.rows, function(row){
      if (row.parentNode === tbl.tHead) return;
      var col = 0, anyContent = false;
      Array.prototype.forEach.call(row.cells, function(td){
        var span = parseInt(td.getAttribute('colspan') || '1', 10) || 1;
        var label = span > 1 ? '' : (names[col] || '');
        var text = clean(td.textContent);
        var hasControl = !!td.querySelector('button, svg, input, select, a, img');
        var isAct = /^(actions?|more|menu|options|⋮)$/i.test(label) || (!label && !text && hasControl) || (text && /^[⋮…·•.\s]+$/.test(text));
        if (isAct) label = '';
        if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label);
        td.classList.toggle('r-act', isAct && span === 1);
        td.classList.toggle('r-blank', !text && !hasControl);
        if (text || hasControl) anyContent = true;
        col += span;
      });
      row.classList.toggle('r-empty', !anyContent);
    });
  }
  function labelAll(){
    if (!mq.matches) return;
    var list = document.querySelectorAll('table.rcards');
    for (var i = 0; i < list.length; i++) labelTable(list[i]);
  }
  var timer = null;
  function schedule(){ clearTimeout(timer); timer = setTimeout(labelAll, 40); }

  function start(){
    labelAll();
    var obs = new MutationObserver(function(){ if (mq.matches) schedule(); });
    document.querySelectorAll('table.rcards').forEach(function(t){ obs.observe(t, { childList:true, subtree:true }); });
    if (mq.addEventListener) mq.addEventListener('change', labelAll); else if (mq.addListener) mq.addListener(labelAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* ── charts ── */
  function registerChartPlugin(){
    if (!window.Chart || !Chart.register || registerChartPlugin.done) return;
    registerChartPlugin.done = true;
    Chart.register({
      id: 'phoneLabels',
      beforeUpdate: function(chart){
        if (chart.config.type !== 'line') return;
        /* edit the chart's raw config (a plain object); never swap Chart.js' resolved option objects */
        var raw = chart.config.options && chart.config.options.plugins && chart.config.options.plugins.datalabels;
        if (!raw || typeof raw !== 'object') return;
        if (mq.matches){
          if (!chart.$phoneSaved){ chart.$phoneSaved = { had: Object.prototype.hasOwnProperty.call(raw, 'display'), value: raw.display }; }
          raw.display = false;
        } else if (chart.$phoneSaved){
          if (chart.$phoneSaved.had) raw.display = chart.$phoneSaved.value; else delete raw.display;
          chart.$phoneSaved = null;
        }
      }
    });
  }
  registerChartPlugin();
  window.addEventListener('load', registerChartPlugin);
  if (mq.addEventListener) mq.addEventListener('change', function(){
    if (window.Chart && Chart.instances) Object.keys(Chart.instances).forEach(function(k){ try{ Chart.instances[k].update('none'); }catch(e){} });
  });
})();
