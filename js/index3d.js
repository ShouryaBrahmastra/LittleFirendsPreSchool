/* ============================================
   Three.js 3D Effects for Index Page
   Hero floating shapes, programs card tilt,
   principal photo depth, enquiry confetti,
   footer animated wave mesh
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ─────────────────────────────────────────────
     1. HERO — Floating 3D Geometric Shapes
     Transparent overlay of spinning, floating
     shapes behind the hero content
     ───────────────────────────────────────────── */
  function initHero() {
    var hero = document.getElementById('home');
    if (!hero) return;

    // Create canvas and insert into hero-bg
    var bg = hero.querySelector('.hero-bg');
    if (!bg) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'hero3dCanvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    bg.appendChild(canvas);

    var W = hero.clientWidth, H = hero.clientHeight;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Soft lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    var dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 8, 10);
    scene.add(dl);

    // Env map for reflections
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xfff5f5);
    var pl1 = new THREE.PointLight(0xff6b6b, 4, 12); pl1.position.set(3, 4, 3); envScene.add(pl1);
    var pl2 = new THREE.PointLight(0x4ecdc4, 4, 12); pl2.position.set(-3, 2, 5); envScene.add(pl2);
    var envMap = pmrem.fromScene(envScene, 0.05).texture;
    scene.environment = envMap;
    pmrem.dispose();

    // Shape palette
    var colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xA78BFA, 0xF472B6, 0x6BCB77, 0xFF8C00];
    var shapes = [];
    var shapeCount = 18;

    function randRange(a, b) { return a + Math.random() * (b - a); }

    for (var i = 0; i < shapeCount; i++) {
      var geom;
      var type = i % 6;
      switch (type) {
        case 0: geom = new THREE.IcosahedronGeometry(randRange(0.2, 0.5), 0); break;
        case 1: geom = new THREE.OctahedronGeometry(randRange(0.2, 0.45), 0); break;
        case 2: geom = new THREE.TorusGeometry(randRange(0.2, 0.4), 0.08, 12, 24); break;
        case 3: geom = new THREE.BoxGeometry(randRange(0.3, 0.5), randRange(0.3, 0.5), randRange(0.3, 0.5)); break;
        case 4: geom = new THREE.ConeGeometry(randRange(0.2, 0.35), randRange(0.4, 0.7), 6); break;
        case 5: geom = new THREE.DodecahedronGeometry(randRange(0.2, 0.4), 0); break;
      }

      var color = colors[i % colors.length];
      var mat = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.15,
        roughness: 0.35,
        transparent: true,
        opacity: 0.65,
        envMapIntensity: 0.8
      });

      var mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        randRange(-8, 8),
        randRange(-5, 5),
        randRange(-4, 2)
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);

      shapes.push({
        mesh: mesh,
        baseY: mesh.position.y,
        baseX: mesh.position.x,
        speedY: randRange(0.3, 0.8),
        speedX: randRange(0.15, 0.4),
        ampY: randRange(0.5, 1.5),
        ampX: randRange(0.3, 0.8),
        rotSpeed: new THREE.Vector3(
          randRange(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1),
          randRange(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1),
          randRange(0.05, 0.3) * (Math.random() > 0.5 ? 1 : -1)
        ),
        phase: Math.random() * Math.PI * 2
      });
    }

    // Mouse tracking for subtle parallax
    var mouseX = 0, mouseY = 0, tgtMX = 0, tgtMY = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tgtMX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tgtMY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    hero.addEventListener('mouseleave', function () { tgtMX = 0; tgtMY = 0; });

    var clock = new THREE.Clock();
    var running = false;

    function animate() {
      requestAnimationFrame(animate);
      if (!running) return;

      var time = clock.getElapsedTime();
      var dt = clock.getDelta();

      mouseX += (tgtMX - mouseX) * 0.03;
      mouseY += (tgtMY - mouseY) * 0.03;

      for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        s.mesh.position.y = s.baseY + Math.sin(time * s.speedY + s.phase) * s.ampY;
        s.mesh.position.x = s.baseX + Math.sin(time * s.speedX + s.phase + 1.5) * s.ampX;
        s.mesh.rotation.x += s.rotSpeed.x * dt;
        s.mesh.rotation.y += s.rotSpeed.y * dt;
        s.mesh.rotation.z += s.rotSpeed.z * dt;

        // Subtle mouse parallax per depth
        var depth = (s.mesh.position.z + 4) / 6; // 0..1
        s.mesh.position.x += mouseX * 0.3 * depth;
        s.mesh.position.y -= mouseY * 0.2 * depth;
      }

      camera.position.x = mouseX * 0.4;
      camera.position.y = mouseY * -0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    // Visibility
    var obs = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) clock.start();
    }, { threshold: 0.05 });
    obs.observe(hero);

    // Resize
    window.addEventListener('resize', function () {
      W = hero.clientWidth; H = hero.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  /* ─────────────────────────────────────────────
     2. PROGRAMS — Mouse-tracking 3D card tilt
     Real GPU-accelerated perspective tilt on
     hover with light/shadow shift
     ───────────────────────────────────────────── */
  function initProgramCards() {
    var cards = document.querySelectorAll('.program-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var glare = document.createElement('div');
      glare.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.25),transparent 60%);' +
        'opacity:0;transition:opacity 0.3s;z-index:5;';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(glare);

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotY = (x - 0.5) * 18; // degrees
        var rotX = (0.5 - y) * 14;
        card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(10px)';
        card.style.transition = 'transform 0.08s ease-out';
        // Glare follows cursor
        glare.style.background = 'radial-gradient(circle at ' + (x * 100) + '% ' + (y * 100) + '%, rgba(255,255,255,0.3), transparent 55%)';
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        glare.style.opacity = '0';
      });
    });

    // Also enhance offering cards
    var offerings = document.querySelectorAll('.offering-card');
    offerings.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotY = (x - 0.5) * 12;
        var rotX = (0.5 - y) * 10;
        card.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(5px)';
        card.style.transition = 'transform 0.08s ease-out';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      });
    });
  }

  /* ─────────────────────────────────────────────
     3. PRINCIPAL — 3D Photo Frame Depth
     Mouse-reactive perspective shift on the
     principal photo creating a depth portal effect
     ───────────────────────────────────────────── */
  function initPrincipalDepth() {
    var wrapper = document.querySelector('.principal-photo-wrapper');
    if (!wrapper) return;
    var frame = wrapper.querySelector('.principal-photo-frame');
    if (!frame) return;

    wrapper.addEventListener('mousemove', function (e) {
      var rect = wrapper.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var rotY = x * 20;
      var rotX = -y * 15;
      frame.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
      frame.style.transition = 'transform 0.1s ease-out';
      // Move inner image opposite for depth look
      var img = frame.querySelector('.principal-photo-img');
      if (img) {
        img.style.transform = 'translateX(' + (x * -10) + 'px) translateY(' + (y * -10) + 'px) scale(1.08)';
        img.style.transition = 'transform 0.1s ease-out';
      }
    });

    wrapper.addEventListener('mouseleave', function () {
      frame.style.transform = 'perspective(800px) rotateX(0) rotateY(0) rotate(3deg) scale(1)';
      frame.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      var img = frame.querySelector('.principal-photo-img');
      if (img) {
        img.style.transform = 'translateX(0) translateY(0) scale(1)';
        img.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      }
    });
  }

  /* ─────────────────────────────────────────────
     4. TESTIMONIALS — Floating 3D stars
     Small Three.js canvas behind the section
     with glowing rotating 3D stars
     ───────────────────────────────────────────── */
  function initTestimonialStars() {
    var section = document.getElementById('testimonials');
    if (!section) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'testimonial3dCanvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    section.style.position = 'relative';
    section.insertBefore(canvas, section.firstChild);

    var W = section.clientWidth, H = section.clientHeight;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    var light = new THREE.PointLight(0xFFE66D, 2, 20);
    light.position.set(2, 3, 8);
    scene.add(light);

    // Create 5-pointed star shape
    function createStarGeom(outerR, innerR, points, depth) {
      var shape = new THREE.Shape();
      for (var i = 0; i < points * 2; i++) {
        var angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        var r = i % 2 === 0 ? outerR : innerR;
        var px = Math.cos(angle) * r;
        var py = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(px, py);
        else shape.lineTo(px, py);
      }
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, {
        depth: depth, bevelEnabled: true, bevelThickness: 0.02,
        bevelSize: 0.02, bevelSegments: 2
      });
    }

    var starColors = [0xFFE66D, 0xFF6B6B, 0x4ECDC4, 0xA78BFA, 0xF472B6];
    var stars = [];
    for (var i = 0; i < 12; i++) {
      var sg = createStarGeom(
        0.15 + Math.random() * 0.15,
        0.06 + Math.random() * 0.06,
        5, 0.04
      );
      var sm = new THREE.MeshStandardMaterial({
        color: starColors[i % starColors.length],
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.5,
        emissive: starColors[i % starColors.length],
        emissiveIntensity: 0.15
      });
      var star = new THREE.Mesh(sg, sm);
      star.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      star.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(star);
      stars.push({
        mesh: star,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.3
        ),
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatAmp: 0.3 + Math.random() * 0.7,
        baseY: star.position.y,
        phase: Math.random() * Math.PI * 2
      });
    }

    var clock = new THREE.Clock();
    var running = false;

    function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      var time = clock.getElapsedTime();
      var dt = clock.getDelta();
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.mesh.rotation.x += s.rotSpeed.x * dt;
        s.mesh.rotation.y += s.rotSpeed.y * dt;
        s.mesh.position.y = s.baseY + Math.sin(time * s.floatSpeed + s.phase) * s.floatAmp;
      }
      renderer.render(scene, camera);
    }
    animate();

    var obs = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) clock.start();
    }, { threshold: 0.05 });
    obs.observe(section);

    window.addEventListener('resize', function () {
      W = section.clientWidth; H = section.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  /* ─────────────────────────────────────────────
     5. ENQUIRY — 3D Confetti Burst on Submit
     Creates a Three.js canvas overlay that fires
     a celebration confetti burst when the form
     is submitted successfully
     ───────────────────────────────────────────── */
  function initEnquiryConfetti() {
    var section = document.getElementById('enquiry');
    if (!section) return;

    // We'll create the canvas on-demand when form succeeds
    var confettiActive = false;
    var particles = [];
    var confettiScene, confettiCamera, confettiRenderer, confettiCanvas;

    function createConfettiCanvas() {
      confettiCanvas = document.createElement('canvas');
      confettiCanvas.id = 'confetti3dCanvas';
      confettiCanvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
      document.body.appendChild(confettiCanvas);

      var W = window.innerWidth, H = window.innerHeight;
      confettiRenderer = new THREE.WebGLRenderer({ canvas: confettiCanvas, antialias: true, alpha: true });
      confettiRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      confettiRenderer.setSize(W, H);

      confettiScene = new THREE.Scene();
      confettiCamera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
      confettiCamera.position.set(0, 0, 8);

      confettiScene.add(new THREE.AmbientLight(0xffffff, 1));

      var colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xA78BFA, 0xF472B6, 0x6BCB77, 0xFF8C00, 0x2196F3];
      particles = [];

      for (var i = 0; i < 120; i++) {
        var gType = i % 3;
        var g;
        if (gType === 0) g = new THREE.BoxGeometry(0.1, 0.1, 0.02);
        else if (gType === 1) g = new THREE.PlaneGeometry(0.12, 0.06);
        else g = new THREE.CircleGeometry(0.06, 6);

        var m = new THREE.MeshStandardMaterial({
          color: colors[i % colors.length],
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide
        });

        var mesh = new THREE.Mesh(g, m);
        // Start at center-bottom burst point
        mesh.position.set(
          (Math.random() - 0.5) * 0.5,
          -2 + Math.random() * 0.5,
          (Math.random() - 0.5) * 2
        );
        confettiScene.add(mesh);

        particles.push({
          mesh: mesh,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            5 + Math.random() * 8,
            (Math.random() - 0.5) * 4
          ),
          rotVel: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ),
          gravity: -6 - Math.random() * 4,
          drag: 0.98 + Math.random() * 0.015,
          life: 3 + Math.random() * 2
        });
      }

      confettiActive = true;
      var startTime = performance.now();

      function animConfetti(ts) {
        if (!confettiActive) return;
        requestAnimationFrame(animConfetti);
        var elapsed = (ts - startTime) / 1000;
        var dt = 0.016;
        var allDead = true;

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          if (elapsed > p.life) {
            p.mesh.visible = false;
            continue;
          }
          allDead = false;
          p.vel.y += p.gravity * dt;
          p.vel.x *= p.drag;
          p.vel.z *= p.drag;
          // Flutter
          p.vel.x += Math.sin(elapsed * 3 + i) * 0.3 * dt;
          p.mesh.position.x += p.vel.x * dt;
          p.mesh.position.y += p.vel.y * dt;
          p.mesh.position.z += p.vel.z * dt;
          p.mesh.rotation.x += p.rotVel.x * dt;
          p.mesh.rotation.y += p.rotVel.y * dt;
          p.mesh.rotation.z += p.rotVel.z * dt;
          // Fade out near end
          var lifeRatio = 1 - elapsed / p.life;
          p.mesh.material.opacity = Math.min(1, lifeRatio * 2);
        }

        confettiRenderer.render(confettiScene, confettiCamera);

        if (allDead) {
          confettiActive = false;
          confettiCanvas.remove();
          confettiRenderer.dispose();
        }
      }
      requestAnimationFrame(animConfetti);
    }

    // Listen for form success
    // The site shows .enquiry-success on successful submit
    var successObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' || m.type === 'childList') {
          var success = section.querySelector('.enquiry-success');
          if (success && success.offsetParent !== null && !confettiActive) {
            createConfettiCanvas();
          }
        }
      });
    });
    successObserver.observe(section, { attributes: true, childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────────
     6. FOOTER — Animated 3D wave mesh
     Replaces the flat SVG wave with a living,
     breathing 3D wave surface
     ───────────────────────────────────────────── */
  function initFooterWave() {
    var waveContainer = document.querySelector('.footer-wave');
    if (!waveContainer) return;

    // Hide original SVG
    var svg = waveContainer.querySelector('svg');
    if (svg) svg.style.display = 'none';

    var canvas = document.createElement('canvas');
    canvas.id = 'footerWave3d';
    canvas.style.cssText = 'display:block;width:100%;height:120px;';
    waveContainer.appendChild(canvas);

    var W = waveContainer.clientWidth, H = 120;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-5, 5, 1.5, -1.5, 0.1, 20);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var dlight = new THREE.DirectionalLight(0xffffff, 0.5);
    dlight.position.set(2, 3, 4);
    scene.add(dlight);

    // Get footer background color from CSS variable
    var footerStyle = getComputedStyle(document.documentElement);
    var footerBg = footerStyle.getPropertyValue('--bg-footer').trim() || '#1a1a2e';

    // Wave mesh — plane with vertex displacement
    var planeW = 10, planeH = 3, segsX = 80, segsY = 12;
    var geom = new THREE.PlaneGeometry(planeW, planeH, segsX, segsY);
    var mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(footerBg),
      metalness: 0.1,
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    var waveMesh = new THREE.Mesh(geom, mat);
    waveMesh.rotation.x = -Math.PI * 0.35;
    waveMesh.position.y = -0.5;
    scene.add(waveMesh);

    var basePositions = Float32Array.from(geom.attributes.position.array);

    var clock = new THREE.Clock();
    var running = false;

    function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      var time = clock.getElapsedTime();
      var pos = geom.attributes.position.array;
      for (var i = 0; i < pos.length; i += 3) {
        var bx = basePositions[i];
        var by = basePositions[i + 1];
        // Multi-frequency wave
        var wave = Math.sin(bx * 1.5 + time * 1.2) * 0.2 +
                   Math.sin(bx * 0.8 - time * 0.8 + by * 2) * 0.12 +
                   Math.sin(bx * 3 + time * 2) * 0.06;
        pos[i + 2] = wave;
      }
      geom.attributes.position.needsUpdate = true;
      geom.computeVertexNormals();
      renderer.render(scene, camera);
    }
    animate();

    var obs = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) clock.start();
    }, { threshold: 0.01 });
    obs.observe(waveContainer);

    window.addEventListener('resize', function () {
      W = waveContainer.clientWidth;
      camera.left = -5 * (W / (W || 1));
      camera.right = 5 * (W / (W || 1));
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  /* ─────────────────────────────────────────────
     7. CAROUSEL — Subtle depth tilt on slides
     ───────────────────────────────────────────── */
  function initCarouselDepth() {
    var track = document.querySelector('.carousel-track');
    if (!track) return;

    track.addEventListener('mousemove', function (e) {
      var slides = track.querySelectorAll('.carousel-slide');
      slides.forEach(function (slide) {
        var rect = slide.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right) return;
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        slide.style.transform = 'perspective(1000px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 3) + 'deg)';
        slide.style.transition = 'transform 0.1s ease-out';
      });
    });

    track.addEventListener('mouseleave', function () {
      var slides = track.querySelectorAll('.carousel-slide');
      slides.forEach(function (slide) {
        slide.style.transform = '';
        slide.style.transition = 'transform 0.5s ease';
      });
    });
  }

  /* ─────────────────────────────────────────────
     BOOT — Initialize all effects after DOM
     ───────────────────────────────────────────── */
  function bootAll() {
    // Wait for component injection to finish
    setTimeout(function () {
      initHero();
      initProgramCards();
      initPrincipalDepth();
      initTestimonialStars();
      initEnquiryConfetti();
      initFooterWave();
      initCarouselDepth();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
