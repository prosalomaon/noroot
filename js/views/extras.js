app.views.extras = {
  render() {
    return `
            <div class="module-section">
                <h2>LOREM IPSUM GENERATOR</h2>
                <div class="form-group">
                    <label>PARAGRAPHS</label>
                    <input type="number" id="lorem-count" value="1">
                </div>
                <div class="result-item">
                    <div class="result-value" id="lorem-output" style="font-size:0.9rem">Lorem ipsum dolor sit amet...</div>
                </div>
            </div>

            <div class="module-section" style="margin-top:40px">
                <h2>IMAGE PLACEHOLDER</h2>
                <div class="form-group">
                    <label>WIDTH x HEIGHT</label>
                    <div style="display:flex; gap:10px">
                        <input type="number" id="img-w" value="300">
                        <input type="number" id="img-h" value="200">
                    </div>
                </div>
                <div class="result-item">
                    <div class="result-value" id="img-output" style="font-size:0.8rem">https://placehold.co/300x200</div>
                    <button class="prompt-btn" style="margin-top:10px" onclick="window.open('https://placehold.co/'+document.getElementById('img-w').value+'x'+document.getElementById('img-h').value)">OPEN_IMAGE</button>
                </div>
            </div>
        `;
  }
};
