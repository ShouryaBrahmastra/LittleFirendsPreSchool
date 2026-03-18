document.querySelector('[data-component="alumni"]').outerHTML = `
<!-- ============== ALUMNI SPEAK ============== -->
<section class="alumni-section parallax-section" id="alumni">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-md parallax-orange pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-lg parallax-green pd-2" data-parallax-depth="4" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-md parallax-secondary pd-3" data-parallax-depth="2"></div>

  <div class="section-title reveal">
    <h2>🎓 Alumni Speak</h2>
    <p>Words from the families who have been part of our journey</p>
  </div>
  <div class="alumni-container">
    <div class="alumni-carousel">
      <div class="alumni-track">
        <!-- Alumni 1 -->
        <div class="alumni-slide">
          <div class="alumni-slide-inner">
            <div class="alumni-avatar">👧</div>
            <p class="alumni-quote">
              My years at Little Friends Preschool and Day Care shaped who I am today. The teachers didn't just teach us — they inspired us to be curious, kind, and creative. I carry those values with me every day.
            </p>
            <h4 class="alumni-name">Isha Dasgupta</h4>
            <p class="alumni-relation">Alumni, Batch of 2018</p>
          </div>
        </div>
        <!-- Alumni 2 -->
        <div class="alumni-slide">
          <div class="alumni-slide-inner">
            <div class="alumni-avatar">👦</div>
            <p class="alumni-quote">
              My son's foundation at Little Friends Preschool and Day Care was exceptional. The play-based learning approach gave him a love for education that continues to this day. We're forever grateful.
            </p>
            <h4 class="alumni-name">Sanjay Chatterjee</h4>
            <p class="alumni-relation">Parent, Alumni Batch 2016</p>
          </div>
        </div>
        <!-- Alumni 3 -->
        <div class="alumni-slide">
          <div class="alumni-slide-inner">
            <div class="alumni-avatar">👩</div>
            <p class="alumni-quote">
              Little Friends Preschool and Day Care didn't just prepare my daughter for school — it prepared her for life. The social skills, confidence, and creativity she developed here were truly remarkable.
            </p>
            <h4 class="alumni-name">Meera Sen</h4>
            <p class="alumni-relation">Parent, Alumni Batch 2019</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Navigation -->
    <div class="alumni-nav">
      <button class="alumni-nav-btn alumni-prev" aria-label="Previous alumni">
        <span class="material-icons">chevron_left</span>
      </button>
      <button class="alumni-nav-btn alumni-next" aria-label="Next alumni">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
    <div class="alumni-dots">
      <button class="alumni-dot active" aria-label="Alumni slide 1"></button>
      <button class="alumni-dot" aria-label="Alumni slide 2"></button>
      <button class="alumni-dot" aria-label="Alumni slide 3"></button>
    </div>
  </div>
</section>
`;
