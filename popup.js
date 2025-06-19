// Utility: fetch notes array from storage
function getNotes() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ notes: [] }, (data) => resolve(data.notes));
    });
  }
  
  // Utility: save notes array to storage
  function setNotes(notes) {
    chrome.storage.local.set({ notes });
  }
  
  // Render notes into <ul>
  function render(notes) {
    const ul = document.getElementById('notes');
    ul.innerHTML = '';
    notes.forEach((n, idx) => {
      const li = document.createElement('li');
      li.textContent = n;
      li.style.cursor = 'pointer';
      li.title = 'Click to delete';
      // Delete note on click
      li.addEventListener('click', async () => {
        const current = await getNotes();
        current.splice(idx, 1);
        setNotes(current);
        render(current);
      });
      ul.appendChild(li);
    });
  }
  
  // Handler: add note button
  async function addCurrentPageNote() {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
  
    // Inject code into the page to grab the <h4 id="skip-to-content"> text
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          const el = document.querySelector('h4#skip-to-content');
          return el ? el.textContent.trim() : null;
        }
      },
      async (results) => {
        if (!results || !results[0] || results[0].result === null) {
          alert('No <h4 id="skip-to-content"> element found on this page.');
          return;
        }
  
        const noteText = results[0].result;
        const notes = await getNotes();
  
        // Always add newest on top (allow duplicates)
        notes.unshift(noteText);
        setNotes(notes);
        render(notes);
      }
    );
  }
  
  // Initialise popup
  (async () => {
    const notes = await getNotes();
    render(notes);
    document.getElementById('addBtn').addEventListener('click', addCurrentPageNote);
  })();