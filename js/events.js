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
      // Inject cinematic elements if not already present
      injectCinematicElements(screen);

      // Reset curtains for re-opening animation
      screen.classList.remove('curtains-open');

      // Trigger camera push-in on parent wrapper
      const wrapper = screen.closest('.cinema-wrapper');
      if (wrapper) {
        wrapper.classList.remove('cinema-reveal');
        wrapper.classList.remove('projector-on');
        wrapper.querySelectorAll('.projector-spool').forEach(s => s.classList.remove('spinning'));
        // Force reflow to restart animation
        void wrapper.offsetWidth;
      }

      // Dramatic reveal sequence
      setTimeout(() => {
        if (wrapper) {
          wrapper.classList.add('cinema-reveal');
          // Power on the projector — spools start spinning
          wrapper.classList.add('projector-on');
          wrapper.querySelectorAll('.projector-spool').forEach(s => s.classList.add('spinning'));
        }
        screen.classList.add('curtains-open');
      }, 600);

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

      // Auto-play after curtains fully open
      setTimeout(() => startAuto(), 3500);
    });
  }


  // ---- Inject Cinematic Elements into Cinema Screens & Wrappers ----
  function injectCinematicElements(screen) {
    // Only inject once
    if (screen.querySelector('.cinema-light-rays')) return;

    const wrapper = screen.closest('.cinema-wrapper');

    // ── Light Rays ──
    const raysContainer = document.createElement('div');
    raysContainer.className = 'cinema-light-rays';
    for (let i = 0; i < 5; i++) {
      const ray = document.createElement('div');
      ray.className = 'light-ray';
      raysContainer.appendChild(ray);
    }
    screen.appendChild(raysContainer);

    // ── Dust Particles ──
    const dustContainer = document.createElement('div');
    dustContainer.className = 'cinema-dust';
    for (let i = 0; i < 18; i++) {
      const mote = document.createElement('div');
      mote.className = 'dust-mote';
      const size = 2 + Math.random() * 4;
      mote.style.cssText = `
        left: ${10 + Math.random() * 80}%;
        top: ${10 + Math.random() * 80}%;
        --dust-size: ${size}px;
        --dust-duration: ${5 + Math.random() * 8}s;
        --dust-delay: ${Math.random() * 6}s;
        --dust-dx: ${-30 + Math.random() * 60}px;
        --dust-dy: ${-40 - Math.random() * 20}px;
        --dust-dx2: ${-20 + Math.random() * 40}px;
        --dust-dy2: ${-60 - Math.random() * 20}px;
        --dust-opacity: ${0.3 + Math.random() * 0.5};
      `;
      dustContainer.appendChild(mote);
    }
    screen.appendChild(dustContainer);

    // ── Film Grain Overlay ──
    const grain = document.createElement('div');
    grain.className = 'film-grain-overlay';
    screen.appendChild(grain);

    // ── Analog Flicker ──
    const flicker = document.createElement('div');
    flicker.className = 'film-flicker';
    screen.appendChild(flicker);

    // ── Projector Housing (top of wrapper) ──
    if (wrapper && !wrapper.querySelector('.projector-housing')) {
      const housing = document.createElement('div');
      housing.className = 'projector-housing';
      housing.innerHTML = `
        <div class="projector-body">
          <div class="projector-vents">
            <div class="projector-vent"></div>
            <div class="projector-vent"></div>
            <div class="projector-vent"></div>
          </div>
        </div>
      `;
      wrapper.appendChild(housing);

      // ── Projector Beam ──
      const beam = document.createElement('div');
      beam.className = 'projector-beam';
      const beamCone = document.createElement('div');
      beamCone.className = 'beam-cone';
      beam.appendChild(beamCone);

      const beamDust = document.createElement('div');
      beamDust.className = 'beam-dust';
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'beam-particle';
        const sz = 1 + Math.random() * 3;
        p.style.cssText = `
          left: ${35 + Math.random() * 30}%;
          top: ${Math.random() * 40}%;
          --bp-size: ${sz}px;
          --bp-dur: ${4 + Math.random() * 6}s;
          --bp-delay: ${Math.random() * 5}s;
          --bp-dx: ${-15 + Math.random() * 30}px;
          --bp-dy: ${-20 - Math.random() * 30}px;
          --bp-dx2: ${-10 + Math.random() * 20}px;
          --bp-dy2: ${-40 - Math.random() * 20}px;
          --bp-opacity: ${0.2 + Math.random() * 0.5};
        `;
        beamDust.appendChild(p);
      }
      beam.appendChild(beamDust);
      wrapper.appendChild(beam);

      // ── Left Spool (supply reel) ──
      injectSpool(wrapper, 'mech-left');
      // ── Right Spool (take-up reel) ──
      injectSpool(wrapper, 'mech-right');
    }
  }


  // ---- Create a 3D Projector Spool ----
  function injectSpool(wrapper, side) {
    const mech = document.createElement('div');
    mech.className = `projector-mechanism ${side}`;

    const spool = document.createElement('div');
    spool.className = 'projector-spool';

    // Spool disc (brushed metal)
    const disc = document.createElement('div');
    disc.className = 'spool-disc';
    spool.appendChild(disc);

    // Film wound on spool
    const film = document.createElement('div');
    film.className = 'spool-film';
    spool.appendChild(film);

    // 6 spokes
    for (let i = 0; i < 6; i++) {
      const spoke = document.createElement('div');
      spoke.className = 'spool-spoke';
      spool.appendChild(spoke);
    }

    mech.appendChild(spool);
    wrapper.appendChild(mech);
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
