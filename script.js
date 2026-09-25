const app = {
  state: {
    activeView: 'dashboard',
    theme: 'theme-matrix',
    favorites: JSON.parse(localStorage.getItem('edu_favorites')) || [],
    converterState: {
      bases: 'dec',
      storage: 'bytes',
      colors: 'hex'
    },
    lastValues: {
      bases: '',
      storage: '',
      colors: ''
    },
    isValid: {
      bases: true,
      storage: true,
      colors: true
    }
  },

  swapConverter(section, newUnit) {
    if (this.state.converterState[section] === newUnit) return;
    this.state.converterState[section] = newUnit;
    
    // Convert current value to the new base/unit before swapping if possible
    // (This ensures the value feels persistent even when units change)
    this.loadView('converters');
    
    // Trigger immediate re-calculation for the new setup
    const input = document.querySelector(`[data-section="${section}"]`);
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },

  // Initialization
  init() {
    console.log('EDU_TECH_TOOLBOX: Booting system...');
    this.setupNavigation();
    this.setupTheme();
    this.loadView(this.state.activeView);

    // Auto-initialize real-time listeners for views
    window.addEventListener('input', (e) => this.handleGlobalInput(e));

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('SW: Registered'))
        .catch(err => console.log('SW: Failed', err));
    }

    console.log('System ready.');

    // Initialize Mermaid
    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true }
      });
    }
  },

  // View Management
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const viewId = e.currentTarget.getAttribute('data-view');
        this.switchView(viewId);
      });
    });
  },

  switchView(viewId) {
    if (this.state.activeView === viewId) return;

    // Update UI
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    this.state.activeView = viewId;
    this.loadView(viewId);

    // Update header/breadcrumb
    document.getElementById('view-title').innerText = viewId.charAt(0).toUpperCase() + viewId.slice(1);
    document.getElementById('breadcrumb').innerText = `root / ${viewId}`;
  },

  async loadView(viewId) {
    const container = document.getElementById('view-container');

    // Render content based on viewId
    let content = '';
    switch (viewId) {
      case 'dashboard':
        content = this.renderDashboard();
        break;
      case 'converters':
        content = this.renderConverters();
        break;
      case 'diagrams':
        content = this.renderDiagrams();
        break;
      case 'resources':
        content = this.renderResources();
        break;
      case 'apostilas':
        content = this.renderApostilas();
        break;
      case 'cheatsheets':
        content = this.renderCheatSheets();
        break;
      case 'extras':
        content = this.renderExtras();
        break;
      default:
        content = `<div>Error: View [${viewId}] not found.</div>`;
    }

    container.innerHTML = `<div id="${viewId}-view" class="view active">${content}</div>`;

    // Initialize dynamic elements if needed
    if (viewId === 'resources') this.initResourceFilters();
    if (viewId === 'apostilas') this.initApostilaFilters();
    if (viewId === 'cheatsheets') this.initCheatSheetFilters();
    if (viewId === 'diagrams' && window.mermaid) {
      this.initDiagramFilters();
      setTimeout(() => mermaid.run(), 50);
    }
  },

  // Theme Management
  setupTheme() {
    const savedTheme = localStorage.getItem('edu_theme') || 'theme-matrix';
    document.body.className = savedTheme;
    document.getElementById('theme-select').value = savedTheme;

    document.getElementById('theme-select').addEventListener('change', (e) => {
      const theme = e.target.value;
      document.body.className = theme;
      localStorage.setItem('edu_theme', theme);
    });
  },

  // --- VIEW RENDERING FUNCTIONS ---

  renderDashboard() {
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
  },

  renderConverters() {
    const s = this.state.converterState;
    const v = this.state.lastValues;
    const isValid = this.state.isValid;
    
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
  },

  renderDiagrams() {
    const diagrams = [
      { id: 'git', cat: 'DevOps', n: 'Git Flow Workflow', s: 'gitGraph\n    commit\n    branch develop\n    checkout develop\n    commit\n    branch feature/login\n    checkout feature/login\n    commit\n    commit\n    checkout develop\n    merge feature/login\n    commit\n    checkout main\n    merge develop tag: "v1.0.0"' },
      { id: 'http', cat: 'Foundations', n: 'Ciclo HTTP Request/Response', s: 'sequenceDiagram\n    participant B as Browser\n    participant S as Server\n    participant DB as Database\n    B->>S: GET /profile (Headers)\n    S->>S: Validate Session\n    S->>DB: SELECT * FROM users\n    DB-->>S: User Data\n    S-->>B: 200 OK (HTML/JSON)' },
      { id: 'mvc', cat: 'Backend', n: 'Arquitetura MVC', s: 'flowchart LR\n    U[Usuário] <--> C{Controller}\n    C --> V[View]\n    C <--> M[(Model)]\n    M <--> DB[(Database)]' },
      { id: 'er', cat: 'Backend', n: 'Relacionamento de Entidades (ER)', s: 'erDiagram\n    USER ||--o{ POST : writes\n    POST ||--|{ COMMENT : contains' },
      { id: 'poo', cat: 'Foundations', n: 'Herança em POO', s: 'classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal : +int age\n    Animal : +mate()' },
      { id: 'dns', cat: 'Foundations', n: 'Resolução de DNS', s: 'sequenceDiagram\n    participant B as Browser\n    participant R as Resolver\n    participant RT as Root\n    participant TLD as TLD (.com)\n    participant A as Auth DNS\n    B->>R: google.com?\n    R->>RT: root?\n    RT-->>R: TLD 1.2.3.4\n    R->>TLD: google.com?\n    TLD-->>R: Auth 5.6.7.8\n    R->>A: IP?\n    A-->>R: 172.217.1.1\n    R-->>B: Done' },
      { id: 'cicd', cat: 'DevOps', n: 'Pipeline CI/CD', s: 'flowchart LR\n    Push[Code Push] --> Build(Build)\n    Build --> Test{Tests}\n    Test -- Fail --> Msg[Notify]\n    Test -- Pass --> Deploy[Stage/Prod]' },
      { id: 'jwt', cat: 'Backend', n: 'Autenticação JWT', s: 'sequenceDiagram\n    participant C as Client\n    participant S as Server\n    C->>S: Login Credentials\n    S->>S: Sign Token (Secret)\n    S-->>C: JWT Token\n    C->>S: Auth Bearer <token>\n    S->>S: Verify Signature\n    S-->>C: Protected Data' },
      { id: 'micro', cat: 'Backend', n: 'Microservices & API Gateway', s: 'flowchart TD\n    Client --> GW[API Gateway]\n    GW --> S1[Auth Service]\n    GW --> S2[Order Service]\n    GW --> S3[Inventory Service]\n    S1 <--> DB1[(DB)]\n    S2 <--> DB2[(DB)]' },
      { id: 'osi', cat: 'Foundations', n: 'Modelo OSI (7 Camadas)', s: 'flowchart TD\n    L7[Aplicação] --> L6[Apresentação]\n    L6 --> L5[Sessão]\n    L5 --> L4[Transporte]\n    L4 --> L3[Rede]\n    L3 --> L2[Enlace]\n    L2 --> L1[Física]' },
      { id: 'render', cat: 'Frontend', n: 'DOM Rendering Pipeline', s: 'flowchart LR\n    HTML --> DOM[DOM Tree]\n    CSS --> CSSOM[CSSOM Tree]\n    DOM & CSSOM --> Layout[Render Tree]\n    Layout --> Paint[Painting]\n    Paint --> Composite[Compositing]' },
      { id: 'loop', cat: 'Frontend', n: 'JS Event Loop', s: 'flowchart TD\n    Stack[Call Stack] --> API[Web APIs/Node]\n    API --> Queue[Task Queue]\n    Queue --> Loop{Event Loop}\n    Loop --> Stack' },
      { id: 'ssr', cat: 'Frontend', n: 'SSR vs CSR Architecture', s: 'flowchart TD\n    subgraph SSR\n    S1[Server Renders HTML] --> S2[Browser Shows Page]\n    end\n    subgraph CSR\n    C1[Server Sends Empty HTML] --> C2[Browser Fetches JS]\n    C2 --> C3[JS Renders Content]\n    end' }
    ];

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
                    ${diagrams.map(d => `
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

  renderResources() {
    const links = [
      { n: 'Roadmap.sh', t: 'Fundamentos', u: 'https://roadmap.sh', d: 'Trilhas de aprendizado.' },
      { n: 'CS50', t: 'Cursos', u: 'https://cs50.harvard.edu/', d: 'O melhor curso de CS do mundo.' },
      { n: 'GitHub', t: 'Ferramentas', u: 'https://github.com', d: 'Hospedagem de código.' },
      { n: 'W3Schools', t: 'Prática', u: 'https://w3schools.com', d: 'Referência web.' },
      { n: 'Draw.io', t: 'Ferramentas', u: 'https://app.diagrams.net', d: 'Diagramas online.' }
    ];
    return `
            <div class="search-bar" style="margin-bottom:20px">
                <input type="text" id="resource-search" placeholder="SEARCH_RESOURCES...">
            </div>
            <div id="links-container" class="quick-grid">
                ${links.map(l => `
                    <div class="card resource-card" data-tags="${l.t}" data-name="${l.n}">
                        <div style="display:flex; justify-content:space-between">
                            <span class="tag">[${l.t}]</span>
                            <button class="fav-btn" onclick="app.toggleFav('${l.n}')" style="background:none; border:none; color:inherit; cursor:pointer">${this.state.favorites.includes(l.n) ? '★' : '☆'}</button>
                        </div>
                        <h3>${l.n}</h3>
                        <p>${l.d}</p>
                        <a href="${l.u}" target="_blank" style="color:var(--text-primary); text-decoration:underline; font-size:0.8rem">ACCESS_URL</a>
                    </div>
                `).join('')}
            </div>
        `;
  },

  renderCheatSheets() {
    const data = [
      {
        cat: 'Version Control',
        name: 'Git',
        code: `# Configuração
$ git config --global user.name "Seu Nome"
$ git config --global user.email "email@exemplo.com"

# Fluxo Básico
$ git init                    # Inicia repo local
$ git add .                   # Adiciona tudo ao stage
$ git commit -m "Mensagem"    # Snapshot local
$ git status                  # Verifica alterações

# Branching & Merging
$ git branch <nome>           # Cria branch
$ git checkout -b <nome>      # Cria e muda para branch
$ git merge <branch>          # Mescla branch no atual
$ git branch -d <branch>      # Deleta branch local

# Remotos
$ git remote add origin <url> # Conecta ao servidor
$ git push -u origin main     # Primeiro push
$ git pull origin main        # Baixa e mescla
$ git fetch --all             # Baixa sem mesclar

# Utilidades
$ git log --oneline           # Histórico resumido
$ git stash                   # Salva alterações temporariamente
$ git stash pop               # Recupera alterações
$ git reset --hard HEAD~1     # Volta 1 commit (apaga tudo!)
$ git cherry-pick <hash>      # Puxa um commit específico`
      },
      {
        cat: 'DevOps',
        name: 'Docker',
        code: `# Imagens
$ docker build -t nome:tag .  # Cria imagem do Dockerfile
$ docker images               # Lista imagens locais
$ docker rmi <id>             # Remove imagem

# Containers
$ docker run -d -p 80:80 img  # Roda em background
$ docker ps                   # Lista containers ativos
$ docker ps -a                # Lista todos os containers
$ docker stop <id>            # Para container
$ docker rm <id>              # Remove container
$ docker exec -it <id> sh     # Entra no terminal do container

# Volumes & Rede
$ docker volume ls            # Lista volumes
$ docker network inspect bridge# Inspeciona rede

# Docker Compose
$ docker-compose up -d        # Sobe ambiente
$ docker-compose down         # Para e remove tudo
$ docker-compose logs -f      # Segue os logs`
      },
      {
        cat: 'OS',
        name: 'Linux',
        code: `# Navegação & Arquivos
$ ls -lah                     # Lista com detalhes e ocultos
$ cd ..                       # Sobe um diretório
$ mkdir -p a/b/c              # Cria pastas recursivas
$ rm -rf <dir>                # Deleta forçadamente (Cuidado!)
$ cp -r <ori> <dest>          # Copia recursivo

# Permissões (Owner/Group/Others)
$ chmod 755 script.sh         # rwxr-xr-x
$ chmod 644 file.txt          # rw-r--r--
$ chown user:group file       # Muda dono e grupo

# Processos & Monitoramento
$ top                         # Monitora recursos (vivos)
$ htop                        # top melhorado (se instalado)
$ ps aux | grep node          # Procura processos Node
$ kill -9 <pid>               # Mata processo forçado

# Rede & logs
$ curl -I google.com          # Cabeçalhos HTTP
$ journalctl -u docker -f     # Segue logs do serviço docker
$ netstat -tunlp              # Verifica portas abertas`
      },
      {
        cat: 'Web',
        name: 'HTML5',
        code: `<!-- Estrutura Semântica -->
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Título</title>
</head>
<body>
  <header>Cabeçalho</header>
  <nav>Navegação</nav>
  <main>
    <article>Conteúdo Principal</article>
    <aside>Barra Lateral</aside>
  </main>
  <footer>Rodapé</footer>

  <!-- Inputs Comuns -->
  <input type="text" placeholder="Nome">
  <input type="checkbox" id="check"><label for="check">OK</label>
  <button type="submit">Enviar</button>

  <!-- Tags SEO/Acessibilidade -->
  <meta name="description" content="...">
  <img src="img.jpg" alt="Descrição essencial">
</body>
</html>`
      },
      {
        cat: 'Web',
        name: 'PWA',
        code: `// Registro de Service Worker (main.js)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Ciclo de Vida do SW (sw.js)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(['/', '/style.css', '/app.js']);
    })
  );
});

// Estratégia: Cache First
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

// Manifesto (manifest.json)
{
  "name": "App Name",
  "start_url": ".",
  "display": "standalone",
  "icons": [...]
}`
      },
      {
        cat: 'Database',
        name: 'SQL',
        code: `-- Consultas Básicas
SELECT name, age FROM users WHERE age > 18 ORDER BY name DESC;

-- Junções (Joins)
SELECT u.name, p.title 
FROM users u 
INNER JOIN posts p ON u.id = p.user_id;

-- Agregações
SELECT category, COUNT(*), SUM(price)
FROM products
GROUP BY category
HAVING SUM(price) > 1000;

-- Modificações
INSERT INTO users (name, email) VALUES ('Dev', 'dev@test.com');
UPDATE users SET active = 1 WHERE id = 10;
DELETE FROM logs WHERE created_at < '2023-01-01';

-- Índices
CREATE INDEX idx_user_email ON users(email);`
      },
      {
        cat: 'Languages',
        name: 'JavaScript',
        code: `// ES6+ Features
const { name, ...rest } = person; // Destructuring
const arr = [...oldArr, 4, 5];    // Spread

// Promessas / Async-Await
async function getData() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// Manipulação de Array
const doubled = nums.map(n => n * 2);
const adults = users.filter(u => u.age >= 18);
const sum = nums.reduce((acc, curr) => acc + curr, 0);

// Módulos
export const myVal = 10;
import { myVal } from './file.js';`
      },
      {
        cat: 'Languages',
        name: 'Python',
        code: `# List Comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dicionários
user = {"name": "Dev", "role": "Admin"}
name = user.get("name", "Anônimo")

# Decoradores
def debug(func):
    def wrapper(*args, **kwargs):
        print(f"Chamando {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@debug
def hello():
    print("Olá!")

# Gerenciamento de Arquivos
with open("data.txt", "r") as f:
    content = f.read()

# Tipagem (Type Hinting)
def soma(a: int, b: int) -> int:
    return a + b`
      },
      {
        cat: 'Languages',
        name: 'Java',
        code: `// Estrutura Básica
public class App {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}

// Java 8+ Streams
List<String> result = list.stream()
    .filter(s -> s.startsWith("A"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// Optional (Evita NullPointerException)
Optional<User> user = findUserById(1);
user.ifPresent(u -> System.out.println(u.getName()));

// Herança e Interfaces
public interface Repository<T> {
    void save(T item);
}

public class UserRepo implements Repository<User> {
    @Override
    public void save(User item) { ... }
}`
      },
      {
        cat: 'Languages',
        name: 'C#',
        code: `// LINQ (Language Integrated Query)
var query = users.Where(u => u.Active)
                 .OrderBy(u => u.Name)
                 .Select(u => u.Email);

// Propriedades Auto-Implemented
public class User {
    public string Name { get; set; }
    public int Age { get; private set; }
}

// Async / Await
public async Task<string> DownloadAsync(string url) {
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}

// Pattern Matching
if (obj is Person p) {
    Console.WriteLine(p.Name);
}

// Attributes (Anotações)
[Serializable]
public class Data { ... }`
      },
      {
        cat: 'Languages',
        name: 'C++',
        code: `// Ponteiros e Referências
int val = 10;
int* ptr = &val;   // Ponteiro (guarda endereço)
int& ref = val;   // Referência (alias para val)

// STL Containers
#include <vector>
#include <map>

std::vector<int> v = {1, 2, 3};
v.push_back(4);

std::map<string, int> m;
m["chave"] = 100;

// Classes (RAII)
class Entity {
public:
    Entity() { /* Construtor */ }
    ~Entity() { /* Destrutor - Limpeza */ }
    virtual void Move() = 0; // Pure Virtual (Interface)
};

// Namespaces
using namespace std; // Evita std:: em tudo`
      },
      {
        cat: 'Architectures',
        name: 'Local-First',
        code: `// Conceito: Software que prioriza o dado local.

// LocalStorage (Síncrono/Simples)
localStorage.setItem('config', JSON.stringify(obj));
const val = JSON.parse(localStorage.getItem('config'));

// IndexedDB (Assíncrono/Robusto)
const request = indexedDB.open('MyDatabase', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  const transaction = db.transaction(['users'], 'readwrite');
  transaction.objectStore('users').add({id: 1, name: 'Dev'});
};

// Padrão de Sincronização (CRDT)
// Usado para resolver conflitos de edição 
// simultânea sem um servidor central autoritário.

// Bibliotecas recomendadas:
// - RxDB, Automerge, Yjs` }
    ];

    return `
      <div class="search-bar" style="margin-bottom:20px">
          <input type="text" id="cheatsheet-search" placeholder="SEARCH_CHEATSHEETS (ex: git, java)...">
      </div>
      <div id="cheatsheets-container" class="cheatsheet-list">
          ${data.map(d => `
              <div class="card cheatsheet-card" data-cat="${d.cat}" data-name="${d.name}">
                  <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                      <span class="tag">[${d.cat}]</span>
                      <span style="font-size: 0.8rem; opacity: 0.5;">CTRL+C_READY</span>
                  </div>
                  <h3>${d.name}</h3>
                  <div class="terminal-box" style="background:rgba(0,0,0,0.4); padding:15px; border:1px solid var(--border-color); margin-top:10px; font-size: 0.82rem; overflow-y: auto; color: var(--text-primary);">
                      <pre style="white-space: pre-wrap; word-break: break-all;"><code>${this.escapeHTML(d.code)}</code></pre>
                  </div>
              </div>
          `).join('')}
      </div>
    `;
  },

  renderApostilas() {
    const apostilas = [
      { id: 'pa', n: 'Programação e Algoritmo', d: 'Conceitos básicos, fluxogramas e lógica de programação.', v: 'v1.2', url: '#' },
      { id: 'bd', n: 'Banco de Dados II', d: 'Modelagem avançada, SQL avançado e administração de SGBDs.', v: 'v2.0', url: '#' },
      { id: 'ds', n: 'Desenvolvimento de Sistemas', d: 'Arquitetura de software, POO e ciclos de vida de desenvolvimento.', v: 'v1.5', url: '#' },
      { id: 'web', n: 'Programação Web I', d: 'HTML5 semântico, CSS3 responsivo e JavaScript Moderno.', v: 'v1.0', url: '#' }
    ];

    return `
            <div class="module-section">
                <h2>APOSTILAS_E_MANUAIS</h2>
                <div class="search-bar" style="margin-bottom:20px">
                    <input type="text" id="apostila-search" placeholder="FILTER_MATERIALS (ex: banco de dados, web)...">
                </div>
                <div id="apostilas-list" class="quick-grid">
                    ${apostilas.map(a => `
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

  renderExtras() {
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
  },

  // --- LOGIC FUNCTIONS ---

  handleGlobalInput(e) {
    const target = e.target;
    const id = target.id;
    const val = target.value;
    const unit = target.getAttribute('data-unit');
    const section = target.getAttribute('data-section');

    // Validation patterns
    const patterns = {
      dec: /^[0-9]*$/,
      bin: /^[01]*$/,
      hex: /^[0-9A-Fa-f]*$/,
      oct: /^[0-7]*$/,
      storage: /^[0-9]*\.?[0-9]*$/,
      colorHex: /^[0-9A-Fa-f]{0,6}$/
    };

    // 1. Validation Logic
    if (section) {
      let isValid = true;
      if (section === 'bases') isValid = patterns[unit].test(val);
      if (section === 'storage') isValid = patterns.storage.test(val);
      if (section === 'colors') {
        if (unit === 'hex') isValid = patterns.colorHex.test(val);
        if (unit === 'rgb') {
          const parts = val.split(',').map(p => p.trim());
          isValid = parts.length <= 3 && parts.every(p => p === '' || (!isNaN(p) && parseInt(p) >= 0 && parseInt(p) <= 255));
        }
      }

      this.state.isValid[section] = isValid;
      this.state.lastValues[section] = val;

      // Update UI error state
      target.classList.toggle('input-error', !isValid);
      const errorMsg = target.closest('.module-section').querySelector('.error-msg');
      if (errorMsg) errorMsg.style.display = isValid ? 'none' : 'block';

      if (!isValid) return; // Stop calculation if invalid
    }

    // 2. Calculation Logic (only if valid)
    if (id === 'conv-base-input') {
      let decimal;
      if (unit === 'dec') decimal = parseInt(val, 10);
      else if (unit === 'bin') decimal = parseInt(val, 2);
      else if (unit === 'hex') decimal = parseInt(val, 16);
      else if (unit === 'oct') decimal = parseInt(val, 8);

      const targets = ['dec', 'bin', 'hex', 'oct'].filter(u => u !== unit);
      targets.forEach(u => {
        const el = document.getElementById(`res-base-${u}`);
        if (!el) return;
        if (val === '' || isNaN(decimal)) el.innerText = '-';
        else if (u === 'dec') el.innerText = decimal;
        else if (u === 'bin') el.innerText = decimal.toString(2).padStart(8, '0');
        else if (u === 'hex') el.innerText = '0x' + decimal.toString(16).toUpperCase();
        else if (u === 'oct') el.innerText = decimal.toString(8);
      });
    }

    if (id === 'conv-storage-input') {
      const v = parseFloat(val) || 0;
      let bytes = 0;
      if (unit === 'bytes') bytes = v;
      else if (unit === 'kb') bytes = v * 1024;
      else if (unit === 'mb') bytes = v * 1024 * 1024;
      else if (unit === 'gb') bytes = v * 1024 * 1024 * 1024;

      const targets = ['bytes', 'kb', 'mb', 'gb'].filter(u => u !== unit);
      targets.forEach(u => {
        const el = document.getElementById(`res-storage-${u}`);
        if (!el) return;
        if (val === '') el.innerText = '0';
        else if (u === 'bytes') el.innerText = bytes.toFixed(0);
        else if (u === 'kb') el.innerText = (bytes / 1024).toFixed(2);
        else if (u === 'mb') el.innerText = (bytes / (1024 * 1024)).toFixed(4);
        else if (u === 'gb') el.innerText = (bytes / (1024 ** 3)).toFixed(6);
      });
    }

    if (id === 'conv-color-input') {
      const preview = document.getElementById('res-color-preview');
      if (unit === 'hex' && val.length === 6) {
        const r = parseInt(val.substring(0, 2), 16);
        const g = parseInt(val.substring(2, 4), 16);
        const b = parseInt(val.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          const rgbEl = document.getElementById('res-color-rgb');
          if (rgbEl) rgbEl.innerText = `${r}, ${g}, ${b}`;
          preview.style.background = `#${val}`;
        }
      } else if (unit === 'rgb') {
        const parts = val.split(',').map(p => parseInt(p.trim()));
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
          const hex = parts.map(p => p.toString(16).padStart(2, '0')).join('').toUpperCase();
          const hexEl = document.getElementById('res-color-hex');
          if (hexEl) hexEl.innerText = hex;
          preview.style.background = `rgb(${parts.join(',')})`;
        }
      }
    }

    // Lorem Generator
    if (id === 'lorem-count') {
      const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";
      document.getElementById('lorem-output').innerText = text.repeat(parseInt(val) || 1);
    }

    // Image Placeholder Logic
    if (id === 'img-w' || id === 'img-h') {
      const w = document.getElementById('img-w').value || 300;
      const h = document.getElementById('img-h').value || 200;
      document.getElementById('img-output').innerText = `https://placehold.co/${w}x${h}`;
    }
  },

  initResourceFilters() {
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
  },

  initDiagramFilters() {
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
  },

  initCheatSheetFilters() {
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
  },

  initApostilaFilters() {
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
  },

  toggleFav(name) {
    if (this.state.favorites.includes(name)) {
      this.state.favorites = this.state.favorites.filter(f => f !== name);
    } else {
      this.state.favorites.push(name);
    }
    localStorage.setItem('edu_favorites', JSON.stringify(this.state.favorites));
    this.loadView('resources'); // Refresh view
  },

  // PWA Installation Logic
  setupPwaInstallation() {
    let deferredPrompt;
    const installBox = document.getElementById('install-prompt');
    const installBtn = document.getElementById('install-btn');

    if (!installBox || !installBtn) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBox.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User installed the PWA');
        }
        deferredPrompt = null;
        installBox.classList.add('hidden');
      }
    });

    window.addEventListener('appinstalled', (evt) => {
      console.log('EduTech Toolbox was installed.');
      installBox.classList.add('hidden');
    });
  },

  // --- SMART CACHE & UPDATE LOGIC ---
  setupUpdateMonitoring() {
    if (!('serviceWorker' in navigator)) return;

    const updateBox = document.getElementById('update-prompt');
    const rebootBtn = document.getElementById('reboot-btn');
    let newWorker;

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;

      // Check for updates periodically (every 1 hour)
      setInterval(() => reg.update(), 1000 * 60 * 60);

      reg.addEventListener('updatefound', () => {
        newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is ready but waiting
            updateBox.classList.remove('hidden');
          }
        });
      });
    });

    rebootBtn.addEventListener('click', () => {
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });

    // Handle refresh when new worker takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  },

  // --- CONNECTION MONITORING ---
  setupConnectionMonitor() {
    const dot = document.getElementById('online-dot');
    const txt = document.getElementById('online-text');

    const updateStatus = () => {
      const isOnline = navigator.onLine;
      dot.style.backgroundColor = isOnline ? 'var(--text-primary)' : '#ff1a1a';
      dot.style.boxShadow = isOnline ? '0 0 5px var(--text-primary)' : '0 0 5px #ff1a1a';
      txt.innerText = isOnline ? 'Online' : 'Offline';
      console.log(`System Status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus(); // Initial check
  },

  // Helper: Escape HTML
  escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }
};

app.init();
app.setupPwaInstallation();
app.setupUpdateMonitoring();
app.setupConnectionMonitor();
