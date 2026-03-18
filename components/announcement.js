document.querySelector('[data-component="announcement"]').outerHTML = `
<!-- ============== ANNOUNCEMENT STRIP ============== -->
<section class="announcement-strip" aria-label="Announcements">
  <div class="announcement-inner">
    <span class="material-icons announcement-megaphone">campaign</span>
    <div class="announcement-ticker">
      <div class="announcement-track">
        <div class="announcement-item">
          <span class="announcement-emoji">🏅</span>
          <span>1st school in Newtown to introduce Preschool Olympiad!</span>
        </div>
        <div class="announcement-item">
          <span class="announcement-emoji">👩‍🏫</span>
          <span>Teacher : Student ratio is 1:8</span>
        </div>
        <div class="announcement-item">
          <span class="announcement-emoji">🌟</span>
          <span>NEP 2020 aligned holistic curriculum</span>
        </div>
        <div class="announcement-item">
          <span class="announcement-emoji">🛡️</span>
          <span>CCTV monitored, fully air-conditioned campus</span>
        </div>
        <!-- Duplicate first item for seamless loop -->
        <div class="announcement-item">
          <span class="announcement-emoji">🏅</span>
          <span>1st school in Newtown to introduce Preschool Olympiad!</span>
        </div>
      </div>
    </div>
  </div>
</section>
`;
