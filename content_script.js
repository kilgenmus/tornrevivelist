// content_script.js  – isolated world
// 1) inject page_hook.js as an external script (CSP-safe)
// 2) listen for window.postMessage and write to storage

/* ---------- inject the file into the real page ---------- */
const s = document.createElement('script');
s.src = chrome.runtime.getURL('page_hook.js');
s.onload = () => s.remove();              // tidy up
(document.head || document.documentElement).appendChild(s);

/* ---------- storage helper ---------- */
function addNote(note) {
  chrome.storage.local.get({notes: []}, ({notes}) => {
    notes.unshift(note);                  // keep duplicates
    chrome.storage.local.set({notes});
  });
}

/* ---------- receive messages from page ---------- */
window.addEventListener('message', (ev) => {
  if (ev.source !== window) return;       // ignore iframes
  if (ev.data?.reviveNote) addNote(ev.data.reviveNote);
});

console.log('[Revive-Notes] content-script ready:', location.href);
