document.querySelector('[data-component="programs"]').outerHTML = `
<!-- ============== PROGRAMS SECTION ============== -->
<section class="programs-section parallax-section" id="programs">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-lg parallax-secondary pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-sm parallax-yellow pd-2" data-parallax-depth="5" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-xl parallax-primary pd-3" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-blob parallax-md parallax-purple pd-4" data-parallax-depth="4" data-parallax-dir="down"></div>
  <div class="parallax-decor parallax-star pd-5" data-parallax-depth="4">✏️</div>

  <div class="section-title reveal">
    <h2>📚 Our Programs</h2>
    <p>Age-appropriate programs designed to ignite curiosity and build strong foundations</p>
  </div>

  <!-- Main Programs -->
  <div class="programs-grid">
    <!-- Playgroup -->
    <div class="program-card card-3d reveal delay-1">
      <div class="program-card-image">
        <span class="program-emoji">🧸</span>
        <span class="program-age-badge">2–3 Years</span>
      </div>
      <div class="program-card-body">
        <h3>Playgroup</h3>
        <p>A gentle introduction to school life through sensory play, music, movement, and social interaction in a warm, nurturing setting.</p>
      </div>
      <div class="program-card-footer">
        <a href="#enquiry" class="program-learn-more">Learn More <span class="material-icons">arrow_forward</span></a>
      </div>
    </div>

    <!-- Nursery -->
    <div class="program-card card-3d reveal delay-2">
      <div class="program-card-image">
        <span class="program-emoji">🎨</span>
        <span class="program-age-badge">3–4 Years</span>
      </div>
      <div class="program-card-body">
        <h3>Nursery</h3>
        <p>Building language, cognitive, and motor skills through structured play, storytelling, art, and early numeracy in a fun environment.</p>
      </div>
      <div class="program-card-footer">
        <a href="#enquiry" class="program-learn-more">Learn More <span class="material-icons">arrow_forward</span></a>
      </div>
    </div>

    <!-- LKG -->
    <div class="program-card card-3d reveal delay-3">
      <div class="program-card-image">
        <span class="program-emoji">📖</span>
        <span class="program-age-badge">4–5 Years</span>
      </div>
      <div class="program-card-body">
        <h3>LKG (Lower Kindergarten)</h3>
        <p>Fostering reading readiness, critical thinking, and creativity with phonics, math concepts, science explorations, and collaborative projects.</p>
      </div>
      <div class="program-card-footer">
        <a href="#enquiry" class="program-learn-more">Learn More <span class="material-icons">arrow_forward</span></a>
      </div>
    </div>

    <!-- UKG -->
    <div class="program-card card-3d reveal delay-4">
      <div class="program-card-image">
        <span class="program-emoji">🎓</span>
        <span class="program-age-badge">5–6 Years</span>
      </div>
      <div class="program-card-body">
        <h3>UKG (Upper Kindergarten)</h3>
        <p>School-readiness program with advanced literacy, numeracy, environmental awareness, and life skills to ensure a smooth transition to grade 1.</p>
      </div>
      <div class="program-card-footer">
        <a href="#enquiry" class="program-learn-more">Learn More <span class="material-icons">arrow_forward</span></a>
      </div>
    </div>
  </div>

  <!-- Additional Offerings -->
  <div class="offerings-title reveal">
    <h3>✨ Additional Offerings</h3>
  </div>
  <div class="offerings-grid">
    <div class="offering-card reveal delay-1">
      <span class="offering-icon">♿</span>
      <h4>Special Education</h4>
      <p>Classes for differently-abled children</p>
    </div>
    <div class="offering-card reveal delay-2">
      <span class="offering-icon">🏠</span>
      <h4>Day Care</h4>
      <p>After-school care facility</p>
    </div>
    <div class="offering-card reveal delay-3">
      <span class="offering-icon">👶</span>
      <h4>Cradle / Crèche</h4>
      <p>Safe infant care facility</p>
    </div>
    <div class="offering-card reveal delay-4">
      <span class="offering-icon">🥋</span>
      <h4>Karate</h4>
      <p>Discipline &amp; self-defense</p>
    </div>
    <div class="offering-card reveal delay-1">
      <span class="offering-icon">🎨</span>
      <h4>Drawing &amp; Art</h4>
      <p>Creative expression classes</p>
    </div>
    <div class="offering-card reveal delay-2">
      <span class="offering-icon">🧮</span>
      <h4>Abacus</h4>
      <p>Mental math mastery</p>
    </div>
    <div class="offering-card reveal delay-3">
      <span class="offering-icon">🧩</span>
      <h4>Rubik's Cube</h4>
      <p>Problem-solving &amp; logic</p>
    </div>
    <div class="offering-card reveal delay-4">
      <span class="offering-icon">🎵</span>
      <h4>Music &amp; Dance</h4>
      <p>Rhythm, melody, and movement</p>
    </div>
  </div>
</section>
`;
