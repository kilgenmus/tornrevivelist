# Torn Revive Notes — Chrome Extension

Keep track of every player you **revive** in Torn—automatically.  
The extension also lets you grab any on-screen username manually with one click and stores all entries in a tidy list inside the popup.

---

## ✨ Features
| Action | Result |
|--------|--------|
| **➕ Add username to list** button in the popup | Saves the text inside `<h4 id="skip-to-content">…</h4>` on the current page—even if it’s a duplicate. |
| **Successful revive** (`/revive.php?action=revive…`) | The extension detects Torn’s JSON response *“You successfully revived …”*, extracts the username + ID, and adds it instantly. |
| **Click a saved name** | Deletes that entry. |
| **Persistent storage** | All notes are kept in `chrome.storage.local`; they survive browser restarts. |

---

## 🔧 How it works

1. **Popup (`popup.html / popup.js`)**  
   * Renders the notes list.  
   * Uses `chrome.scripting.executeScript` to pull the current page’s username when you click **Add**.

2. **Content script (`content_script.js`)**  
   * Runs on every `*.torn.com` page.  
   * Injects **`page_hook.js`** into the “page world” as an **external** script (CSP-safe).

3. **Page hook (`page_hook.js`)**  
   * Patches `fetch()` and `XMLHttpRequest` before Torn’s own scripts run.  
   * When a revive call returns JSON containing *“You successfully revived”*, it parses the message and `postMessage`s `{reviveNote: "Username [ID]"}` back to the content script.

4. **Storage bridge**  
   * The content script listens for those messages and pushes each note to `chrome.storage.local`.  
   * Any open popup receives a `storage` change event and re-renders automatically.

---

## 📦 Installation

1. Clone or download this repo.  
2. Open **`chrome://extensions`** → enable **Developer mode**.  
3. Click **Load unpacked** and select the extension folder.  
4. Pin the icon, open Torn, and start reviving!

---

## 🔒 Permissions

| Permission | Reason |
|------------|--------|
| `activeTab` & `scripting` | Let the popup read the current page’s DOM. |
| `storage`  | Persist your notes locally. |
| `https://*.torn.com/*` | Allow the content script + hook to run on Torn. |
| `web_accessible_resources` | Expose `page_hook.js` so it can be injected despite Torn’s CSP. |
