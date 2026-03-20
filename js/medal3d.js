/* ============================================
   Three.js 3D Gold Medal for Star Performers
   Renders a spinning gold medal in each .gold-star-card
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var PR = Math.min(window.devicePixelRatio || 1, 2);
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Build medal geometry (disc + ribbon) ── */
  function createMedalMesh(envMap) {
    var group = new THREE.Group();

    // --- Medal disc ---
    var discGeom = new THREE.CylinderGeometry(1, 1, 0.15, 64);
    var goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.15,
      envMapIntensity: 2.0,
      envMap: envMap
    });
    var disc = new THREE.Mesh(discGeom, goldMat);
    disc.rotation.x = Math.PI / 2; // face camera
    group.add(disc);

    // --- Medal rim (torus) ---
    var rimGeom = new THREE.TorusGeometry(0.92, 0.08, 16, 64);
    var rimMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 2.5,
      envMap: envMap
    });
    var rim = new THREE.Mesh(rimGeom, rimMat);
    group.add(rim);

    // --- Star emboss on front face ---
    var starShape = new THREE.Shape();
    var outerR = 0.55, innerR = 0.22, points = 5;
    for (var i = 0; i < points * 2; i++) {
      var angle = (i * Math.PI) / points - Math.PI / 2;
      var r = i % 2 === 0 ? outerR : innerR;
      if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    starShape.closePath();
    var starGeom = new THREE.ExtrudeGeometry(starShape, { depth: 0.04, bevelEnabled: false });
    var starMat = new THREE.MeshStandardMaterial({
      color: 0xfff0a0,
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1.8,
      envMap: envMap
    });
    var starMesh = new THREE.Mesh(starGeom, starMat);
    starMesh.position.z = 0.06;
    group.add(starMesh);

    // --- Back star (mirrored) ---
    var starBack = starMesh.clone();
    starBack.position.z = -0.06;
    starBack.rotation.y = Math.PI;
    group.add(starBack);

    // --- Ribbon ---
    var ribbonGeom = new THREE.PlaneGeometry(0.28, 0.9);
    var ribbonMatL = new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      metalness: 0.1,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    var ribbonLeft = new THREE.Mesh(ribbonGeom, ribbonMatL);
    ribbonLeft.position.set(-0.14, 1.3, 0);
    ribbonLeft.rotation.z = 0.15;
    group.add(ribbonLeft);

    var ribbonMatR = new THREE.MeshStandardMaterial({
      color: 0xc62828,
      metalness: 0.1,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    var ribbonRight = new THREE.Mesh(ribbonGeom, ribbonMatR);
    ribbonRight.position.set(0.14, 1.3, 0);
    ribbonRight.rotation.z = -0.15;
    group.add(ribbonRight);

    return group;
  }

  /* ── Init one medal renderer per card ── */
  var medals = [];

  function initMedals() {
    var containers = document.querySelectorAll('.gold-star-medal-3d');
    if (!containers.length) return;

    containers.forEach(function (el, idx) {
      var W = 80, H = 80;

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(PR);
      renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.pointerEvents = 'none';

      el.innerHTML = '';
      el.appendChild(renderer.domElement);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
      camera.position.set(0, 0.4, 5);
      camera.lookAt(0, 0.3, 0);

      // Lights
      scene.add(new THREE.AmbientLight(0xfff8e1, 0.6));
      var key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(3, 4, 5);
      scene.add(key);
      var fill = new THREE.DirectionalLight(0xffd54f, 1.0);
      fill.position.set(-3, 2, 3);
      scene.add(fill);
      var back = new THREE.DirectionalLight(0xffe082, 0.8);
      back.position.set(0, -2, -3);
      scene.add(back);

      // Env map for reflections
      var pmrem = new THREE.PMREMGenerator(renderer);
      var envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0xfff5eb);
      var el1 = new THREE.PointLight(0xffd700, 10, 12); el1.position.set(3, 3, 3); envScene.add(el1);
      var el2 = new THREE.PointLight(0xffb800, 8, 10); el2.position.set(-3, 2, -3); envScene.add(el2);
      var el3 = new THREE.PointLight(0xffffff, 6, 10); el3.position.set(0, 5, 0); envScene.add(el3);
      var envMap = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envMap;
      pmrem.dispose();

      var medal = createMedalMesh(envMap);
      scene.add(medal);

      medals.push({
        renderer: renderer,
        scene: scene,
        camera: camera,
        medal: medal,
        offset: idx * 0.7, // stagger animation
        el: el
      });
    });
  }

  /* ── Animation loop ── */
  var clock = new THREE.Clock();
  var running = false;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    for (var i = 0; i < medals.length; i++) {
      var m = medals[i];
      // Smooth Y rotation + gentle bob
      var phase = t * 0.8 + m.offset;
      m.medal.rotation.y = phase;
      m.medal.position.y = Math.sin(t * 1.5 + m.offset) * 0.08;
      // Subtle tilt
      m.medal.rotation.z = Math.sin(t * 0.6 + m.offset) * 0.05;
      m.renderer.render(m.scene, m.camera);
    }
  }

  /* ── Intersection Observer: only render when visible ── */
  function setupVisibility() {
    var section = document.querySelector('.gold-stars-section');
    if (!section) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !running) {
          running = true;
          clock.start();
          animate();
        } else if (!entry.isIntersecting && running) {
          running = false;
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
  }

  /* ── Boot ── */
  if (REDUCED) return; // respect reduced-motion

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMedals();
      setupVisibility();
    });
  } else {
    initMedals();
    setupVisibility();
  }
})();
