app.views.converters = {
  render() {
    const s = app.state.converterState;
    const v = app.state.lastValues;
    const isValid = app.state.isValid;

    // --- BASES ---
    const baseOptions = [
      { id: 'dec', n: 'DECIMAL', p: 'Ex: 255' },
      { id: 'bin', n: 'BINÁRIO', p: 'Ex: 101010' },
      { id: 'hex', n: 'HEXADECIMAL', p: 'Ex: FF' },
      { id: 'oct', n: 'OCTAL', p: 'Ex: 377' }
    ];
    const basePrimary = baseOptions.find(o => o.id === s.bases);
    const baseOthers = baseOptions.filter(o => o.id !== s.bases);

    // --- STORAGE ---
    const storageOptions = [
      { id: 'bytes', n: 'BYTES (B)', p: 'Ex: 1024' },
      { id: 'kb', n: 'KILOBYTES (KB)', p: 'Ex: 1' },
      { id: 'mb', n: 'MEGABYTES (MB)', p: 'Ex: 0.5' },
      { id: 'gb', n: 'GIGABYTES (GB)', p: 'Ex: 0.001' }
    ];
    const storagePrimary = storageOptions.find(o => o.id === s.storage);
    const storageOthers = storageOptions.filter(o => o.id !== s.storage);

    // --- COLORS ---
    const colorOptions = [
      { id: 'hex', n: 'HEX (S/ #)', p: 'FFFFFF' },
      { id: 'rgb', n: 'RGB (R, G, B)', p: '255, 255, 255' }
    ];
    const colorPrimary = colorOptions.find(o => o.id === s.colors);
    const colorOthers = colorOptions.filter(o => o.id !== s.colors);

    return `
            <!-- BASES -->
            <div class="module-section">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>CONVERSOR DE BASES</h2>
                    <span class="error-msg" style="color:#ff1a1a; font-size:0.7rem; display: ${isValid.bases ? 'none' : 'block'}; animation: blink 0.5s infinite;">[!] VALOR_INVÁLIDO</span>
                </div>
                <div class="form-group">
                    <label>INPUT: ${basePrimary.n}</label>
                    <input type="text" id="conv-base-input"
                           class="${!isValid.bases ? 'input-error' : ''}"
                           data-unit="${basePrimary.id}"
                           data-section="bases"
                           value="${v.bases}"
                           placeholder="${basePrimary.p}">
                </div>
                <div class="result-grid">
                    ${baseOthers.map(o => `
                        <div class="result-item" onclick="app.swapConverter('bases', '${o.id}')">
                            <div class="result-label">${o.n}</div>
                            <div class="result-value" id="res-base-${o.id}">-</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- STORAGE -->
            <div class="module-section" style="margin-top: 40px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>ARMAZENAMENTO</h2>
                    <span class="error-msg" style="color:#ff1a1a; font-size:0.7rem; display: ${isValid.storage ? 'none' : 'block'}; animation: blink 0.5s infinite;">[!] VALOR_INVÁLIDO</span>
                </div>
                <div class="form-group">
                    <label>INPUT: ${storagePrimary.n}</label>
                    <input type="text" id="conv-storage-input"
                           class="${!isValid.storage ? 'input-error' : ''}"
                           data-unit="${storagePrimary.id}"
                           data-section="storage"
                           value="${v.storage}"
                           placeholder="${storagePrimary.p}">
                </div>
                <div class="result-grid">
                    ${storageOthers.map(o => `
                        <div class="result-item" onclick="app.swapConverter('storage', '${o.id}')">
                            <div class="result-label">${o.n}</div>
                            <div class="result-value" id="res-storage-${o.id}">0</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- COLORS -->
            <div class="module-section" style="margin-top: 40px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>CORES</h2>
                    <span class="error-msg" style="color:#ff1a1a; font-size:0.7rem; display: ${isValid.colors ? 'none' : 'block'}; animation: blink 0.5s infinite;">[!] VALOR_INVÁLIDO</span>
                </div>
                <div class="form-group">
                    <label>INPUT: ${colorPrimary.n}</label>
                    <input type="text" id="conv-color-input"
                           class="${!isValid.colors ? 'input-error' : ''}"
                           data-unit="${colorPrimary.id}"
                           data-section="colors"
                           value="${v.colors}"
                           placeholder="${colorPrimary.p}">
                </div>
                <div class="result-grid">
                    ${colorOthers.map(o => `
                        <div class="result-item" onclick="app.swapConverter('colors', '${o.id}')">
                            <div class="result-label">${o.n}</div>
                            <div class="result-value" id="res-color-${o.id}">-</div>
                        </div>
                    `).join('')}
                    <div class="result-item" style="cursor:default">
                        <div class="result-label">PREVIEW</div>
                        <div id="res-color-preview" style="height: 30px; border: 1px solid var(--border-color); background: white;"></div>
                    </div>
                </div>
            </div>
        `;
  }
};
