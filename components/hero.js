document.querySelector('[data-component="hero"]').outerHTML = `
<!-- ============== HERO SECTION ============== -->
<section class="hero parallax-section" id="home">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-lg parallax-yellow pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-md parallax-purple pd-2" data-parallax-depth="5" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-lg parallax-secondary pd-3" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-star pd-4" data-parallax-depth="4">⭐</div>
  <div class="parallax-decor parallax-blob parallax-sm parallax-pink pd-5" data-parallax-depth="4" data-parallax-dir="down"></div>

  <!-- Background -->
  <div class="hero-bg">
    <div class="hero-bg-gradient"></div>
    <div class="hero-shapes">
      <div class="hero-shape hero-shape-1"></div>
      <div class="hero-shape hero-shape-2"></div>
      <div class="hero-shape hero-shape-3"></div>
      <div class="hero-shape hero-shape-4"></div>
      <div class="hero-shape hero-shape-5"></div>
    </div>
  </div>

  <!-- Content -->
  <div class="hero-content">
    <div class="hero-text">
      <div class="hero-badge">
        <span class="material-icons">waving_hand</span>
        Welcome to Little Friends Preschool and Day Care!
      </div>
      <h1 class="hero-title">
        Where <span class="highlight">Little Minds</span><br>
        are Nurtured into future ready leaders ✨
      </h1>
      <p class="hero-subtitle">
        A nurturing preschool where every child discovers the joy of learning through play, creativity, and love. <span class="highlight-warm">Aligned to NEP &amp; International Standards.</span>
      </p>
      <div class="hero-ctas">
        <a href="#enquiry" class="btn btn-primary">
          <span class="material-icons">mail</span> Enquire Now
        </a>
        <a href="#programs" class="btn btn-outline">
          <span class="material-icons">explore</span> Explore Programs
        </a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-number" data-count="9" data-suffix="+">0</div>
          <div class="hero-stat-label">Years of Trust</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-number" data-count="4000" data-suffix="+">0</div>
          <div class="hero-stat-label">Happy Students</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-number" data-count="2" data-suffix="">0</div>
          <div class="hero-stat-label">campus</div>
        </div>
      </div>
    </div>

    <div class="hero-visual" data-parallax="0.1">
      <div class="hero-illustration">
        <div class="hero-main-image">
          <span class="hero-emoji">👶🎓</span>
        </div>
        <!-- Floating Cards -->
        <div class="hero-float-card hero-float-card-1 card-3d">
          <div class="card-icon yellow">🎨</div>
          <span>Creative Arts</span>
        </div>
        <div class="hero-float-card hero-float-card-2 card-3d">
          <div class="card-icon green">🌱</div>
          <span>Safe & Caring</span>
        </div>
        <div class="hero-float-card hero-float-card-3 card-3d">
          <div class="card-icon blue">📚</div>
          <span>Play-Based Learning</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Wave Separator -->
  <div class="hero-wave">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z" fill="var(--bg-info-strip)"/>
    </svg>
  </div>
</section>
`;
