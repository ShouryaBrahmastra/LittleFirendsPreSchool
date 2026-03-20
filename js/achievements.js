/* ============================================
   LittleFriends - Achievements Page JS
   Carousel, animated counters, confetti
   ============================================ */

const AchievementsController = (() => {

  /* ======== Carousel ======== */
  function initCarousel() {
    const track = document.getElementById('ach-carousel-track');
    const dotsContainer = document.getElementById('ach-carousel-dots');
    const prevBtn = document.querySelector('.ach-carousel-btn.prev');
    const nextBtn = document.querySelector('.ach-carousel-btn.next');
    if (!track) return;

    const slides = track.querySelectorAll('.ach-carousel-slide');
    const total = slides.length;
    let current = 0;
    let autoTimer = null;

    // Create dots
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'ach-carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      updateDots();
      resetAuto();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.ach-carousel-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    }, { passive: true });

    // Start auto-play
    resetAuto();
  }


  /* ======== Animated Counters ======== */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
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
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }


  /* ======== Confetti Generator ======== */
  function initConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
      '#F472B6', '#6BCB77', '#45B7D1', '#FFA07A'
    ];

    // Observe carousel section — start confetti when visible
    const section = container.closest('.carousel-section');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          spawnConfettiBurst(container, colors);
          // Ongoing slow drizzle
          setInterval(() => spawnConfetti(container, colors, 3), 2000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  }

  function spawnConfettiBurst(container, colors) {
    spawnConfetti(container, colors, 30);
  }

  function spawnConfetti(container, colors, count) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '-10px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (3 + Math.random() * 3) + 's';
      piece.style.animationDelay = (Math.random() * 1.5) + 's';
      piece.style.width = (5 + Math.random() * 8) + 'px';
      piece.style.height = (5 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);

      // Clean up after animation
      setTimeout(() => { piece.remove(); }, 7000);
    }
  }


  /* ======== 3D Card Tilt on Hover ======== */
  function initCardTilt() {
    const cards = document.querySelectorAll('.gold-star-card');
    if (!cards.length) return;
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const tiltX = -y * 15; // degrees
        const tiltY = x * 15;
        card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ======== Init ======== */
  function init() {
    initCarousel();
    initCounters();
    initConfetti();
    initCardTilt();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  AchievementsController.init();
});
