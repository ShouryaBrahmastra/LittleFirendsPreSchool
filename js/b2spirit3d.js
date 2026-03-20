/* ================================================================
   Hyper-Realistic 3D B-2 Spirit Stealth Bomber — Back-to-Top
   Perspective top-down view, matte stealth finish, panel lines,
   cinematic lighting, idle float, click barrel-roll animation
   ================================================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var PR      = Math.min(window.devicePixelRatio || 1, 2);
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 88, H = 88;

  /* ── State ── */
  var renderer, scene, camera, bomberGroup, clock;
  var running     = false;
  var rolling     = false;
  var rollT       = 0;
  var rollPhase   = '';
  /* snapshot of idle pose at moment of click */
  var snap = { y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  /* position at end of roll for settle lerp */
  var rollEnd = { y: 0, z: 0 };
  /* flame + smoke refs */
  var flameCones = [];
  var smokeParticles = [];
  var flameLight;

  /* ── Easing ── */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function easeInQuad(t)   { return t * t; }

  /* ── Turbulence helper ── */
  function turb(t, s) {
    return Math.sin(t * 5.7 + s) * 0.4
         + Math.sin(t * 11.3 + s * 2) * 0.35
         + Math.sin(t * 19.7 + s * 0.8) * 0.25;
  }

  function init() {
    var container = document.querySelector('.back-to-top-3d');
    if (!container) return;

    /* ── Renderer ── */
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(PR);
    renderer.setSize(W, H);
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace   = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    /* ── Scene & Camera — perspective for depth during barrel roll ── */
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 80);
    camera.position.set(0, 6.2, 0.8);
    camera.lookAt(0, 0, 0.15);

    /* ── Cinematic Lighting ── */
    scene.add(new THREE.AmbientLight(0x8090a8, 0.55));

    var key = new THREE.DirectionalLight(0xeef0ff, 2.2);
    key.position.set(3, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xc8bba0, 0.55);
    fill.position.set(-4, 5, 2);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0x667799, 0.45);
    rim.position.set(0, 3, -6);
    scene.add(rim);

    var beneath = new THREE.DirectionalLight(0x445566, 0.3);
    beneath.position.set(0, -4, 0);
    scene.add(beneath);

    /* ── Env Map for reflections ── */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x2a2a35);
    var el1 = new THREE.PointLight(0xffffff, 8, 14); el1.position.set(4, 6, 3); envScene.add(el1);
    var el2 = new THREE.PointLight(0x6688aa, 5, 10); el2.position.set(-3, 3, -4); envScene.add(el2);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmrem.dispose();

    /* ── Build ── */
    bomberGroup = new THREE.Group();
    scene.add(bomberGroup);

    buildB2(envMap);

    clock = new THREE.Clock();
    startLoop();
  }

  /* ════════════════════════════════════════════════════════════════
     B-2 SPIRIT — flying wing stealth bomber geometry
     ════════════════════════════════════════════════════════════════ */
  function buildB2(envMap) {

    /* ── Materials ── */
    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a30, metalness: 0.15, roughness: 0.55,
      clearcoat: 0.20, clearcoatRoughness: 0.35,
      envMapIntensity: 0.8, envMap: envMap
    });

    var panelMat = new THREE.MeshPhysicalMaterial({
      color: 0x222228, metalness: 0.2, roughness: 0.50,
      clearcoat: 0.15, clearcoatRoughness: 0.40,
      envMapIntensity: 0.6, envMap: envMap
    });

    var edgeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a42, metalness: 0.4, roughness: 0.30,
      envMapIntensity: 1.2, envMap: envMap
    });

    var cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x556688, metalness: 0.05, roughness: 0.08,
      transparent: true, opacity: 0.6,
      transmission: 0.5, thickness: 0.08,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
      envMapIntensity: 2.5, envMap: envMap,
      side: THREE.DoubleSide
    });

    var exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x111118, metalness: 0.7, roughness: 0.20,
      envMapIntensity: 1.5, envMap: envMap
    });

    /* ═══════════════════════════════════════
       Main flying-wing body — custom Shape
       Nose at +Z, tail at -Z, wings spread on X
       ═══════════════════════════════════════ */
    var wingShape = new THREE.Shape();

    // Start at nose (center front)
    wingShape.moveTo(0, 1.6);    // nose tip (Z mapped to Y in shape, extruded to 3D)

    // Right side: nose → leading edge → wingtip → trailing edge → center
    wingShape.bezierCurveTo(0.12, 1.45, 0.35, 1.15, 0.65, 0.85);  // nose curve to right
    wingShape.bezierCurveTo(1.1, 0.40, 1.8, -0.05, 2.4, -0.35);   // leading edge sweep
    wingShape.lineTo(2.35, -0.50);                                   // wingtip notch
    wingShape.bezierCurveTo(2.0, -0.52, 1.4, -0.48, 0.85, -0.55);  // trailing edge inward
    wingShape.bezierCurveTo(0.55, -0.62, 0.30, -0.75, 0.15, -0.90); // trailing edge to center
    wingShape.lineTo(0, -0.85);                                       // center tail

    // Left side (mirror)
    wingShape.lineTo(-0.15, -0.90);
    wingShape.bezierCurveTo(-0.30, -0.75, -0.55, -0.62, -0.85, -0.55);
    wingShape.bezierCurveTo(-1.4, -0.48, -2.0, -0.52, -2.35, -0.50);
    wingShape.lineTo(-2.4, -0.35);
    wingShape.bezierCurveTo(-1.8, -0.05, -1.1, 0.40, -0.65, 0.85);
    wingShape.bezierCurveTo(-0.35, 1.15, -0.12, 1.45, 0, 1.6);

    // Extrude into thin 3D body
    var wingGeom = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 6
    });
    // Rotate so the top faces up (Y-axis)
    wingGeom.rotateX(-Math.PI / 2);
    // Center vertically
    wingGeom.translate(0, 0.03, 0);

    var wing = new THREE.Mesh(wingGeom, bodyMat);
    wing.castShadow = true;
    wing.receiveShadow = true;
    bomberGroup.add(wing);

    /* ── Center spine ridge ── */
    var spineShape = new THREE.Shape();
    spineShape.moveTo(0, 1.55);
    spineShape.bezierCurveTo(0.08, 1.2, 0.12, 0.6, 0.12, 0);
    spineShape.bezierCurveTo(0.12, -0.3, 0.10, -0.55, 0.06, -0.80);
    spineShape.lineTo(0, -0.85);
    spineShape.lineTo(-0.06, -0.80);
    spineShape.bezierCurveTo(-0.10, -0.55, -0.12, -0.3, -0.12, 0);
    spineShape.bezierCurveTo(-0.12, 0.6, -0.08, 1.2, 0, 1.55);

    var spineGeom = new THREE.ExtrudeGeometry(spineShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 4
    });
    spineGeom.rotateX(-Math.PI / 2);
    spineGeom.translate(0, 0.10, 0);
    var spine = new THREE.Mesh(spineGeom, panelMat);
    bomberGroup.add(spine);

    /* ── Cockpit canopy ── */
    var canopyShape = new THREE.Shape();
    canopyShape.moveTo(0, 1.35);
    canopyShape.bezierCurveTo(0.08, 1.15, 0.10, 0.85, 0.08, 0.65);
    canopyShape.lineTo(0, 0.60);
    canopyShape.lineTo(-0.08, 0.65);
    canopyShape.bezierCurveTo(-0.10, 0.85, -0.08, 1.15, 0, 1.35);

    var canopyGeom = new THREE.ExtrudeGeometry(canopyShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 4
    });
    canopyGeom.rotateX(-Math.PI / 2);
    canopyGeom.translate(0, 0.16, 0);
    var canopy = new THREE.Mesh(canopyGeom, cockpitMat);
    bomberGroup.add(canopy);

    /* ── Cockpit frame lines ── */
    var frameMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a20, metalness: 0.5, roughness: 0.3,
      envMapIntensity: 1.0, envMap: envMap
    });
    // Longitudinal frame
    var fGeom1 = new THREE.BoxGeometry(0.008, 0.06, 0.70);
    var frame1 = new THREE.Mesh(fGeom1, frameMat);
    frame1.position.set(0, 0.19, 0.98);
    bomberGroup.add(frame1);
    // Cross frame
    var fGeom2 = new THREE.BoxGeometry(0.14, 0.05, 0.008);
    var frame2 = new THREE.Mesh(fGeom2, frameMat);
    frame2.position.set(0, 0.19, 1.0);
    bomberGroup.add(frame2);

    /* ── Panel lines — thin dark strips on wing surface ── */
    var panelLineGeom = new THREE.BoxGeometry(0.005, 0.005, 0);
    // Create panel lines along the wing
    var panelLines = [
      // Right wing panel lines
      { sx: 3.0, sy: 0.005, sz: 0.005, px: 0.9, py: 0.11, pz: 0.15, ry: 0.35 },
      { sx: 2.5, sy: 0.005, sz: 0.005, px: 1.1, py: 0.11, pz: -0.10, ry: 0.30 },
      { sx: 1.8, sy: 0.005, sz: 0.005, px: 0.7, py: 0.11, pz: -0.30, ry: 0.25 },
      // Left wing panel lines (mirror)
      { sx: 3.0, sy: 0.005, sz: 0.005, px: -0.9, py: 0.11, pz: 0.15, ry: -0.35 },
      { sx: 2.5, sy: 0.005, sz: 0.005, px: -1.1, py: 0.11, pz: -0.10, ry: -0.30 },
      { sx: 1.8, sy: 0.005, sz: 0.005, px: -0.7, py: 0.11, pz: -0.30, ry: -0.25 },
      // Center panel lines
      { sx: 0.005, sy: 0.005, sz: 2.0, px: 0.25, py: 0.11, pz: 0.30, ry: 0 },
      { sx: 0.005, sy: 0.005, sz: 2.0, px: -0.25, py: 0.11, pz: 0.30, ry: 0 },
    ];

    for (var pi = 0; pi < panelLines.length; pi++) {
      var pl = panelLines[pi];
      var plGeom = new THREE.BoxGeometry(pl.sx, pl.sy, pl.sz);
      var plMesh = new THREE.Mesh(plGeom, edgeMat);
      plMesh.position.set(pl.px, pl.py, pl.pz);
      plMesh.rotation.y = pl.ry;
      bomberGroup.add(plMesh);
    }

    /* ── Engine intake bumps (2 on top) ── */
    var intakeGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16);
    var intakeL = new THREE.Mesh(intakeGeom, panelMat);
    intakeL.position.set(-0.22, 0.13, 0.10);
    bomberGroup.add(intakeL);
    var intakeR = new THREE.Mesh(intakeGeom.clone(), panelMat);
    intakeR.position.set(0.22, 0.13, 0.10);
    bomberGroup.add(intakeR);

    /* ── Exhaust slots (rear) ── */
    var exhGeom = new THREE.BoxGeometry(0.12, 0.03, 0.10);
    var exhL = new THREE.Mesh(exhGeom, exhaustMat);
    exhL.position.set(-0.18, 0.02, -0.78);
    bomberGroup.add(exhL);
    var exhR = new THREE.Mesh(exhGeom.clone(), exhaustMat);
    exhR.position.set(0.18, 0.02, -0.78);
    bomberGroup.add(exhR);

    /* ── Subtle exhaust glow ── */
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x443355, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var glowGeom = new THREE.PlaneGeometry(0.14, 0.08);
    var glowL = new THREE.Mesh(glowGeom, glowMat);
    glowL.position.set(-0.18, 0.01, -0.84);
    glowL.rotation.x = -Math.PI / 2;
    bomberGroup.add(glowL);
    var glowR = new THREE.Mesh(glowGeom.clone(), glowMat.clone());
    glowR.position.set(0.18, 0.01, -0.84);
    glowR.rotation.x = -Math.PI / 2;
    bomberGroup.add(glowR);

    /* ── Wing leading edge highlight strips ── */
    // Right leading edge
    var lePoints = [];
    lePoints.push(new THREE.Vector3(0.15, 0.09, 1.40));
    lePoints.push(new THREE.Vector3(0.65, 0.09, 0.85));
    lePoints.push(new THREE.Vector3(1.5, 0.09, 0.20));
    lePoints.push(new THREE.Vector3(2.35, 0.09, -0.35));
    var leCurve = new THREE.CatmullRomCurve3(lePoints);
    var leGeom = new THREE.TubeGeometry(leCurve, 32, 0.008, 6, false);
    var leRight = new THREE.Mesh(leGeom, edgeMat);
    bomberGroup.add(leRight);

    // Left leading edge (mirror)
    var lePointsL = [];
    lePointsL.push(new THREE.Vector3(-0.15, 0.09, 1.40));
    lePointsL.push(new THREE.Vector3(-0.65, 0.09, 0.85));
    lePointsL.push(new THREE.Vector3(-1.5, 0.09, 0.20));
    lePointsL.push(new THREE.Vector3(-2.35, 0.09, -0.35));
    var leCurveL = new THREE.CatmullRomCurve3(lePointsL);
    var leGeomL = new THREE.TubeGeometry(leCurveL, 32, 0.008, 6, false);
    var leLeft = new THREE.Mesh(leGeomL, edgeMat);
    bomberGroup.add(leLeft);

    /* ── "BACK TO TOP" text — canvas texture on underside-visible plane ── */
    var texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 256;
    var ctx = texCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);
    ctx.font = '900 56px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BACK TO TOP', 256, 128);
    var textTex = new THREE.CanvasTexture(texCanvas);
    textTex.needsUpdate = true;
    var textMat = new THREE.MeshBasicMaterial({
      map: textTex, transparent: true, depthWrite: false, side: THREE.FrontSide
    });
    var textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), textMat);
    textPlane.rotation.x = -Math.PI / 2;
    textPlane.position.set(0, 0.12, 0.10);
    bomberGroup.add(textPlane);

    /* ══════════════════════════════════════════════════
       BOOSTER FLAME — center tail at Z ≈ -0.85
       Multi-layer additive cones: white core → blue → orange → red
       ══════════════════════════════════════════════════ */
    var flameColors = [
      { color: 0xffffff, op: 0.95, r: 0.025, len: 0.22 },  /* white-hot core  */
      { color: 0xaaddff, op: 0.70, r: 0.035, len: 0.30 },  /* blue inner      */
      { color: 0x4488ff, op: 0.55, r: 0.045, len: 0.38 },  /* blue mid        */
      { color: 0xff8822, op: 0.45, r: 0.060, len: 0.50 },  /* orange          */
      { color: 0xff4400, op: 0.30, r: 0.075, len: 0.62 },  /* red outer       */
    ];
    for (var fi = 0; fi < flameColors.length; fi++) {
      var fc = flameColors[fi];
      var fg = new THREE.ConeGeometry(fc.r, fc.len, 12, 1, true);
      var fm = new THREE.MeshBasicMaterial({
        color: fc.color, transparent: true, opacity: fc.op,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      var cone = new THREE.Mesh(fg, fm);
      cone.rotation.x = Math.PI;  /* point away from body (toward -Z) */
      cone.position.set(0, 0.02, -0.85 - fc.len * 0.5);
      bomberGroup.add(cone);
      flameCones.push(cone);
    }

    /* Cross heat-glow planes */
    var heatMat = new THREE.MeshBasicMaterial({
      color: 0xff6622, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    var heatGeom = new THREE.PlaneGeometry(0.10, 0.55);
    var heatH = new THREE.Mesh(heatGeom, heatMat);
    heatH.position.set(0, 0.02, -1.10);
    heatH.rotation.y = 0;
    bomberGroup.add(heatH);
    flameCones.push(heatH);
    var heatV = new THREE.Mesh(heatGeom.clone(), heatMat.clone());
    heatV.position.set(0, 0.02, -1.10);
    heatV.rotation.y = Math.PI / 2;
    bomberGroup.add(heatV);
    flameCones.push(heatV);

    /* Dynamic point light at exhaust */
    flameLight = new THREE.PointLight(0xff6633, 0.6, 1.5);
    flameLight.position.set(0, 0.02, -1.0);
    bomberGroup.add(flameLight);

    /* ══════════════════════════════════════════════════
       SMOKE PARTICLES — drift away from booster
       ══════════════════════════════════════════════════ */
    var smokeGeo = new THREE.IcosahedronGeometry(0.025, 1);
    for (var si = 0; si < 18; si++) {
      var sMat = new THREE.MeshBasicMaterial({
        color: 0x888888, transparent: true, opacity: 0,
        depthWrite: false
      });
      var sp = new THREE.Mesh(smokeGeo, sMat);
      sp.position.set(0, 0.02, -1.35);
      sp.userData = {
        life: 0, maxLife: 0.8 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.3) * 0.08,
        vz: -(0.3 + Math.random() * 0.25),
        baseScale: 0.6 + Math.random() * 0.5,
        delay: si * 0.07
      };
      bomberGroup.add(sp);
      smokeParticles.push(sp);
    }

    /* ── Position the whole group ── */
    bomberGroup.rotation.y = 0;
  }

  /* ════════════════════════════════════════════════════════════════
     CLICK — Realistic barrel-roll animation
     Roll around forward axis with helical pitch, lateral
     displacement, and upward climb surge.
     ════════════════════════════════════════════════════════════════ */
  function triggerRoll() {
    if (rolling) return;
    rolling = true;
    rollT = 0;
    rollPhase = 'anticipate';
    /* Snapshot the idle pose so we can blend from it */
    snap.y  = bomberGroup.position.y;
    snap.z  = bomberGroup.position.z;
    snap.rx = bomberGroup.rotation.x;
    snap.ry = bomberGroup.rotation.y;
    snap.rz = bomberGroup.rotation.z;
  }

  /* ════════════════════════════════════════════════════════════════
     MAIN ANIMATION LOOP
     ════════════════════════════════════════════════════════════════ */
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    var t  = clock.getElapsedTime();

    if (rolling) {
      animateRoll(dt);
    } else {
      animateIdle(dt, t);
    }

    renderer.render(scene, camera);
  }

  /* ── Idle — elegant floating ── */
  function animateIdle(dt, t) {
    /* Multi-frequency vertical float */
    var bob = Math.sin(t * 0.9) * 0.025
            + Math.sin(t * 2.1) * 0.010
            + Math.sin(t * 0.4) * 0.015;

    /* Micro tilt — very gentle bank-like sway */
    var tiltX = Math.sin(t * 0.7) * 0.008 + Math.sin(t * 1.9) * 0.004;
    var tiltZ = Math.cos(t * 0.6) * 0.006 + Math.cos(t * 1.5) * 0.003;

    /* Atmospheric vibration */
    var vibeY = turb(t, 33) * 0.003;

    /* Very slow gentle yaw drift */
    var yaw = Math.sin(t * 0.25) * 0.015;

    /* Subtle lateral hover drift */
    var driftX = Math.sin(t * 0.33) * 0.008 + Math.sin(t * 0.8) * 0.004;

    bomberGroup.position.x = driftX;
    bomberGroup.position.y = bob + vibeY;
    bomberGroup.position.z = 0;
    bomberGroup.rotation.x = tiltX;
    bomberGroup.rotation.z = tiltZ;
    bomberGroup.rotation.y = yaw;

    /* ── Animate flame flicker ── */
    updateFlame(t, dt, 1.0);
    updateSmoke(dt);
  }

  /* ── Flame flicker helper ── */
  function updateFlame(t, dt, intensity) {
    for (var i = 0; i < flameCones.length; i++) {
      var c = flameCones[i];
      var flick = 0.85 + turb(t * 3 + i * 1.7, i * 0.5) * 0.15;
      var scaleXZ = flick * intensity;
      var scaleY  = (0.9 + turb(t * 4 + i, i * 0.3) * 0.1) * intensity;
      c.scale.set(scaleXZ, scaleY, scaleXZ);
      if (c.material) c.material.opacity = c.material.opacity * (0.85 + Math.random() * 0.15);
    }
    if (flameLight) {
      flameLight.intensity = (0.5 + turb(t * 5, 7) * 0.2) * intensity;
    }
  }

  /* ── Smoke particle update ── */
  function updateSmoke(dt) {
    for (var i = 0; i < smokeParticles.length; i++) {
      var sp = smokeParticles[i];
      var ud = sp.userData;
      ud.life += dt;
      if (ud.life < ud.delay) continue;
      var age = ud.life - ud.delay;
      if (age > ud.maxLife) {
        /* respawn */
        sp.position.set(
          (Math.random() - 0.5) * 0.04,
          0.02,
          -1.35
        );
        ud.life = ud.delay;
        ud.vx = (Math.random() - 0.5) * 0.12;
        ud.vy = (Math.random() - 0.3) * 0.08;
        ud.vz = -(0.3 + Math.random() * 0.25);
        sp.material.opacity = 0;
        continue;
      }
      var p = age / ud.maxLife;
      /* bell-curve opacity: ramp up fast, fade out */
      var op = p < 0.15 ? p / 0.15 : 1.0 - (p - 0.15) / 0.85;
      sp.material.opacity = op * 0.35;
      /* grow as it drifts */
      var s = ud.baseScale + p * 1.8;
      sp.scale.set(s, s, s);
      /* drift */
      sp.position.x += ud.vx * dt;
      sp.position.y += ud.vy * dt;
      sp.position.z += ud.vz * dt;
      /* slow rotation for organic look */
      sp.rotation.x += dt * 0.5;
      sp.rotation.y += dt * 0.3;
    }
  }

  /* ── Barrel Roll — 3-phase cinematic animation ── */
  var ANTIC_DUR  = 0.30;   /* thrust preparation dip          */
  var ROLL_DUR   = 1.05;   /* full 360° barrel roll           */
  var SETTLE_DUR = 0.45;   /* ease back to level with bounce  */

  function animateRoll(dt) {
    rollT += dt;

    /* ── Phase 1: Anticipation — dip + nose-up tension ── */
    if (rollPhase === 'anticipate') {
      var p = Math.min(rollT / ANTIC_DUR, 1);
      var e = easeInQuad(p);
      /* Dip down, pitch nose up slightly, tiny wing dip */
      bomberGroup.position.y = snap.y - e * 0.09;
      bomberGroup.position.x = 0;
      bomberGroup.position.z = snap.z;
      bomberGroup.rotation.x = snap.rx + e * 0.06;
      bomberGroup.rotation.z = snap.rz + e * -0.025;
      bomberGroup.rotation.y = snap.ry;
      if (p >= 1) { rollPhase = 'roll'; rollT = 0; }
    }

    /* ── Phase 2: Barrel Roll — roll on forward axis ── */
    else if (rollPhase === 'roll') {
      var p = Math.min(rollT / ROLL_DUR, 1);
      var e = easeInOutCubic(p);
      var angle = e * Math.PI * 2;

      /* Primary: full 360° roll around Z (forward / nose-to-tail axis) */
      bomberGroup.rotation.z = angle;

      /* Helical pitch oscillation — nose traces a small circle,
         keeps some surface always visible to camera and feels
         like an actual barrel roll, not just an aileron roll */
      bomberGroup.rotation.x = Math.sin(angle) * 0.24;

      /* Gentle yaw wobble — natural aerodynamic coupling */
      bomberGroup.rotation.y = Math.sin(angle * 0.5) * 0.04;

      /* Lateral barrel-trajectory displacement */
      bomberGroup.position.x = Math.sin(angle) * 0.07;

      /* Upward climb surge — plane rises during the maneuver */
      bomberGroup.position.y = (snap.y - 0.09) + e * 0.16;

      /* Slight forward surge (nose direction) */
      bomberGroup.position.z = snap.z + e * 0.06;

      /* Intensify flame during roll */
      updateFlame(rollT * 8, dt, 1.4);
      updateSmoke(dt);

      if (p >= 1) {
        /* Snap clean at end of full rotation */
        bomberGroup.rotation.set(0, 0, 0);
        bomberGroup.position.x = 0;
        rollEnd.y = bomberGroup.position.y;
        rollEnd.z = bomberGroup.position.z;
        rollPhase = 'settle';
        rollT = 0;
        /* Fire scroll-to-top */
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    /* ── Phase 3: Settle — ease back to idle with slight bounce ── */
    else if (rollPhase === 'settle') {
      var p = Math.min(rollT / SETTLE_DUR, 1);
      var e = easeOutQuart(p);
      /* Damped overshoot bounce on Y */
      var bounce = Math.sin(p * Math.PI * 1.5) * 0.02 * (1 - p);

      bomberGroup.rotation.set(0, 0, 0);
      bomberGroup.position.x = 0;
      bomberGroup.position.y = rollEnd.y * (1 - e) + bounce;
      bomberGroup.position.z = rollEnd.z * (1 - e);

      if (p >= 1) {
        rolling = false;
        rollPhase = '';
        bomberGroup.rotation.set(0, 0, 0);
        bomberGroup.position.set(0, 0, 0);
      }
    }
  }

  /* ── Start rendering ── */
  function startLoop() {
    if (REDUCED) {
      renderer.render(scene, camera);
      return;
    }
    running = true;
    clock.start();
    animate();
  }

  /* ── Interaction ── */
  function setupInteraction() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    /* Capture phase click overrides main.js handler */
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      triggerRoll();
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
