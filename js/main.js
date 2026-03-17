/* ============================================
   LittleFriends - Main Application
   Initialization, form handling, FAQ toggle
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  ThemeManager.init();
  Navigation.init();
  CarouselController.initMain();
  CarouselController.initAlumni();
  AnimationController.init();

  // FAQ Accordion
  initFAQ();

  // Contact Form
  initContactForm();

  // Back to Top
  initBackToTop();

  // Store links (open in app on mobile, web on desktop)
  initStoreLinks();
});

/* FAQ Accordion */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(other => other.classList.remove('active'));
        // Toggle current
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

/* Contact Form */
function initContactForm() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  // Initialise EmailJS
  EmailService.init();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#form-name');
    const phone = form.querySelector('#form-phone');
    const email = form.querySelector('#form-email');
    const message = form.querySelector('#form-message');

    // Basic validation
    let valid = true;

    [name, phone, email, message].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'var(--primary)';
        valid = false;
      } else {
        field.style.borderColor = 'var(--border-color)';
      }
    });

    // Email pattern check
    if (email && email.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        email.style.borderColor = 'var(--primary)';
        valid = false;
      }
    }

    // Phone pattern check
    if (phone && phone.value.trim()) {
      const phonePattern = /^[0-9+\-\s()]{7,15}$/;
      if (!phonePattern.test(phone.value.trim())) {
        phone.style.borderColor = 'var(--primary)';
        valid = false;
      }
    }

    if (!valid) return;

    // Disable button while sending
    const submitBtn = form.querySelector('.form-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-icons">hourglass_top</span> Sending...';
    }

    // Send emails via EmailJS
    EmailService.sendEnquiry({
      name:    name.value,
      phone:   phone.value,
      email:   email.value,
      message: message.value,
    })
    .then(() => {
      // Show success message
      form.style.display = 'none';
      const success = document.querySelector('.form-success');
      if (success) success.classList.add('active');

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        form.style.display = '';
        if (success) success.classList.remove('active');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="material-icons">send</span> Send Enquiry';
        }
      }, 5000);
    })
    .catch(() => {
      alert('Something went wrong. Please try again or contact us at +91 89020 98125.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-icons">send</span> Send Enquiry';
      }
    });
  });
}

/* Back to Top */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Store Links - open in app on mobile, web on desktop */
function initStoreLinks() {
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  document.querySelectorAll('.store-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (isMobile && link.dataset.mobileUrl) {
        e.preventDefault();
        var webUrl = link.dataset.webUrl;
        // Try opening native app URI; fall back to web URL after timeout
        var fallback = setTimeout(function () {
          window.location.href = webUrl;
        }, 1500);
        window.location.href = link.dataset.mobileUrl;
        // If app opens, cancel fallback
        window.addEventListener('blur', function onBlur() {
          clearTimeout(fallback);
          window.removeEventListener('blur', onBlur);
        });
      }
      // On desktop, default behavior (target="_blank" web URL) works fine
    });
  });
}
