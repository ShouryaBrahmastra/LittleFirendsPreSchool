/* ============================================
   LittleFriends – Vision & Mission 3D Effects
   Hero shapes, card depth tilt, goal parallax,
   future particles — all powered by Three.js
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var PR = Math.min(window.devicePixelRatio || 1, 2);
  var MOBILE = window.innerWidth <= 768;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── helpers ─── */
  function makeRenderer(w, h) {
    var r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(PR);
    r.setSize(w, h);
    r.outputColorSpace = THREE.SRGBColorSpace;
    return r;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function brandColors() {
    return [0xFF2D95, 0x00F0FF, 0xBF5FFF, 0x39FF14, 0xFFE500, 0xFF6B2B, 0xFF2D95, 0x00F0FF];
  }

  /* ═══════════════════════════════════════════
     1 ▸ PAGE HERO — Floating 3D shapes
     ═══════════════════════════════════════════ */
  function initPageHero() {
    var hero = document.querySelector('.page-hero');
    if (!hero || REDUCED) return;

    var w = hero.offsetWidth, h = hero.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    cam.position.z = 12;
    var renderer = makeRenderer(w, h);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xfff5eb);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();

    var colors = brandColors();
    var meshes = [];
    var COUNT = MOBILE ? 8 : 14;
    var geos = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.35, 0.15, 12, 32),
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.ConeGeometry(0.35, 0.7, 6),
      new THREE.DodecahedronGeometry(0.4, 0),
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.SphereGeometry(0.35, 16, 16),
    ];

    for (var i = 0; i < COUNT; i++) {
      var geo = geos[i % geos.length];
      var mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.25, roughness: 0.3,
        envMap: envMap, transparent: true, opacity: 0.55,
        emissive: colors[i % colors.length], emissiveIntensity: 0.15,
      });
      var m = new THREE.Mesh(geo, mat);
      var ex = (Math.random() - 0.5) * 22;
      var ey = (Math.random() - 0.5) * 10;
      if (Math.abs(ex) < 5 && Math.abs(ey) < 2.5) {
        ex = (ex >= 0 ? 1 : -1) * (5 + Math.random() * 5);
        ey = (ey >= 0 ? 1 : -1) * (2.5 + Math.random() * 2);
      }
      m.position.set(ex, ey, -5 - Math.random() * 8);
      m.scale.setScalar(0.4 + Math.random() * 0.5);
      m.userData = {
        baseY: m.position.y, speed: 0.3 + Math.random() * 0.6,
        amp: 0.3 + Math.random() * 0.5, rotSpeed: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2, depth: m.position.z,
      };
      scene.add(m);
      meshes.push(m);
    }

    scene.add(new THREE.AmbientLight(0x221133, 0.6));
    var dir = new THREE.DirectionalLight(0xBF5FFF, 0.9);
    dir.position.set(5, 8, 6);
    scene.add(dir);
    var neonFill = new THREE.PointLight(0x00F0FF, 0.5, 30);
    neonFill.position.set(-5, -3, 4);
    scene.add(neonFill);
    var neonFill2 = new THREE.PointLight(0xFF2D95, 0.4, 30);
    neonFill2.position.set(6, 4, 2);
    scene.add(neonFill2);

    var mouseX = 0, mouseY = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });

    var running = false, raf = 0, clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      for (var j = 0; j < meshes.length; j++) {
        var m = meshes[j], u = m.userData;
        m.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * u.amp;
        m.rotation.x += u.rotSpeed * 0.008;
        m.rotation.y += u.rotSpeed * 0.012;
        var pFac = (u.depth + 8) / 8;
        m.position.x += (mouseX * 0.6 * pFac - m.position.x) * 0.001;
      }
      renderer.render(scene, cam);
    }
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(hero);

    window.addEventListener('resize', function () {
      var nw = hero.offsetWidth, nh = hero.offsetHeight;
      cam.aspect = nw / nh;
      cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     2 ▸ VM CARDS — 3D depth tilt + lighting
     ═══════════════════════════════════════════ */
  function initVMCards() {
    var cards = document.querySelectorAll('.vm-card');
    if (!cards.length || REDUCED) return;

    cards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '800px';
      card.style.willChange = 'transform';

      // Create inner depth layers
      var icon = card.querySelector('.vm-icon');
      var h3 = card.querySelector('h3');
      if (icon) icon.style.transform = 'translateZ(0px)';
      if (h3) h3.style.transform = 'translateZ(0px)';

      // Neon shine overlay
      var shine = document.createElement('div');
      shine.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;opacity:0;transition:opacity 0.3s;z-index:2;mix-blend-mode:screen;';
      card.appendChild(shine);

      var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = (e.clientX - rect.left) / rect.width;
        var cy = (e.clientY - rect.top) / rect.height;
        targetX = (cy - 0.5) * -14;  // tilt around X
        targetY = (cx - 0.5) * 14;   // tilt around Y

        // Move shine to cursor position — neon glow
        var isVision = card.classList.contains('vm-vision');
        var glowCol = isVision ? '255, 45, 149' : '0, 240, 255';
        shine.style.background = 'radial-gradient(circle at ' + (cx * 100) + '% ' + (cy * 100) + '%, rgba(' + glowCol + ', 0.25) 0%, transparent 55%)';
        shine.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
        shine.style.opacity = '0';
      });

      function tick() {
        tiltX = lerp(tiltX, targetX, 0.08);
        tiltY = lerp(tiltY, targetY, 0.08);
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateZ(0)';
        // Pop out inner elements for depth
        if (icon) icon.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 1.2 + 'px)';
        if (h3) h3.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 0.6 + 'px)';
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  /* ═══════════════════════════════════════════
     3 ▸ CORE VALUES CARDS — 3D tilt + glow
     ═══════════════════════════════════════════ */
  function initCVCards() {
    var cards = document.querySelectorAll('.cv-card');
    if (!cards.length || REDUCED) return;

    cards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      var iconEl = card.querySelector('.cv-icon');

      // Neon edge glow element
      var glow = document.createElement('div');
      glow.style.cssText = 'position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.3s;z-index:-1;mix-blend-mode:screen;';
      card.style.position = 'relative';
      card.appendChild(glow);

      var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = (e.clientX - rect.left) / rect.width;
        var cy = (e.clientY - rect.top) / rect.height;
        targetX = (cy - 0.5) * -12;
        targetY = (cx - 0.5) * 12;

        // Edge glow follows mouse — neon cyan
        glow.style.background = 'radial-gradient(circle at ' + (cx * 100) + '% ' + (cy * 100) + '%, rgba(255, 107, 43, 0.4) 0%, transparent 60%)';
        glow.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
        glow.style.opacity = '0';
      });

      function tick() {
        tiltX = lerp(tiltX, targetX, 0.08);
        tiltY = lerp(tiltY, targetY, 0.08);
        card.style.transform = 'perspective(700px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        if (iconEl) iconEl.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 1.5 + 'px)';
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  /* ═══════════════════════════════════════════
     4 ▸ PA CARDS — 3D depth + directional light
     ═══════════════════════════════════════════ */
  function initPACards() {
    var cards = document.querySelectorAll('.pa-card');
    if (!cards.length || REDUCED) return;

    cards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      var iconEl = card.querySelector('.pa-icon');
      var h4 = card.querySelector('h4');

      // Neon light stripe
      var light = document.createElement('div');
      light.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;opacity:0;transition:opacity 0.3s;z-index:1;mix-blend-mode:screen;';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(light);

      var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = (e.clientX - rect.left) / rect.width;
        var cy = (e.clientY - rect.top) / rect.height;
        targetX = (cy - 0.5) * -15;
        targetY = (cx - 0.5) * 15;

        light.style.background = 'linear-gradient(' +
          (Math.atan2(cy - 0.5, cx - 0.5) * 180 / Math.PI + 90) + 'deg, ' +
          'rgba(191, 95, 255, 0.2) 0%, transparent 55%)';
        light.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
        light.style.opacity = '0';
      });

      function tick() {
        tiltX = lerp(tiltX, targetX, 0.08);
        tiltY = lerp(tiltY, targetY, 0.08);
        card.style.transform = 'perspective(700px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        if (iconEl) iconEl.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 1.8 + 'px) scale(' + (1 + (Math.abs(tiltX) + Math.abs(tiltY)) * 0.003) + ')';
        if (h4) h4.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 0.8 + 'px)';
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  /* ═══════════════════════════════════════════
     5 ▸ GOAL ITEMS — Parallax number pop-out
     ═══════════════════════════════════════════ */
  function initGoals() {
    var items = document.querySelectorAll('.goal-item');
    if (!items.length || REDUCED) return;

    items.forEach(function (item) {
      item.style.transformStyle = 'preserve-3d';
      item.style.willChange = 'transform';

      var numEl = item.querySelector('.goal-number');
      var contentEl = item.querySelector('.goal-content');

      var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

      item.addEventListener('mousemove', function (e) {
        var rect = item.getBoundingClientRect();
        var cx = (e.clientX - rect.left) / rect.width;
        var cy = (e.clientY - rect.top) / rect.height;
        targetX = (cy - 0.5) * -6;
        targetY = (cx - 0.5) * 8;
      });

      item.addEventListener('mouseleave', function () {
        targetX = 0; targetY = 0;
      });

      function tick() {
        tiltX = lerp(tiltX, targetX, 0.08);
        tiltY = lerp(tiltY, targetY, 0.08);
        item.style.transform = 'perspective(900px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        if (numEl) numEl.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 3 + 'px) scale(' + (1 + (Math.abs(tiltX) + Math.abs(tiltY)) * 0.008) + ')';
        if (contentEl) contentEl.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 0.5 + 'px)';
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  /* ═══════════════════════════════════════════
     6 ▸ FUTURE SECTION — Floating particles
     ═══════════════════════════════════════════ */
  function initFutureParticles() {
    var section = document.querySelector('.future-vision-content');
    if (!section || REDUCED) return;

    var w = section.offsetWidth, h = section.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 80);
    cam.position.z = 10;
    var renderer = makeRenderer(w, h);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;';
    section.style.position = 'relative';
    section.insertBefore(canvas, section.firstChild);

    var PARTICLE_COUNT = MOBILE ? 30 : 60;
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var sizes = new Float32Array(PARTICLE_COUNT);
    var phases = [];

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = rand(-8, 8);
      positions[i * 3 + 1] = rand(-4, 4);
      positions[i * 3 + 2] = rand(-3, 3);
      sizes[i] = rand(4, 12);
      phases.push(rand(0, Math.PI * 2));
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: [
        'attribute float size;',
        'varying float vAlpha;',
        'uniform float uTime;',
        'void main() {',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = size * (8.0 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '  float pulse = sin(uTime * 1.2 + position.x * 2.0 + position.y) * 0.5 + 0.5;',
        '  vAlpha = 0.15 + pulse * 0.35;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vAlpha;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float glow = 1.0 - smoothstep(0.0, 0.5, d);',
        '  glow = pow(glow, 2.5);',
        '  vec3 col = mix(vec3(1.0, 0.18, 0.58), vec3(0.0, 0.94, 1.0), glow);',
        '  gl_FragColor = vec4(col, glow * vAlpha);',
        '}'
      ].join('\n'),
    });

    var pts = new THREE.Points(geo, mat);
    scene.add(pts);

    var running = false, raf = 0, clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      var arr = geo.attributes.position.array;
      for (var p = 0; p < PARTICLE_COUNT; p++) {
        var i3 = p * 3;
        arr[i3] += Math.sin(t * 0.3 + phases[p]) * 0.004;
        arr[i3 + 1] += (0.004 + Math.sin(t * 0.2 + phases[p] * 1.5) * 0.002);
        arr[i3 + 2] += Math.cos(t * 0.25 + phases[p]) * 0.002;
        if (arr[i3 + 1] > 5) arr[i3 + 1] = -5;
        if (arr[i3] > 9) arr[i3] = -9;
        if (arr[i3] < -9) arr[i3] = 9;
      }
      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
    }
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(section);

    window.addEventListener('resize', function () {
      var nw = section.offsetWidth, nh = section.offsetHeight;
      cam.aspect = nw / nh;
      cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     BOOT ALL
     ═══════════════════════════════════════════ */
  function bootAll() {
    initPageHero();
    initVMCards();
    initCVCards();
    initPACards();
    initGoals();
    initFutureParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootAll, 200); });
  } else {
    setTimeout(bootAll, 200);
  }
})();
