/* ============================================
   LittleFriends – Our Story Page Three.js 3D
   Floating hero shapes, photo depth, teacher
   card tilt, tree fireflies, footer 3D wave
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var PR = Math.min(window.devicePixelRatio || 1, 2);
  var MOBILE = window.innerWidth <= 768;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── helpers ─────────── */
  function makeRenderer(w, h, alpha) {
    var r = new THREE.WebGLRenderer({ antialias: true, alpha: !!alpha });
    r.setPixelRatio(PR);
    r.setSize(w, h);
    r.outputColorSpace = THREE.SRGBColorSpace;
    return r;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function brandColors() {
    return [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xA78BFA, 0x6BCB77, 0x45B7D1, 0xFFA07A, 0xF472B6];
  }

  /* ═══════════════════════════════════════════
     1 ▸ PAGE HERO — Floating 3D Shapes
     ═══════════════════════════════════════════ */
  function initPageHero() {
    var hero = document.querySelector('.page-hero');
    if (!hero || REDUCED) return;

    var w = hero.offsetWidth, h = hero.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    cam.position.z = 12;
    var renderer = makeRenderer(w, h, true);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    // env map for reflections
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xfff5eb);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();

    var colors = brandColors();
    var meshes = [];
    var COUNT = MOBILE ? 10 : 18;
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
      var col = colors[i % colors.length];
      var mat = new THREE.MeshStandardMaterial({
        color: col, metalness: 0.15, roughness: 0.45,
        envMap: envMap, transparent: true, opacity: 0.72,
      });
      var m = new THREE.Mesh(geo, mat);
      m.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 8,
        -2 - Math.random() * 6
      );
      var s = 0.6 + Math.random() * 0.8;
      m.scale.setScalar(s);
      m.userData = {
        baseY: m.position.y,
        speed: 0.3 + Math.random() * 0.6,
        amp: 0.3 + Math.random() * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2,
        depth: m.position.z,
      };
      scene.add(m);
      meshes.push(m);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 8, 6);
    scene.add(dir);

    var mouseX = 0, mouseY = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });

    var running = false, raf = 0;
    var clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      for (var j = 0; j < meshes.length; j++) {
        var m = meshes[j];
        var u = m.userData;
        m.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * u.amp;
        m.rotation.x += u.rotSpeed * 0.008;
        m.rotation.y += u.rotSpeed * 0.012;
        // parallax shift by mouse and depth
        var pFac = (u.depth + 8) / 8;
        m.position.x += (mouseX * 0.6 * pFac - m.position.x) * 0.001;
      }
      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.05 });
    obs.observe(hero);

    window.addEventListener('resize', function () {
      var nw = hero.offsetWidth, nh = hero.offsetHeight;
      cam.aspect = nw / nh; cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     2 ▸ SCHOOL PHOTO — 3D Depth Tilt
     ═══════════════════════════════════════════ */
  function initSchoolPhotoDepth() {
    var frame = document.querySelector('.school-photo-frame');
    if (!frame || MOBILE) return;

    var img = frame.querySelector('img');
    frame.style.perspective = '800px';
    frame.style.transformStyle = 'preserve-3d';
    frame.style.transition = 'transform 0.4s cubic-bezier(.03,.98,.52,.99)';
    if (img) {
      img.style.transition = 'transform 0.4s cubic-bezier(.03,.98,.52,.99)';
    }

    // create glare overlay
    var glare = document.createElement('div');
    glare.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;' +
      'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 60%);' +
      'opacity:0;transition:opacity 0.4s ease;z-index:3;border-radius:inherit;';
    frame.appendChild(glare);

    frame.addEventListener('mousemove', function (e) {
      var r = frame.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var rotY = (px - 0.5) * 14;
      var rotX = -(py - 0.5) * 10;
      frame.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      if (img) {
        img.style.transform = 'scale(1.06) translateX(' + (px - 0.5) * -8 + 'px) translateY(' + (py - 0.5) * -6 + 'px)';
      }
      glare.style.opacity = '1';
      glare.style.background = 'radial-gradient(circle at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(255,255,255,0.22) 0%, transparent 55%)';
    });

    frame.addEventListener('mouseleave', function () {
      frame.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
      if (img) img.style.transform = 'scale(1)';
      glare.style.opacity = '0';
    });
  }

  /* ═══════════════════════════════════════════
     3 ▸ PRINCIPAL — 3D Depth Portal
     ═══════════════════════════════════════════ */
  function initPrincipalDepth() {
    var frame = document.querySelector('.principal-video-frame');
    if (!frame || MOBILE) return;

    var img = frame.querySelector('img');
    frame.style.perspective = '900px';
    frame.style.transformStyle = 'preserve-3d';
    frame.style.transition = 'transform 0.5s cubic-bezier(.03,.98,.52,.99)';
    if (img) {
      img.style.transition = 'transform 0.5s cubic-bezier(.03,.98,.52,.99)';
    }

    frame.addEventListener('mousemove', function (e) {
      var r = frame.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var rotY = (px - 0.5) * 10;
      var rotX = -(py - 0.5) * 8;
      frame.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      if (img) {
        img.style.transform = 'scale(1.04) translateX(' + (px - 0.5) * -6 + 'px) translateY(' + (py - 0.5) * -5 + 'px)';
      }
    });

    frame.addEventListener('mouseleave', function () {
      frame.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      if (img) img.style.transform = 'scale(1)';
    });
  }

  /* ═══════════════════════════════════════════
     4 ▸ TEACHER TILES — 3D Card Tilt + Glare
     ═══════════════════════════════════════════ */
  function initTeacherTiles() {
    var tiles = document.querySelectorAll('.hanging-tile');
    if (!tiles.length || MOBILE) return;

    tiles.forEach(function (tile) {
      tile.style.transformStyle = 'preserve-3d';
      // glare overlay
      var glare = document.createElement('div');
      glare.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 60%);' +
        'opacity:0;transition:opacity 0.3s ease;z-index:10;border-radius:inherit;';
      tile.style.position = 'relative';
      tile.appendChild(glare);

      tile.addEventListener('mousemove', function (e) {
        var r = tile.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rotY = (px - 0.5) * 18;
        var rotX = -(py - 0.5) * 14;
        tile.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.04)';
        tile.style.animationPlayState = 'paused';
        glare.style.opacity = '1';
        glare.style.background = 'radial-gradient(circle at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(255,255,255,0.28) 0%, transparent 55%)';
      });

      tile.addEventListener('mouseleave', function () {
        tile.style.transform = '';
        tile.style.animationPlayState = '';
        glare.style.opacity = '0';
      });
    });
  }

  /* ═══════════════════════════════════════════
     5 ▸ TREE SCENE — Magical 3D Fireflies
     ═══════════════════════════════════════════ */
  function initTreeFireflies() {
    var scene3d = document.querySelector('.tree-scene');
    if (!scene3d || REDUCED) return;

    var w = scene3d.offsetWidth, h = scene3d.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    cam.position.z = 14;

    var renderer = makeRenderer(w, h, true);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:12;';
    scene3d.style.position = 'relative';
    scene3d.insertBefore(canvas, scene3d.firstChild);

    var COUNT = MOBILE ? 30 : 60;
    var positions = new Float32Array(COUNT * 3);
    var velocities = [];
    var phases = [];
    var sizes = new Float32Array(COUNT);

    for (var i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = -1 - Math.random() * 6;
      velocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.008 + 0.003,
        z: (Math.random() - 0.5) * 0.005
      });
      phases.push(Math.random() * Math.PI * 2);
      sizes[i] = 12 + Math.random() * 18;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // custom shader for glowing point sprites
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0xFFE66D) },
        uColor2: { value: new THREE.Color(0x6BCB77) },
      },
      vertexShader: [
        'attribute float size;',
        'varying float vAlpha;',
        'uniform float uTime;',
        'void main() {',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = size * (8.0 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '  float pulse = sin(uTime * 1.5 + position.x * 2.0 + position.y * 1.3) * 0.5 + 0.5;',
        '  vAlpha = 0.15 + pulse * 0.55;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vAlpha;',
        'uniform vec3 uColor1;',
        'uniform vec3 uColor2;',
        'uniform float uTime;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float glow = 1.0 - smoothstep(0.0, 0.5, d);',
        '  glow = pow(glow, 2.0);',
        '  float mix1 = sin(uTime * 0.5 + gl_PointCoord.x * 3.14) * 0.5 + 0.5;',
        '  vec3 col = mix(uColor1, uColor2, mix1);',
        '  gl_FragColor = vec4(col, glow * vAlpha);',
        '}'
      ].join('\n'),
    });

    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var running = false, raf = 0;
    var clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      var pos = geo.attributes.position.array;
      for (var j = 0; j < COUNT; j++) {
        var idx = j * 3;
        pos[idx] += velocities[j].x + Math.sin(t * 0.5 + phases[j]) * 0.005;
        pos[idx + 1] += velocities[j].y + Math.cos(t * 0.4 + phases[j]) * 0.004;
        pos[idx + 2] += velocities[j].z;

        // wrap around bounds
        if (pos[idx] > 12) pos[idx] = -12;
        if (pos[idx] < -12) pos[idx] = 12;
        if (pos[idx + 1] > 11) pos[idx + 1] = -11;
        if (pos[idx + 1] < -11) pos[idx + 1] = 11;
        if (pos[idx + 2] > 0) pos[idx + 2] = -7;
        if (pos[idx + 2] < -7) pos[idx + 2] = 0;
      }
      geo.attributes.position.needsUpdate = true;

      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.02 });
    obs.observe(scene3d);

    window.addEventListener('resize', function () {
      var nw = scene3d.offsetWidth, nh = scene3d.offsetHeight;
      cam.aspect = nw / nh; cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     6 ▸ HIGHLIGHT BOX — Floating 3D Book
     ═══════════════════════════════════════════ */
  function initHighlightBook() {
    var box = document.querySelector('.highlight-box');
    if (!box || MOBILE || REDUCED) return;

    var size = 80;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    cam.position.z = 4;

    var renderer = makeRenderer(size, size, true);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:50%;right:8px;transform:translateY(-50%);' +
      'width:' + size + 'px;height:' + size + 'px;pointer-events:none;z-index:3;';
    box.style.position = 'relative';
    box.appendChild(canvas);

    // Build a simple open book
    var coverMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, metalness: 0.1, roughness: 0.6 });
    var pageMat = new THREE.MeshStandardMaterial({ color: 0xFFFDF0, metalness: 0, roughness: 0.8 });

    // left cover
    var leftCover = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.04), coverMat);
    leftCover.position.set(-0.48, 0, 0);
    leftCover.rotation.y = 0.25;

    // right cover
    var rightCover = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.04), coverMat);
    rightCover.position.set(0.48, 0, 0);
    rightCover.rotation.y = -0.25;

    // pages
    var pages = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.12), pageMat);
    pages.position.set(0, 0, -0.04);

    // spine
    var spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), coverMat);
    spine.position.set(0, 0, -0.06);

    var bookGroup = new THREE.Group();
    bookGroup.add(leftCover, rightCover, pages, spine);
    bookGroup.rotation.x = -0.3;
    scene.add(bookGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    var pt = new THREE.PointLight(0xFFE66D, 1.2, 8);
    pt.position.set(2, 2, 3);
    scene.add(pt);

    var running = false, raf = 0;
    var clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      bookGroup.rotation.y = Math.sin(t * 0.8) * 0.4;
      bookGroup.position.y = Math.sin(t * 0.6) * 0.08;
      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.1 });
    obs.observe(box);
  }

  /* ═══════════════════════════════════════════
     7 ▸ FOOTER WAVE — 3D Vertex-displaced Mesh
     ═══════════════════════════════════════════ */
  function initFooterWave() {
    var waveWrap = document.querySelector('.footer-wave');
    if (!waveWrap || REDUCED) return;

    // read footer background colour
    var footerBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-footer').trim() || '#2D3436';

    var w = waveWrap.offsetWidth;
    var h = waveWrap.querySelector('svg') ? waveWrap.querySelector('svg').getBoundingClientRect().height : 100;
    h = Math.max(h, 60);

    var scene = new THREE.Scene();
    var aspect = w / h;
    var camH = 6;
    var cam = new THREE.OrthographicCamera(
      -camH * aspect / 2, camH * aspect / 2,
      camH / 2, -camH / 2, 0.1, 50
    );
    cam.position.set(0, 0, 10);
    cam.lookAt(0, 0, 0);

    var renderer = makeRenderer(w, h, true);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'display:block;width:100%;height:100%;';

    // hide original svg, insert canvas
    var svgEl = waveWrap.querySelector('svg');
    if (svgEl) svgEl.style.display = 'none';
    waveWrap.appendChild(canvas);

    var planeW = camH * aspect + 2;
    var planeH = camH;
    var geo = new THREE.PlaneGeometry(planeW, planeH, 80, 12);
    var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(footerBg), side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -camH / 2 + 0.5;
    scene.add(mesh);

    var running = false, raf = 0;
    var clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      var pos = geo.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var x = pos.getX(i);
        var baseY = pos.getY(i);
        // only displace top half
        var normY = (baseY + planeH / 2) / planeH;
        if (normY > 0.45) {
          var wave = Math.sin(x * 1.2 + t * 1.4) * 0.35
            + Math.sin(x * 0.7 - t * 0.8) * 0.2
            + Math.sin(x * 2.1 + t * 2.0) * 0.1;
          pos.setZ(i, wave * (normY - 0.45) * 3.5);
        }
      }
      pos.needsUpdate = true;
      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.05 });
    obs.observe(waveWrap);

    window.addEventListener('resize', function () {
      var nw = waveWrap.offsetWidth;
      var nh = Math.max(waveWrap.offsetHeight, 60);
      var na = nw / nh;
      cam.left = -camH * na / 2; cam.right = camH * na / 2;
      cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     8 ▸ THREE.JS 3D KITES — Realistic Flight
     ═══════════════════════════════════════════ */
  function initKites3D() {
    var treeScene = document.querySelector('.tree-scene');
    if (!treeScene || REDUCED) return;

    /* hide original CSS kites */
    var origKites = treeScene.querySelectorAll('.kite');
    origKites.forEach(function (k) { k.style.display = 'none'; });

    /* ---- renderer ---- */
    var w = treeScene.offsetWidth, h = treeScene.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    cam.position.set(0, 0, 28);

    var renderer = makeRenderer(w, h, true);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9;';
    treeScene.insertBefore(canvas, treeScene.firstChild);

    /* ---- env map ---- */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envS = new THREE.Scene();
    envS.background = new THREE.Color(0xddeeff);
    var envMap = pmrem.fromScene(envS, 0.04).texture;
    pmrem.dispose();

    /* ---- lighting ---- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var sun = new THREE.DirectionalLight(0xfff8e0, 1.0);
    sun.position.set(6, 10, 8);
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0xb0d0ff, 0.3);
    fill.position.set(-5, 3, 6);
    scene.add(fill);

    /* ── Kite colour palette (matches 3 original SVGs) ── */
    var kitePalette = [
      { face: 0xFF6B6B, highlight: 0xFFE66D, shadow: 0xD94F4F, sticks: 0x8B6914, bow1: 0x4ECDC4, bow2: 0xFFE66D, bow3: 0xFF6B6B, center: 0xffffff },
      { face: 0x45B7D1, highlight: 0x7EDDD6, shadow: 0x2D8BA5, sticks: 0x8B6914, bow1: 0xA78BFA, bow2: 0x6BCB77, bow3: 0x45B7D1, center: 0xffffff },
      { face: 0xA78BFA, highlight: 0xC4B5FD, shadow: 0x7C5CC5, sticks: 0x8B6914, bow1: 0xF472B6, bow2: 0xFFE66D, bow3: 0xA78BFA, center: 0xffffff },
    ];

    /* ── Build one 3D kite ── */
    function makeKite(pal, scale) {
      var group = new THREE.Group();

      function mat(c, opts) {
        var o = opts || {};
        return new THREE.MeshStandardMaterial({
          color: c,
          metalness: o.metalness || 0.05,
          roughness: o.roughness || 0.55,
          envMap: envMap,
          side: o.double ? THREE.DoubleSide : THREE.FrontSide,
          transparent: !!o.opacity,
          opacity: o.opacity || 1,
        });
      }

      // ── Diamond body (two triangular faces) ──
      // Top-right triangle
      var trShape = new THREE.Shape();
      trShape.moveTo(0, 1.6);    // top tip
      trShape.lineTo(1.0, 0.3);  // right corner
      trShape.lineTo(0, 0);      // center
      trShape.closePath();
      var trGeo = new THREE.ExtrudeGeometry(trShape, { depth: 0.04, bevelEnabled: false });
      var trMesh = new THREE.Mesh(trGeo, mat(pal.highlight, { double: true, opacity: 0.85 }));
      group.add(trMesh);

      // Top-left triangle
      var tlShape = new THREE.Shape();
      tlShape.moveTo(0, 1.6);
      tlShape.lineTo(-1.0, 0.3);
      tlShape.lineTo(0, 0);
      tlShape.closePath();
      var tlGeo = new THREE.ExtrudeGeometry(tlShape, { depth: 0.04, bevelEnabled: false });
      var tlMesh = new THREE.Mesh(tlGeo, mat(pal.face, { double: true }));
      group.add(tlMesh);

      // Bottom-right triangle
      var brShape = new THREE.Shape();
      brShape.moveTo(0, 0);
      brShape.lineTo(1.0, 0.3);
      brShape.lineTo(0, -1.2);
      brShape.closePath();
      var brGeo = new THREE.ExtrudeGeometry(brShape, { depth: 0.04, bevelEnabled: false });
      var brMesh = new THREE.Mesh(brGeo, mat(pal.face, { double: true }));
      group.add(brMesh);

      // Bottom-left triangle
      var blShape = new THREE.Shape();
      blShape.moveTo(0, 0);
      blShape.lineTo(-1.0, 0.3);
      blShape.lineTo(0, -1.2);
      blShape.closePath();
      var blGeo = new THREE.ExtrudeGeometry(blShape, { depth: 0.04, bevelEnabled: false });
      var blMesh = new THREE.Mesh(blGeo, mat(pal.shadow, { double: true, opacity: 0.7 }));
      group.add(blMesh);

      // ── Cross sticks ──
      var stickMat = mat(pal.sticks, { roughness: 0.7, metalness: 0.02 });
      // Vertical stick
      var vStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.85, 6),
        stickMat
      );
      vStick.position.set(0, 0.2, 0.025);
      group.add(vStick);

      // Horizontal stick
      var hStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 2.05, 6),
        stickMat
      );
      hStick.rotation.z = Math.PI / 2;
      hStick.position.set(0, 0.3, 0.025);
      group.add(hStick);

      // ── Center decoration ──
      var centerDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        mat(pal.center, { roughness: 0.3, opacity: 0.8 })
      );
      centerDot.position.set(0, 0.3, 0.05);
      group.add(centerDot);

      // ── String (curved line going down) ──
      var stringPts = [];
      for (var si = 0; si <= 20; si++) {
        var st = si / 20;
        var sx = Math.sin(st * Math.PI * 2) * 0.08;
        var sy = -1.2 - st * 2.2;
        stringPts.push(new THREE.Vector3(sx, sy, 0));
      }
      var stringCurve = new THREE.CatmullRomCurve3(stringPts);
      var stringGeo = new THREE.TubeGeometry(stringCurve, 20, 0.012, 4, false);
      var stringMesh = new THREE.Mesh(stringGeo, mat(0x555555, { roughness: 0.8 }));
      group.add(stringMesh);

      // ── Tail bows (3 small ribbon shapes) ──
      var bowColors = [pal.bow1, pal.bow2, pal.bow3];
      for (var bi = 0; bi < 3; bi++) {
        var bowGroup = new THREE.Group();
        var bowMat1 = mat(bowColors[bi], { double: true });

        // Left ribbon half
        var lbShape = new THREE.Shape();
        lbShape.moveTo(0, 0);
        lbShape.quadraticCurveTo(-0.2, 0.08, -0.28, 0);
        lbShape.quadraticCurveTo(-0.2, -0.08, 0, 0);
        var lbGeo = new THREE.ExtrudeGeometry(lbShape, { depth: 0.02, bevelEnabled: false });
        var lb = new THREE.Mesh(lbGeo, bowMat1);
        bowGroup.add(lb);

        // Right ribbon half
        var rbShape = new THREE.Shape();
        rbShape.moveTo(0, 0);
        rbShape.quadraticCurveTo(0.2, 0.08, 0.28, 0);
        rbShape.quadraticCurveTo(0.2, -0.08, 0, 0);
        var rbGeo = new THREE.ExtrudeGeometry(rbShape, { depth: 0.02, bevelEnabled: false });
        var rb = new THREE.Mesh(rbGeo, bowMat1);
        bowGroup.add(rb);

        // Center knot
        var knot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), bowMat1);
        bowGroup.add(knot);

        var bowy = -1.6 - bi * 0.9;
        bowGroup.position.set(0, bowy, 0);
        bowGroup.userData.baseY = bowy;
        bowGroup.userData.idx = bi;
        group.add(bowGroup);
      }

      group.scale.setScalar(scale);

      return { group: group };
    }

    /* ── Kite flight data ── */
    var KITE_COUNT = MOBILE ? 2 : 3;
    var kiteScales = [0.55, 0.45, 0.35];

    // More waypoints for longer, more random-feeling loops
    var kitePaths = [
      // Kite 1 — wanders broadly across mid-left to mid-right
      [
        { x: -8, y: 3, z: -3 }, { x: -4, y: 6, z: -5 }, { x: 1, y: 2, z: -2 },
        { x: 5, y: 7, z: -4 }, { x: 9, y: 4, z: -6 }, { x: 6, y: 8, z: -3 },
        { x: 0, y: 5, z: -5 }, { x: -5, y: 8, z: -2 }, { x: -9, y: 5, z: -4 },
        { x: -3, y: 2, z: -6 },
      ],
      // Kite 2 — wanders right side to center, irregular heights
      [
        { x: 10, y: 6, z: -4 }, { x: 6, y: 3, z: -6 }, { x: 2, y: 7, z: -3 },
        { x: -4, y: 4, z: -5 }, { x: -8, y: 7, z: -4 }, { x: -5, y: 3, z: -6 },
        { x: 1, y: 8, z: -3 }, { x: 7, y: 5, z: -5 }, { x: 12, y: 8, z: -4 },
        { x: 8, y: 4, z: -3 },
      ],
      // Kite 3 — smaller, far back, high and drifty
      [
        { x: 11, y: 9, z: -8 }, { x: 5, y: 11, z: -7 }, { x: -2, y: 8, z: -9 },
        { x: -8, y: 11, z: -7 }, { x: -11, y: 9, z: -8 }, { x: -6, y: 12, z: -6 },
        { x: 0, y: 10, z: -9 }, { x: 7, y: 12, z: -7 }, { x: 12, y: 10, z: -8 },
        { x: 9, y: 8, z: -7 },
      ],
    ];

    var kiteSpeeds = [0.012, 0.010, 0.014];
    var kites = [];

    for (var i = 0; i < KITE_COUNT; i++) {
      var kite = makeKite(kitePalette[i], kiteScales[i]);
      var wp = kitePaths[i];
      var kData = {
        mesh: kite,
        waypoints: wp,
        progress: Math.random(),
        speed: kiteSpeeds[i],
        tiltSmooth: { x: 0, z: 0 },
        prevPos: new THREE.Vector3(wp[0].x, wp[0].y, wp[0].z),
      };
      kite.group.position.set(wp[0].x, wp[0].y, wp[0].z);
      scene.add(kite.group);
      kites.push(kData);
    }

    /* ── Catmull-Rom interpolation ── */
    function catmullRom(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }

    function getPathPoint(waypoints, progress) {
      var n = waypoints.length;
      var totalT = progress * n;
      var seg = Math.floor(totalT) % n;
      var localT = totalT - Math.floor(totalT);
      var p0 = waypoints[(seg - 1 + n) % n];
      var p1 = waypoints[seg % n];
      var p2 = waypoints[(seg + 1) % n];
      var p3 = waypoints[(seg + 2) % n];
      return {
        x: catmullRom(p0.x, p1.x, p2.x, p3.x, localT),
        y: catmullRom(p0.y, p1.y, p2.y, p3.y, localT),
        z: catmullRom(p0.z, p1.z, p2.z, p3.z, localT),
      };
    }

    /* ── Animation ── */
    var running = false, raf = 0;
    var clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      var dt = clock.getDelta();
      var t = clock.getElapsedTime();

      for (var i = 0; i < kites.length; i++) {
        var kd = kites[i];
        var m = kd.mesh;

        // advance along path
        kd.progress += kd.speed * dt;
        if (kd.progress > 1) kd.progress -= 1;

        var pt = getPathPoint(kd.waypoints, kd.progress);

        // multi-frequency wind sway for organic randomness
        var ph = i * 2.37;
        var swayX = Math.sin(t * 0.25 + ph) * 0.35
                  + Math.sin(t * 0.63 + ph * 1.4) * 0.18
                  + Math.sin(t * 1.41 + ph * 0.7) * 0.08;
        var swayY = Math.sin(t * 0.19 + ph * 1.1) * 0.25
                  + Math.sin(t * 0.52 + ph * 0.6) * 0.12
                  + Math.cos(t * 1.15 + ph * 1.3) * 0.06;
        var swayZ = Math.sin(t * 0.31 + ph * 0.9) * 0.15;
        m.group.position.set(pt.x + swayX, pt.y + swayY, pt.z + swayZ);

        // ── Tilt / wobble like a real kite ──
        var dx = m.group.position.x - kd.prevPos.x;
        var dy = m.group.position.y - kd.prevPos.y;

        // multi-layer wind-driven tilt for natural randomness
        var windTiltX = Math.sin(t * 0.7 + ph * 2.1) * 0.12
                      + Math.sin(t * 1.6 + ph) * 0.08
                      + Math.sin(t * 3.1 + ph * 0.5) * 0.04;
        var windTiltZ = Math.sin(t * 0.55 + ph * 1.8) * 0.14
                      + Math.cos(t * 1.3 + ph * 1.2) * 0.09
                      + Math.sin(t * 2.7 + ph * 0.8) * 0.05;

        // motion-reactive tilt
        var motionTiltX = -dy * 1.5;
        var motionTiltZ = dx * 1.2;

        var targetTiltX = windTiltX + motionTiltX;
        var targetTiltZ = windTiltZ + motionTiltZ;

        // very smooth tilt lerp
        kd.tiltSmooth.x = lerp(kd.tiltSmooth.x, targetTiltX, 1.6 * dt);
        kd.tiltSmooth.z = lerp(kd.tiltSmooth.z, targetTiltZ, 1.6 * dt);

        m.group.rotation.x = kd.tiltSmooth.x;
        m.group.rotation.z = kd.tiltSmooth.z;

        // gentle yaw wander
        m.group.rotation.y = Math.sin(t * 0.35 + ph * 1.5) * 0.10
                           + Math.sin(t * 0.82 + ph) * 0.05;

        kd.prevPos.copy(m.group.position);

        // animate tail bows — each sways independently with layered frequencies
        m.group.children.forEach(function (child) {
          if (child.userData.baseY !== undefined) {
            var bi = child.userData.idx;
            var bp = bi * 1.5 + i * 2;
            var bowSway = Math.sin(t * 2.2 + bp) * 0.18
                        + Math.sin(t * 4.1 + bp * 0.7) * 0.08;
            var bowSwing = Math.sin(t * 1.6 + bp * 1.3) * 0.22
                         + Math.cos(t * 3.3 + bp * 0.5) * 0.09;
            child.rotation.z = bowSway;
            child.rotation.x = bowSwing;
            child.position.x = Math.sin(t * 1.8 + bp * 1.1) * 0.07
                              + Math.sin(t * 3.5 + bp * 0.6) * 0.03;
          }
        });
      }

      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; clock.start(); animate(); }
      } else {
        running = false; cancelAnimationFrame(raf);
      }
    }, { threshold: 0.02 });
    obs.observe(treeScene);

    window.addEventListener('resize', function () {
      var nw = treeScene.offsetWidth, nh = treeScene.offsetHeight;
      cam.aspect = nw / nh; cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ═══════════════════════════════════════════
     BOOT ALL EFFECTS
     ═══════════════════════════════════════════ */
  function bootAll() {
    initPageHero();
    initSchoolPhotoDepth();
    initPrincipalDepth();
    initTeacherTiles();
    initTreeFireflies();
    initHighlightBook();
    initFooterWave();
    initKites3D();
  }

  // Slight delay so DOM is fully rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootAll, 200); });
  } else {
    setTimeout(bootAll, 200);
  }
})();
