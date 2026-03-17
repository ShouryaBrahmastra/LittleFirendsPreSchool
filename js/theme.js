/* ============================================
   LittleFriends - Theme Toggle
   Dark/Light mode management
   ============================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'littlefriends-theme';

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
      toggleBtn.setAttribute('role', 'switch');
      toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
      updateAriaState(toggleBtn, theme);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    updateAriaState(document.querySelector('.theme-toggle-btn'), next);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function updateAriaState(btn, theme) {
    if (btn) {
      btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    }
  }

  return { init };
})();
