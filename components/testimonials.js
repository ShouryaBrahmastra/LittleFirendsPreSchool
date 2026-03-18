document.querySelector('[data-component="testimonials"]').outerHTML = `
<!-- ============== TESTIMONIALS ============== -->
<section class="testimonials-section parallax-section" id="testimonials">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-lg parallax-pink pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-md parallax-blue pd-2" data-parallax-depth="5"></div>
  <div class="parallax-decor parallax-ring parallax-lg parallax-yellow pd-3" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-star pd-4" data-parallax-depth="4" data-parallax-x="true">💛</div>

  <div class="section-title reveal">
    <h2>💬 What Parents Say</h2>
    <p>Hear from the families who've experienced the Little Friends difference</p>
  </div>
  <div class="testimonials-container">
    <div class="testimonials-grid">
      <!-- Testimonial 1 -->
      <div class="testimonial-card reveal delay-1">
        <div class="testimonial-quote-icon">&ldquo;</div>
        <div class="testimonial-stars">
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
        </div>
        <p class="testimonial-text">
          Little Friends Preschool and Day Care has been a second home for my daughter. The teachers are incredibly warm and the curriculum is so well-designed. She comes home excited every day!
        </p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👩</div>
          <div class="testimonial-author-info">
            <h4>Priya Mukherjee</h4>
            <p>Parent of Aadhira, Nursery</p>
          </div>
        </div>
      </div>

      <!-- Testimonial 2 -->
      <div class="testimonial-card reveal delay-2">
        <div class="testimonial-quote-icon">&ldquo;</div>
        <div class="testimonial-stars">
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
        </div>
        <p class="testimonial-text">
          The 1:8 teacher-student ratio truly makes a difference. My son gets individual attention and has grown so much in confidence and social skills since joining Little Friends Preschool and Day Care.
        </p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👨</div>
          <div class="testimonial-author-info">
            <h4>Rajesh Banerjee</h4>
            <p>Parent of Aryan, LKG</p>
          </div>
        </div>
      </div>

      <!-- Testimonial 3 -->
      <div class="testimonial-card reveal delay-3">
        <div class="testimonial-quote-icon">&ldquo;</div>
        <div class="testimonial-stars">
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
        </div>
        <p class="testimonial-text">
          We love the extra-curricular activities — Karate, Abacus, and Art classes. The holistic approach to learning sets Little Friends Preschool and Day Care apart from every other preschool.
        </p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👩</div>
          <div class="testimonial-author-info">
            <h4>Sneha Roy</h4>
            <p>Parent of Mishka, UKG</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;
