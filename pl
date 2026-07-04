<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>P&amp;L Statement — Mena Injera &amp; Derkosh BMS</title>
<script>
/* ════ EARLY AUTH CHECK ════ */
(function(){
  function loadSessionEarly(){
    try {
      const raw = localStorage.getItem('injera_session') || sessionStorage.getItem('injera_session');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  const s = loadSessionEarly();
  if (!s || !s.access_token || (s.hard_expiry && s.hard_expiry < Date.now())){
    try{ localStorage.removeItem('injera_session'); sessionStorage.removeItem('injera_session'); }catch(e){}
    window.location.replace('login.html');
    throw new Error('No valid session — redirecting to login.');
  }
})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sw:220px;--sw-col:68px;
  --bg:#eef3f0;--white:#fff;
  --td:#16261e;--tm:#5e7268;--tl:#94a89f;
  --border:#e3ece7;
  --green:#27ae60;--red:#e5484d;--amber:#f59e0b;
  --sh:0 1px 3px rgba(20,40,30,.06),0 1px 2px rgba(20,40,30,.04);
  --sh-md:0 4px 14px rgba(20,40,30,.09);
  --sh-lg:0 8px 24px rgba(20,40,30,.12);
  --fs-2xs:9.5px;--fs-xs:10.5px;--fs-sm:11.5px;--fs-base:13px;
  --fs-md:14px;--fs-lg:17px;--fs-xl:20px;
}
body{font-family:'Nunito','Segoe UI',sans-serif;background:var(--bg);color:var(--td);display:flex;min-height:100vh;font-size:var(--fs-base);line-height:1.45;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5,.card-ttl,.logo-txt h2{font-family:'Quicksand','Segoe UI',sans-serif;letter-spacing:.1px}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{0%{opacity:0;transform:scale(.9)}70%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
@keyframes pulseDot{0%,100%{box-shadow:0 0 0 3px rgba(39,174,96,.18)}50%{box-shadow:0 0 0 6px rgba(39,174,96,.1)}}
@keyframes ringPop{0%{box-shadow:0 0 0 0 rgba(229,72,77,.5)}70%{box-shadow:0 0 0 6px rgba(229,72,77,0)}100%{box-shadow:0 0 0 0 rgba(229,72,77,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

/* ══ SIDEBAR ══════════════════════════════════════════ */
.sb{width:var(--sw);min-height:100vh;background:linear-gradient(165deg,#1e6240 0%,#163a26 55%,#10271a 100%);position:fixed;top:0;left:0;bottom:0;display:flex;flex-direction:column;z-index:300;overflow-y:auto;overflow-x:hidden;box-shadow:2px 0 12px rgba(0,0,0,.1);transition:width .22s cubic-bezier(.4,0,.2,1)}
.sb.collapsed{width:var(--sw-col)}
.sb.collapsed .logo-txt,.sb.collapsed .sb-lbl,
.sb.collapsed .sb-a span,.sb.collapsed .sb-foot-txt,
.sb.collapsed .sb-logout{opacity:0;width:0;overflow:hidden;pointer-events:none;transition:opacity .12s}
.sb.collapsed .sb-logo{justify-content:center;padding:14px 0}
.sb.collapsed .sb-a{justify-content:center;margin:1px 10px;padding:9px}
.sb.collapsed .sb-foot{justify-content:center;padding:12px 0}
.sb.collapsed:hover{width:var(--sw);box-shadow:6px 0 28px rgba(0,0,0,.28);z-index:400}
.sb.collapsed:hover .logo-txt,.sb.collapsed:hover .sb-lbl,
.sb.collapsed:hover .sb-a span,.sb.collapsed:hover .sb-foot-txt,
.sb.collapsed:hover .sb-logout{opacity:1;width:auto;overflow:visible;pointer-events:auto;transition:opacity .18s .08s}
.sb.collapsed:hover .sb-logo{justify-content:flex-start;padding:15px 14px 14px}
.sb.collapsed:hover .sb-a{justify-content:flex-start;margin:1px 10px;padding:9px 14px}
.sb.collapsed:hover .sb-foot{justify-content:flex-start;padding:12px 14px}
@media(max-width:1100px){.sb{box-shadow:4px 0 24px rgba(0,0,0,.3)}}
.sb-logo{display:flex;align-items:center;gap:10px;padding:15px 14px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.logo-circle{width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#f7b03a,#e8891a);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid rgba(255,255,255,.2);box-shadow:0 2px 8px rgba(0,0,0,.2)}
.logo-circle svg{width:26px;height:26px}
.logo-txt h2{font-size:11.5px;font-weight:700;color:#fff;line-height:1.25;white-space:nowrap}
.logo-txt p{font-size:7px;color:rgba(255,255,255,.38);letter-spacing:1.2px;text-transform:uppercase;margin-top:3px;font-weight:600}
.sb-grp{padding:10px 0 2px}
.sb-lbl{font-size:var(--fs-2xs);font-weight:700;color:rgba(255,255,255,.28);letter-spacing:1.6px;text-transform:uppercase;padding:0 14px 4px}
.sb-a{display:flex;align-items:center;gap:9px;padding:8px 12px;color:rgba(255,255,255,.65);font-size:var(--fs-sm);font-weight:500;cursor:pointer;border-radius:7px;margin:1px 8px;text-decoration:none;transition:background .15s,color .15s,transform .1s;white-space:nowrap}
.sb-a:hover{background:rgba(255,255,255,.08);color:#fff;transform:translateX(1px)}
.sb-a.active{background:linear-gradient(135deg,#34c97a,#27ae60);color:#fff;font-weight:700;box-shadow:0 3px 10px rgba(39,174,96,.4)}
.sb-a svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;opacity:.85}
.sb-a.active svg{opacity:1}
.sb-foot{margin-top:auto;padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:9px}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(145deg,#34c97a,#27ae60);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--fs-sm);color:#fff;flex-shrink:0;box-shadow:0 2px 6px rgba(39,174,96,.3)}
.av-lg{width:36px;height:36px;font-size:13px}
.sb-foot-txt h4{font-size:var(--fs-sm);font-weight:700;color:#fff}
.sb-foot-txt span{font-size:var(--fs-xs);color:rgba(255,255,255,.45)}
.sb-logout{margin-left:auto;color:rgba(255,255,255,.4);cursor:pointer;display:flex;transition:color .15s}
.sb-logout:hover{color:#fff}
.sb-logout svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* ══ CONFIRM MODAL ═════════════════════════════════════ */
.cfm-ov{position:fixed;inset:0;background:rgba(16,39,26,.45);backdrop-filter:blur(2px);z-index:1000;display:none;align-items:center;justify-content:center;animation:fadeIn .15s ease}
.cfm-ov.show{display:flex}
.cfm-box{background:#fff;border-radius:16px;width:360px;max-width:90vw;padding:26px;box-shadow:0 20px 50px rgba(16,39,26,.25);animation:popIn .2s ease}
.cfm-ico{width:46px;height:46px;border-radius:50%;background:#fdecea;color:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.cfm-ico svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cfm-box h3{font-family:'Quicksand',sans-serif;font-size:17px;font-weight:700;color:var(--td);margin-bottom:6px}
.cfm-box p{font-size:var(--fs-sm);color:var(--tm);line-height:1.5;margin-bottom:20px}
.cfm-actions{display:flex;gap:10px}
.cfm-btn{flex:1;padding:11px;border-radius:10px;border:none;font-family:'Nunito',sans-serif;font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:opacity .15s,transform .1s}
.cfm-btn:active{transform:scale(.97)}
.cfm-btn-cancel{background:var(--bg);color:var(--tm)}
.cfm-btn-cancel:hover{background:#e3ece7}
.cfm-btn-danger{background:var(--red);color:#fff}
.cfm-btn-danger:hover{opacity:.9}

/* ══ EXPORT LOADING OVERLAY ════════════════════════════ */
.exp-loading{position:fixed;inset:0;background:rgba(16,39,26,.55);z-index:1100;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px}
.exp-loading.show{display:flex}
.exp-spinner{width:38px;height:38px;border:3.5px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
.exp-loading p{color:#fff;font-family:'Nunito',sans-serif;font-weight:700;font-size:var(--fs-sm)}

/* ══ MAIN ══════════════════════════════════════════════ */
.main{margin-left:var(--sw);flex:1;display:flex;flex-direction:column;transition:margin-left .22s cubic-bezier(.4,0,.2,1)}
.main.sb-collapsed{margin-left:var(--sw-col)}

/* ══ TOPBAR ════════════════════════════════════════════ */
.topbar{background:#fff;border-bottom:1px solid var(--border);padding:0 20px;height:58px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:200}
.tb-ham{cursor:pointer;color:var(--tm);display:flex;transition:color .15s;padding:4px}
.tb-ham:hover{color:var(--td)}
.tb-ham svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
.tb-ttl h1{font-size:var(--fs-lg);font-weight:700;color:var(--td);line-height:1.1}
.tb-ttl p{font-size:var(--fs-xs);color:var(--tl);margin-top:2px}
.tb-mid{margin-left:auto;display:flex;align-items:center;gap:8px}
.mpick{display:flex;align-items:center;gap:7px;border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:var(--fs-base);font-weight:600;color:var(--td);background:#fff;height:34px;transition:border-color .15s}
.mpick:hover{border-color:#b5cfc0}
.mpick svg{width:14px;height:14px;stroke:#a4b6ac;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.mpick select{border:none;outline:none;font-family:'Nunito',sans-serif;font-size:var(--fs-base);font-weight:600;color:var(--td);cursor:pointer;background:transparent}
.arr{width:30px;height:34px;border:1px solid var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;color:var(--tm);font-size:16px;transition:background .15s,border-color .15s,transform .1s;user-select:none}
.arr:hover{background:var(--bg);border-color:#b5cfc0}
.arr:active{transform:scale(.9)}
.tb-right{display:flex;align-items:center;gap:10px;position:relative}

.bell{position:relative;width:36px;height:34px;border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;transition:border-color .15s,transform .15s;flex-shrink:0}
.bell:hover{border-color:#b5cfc0}
.bell:active{transform:scale(.92)}
.bell svg{width:17px;height:17px;stroke:var(--tm);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.bell-badge{position:absolute;top:-5px;right:-5px;background:var(--red);color:#fff;font-size:8px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;animation:ringPop 2.4s ease-in-out infinite}

.notif-panel{position:absolute;top:calc(100% + 10px);right:130px;width:340px;background:#fff;border-radius:14px;border:1px solid var(--border);box-shadow:var(--sh-lg);z-index:400;display:none;animation:slideDown .2s ease}
.notif-panel.open{display:block}
.notif-panel-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.notif-panel-title{font-size:var(--fs-md);font-weight:700;color:var(--td)}
.notif-mark-all{font-size:var(--fs-xs);color:var(--green);font-weight:600;cursor:pointer}
.notif-item{display:flex;gap:10px;padding:11px 16px;border-bottom:1px solid #f5f9f6;cursor:pointer;transition:background .15s}
.notif-item:hover{background:#f7fbf9}
.notif-item:last-child{border-bottom:none}
.notif-item-ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-item-ico svg{width:16px;height:16px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ni-r{background:#fdeaea}.ni-r svg{stroke:var(--red)}
.ni-o{background:#fef2e0}.ni-o svg{stroke:var(--amber)}
.ni-p{background:#fce3eb}.ni-p svg{stroke:#e91e63}
.ni-b{background:#dfeefe}.ni-b svg{stroke:#2563eb}
.ni-g{background:#e3f6ec}.ni-g svg{stroke:var(--green)}
.notif-item-bd{flex:1;min-width:0}
.notif-item-bd h5{font-size:var(--fs-sm);font-weight:700;color:var(--td);line-height:1.3;margin-bottom:2px}
.notif-item-bd p{font-size:var(--fs-xs);color:var(--tl)}
.notif-item-time{font-size:9px;color:var(--tl);white-space:nowrap;flex-shrink:0;padding-top:2px}
.notif-panel-ft{padding:10px 16px;text-align:center;border-top:1px solid var(--border)}
.notif-panel-ft a{font-size:var(--fs-xs);font-weight:700;color:var(--green);cursor:pointer}

.stat-pill{display:flex;align-items:center;gap:6px;background:#eaf8f0;border:1px solid #b5ddc5;border-radius:20px;padding:5px 13px;font-size:var(--fs-sm);font-weight:600;color:#19733f}
.stat-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulseDot 2.2s ease-in-out infinite}

.uchip{display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 6px 4px 4px;border-radius:8px;transition:background .15s;position:relative}
.uchip:hover{background:var(--bg)}
.uchip-txt h4{font-size:var(--fs-sm);font-weight:700;color:var(--td);line-height:1.1}
.uchip-txt span{font-size:var(--fs-xs);color:var(--tl)}
.uchip svg{width:12px;height:12px;stroke:var(--tl);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s}
.uchip.open svg{transform:rotate(180deg)}
.user-panel{position:absolute;top:calc(100% + 10px);right:0;width:220px;background:#fff;border-radius:14px;border:1px solid var(--border);box-shadow:var(--sh-lg);z-index:400;display:none;animation:slideDown .2s ease}
.user-panel.open{display:block}
.user-panel-top{padding:16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.user-panel-top .av{width:40px;height:40px;font-size:15px}
.user-panel-name h4{font-size:var(--fs-base);font-weight:700;color:var(--td)}
.user-panel-name span{font-size:var(--fs-xs);color:var(--tl)}
.user-panel-item{display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:var(--fs-sm);font-weight:600;color:var(--tm);cursor:pointer;transition:background .15s}
.user-panel-item:hover{background:#f7fbf9;color:var(--td)}
.user-panel-item svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.user-panel-divider{height:1px;background:var(--border);margin:4px 0}
.user-panel-item.danger{color:var(--red)}
.user-panel-item.danger:hover{background:#fdeaea}

/* ══ CONTENT ════════════════════════════════════════════ */
.content{padding:18px 20px;flex:1}
.card{background:#fff;border-radius:12px;border:1px solid var(--border);box-shadow:var(--sh);overflow:hidden;transition:box-shadow .2s}
.card:hover{box-shadow:var(--sh-md)}
.card-hd{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 9px}
.card-ttl{font-size:var(--fs-md);font-weight:700;color:var(--td);display:flex;align-items:center;gap:6px}
.card-ttl-sub{font-size:var(--fs-xs);font-weight:600;color:var(--tl)}

/* ══ P&L LAYOUT ═════════════════════════════════════════ */
.pl-layout{display:grid;grid-template-columns:1fr 360px;gap:16px;align-items:start}
.pl-side{display:flex;flex-direction:column;gap:16px}
@media(max-width:1100px){.pl-layout{grid-template-columns:1fr}}

.pl-card-hd{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid var(--border)}
.pl-card-hd h2{font-size:16px;font-weight:700;color:var(--td)}
.pl-card-hd p{font-size:var(--fs-xs);color:var(--tl);margin-top:3px}
.pl-currency{font-size:var(--fs-xs);font-weight:700;color:var(--tm);white-space:nowrap;padding-top:3px}

.pl-table-wrap{overflow-x:auto}
.pl-table{width:100%;border-collapse:collapse;font-size:var(--fs-base);min-width:620px}
.pl-table th{padding:11px 22px;text-align:right;font-size:var(--fs-xs);font-weight:700;color:var(--tl);border-bottom:1px solid var(--border);white-space:nowrap}
.pl-table th:first-child{text-align:left}
.pl-th-sub{display:block;font-size:9px;font-weight:600;color:var(--tl);margin-top:2px}
.pl-table td{padding:8px 22px;color:var(--td);text-align:right;white-space:nowrap}
.pl-table td:first-child{text-align:left;color:var(--tm);white-space:normal}
.pl-table tr.pl-row:hover td{background:#f7fbf9}
.pl-section td{padding:16px 22px 6px;font-weight:700;color:#1e8a4f;font-size:var(--fs-sm);text-transform:uppercase;letter-spacing:.4px}
.pl-pct{color:var(--tl);font-size:var(--fs-xs)}
.pl-total td{font-weight:700;background:#eaf8f0;border-top:1.5px solid #bcdece;border-bottom:1.5px solid #bcdece;color:var(--td)}
.pl-total td:nth-child(2),.pl-total td:nth-child(4){color:#19733f}
.pl-gross td{font-weight:700;background:#eaf8f0;color:var(--td)}
.pl-gross td:nth-child(2),.pl-gross td:nth-child(4){color:#19733f}
.pl-spacer td{padding:6px 0;border:none}
.pl-net td{font-weight:800;font-size:15px;border-top:2px solid var(--td);padding-top:15px;padding-bottom:15px;color:var(--td)}
.pl-net td:nth-child(2),.pl-net td:nth-child(4){color:#19733f}

/* Profit Summary */
.ps-item{display:flex;align-items:center;gap:11px;padding:11px 16px;border-bottom:1px solid #f0f5f2}
.ps-item:last-child{border-bottom:none}
.ps-ico{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ps-ico svg{width:17px;height:17px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ic-g{background:#e3f6ec}.ic-g svg{stroke:var(--green)}
.ic-o{background:#fef2e0}.ic-o svg{stroke:var(--amber)}
.ic-r{background:#fdeaea}.ic-r svg{stroke:var(--red)}
.ic-pu{background:#ede9fe}.ic-pu svg{stroke:#7c3aed}
.ps-mid{flex:1;min-width:0}
.ps-lbl{font-size:var(--fs-xs);color:var(--tl);font-weight:600;margin-bottom:2px}
.ps-val{font-size:15px;font-weight:700;color:var(--td);display:flex;align-items:baseline;gap:3px}
.ps-val .u{font-size:9.5px;font-weight:600;color:var(--tm)}
.ps-chg{text-align:right;font-size:9.5px;font-weight:600;white-space:nowrap;flex-shrink:0}
.up{color:var(--green)}.dn{color:var(--red)}
.vs{color:var(--tl);font-weight:500;margin-left:2px;display:block}

/* YTD Summary */
.ytd-row{display:flex;align-items:center;justify-content:space-between;padding:9px 16px;border-bottom:1px solid #f0f5f2;font-size:var(--fs-sm)}
.ytd-row:last-child{border-bottom:none}
.ytd-row .yl{color:var(--tm);font-weight:600}
.ytd-row .yv{font-weight:700;color:var(--td)}
.ytd-row.bold .yl{color:var(--td);font-weight:700}
.ytd-row.bold .yv{font-weight:800}
.ytd-row.green .yv{color:#19733f}

/* Quick Actions (reused button grid) */
.qa-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px 13px 13px}
.qa-b{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:14px 5px;border-radius:10px;border:1px solid var(--border);cursor:pointer;font-size:var(--fs-xs);font-weight:700;color:var(--tm);background:#fff;text-align:center;line-height:1.3;transition:all .15s}
.qa-b:hover{background:#eaf8f0;border-color:#b5ddc5;color:#19733f;transform:translateY(-1px);box-shadow:0 3px 8px rgba(39,174,96,.12)}
.qa-b:active{transform:translateY(0) scale(.96)}
.qa-b svg{width:20px;height:20px;stroke:var(--green);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.qa-b:hover svg{transform:scale(1.15)}

/* ══ FOOTER ════════════════════════════════════════════ */
.footer{text-align:center;padding:12px;font-size:var(--fs-xs);color:var(--tl);border-top:1px solid var(--border);background:#fff}

/* ══ PRINT ═════════════════════════════════════════════ */
@media print{
  .sb,.topbar,.pl-side,.footer,.exp-loading{display:none!important}
  .main{margin-left:0!important}
  .content{padding:0!important}
  .pl-layout{display:block}
  .card{box-shadow:none;border:none}
  body{background:#fff}
}
</style>
</head>
<body>

<!-- ════ SIDEBAR ════ -->
<aside class="sb" id="sidebar">
  <div class="sb-logo">
    <div class="logo-circle">
      <svg viewBox="0 0 28 28" fill="none">
        <ellipse cx="14" cy="15" rx="9" ry="6" fill="white"/>
        <path d="M7 12 Q14 10 21 12" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/>
        <path d="M6 14 Q14 12 22 14" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/>
        <path d="M7 16 Q14 14 21 16" stroke="#e8891a" stroke-width="1" stroke-linecap="round"/>
        <path d="M14 4 L14 9" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M11 6 L14 4 L17 6" stroke="rgba(255,255,255,0.8)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="logo-txt">
      <h2>MENA INJERA<br>&amp; DERKOSH</h2>
      <p>Business Management System</p>
    </div>
  </div>

  <div class="sb-grp">
    <div class="sb-lbl">Main</div>
    <a class="sb-a" href="dashboard.html" title="Dashboard"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Dashboard</span></a>
    <a class="sb-a" href="purchases.html" title="Purchases"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg><span>Purchases</span></a>
    <a class="sb-a" href="production.html" title="Production"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Production</span></a>
    <a class="sb-a" href="derkosh.html" title="Derkosh"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg><span>Derkosh</span></a>
    <a class="sb-a" href="sales.html" title="Sales"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg><span>Sales</span></a>
    <a class="sb-a" href="pettycash.html" title="Petty Cash"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg><span>Petty Cash</span></a>
  </div>

  <div class="sb-grp">
    <div class="sb-lbl">Finance</div>
    <a class="sb-a active" href="pl.html" title="P&amp;L Statement"><svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><span>P&amp;L Statement</span></a>
    <a class="sb-a" href="cashflow.html" title="Cash Flow"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span>Cash Flow</span></a>
    <a class="sb-a" href="overhead.html" title="Monthly Overhead"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span>Monthly Overhead</span></a>
    <a class="sb-a" href="budget.html" title="Budget vs Actual"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Budget vs Actual</span></a>
    <a class="sb-a" href="loans.html" title="Loans"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg><span>Loans</span></a>
    <a class="sb-a" href="profit.html" title="Distribution"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg><span>Distribution</span></a>
  </div>

  <div class="sb-grp">
    <div class="sb-lbl">Records</div>
    <a class="sb-a" href="customers.html" title="Customers"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Customers</span></a>
    <a class="sb-a" href="suppliers.html" title="Suppliers"><svg viewBox="0 0 24 24"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><span>Suppliers</span></a>
    <a class="sb-a" href="inventory.html" title="Inventory"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg><span>Inventory</span></a>
  </div>

  <div class="sb-grp">
    <div class="sb-lbl">Reports</div>
    <a class="sb-a" href="reports.html" title="Multi-Year"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>Multi-Year</span></a>
  </div>

  <div class="sb-grp">
    <div class="sb-lbl">Settings</div>
    <a class="sb-a" href="manage-users.html" title="Manage Users"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg><span>Manage Users</span></a>
    <a class="sb-a" href="settings.html" title="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg><span>Settings</span></a>
  </div>

  <div class="sb-foot">
    <div class="av">EM</div>
    <div class="sb-foot-txt"><h4>Eyasu Mesfin</h4><span>Owner</span></div>
    <div class="sb-logout" title="Sign out"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
  </div>
</aside>

<!-- ════ MAIN ════ -->
<div class="main" id="mainContent">

  <!-- TOPBAR -->
  <header class="topbar">
    <div class="tb-ham" onclick="toggleSidebar()" title="Toggle sidebar">
      <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </div>
    <div class="tb-ttl">
      <h1>P&amp;L Statement</h1>
      <p>Profit and Loss Statement</p>
    </div>
    <div class="tb-mid">
      <div class="mpick">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <select id="msel" onchange="chgM()">
          <option>Jan 2026</option><option>Feb 2026</option><option>Mar 2026</option>
          <option>Apr 2026</option><option selected>May 2026</option><option>Jun 2026</option>
        </select>
        <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:#aab8b2;stroke-width:3"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="arr" onclick="stepMonth(-1)">&#8249;</div>
      <div class="arr" onclick="stepMonth(1)">&#8250;</div>
    </div>
    <div class="tb-right">
      <div class="bell" id="bellBtn" onclick="toggleNotif(event)">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div class="bell-badge" id="bellBadge">2</div>
      </div>
      <div class="notif-panel" id="notifPanel">
        <div class="notif-panel-hd">
          <span class="notif-panel-title">Notifications</span>
          <span class="notif-mark-all" onclick="markAllRead()">Mark all read</span>
        </div>
        <div class="notif-item"><div class="notif-item-ico ni-o"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div class="notif-item-bd"><h5>Expense approval pending</h5><p>Rent — 5,000.00 ETB</p></div><div class="notif-item-time">25 min ago</div></div>
        <div class="notif-item"><div class="notif-item-ico ni-g"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div><div class="notif-item-bd"><h5>May statement ready</h5><p>Net Profit: 29,669.00 ETB</p></div><div class="notif-item-time">3 hrs ago</div></div>
        <div class="notif-panel-ft"><a onclick="closeNotif()">View all notifications →</a></div>
      </div>

      <div class="stat-pill"><div class="stat-dot"></div>Data is up to date</div>

      <!-- User chip -->
      <div class="uchip" id="userChip" onclick="toggleUserPanel(event)">
        <div class="av av-lg">EM</div>
        <div class="uchip-txt">
          <h4>Eyasu Mesfin</h4>
          <span>Owner</span>
        </div>
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="user-panel" id="userPanel">
        <div class="user-panel-top">
          <div class="av" style="width:40px;height:40px;font-size:15px">EM</div>
          <div class="user-panel-name"><h4>Eyasu Mesfin</h4><span>Owner · Mena Injera</span></div>
        </div>
        <div class="user-panel-item" id="userPanelProfile"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile</div>
        <div class="user-panel-item" id="userPanelAddUser"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg> Manage Users</div>
        <div class="user-panel-item" id="userPanelSettings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Settings</div>
        <div class="user-panel-item" id="userPanelHelp"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Help &amp; Support</div>
        <div class="user-panel-divider"></div>
        <div class="user-panel-item danger" id="userPanelSignOut"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign Out</div>
      </div>
    </div>
  </header>

  <div class="content">
    <div class="pl-layout">

      <!-- P&L TABLE CARD -->
      <div class="card pl-card">
        <div class="pl-card-hd">
          <div>
            <h2>Profit &amp; Loss Statement</h2>
            <p id="plDateLbl">For the month ended May 31, 2026</p>
          </div>
          <div class="pl-currency">Currency: ETB</div>
        </div>
        <div class="pl-table-wrap">
          <table class="pl-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th>This Month<span class="pl-th-sub" id="thMonthLbl">May 2026</span></th>
                <th>% of Revenue</th>
                <th>Year to Date<span class="pl-th-sub" id="thYtdLbl">May 2026</span></th>
                <th>% of Revenue</th>
              </tr>
            </thead>
            <tbody id="plBody">
              <tr><td colspan="5" style="padding:24px;text-align:center;color:var(--tl)">Loading live figures…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="pl-side">
        <div class="card">
          <div class="card-hd"><div class="card-ttl">Profit Summary <span class="card-ttl-sub" id="psPeriodLbl">(May 2026)</span></div></div>
          <div id="psBody">
            <div class="ps-item"><div class="ps-mid"><div class="ps-lbl">Loading…</div></div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-hd"><div class="card-ttl">Year to Date Summary <span class="card-ttl-sub" id="ytdPeriodLbl2">(Jan–May 2026)</span></div></div>
          <div id="ytdBody">
            <div class="ytd-row"><span class="yl">Loading…</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-hd"><div class="card-ttl">Quick Actions</div></div>
          <div class="qa-g">
            <div class="qa-b" onclick="exportExcel()"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>Export P&amp;L<br>(Excel)</div>
            <div class="qa-b" onclick="exportPDF()"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Export P&amp;L<br>(PDF)</div>
            <div class="qa-b" onclick="printStatement()"><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print<br>Statement</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <footer class="footer">© 2026 Mena Injera &amp; Derkosh Business Management System v37. All rights reserved.</footer>
</div>

<!-- Sign-out confirm modal -->
<div class="cfm-ov" id="cfmOverlay">
  <div class="cfm-box">
    <div class="cfm-ico"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
    <h3 id="cfmTitle">Sign Out</h3>
    <p id="cfmMsg">Are you sure you want to sign out of Mena Injera &amp; Derkosh BMS?</p>
    <div class="cfm-actions">
      <button class="cfm-btn cfm-btn-cancel" id="cfmCancel">Cancel</button>
      <button class="cfm-btn cfm-btn-danger" id="cfmConfirm">Sign Out</button>
    </div>
  </div>
</div>

<!-- Export loading overlay -->
<div class="exp-loading" id="exportLoading">
  <div class="exp-spinner"></div>
  <p id="exportLoadingText">Building your export…</p>
</div>

<script>
// ── Session / Auth ────────────────────────────────────────
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
(function guardAndPopulateSidebar(){
  const session = loadSession();
  if (!session || !session.access_token || (session.hard_expiry && session.hard_expiry < Date.now())){
    clearSession();
    window.location.href = 'login.html';
    return;
  }
  const initials = (session.name || '').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || '??';
  const roleLbl = session.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : '';
  document.querySelectorAll('.sb-foot .av, .uchip .av, .user-panel-top .av').forEach(el => el.textContent = initials);
  const sbName = document.querySelector('.sb-foot-txt h4'); if (sbName) sbName.textContent = session.name || 'Unknown User';
  const sbRole = document.querySelector('.sb-foot-txt span'); if (sbRole) sbRole.textContent = roleLbl;
  const chipName = document.querySelector('.uchip-txt h4'); if (chipName) chipName.textContent = session.name || 'Unknown User';
  const chipRole = document.querySelector('.uchip-txt span'); if (chipRole) chipRole.textContent = roleLbl;
  const panelName = document.querySelector('.user-panel-name h4'); if (panelName) panelName.textContent = session.name || 'Unknown User';
  const panelRole = document.querySelector('.user-panel-name span'); if (panelRole) panelRole.textContent = `${roleLbl} · Mena Injera`;
  const addUserItem = document.getElementById('userPanelAddUser');
  if (addUserItem && !['owner','manager'].includes(session.role)) addUserItem.style.display = 'none';
})();

function showConfirm({title, message, confirmLabel = 'Confirm', onConfirm}){
  const ov = document.getElementById('cfmOverlay');
  document.getElementById('cfmTitle').textContent = title;
  document.getElementById('cfmMsg').textContent = message;
  const confirmBtn = document.getElementById('cfmConfirm');
  confirmBtn.textContent = confirmLabel;
  ov.classList.add('show');
  const cleanup = () => {
    ov.classList.remove('show');
    confirmBtn.removeEventListener('click', onConfirmClick);
    cancelBtn.removeEventListener('click', onCancelClick);
    ov.removeEventListener('click', onOverlayClick);
  };
  const onConfirmClick = () => { cleanup(); onConfirm(); };
  const onCancelClick = () => cleanup();
  const onOverlayClick = (e) => { if (e.target === ov) cleanup(); };
  const cancelBtn = document.getElementById('cfmCancel');
  confirmBtn.addEventListener('click', onConfirmClick);
  cancelBtn.addEventListener('click', onCancelClick);
  ov.addEventListener('click', onOverlayClick);
}
function signOut(){
  showConfirm({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out of Mena Injera & Derkosh BMS?',
    confirmLabel: 'Sign Out',
    onConfirm: () => { clearSession(); window.location.href = 'login.html'; }
  });
}
document.querySelector('.sb-logout')?.addEventListener('click', signOut);
document.getElementById('userPanelSignOut')?.addEventListener('click', signOut);
document.getElementById('userPanelAddUser')?.addEventListener('click', () => window.location.href = 'manage-users.html');
document.getElementById('userPanelProfile')?.addEventListener('click', () => window.location.href = 'settings.html');
document.getElementById('userPanelSettings')?.addEventListener('click', () => window.location.href = 'settings.html');

// ── Sidebar ─────────────────────────────────────────────
function setSidebar(collapsed){
  const sb=document.getElementById('sidebar');
  const main=document.getElementById('mainContent');
  sb.classList.toggle('collapsed',collapsed);
  main.classList.toggle('sb-collapsed',collapsed);
}
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  setSidebar(!sb.classList.contains('collapsed'));
}
function autoSidebarForWidth(){ if(window.innerWidth<=1100) setSidebar(true); }
window.addEventListener('resize',autoSidebarForWidth);
autoSidebarForWidth();

// ── Month Picker ─────────────────────────────────────────
function chgM(){ refreshPL(); }
function stepMonth(d){
  const s=document.getElementById('msel');
  const i=s.selectedIndex+d;
  if(i>=0&&i<s.options.length){s.selectedIndex=i;chgM();}
}

// ── Notifications Panel ──────────────────────────────────
let notifOpen=false;
function toggleNotif(e){
  e.stopPropagation();
  notifOpen=!notifOpen;
  document.getElementById('notifPanel').classList.toggle('open',notifOpen);
  document.getElementById('userPanel').classList.remove('open');
  document.getElementById('userChip').classList.remove('open');
  userOpen=false;
}
function closeNotif(){notifOpen=false;document.getElementById('notifPanel').classList.remove('open');}
function markAllRead(){ document.getElementById('bellBadge').style.display='none'; closeNotif(); }

// ── User Panel ───────────────────────────────────────────
let userOpen=false;
function toggleUserPanel(e){
  e.stopPropagation();
  userOpen=!userOpen;
  document.getElementById('userPanel').classList.toggle('open',userOpen);
  document.getElementById('userChip').classList.toggle('open',userOpen);
  document.getElementById('notifPanel').classList.remove('open');
  notifOpen=false;
}
document.addEventListener('click',function(){
  if(notifOpen){closeNotif();notifOpen=false;}
  if(userOpen){document.getElementById('userPanel').classList.remove('open');document.getElementById('userChip').classList.remove('open');userOpen=false;}
});

// ══════════════════════════════════════════════════════════
// ── SUPABASE CONFIG & HELPERS ────────────────────────────
// ══════════════════════════════════════════════════════════
const SB_URL = 'https://mfxkkaavgzyttasgqnmw.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_ZaaVgQ3LCfq3qu7KSHh5CA_RZ3go9xH';
async function sbGet(path){
  const res = await fetch(`${SB_URL}/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if(!res.ok){
    let detail = '';
    try{ detail = (await res.json()).message || ''; }catch{}
    throw new Error(`Supabase ${res.status} on ${path.split('?')[0]}${detail ? ': '+detail : ''}`);
  }
  return res.json();
}
function num(v){ return v===null || v===undefined || v==='' ? 0 : Number(v); }
function fmtETB(n){ return num(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function pctOf(v, total){ return total ? (v/total*100) : 0; }
function approved(status){ return ['auto_approved','approved'].includes(status); }

const MONTH_NAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
function labelToPeriod(label){
  const [mon, yr] = label.trim().split(' ');
  const mi = MONTH_NAMES.indexOf(mon) + 1;
  return `${yr}-${String(mi).padStart(2,'0')}`;
}
function periodToLabel(period){
  const [yr, mo] = period.split('-');
  return `${MONTH_NAMES[parseInt(mo,10)-1]} ${yr}`;
}
function shiftPeriod(period, delta){
  const [yr, mo] = period.split('-').map(Number);
  const d = new Date(yr, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function periodEndDate(period){
  const [y,m]=period.split('-').map(Number);
  const d = new Date(y, m, 0);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDateLong(dateStr){
  const [y,m,d] = dateStr.split('-').map(Number);
  return `${MONTH_FULL[m-1]} ${d}, ${y}`;
}
function pctChangeStr(cur, prev, invert){
  if(!prev) return '<span class="vs">no prior data</span>';
  const chg = ((cur-prev)/Math.abs(prev))*100;
  const isUp = invert ? chg < 0 : chg >= 0;
  const cls = isUp ? 'up' : 'dn';
  const arrow = chg >= 0 ? '▲' : '▼';
  return `<span class="${cls}">${arrow} ${Math.abs(chg).toFixed(1)}%</span><span class="vs">vs ${periodToLabel(PREV_PERIOD)}</span>`;
}
function ppChangeStr(cur, prev){
  if(prev===null||prev===undefined) return '<span class="vs">no prior data</span>';
  const diff = cur-prev;
  const cls = diff>=0?'up':'dn';
  const arrow = diff>=0?'▲':'▼';
  return `<span class="${cls}">${arrow} ${Math.abs(diff).toFixed(1)}pp</span><span class="vs">vs ${periodToLabel(PREV_PERIOD)}</span>`;
}

let PREV_PERIOD = '';
let LAST = null;
let INV_ITEMS_MAP = {};

async function loadInvItems(){
  try{
    const items = await sbGet(`inventory_items?select=id,name`);
    INV_ITEMS_MAP = {};
    items.forEach(i=>INV_ITEMS_MAP[i.id]=i);
  }catch(e){ console.error('Failed to load inventory items', e); }
}

async function fetchPeriodSet(filterClause){
  const [sales, purchases, overhead, petty, lrs] = await Promise.all([
    sbGet(`sales?select=product_type,revenue&${filterClause}&is_deleted=eq.false`),
    sbGet(`purchases?select=type,total_cost,approval_status,item_id,expense_categories(name)&${filterClause}&is_deleted=eq.false`),
    sbGet(`monthly_overhead?select=amount,overhead_categories(name)&${filterClause}`),
    sbGet(`petty_cash?select=amount,expense_categories(name)&${filterClause}`),
    sbGet(`loan_repayment_schedule?select=interest_portion,status&${filterClause}`)
  ]);
  return {sales, purchases, overhead, petty, lrs};
}

// ── Core P&L aggregation (IAS 2 basis: overhead lives in COGS, never OpEx) ──
function calcFigures(d){
  const injeraRevenue = d.sales.filter(s=>s.product_type==='injera').reduce((s,r)=>s+num(r.revenue),0);
  const derkoshRevenue = d.sales.filter(s=>s.product_type==='derkosh').reduce((s,r)=>s+num(r.revenue),0);
  const totalRevenue = injeraRevenue + derkoshRevenue;

  const itemMap = {};
  d.purchases.filter(p=>p.type==='purchase' && approved(p.approval_status)).forEach(p=>{
    const name = INV_ITEMS_MAP[p.item_id]?.name || 'Other';
    itemMap[name] = (itemMap[name]||0) + num(p.total_cost);
  });
  const injeraBlend = itemMap['Injera Blend']||0;
  const corn = itemMap['Corn']||0;
  const gomenZere = itemMap['Gomen Zere']||0;
  const packaging = (itemMap['Small Bags']||0) + (itemMap['Large Bags']||0);

  const ohMap = {};
  d.overhead.forEach(o=>{
    const name = o.overhead_categories?.name || 'Other Overhead';
    ohMap[name] = (ohMap[name]||0) + num(o.amount);
  });
  const labor = ohMap['Labor/Wages']||0;
  const electricity = ohMap['Electricity']||0;
  const water = ohMap['Water']||0;
  const rent = ohMap['Rent']||0;
  const maintenance = ohMap['Maintenance']||0;
  const otherOverhead = ohMap['Other Overhead']||0;

  const totalCOGS = injeraBlend+corn+gomenZere+packaging+labor+electricity+water+rent+maintenance+otherOverhead;
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = pctOf(grossProfit, totalRevenue);

  const expMap = {};
  d.purchases.filter(p=>p.type==='expense' && approved(p.approval_status)).forEach(p=>{
    const name = p.expense_categories?.name || 'Other';
    expMap[name] = (expMap[name]||0) + num(p.total_cost);
  });
  d.petty.forEach(pc=>{
    const name = pc.expense_categories?.name || 'Other';
    expMap[name] = (expMap[name]||0) + num(pc.amount);
  });
  const deliveryOut = expMap['Delivery Out']||0;
  const marketing = expMap['Marketing']||0;
  const otherOperatingExpenses = (expMap['Bank Charges']||0) + (expMap['Other']||0);
  const totalOpex = deliveryOut + marketing + otherOperatingExpenses;

  const interestExpense = d.lrs.filter(l=>l.status==='paid').reduce((s,l)=>s+num(l.interest_portion),0);

  const totalExpensesCard = totalOpex + interestExpense;
  const netProfit = grossProfit - totalOpex - interestExpense;
  const netMargin = pctOf(netProfit, totalRevenue);

  return { injeraRevenue, derkoshRevenue, totalRevenue,
    injeraBlend, corn, gomenZere, packaging, labor, electricity, water, rent, maintenance, otherOverhead, totalCOGS,
    grossProfit, grossMargin,
    deliveryOut, marketing, otherOperatingExpenses, totalOpex,
    interestExpense, totalExpensesCard, netProfit, netMargin };
}

// ── Shared row builder (used by both the table render and Excel export) ──
function buildPLRows(cur, ytd){
  const rows = [];
  rows.push({type:'section', label:'Revenue'});
  rows.push({type:'row', label:'Injera Sales', curV:cur.injeraRevenue, ytdV:ytd.injeraRevenue});
  rows.push({type:'row', label:'Derkosh Sales', curV:cur.derkoshRevenue, ytdV:ytd.derkoshRevenue});
  rows.push({type:'total', label:'Total Revenue', curV:cur.totalRevenue, ytdV:ytd.totalRevenue, cls:'pl-total'});

  rows.push({type:'section', label:'Cost of Goods Sold'});
  rows.push({type:'row', label:'Injera Blend', curV:cur.injeraBlend, ytdV:ytd.injeraBlend});
  rows.push({type:'row', label:'Corn', curV:cur.corn, ytdV:ytd.corn});
  rows.push({type:'row', label:'Gomen Zere', curV:cur.gomenZere, ytdV:ytd.gomenZere});
  rows.push({type:'row', label:'Packaging (Small & Large Bags)', curV:cur.packaging, ytdV:ytd.packaging});
  rows.push({type:'row', label:'Labor / Wages', curV:cur.labor, ytdV:ytd.labor});
  rows.push({type:'row', label:'Electricity', curV:cur.electricity, ytdV:ytd.electricity});
  rows.push({type:'row', label:'Water', curV:cur.water, ytdV:ytd.water});
  rows.push({type:'row', label:'Rent', curV:cur.rent, ytdV:ytd.rent});
  rows.push({type:'row', label:'Maintenance', curV:cur.maintenance, ytdV:ytd.maintenance});
  if(cur.otherOverhead || ytd.otherOverhead) rows.push({type:'row', label:'Other Overhead', curV:cur.otherOverhead, ytdV:ytd.otherOverhead});
  rows.push({type:'total', label:'Total COGS', curV:cur.totalCOGS, ytdV:ytd.totalCOGS, cls:'pl-total'});

  rows.push({type:'total', label:'Gross Profit', curV:cur.grossProfit, ytdV:ytd.grossProfit, cls:'pl-gross'});
  rows.push({type:'pctonly', label:'Gross Margin %', curPct:cur.grossMargin, ytdPct:ytd.grossMargin, cls:'pl-gross'});

  rows.push({type:'section', label:'Operating Expenses'});
  rows.push({type:'row', label:'Delivery Out & Transport', curV:cur.deliveryOut, ytdV:ytd.deliveryOut});
  rows.push({type:'row', label:'Marketing', curV:cur.marketing, ytdV:ytd.marketing});
  rows.push({type:'row', label:'Other Operating Expenses', curV:cur.otherOperatingExpenses, ytdV:ytd.otherOperatingExpenses});
  rows.push({type:'total', label:'Total Operating Expenses', curV:cur.totalOpex, ytdV:ytd.totalOpex, cls:'pl-total'});

  rows.push({type:'spacer'});
  rows.push({type:'row', label:'Interest Expense (Loan)', curV:cur.interestExpense, ytdV:ytd.interestExpense});
  rows.push({type:'total', label:'NET PROFIT', curV:cur.netProfit, ytdV:ytd.netProfit, cls:'pl-net'});
  return rows;
}

function renderTable(cur, ytd){
  const rows = buildPLRows(cur, ytd);
  let html='';
  rows.forEach(r=>{
    if(r.type==='section') html+=`<tr class="pl-section"><td colspan="5">${r.label}</td></tr>`;
    else if(r.type==='spacer') html+=`<tr class="pl-spacer"><td colspan="5"></td></tr>`;
    else if(r.type==='pctonly') html+=`<tr class="${r.cls}"><td>${r.label}</td><td>${r.curPct.toFixed(1)}%</td><td></td><td>${r.ytdPct.toFixed(1)}%</td><td></td></tr>`;
    else {
      const cls = r.type==='total' ? r.cls : 'pl-row';
      const curPct = pctOf(r.curV, cur.totalRevenue);
      const ytdPct = pctOf(r.ytdV, ytd.totalRevenue);
      html += `<tr class="${cls}"><td>${r.label}</td><td>${fmtETB(r.curV)}</td><td class="pl-pct">${curPct.toFixed(1)}%</td><td>${fmtETB(r.ytdV)}</td><td class="pl-pct">${ytdPct.toFixed(1)}%</td></tr>`;
    }
  });
  document.getElementById('plBody').innerHTML = html;
}

function psRow(iconClass, iconSvg, label, valueStr, unit, changeHtml){
  return `<div class="ps-item">
    <div class="ps-ico ${iconClass}"><svg viewBox="0 0 24 24">${iconSvg}</svg></div>
    <div class="ps-mid">
      <div class="ps-lbl">${label}</div>
      <div class="ps-val">${valueStr}${unit?`<span class="u">${unit}</span>`:''}</div>
    </div>
    <div class="ps-chg">${changeHtml}</div>
  </div>`;
}
const ICO_REVENUE = '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>';
const ICO_TREND = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
const ICO_PERCENT = '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>';
const ICO_DOC = '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>';
const ICO_CHECK = '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
const ICO_SHARE = '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>';

function renderProfitSummary(cur, prev){
  document.getElementById('psBody').innerHTML =
    psRow('ic-g', ICO_REVENUE, 'Total Revenue', fmtETB(cur.totalRevenue), 'ETB', pctChangeStr(cur.totalRevenue, prev.totalRevenue)) +
    psRow('ic-g', ICO_TREND, 'Gross Profit', fmtETB(cur.grossProfit), 'ETB', pctChangeStr(cur.grossProfit, prev.grossProfit)) +
    psRow('ic-o', ICO_PERCENT, 'Gross Margin', cur.grossMargin.toFixed(1), '%', ppChangeStr(cur.grossMargin, prev.grossMargin)) +
    psRow('ic-r', ICO_DOC, 'Total Expenses', fmtETB(cur.totalExpensesCard), 'ETB', pctChangeStr(cur.totalExpensesCard, prev.totalExpensesCard, true)) +
    psRow('ic-g', ICO_CHECK, 'Net Profit', fmtETB(cur.netProfit), 'ETB', pctChangeStr(cur.netProfit, prev.netProfit)) +
    psRow('ic-pu', ICO_SHARE, 'Net Profit Margin', cur.netMargin.toFixed(1), '%', ppChangeStr(cur.netMargin, prev.netMargin));
}

function ytdRowHTML(label, valueStr, cls=''){
  return `<div class="ytd-row ${cls}"><span class="yl">${label}</span><span class="yv">${valueStr}</span></div>`;
}
function renderYTD(ytd){
  document.getElementById('ytdBody').innerHTML =
    ytdRowHTML('Total Revenue', fmtETB(ytd.totalRevenue)+' ETB') +
    ytdRowHTML('Total COGS', fmtETB(ytd.totalCOGS)+' ETB') +
    ytdRowHTML('Gross Profit', fmtETB(ytd.grossProfit)+' ETB', 'bold') +
    ytdRowHTML('Gross Margin', ytd.grossMargin.toFixed(1)+'%', 'bold green') +
    ytdRowHTML('Total Expenses', fmtETB(ytd.totalExpensesCard)+' ETB') +
    ytdRowHTML('Net Profit', fmtETB(ytd.netProfit)+' ETB', 'bold green') +
    ytdRowHTML('Net Profit Margin', ytd.netMargin.toFixed(1)+'%', 'bold green');
}

function updateHeaderLabels(period, yearStart){
  const label = periodToLabel(period);
  document.getElementById('thMonthLbl').textContent = label;
  document.getElementById('thYtdLbl').textContent = label;
  document.getElementById('psPeriodLbl').textContent = `(${label})`;
  const startLbl = MONTH_NAMES[0];
  document.getElementById('ytdPeriodLbl2').textContent = `(${startLbl}–${label})`;
  document.getElementById('plDateLbl').textContent = `For the month ended ${fmtDateLong(periodEndDate(period))}`;
}

// ══════════════════════════════════════════════════════════
// ── MASTER REFRESH ───────────────────────────────────────
// ══════════════════════════════════════════════════════════
async function refreshPL(){
  const msel = document.getElementById('msel');
  const period = labelToPeriod(msel.value);
  const prevP = shiftPeriod(period, -1);
  const year = period.split('-')[0];
  const yearStart = `${year}-01`;
  PREV_PERIOD = prevP;

  try{
    const [monthData, prevData, ytdData] = await Promise.all([
      fetchPeriodSet(`period=eq.${period}`),
      fetchPeriodSet(`period=eq.${prevP}`),
      fetchPeriodSet(`period=gte.${yearStart}&period=lte.${period}`)
    ]);

    const cur = calcFigures(monthData);
    const prev = calcFigures(prevData);
    const ytd = calcFigures(ytdData);

    LAST = {cur, ytd, period};

    renderTable(cur, ytd);
    renderProfitSummary(cur, prev);
    renderYTD(ytd);
    updateHeaderLabels(period, yearStart);
  }catch(err){
    console.error('P&L refresh failed', err);
    document.getElementById('plBody').innerHTML = `<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--tl)">Could not load live P&amp;L data — ${err.message}</td></tr>`;
  }
}

// ── Quick Actions: Excel / PDF / Print ───────────────────
function exportExcel(){
  if(!LAST) return;
  const {cur, ytd, period} = LAST;
  const rows = buildPLRows(cur, ytd);
  const aoa = [
    ['Mena Injera & Derkosh — Profit & Loss Statement'],
    [document.getElementById('plDateLbl').textContent],
    [],
    ['Particulars', `This Month (${periodToLabel(period)})`, '% of Revenue', `Year to Date (${periodToLabel(period)})`, '% of Revenue']
  ];
  rows.forEach(r=>{
    if(r.type==='section') aoa.push([r.label.toUpperCase(),'','','','']);
    else if(r.type==='spacer') aoa.push(['','','','','']);
    else if(r.type==='pctonly') aoa.push([r.label, r.curPct.toFixed(1)+'%','', r.ytdPct.toFixed(1)+'%','']);
    else aoa.push([r.label, Number(r.curV.toFixed(2)), pctOf(r.curV,cur.totalRevenue).toFixed(1)+'%', Number(r.ytdV.toFixed(2)), pctOf(r.ytdV,ytd.totalRevenue).toFixed(1)+'%']);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{wch:32},{wch:16},{wch:12},{wch:16},{wch:12}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'P&L Statement');
  XLSX.writeFile(wb, `Mena-Injera-PL-${period}.xlsx`);
}

async function exportPDF(){
  if(!LAST) return;
  const loading = document.getElementById('exportLoading');
  document.getElementById('exportLoadingText').textContent = 'Building your PDF statement…';
  loading.classList.add('show');
  try{
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const el = document.querySelector('.pl-card');
    const canvas = await html2canvas(el, {scale:2, backgroundColor:'#ffffff'});
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
    const pageW = pdf.internal.pageSize.getWidth();
    const imgW = pageW - 20;
    const imgH = canvas.height * imgW / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, imgH, undefined, 'FAST');
    pdf.save(`Mena-Injera-PL-${LAST.period}.pdf`);
  }catch(err){
    console.error('PDF export failed', err);
    alert('Something went wrong generating the PDF. Please try again.');
  }finally{
    loading.classList.remove('show');
  }
}

function printStatement(){ window.print(); }

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadInvItems();
  refreshPL();
});
</script>
</body>
</html>
