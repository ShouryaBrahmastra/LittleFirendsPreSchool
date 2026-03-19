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
      <div class="testimonial-card testimonial-card--video reveal delay-1">
        <div class="testimonial-video-frame">
          <div class="tv-brand-badge">
            <img src="assets/song/little_friends_logo.png" alt="Little Friends" class="tv-brand-logo">
          </div>
          <video class="testimonial-video" preload="metadata" playsinline>
            <source src="assets/testimonial/Sanvitha_basu.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <!-- Custom Play Button -->
          <button class="tv-play-btn" aria-label="Play video">
            <span class="tv-play-icon"></span>
            <span class="tv-play-ripple"></span>
          </button>
          <!-- Bottom Controls -->
          <div class="tv-controls">
            <div class="tv-controls-left">
              <button class="tv-ctrl-btn tv-volume-btn" aria-label="Mute">
                <span class="material-icons">volume_up</span>
              </button>
              <input type="range" class="tv-volume-slider" min="0" max="1" step="0.05" value="1">
            </div>
            <div class="tv-controls-right">
              <button class="tv-ctrl-btn tv-fs-btn" aria-label="Fullscreen">
                <span class="material-icons">fullscreen</span>
              </button>
            </div>
          </div>
        </div>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👩</div>
          <div class="testimonial-author-info">
            <h4>Mother of Sanvitha Basu</h4>
            <p>Nursery</p>
          </div>
        </div>
      </div>

      <!-- Testimonial 2 -->
      <div class="testimonial-card testimonial-card--video reveal delay-2">
        <div class="testimonial-video-frame">
          <div class="tv-brand-badge">
            <img src="assets/song/little_friends_logo.png" alt="Little Friends" class="tv-brand-logo">
          </div>
          <video class="testimonial-video" preload="metadata" playsinline>
            <source src="assets/testimonial/Jitishashukla_video.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <!-- Custom Play Button -->
          <button class="tv-play-btn" aria-label="Play video">
            <span class="tv-play-icon"></span>
            <span class="tv-play-ripple"></span>
          </button>
          <!-- Bottom Controls -->
          <div class="tv-controls">
            <div class="tv-controls-left">
              <button class="tv-ctrl-btn tv-volume-btn" aria-label="Mute">
                <span class="material-icons">volume_up</span>
              </button>
              <input type="range" class="tv-volume-slider" min="0" max="1" step="0.05" value="1">
            </div>
            <div class="tv-controls-right">
              <button class="tv-ctrl-btn tv-fs-btn" aria-label="Fullscreen">
                <span class="material-icons">fullscreen</span>
              </button>
            </div>
          </div>
        </div>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👨</div>
          <div class="testimonial-author-info">
            <h4>Father of Jitisha Shukla</h4>
            <p>Nursery</p>
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
