app.views.apostilas = {
  render() {
    return `
            <div class="module-section">
                <h2>APOSTILAS_E_MANUAIS</h2>
                <div class="search-bar" style="margin-bottom:20px">
                    <input type="text" id="apostila-search" placeholder="FILTER_MATERIALS (ex: banco de dados, web)...">
                </div>
                <div id="apostilas-list" class="quick-grid">
                    ${APOSTILAS.map(a => `
                        <div class="card apostila-card" data-name="${a.n}" data-desc="${a.d}">
                            <div style="display:flex; justify-content:space-between">
                                <span class="tag">[${a.v}]</span>
                                <span class="nav-icon">[PDF]</span>
                            </div>
                            <h3>${a.n}</h3>
                            <p>${a.d}</p>
                            <div style="display:flex; gap:10px; margin-top:15px">
                                <button class="prompt-btn" style="flex:1" onclick="window.open('${a.url}')">VIEW_ONLINE</button>
                                <button class="prompt-btn" style="flex:1" onclick="alert('Download iniciado para: ${a.n}')">DOWNLOAD</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
  },

  init() {
    const search = document.getElementById('apostila-search');
    if (search) {
      search.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.apostila-card').forEach(card => {
          const name = card.getAttribute('data-name').toLowerCase();
          const desc = card.getAttribute('data-desc').toLowerCase();
          card.style.display = (name.includes(term) || desc.includes(term)) ? 'block' : 'none';
        });
      });
    }
  }
};
