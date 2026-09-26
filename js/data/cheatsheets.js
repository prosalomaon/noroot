const CHEATSHEETS = [
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
int& ref = val;    // Referência (alias para val)

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
