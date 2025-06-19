// page_hook.js  – runs in the real page context
(() => {
    const reviveRE = /\/revive\.php.*\baction=revive\b.*\bstep=revive\b.*\bID=\d+\b/i;
  
    function extractNote(msgHtml) {
      const box = document.createElement('div');
      box.innerHTML = msgHtml;
      const a = box.querySelector('a[href*="XID="]');
      if (!a) return null;
      const username = a.textContent.trim();
      const id = (a.href.match(/XID=(\d+)/) || [])[1] || '';
      return `${username} [${id}]`;
    }
  
    /* ── fetch hook ─────────────────────────────────────────────── */
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const resp = await origFetch.apply(this, args);
      try {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (url && reviveRE.test(url)) {
          const data = await resp.clone().json();
          if (data?.msg?.includes('You successfully revived')) {
            const note = extractNote(data.msg);
            if (note) window.postMessage({reviveNote: note});
          }
        }
      } catch {/* ignore */}
      return resp;
    };
  
    /* ── XHR hook ──────────────────────────────────────────────── */
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u, ...rest) {
      this._reviveURL = u;
      return origOpen.call(this, m, u, ...rest);
    };
  
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener('load', () => {
        try {
          if (this._reviveURL && reviveRE.test(this._reviveURL)) {
            const data = JSON.parse(this.responseText);
            if (data?.msg?.includes('You successfully revived')) {
              const note = extractNote(data.msg);
              if (note) window.postMessage({reviveNote: note});
            }
          }
        } catch {/* ignore */}
      });
      return origSend.apply(this, args);
    };
  
    console.log('[Revive-Notes] page hook installed');
  })();
  