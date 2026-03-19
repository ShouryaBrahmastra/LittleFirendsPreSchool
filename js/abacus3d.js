/* ============================================
   Three.js 3D Chinese Suanpan Abacus
   2 heaven beads | divider | 4 earth beads × 9 rods
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ── Constants ── */
  var NUM_RODS = 9;
  var HEAVEN_BEADS = 2;    // top section
  var EARTH_BEADS = 4;     // bottom section
  var ROD_SPACING = 0.48;
  var BEAD_RADIUS = 0.15;
  var BEAD_GAP = 0.34;     // vertical spacing between beads
  var ROD_RADIUS = 0.025;
  var FRAME_W = (NUM_RODS - 1) * ROD_SPACING + 1.2;
  var FRAME_H = 3.6;
  var FRAME_D = 0.22;
  var RAIL_THICK = 0.14;
  var DIVIDER_Y = 0.55;    // Y position of the divider bar

  function boot() {
    var wrap = document.getElementById('abacusCubeWrap');
    if (!wrap) return;

    var W = wrap.clientWidth || 400;
    var H = wrap.clientHeight || 380;

    /* ── Renderer ── */
    var canvas = document.getElementById('abacusCubeCanvas');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ── Scene & Camera ── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    camera.position.set(0, 1.2, 9);
    camera.lookAt(0, 0, 0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.6));
    var key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(4, 5, 6);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffeedd, 1.0);
    fill.position.set(-3, 3, 4);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffc880, 0.6);
    rim.position.set(0, -2, -3);
    scene.add(rim);
    var spot = new THREE.PointLight(0xffffff, 1.5, 15);
    spot.position.set(0, 4, 5);
    scene.add(spot);

    /* ── Environment map ── */
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x2c2418);
    var e1 = new THREE.PointLight(0xffc880, 8, 10); e1.position.set(3, 3, 3); envScene.add(e1);
    var e2 = new THREE.PointLight(0xffffff, 10, 12); e2.position.set(-2, 4, 2); envScene.add(e2);
    var e3 = new THREE.PointLight(0xff9966, 6, 10); e3.position.set(0, -2, 4); envScene.add(e3);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmrem.dispose();

    /* ── Materials ── */
    // Yellow wooden frame
    var matWoodFrame = new THREE.MeshStandardMaterial({
      color: 0xD4A843,
      metalness: 0.05,
      roughness: 0.55,
      envMapIntensity: 0.4
    });

    var matWoodDark = new THREE.MeshStandardMaterial({
      color: 0xBB9530,
      metalness: 0.05,
      roughness: 0.5,
      envMapIntensity: 0.4
    });

    // Metallic rod
    var matRod = new THREE.MeshStandardMaterial({
      color: 0xB0A080,
      metalness: 0.85,
      roughness: 0.12,
      envMapIntensity: 1.5
    });

    // Metallic shiny brown bead
    var matBead = new THREE.MeshStandardMaterial({
      color: 0x6B3A1F,
      metalness: 0.6,
      roughness: 0.12,
      envMapIntensity: 1.8
    });

    /* ── Build abacus group ── */
    var abacusGroup = new THREE.Group();
    scene.add(abacusGroup);

    var halfW = FRAME_W / 2;
    var halfH = FRAME_H / 2;

    /* ── Rounded bar helper ── */
    function makeRoundedBar(w, h, d, r) {
      var shape = new THREE.Shape();
      var hw = w / 2, hh = h / 2;
      r = Math.min(r, hw, hh);
      shape.moveTo(-hw + r, -hh);
      shape.lineTo(hw - r, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
      shape.lineTo(hw, hh - r);
      shape.quadraticCurveTo(hw, hh, hw - r, hh);
      shape.lineTo(-hw + r, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
      shape.lineTo(-hw, -hh + r);
      shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      var geom = new THREE.ExtrudeGeometry(shape, {
        depth: d, bevelEnabled: false, curveSegments: 10
      });
      geom.translate(0, 0, -d / 2);
      return geom;
    }

    var ROUND = 0.06; // corner radius for frame pieces

    // Top rail
    var hRailGeom = makeRoundedBar(FRAME_W + RAIL_THICK, RAIL_THICK, FRAME_D, ROUND);
    var topRail = new THREE.Mesh(hRailGeom, matWoodDark);
    topRail.position.set(0, halfH, 0);
    abacusGroup.add(topRail);

    // Bottom rail
    var bottomRail = new THREE.Mesh(hRailGeom, matWoodDark);
    bottomRail.position.set(0, -halfH, 0);
    abacusGroup.add(bottomRail);

    // Divider bar (horizontal separator between heaven & earth)
    var dividerGeom = makeRoundedBar(FRAME_W + RAIL_THICK, RAIL_THICK * 0.8, FRAME_D, ROUND * 0.7);
    var divider = new THREE.Mesh(dividerGeom, matWoodDark);
    divider.position.set(0, DIVIDER_Y, 0);
    abacusGroup.add(divider);

    // Left post
    var postGeom = makeRoundedBar(RAIL_THICK, FRAME_H + RAIL_THICK, FRAME_D, ROUND);
    var leftPost = new THREE.Mesh(postGeom, matWoodFrame);
    leftPost.position.set(-halfW, 0, 0);
    abacusGroup.add(leftPost);

    // Right post
    var rightPost = new THREE.Mesh(postGeom, matWoodFrame);
    rightPost.position.set(halfW, 0, 0);
    abacusGroup.add(rightPost);

    /* ── Rods & Beads ── */
    var rodStartX = -((NUM_RODS - 1) * ROD_SPACING) / 2;
    var rodGeom = new THREE.CylinderGeometry(ROD_RADIUS, ROD_RADIUS, FRAME_H - RAIL_THICK * 0.5, 16);

    // Flattened sphere for beads (disc/lenticular shape)
    var beadGeom = new THREE.SphereGeometry(BEAD_RADIUS, 24, 16);
    beadGeom.scale(1.1, 0.65, 1.1);

    // Data: per rod, heaven beads and earth beads stored separately
    // heavenBeads[rod][0..1], earthBeads[rod][0..3]
    var heavenBeads = []; // { mesh, restY, activeY }
    var earthBeads = [];
    // State: heavenState[rod] = 0..2 (how many heaven beads touching divider)
    //        earthState[rod]  = 0..4 (how many earth beads touching divider)
    var heavenState = [];
    var earthState = [];

    // Positions
    var topInner = halfH - RAIL_THICK / 2 - BEAD_RADIUS * 0.65 - 0.08;
    var dividerTop = DIVIDER_Y + RAIL_THICK * 0.4 + BEAD_RADIUS * 0.65 + 0.08;
    var dividerBot = DIVIDER_Y - RAIL_THICK * 0.4 - BEAD_RADIUS * 0.65 - 0.08;
    var botInner = -halfH + RAIL_THICK / 2 + BEAD_RADIUS * 0.65 + 0.08;

    for (var r = 0; r < NUM_RODS; r++) {
      var rx = rodStartX + r * ROD_SPACING;

      // Rod
      var rod = new THREE.Mesh(rodGeom, matRod);
      rod.position.set(rx, 0, 0);
      abacusGroup.add(rod);

      // Heaven beads (2) — rest at top, active = touching divider
      var hBeads = [];
      for (var h = 0; h < HEAVEN_BEADS; h++) {
        var hMesh = new THREE.Mesh(beadGeom, matBead);
        var restY = topInner - h * BEAD_GAP;
        var activeY = dividerTop + (HEAVEN_BEADS - 1 - h) * BEAD_GAP;
        hMesh.position.set(rx, restY, 0);
        abacusGroup.add(hMesh);
        hBeads.push({ mesh: hMesh, restY: restY, activeY: activeY });
      }
      heavenBeads.push(hBeads);
      heavenState.push(0);

      // Earth beads (4) — rest at bottom, active = touching divider
      var eBeads = [];
      for (var eb = 0; eb < EARTH_BEADS; eb++) {
        var eMesh = new THREE.Mesh(beadGeom, matBead);
        var eRestY = botInner + (EARTH_BEADS - 1 - eb) * BEAD_GAP;
        var eActiveY = dividerBot - eb * BEAD_GAP;
        eMesh.position.set(rx, eRestY, 0);
        abacusGroup.add(eMesh);
        eBeads.push({ mesh: eMesh, restY: eRestY, activeY: eActiveY });
      }
      earthBeads.push(eBeads);
      earthState.push(0);
    }

    /* ── Number display (HTML overlay) ── */
    var displayEl = document.getElementById('abacusDisplay');

    function computeValue() {
      // Each rod: heaven beads active × 5 + earth beads active
      // Rod 0 = highest place value
      var val = 0;
      for (var r = 0; r < NUM_RODS; r++) {
        var digit = heavenState[r] * 5 + earthState[r];
        val = val * 10 + digit;
      }
      return val;
    }

    function updateDisplay() {
      if (!displayEl) return;
      displayEl.textContent = computeValue().toString();
    }

    /* ── Bead animation system ── */
    var beadAnimations = [];
    var animClock = new THREE.Clock();

    function queueAnim(mesh, endY, duration) {
      // Remove existing anim for this mesh
      for (var i = beadAnimations.length - 1; i >= 0; i--) {
        if (beadAnimations[i].mesh === mesh) beadAnimations.splice(i, 1);
      }
      beadAnimations.push({
        mesh: mesh,
        startY: mesh.position.y,
        endY: endY,
        startTime: animClock.getElapsedTime(),
        duration: duration || 0.25
      });
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function updateBeadAnimations() {
      var now = animClock.getElapsedTime();
      for (var i = beadAnimations.length - 1; i >= 0; i--) {
        var a = beadAnimations[i];
        var elapsed = now - a.startTime;
        var progress = Math.min(elapsed / a.duration, 1);
        var eased = easeInOutCubic(progress);
        a.mesh.position.y = a.startY + (a.endY - a.startY) * eased;
        if (progress >= 1) {
          a.mesh.position.y = a.endY;
          beadAnimations.splice(i, 1);
        }
      }
    }

    /* ── Set rod value with animation ── */
    function setRodValue(rodIdx, heavenCount, earthCount) {
      heavenState[rodIdx] = heavenCount;
      earthState[rodIdx] = earthCount;

      // Animate heaven beads
      for (var h = 0; h < HEAVEN_BEADS; h++) {
        var hb = heavenBeads[rodIdx][h];
        var active = h >= (HEAVEN_BEADS - heavenCount);
        queueAnim(hb.mesh, active ? hb.activeY : hb.restY, 0.3);
      }

      // Animate earth beads
      for (var e = 0; e < EARTH_BEADS; e++) {
        var eb = earthBeads[rodIdx][e];
        var eActive = e < earthCount;
        queueAnim(eb.mesh, eActive ? eb.activeY : eb.restY, 0.3);
      }
    }

    function setRodDigit(rodIdx, digit) {
      // digit 0-9: heaven = floor(digit/5), earth = digit % 5
      var hc = Math.floor(Math.min(digit, 9) / 5);
      var ec = Math.min(digit, 9) % 5;
      setRodValue(rodIdx, hc, ec);
    }

    /* ── Automated counting cycle ── */
    var running = false;

    function sleep(ms) {
      return new Promise(function (r) { setTimeout(r, ms); });
    }

    async function showNumber(target) {
      // Convert to 9 digits (zero-padded)
      var str = String(target).padStart(NUM_RODS, '0');
      // Animate from right to left (ones → highest)
      for (var i = NUM_RODS - 1; i >= 0; i--) {
        if (!running) return;
        var d = parseInt(str.charAt(i), 10) || 0;
        setRodDigit(i, d);
        updateDisplay();
        await sleep(180);
      }
    }

    async function resetAll() {
      for (var i = 0; i < NUM_RODS; i++) {
        if (!running) return;
        setRodDigit(i, 0);
        await sleep(80);
      }
      updateDisplay();
    }

    async function cycle() {
      running = true;
      await sleep(1000);
      while (running) {
        // Show a random number (up to 9 digits, interesting values)
        var target = Math.floor(Math.random() * 999999999);
        await showNumber(target);
        await sleep(2500);
        if (!running) return;
        await resetAll();
        await sleep(1500);
      }
    }

    /* ── Mouse hover tilt ── */
    var mouseX = 0, mouseY = 0, tgtMX = 0, tgtMY = 0;
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      tgtMX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tgtMY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    wrap.addEventListener('mouseleave', function () {
      tgtMX = 0; tgtMY = 0;
    });

    /* ── Render loop ── */
    function animate() {
      requestAnimationFrame(animate);
      animClock.getDelta();

      mouseX += (tgtMX - mouseX) * 0.05;
      mouseY += (tgtMY - mouseY) * 0.05;

      abacusGroup.rotation.y = mouseX * 0.2;
      abacusGroup.rotation.x = -mouseY * 0.1;

      updateBeadAnimations();
      renderer.render(scene, camera);
    }

    animate();

    /* ── Start on scroll ── */
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !running) {
        cycle();
      } else if (!entries[0].isIntersecting && running) {
        running = false;
        // Reset silently
        for (var r = 0; r < NUM_RODS; r++) {
          heavenState[r] = 0;
          earthState[r] = 0;
          for (var h = 0; h < HEAVEN_BEADS; h++) {
            heavenBeads[r][h].mesh.position.y = heavenBeads[r][h].restY;
          }
          for (var e = 0; e < EARTH_BEADS; e++) {
            earthBeads[r][e].mesh.position.y = earthBeads[r][e].restY;
          }
        }
        updateDisplay();
      }
    }, { threshold: 0.2 });
    obs.observe(wrap);

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = wrap.clientWidth || 400;
      H = wrap.clientHeight || 380;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  setTimeout(boot, 200);
})();
