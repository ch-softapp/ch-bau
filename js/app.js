/**
 * Hoher Elektrosammlung - Haupt-App v2.3
 * PWA mit Offline-Support
 */

// Service Worker registrieren
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker registriert:', reg.scope);
        
        // Update verfügbar?
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
      })
      .catch(err => console.error('SW Registrierung fehlgeschlagen:', err));
  });
}

// Offline-Status anzeigen
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const indicator = document.getElementById('offline-badge');
  if (indicator) {
    if (!navigator.onLine) {
      indicator.style.display = 'inline-block';
    } else {
      indicator.style.display = 'none';
    }
  }
}

// Update-Benachrichtigung
function showUpdateNotification() {
  if (confirm('Eine neue Version ist verfügbar. Jetzt aktualisieren?')) {
    window.location.reload();
  }
}

// Tab-Navigation innerhalb einer Seite
function showTab(tabId) {
  const container = event.target.closest('.tab-container') || document.getElementById('content');
  
  // Alle Contents ausblenden (beide Klassen unterstützen)
  container.querySelectorAll('.content, .tab-content').forEach(c => c.classList.remove('active'));
  container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  // Gewählten Tab aktivieren
  const content = document.getElementById(tabId);
  if (content) {
    content.classList.add('active');
  }
  event.target.classList.add('active');
}

// Alternative Tab-Funktion für tab-content Elemente
function switchTab(button, tabId) {
  const container = button.closest('.tab-container') || document;
  
  // Alle Tabs deaktivieren (beide Klassen unterstützen)
  container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  container.querySelectorAll('.content, .tab-content').forEach(c => c.classList.remove('active'));
  
  // Gewählten aktivieren
  button.classList.add('active');
  const content = document.getElementById(tabId);
  if (content) {
    content.classList.add('active');
  }
}

// Seiten-Navigation
let currentPage = 'home';

function loadPage(pageName) {
  // Navigation-Buttons aktualisieren
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageName) {
      btn.classList.add('active');
    }
  });
  
  if (pageName === 'home') {
    // Startseite anzeigen
    document.getElementById('content').innerHTML = `
      <div class="welcome">
        <h2>Willkommen!</h2>
        <p>Wähle einen Bereich aus der Navigation.</p>
        <div class="feature-grid">
          <div class="feature-card" onclick="loadPage('berechnungen')">
            <span class="feature-icon">🔢</span>
            <span>Berechnungen</span>
          </div>
          <div class="feature-card" onclick="loadPage('erweitert')">
            <span class="feature-icon">📐</span>
            <span>Erweiterte Berechn.</span>
          </div>
          <div class="feature-card" onclick="loadPage('praxis')">
            <span class="feature-icon">🔌</span>
            <span>Praxis</span>
          </div>
          <div class="feature-card" onclick="loadPage('sicherungen')">
            <span class="feature-icon">🛡️</span>
            <span>Sicherungen</span>
          </div>
          <div class="feature-card" onclick="loadPage('wissen')">
            <span class="feature-icon">📚</span>
            <span>Normen</span>
          </div>
          <div class="feature-card" onclick="loadPage('fehlersuche')">
            <span class="feature-icon">🔧</span>
            <span>Fehlersuche</span>
          </div>
          <div class="feature-card" onclick="loadPage('lernen')">
            <span class="feature-icon">🎓</span>
            <span>Quiz</span>
          </div>
        </div>
      </div>
    `;
    currentPage = 'home';
    return;
  }
  
  // Seite per fetch laden
  fetch(`./pages/${pageName}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Seite nicht gefunden');
      return response.text();
    })
    .then(html => {
      document.getElementById('content').innerHTML = html;
      currentPage = pageName;
      
      // Nach dem Laden: Felder initialisieren falls Berechnungsseite
      if (pageName === 'berechnungen') {
        if (typeof updateOhmFields === 'function') updateOhmFields();
        if (typeof updateLeistungFields === 'function') updateLeistungFields();
      }
      if (pageName === 'erweitert') {
        if (typeof updateTrafoFields === 'function') updateTrafoFields();
      }
      if (pageName === 'lernen') {
        if (typeof initQuiz === 'function') initQuiz();
      }
      
      // Scroll nach oben
      window.scrollTo(0, 0);
    })
    .catch(err => {
      console.error('Fehler beim Laden:', err);
      document.getElementById('content').innerHTML = `
        <div class="error-box">
          <h2>⚠️ Fehler</h2>
          <p>Seite konnte nicht geladen werden.</p>
          <button class="btn" onclick="loadPage('home')">Zur Startseite</button>
        </div>
      `;
    });
}

// Troubleshoot Toggle
function toggleTroubleshoot(card) {
  const solutions = card.querySelector('.troubleshoot-solutions');
  const wasVisible = solutions.classList.contains('visible');
  
  // Alle schließen
  document.querySelectorAll('.troubleshoot-solutions').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('.troubleshoot-card').forEach(c => c.classList.remove('expanded'));
  
  // Gewählte öffnen (wenn nicht schon offen)
  if (!wasVisible) {
    solutions.classList.add('visible');
    card.classList.add('expanded');
  }
}

// Formatierung Hilfsfunktionen
function formatNumber(num, decimals = 2) {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatWithUnit(value, unit, decimals = 2) {
  return `${formatNumber(value, decimals)} ${unit}`;
}

// Validierung
function validateNumber(value, min = null, max = null) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

function showError(message) {
  alert(message);
}

// Speichern/Laden von Einstellungen (localStorage)
function saveSettings(key, value) {
  try {
    localStorage.setItem(`elektropro_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage nicht verfügbar');
  }
}

function loadSettings(key, defaultValue = null) {
  try {
    const stored = localStorage.getItem(`elektropro_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Aktuelles Gewerk
let currentGewerk = localStorage.getItem('gewerk') || 'elektro';

// Gewerk wechseln
function changeGewerk(gewerk) {
  currentGewerk = gewerk;
  localStorage.setItem('gewerk', gewerk);
  
  // Body-Klasse ändern für CSS
  document.body.className = 'gewerk-' + gewerk;
  
  // Zur Gewerk-spezifischen Seite navigieren
  window.location.href = gewerk + '.html';
}

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => {
  // Offline-Status prüfen
  updateOnlineStatus();
  
  // Gewerk aus localStorage laden
  const savedGewerk = localStorage.getItem('gewerk') || 'elektro';
  document.body.className = 'gewerk-' + savedGewerk;
  
  const gewerkSelect = document.getElementById('gewerk-select');
  if (gewerkSelect) {
    gewerkSelect.value = savedGewerk;
  }
  
  console.log('ch-Bau v2.5 geladen - ' + savedGewerk.toUpperCase());
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showTab, switchTab, loadPage, toggleTroubleshoot, formatNumber, validateNumber, changeGewerk };
}
