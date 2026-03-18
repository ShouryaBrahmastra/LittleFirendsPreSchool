document.querySelector('[data-component="info-strip"]').outerHTML = `
<!-- ============== INFO STRIP ============== -->
<section class="info-strip" id="info">
  <div class="info-strip-shimmer"></div>
  <div class="info-strip-inner">
    <div class="info-strip-time">
      <span class="material-icons info-strip-icon-glow">schedule</span>
      <span class="info-strip-time-text">Time: 8:30 AM to 8 PM</span>
    </div>
    <div class="info-strip-divider"></div>
    <div class="info-strip-slider">
      <div class="info-strip-slider-track">
        <div class="info-strip-slider-item">
          <span class="material-icons info-strip-icon-glow">verified</span>
          <span class="nep-badge">NEP</span>
          Aligned to NEP and International Standard of Education
        </div>
        <div class="info-strip-slider-item">
          <span class="material-icons info-strip-icon-glow">star</span>
          Award-winning curriculum for holistic child development
        </div>
        <div class="info-strip-slider-item">
          <span class="material-icons info-strip-icon-glow">groups</span>
          Teacher : Student ratio is 1:8 for personalized attention
        </div>
        <div class="info-strip-slider-item">
          <span class="material-icons info-strip-icon-glow">security</span>
          CCTV monitored, fully air-conditioned safe campus
        </div>
      </div>
    </div>
  </div>
</section>
`;
