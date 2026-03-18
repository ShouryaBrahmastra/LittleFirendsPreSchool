document.querySelector('[data-component="carousel"]').outerHTML = `
<!-- ============== CAROUSEL SECTION ============== -->
<section class="carousel-section" id="carousel">
  <div class="section-title reveal">
    <h2>🎉 Events & Gallery</h2>
    <p>Capturing the beautiful moments of learning and celebration at Little Friends Preschool and Day Care</p>
  </div>
  <div class="carousel-container">
    <div class="carousel">
      <div class="carousel-track">
        <!-- Slide 1 -->
        <div class="carousel-slide">
          <div class="carousel-slide-bg">
            <img src="assets/home/AnnualDay_Collage.png" alt="Annual Day Celebrations" class="carousel-slide-img">
          </div>
          <div class="carousel-slide-content">
            <h3>Annual Day Celebrations</h3>
            <p>A spectacular showcase of our little stars' talents and achievements</p>
          </div>
        </div>
        <!-- Slide 2 -->
        <div class="carousel-slide">
          <div class="carousel-slide-bg">
            <img src="assets/home/artfestival.png" alt="Creative Arts Festival" class="carousel-slide-img">
          </div>
          <div class="carousel-slide-content">
            <h3>Creative Arts Festival</h3>
            <p>Where imagination meets expression — painting, craft, and more!</p>
          </div>
        </div>
        <!-- Slide 3 -->
        <div class="carousel-slide">
          <div class="carousel-slide-bg">
            <img src="assets/home/sportsoly.png" alt="Sports & Olympiad Day" class="carousel-slide-img">
          </div>
          <div class="carousel-slide-content">
            <h3>Sports & Olympiad Day</h3>
            <p>Encouraging fitness and teamwork through fun sports activities</p>
          </div>
        </div>
        <!-- Slide 4 -->
        <div class="carousel-slide">
          <div class="carousel-slide-bg">
            <img src="assets/home/culturaldiversity.png" alt="Cultural Diversity" class="carousel-slide-img">
          </div>
          <div class="carousel-slide-content">
            <h3>Cultural Diversity</h3>
            <p>Celebrating unity in diversity with music, dance, and stories</p>
          </div>
        </div>
      </div>
      <!-- Controls -->
      <button class="carousel-btn carousel-btn-prev" aria-label="Previous slide">
        <span class="material-icons">chevron_left</span>
      </button>
      <button class="carousel-btn carousel-btn-next" aria-label="Next slide">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
    <!-- Dots -->
    <div class="carousel-dots">
      <button class="carousel-dot active" aria-label="Go to slide 1"></button>
      <button class="carousel-dot" aria-label="Go to slide 2"></button>
      <button class="carousel-dot" aria-label="Go to slide 3"></button>
      <button class="carousel-dot" aria-label="Go to slide 4"></button>
    </div>
  </div>
</section>
`;
