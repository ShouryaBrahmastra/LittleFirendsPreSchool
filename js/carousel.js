/* ============================================
   LittleFriends - Carousel Controller
   Auto-sliding carousel and alumni carousel
   ============================================ */

const CarouselController = (() => {
  function initMain() {
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');

    if (!track) return;

    let current = 0;
    const totalSlides = track.children.length;
    let autoPlayInterval;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      current = index;
      track.style.transform = `translateX(-${current * 25}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(() => goToSlide(current + 1), 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); goToSlide(current - 1); startAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); goToSlide(current + 1); startAutoPlay(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAutoPlay(); goToSlide(i); startAutoPlay(); });
    });

    // Touch support
    let touchStartX = 0;
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAutoPlay(); }, { passive: true });
      carousel.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          goToSlide(diff > 0 ? current + 1 : current - 1);
        }
        startAutoPlay();
      }, { passive: true });
    }

    goToSlide(0);
    startAutoPlay();
  }

  function initAlumni() {
    const track = document.querySelector('.alumni-track');
    const dots = document.querySelectorAll('.alumni-dot');
    const prevBtn = document.querySelector('.alumni-prev');
    const nextBtn = document.querySelector('.alumni-next');

    if (!track) return;

    let current = 0;
    const totalSlides = track.children.length;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    // Auto play alumni carousel
    setInterval(() => goToSlide(current + 1), 6000);

    goToSlide(0);
  }

  return { initMain, initAlumni };
})();
