/* Site-wide notice for every page and mosque screen, edited in one file: site/notice.json.
   {
     "active": true,                 // false hides it everywhere
     "id": "2026-10-07-update",      // change it for each new notice (a closed notice stays closed until the id changes)
     "level": "info",                // "info" (gold) or "warn" (red)
     "until": "2026-10-10",          // optional: hidden after this date
     "text": { "ar": "…", "en": "…", "fr": "…", "it": "…" }
   }
   Pages load it at start and every 30 minutes, so open mosque screens see it without reloading.
   On a mosque screen (data-persistent) it cannot be closed; elsewhere a × closes it. */
(function () {
  const me = document.currentScript;
  const base = new URL('.', me.src).href;
  const persistent = me.hasAttribute('data-persistent');
  const targetId = me.getAttribute('data-target');
  let notice = null;

  const css = document.createElement('style');
  css.textContent = `.nd-notice{position:relative;z-index:30;display:flex;align-items:center;gap:12px;padding:10px 16px;font:600 15px/1.6 "IBM Plex Sans Arabic","Segoe UI",Tahoma,system-ui,sans-serif;background:#c9a35a;color:#061c18}
.nd-notice.warn{background:#b3261e;color:#fff}
.nd-notice span{flex:1;text-align:center}
.nd-notice button{background:none;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;padding:0 4px}
.nd-notice.big{font-size:clamp(15px,1.6vw,28px);padding:clamp(8px,1vw,16px) 20px}`;
  document.head.appendChild(css);

  const closed = id => { try { return localStorage.getItem('nudiya-notice-closed') === id; } catch (e) { return false; } };
  const pickText = n => {
    const lang = (document.documentElement.lang || 'ar').slice(0, 2);
    const t = n.text || {};
    return t[lang] || t.ar || t.en || Object.values(t)[0] || '';
  };

  function render() {
    let el = document.getElementById('ndNotice');
    const n = notice;
    const expired = n && n.until && new Date(n.until + 'T23:59:59') < new Date();
    if (!n || !n.active || expired || !pickText(n) || (!persistent && closed(n.id))) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'ndNotice';
      el.setAttribute('role', 'status');
      const host = (targetId && document.getElementById(targetId)) || document.body;
      host.insertBefore(el, host.firstChild);
    }
    el.className = 'nd-notice' + (n.level === 'warn' ? ' warn' : '') + (persistent ? ' big' : '');
    el.dir = 'auto';
    el.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = pickText(n);
    el.appendChild(span);
    if (!persistent) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', '×');
      b.textContent = '×';
      b.onclick = () => { try { localStorage.setItem('nudiya-notice-closed', n.id || ''); } catch (e) {} el.remove(); };
      el.appendChild(b);
    }
  }

  async function load() {
    try {
      const r = await fetch(base + 'notice.json?t=' + Date.now(), { cache: 'no-store' });
      if (r.ok) notice = await r.json();
    } catch (e) {}
    render();
  }

  // Follow language changes of the page.
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  load();
  setInterval(load, 30 * 60 * 1000);
})();
