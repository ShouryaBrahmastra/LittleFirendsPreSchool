/* ============================================
   LittleFriends - Activities Page JS
   Section nav dots, video play, art slider drag
   ============================================ */

(() => {
  'use strict';

  /* ── Section Nav Dots ── */
  const dots = document.querySelectorAll('.act-nav-dot');
  const sections = [...dots].map(d => document.getElementById(d.dataset.target));

  // click to scroll
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const sec = document.getElementById(dot.dataset.target);
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // highlight on scroll
  const dotObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('active'));
        const match = [...dots].find(d => d.dataset.target === entry.target.id);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => { if (sec) dotObserver.observe(sec); });


  /* ── Video Play Overlays ── */
  document.querySelectorAll('.act-video-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      const vid = document.getElementById(overlay.dataset.video);
      if (vid && vid.src) {
        vid.play();
        overlay.style.display = 'none';
      }
    });
  });


  /* ── Nunchaku — now handled by nunchaku3d.js (Three.js) ── */


  /* ── Art Brush Slider – CSS handles the infinite marquee ── */


  /* ── Abacus — now handled by abacus3d.js (Three.js) ── */


  /* ── Colour Palette Dot Splash ── */
  document.querySelectorAll('.art-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const canvas = dot.closest('.art-canvas');
      if (!canvas) return;
      // change border colour of canvas to the dot colour
      canvas.style.borderColor = dot.style.background || dot.style.backgroundColor;
      // ripple on dot
      dot.style.transform = 'scale(1.5) translateY(-6px)';
      setTimeout(() => { dot.style.transform = ''; }, 350);
    });
  });


  /* ── Rubik's Cube — now handled by rubik3d.js (Three.js) ── */

})();
