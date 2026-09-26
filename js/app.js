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

  views: {},

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
    const view = this.views[viewId];

    const content = view
      ? view.render()
      : `<div>Error: View [${viewId}] not found.</div>`;

    container.innerHTML = `<div id="${viewId}-view" class="view active">${content}</div>`;

    if (view && view.init) view.init();

    if (viewId === 'diagrams' && window.mermaid) {
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
