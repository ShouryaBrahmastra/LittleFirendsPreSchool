/* ============================================
   LittleFriends - Theme Toggle
   Dark/Light mode management
   ============================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'littlefriends-theme';

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved || 'light';
    applyTheme(theme);

    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
      toggleBtn.setAttribute('role', 'switch');
      toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
      updateAriaState(toggleBtn, theme);
    }


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
