document.querySelector('[data-component="principal"]').outerHTML = `
<!-- ============== PRINCIPAL'S CORNER ============== -->
<section class="principal-section parallax-section" id="about">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-xl parallax-primary pd-1" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-circle parallax-md parallax-green pd-2" data-parallax-depth="4" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-md parallax-purple pd-3" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-star pd-4" data-parallax-depth="5">🌟</div>

  <div class="section-title reveal">
    <h2>👩‍🏫 Principal's Corner</h2>
    <p>A message of love, care, and commitment from our school leader</p>
  </div>
  <div class="principal-container">
    <!-- Message (Left) -->
    <div class="principal-message reveal-left">
      <div class="principal-label">
        <span class="material-icons">school</span>
        From Our Principal
      </div>
      <h3 class="principal-name">Mrs. Priyanka Verma</h3>
      <p class="principal-title">Founder &amp; Principal, Little Friends Preschool and Day Care</p>
      <div class="principal-quote">
        <span class="principal-quote-icon">&ldquo;</span>
        <p>
          At Little Friends Preschool and Day Care, we believe every child is a unique learner with boundless potential.
          Our mission is to nurture curiosity, creativity, and confidence in a safe, loving environment.
          We blend the best of NEP 2020 guidelines with international pedagogy to create a holistic learning
          experience that prepares children not just for school, but for life.
        </p>
        <p class="principal-quote-continued">
          Every day at Little Friends Preschool and Day Care is filled with wonder, discovery, and joy. We invite you to be a part of
          our growing family where little minds blossom into big dreams.
        </p>
      </div>
      <div class="principal-signature">~ Mrs. Priyanka Verma</div>
    </div>

    <!-- Photo (Right) -->
    <div class="principal-photo-wrapper reveal-right">
      <div class="principal-photo-frame">
        <img src="assets/home/principal.png" alt="Mrs. Priyanka Verma - Principal" class="principal-photo-img">
      </img>
      <div class="principal-photo-decor principal-photo-decor-1"></div>
      <div class="principal-photo-decor principal-photo-decor-2"></div>
      <div class="principal-photo-decor principal-photo-decor-3"></div>
    </div>
  </div>
</section>
`;
