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

      <!-- Testimonial 3 – Google Review -->
      <div class="testimonial-card testimonial-card--google reveal delay-3">
        <div class="testimonial-google-badge">
          <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span class="google-badge-text">Google Reviews</span>
        </div>
        <div class="testimonial-stars">
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
          <span class="material-icons">star</span>
        </div>
        <p class="testimonial-text testimonial-text--google">
          The play school and day care is near Newtown School, a prime area in Newtown Kolkata. My child is going to this school for last 2 years. Principal and Teachers are good, support staffs are also good. Fee is affordable and very less compared to nearby other schools. School is using quality study materials. Children are being taken care of in proper way. Overall my experience is very good and I will strongly recommend this school and daycare if you are looking for your kids.
        </p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">👩</div>
          <div class="testimonial-author-info">
            <h4>Mother of Harshali</h4>
            <p>UKG</p>
          </div>
        </div>
        <a href="https://maps.app.goo.gl/GZnpbqUMxV8roi6E9" class="testimonial-google-link" target="_blank" rel="noopener noreferrer">
          Check it out here <span class="material-icons">open_in_new</span>
        </a>
      </div>
    </div>
  </div>
</section>
`;
