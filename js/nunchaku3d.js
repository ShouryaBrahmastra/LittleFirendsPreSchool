/* ============================================
   Three.js 3D Karate Nunchaku Animation
   Human-like martial artist with black belt
   performing nunchaku tricks
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  function boot() {
    var wrap = document.getElementById('nunchakuWrap');
    if (!wrap) return;

    var W = wrap.clientWidth || 400;
    var H = wrap.clientHeight || 400;

    /* ── Renderer ── */
    var canvas = document.getElementById('nunchakuCanvas');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* ── Scene & Camera ── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 1.5, 0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0x404060, 0.8));

    var key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xff6b6b, 0.6);
    fill.position.set(-3, 3, 3);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0x4ecdc4, 0.5);
    rim.position.set(0, -1, -3);
    scene.add(rim);

    /* ── Environment map ── */
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1c1a2e);
    var el1 = new THREE.PointLight(0xff6b6b, 6, 10); el1.position.set(3, 3, 3); envScene.add(el1);
    var el2 = new THREE.PointLight(0xffffff, 8, 12); el2.position.set(-2, 5, 2); envScene.add(el2);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmrem.dispose();

    /* ── Floor ── */
    var floorGeom = new THREE.PlaneGeometry(10, 10);
    var floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, metalness: 0.3, roughness: 0.8
    });
    var floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ── Materials ── */
    var matSkin = new THREE.MeshStandardMaterial({
      color: 0xE8B89D, metalness: 0.02, roughness: 0.55
    });
    var matHair = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, metalness: 0.15, roughness: 0.5
    });
    var matGi = new THREE.MeshStandardMaterial({
      color: 0xF5F5F0, metalness: 0, roughness: 0.7
    });
    var matGiLapel = new THREE.MeshStandardMaterial({
      color: 0xE8E8E0, metalness: 0, roughness: 0.65
    });
    var matBelt = new THREE.MeshStandardMaterial({
      color: 0x111111, metalness: 0.3, roughness: 0.4
    });
    var matPants = new THREE.MeshStandardMaterial({
      color: 0xF0F0E8, metalness: 0, roughness: 0.7
    });
    var matShoe = new THREE.MeshStandardMaterial({
      color: 0x222222, metalness: 0.1, roughness: 0.5
    });
    var matWood = new THREE.MeshStandardMaterial({
      color: 0x8B4513, metalness: 0.15, roughness: 0.3, envMapIntensity: 1.0
    });
    var matChain = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0, metalness: 0.9, roughness: 0.1, envMapIntensity: 1.5
    });
    var matEye = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, metalness: 0, roughness: 0.3
    });
    var matEyeWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.3
    });

    /* Helper: create a capsule-like limb (cylinder + sphere caps) */
    function makeLimb(rTop, rBot, height, segs, mat) {
      var g = new THREE.Group();
      var cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, height, segs), mat);
      g.add(cyl);
      var capTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, segs, segs / 2, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      capTop.position.y = height / 2;
      g.add(capTop);
      var capBot = new THREE.Mesh(new THREE.SphereGeometry(rBot, segs, segs / 2, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      capBot.position.y = -height / 2;
      g.add(capBot);
      return g;
    }

    /* ── Build character ── */
    var charGroup = new THREE.Group();
    scene.add(charGroup);

    /* ── HEAD ── */
    var headGroup = new THREE.Group();
    headGroup.position.set(0, 3.1, 0);
    charGroup.add(headGroup);
    var head = headGroup; // alias for animation

    // Cranium — slightly oval
    var cranium = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 20), matSkin
    );
    cranium.scale.set(1, 1.08, 1.0);
    cranium.castShadow = true;
    headGroup.add(cranium);

    // Hair — back cap covering top/back of head
    var hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), matHair
    );
    hairBack.position.y = 0.02;
    headGroup.add(hairBack);

    // Side hair tufts
    var hairSideR = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 8), matHair
    );
    hairSideR.position.set(0.17, 0.06, 0);
    hairSideR.scale.set(0.6, 1.2, 0.9);
    headGroup.add(hairSideR);
    var hairSideL = hairSideR.clone();
    hairSideL.position.set(-0.17, 0.06, 0);
    headGroup.add(hairSideL);

    // Eyes — white + pupil
    [-1, 1].forEach(function(side) {
      var eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 10), matEyeWhite
      );
      eyeWhite.position.set(side * 0.075, 0.03, 0.17);
      eyeWhite.scale.set(1.1, 0.75, 0.5);
      headGroup.add(eyeWhite);
      var pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 8), matEye
      );
      pupil.position.set(side * 0.075, 0.025, 0.19);
      pupil.scale.set(1, 0.85, 0.5);
      headGroup.add(pupil);
    });

    // Nose — small elongated sphere
    var nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 10, 8), matSkin
    );
    nose.position.set(0, -0.02, 0.19);
    nose.scale.set(0.7, 1.0, 0.8);
    headGroup.add(nose);

    // Ears
    [-1, 1].forEach(function(side) {
      var ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 10, 8), matSkin
      );
      ear.position.set(side * 0.2, 0.0, 0);
      ear.scale.set(0.4, 0.8, 0.7);
      headGroup.add(ear);
    });

    // Mouth — subtle dark line
    var mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.008, 0.01), matEye
    );
    mouth.position.set(0, -0.08, 0.19);
    headGroup.add(mouth);

    /* ── NECK ── */
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.09, 0.15, 12), matSkin
    );
    neck.position.set(0, 2.95, 0);
    charGroup.add(neck);

    /* ── TORSO ── */
    // Main torso — tapered capsule shape (wider shoulders, narrower waist)
    var torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 2.5, 0);
    charGroup.add(torsoGroup);
    var torso = torsoGroup; // alias for animation

    // Upper chest
    var chest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.38, 12), matGi
    );
    chest.position.set(0, 0.15, 0);
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Lower torso (waist area)
    var waist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.38, 12), matGi
    );
    waist.position.set(0, -0.18, 0);
    waist.castShadow = true;
    torsoGroup.add(waist);

    // Gi lapel V-shape on chest
    var lapelR = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.35, 0.02), matGiLapel
    );
    lapelR.position.set(0.06, 0.08, 0.17);
    lapelR.rotation.z = -0.2;
    torsoGroup.add(lapelR);
    var lapelL = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.35, 0.02), matGiLapel
    );
    lapelL.position.set(-0.06, 0.08, 0.17);
    lapelL.rotation.z = 0.2;
    torsoGroup.add(lapelL);

    // Shoulder caps (deltoids)
    var shoulderR = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 10), matGi
    );
    shoulderR.position.set(0.32, 0.28, 0);
    shoulderR.scale.set(1.0, 0.75, 0.85);
    torsoGroup.add(shoulderR);
    var shoulderL = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 10), matGi
    );
    shoulderL.position.set(-0.32, 0.28, 0);
    shoulderL.scale.set(1.0, 0.75, 0.85);
    torsoGroup.add(shoulderL);

    /* ── BELT ── */
    var belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.29, 0.29, 0.07, 16), matBelt
    );
    belt.position.set(0, 2.12, 0);
    charGroup.add(belt);

    // Belt knot (front)
    var beltKnot = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 8), matBelt
    );
    beltKnot.position.set(0, 2.12, 0.28);
    beltKnot.scale.set(1, 1.6, 0.7);
    charGroup.add(beltKnot);

    // Belt tails hanging down
    var beltTail = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.25, 0.018), matBelt
    );
    beltTail.position.set(0.04, 2.0, 0.28);
    beltTail.rotation.z = 0.15;
    charGroup.add(beltTail);
    var beltTail2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.22, 0.018), matBelt
    );
    beltTail2.position.set(-0.04, 2.01, 0.28);
    beltTail2.rotation.z = -0.12;
    charGroup.add(beltTail2);

    /* ── HIPS / PELVIS ── */
    var hips = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.25, 0.2, 12), matPants
    );
    hips.position.set(0, 1.95, 0);
    charGroup.add(hips);

    /* ── ARMS ── */
    // Right upper arm
    var rightUpperArm = new THREE.Group();
    rightUpperArm.position.set(0.35, 2.78, 0);
    charGroup.add(rightUpperArm);
    // Bicep — capsule limb
    var ruaLimb = makeLimb(0.085, 0.07, 0.4, 12, matGi);
    ruaLimb.position.set(0, -0.22, 0);
    ruaLimb.castShadow = true;
    rightUpperArm.add(ruaLimb);

    // Elbow joint sphere
    var rElbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8), matSkin
    );
    rElbow.position.set(0, -0.44, 0);
    rightUpperArm.add(rElbow);

    // Left upper arm
    var leftUpperArm = new THREE.Group();
    leftUpperArm.position.set(-0.35, 2.78, 0);
    charGroup.add(leftUpperArm);
    var luaLimb = makeLimb(0.085, 0.07, 0.4, 12, matGi);
    luaLimb.position.set(0, -0.22, 0);
    luaLimb.castShadow = true;
    leftUpperArm.add(luaLimb);

    var lElbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8), matSkin
    );
    lElbow.position.set(0, -0.44, 0);
    leftUpperArm.add(lElbow);

    // Forearms
    var rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.45, 0);
    rightUpperArm.add(rightForearm);
    var rfaLimb = makeLimb(0.065, 0.05, 0.38, 12, matSkin);
    rfaLimb.position.set(0, -0.19, 0);
    rightForearm.add(rfaLimb);

    var leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.45, 0);
    leftUpperArm.add(leftForearm);
    var lfaLimb = makeLimb(0.065, 0.05, 0.38, 12, matSkin);
    lfaLimb.position.set(0, -0.19, 0);
    leftForearm.add(lfaLimb);

    // Wrist joints
    var rWrist = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), matSkin);
    rWrist.position.set(0, -0.4, 0);
    rightForearm.add(rWrist);
    var lWrist = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), matSkin);
    lWrist.position.set(0, -0.4, 0);
    leftForearm.add(lWrist);

    // Hands — palm + fingers
    var rightHand = new THREE.Group();
    rightHand.position.set(0, -0.42, 0);
    rightForearm.add(rightHand);
    var rPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.08, 0.04, 1, 1, 1), matSkin
    );
    rPalm.scale.set(1, 1, 1);
    rightHand.add(rPalm);
    // Fingers (4 grouped)
    var rFingers = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.03), matSkin
    );
    rFingers.position.y = -0.06;
    rightHand.add(rFingers);
    // Thumb
    var rThumb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 0.05, 6), matSkin
    );
    rThumb.position.set(0.04, -0.01, 0.02);
    rThumb.rotation.z = -0.5;
    rightHand.add(rThumb);

    var leftHand = new THREE.Group();
    leftHand.position.set(0, -0.42, 0);
    leftForearm.add(leftHand);
    var lPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.08, 0.04), matSkin
    );
    leftHand.add(lPalm);
    var lFingers = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.03), matSkin
    );
    lFingers.position.y = -0.06;
    leftHand.add(lFingers);
    var lThumb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 0.05, 6), matSkin
    );
    lThumb.position.set(-0.04, -0.01, 0.02);
    lThumb.rotation.z = 0.5;
    leftHand.add(lThumb);

    /* ── LEGS ── */
    // Right upper leg (thigh)
    var rightLeg = new THREE.Group();
    rightLeg.position.set(0.12, 1.85, 0);
    charGroup.add(rightLeg);
    // Hip joint
    var rHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), matPants);
    rightLeg.add(rHipJoint);
    // Thigh
    var rlLimb = makeLimb(0.1, 0.085, 0.7, 12, matPants);
    rlLimb.position.set(0, -0.38, 0);
    rlLimb.castShadow = true;
    rightLeg.add(rlLimb);

    // Knee joint
    var rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), matPants);
    rKnee.position.set(0, -0.75, 0);
    rightLeg.add(rKnee);

    // Right lower leg (shin)
    var rightLowerLeg = new THREE.Group();
    rightLowerLeg.position.set(0, -0.8, 0);
    rightLeg.add(rightLowerLeg);
    var rllLimb = makeLimb(0.08, 0.06, 0.65, 12, matPants);
    rllLimb.position.set(0, -0.33, 0);
    rightLowerLeg.add(rllLimb);

    // Right ankle + foot
    var rAnkle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), matSkin);
    rAnkle.position.set(0, -0.68, 0);
    rightLowerLeg.add(rAnkle);
    var rightFoot = new THREE.Group();
    rightFoot.position.set(0, -0.72, 0.04);
    rightLowerLeg.add(rightFoot);
    var rFootBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.06, 0.14), matShoe
    );
    rightFoot.add(rFootBack);
    var rFootFront = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), matShoe
    );
    rFootFront.rotation.x = Math.PI / 2;
    rFootFront.position.set(0, -0.01, 0.08);
    rightFoot.add(rFootFront);

    // Left upper leg
    var leftLeg = new THREE.Group();
    leftLeg.position.set(-0.12, 1.85, 0);
    charGroup.add(leftLeg);
    var lHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), matPants);
    leftLeg.add(lHipJoint);
    var llLimb = makeLimb(0.1, 0.085, 0.7, 12, matPants);
    llLimb.position.set(0, -0.38, 0);
    llLimb.castShadow = true;
    leftLeg.add(llLimb);

    var lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), matPants);
    lKnee.position.set(0, -0.75, 0);
    leftLeg.add(lKnee);

    // Left lower leg
    var leftLowerLeg = new THREE.Group();
    leftLowerLeg.position.set(0, -0.8, 0);
    leftLeg.add(leftLowerLeg);
    var lllLimb = makeLimb(0.08, 0.06, 0.65, 12, matPants);
    lllLimb.position.set(0, -0.33, 0);
    leftLowerLeg.add(lllLimb);

    var lAnkle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), matSkin);
    lAnkle.position.set(0, -0.68, 0);
    leftLowerLeg.add(lAnkle);
    var leftFoot = new THREE.Group();
    leftFoot.position.set(0, -0.72, 0.04);
    leftLowerLeg.add(leftFoot);
    var lFootBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.06, 0.14), matShoe
    );
    leftFoot.add(lFootBack);
    var lFootFront = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), matShoe
    );
    lFootFront.rotation.x = Math.PI / 2;
    lFootFront.position.set(0, -0.01, 0.08);
    leftFoot.add(lFootFront);

    /* ── Helper: build one nunchaku ── */
    function makeNunchaku() {
      var g = new THREE.Group();
      var hGeom = new THREE.CylinderGeometry(0.035, 0.03, 0.4, 12);
      // Handle A (held)
      var hA = new THREE.Mesh(hGeom, matWood);
      hA.position.set(0, -0.2, 0);
      g.add(hA);
      // Chain
      var cg = new THREE.Group();
      cg.position.set(0, -0.42, 0);
      g.add(cg);
      for (var i = 0; i < 3; i++) {
        var lk = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 12), matChain);
        lk.position.set(0, -i * 0.04, 0);
        lk.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
        cg.add(lk);
      }
      // Handle B pivot (swinging end)
      var pivot = new THREE.Group();
      pivot.position.set(0, -0.12, 0);
      cg.add(pivot);
      var hB = new THREE.Mesh(hGeom, matWood);
      hB.position.set(0, -0.2, 0);
      pivot.add(hB);
      // End caps
      var capG = new THREE.CylinderGeometry(0.038, 0.038, 0.02, 12);
      var capM = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.3 });
      [hA, hB].forEach(function(h) {
        var ct = new THREE.Mesh(capG, capM); ct.position.y = 0.2; h.add(ct);
        var cb = new THREE.Mesh(capG, capM); cb.position.y = -0.2; h.add(cb);
      });
      return { group: g, pivot: pivot };
    }

    /* ── RIGHT Nunchaku ── */
    var nkR = makeNunchaku();
    var nunchakuGroup = nkR.group;       // alias for right
    var handleBPivot = nkR.pivot;        // alias for right
    rightHand.add(nunchakuGroup);
    nunchakuGroup.position.set(0, -0.06, 0);

    /* ── LEFT Nunchaku ── */
    var nkL = makeNunchaku();
    var nunchakuGroupL = nkL.group;
    var handleBPivotL = nkL.pivot;
    leftHand.add(nunchakuGroupL);
    nunchakuGroupL.position.set(0, -0.06, 0);

    /* ── Particles ── */
    var pCount = 40;
    var pGeom = new THREE.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    var pCol = new Float32Array(pCount * 3);
    var pSpeeds = [];
    var palette = [0xff6b6b, 0xffe66d, 0x4ecdc4, 0xa78bfa, 0xff8c00];
    for (var pi = 0; pi < pCount; pi++) {
      pPos[pi * 3] = (Math.random() - 0.5) * 6;
      pPos[pi * 3 + 1] = Math.random() * 5;
      pPos[pi * 3 + 2] = (Math.random() - 0.5) * 4;
      var pc = new THREE.Color(palette[pi % palette.length]);
      pCol[pi * 3] = pc.r; pCol[pi * 3 + 1] = pc.g; pCol[pi * 3 + 2] = pc.b;
      pSpeeds.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.004,
        z: (Math.random() - 0.5) * 0.004
      });
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    var pMat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(pGeom, pMat));

    /* ═══════════════════════════════════════════
       HYPER-REALISTIC DUAL-NUNCHAKU ANIMATION
       Real martial-arts phases with smooth lerp
       ═══════════════════════════════════════════ */

    /* ── Smooth interpolation helpers ── */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeIO(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }

    /* Current & target joint angles — lerped each frame for velvet motion */
    var J = {}, JT = {};
    var JOINTS = [
      'bodyY', 'torsoX', 'torsoZ',
      'headX', 'headY',
      'rUAx', 'rUAz', 'rFAx', 'rFAz',
      'lUAx', 'lUAz', 'lFAx', 'lFAz',
      'rLx', 'rLz', 'rLLx',
      'lLx', 'lLz', 'lLLx',
      'nkRx', 'nkRy', 'nkRz', 'bpRx', 'bpRz',
      'nkLx', 'nkLy', 'nkLz', 'bpLx', 'bpLz'
    ];
    JOINTS.forEach(function(k) { J[k] = 0; JT[k] = 0; });

    /* Apply lerped joint state to the rig */
    function applyJoints() {
      charGroup.rotation.y = J.bodyY;
      torso.rotation.x = J.torsoX;
      torso.rotation.z = J.torsoZ;
      head.rotation.x = J.headX;
      head.rotation.y = J.headY;
      rightUpperArm.rotation.x = J.rUAx;
      rightUpperArm.rotation.z = J.rUAz;
      rightForearm.rotation.x = J.rFAx;
      rightForearm.rotation.z = J.rFAz;
      leftUpperArm.rotation.x = J.lUAx;
      leftUpperArm.rotation.z = J.lUAz;
      leftForearm.rotation.x = J.lFAx;
      leftForearm.rotation.z = J.lFAz;
      rightLeg.rotation.x = J.rLx;
      rightLeg.rotation.z = J.rLz;
      rightLowerLeg.rotation.x = J.rLLx;
      leftLeg.rotation.x = J.lLx;
      leftLeg.rotation.z = J.lLz;
      leftLowerLeg.rotation.x = J.lLLx;
      nunchakuGroup.rotation.x = J.nkRx;
      nunchakuGroup.rotation.y = J.nkRy;
      nunchakuGroup.rotation.z = J.nkRz;
      handleBPivot.rotation.x = J.bpRx;
      handleBPivot.rotation.z = J.bpRz;
      nunchakuGroupL.rotation.x = J.nkLx;
      nunchakuGroupL.rotation.y = J.nkLy;
      nunchakuGroupL.rotation.z = J.nkLz;
      handleBPivotL.rotation.x = J.bpLx;
      handleBPivotL.rotation.z = J.bpLz;
    }

    /* Lerp all joints toward their targets */
    var JOINT_SPEED = 6.0; // higher = snappier
    function lerpJoints(dt) {
      var f = 1 - Math.exp(-JOINT_SPEED * dt);
      JOINTS.forEach(function(k) { J[k] = lerp(J[k], JT[k], f); });
    }

    /* ── Phase schedule ── */
    var PHASE_SCHEDULE = [
      { name: 'ready',      dur: 2.0 },
      { name: 'altSwing',   dur: 5.0 },
      { name: 'dblFig8',    dur: 5.0 },
      { name: 'ready',      dur: 1.5 },
      { name: 'windmill',   dur: 4.5 },
      { name: 'crossStrike',dur: 4.5 },
      { name: 'ready',      dur: 1.5 },
      { name: 'behindBack', dur: 4.5 },
      { name: 'overhead',   dur: 4.0 },
      { name: 'underArm',   dur: 4.5 },
      { name: 'ready',      dur: 2.0 }
    ];
    var phaseIdx = 0, phaseTime = 0;
    var phaseDur = PHASE_SCHEDULE[0].dur;
    var phaseName = PHASE_SCHEDULE[0].name;

    function nextPhase() {
      phaseIdx = (phaseIdx + 1) % PHASE_SCHEDULE.length;
      phaseName = PHASE_SCHEDULE[phaseIdx].name;
      phaseDur = PHASE_SCHEDULE[phaseIdx].dur;
      phaseTime = 0;
    }

    /* ── Breathing (subtle torso expansion) ── */
    function breath(time) {
      return Math.sin(time * 1.6) * 0.015;
    }

    /* ═══════════  POSE FUNCTIONS  ═══════════
       Each sets JT (target joints) — the lerp system smooths everything.
       `t` = 0→1 within phase, `time` = global elapsed seconds.
    */

    /* 1. Ready / Yoi stance — nunchaku tucked under each arm */
    function poseReady(t, time) {
      var b = breath(time);
      JT.bodyY = Math.sin(time * 0.6) * 0.02;
      JT.torsoX = b;
      JT.torsoZ = 0;
      JT.headX = 0;
      JT.headY = Math.sin(time * 0.5) * 0.06;
      // Arms: nunchaku held alongside forearms, relaxed guard
      JT.rUAx = -0.35; JT.rUAz = 0.35;
      JT.rFAx = -0.9;  JT.rFAz = 0;
      JT.lUAx = -0.35; JT.lUAz = -0.35;
      JT.lFAx = -0.9;  JT.lFAz = 0;
      // Nunchaku: gently dangle
      JT.nkRx = Math.sin(time * 1.2) * 0.12;
      JT.nkRy = 0; JT.nkRz = Math.sin(time * 0.9) * 0.08;
      JT.bpRx = Math.sin(time * 1.8) * 0.2;  JT.bpRz = 0;
      JT.nkLx = Math.sin(time * 1.2 + 0.5) * 0.12;
      JT.nkLy = 0; JT.nkLz = Math.sin(time * 0.9 + 0.5) * 0.08;
      JT.bpLx = Math.sin(time * 1.8 + 0.5) * 0.2;  JT.bpLz = 0;
      // Easy stance
      JT.rLx = 0.05; JT.rLz = 0.06;
      JT.lLx = -0.05; JT.lLz = -0.06;
      JT.rLLx = 0; JT.lLLx = 0;
    }

    /* 2. Alternating swings — right swings outward, then left, like real practice */
    function poseAltSwing(t, time) {
      var b = breath(time);
      var cycle = (time * 1.8) % (Math.PI * 2);
      var rPhase = Math.sin(cycle);
      var lPhase = Math.sin(cycle + Math.PI); // opposite

      JT.bodyY = Math.sin(cycle) * 0.2;
      JT.torsoX = b + Math.sin(cycle) * 0.06;
      JT.torsoZ = Math.sin(cycle) * 0.04;
      JT.headY = Math.sin(cycle) * 0.12;
      JT.headX = 0;

      // Right arm: swings when rPhase > 0
      var rI = Math.max(0, rPhase);
      JT.rUAx = -0.6 - rI * 1.2;
      JT.rUAz = 0.3 + rI * 0.6;
      JT.rFAx = -0.5 - rI * 0.5;
      JT.rFAz = rI * 0.3;

      // Left arm: swings when lPhase > 0
      var lI = Math.max(0, lPhase);
      JT.lUAx = -0.6 - lI * 1.2;
      JT.lUAz = -0.3 - lI * 0.6;
      JT.lFAx = -0.5 - lI * 0.5;
      JT.lFAz = -lI * 0.3;

      // Right nunchaku: fast whip on active phase
      JT.nkRx = Math.sin(time * 5) * (0.3 + rI * 2.5);
      JT.nkRy = 0;
      JT.nkRz = Math.cos(time * 4) * rI * 1.2;
      JT.bpRx = Math.sin(time * 7) * (0.2 + rI * 2.8);
      JT.bpRz = Math.cos(time * 6) * rI * 1.5;

      // Left nunchaku
      JT.nkLx = Math.sin(time * 5 + Math.PI) * (0.3 + lI * 2.5);
      JT.nkLy = 0;
      JT.nkLz = Math.cos(time * 4 + Math.PI) * lI * 1.2;
      JT.bpLx = Math.sin(time * 7 + Math.PI) * (0.2 + lI * 2.8);
      JT.bpLz = Math.cos(time * 6 + Math.PI) * lI * 1.5;

      // Weight shift legs
      JT.rLx = rPhase * 0.12; JT.rLz = 0.05;
      JT.lLx = lPhase * 0.12; JT.lLz = -0.05;
      JT.rLLx = Math.max(0, rPhase) * 0.1;
      JT.lLLx = Math.max(0, lPhase) * 0.1;
    }

    /* 3. Double figure-8 — both hands trace mirrored figure-8 patterns */
    function poseDblFig8(t, time) {
      var b = breath(time);
      var s = time * 2.2;
      var intensity = Math.sin(t * Math.PI);

      JT.bodyY = Math.sin(s * 0.5) * 0.15 * intensity;
      JT.torsoX = b + Math.sin(s * 0.7) * 0.05;
      JT.torsoZ = Math.sin(s * 0.6) * 0.04;
      JT.headY = Math.sin(s * 0.8) * 0.1;
      JT.headX = 0;

      // Arms trace wide arcs
      var ax = Math.sin(s) * 0.8 * intensity;
      var az = Math.cos(s * 0.5) * 0.4 * intensity;
      JT.rUAx = -1.0 + ax;    JT.rUAz = 0.3 + az;
      JT.rFAx = -0.4 + Math.sin(s * 1.3) * 0.6 * intensity;
      JT.rFAz = Math.cos(s * 1.1) * 0.3 * intensity;

      JT.lUAx = -1.0 - ax;    JT.lUAz = -0.3 - az;  // mirrored
      JT.lFAx = -0.4 - Math.sin(s * 1.3) * 0.6 * intensity;
      JT.lFAz = -Math.cos(s * 1.1) * 0.3 * intensity;

      // Both nunchaku: figure-8
      JT.nkRx = Math.sin(s * 2) * 2.2 * intensity;
      JT.nkRy = 0;
      JT.nkRz = Math.cos(s) * 1.5 * intensity;
      JT.bpRx = Math.sin(s * 3) * 3.0 * intensity;
      JT.bpRz = Math.cos(s * 2.5) * 2.0 * intensity;

      JT.nkLx = Math.sin(s * 2 + Math.PI) * 2.2 * intensity;
      JT.nkLy = 0;
      JT.nkLz = Math.cos(s + Math.PI) * 1.5 * intensity;
      JT.bpLx = Math.sin(s * 3 + Math.PI) * 3.0 * intensity;
      JT.bpLz = Math.cos(s * 2.5 + Math.PI) * 2.0 * intensity;

      JT.rLx = Math.sin(s * 0.4) * 0.08;  JT.rLz = 0.06;
      JT.lLx = -Math.sin(s * 0.4) * 0.08; JT.lLz = -0.06;
      JT.rLLx = 0; JT.lLLx = 0;
    }

    /* 4. Windmill — both spinning in opposite directions, arms out wide */
    function poseWindmill(t, time) {
      var b = breath(time);
      var intensity = Math.sin(t * Math.PI);
      var sp = time * 4;

      JT.bodyY = Math.sin(time * 1.0) * 0.1 * intensity;
      JT.torsoX = b - 0.05 * intensity;
      JT.torsoZ = 0;
      JT.headX = -0.08 * intensity;
      JT.headY = 0;

      // Arms out and slightly angled for windmill
      JT.rUAx = -1.8 * intensity;  JT.rUAz = 0.5 * intensity;
      JT.rFAx = -0.3;              JT.rFAz = 0;
      JT.lUAx = -1.8 * intensity;  JT.lUAz = -0.5 * intensity;
      JT.lFAx = -0.3;              JT.lFAz = 0;

      // Right: clockwise spin
      JT.nkRx = Math.sin(sp) * 1.8 * intensity;
      JT.nkRy = Math.cos(sp) * 0.5 * intensity;
      JT.nkRz = Math.cos(sp) * 1.8 * intensity;
      JT.bpRx = Math.sin(sp * 1.5) * 2.5 * intensity;
      JT.bpRz = Math.cos(sp * 1.3) * 2.0 * intensity;

      // Left: counter-clockwise
      JT.nkLx = Math.sin(-sp) * 1.8 * intensity;
      JT.nkLy = Math.cos(-sp) * 0.5 * intensity;
      JT.nkLz = Math.cos(-sp) * 1.8 * intensity;
      JT.bpLx = Math.sin(-sp * 1.5) * 2.5 * intensity;
      JT.bpLz = Math.cos(-sp * 1.3) * 2.0 * intensity;

      // Power stance
      JT.rLx = 0.12; JT.rLz = 0.12;
      JT.lLx = -0.12; JT.lLz = -0.12;
      JT.rLLx = 0; JT.lLLx = 0;
    }

    /* 5. Cross-body strikes — alternating diagonal slashes */
    function poseCrossStrike(t, time) {
      var b = breath(time);
      var cycle = time * 2.5;
      var beatR = Math.sin(cycle);
      var beatL = Math.sin(cycle + Math.PI);

      JT.bodyY = Math.sin(cycle * 0.8) * 0.25;
      JT.torsoX = b + 0.08 * Math.sin(cycle);
      JT.torsoZ = Math.sin(cycle) * 0.1;
      JT.headY = Math.sin(cycle * 0.9) * 0.15;
      JT.headX = 0;

      // Right arm: high-to-low diagonal slash
      var rS = Math.max(0, beatR);
      JT.rUAx = -0.8 - rS * 1.5;
      JT.rUAz = 0.2 + rS * 0.8 - Math.max(0, -beatR) * 0.4;
      JT.rFAx = -0.6 - rS * 0.4;
      JT.rFAz = rS * 0.4;

      // Left arm: mirrors with offset
      var lS = Math.max(0, beatL);
      JT.lUAx = -0.8 - lS * 1.5;
      JT.lUAz = -0.2 - lS * 0.8 + Math.max(0, -beatL) * 0.4;
      JT.lFAx = -0.6 - lS * 0.4;
      JT.lFAz = -lS * 0.4;

      // Nunchaku: aggressive whipping on strike beats
      JT.nkRx = Math.sin(time * 6) * (0.4 + rS * 2.2);
      JT.nkRy = 0;
      JT.nkRz = beatR * 1.5;
      JT.bpRx = Math.sin(time * 8) * (0.3 + rS * 3.0);
      JT.bpRz = Math.cos(time * 7) * rS * 2.0;

      JT.nkLx = Math.sin(time * 6 + Math.PI) * (0.4 + lS * 2.2);
      JT.nkLy = 0;
      JT.nkLz = beatL * 1.5;
      JT.bpLx = Math.sin(time * 8 + Math.PI) * (0.3 + lS * 3.0);
      JT.bpLz = Math.cos(time * 7 + Math.PI) * lS * 2.0;

      // Lunging legs
      JT.rLx = 0.15 * beatR;  JT.rLz = 0.05;
      JT.lLx = 0.15 * beatL;  JT.lLz = -0.05;
      JT.rLLx = Math.max(0, beatR) * 0.15;
      JT.lLLx = Math.max(0, beatL) * 0.15;
    }

    /* 6. Behind-the-back pass — arms wrap behind, nunchaku spin behind torso */
    function poseBehindBack(t, time) {
      var b = breath(time);
      var intensity = Math.sin(t * Math.PI);
      var cycle = time * 2.0;
      var phase = Math.sin(cycle);

      JT.bodyY = Math.sin(cycle * 0.7) * 0.3 * intensity;
      JT.torsoX = b - 0.08 * intensity;
      JT.torsoZ = phase * 0.06 * intensity;
      JT.headY = -phase * 0.15 * intensity;
      JT.headX = 0;

      // Arms reach behind alternately
      var rBehind = Math.max(0, phase);
      var lBehind = Math.max(0, -phase);

      JT.rUAx = -0.4 - rBehind * 0.8;
      JT.rUAz = 0.3 + rBehind * 1.2 * intensity;
      JT.rFAx = -0.7 - rBehind * 0.4;
      JT.rFAz = rBehind * 0.5 * intensity;

      JT.lUAx = -0.4 - lBehind * 0.8;
      JT.lUAz = -0.3 - lBehind * 1.2 * intensity;
      JT.lFAx = -0.7 - lBehind * 0.4;
      JT.lFAz = -lBehind * 0.5 * intensity;

      // Nunchaku spin behind — fast rotation
      JT.nkRx = time * 5 * intensity * rBehind + Math.sin(time * 3) * 0.5;
      JT.nkRy = 0;
      JT.nkRz = Math.PI * rBehind * intensity;
      JT.bpRx = time * 7 * intensity * rBehind;
      JT.bpRz = Math.cos(time * 5) * 2.0 * rBehind * intensity;

      JT.nkLx = time * 5 * intensity * lBehind + Math.sin(time * 3 + 1) * 0.5;
      JT.nkLy = 0;
      JT.nkLz = -Math.PI * lBehind * intensity;
      JT.bpLx = time * 7 * intensity * lBehind;
      JT.bpLz = -Math.cos(time * 5) * 2.0 * lBehind * intensity;

      // Shifting weight
      JT.rLx = phase * 0.12 * intensity; JT.rLz = 0.06;
      JT.lLx = -phase * 0.12 * intensity; JT.lLz = -0.06;
      JT.rLLx = rBehind * 0.08; JT.lLLx = lBehind * 0.08;
    }

    /* 7. Overhead double helicopter — both spinning above head */
    function poseOverhead(t, time) {
      var b = breath(time);
      var intensity = Math.sin(t * Math.PI);
      var sp = time * 6;

      JT.bodyY = Math.sin(time * 1.2) * 0.1;
      JT.torsoX = b - 0.12 * intensity;
      JT.torsoZ = 0;
      JT.headX = -0.12 * intensity;
      JT.headY = 0;

      // Both arms raised high
      JT.rUAx = -2.6 * intensity;  JT.rUAz = 0.25;
      JT.rFAx = -0.15;             JT.rFAz = 0;
      JT.lUAx = -2.6 * intensity;  JT.lUAz = -0.25;
      JT.lFAx = -0.15;             JT.lFAz = 0;

      // Helicopter spin — both rotate in Y (horizontal plane above head)
      JT.nkRx = 0;
      JT.nkRy = sp * intensity;
      JT.nkRz = Math.PI * 0.45 * intensity;
      JT.bpRx = Math.sin(sp * 1.2) * 1.2 * intensity;
      JT.bpRz = sp * 0.5 * intensity;

      JT.nkLx = 0;
      JT.nkLy = -sp * intensity;  // counter-rotate
      JT.nkLz = -Math.PI * 0.45 * intensity;
      JT.bpLx = Math.sin(-sp * 1.2) * 1.2 * intensity;
      JT.bpLz = -sp * 0.5 * intensity;

      // Stable power stance
      JT.rLx = 0.12; JT.rLz = 0.1;
      JT.lLx = -0.12; JT.lLz = -0.1;
      JT.rLLx = 0; JT.lLLx = 0;
    }

    /* 8. Under-arm tuck & release — tuck under armpit, flick out */
    function poseUnderArm(t, time) {
      var b = breath(time);
      var intensity = Math.sin(t * Math.PI);
      var cycle = time * 2.0;
      // Right tucks then releases, left follows
      var rTuck = Math.max(0, Math.sin(cycle));
      var rFlick = Math.max(0, -Math.sin(cycle));
      var lTuck = Math.max(0, Math.sin(cycle + Math.PI));
      var lFlick = Math.max(0, -Math.sin(cycle + Math.PI));

      JT.bodyY = Math.sin(cycle * 0.6) * 0.15 * intensity;
      JT.torsoX = b + 0.05 * Math.sin(cycle);
      JT.torsoZ = Math.sin(cycle * 0.8) * 0.05;
      JT.headY = Math.sin(cycle * 0.7) * 0.1;
      JT.headX = 0;

      // Right arm: tuck close to body, then fling out
      JT.rUAx = -0.5 - rTuck * 0.3 - rFlick * 1.4;
      JT.rUAz = 0.15 + rTuck * 0.1 + rFlick * 0.7;
      JT.rFAx = -1.2 * rTuck - 0.3 * rFlick - 0.3;
      JT.rFAz = rFlick * 0.3;

      JT.lUAx = -0.5 - lTuck * 0.3 - lFlick * 1.4;
      JT.lUAz = -0.15 - lTuck * 0.1 - lFlick * 0.7;
      JT.lFAx = -1.2 * lTuck - 0.3 * lFlick - 0.3;
      JT.lFAz = -lFlick * 0.3;

      // Nunchaku: tucked still, then burst on release
      JT.nkRx = rFlick * Math.sin(time * 8) * 2.5 * intensity + rTuck * 0.2;
      JT.nkRy = 0;
      JT.nkRz = rFlick * Math.cos(time * 6) * 1.5 * intensity;
      JT.bpRx = rFlick * Math.sin(time * 10) * 3.0 * intensity;
      JT.bpRz = rFlick * Math.cos(time * 8) * 2.0 * intensity;

      JT.nkLx = lFlick * Math.sin(time * 8 + Math.PI) * 2.5 * intensity + lTuck * 0.2;
      JT.nkLy = 0;
      JT.nkLz = lFlick * Math.cos(time * 6 + Math.PI) * 1.5 * intensity;
      JT.bpLx = lFlick * Math.sin(time * 10 + Math.PI) * 3.0 * intensity;
      JT.bpLz = lFlick * Math.cos(time * 8 + Math.PI) * 2.0 * intensity;

      JT.rLx = 0.05 + rFlick * 0.1; JT.rLz = 0.05;
      JT.lLx = -0.05 - lFlick * 0.1; JT.lLz = -0.05;
      JT.rLLx = 0; JT.lLLx = 0;
    }

    /* ── Mouse hover ── */
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
    var clock = new THREE.Clock();
    var running = false;

    function animate() {
      requestAnimationFrame(animate);
      if (!running) { renderer.render(scene, camera); return; }

      var dt = clock.getDelta();
      var time = clock.getElapsedTime();
      phaseTime += dt;

      if (phaseTime >= phaseDur) nextPhase();
      var t = Math.min(phaseTime / phaseDur, 1);

      // Set joint targets based on current phase
      switch (phaseName) {
        case 'ready':       poseReady(t, time); break;
        case 'altSwing':    poseAltSwing(t, time); break;
        case 'dblFig8':     poseDblFig8(t, time); break;
        case 'windmill':    poseWindmill(t, time); break;
        case 'crossStrike': poseCrossStrike(t, time); break;
        case 'behindBack':  poseBehindBack(t, time); break;
        case 'overhead':    poseOverhead(t, time); break;
        case 'underArm':    poseUnderArm(t, time); break;
      }

      // Smooth interpolation + apply
      lerpJoints(dt);
      applyJoints();

      // Mouse tilt
      mouseX += (tgtMX - mouseX) * 0.04;
      mouseY += (tgtMY - mouseY) * 0.04;
      camera.position.x = mouseX * 0.5;
      camera.position.y = 2.5 - mouseY * 0.3;
      camera.lookAt(0, 1.5, 0);

      // Particles
      var pp = pGeom.attributes.position.array;
      for (var i = 0; i < pCount; i++) {
        pp[i * 3] += pSpeeds[i].x;
        pp[i * 3 + 1] += pSpeeds[i].y;
        pp[i * 3 + 2] += pSpeeds[i].z;
        if (Math.abs(pp[i * 3]) > 3) pSpeeds[i].x *= -1;
        if (pp[i * 3 + 1] > 5 || pp[i * 3 + 1] < 0) pSpeeds[i].y *= -1;
        if (Math.abs(pp[i * 3 + 2]) > 2) pSpeeds[i].z *= -1;
      }
      pGeom.attributes.position.needsUpdate = true;

      // Belt tails sway
      beltTail.rotation.z = 0.15 + Math.sin(time * 3) * 0.15;
      beltTail2.rotation.z = -0.12 + Math.sin(time * 2.5 + 0.5) * 0.12;

      // Neck follows head slightly
      neck.rotation.y = headGroup.rotation.y * 0.4;
      neck.rotation.x = headGroup.rotation.x * 0.3;

      renderer.render(scene, camera);
    }

    animate();

    /* ── Start/stop on visibility ── */
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !running) {
        running = true;
        clock.start();
      } else if (!entries[0].isIntersecting && running) {
        running = false;
      }
    }, { threshold: 0.2 });
    obs.observe(wrap);

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = wrap.clientWidth || 400;
      H = wrap.clientHeight || 400;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  setTimeout(boot, 200);
})();
