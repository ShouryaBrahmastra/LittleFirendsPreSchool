document.querySelector('[data-component="app-promo"]').outerHTML = `
<!-- ============== APP PROMOTION ============== -->
<section class="app-section parallax-section" id="app">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-lg parallax-purple pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-sm parallax-yellow pd-2" data-parallax-depth="5" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-xl parallax-primary pd-3" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-star pd-4" data-parallax-depth="4">📱</div>

  <div class="app-container">
    <!-- 3D Phone Assembly (Three.js) -->
    <div class="app-visual reveal-left">
      <div class="phone3d-canvas-wrap" id="phone3dWrap">
        <canvas id="phone3dCanvas"></canvas>
      </div>
    </div>

    <!-- App Info -->
    <div class="app-info reveal-right">
      <div class="app-badge">
        <span class="material-icons app-badge-icon">phone_android</span>
        Download Our App
      </div>
      <h2>
        Learning Made <span class="highlight">Fun & Easy</span><br>
        with Toondemy!
      </h2>
      <p class="app-description">
        The official Little Friends Preschool and Day Care learning app — interactive lessons, animated stories, educational games,
        and progress tracking, all in one place!
      </p>
      <div class="app-features">
        <div class="app-feature">
          <div class="app-feature-icon">
            <span class="material-icons">play_circle</span>
          </div>
          <span>Animated educational videos &amp; stories</span>
        </div>
        <div class="app-feature">
          <div class="app-feature-icon">
            <span class="material-icons">games</span>
          </div>
          <span>Interactive learning games &amp; quizzes</span>
        </div>
        <div class="app-feature">
          <div class="app-feature-icon">
            <span class="material-icons">insights</span>
          </div>
          <span>Track your child's progress daily</span>
        </div>
      </div>
      <div class="app-store-buttons">
        <a href="https://play.google.com/store/search?q=toondemy+kids+learning+app&c=apps&hl=en_IN"
           class="store-btn store-link"
           data-mobile-url="market://search?q=toondemy+kids+learning+app"
           data-web-url="https://play.google.com/store/search?q=toondemy+kids+learning+app&c=apps&hl=en_IN"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Download on Google Play Store">
          <span class="store-btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="currentColor"/></svg></span>
          <div class="store-btn-text">
            <span class="store-btn-label">GET IT ON</span>
            <span class="store-btn-name">Google Play</span>
          </div>
        </a>
        <a href="https://apps.apple.com/in/app/toondemy-kids-learning-app/id1639485659"
           class="store-btn store-link"
           data-mobile-url="itms-apps://apps.apple.com/in/app/toondemy-kids-learning-app/id1639485659"
           data-web-url="https://apps.apple.com/in/app/toondemy-kids-learning-app/id1639485659"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Download on Apple App Store">
          <span class="store-btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" fill="currentColor"/></svg></span>
          <div class="store-btn-text">
            <span class="store-btn-label">DOWNLOAD ON</span>
            <span class="store-btn-name">App Store</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>
`;
