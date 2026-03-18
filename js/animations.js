/* ============================================
   LittleFriends - Animations
   Scroll reveals, parallax, 3D card tilt
   ============================================ */

const AnimationController = (() => {
  function init() {
    initScrollReveal();
    initParallax();
    initParallaxDecor();
    init3DCards();
    initCounters();
  }

  /* Scroll Reveal with IntersectionObserver */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  /* Parallax scroll effect for [data-parallax] elements */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.pageYOffset;
          parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const yPos = (scrollY - el.offsetTop) * speed;
              el.style.transform = `translateY(${yPos}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* Multi-layer parallax decorations */
  function initParallaxDecor() {
    const decors = document.querySelectorAll('.parallax-decor[data-parallax-depth]');
    if (!decors.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Disable on mobile for performance
    if (window.innerWidth < 768) return;

    let ticking = false;
    let scrollY = window.pageYOffset;

    // Track visible sections for performance
    const sections = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sections.add(entry.target);
        } else {
          sections.delete(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    // Observe parent sections
    const parentSections = new Set();
    decors.forEach(d => {
      const section = d.closest('section, .hero, footer');
      if (section) parentSections.add(section);
    });
    parentSections.forEach(s => sectionObserver.observe(s));

    function updateParallax() {
      scrollY = window.pageYOffset;

      decors.forEach(el => {
        const section = el.closest('section, .hero, footer');
        if (section && !sections.has(section)) return;

        const depth = parseInt(el.dataset.parallaxDepth, 10) || 2;
        const speed = depth * 0.02;
        const direction = el.dataset.parallaxDir === 'down' ? 1 : -1;

        const rect = el.getBoundingClientRect();
        const sectionRect = section ? section.getBoundingClientRect() : rect;
        const centerOffset = sectionRect.top + sectionRect.height / 2 - window.innerHeight / 2;
        const yMove = centerOffset * speed * direction;
        const xMove = centerOffset * speed * 0.3 * (el.dataset.parallaxX === 'true' ? 1 : 0);

        el.style.transform = `translate3d(${xMove}px, ${yMove}px, 0)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Initial position
    updateParallax();
  }

  /* 3D tilt effect on cards */
  function init3DCards() {
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  /* Animated counters */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  return { init };
})();
