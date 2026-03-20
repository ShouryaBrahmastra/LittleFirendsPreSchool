/* ══════════════════════════════════════════════════════════
   LittleFriends – Hyper-Realistic 3D Quadcopter Drone
   Back-to-Top interactive element powered by Three.js
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var container = document.getElementById('droneBackToTop');
  if (!container) return;

  /* ── Config ── */
  var PR = Math.min(window.devicePixelRatio || 1, 2);
  var MOB = window.innerWidth <= 768;
  var SMALL = window.innerWidth <= 480;
  var W = SMALL ? 62 : (MOB ? 72 : 110);
  var H = SMALL ? 62 : (MOB ? 72 : 110);

  /* ── Renderer ── */
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(PR);
  renderer.setSize(W, H);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = !MOB;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  /* ── Scene & Camera ── */
  var scene = new THREE.Scene();
  // Angled top view for strong 3D depth
  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  camera.position.set(0, 3.2, 3.8);
  camera.lookAt(0, 0, 0);

  /* ── Environment Map ── */
  var pmrem = new THREE.PMREMGenerator(renderer);
  var envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x1a1a2e);
  envScene.add(new THREE.AmbientLight(0x445566, 0.5));
  var ed1 = new THREE.DirectionalLight(0x6688cc, 0.6);
  ed1.position.set(3, 5, 2);
  envScene.add(ed1);
  var envMap = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  /* ── Lighting ── */
  // Key light (top-right)
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(4, 6, 5);
  keyLight.castShadow = !MOB;
  if (!MOB) {
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.bias = -0.001;
  }
  scene.add(keyLight);

  // Fill light (left, cool)
  var fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
  fillLight.position.set(-4, 3, -2);
  scene.add(fillLight);

  // Rim light (back, subtle)
  var rimLight = new THREE.DirectionalLight(0x99bbff, 0.4);
  rimLight.position.set(0, 4, -6);
  scene.add(rimLight);

  // Ambient
  scene.add(new THREE.AmbientLight(0xd0dde8, 0.35));

  // Bottom accent
  var accentLight = new THREE.PointLight(0x00ccff, 0.15, 10);
  accentLight.position.set(0, -2, 2);
  scene.add(accentLight);

  /* ── Materials ── */
  var bodyMatte = new THREE.MeshStandardMaterial({
    color: 0x2a2a2e, roughness: 0.65, metalness: 0.15,
    envMap: envMap, envMapIntensity: 0.4
  });
  var bodyMetallic = new THREE.MeshStandardMaterial({
    color: 0x3a3a40, roughness: 0.2, metalness: 0.85,
    envMap: envMap, envMapIntensity: 1.2
  });
  var armMat = new THREE.MeshStandardMaterial({
    color: 0x222228, roughness: 0.45, metalness: 0.5,
    envMap: envMap, envMapIntensity: 0.6
  });
  var motorMat = new THREE.MeshStandardMaterial({
    color: 0x555560, roughness: 0.25, metalness: 0.8,
    envMap: envMap, envMapIntensity: 1.0
  });
  var propMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e, roughness: 0.5, metalness: 0.3,
    envMap: envMap, envMapIntensity: 0.3,
    transparent: true, opacity: 0.85
  });
  var propBlurMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e, roughness: 0.4, metalness: 0.2,
    transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    envMap: envMap, envMapIntensity: 0.2
  });
  var legMat = new THREE.MeshStandardMaterial({
    color: 0x333338, roughness: 0.5, metalness: 0.4,
    envMap: envMap, envMapIntensity: 0.5
  });
  var ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x00ff44, emissive: 0x00ff44, emissiveIntensity: 2.5,
    roughness: 0.2, metalness: 0.05, transparent: true, opacity: 1.0
  });
  var ledRedMat = new THREE.MeshStandardMaterial({
    color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 2.5,
    roughness: 0.2, metalness: 0.05, transparent: true, opacity: 1.0
  });
  var ledPointLights = [];
  var ventMat = new THREE.MeshStandardMaterial({
    color: 0x181818, roughness: 0.8, metalness: 0.1
  });
  var screwMat = new THREE.MeshStandardMaterial({
    color: 0x888888, roughness: 0.3, metalness: 0.7,
    envMap: envMap, envMapIntensity: 0.8
  });

  /* ── Drone Root ── */
  var droneRoot = new THREE.Group();
  scene.add(droneRoot);

  /* ─── BODY ─── */
  var bodyGroup = new THREE.Group();
  droneRoot.add(bodyGroup);

  // Main body - pill/capsule shape
  var bodyTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
    bodyMatte
  );
  bodyTop.position.y = 0;
  bodyGroup.add(bodyTop);

  var bodyBottom = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    bodyMatte
  );
  bodyBottom.position.y = 0;
  bodyGroup.add(bodyBottom);

  // Centre metallic ring
  var bodyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.025, 12, 48),
    bodyMetallic
  );
  bodyRing.rotation.x = Math.PI / 2;
  bodyGroup.add(bodyRing);

  // Top camera/sensor bump
  var sensorBump = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    bodyMetallic
  );
  sensorBump.position.y = 0.38;
  bodyGroup.add(sensorBump);

  // Camera lens (front bottom)
  var cameraLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0x050510, roughness: 0.05, metalness: 0.3,
      envMap: envMap, envMapIntensity: 1.5,
      clearcoat: 1, clearcoatRoughness: 0.02
    })
  );
  cameraLens.rotation.x = Math.PI / 2;
  cameraLens.position.set(0, -0.15, 0.4);
  bodyGroup.add(cameraLens);

  // Vents on sides
  for (var vi = 0; vi < 4; vi++) {
    var ventAngle = (vi / 4) * Math.PI * 2 + Math.PI / 4;
    var vent = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.015, 0.02),
      ventMat
    );
    vent.position.set(
      Math.cos(ventAngle) * 0.38,
      0.1 + vi * 0.04 - 0.06,
      Math.sin(ventAngle) * 0.38
    );
    vent.lookAt(0, vent.position.y, 0);
    bodyGroup.add(vent);
  }

  // Screws on top
  var screwGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8);
  for (var si = 0; si < 4; si++) {
    var sa = (si / 4) * Math.PI * 2;
    var screw = new THREE.Mesh(screwGeo, screwMat);
    screw.position.set(Math.cos(sa) * 0.2, 0.36, Math.sin(sa) * 0.2);
    bodyGroup.add(screw);
  }

  /* ─── ARMS ─── */
  var ARM_ANGLES = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
  var ARM_LENGTH = 0.85;
  var motorGroups = [];
  var propellers = [];
  var propBlurs = [];

  for (var ai = 0; ai < 4; ai++) {
    var angle = ARM_ANGLES[ai];
    var armGroup = new THREE.Group();
    droneRoot.add(armGroup);

    // Arm strut
    var arm = new THREE.Mesh(
      new THREE.BoxGeometry(ARM_LENGTH, 0.06, 0.08),
      armMat
    );
    arm.position.set(
      Math.cos(angle) * ARM_LENGTH * 0.5,
      0,
      Math.sin(angle) * ARM_LENGTH * 0.5
    );
    arm.rotation.y = -angle;
    armGroup.add(arm);

    // Arm reinforcement ridge
    var ridge = new THREE.Mesh(
      new THREE.BoxGeometry(ARM_LENGTH * 0.7, 0.015, 0.1),
      bodyMetallic
    );
    ridge.position.copy(arm.position);
    ridge.position.y = 0.035;
    ridge.rotation.y = -angle;
    armGroup.add(ridge);

    // Motor housing at end of arm
    var motorX = Math.cos(angle) * ARM_LENGTH;
    var motorZ = Math.sin(angle) * ARM_LENGTH;

    var motorGroup = new THREE.Group();
    motorGroup.position.set(motorX, 0, motorZ);
    armGroup.add(motorGroup);
    motorGroups.push(motorGroup);

    // Motor cylinder
    var motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.1, 0.14, 24),
      motorMat
    );
    motor.position.y = 0.07;
    motorGroup.add(motor);

    // Motor cap
    var motorCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      bodyMetallic
    );
    motorCap.position.y = 0.14;
    motorGroup.add(motorCap);

    // Motor ring
    var motorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.008, 8, 24),
      bodyMetallic
    );
    motorRing.rotation.x = Math.PI / 2;
    motorRing.position.y = 0.0;
    motorGroup.add(motorRing);

    // LED indicator at each motor
    var ledM = ai < 2 ? ledGreenMat.clone() : ledRedMat.clone();
    var led = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 12, 12),
      ledM
    );
    led.position.set(0, -0.02, 0.1);
    motorGroup.add(led);

    // LED point light for glow
    var ledPL = new THREE.PointLight(ai < 2 ? 0x00ff44 : 0xff2222, 0.6, 1.5);
    ledPL.position.set(0, -0.02, 0.12);
    motorGroup.add(ledPL);
    ledPointLights.push(ledPL);

    // Propeller (two blades)
    var propGroup = new THREE.Group();
    propGroup.position.y = 0.18;
    motorGroup.add(propGroup);
    propellers.push(propGroup);

    // Blade 1
    var blade1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.008, 0.045),
      propMat
    );
    // Slight twist for realism
    blade1.geometry.translate(0.12, 0, 0);
    propGroup.add(blade1);

    // Blade 2
    var blade2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.008, 0.045),
      propMat
    );
    blade2.geometry.translate(0.12, 0, 0);
    blade2.rotation.y = Math.PI;
    propGroup.add(blade2);

    // Motion blur disc (visible when spinning fast)
    var blurDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 32),
      propBlurMat.clone()
    );
    blurDisc.rotation.x = -Math.PI / 2;
    blurDisc.position.y = 0.18;
    motorGroup.add(blurDisc);
    propBlurs.push(blurDisc);
  }

  /* ─── LANDING LEGS ─── */
  var legPositions = [
    { x: -0.3, z: -0.3 },
    { x: 0.3, z: -0.3 },
    { x: -0.3, z: 0.3 },
    { x: 0.3, z: 0.3 }
  ];
  for (var li = 0; li < 4; li++) {
    var lp = legPositions[li];
    // Vertical strut
    var legVert = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
      legMat
    );
    legVert.position.set(lp.x, -0.42, lp.z);
    droneRoot.add(legVert);

    // Horizontal foot
    var legFoot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8),
      legMat
    );
    legFoot.rotation.x = Math.PI / 2;
    legFoot.position.set(lp.x, -0.55, lp.z);
    droneRoot.add(legFoot);

    // Foot pad
    var footPad = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 6),
      legMat
    );
    footPad.position.set(lp.x, -0.56, lp.z + (lp.z > 0 ? 0.08 : -0.08));
    droneRoot.add(footPad);

    var footPad2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 6),
      legMat
    );
    footPad2.position.set(lp.x, -0.56, lp.z - (lp.z > 0 ? 0.08 : -0.08));
    droneRoot.add(footPad2);
  }

  // Give drone slight tilt for default angled top view
  droneRoot.rotation.x = -0.15;

  /* ── Shadow disc (ground plane illusion) ── */
  var shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.1,
      depthWrite: false
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = -0.8;
  scene.add(shadowDisc);

  /* ══════════════════════════════════════
     ANIMATION STATE
     ══════════════════════════════════════ */
  var clock = new THREE.Clock();
  var running = false;
  var raf = 0;

  // Idle state
  var idleRotorSpeed = 8; // slow gentle spin in idle
  var launchRotorSpeed = 45; // fast spin on click
  var currentRotorSpeed = idleRotorSpeed;
  var targetRotorSpeed = idleRotorSpeed;

  // Launch state
  var launching = false;
  var launchTimer = 0;
  var SPINUP_DURATION = 0.35;  // seconds to spin up rotors
  var LIFT_DURATION = 0.6;     // seconds to lift upward
  var HOLD_DURATION = 0.3;     // seconds to hold at top
  var DESCEND_DURATION = 0.5;  // seconds to descend back
  var launchPhase = 0; // 0=idle, 1=spin-up, 2=lift, 3=hold, 4=descend

  // Camera position (stays fixed)
  var camPos = new THREE.Vector3(0, 3.2, 3.8);
  camera.position.copy(camPos);

  // Drone position for launch
  var droneBaseY = 0;
  var liftHeight = 1.8; // how far up the drone lifts on click

  /* ── Easing ── */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeInQuad(t) { return t * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ── Main Animation Loop ── */
  function animate() {
    raf = requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var dt = clock.getDelta();

    // Smoothly lerp rotor speed toward target
    currentRotorSpeed = lerp(currentRotorSpeed, targetRotorSpeed, 0.08);

    if (!launching) {
      /* ═══ IDLE STATE ═══ */

      // Hovering up-down
      var hoverY = Math.sin(t * 1.5) * 0.04 + Math.sin(t * 3.7) * 0.01;
      droneRoot.position.y = droneBaseY + hoverY;

      // Slight side drift
      droneRoot.position.x = Math.sin(t * 0.7) * 0.015 + Math.sin(t * 1.9) * 0.008;
      droneRoot.position.z = Math.cos(t * 0.5) * 0.01;

      // Body stabilisation corrections
      droneRoot.rotation.z = Math.sin(t * 2.1) * 0.015 + Math.sin(t * 4.3) * 0.005;
      droneRoot.rotation.x = -0.15 + Math.sin(t * 1.8) * 0.01 + Math.sin(t * 3.5) * 0.004;
      droneRoot.rotation.y = t * 0.3;

      // Subtle vibration from rotors
      var vib = Math.sin(t * 45) * 0.0005;
      droneRoot.position.y += vib;

      // Shadow follows hover
      shadowDisc.material.opacity = 0.1 - hoverY * 0.3;

      // Camera steady
      camera.position.copy(camPos);
      camera.lookAt(droneRoot.position);

    } else {
      /* ═══ LAUNCH STATE ═══ */
      launchTimer += dt;

      if (launchPhase === 1) {
        // Phase 1: Spin up rotors (drone stays put, vibrates more)
        var p = clamp(launchTimer / SPINUP_DURATION, 0, 1);
        var pe = easeOutCubic(p);
        targetRotorSpeed = lerp(idleRotorSpeed, launchRotorSpeed, pe);

        // Increasing vibration as power builds
        var powerVib = Math.sin(t * 55) * 0.002 * pe;
        droneRoot.position.y = droneBaseY + Math.sin(t * 2) * 0.03 + powerVib;
        droneRoot.position.x = Math.sin(t * 40) * 0.001 * pe;

        // LEDs intensify during spin-up
        ledGreenMat.emissiveIntensity = 2.5 + pe * 3.0;
        ledRedMat.emissiveIntensity = 2.5 + pe * 3.0;
        for (var li = 0; li < ledPointLights.length; li++) {
          ledPointLights[li].intensity = 0.6 + pe * 1.5;
        }

        if (p >= 1) { launchPhase = 2; launchTimer = 0; }

      } else if (launchPhase === 2) {
        // Phase 2: Lift upward
        var p = clamp(launchTimer / LIFT_DURATION, 0, 1);
        var pe = easeOutCubic(p);

        // Drone rises
        droneRoot.position.y = droneBaseY + pe * liftHeight;

        // Slight nose-up tilt during ascent
        droneRoot.rotation.x = lerp(-0.15, -0.08, pe);

        // Vibration during flight
        var flyVib = Math.sin(t * 60) * 0.0015 * (1 - p * 0.5);
        droneRoot.position.x = flyVib;

        // Shadow shrinks and fades as drone lifts
        shadowDisc.material.opacity = 0.1 * (1 - pe * 0.7);

        // Blur discs more visible at high speed
        for (var bi = 0; bi < propBlurs.length; bi++) {
          propBlurs[bi].material.opacity = 0.15 + pe * 0.12;
        }

        // Camera stays, looks at drone
        camera.position.copy(camPos);
        camera.lookAt(droneRoot.position);

        if (p >= 1) { launchPhase = 3; launchTimer = 0; }

      } else if (launchPhase === 3) {
        // Phase 3: Hold at top briefly
        var p = clamp(launchTimer / HOLD_DURATION, 0, 1);

        // Hover at top with small oscillation
        droneRoot.position.y = droneBaseY + liftHeight + Math.sin(t * 3) * 0.02;
        droneRoot.position.x = Math.sin(t * 50) * 0.001;

        camera.position.copy(camPos);
        camera.lookAt(droneRoot.position);

        if (p >= 1) { launchPhase = 4; launchTimer = 0; }

      } else if (launchPhase === 4) {
        // Phase 4: Descend back smoothly
        var p = clamp(launchTimer / DESCEND_DURATION, 0, 1);
        var pe = easeInOutCubic(p);

        droneRoot.position.y = droneBaseY + liftHeight * (1 - pe);
        droneRoot.rotation.x = lerp(-0.08, -0.15, pe);

        // Rotors slow back down
        targetRotorSpeed = lerp(launchRotorSpeed, idleRotorSpeed, pe);

        // LEDs dim back
        ledGreenMat.emissiveIntensity = lerp(5.5, 2.5, pe);
        ledRedMat.emissiveIntensity = lerp(5.5, 2.5, pe);
        for (var li = 0; li < ledPointLights.length; li++) {
          ledPointLights[li].intensity = lerp(2.1, 0.6, pe);
        }

        // Shadow returns
        shadowDisc.material.opacity = 0.1 * (0.3 + pe * 0.7);

        // Blur discs fade
        for (var bi = 0; bi < propBlurs.length; bi++) {
          propBlurs[bi].material.opacity = lerp(0.27, 0.06, pe);
        }

        camera.position.copy(camPos);
        camera.lookAt(droneRoot.position);

        if (p >= 1) {
          resetDrone();
        }
      }
    }

    // Rotate propellers
    for (var ri = 0; ri < propellers.length; ri++) {
      var dir = ri % 2 === 0 ? 1 : -1;
      propellers[ri].rotation.y += currentRotorSpeed * dt * dir;
    }

    // Propeller blur discs opacity based on speed (idle only)
    if (!launching) {
      var speedFactor = currentRotorSpeed / idleRotorSpeed;
      for (var bi = 0; bi < propBlurs.length; bi++) {
        propBlurs[bi].material.opacity = clamp(0.03 + (speedFactor - 1) * 0.04, 0.03, 0.35);
      }
    }

    // LED pulsing (idle glow — bright and steady with a gentle pulse)
    if (!launching) {
      var ledPulse = 2.0 + Math.sin(t * 2.5) * 0.8;
      ledGreenMat.emissiveIntensity = ledPulse;
      ledRedMat.emissiveIntensity = ledPulse;
      var ledLightPulse = 0.4 + Math.sin(t * 2.5) * 0.25;
      for (var pli = 0; pli < ledPointLights.length; pli++) {
        ledPointLights[pli].intensity = ledLightPulse;
      }
    }

    renderer.render(scene, camera);
  }

  /* ── Reset drone after launch ── */
  function resetDrone() {
    launching = false;
    launchPhase = 0;
    launchTimer = 0;
    droneRoot.position.set(0, 0, 0);
    droneRoot.rotation.set(-0.15, 0, 0);
    camera.position.copy(camPos);
    camera.lookAt(0, 0, 0);
    targetRotorSpeed = idleRotorSpeed;
    shadowDisc.material.opacity = 0.1;
    for (var i = 0; i < propBlurs.length; i++) {
      propBlurs[i].material.opacity = 0.06;
    }
  }

  /* ── Launch trigger ── */
  function triggerLaunch() {
    if (launching) return;
    launching = true;
    launchPhase = 1;
    launchTimer = 0;

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Click handler ── */
  container.addEventListener('click', function () {
    triggerLaunch();
  });

  /* ── Visibility (tied to scroll via .visible class observation) ── */
  // The parent .back-to-top element handles visibility via CSS
  // We just need to start/stop the render loop

  function startLoop() {
    if (!running) {
      running = true;
      clock.start();
      animate();
    }
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Use MutationObserver to detect when .back-to-top becomes visible
  var backToTopBtn = container.closest('.back-to-top');
  if (backToTopBtn) {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'class') {
          if (backToTopBtn.classList.contains('visible')) {
            startLoop();
          } else {
            stopLoop();
            // Reset drone when hidden
            if (launching) resetDrone();
          }
        }
      }
    });
    observer.observe(backToTopBtn, { attributes: true });

    // Initial check
    if (backToTopBtn.classList.contains('visible')) {
      startLoop();
    }
  }

  /* ── Resize ── */
  window.addEventListener('resize', function () {
    var newMob = window.innerWidth <= 768;
    var newSmall = window.innerWidth <= 480;
    W = newSmall ? 62 : (newMob ? 72 : 110);
    H = newSmall ? 62 : (newMob ? 72 : 110);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

})();
