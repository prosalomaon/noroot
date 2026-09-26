app.views.resources = {
  render() {
    return `
            <div class="search-bar" style="margin-bottom:20px">
                <input type="text" id="resource-search" placeholder="SEARCH_RESOURCES...">
            </div>
            <div id="links-container" class="quick-grid">
                ${LINKS.map(l => `
                    <div class="card resource-card" data-tags="${l.t}" data-name="${l.n}">
                        <div style="display:flex; justify-content:space-between">
                            <span class="tag">[${l.t}]</span>
                            <button class="fav-btn" onclick="app.toggleFav('${l.n}')" style="background:none; border:none; color:inherit; cursor:pointer">${app.state.favorites.includes(l.n) ? '★' : '☆'}</button>
                        </div>
                        <h3>${l.n}</h3>
                        <p>${l.d}</p>
                        <a href="${l.u}" target="_blank" style="color:var(--text-primary); text-decoration:underline; font-size:0.8rem">ACCESS_URL</a>
                    </div>
                `).join('')}
            </div>
        `;
  },

  init() {
    const search = document.getElementById('resource-search');
    if (search) {
      search.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.resource-card').forEach(card => {
          const name = card.getAttribute('data-name').toLowerCase();
          const tags = card.getAttribute('data-tags').toLowerCase();
          card.style.display = (name.includes(term) || tags.includes(term)) ? 'block' : 'none';
        });
      });
    }
  }
};
