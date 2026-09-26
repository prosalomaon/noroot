app.views.diagrams = {
  render() {
    return `
            <div class="module-section">
                <h2>EXPLORER: DIAGRAMA_TÉCNICO</h2>

                <div class="search-bar" style="margin-bottom:20px">
                    <input type="text" id="diagram-search" placeholder="FILTER_DIAGRAMS (ex: jwt, backend, dns)...">
                </div>

                <div class="filter-group" style="margin-bottom: 30px; display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="prompt-btn cat-filter" data-cat="all">ALL_SYSTEMS</button>
                    <button class="prompt-btn cat-filter" data-cat="Foundations">FOUNDATIONS</button>
                    <button class="prompt-btn cat-filter" data-cat="Frontend">FRONTEND</button>
                    <button class="prompt-btn cat-filter" data-cat="Backend">BACKEND</button>
                    <button class="prompt-btn cat-filter" data-cat="DevOps">DEVOPS</button>
                </div>

                <div id="diagrams-list">
                    ${DIAGRAMS.map(d => `
                        <div class="diagram-container diagram-item" data-cat="${d.cat}" data-name="${d.n}" style="margin-top: 20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <h3>${d.n}</h3>
                                <span class="tag">[${d.cat}]</span>
                            </div>
                            <pre class="mermaid">${d.s}</pre>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
  },

  init() {
    const search = document.getElementById('diagram-search');
    const filters = document.querySelectorAll('.cat-filter');
    const items = document.querySelectorAll('.diagram-item');

    const updateFilters = () => {
      const term = search ? search.value.toLowerCase() : '';
      const activeCat = document.querySelector('.cat-filter.active')?.getAttribute('data-cat') || 'all';

      items.forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        const cat = item.getAttribute('data-cat');
        const matchSearch = name.includes(term) || cat.toLowerCase().includes(term);
        const matchCat = activeCat === 'all' || activeCat === cat;
        item.style.display = (matchSearch && matchCat) ? 'block' : 'none';
      });
      // Re-run mermaid for filtered items if necessary (usually they stay rendered)
    };

    if (search) search.addEventListener('keyup', updateFilters);
    filters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateFilters();
      });
    });

    // Initial active state
    document.querySelector('.cat-filter[data-cat="all"]')?.classList.add('active');
  }
};
