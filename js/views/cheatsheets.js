app.views.cheatsheets = {
  render() {
    return `
      <div class="search-bar" style="margin-bottom:20px">
          <input type="text" id="cheatsheet-search" placeholder="SEARCH_CHEATSHEETS (ex: git, java)...">
      </div>
      <div id="cheatsheets-container" class="cheatsheet-list">
          ${CHEATSHEETS.map(d => `
              <div class="card cheatsheet-card" data-cat="${d.cat}" data-name="${d.name}">
                  <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                      <span class="tag">[${d.cat}]</span>
                      <span style="font-size: 0.8rem; opacity: 0.5;">CTRL+C_READY</span>
                  </div>
                  <h3>${d.name}</h3>
                  <div class="terminal-box" style="background:rgba(0,0,0,0.4); padding:15px; border:1px solid var(--border-color); margin-top:10px; font-size: 0.82rem; overflow-y: auto; color: var(--text-primary);">
                      <pre style="white-space: pre-wrap; word-break: break-all;"><code>${app.escapeHTML(d.code)}</code></pre>
                  </div>
              </div>
          `).join('')}
      </div>
    `;
  },

  init() {
    const search = document.getElementById('cheatsheet-search');
    if (search) {
      search.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cheatsheet-card').forEach(card => {
          const name = card.getAttribute('data-name').toLowerCase();
          const cat = card.getAttribute('data-cat').toLowerCase();
          card.style.display = (name.includes(term) || cat.includes(term)) ? 'block' : 'none';
        });
      });
    }
  }
};
