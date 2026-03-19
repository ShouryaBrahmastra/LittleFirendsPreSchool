/* ============================================
   LittleFriends - Our Story Page JS
   Cinematic Tree Animation System
   Scroll-triggered growth, wind simulation,
   light rays, floating particles, 3D depth
   ============================================ */

const TreeController = (() => {
  const IS_MOBILE = window.innerWidth <= 768;
  const IS_SMALL = window.innerWidth <= 640;
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let treeScene = null;
  let windTimer = null;

  /* ======== Scroll-triggered Growth ======== */

  function initScrollTrigger() {
    treeScene = document.querySelector('.tree-scene');
    if (!treeScene) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          treeScene.classList.add('in-view');
          observer.unobserve(entry.target);

          // Start wind gusts after initial growth
          if (!REDUCED_MOTION) {
            setTimeout(() => startWindCycle(), 3000);
          }
        }
      });
    }, { threshold: 0.15 });

    observer.observe(treeScene);
  }

  /* ======== Enhanced Leaf Wind Physics ======== */

  function initLeafPhysics() {
    const leaves = document.querySelectorAll('.tree-scene .svg-leaf');
    leaves.forEach(leaf => {
      // Randomize each leaf's animation timing for natural feel
      const duration = 2.5 + Math.random() * 3;
      const delay = Math.random() * 2;
      leaf.style.setProperty('--leaf-duration', duration + 's');
      leaf.style.setProperty('--leaf-delay', delay + 's');
    });
  }

  /* ======== Wind Gust Cycle ======== */

  function startWindCycle() {
    if (!treeScene) return;

    function triggerGust() {
      treeScene.classList.add('wind-gust');
      setTimeout(() => {
        treeScene.classList.remove('wind-gust');
      }, 1500);

      // Next gust: random interval 6-14s
      windTimer = setTimeout(triggerGust, 6000 + Math.random() * 8000);
    }

    // First gust after a short delay
    windTimer = setTimeout(triggerGust, 2000 + Math.random() * 3000);
  }

  /* ======== Light Rays Injection ======== */

  function injectLightRays() {
    if (IS_SMALL || REDUCED_MOTION) return;

    const tree = document.querySelector('.css-tree');
    if (!tree || tree.querySelector('.tree-light-rays')) return;

    const container = document.createElement('div');
    container.className = 'tree-light-rays';

    const rays = [
      { left: '30%', angle: -8, width: 3, height: 280, opacity: 0.5, duration: 6 },
      { left: '42%', angle: -3, width: 4, height: 320, opacity: 0.6, duration: 5 },
      { left: '55%', angle: 2, width: 2.5, height: 260, opacity: 0.45, duration: 7 },
      { left: '65%', angle: 6, width: 3.5, height: 300, opacity: 0.55, duration: 5.5 },
      { left: '48%', angle: -1, width: 2, height: 240, opacity: 0.35, duration: 8 },
      { left: '72%', angle: 10, width: 2, height: 220, opacity: 0.3, duration: 6.5 },
      { left: '22%', angle: -12, width: 2, height: 200, opacity: 0.3, duration: 7.5 },
    ];

    rays.forEach((r, i) => {
      const el = document.createElement('div');
      el.className = 'light-ray';
      el.style.left = r.left;
      el.style.setProperty('--ray-angle', r.angle + 'deg');
      el.style.setProperty('--ray-width', r.width + 'px');
      el.style.setProperty('--ray-height', r.height + 'px');
      el.style.setProperty('--ray-opacity', r.opacity);
      el.style.setProperty('--ray-duration', r.duration + 's');
      el.style.setProperty('--ray-delay', (i * 0.8) + 's');
      container.appendChild(el);
    });

    tree.insertBefore(container, tree.firstChild);
  }

  /* ======== Floating Nature Particles ======== */

  function injectParticles() {
    if (IS_SMALL || REDUCED_MOTION) return;

    const scene = document.querySelector('.tree-scene');
    if (!scene || scene.querySelector('.tree-particles')) return;

    const container = document.createElement('div');
    container.className = 'tree-particles';

    const count = IS_MOBILE ? 12 : 24;
    const types = ['pollen', 'dust', 'light-speck'];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const type = types[i % types.length];
      el.className = 'tree-particle ' + type;

      // Random position within scene
      const x = 10 + Math.random() * 80;
      const y = 5 + Math.random() * 85;
      el.style.left = x + '%';
      el.style.top = y + '%';

      // Random size
      const size = type === 'light-speck' ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2.5;
      el.style.setProperty('--p-size', size + 'px');

      // Random drift direction
      const driftX = -30 + Math.random() * 60;
      const driftY = -(20 + Math.random() * 60);
      el.style.setProperty('--p-drift-x', driftX + 'px');
      el.style.setProperty('--p-drift-y', driftY + 'px');

      // Random timing
      const duration = 6 + Math.random() * 8;
      const delay = Math.random() * 10;
      el.style.setProperty('--p-duration', duration + 's');
      el.style.setProperty('--p-delay', delay + 's');

      // Random opacity
      const maxOpacity = 0.3 + Math.random() * 0.5;
      el.style.setProperty('--p-max-opacity', maxOpacity);

      // Blur for depth
      const blur = type === 'dust' ? 0.5 + Math.random() : Math.random() * 0.5;
      el.style.setProperty('--p-blur', blur + 'px');

      container.appendChild(el);
    }

    scene.appendChild(container);
  }

  /* ======== Subtle Parallax on Scroll ======== */

  function initScrollParallax() {
    if (IS_MOBILE || REDUCED_MOTION) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!treeScene) { ticking = false; return; }

          const rect = treeScene.getBoundingClientRect();
          const viewH = window.innerHeight;

          // Only compute when visible
          if (rect.bottom < 0 || rect.top > viewH) {
            ticking = false;
            return;
          }

          // Scroll progress through the tree section: 0 at top, 1 at bottom
          const progress = 1 - (rect.bottom / (viewH + rect.height));
          const clamped = Math.max(0, Math.min(1, progress));

          // Subtle camera perspective shift
          const rotateX = (clamped - 0.5) * 1.5;
          const translateZ = (clamped - 0.3) * 15;
          treeScene.style.transform =
            'perspective(1200px) rotateX(' + rotateX + 'deg) translateZ(' + translateZ + 'px)';

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======== Init ======== */

  function init() {
    initLeafPhysics();
    injectLightRays();
    injectParticles();
    initScrollTrigger();
    initScrollParallax();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  TreeController.init();
});
