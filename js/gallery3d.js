/* ============================================
   gallery3d.js — Three.js 3D Particle
   Reconstruction Effect for Gallery Page
   Images disintegrate into 3D scattered particles
   and reconstruct on scroll with cinematic motion
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ── Helpers ── */
  var PR   = Math.min(window.devicePixelRatio || 1, 1.5);
  var MOB  = /Mobi|Android/i.test(navigator.userAgent);
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  /* ══════════════════════════════════════════
     1 ▸ HERO FLOATING 3D SHAPES
     Soft geometric shapes floating behind
     the gallery hero text
     ══════════════════════════════════════════ */
  function initHeroShapes() {
    var hero = document.querySelector('.gallery-hero');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'gallery-hero-3d-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.insertBefore(canvas, hero.firstChild);

    var W = hero.offsetWidth, H = hero.offsetHeight;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(PR);
    renderer.setSize(W, H);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 8);

    /* Soft lighting */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var dirL = new THREE.DirectionalLight(0xffcc88, 0.6);
    dirL.position.set(3, 4, 5);
    scene.add(dirL);

    /* Shapes */
    var shapes = [];
    var geometries = [
      new THREE.IcosahedronGeometry(0.4, 0),
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.TorusGeometry(0.3, 0.12, 12, 32),
      new THREE.TetrahedronGeometry(0.4, 0),
      new THREE.SphereGeometry(0.3, 16, 12),
      new THREE.DodecahedronGeometry(0.35, 0),
      new THREE.ConeGeometry(0.25, 0.5, 8)
    ];
    var pastelColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xA78BFA, 0xF9A8D4, 0x6EE7B7, 0x93C5FD];

    var shapeCount = MOB ? 6 : 10;
    for (var i = 0; i < shapeCount; i++) {
      var geo = geometries[i % geometries.length];
      var mat = new THREE.MeshStandardMaterial({
        color: pastelColors[i % pastelColors.length],
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rand(-5, 5), rand(-3, 3), rand(-3, 1));
      mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), 0);
      shapes.push({
        mesh: mesh,
        speedX: rand(0.002, 0.008),
        speedY: rand(0.003, 0.01),
        floatX: rand(0.1, 0.3),
        floatY: rand(0.1, 0.25),
        phase: rand(0, Math.PI * 2)
      });
      scene.add(mesh);
    }

    var running = false, raf = 0, clk = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clk.getElapsedTime();

      for (var j = 0; j < shapes.length; j++) {
        var s = shapes[j];
        s.mesh.rotation.x += s.speedX;
        s.mesh.rotation.y += s.speedY;
        s.mesh.position.x += Math.sin(t * 0.3 + s.phase) * 0.003;
        s.mesh.position.y += Math.cos(t * 0.25 + s.phase) * 0.002;
      }

      renderer.render(scene, camera);
    }

    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) {
        if (!running) { running = true; clk.start(); animate(); }
      } else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(hero);

    window.addEventListener('resize', function () {
      W = hero.offsetWidth; H = hero.offsetHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
  }


  /* ══════════════════════════════════════════
     3 ▸ SECTION FLOATING PARTICLES
     Ambient particle layer in each gallery section
     for depth and atmosphere
     ══════════════════════════════════════════ */
  function initSectionParticles() {
    if (MOB) return; // skip on mobile for performance

    var sections = document.querySelectorAll('.gallery-section');
    sections.forEach(function (section) {
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
      section.style.position = 'relative';
      section.insertBefore(canvas, section.firstChild);

      var W = section.offsetWidth, H = section.offsetHeight;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
      renderer.setPixelRatio(1);
      renderer.setSize(W, H);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
      camera.position.z = 5;

      var particleCount = 40;
      var geo = new THREE.BufferGeometry();
      var pos = new Float32Array(particleCount * 3);
      var vel = [];
      for (var i = 0; i < particleCount; i++) {
        pos[i * 3]     = rand(-6, 6);
        pos[i * 3 + 1] = rand(-4, 4);
        pos[i * 3 + 2] = rand(-2, 2);
        vel.push({ x: rand(-0.003, 0.003), y: rand(0.002, 0.006), z: rand(-0.001, 0.001) });
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      var mat = new THREE.PointsMaterial({
        color: 0xffaa88, size: 0.04, transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var pts = new THREE.Points(geo, mat);
      scene.add(pts);

      var running = false, raf = 0, clk = new THREE.Clock();

      function animate() {
        raf = requestAnimationFrame(animate);
        var t = clk.getElapsedTime();
        var p = geo.attributes.position.array;
        for (var j = 0; j < particleCount; j++) {
          p[j * 3]     += vel[j].x + Math.sin(t * 0.3 + j) * 0.0003;
          p[j * 3 + 1] += vel[j].y;
          p[j * 3 + 2] += vel[j].z;
          if (p[j * 3 + 1] > 5) {
            p[j * 3]     = rand(-6, 6);
            p[j * 3 + 1] = -5;
            p[j * 3 + 2] = rand(-2, 2);
          }
        }
        geo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      }

      var obs = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          if (!running) { running = true; clk.start(); animate(); }
        } else { running = false; cancelAnimationFrame(raf); }
      }, { threshold: 0.01 });
      obs.observe(section);
    });
  }


  /* ══════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════ */
  function bootAll() {
    initHeroShapes();
    initSectionParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
