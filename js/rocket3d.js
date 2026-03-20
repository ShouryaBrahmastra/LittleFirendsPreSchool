/* ================================================================
   Hyper-Realistic 3D Rocket — Back-to-Top Button
   Premium cinematic rocket with launch animation
   ================================================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ── Constants ── */
  var PR      = Math.min(window.devicePixelRatio || 1, 2);
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 80, H = 100;

  /* ── State ── */
  var renderer, scene, camera, rocketGroup, flameGroup, heatGlow, clock;
  var exhaustLight, nozzleGlowRing;
  var smokeParticles  = [];
  var sparkParticles  = [];
  var flameData       = [];
  var running         = false;
  var hovered         = false;
  var launching       = false;
  var launchT         = 0;
  var launchPhase     = '';
  var mouseX          = 0;
  var mouseY          = 0;
  var idleBaseY       = 0;

  /* ── Easing helpers ── */
  function easeInQuad(t)   { return t * t; }
  function easeInBack(t)   { var c = 1.70158; return (c + 1) * t * t * t - c * t * t; }

  /* ── Noise-like variation using multiple sin waves ── */
  function turbulence(t, seed) {
    return Math.sin(t * 7.3 + seed) * 0.4
         + Math.sin(t * 13.7 + seed * 2.1) * 0.3
         + Math.sin(t * 23.1 + seed * 0.7) * 0.2
         + Math.sin(t * 41.9 + seed * 3.3) * 0.1;
  }

  function init() {
    var container = document.querySelector('.back-to-top-3d');
    if (!container) return;

    /* ── Renderer ── */
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(PR);
    renderer.setSize(W, H);
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace   = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 80);
    camera.position.set(0, 0.15, 6.2);
    camera.lookAt(0, 0.05, 0);

    /* ── Lighting Rig — cinematic 4-point ── */
    scene.add(new THREE.AmbientLight(0xc8d0e0, 0.45));

    var key = new THREE.DirectionalLight(0xfff8f0, 2.4);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xffd0b8, 0.65);
    fill.position.set(-4, 2, 4);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0x8899cc, 0.55);
    rim.position.set(0, -3, -4);
    scene.add(rim);

    var top = new THREE.DirectionalLight(0xeeeeff, 0.35);
    top.position.set(0, 8, 0);
    scene.add(top);

    // Dynamic exhaust point-light
    exhaustLight = new THREE.PointLight(0xff5500, 0, 5, 2);
    exhaustLight.position.set(0, -1.6, 0);
    scene.add(exhaustLight);

    /* ── Environment Map ── */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xd8dce4);
    var e1 = new THREE.PointLight(0xffffff, 14, 16); e1.position.set(4, 6, 4);  envScene.add(e1);
    var e2 = new THREE.PointLight(0xff7744, 7, 12);  e2.position.set(-4, 2, -3); envScene.add(e2);
    var e3 = new THREE.PointLight(0x6688cc, 6, 12);  e3.position.set(0, -5, 5);  envScene.add(e3);
    var e4 = new THREE.PointLight(0xffddaa, 4, 10);  e4.position.set(2, -3, -4); envScene.add(e4);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmrem.dispose();

    /* ── Build ── */
    rocketGroup = new THREE.Group();
    scene.add(rocketGroup);

    buildRocket(envMap);
    buildExhaust();
    buildSmokeSystem();
    buildSparkSystem();

    clock = new THREE.Clock();
    startLoop();
  }

  /* ════════════════════════════════════════════════════════════════
     ROCKET — Hyper-realistic lathe body with surface detail
     ════════════════════════════════════════════════════════════════ */
  function buildRocket(envMap) {

    /* ── Materials ── */
    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0ede8, metalness: 0.25, roughness: 0.20,
      clearcoat: 0.6, clearcoatRoughness: 0.12,
      envMapIntensity: 1.4, envMap: envMap
    });

    var noseMat = new THREE.MeshPhysicalMaterial({
      color: 0xbb1515, metalness: 0.3, roughness: 0.15,
      clearcoat: 0.7, clearcoatRoughness: 0.08,
      envMapIntensity: 1.3, envMap: envMap
    });

    var darkMetal = new THREE.MeshPhysicalMaterial({
      color: 0x1e1e28, metalness: 0.85, roughness: 0.18,
      clearcoat: 0.3, clearcoatRoughness: 0.25,
      envMapIntensity: 1.8, envMap: envMap
    });

    var chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0, metalness: 0.95, roughness: 0.06,
      envMapIntensity: 2.2, envMap: envMap
    });

    var wornMetal = new THREE.MeshPhysicalMaterial({
      color: 0x888890, metalness: 0.6, roughness: 0.35,
      clearcoat: 0.15, clearcoatRoughness: 0.4,
      envMapIntensity: 1.0, envMap: envMap
    });

    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x77bbee, metalness: 0.05, roughness: 0.03,
      transparent: true, opacity: 0.5,
      transmission: 0.7, thickness: 0.12,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
      envMapIntensity: 3.0, envMap: envMap,
      side: THREE.DoubleSide
    });

    /* ── Body — smooth aerodynamic lathe profile ── */
    var bp = [];
    bp.push(new THREE.Vector2(0.000, 1.90));
    bp.push(new THREE.Vector2(0.030, 1.82));
    bp.push(new THREE.Vector2(0.080, 1.70));
    bp.push(new THREE.Vector2(0.150, 1.55));
    bp.push(new THREE.Vector2(0.250, 1.35));
    bp.push(new THREE.Vector2(0.360, 1.12));
    bp.push(new THREE.Vector2(0.440, 0.90));
    bp.push(new THREE.Vector2(0.490, 0.70));
    bp.push(new THREE.Vector2(0.500, 0.50));
    bp.push(new THREE.Vector2(0.500, 0.30));
    bp.push(new THREE.Vector2(0.500, 0.10));
    bp.push(new THREE.Vector2(0.500, -0.10));
    bp.push(new THREE.Vector2(0.500, -0.30));
    bp.push(new THREE.Vector2(0.500, -0.50));
    bp.push(new THREE.Vector2(0.500, -0.70));
    bp.push(new THREE.Vector2(0.490, -0.80));
    bp.push(new THREE.Vector2(0.470, -0.88));
    bp.push(new THREE.Vector2(0.440, -0.94));
    bp.push(new THREE.Vector2(0.400, -1.00));
    bp.push(new THREE.Vector2(0.350, -1.05));

    var bodyGeom = new THREE.LatheGeometry(bp, 64);
    var body = new THREE.Mesh(bodyGeom, bodyMat);
    rocketGroup.add(body);

    /* ── Red Nose Cap ── */
    var np = [];
    np.push(new THREE.Vector2(0.000, 1.91));
    np.push(new THREE.Vector2(0.031, 1.83));
    np.push(new THREE.Vector2(0.082, 1.71));
    np.push(new THREE.Vector2(0.152, 1.56));
    np.push(new THREE.Vector2(0.252, 1.36));
    np.push(new THREE.Vector2(0.362, 1.13));
    np.push(new THREE.Vector2(0.445, 0.91));
    np.push(new THREE.Vector2(0.495, 0.71));
    np.push(new THREE.Vector2(0.505, 0.55));
    np.push(new THREE.Vector2(0.000, 0.55));
    var noseGeom = new THREE.LatheGeometry(np, 64);
    var nose = new THREE.Mesh(noseGeom, noseMat);
    rocketGroup.add(nose);

    /* ── Worn panel / scratch bands ── */
    var wornBandGeom = new THREE.CylinderGeometry(0.508, 0.508, 0.025, 64);
    var wornPositions = [0.10, -0.05, -0.20, -0.35, -0.50, -0.65];
    for (var wi = 0; wi < wornPositions.length; wi++) {
      var wb = new THREE.Mesh(wornBandGeom, wi % 2 === 0 ? wornMetal : chromeMat);
      wb.position.y = wornPositions[wi];
      rocketGroup.add(wb);
    }

    /* ── Red stripe bands ── */
    var stripeGeom = new THREE.CylinderGeometry(0.516, 0.516, 0.05, 64);
    var s1 = new THREE.Mesh(stripeGeom, noseMat);
    s1.position.y = -0.28;
    rocketGroup.add(s1);
    var s2 = new THREE.Mesh(stripeGeom.clone(), noseMat);
    s2.position.y = -0.58;
    rocketGroup.add(s2);

    /* ── Chrome panel-line rings ── */
    var lineGeom = new THREE.TorusGeometry(0.507, 0.006, 8, 64);
    var lineYs = [0.50, 0.30, 0.00, -0.30, -0.60, -0.80];
    for (var li = 0; li < lineYs.length; li++) {
      var ln = new THREE.Mesh(lineGeom, chromeMat);
      ln.rotation.x = Math.PI / 2;
      ln.position.y = lineYs[li];
      rocketGroup.add(ln);
    }

    /* ── Rivets — two rows ── */
    var rivetGeom = new THREE.SphereGeometry(0.012, 8, 8);
    var rivetRows = [0.00, -0.60];
    for (var ri = 0; ri < rivetRows.length; ri++) {
      var count = 16;
      for (var rj = 0; rj < count; rj++) {
        var a = (rj / count) * Math.PI * 2;
        var rv = new THREE.Mesh(rivetGeom, chromeMat);
        rv.position.set(Math.sin(a) * 0.514, rivetRows[ri], Math.cos(a) * 0.514);
        rocketGroup.add(rv);
      }
    }

    /* ── Porthole Window ── */
    var ringGeom = new THREE.TorusGeometry(0.17, 0.032, 16, 40);
    var ring = new THREE.Mesh(ringGeom, chromeMat);
    ring.position.set(0, -0.05, 0.50);
    rocketGroup.add(ring);
    var bezelGeom = new THREE.TorusGeometry(0.14, 0.012, 12, 40);
    var bezel = new THREE.Mesh(bezelGeom, darkMetal);
    bezel.position.set(0, -0.05, 0.52);
    rocketGroup.add(bezel);
    var glass = new THREE.Mesh(new THREE.CircleGeometry(0.13, 40), glassMat);
    glass.position.set(0, -0.05, 0.525);
    rocketGroup.add(glass);
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    var hl = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), hlMat);
    hl.position.set(-0.04, 0.01, 0.535);
    rocketGroup.add(hl);
    var hl2 = new THREE.Mesh(new THREE.CircleGeometry(0.015, 12), hlMat.clone());
    hl2.material.opacity = 0.5;
    hl2.position.set(0.04, -0.11, 0.535);
    rocketGroup.add(hl2);

    /* ── "BACK TO TOP" text on nose cone — canvas texture ── */
    var texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    var ctx = texCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    ctx.font = '900 120px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff2222';
    ctx.fillText('BACK', 256, 140);
    ctx.fillText('TO', 256, 270);
    ctx.fillText('TOP', 256, 400);
    var textTex = new THREE.CanvasTexture(texCanvas);
    textTex.needsUpdate = true;
    var textMat = new THREE.MeshBasicMaterial({
      map: textTex, transparent: true, depthWrite: false, side: THREE.FrontSide
    });
    var textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), textMat);
    textPlane.position.set(0, 0.60, 0.47);
    rocketGroup.add(textPlane);

    /* ── Engine Bell / Nozzle ── */
    var nzp = [];
    nzp.push(new THREE.Vector2(0.18, 0.00));
    nzp.push(new THREE.Vector2(0.19, -0.02));
    nzp.push(new THREE.Vector2(0.21, -0.06));
    nzp.push(new THREE.Vector2(0.24, -0.10));
    nzp.push(new THREE.Vector2(0.28, -0.15));
    nzp.push(new THREE.Vector2(0.33, -0.22));
    nzp.push(new THREE.Vector2(0.37, -0.28));
    nzp.push(new THREE.Vector2(0.40, -0.33));
    nzp.push(new THREE.Vector2(0.41, -0.35));
    var nozzleGeom = new THREE.LatheGeometry(nzp, 40);
    var nozzle = new THREE.Mesh(nozzleGeom, darkMetal);
    nozzle.position.y = -1.05;
    rocketGroup.add(nozzle);

    // Nozzle chrome lip
    var lipGeom = new THREE.TorusGeometry(0.41, 0.012, 12, 40);
    var lip = new THREE.Mesh(lipGeom, chromeMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = -1.40;
    rocketGroup.add(lip);

    // Nozzle inner glow ring
    nozzleGlowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.20, 0.025, 12, 40),
      new THREE.MeshBasicMaterial({
        color: 0xff6600, transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    nozzleGlowRing.rotation.x = Math.PI / 2;
    nozzleGlowRing.position.y = -1.07;
    rocketGroup.add(nozzleGlowRing);

    // Inner nozzle throat
    var throat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.06, 32, 1, true),
      darkMetal
    );
    throat.position.y = -1.06;
    rocketGroup.add(throat);
  }

  /* ════════════════════════════════════════════════════════════════
     EXHAUST — 7-layer realistic flame with turbulence + heat glow
     ════════════════════════════════════════════════════════════════ */
  function buildExhaust() {
    flameGroup = new THREE.Group();
    flameGroup.position.y = -1.42;
    rocketGroup.add(flameGroup);

    var layers = [
      { color: 0xffffff, r: 0.04, h: 0.40, op: 1.00 },
      { color: 0xccddff, r: 0.06, h: 0.55, op: 0.90 },
      { color: 0x5588ff, r: 0.09, h: 0.70, op: 0.78 },
      { color: 0xffbb33, r: 0.13, h: 0.88, op: 0.65 },
      { color: 0xff8811, r: 0.18, h: 1.05, op: 0.50 },
      { color: 0xff4400, r: 0.24, h: 1.25, op: 0.35 },
      { color: 0xcc1100, r: 0.32, h: 1.50, op: 0.18 }
    ];

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var g = new THREE.ConeGeometry(l.r, l.h, 32, 1, true);
      var m = new THREE.MeshBasicMaterial({
        color: l.color, transparent: true, opacity: l.op,
        side: THREE.DoubleSide, depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      var mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.PI;
      mesh.position.y = -l.h * 0.35;
      flameGroup.add(mesh);
      flameData.push({ mesh: mesh, baseH: l.h, baseOp: l.op, baseR: l.r, seed: i * 1.37 });
    }

    // Heat glow planes (crossed for volumetric feel)
    heatGlow = new THREE.Group();
    var hgMat = new THREE.MeshBasicMaterial({
      color: 0xff5522, transparent: true, opacity: 0.06,
      side: THREE.DoubleSide, depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var hg1 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), hgMat);
    hg1.position.y = -2.3;
    heatGlow.add(hg1);
    var hg2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), hgMat.clone());
    hg2.position.y = -2.3;
    hg2.rotation.y = Math.PI / 2;
    heatGlow.add(hg2);
    rocketGroup.add(heatGlow);
  }

  /* ════════════════════════════════════════════════════════════════
     SMOKE — 28 volumetric billowing particles
     ════════════════════════════════════════════════════════════════ */
  function buildSmokeSystem() {
    for (var i = 0; i < 28; i++) {
      var size = 0.06 + Math.random() * 0.16;
      var g = new THREE.IcosahedronGeometry(size, 1);
      var shade = 0.55 + Math.random() * 0.35;
      var m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(shade, shade, shade * 0.95),
        transparent: true, opacity: 0, depthWrite: false
      });
      var p = new THREE.Mesh(g, m);
      resetSmoke(p, true);
      rocketGroup.add(p);
      smokeParticles.push(p);
    }
  }

  function resetSmoke(p, randomizeLife) {
    var spread = hovered ? 0.22 : 0.16;
    p.position.set(
      (Math.random() - 0.5) * spread,
      -1.85 - Math.random() * 0.25,
      (Math.random() - 0.5) * spread
    );
    p.userData.vx = (Math.random() - 0.5) * 0.012;
    p.userData.vz = (Math.random() - 0.5) * 0.012;
    p.userData.vy = -(0.018 + Math.random() * 0.028);
    p.userData.life = randomizeLife ? Math.random() * 0.5 : 0;
    p.userData.maxLife = 1.2 + Math.random() * 1.0;
    p.userData.rotSpeed = (Math.random() - 0.5) * 2;
    p.material.opacity = 0;
    var s = 0.5 + Math.random() * 0.5;
    p.scale.set(s, s, s);
  }

  /* ════════════════════════════════════════════════════════════════
     SPARKS — glowing embers from exhaust
     ════════════════════════════════════════════════════════════════ */
  function buildSparkSystem() {
    for (var i = 0; i < 20; i++) {
      var g = new THREE.SphereGeometry(0.012, 4, 4);
      var colors = [0xffee44, 0xffaa22, 0xff6600, 0xffffff];
      var m = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var p = new THREE.Mesh(g, m);
      resetSpark(p, true);
      rocketGroup.add(p);
      sparkParticles.push(p);
    }
  }

  function resetSpark(p, randomizeLife) {
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * 0.18;
    p.position.set(
      Math.cos(angle) * dist,
      -1.55 - Math.random() * 0.15,
      Math.sin(angle) * dist
    );
    var speed = 0.04 + Math.random() * 0.06;
    p.userData.vx = Math.cos(angle) * speed * (0.3 + Math.random() * 0.7);
    p.userData.vz = Math.sin(angle) * speed * (0.3 + Math.random() * 0.7);
    p.userData.vy = -(0.05 + Math.random() * 0.10);
    p.userData.life = randomizeLife ? Math.random() * 0.2 : 0;
    p.userData.maxLife = 0.25 + Math.random() * 0.45;
    p.material.opacity = 0;
  }

  /* ════════════════════════════════════════════════════════════════
     LAUNCH — dramatic blast-off sequence
     ════════════════════════════════════════════════════════════════ */
  function triggerLaunch() {
    if (launching) return;
    launching = true;
    launchT = 0;
    launchPhase = 'recoil';
  }

  /* ════════════════════════════════════════════════════════════════
     MAIN ANIMATION LOOP
     ════════════════════════════════════════════════════════════════ */
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    var t  = clock.getElapsedTime();

    if (launching) {
      animateLaunch(dt, t);
    } else {
      animateIdle(dt, t);
    }

    animateFlames(t, dt);
    animateSmoke(dt);
    animateSparks(dt);
    animateExhaustLight(t);

    renderer.render(scene, camera);
  }

  /* ── Idle state — premium hovering feel ── */
  function animateIdle(dt, t) {
    // Multi-frequency floating bob
    var bob = Math.sin(t * 1.2) * 0.035
            + Math.sin(t * 2.7) * 0.015
            + Math.sin(t * 0.5) * 0.02;

    // Gentle swaying
    var swayZ = Math.sin(t * 1.0) * 0.025 + Math.sin(t * 2.3) * 0.012;
    var swayX = Math.cos(t * 0.8) * 0.010;

    // Micro-vibration (engine rumble)
    var vibeX = (Math.sin(t * 47) + Math.sin(t * 73)) * 0.002;
    var vibeY = (Math.sin(t * 53) + Math.sin(t * 61)) * 0.002;

    // Slow rotation for dynamic look
    var rotY = Math.sin(t * 0.35) * 0.06;

    // Cursor tilt when hovered
    var tiltX = 0, tiltZ = 0;
    if (hovered) {
      tiltZ = -mouseX * 0.08;
      tiltX = mouseY * 0.05;
    }

    rocketGroup.position.y = bob + vibeY;
    rocketGroup.position.x = vibeX;
    rocketGroup.rotation.z = swayZ + tiltZ;
    rocketGroup.rotation.x = swayX + tiltX;
    rocketGroup.rotation.y = rotY;
    idleBaseY = rocketGroup.position.y;
  }

  /* ── Launch sequence ── */
  function animateLaunch(dt, t) {
    launchT += dt;

    var RECOIL_DUR  = 0.25;
    var IGNITE_DUR  = 0.40;
    var THRUST_DUR  = 0.70;

    if (launchPhase === 'recoil') {
      var p = Math.min(launchT / RECOIL_DUR, 1);
      rocketGroup.position.y = idleBaseY - easeInQuad(p) * 0.15;
      rocketGroup.rotation.z = Math.sin(t * 30) * 0.01;
      if (p >= 1) { launchPhase = 'ignite'; launchT = 0; }
    }
    else if (launchPhase === 'ignite') {
      var p = Math.min(launchT / IGNITE_DUR, 1);
      var shake = (1 - Math.cos(t * 80)) * 0.015 * p;
      rocketGroup.position.y = idleBaseY - 0.15 + shake;
      rocketGroup.position.x = Math.sin(t * 90) * 0.01 * p;
      rocketGroup.rotation.z = Math.sin(t * 60) * 0.02 * p;
      if (p >= 1) {
        launchPhase = 'thrust';
        launchT = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    else if (launchPhase === 'thrust') {
      var p = Math.min(launchT / THRUST_DUR, 1);
      var ease = easeInBack(p);
      rocketGroup.position.y = idleBaseY - 0.15 + ease * 12;
      rocketGroup.position.x = 0;
      rocketGroup.rotation.z = 0;
      rocketGroup.rotation.x = 0;
      camera.position.x = Math.sin(t * 55) * 0.03 * (1 - p);
      camera.position.y = 0.15 + Math.sin(t * 65) * 0.02 * (1 - p);
      if (p >= 1) {
        launchPhase = 'done';
        launchT = 0;
        setTimeout(resetAfterLaunch, 600);
      }
    }
  }

  function resetAfterLaunch() {
    launching = false;
    launchPhase = '';
    rocketGroup.position.set(0, 0, 0);
    rocketGroup.rotation.set(0, 0, 0);
    camera.position.set(0, 0.15, 6.2);
    camera.lookAt(0, 0.05, 0);
  }

  /* ── Flame animation with turbulence ── */
  function animateFlames(t, dt) {
    var intensity = 1.0;
    if (hovered && !launching) intensity = 1.4;
    if (launching) {
      if (launchPhase === 'recoil')  intensity = 1.2;
      if (launchPhase === 'ignite')  intensity = 1.6 + launchT * 2.0;
      if (launchPhase === 'thrust')  intensity = 3.0;
    }

    for (var i = 0; i < flameData.length; i++) {
      var fd = flameData[i];
      var turb = turbulence(t, fd.seed);
      var flickerX = 0.85 + turb * 0.2;
      var flickerY = 0.75 + turbulence(t * 1.3, fd.seed + 5) * 0.3;

      var sx = flickerX * intensity;
      var sy = flickerY * intensity;
      fd.mesh.scale.set(sx, sy, sx);

      var baseOp = fd.baseOp * (0.65 + turbulence(t * 0.8, fd.seed + 10) * 0.35);
      fd.mesh.material.opacity = Math.min(baseOp * intensity, 1.0);

      fd.mesh.position.x = turbulence(t * 1.5, fd.seed + 20) * 0.015 * intensity;
      fd.mesh.position.z = turbulence(t * 1.5, fd.seed + 30) * 0.015 * intensity;
    }

    if (heatGlow) {
      var hgOp = (0.04 + turbulence(t, 99) * 0.03) * intensity;
      heatGlow.children.forEach(function (c) { c.material.opacity = Math.min(hgOp, 0.3); });
      heatGlow.scale.set(
        0.8 + Math.sin(t * 5) * 0.12 * intensity,
        0.85 + Math.sin(t * 7) * 0.15 * intensity,
        1
      );
    }

    if (nozzleGlowRing) {
      nozzleGlowRing.material.opacity = (0.3 + turbulence(t, 77) * 0.2) * intensity;
    }
  }

  /* ── Smoke with realistic lifecycle ── */
  function animateSmoke(dt) {
    var smokeIntensity = 1.0;
    if (hovered && !launching) smokeIntensity = 1.5;
    if (launching && launchPhase === 'ignite') smokeIntensity = 2.5;
    if (launching && launchPhase === 'thrust') smokeIntensity = 4.0;

    for (var i = 0; i < smokeParticles.length; i++) {
      var sp = smokeParticles[i];
      sp.userData.life += dt;
      if (sp.userData.life > sp.userData.maxLife / smokeIntensity) {
        resetSmoke(sp, false);
        continue;
      }
      var frac = sp.userData.life / (sp.userData.maxLife / smokeIntensity);

      sp.position.x += sp.userData.vx * (1 + frac * 2) * smokeIntensity;
      sp.position.y += sp.userData.vy * smokeIntensity;
      sp.position.z += sp.userData.vz * (1 + frac * 2) * smokeIntensity;

      sp.rotation.x += sp.userData.rotSpeed * dt;
      sp.rotation.y += sp.userData.rotSpeed * dt * 0.7;

      var maxOp = 0.40 * Math.min(smokeIntensity, 2);
      if (frac < 0.12)      sp.material.opacity = maxOp * (frac / 0.12);
      else if (frac < 0.45) sp.material.opacity = maxOp;
      else                   sp.material.opacity = maxOp * (1 - (frac - 0.45) / 0.55);

      var grow = 1 + frac * 3.0;
      sp.scale.set(grow, grow * 0.85, grow);
    }
  }

  /* ── Sparks ── */
  function animateSparks(dt) {
    var sparkBoost = 1.0;
    if (hovered && !launching) sparkBoost = 1.5;
    if (launching && launchPhase === 'ignite') sparkBoost = 2.0;
    if (launching && launchPhase === 'thrust') sparkBoost = 3.0;

    for (var i = 0; i < sparkParticles.length; i++) {
      var sk = sparkParticles[i];
      sk.userData.life += dt * sparkBoost;
      if (sk.userData.life > sk.userData.maxLife) { resetSpark(sk, false); continue; }
      var f = sk.userData.life / sk.userData.maxLife;
      sk.position.x += sk.userData.vx * sparkBoost;
      sk.position.y += sk.userData.vy * sparkBoost;
      sk.position.z += sk.userData.vz * sparkBoost;
      sk.material.opacity = f < 0.15 ? (f / 0.15) : (1 - (f - 0.15) / 0.85);
      sk.userData.vy += 0.001;
      sk.userData.vx *= 0.995;
      sk.userData.vz *= 0.995;
    }
  }

  /* ── Exhaust point-light pulsing ── */
  function animateExhaustLight(t) {
    if (!exhaustLight) return;
    var base = 2.0;
    if (hovered && !launching) base = 3.5;
    if (launching) {
      if (launchPhase === 'recoil')  base = 3.0;
      if (launchPhase === 'ignite')  base = 5.0 + launchT * 5;
      if (launchPhase === 'thrust')  base = 12.0;
    }
    exhaustLight.intensity = base + turbulence(t, 50) * base * 0.3;
    exhaustLight.position.y = rocketGroup.position.y - 1.6;
  }

  function startLoop() {
    if (REDUCED) {
      renderer.render(scene, camera);
      return;
    }
    running = true;
    clock.start();
    animate();
  }

  /* ── Interaction — hover tracking + click launch ── */
  function setupInteraction() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    btn.addEventListener('mouseenter', function () { hovered = true; });
    btn.addEventListener('mouseleave', function () { hovered = false; mouseX = 0; mouseY = 0; });
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    // Click → launch animation (capture phase to override existing handler)
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      triggerLaunch();
    }, true);
  }

  /* ── Boot ── */
  function boot() { init(); setupInteraction(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
