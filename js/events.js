/* ============================================
   LittleFriends — Events Page
   Session tabs, curtain animation, carousel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Session Tab Switching ----
  const tabs = document.querySelectorAll('.session-tab');
  const panels = document.querySelectorAll('.session-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const session = tab.dataset.session;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show matching panel
      panels.forEach(p => {
        p.classList.remove('active');
        if (p.dataset.panel === session) {
          p.classList.add('active');
          // Open curtains and init carousels for the newly visible panel
          initPanelCarousels(p);
        }
      });
    });
  });

  // Init carousels on the default active panel
  const activePanel = document.querySelector('.session-panel.active');
  if (activePanel) {
    initPanelCarousels(activePanel);
  }


  // ---- Panel Carousel Initialization ----
  function initPanelCarousels(panel) {
    const screens = panel.querySelectorAll('.cinema-screen');

    screens.forEach(screen => {
      // Open curtains with a slight delay
      setTimeout(() => {
        screen.classList.add('curtains-open');
      }, 400);

      // Setup carousel controls
      const slides = screen.querySelectorAll('.screen-slide');
      const dots = screen.querySelectorAll('.screen-dot');
      const prevBtn = screen.querySelector('.screen-prev');
      const nextBtn = screen.querySelector('.screen-next');

      if (slides.length <= 1) return;

      let current = 0;
      let autoTimer = null;

      function goTo(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
      }

      function next() {
        goTo(current + 1);
      }

      function prev() {
        goTo(current - 1);
      }

      function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, 5000);
      }

      function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => { prev(); startAuto(); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => { next(); startAuto(); });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
      });

      // Auto-play after curtains open
      setTimeout(() => startAuto(), 1800);
    });
  }


  // ---- FAQ Accordion (footer) ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    }
  });

  // ---- Back to Top ----
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
