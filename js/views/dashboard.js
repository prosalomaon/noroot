app.views.dashboard = {
  render() {
    return `
            <div class="welcome-box">
                <h2>BEM-VINDO, ESTUDANTE_DE_SISTEMAS</h2>
                <p>O EduTech Toolbox é sua central de utilitários offline para estudos e desenvolvimento.</p>
            </div>
            <div class="quick-grid">
                <div class="card" onclick="app.switchView('converters')">
                    <h3>[01] CONVERSORES</h3>
                    <p>Binário, Hex, RGB e Cálculo de Armazenamento em tempo real.</p>
                </div>
                <div class="card" onclick="app.switchView('diagrams')">
                    <h3>[02] CONCEITOS</h3>
                    <p>Visualizador de arquitetura, HTTP e POO.</p>
                </div>
                <div class="card" onclick="app.switchView('resources')">
                    <h3>[03] CURADORIA</h3>
                    <p>Links essenciais, Roadmaps e Ferramentas.</p>
                </div>
                <div class="card" onclick="app.switchView('apostilas')">
                    <h3>[04] APOSTILAS</h3>
                    <p>Material didático completo, guias e manuais em PDF.</p>
                </div>
                <div class="card" onclick="app.switchView('cheatsheets')">
                    <h3>[05] CHEAT SHEETS</h3>
                    <p>Referência rápida: Java, C#, Git, Docker e mais.</p>
                </div>
                <div class="card" onclick="app.switchView('extras')">
                    <h3>[06] EXTRAS</h3>
                    <p>Gerador de Placeholders e utilitários.</p>
                </div>
            </div>
        `;
  }
};
