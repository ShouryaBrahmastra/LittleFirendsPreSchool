/* ============================================
   LittleFriends - Navigation
   Sticky header, mobile menu, dropdown logic
   ============================================ */

const Navigation = (() => {
  let header, mobileBtn, nav, overlay, navCloseBtn;

  function init() {
    header = document.querySelector('.header');
    mobileBtn = document.querySelector('.mobile-menu-btn');
    nav = document.querySelector('.nav');
    overlay = document.querySelector('.nav-overlay');
    navCloseBtn = document.querySelector('.nav-close-btn');

    if (!header) return;

    // Scroll behavior - sticky header
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile menu
    if (mobileBtn) {
      mobileBtn.addEventListener('click', toggleMobileMenu);
    }

    if (overlay) {
      overlay.addEventListener('click', closeMobileMenu);
    }

    if (navCloseBtn) {
      navCloseBtn.addEventListener('click', closeMobileMenu);
    }

    // Mobile dropdown toggles
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.dropdown');
      if (link && dropdown) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 992) {
            e.preventDefault();
            item.classList.toggle('open');
            // Close other dropdowns
            navItems.forEach(other => {
              if (other !== item) other.classList.remove('open');
            });
          }
        });
      }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          closeMobileMenu();
          const offset = header.offsetHeight + 20;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // Close mobile menu on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        closeMobileMenu();
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('open'));
      }
    });
  }

  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }

  function toggleMobileMenu() {
    mobileBtn.classList.toggle('active');
    nav.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (mobileBtn) mobileBtn.classList.remove('active');
    if (nav) nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  return { init };
})();
