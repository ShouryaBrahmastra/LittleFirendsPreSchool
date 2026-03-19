/* ============================================
   Three.js 3D Smartphone Assembly Animation
   ============================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function boot() {
    var canvas = document.getElementById('phone3dCanvas');
    var wrap   = document.getElementById('phone3dWrap');
    if (!canvas || !wrap) return;

    var W = wrap.clientWidth  || 320;
    var H = wrap.clientHeight || 560;

    /* ===== RENDERER ===== */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    /* ===== SCENE & CAMERA ===== */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    /* ===== LIGHTS ===== */
    scene.add(new THREE.AmbientLight(0x8888bb, 1.0));

    var key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(3, 4, 5);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xa78bfa, 1.2);
    fill.position.set(-4, 2, 3);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0xffe66d, 0.8);
    rim.position.set(0, -3, -2);
    scene.add(rim);

    var screenGlow = new THREE.PointLight(0x4ecdc4, 0, 4);
    screenGlow.position.set(0, 0, 1.2);
    scene.add(screenGlow);

    /* ===== PHONE DIMENSIONS ===== */
    var PW = 1.3, PH = 2.6, PD = 0.08;

    /* ===== MATERIALS ===== */
    var matBack = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, metalness: 0.3, roughness: 0.2, side: THREE.DoubleSide
    });
    var matFrame = new THREE.MeshStandardMaterial({
      color: 0x9e9ea3, metalness: 0.85, roughness: 0.25, side: THREE.DoubleSide
    });
    var matScreen = new THREE.MeshStandardMaterial({
      color: 0x0a0a14, metalness: 0.1, roughness: 0.05, side: THREE.DoubleSide
    });
    // OLED gradient canvas: yellow → orange → red
    var oledCanvas = document.createElement('canvas');
    oledCanvas.width = 256; oledCanvas.height = 512;
    var oledCtx = oledCanvas.getContext('2d');
    var grad = oledCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(0.5, '#FF8C00');
    grad.addColorStop(1, '#DC143C');
    oledCtx.fillStyle = grad;
    oledCtx.fillRect(0, 0, 256, 512);
    var oledTex = new THREE.CanvasTexture(oledCanvas);
    oledTex.colorSpace = THREE.SRGBColorSpace;
    var matOLED = new THREE.MeshStandardMaterial({
      map: oledTex, emissive: 0xff8c00, emissiveIntensity: 0,
      roughness: 0.1, side: THREE.FrontSide
    });
    var matChip = new THREE.MeshStandardMaterial({
      color: 0x2d3436, metalness: 0.5, roughness: 0.4,
      emissive: 0x4ecdc4, emissiveIntensity: 0.2, side: THREE.DoubleSide
    });
    var matBattery = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide
    });
    var matLens = new THREE.MeshStandardMaterial({
      color: 0x1a237e, metalness: 0.3, roughness: 0.1,
      emissive: 0x2196f3, emissiveIntensity: 0.15, side: THREE.DoubleSide
    });

    /* ===== ROUNDED RECT HELPER ===== */
    function makeRoundedRectGeom(w, h, d, r) {
      var shape = new THREE.Shape();
      var hw = w / 2, hh = h / 2;
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
        depth: d, bevelEnabled: false, curveSegments: 12
      });
      geom.translate(0, 0, -d / 2);
      return geom;
    }

    /* ===== PHONE GROUP ===== */
    var phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    var cornerR = 0.12; // corner radius

    /* --- Back panel --- */
    var backMesh = new THREE.Mesh(
      makeRoundedRectGeom(PW, PH, PD, cornerR),
      matBack
    );
    phoneGroup.add(backMesh);

    // Camera module
    var camBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.42, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.3, roughness: 0.3 })
    );
    camBlock.position.set(-0.32, 0.85, -0.06);
    backMesh.add(camBlock);

    var lens1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24).rotateX(Math.PI / 2),
      matLens
    );
    lens1.position.set(-0.07, 0.07, 0.03);
    camBlock.add(lens1);

    var lens2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.04, 24).rotateX(Math.PI / 2),
      matLens
    );
    lens2.position.set(0.09, 0.07, 0.03);
    camBlock.add(lens2);

    var flashMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xffe66d, emissive: 0xffe66d, emissiveIntensity: 0.6 })
    );
    flashMesh.position.set(0.09, -0.07, 0.03);
    camBlock.add(flashMesh);

    /* --- Frame --- */
    var frameMesh = new THREE.Mesh(
      makeRoundedRectGeom(PW + 0.04, PH + 0.04, PD + 0.06, cornerR + 0.02),
      matFrame
    );
    phoneGroup.add(frameMesh);

    // Side button
    var sideBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.18, 0.04),
      matFrame
    );
    sideBtn.position.set(PW / 2 + 0.04, 0.2, 0);
    frameMesh.add(sideBtn);

    /* --- Internals --- */
    var internalsGroup = new THREE.Group();
    phoneGroup.add(internalsGroup);

    var chip = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.04), matChip);
    chip.position.set(0, 0.2, 0);
    internalsGroup.add(chip);

    var battery = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.03), matBattery);
    battery.position.set(0, -0.45, 0);
    internalsGroup.add(battery);

    var traceMat = new THREE.MeshStandardMaterial({
      color: 0x4ecdc4, emissive: 0x4ecdc4, emissiveIntensity: 0.5
    });
    for (var t = 0; t < 4; t++) {
      var trace = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.006, 0.006), traceMat);
      trace.position.set(0, 0.65 - t * 0.13, 0);
      internalsGroup.add(trace);
    }

    /* --- Screen --- */
    var screenMesh = new THREE.Mesh(
      makeRoundedRectGeom(PW - 0.04, PH - 0.04, 0.03, cornerR - 0.02),
      matScreen
    );
    phoneGroup.add(screenMesh);

    // OLED display — rounded corners
    var oledW = PW - 0.14, oledH = PH - 0.14, oledR = cornerR - 0.04;
    var oledShape = new THREE.Shape();
    var ohw = oledW / 2, ohh = oledH / 2;
    oledShape.moveTo(-ohw + oledR, -ohh);
    oledShape.lineTo(ohw - oledR, -ohh);
    oledShape.quadraticCurveTo(ohw, -ohh, ohw, -ohh + oledR);
    oledShape.lineTo(ohw, ohh - oledR);
    oledShape.quadraticCurveTo(ohw, ohh, ohw - oledR, ohh);
    oledShape.lineTo(-ohw + oledR, ohh);
    oledShape.quadraticCurveTo(-ohw, ohh, -ohw, ohh - oledR);
    oledShape.lineTo(-ohw, -ohh + oledR);
    oledShape.quadraticCurveTo(-ohw, -ohh, -ohw + oledR, -ohh);
    var oledGeom = new THREE.ShapeGeometry(oledShape, 12);
    var oledMesh = new THREE.Mesh(oledGeom, matOLED);
    oledMesh.position.z = 0.016;
    screenMesh.add(oledMesh);

    // Notch — pill / capsule shape
    var notchW = 0.35, notchH = 0.08, notchR = notchH / 2;
    var notchShape = new THREE.Shape();
    notchShape.moveTo(-notchW / 2 + notchR, -notchH / 2);
    notchShape.lineTo(notchW / 2 - notchR, -notchH / 2);
    notchShape.absarc(notchW / 2 - notchR, 0, notchR, -Math.PI / 2, Math.PI / 2, false);
    notchShape.lineTo(-notchW / 2 + notchR, notchH / 2);
    notchShape.absarc(-notchW / 2 + notchR, 0, notchR, Math.PI / 2, -Math.PI / 2, false);
    var notchGeom = new THREE.ShapeGeometry(notchShape, 16);
    var notch = new THREE.Mesh(
      notchGeom,
      new THREE.MeshStandardMaterial({ color: 0x0a0a14 })
    );
    notch.position.set(0, PH / 2 - 0.14, 0.017);
    screenMesh.add(notch);

    // Front camera dot — centered in notch
    var camDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a237e, emissive: 0x2196f3, emissiveIntensity: 0.3 })
    );
    camDot.position.set(0, PH / 2 - 0.14, 0.025);
    screenMesh.add(camDot);

    /* ===== SCREEN DISPLAY – Logo ===== */
    var textureLoader = new THREE.TextureLoader();
    var phoneState = {
      progress: 0, targetProgress: 0,
      mouseX: 0, mouseY: 0, targetMouseX: 0, targetMouseY: 0,
      screenOn: false, screenPower: 0,
      iconMat: null, iconMesh: null, labelMat: null,
      assembled: false
    };

    textureLoader.load('assets/icon/toondemy.png', function (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Boost contrast slightly via canvas redraw
      var img = tex.image;
      var cc = document.createElement('canvas');
      cc.width = img.width; cc.height = img.height;
      var cx = cc.getContext('2d');
      cx.filter = 'contrast(1.15)';
      cx.drawImage(img, 0, 0);
      var boostedTex = new THREE.CanvasTexture(cc);
      boostedTex.colorSpace = THREE.SRGBColorSpace;
      var iconMat = new THREE.MeshBasicMaterial({ map: boostedTex, transparent: true, opacity: 0, depthTest: false });
      var iconMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), iconMat);
      iconMesh.position.set(0, 0.18, 0.03);
      iconMesh.renderOrder = 10;
      screenMesh.add(iconMesh);
      phoneState.iconMat = iconMat;
      phoneState.iconMesh = iconMesh;
    });

    // Text label
    var lc = document.createElement('canvas');
    lc.width = 512; lc.height = 128;
    var lx = lc.getContext('2d');
    lx.fillStyle = '#000000';
    lx.font = 'bold 60px Arial, sans-serif';
    lx.textAlign = 'center';
    lx.textBaseline = 'middle';
    lx.fillText('Toondemy', 256, 48);
    lx.font = 'bold 30px Arial, sans-serif';
    lx.fillStyle = '#000000';
    lx.fillText('Learn with Fun!', 256, 98);

    var labelMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(lc), transparent: true, opacity: 0, depthTest: false
    });
    var labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.24), labelMat);
    labelMesh.position.set(0, -0.38, 0.03);
    labelMesh.renderOrder = 10;
    screenMesh.add(labelMesh);
    phoneState.labelMat = labelMat;

    /* ===== PARTICLES ===== */
    var pCount = 50;
    var pPos = new Float32Array(pCount * 3);
    var pCol = new Float32Array(pCount * 3);
    var pSpd = [];
    var palette = [0xffe66d, 0xff6b6b, 0xa78bfa, 0x4ecdc4, 0xf472b6];
    for (var i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random()-0.5)*4;
      pPos[i*3+1] = (Math.random()-0.5)*4;
      pPos[i*3+2] = (Math.random()-0.5)*2.5;
      var c = new THREE.Color(palette[i % palette.length]);
      pCol[i*3] = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b;
      pSpd.push({ x:(Math.random()-0.5)*0.004, y:(Math.random()-0.5)*0.004, z:(Math.random()-0.5)*0.002 });
    }
    var pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    var pMat = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(pGeom, pMat));

    /* ===== EXPLODED OFFSETS ===== */
    var off = {
      back:  { y:-1.0, z:-0.8 },
      frame: { y:-0.3, z:-0.4 },
      inter: { y: 0.3, z:-0.15 },
      screen:{ y: 0.9, z: 0.5 }
    };

    /* ===== SCROLL TRIGGER ===== */
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && !phoneState.assembled) {
          phoneState.assembled = true;
          phoneState.targetProgress = 1;
        }
      });
    }, { threshold: 0.25 });
    obs.observe(wrap);

    /* ===== MOUSE TILT ===== */
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      phoneState.targetMouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      phoneState.targetMouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    wrap.addEventListener('mouseleave', function () {
      phoneState.targetMouseX = 0;
      phoneState.targetMouseY = 0;
    });

    /* ===== RENDER LOOP ===== */
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var dt = clock.getDelta();
      var t  = clock.getElapsedTime();

      phoneState.progress = lerp(phoneState.progress, phoneState.targetProgress, 0.02);
      var p = phoneState.progress;

      phoneState.mouseX = lerp(phoneState.mouseX, phoneState.targetMouseX, 0.06);
      phoneState.mouseY = lerp(phoneState.mouseY, phoneState.targetMouseY, 0.06);

      /* -- layer positions -- */
      backMesh.position.set(0, lerp(off.back.y, 0, p), lerp(off.back.z, 0, p));
      frameMesh.position.set(0, lerp(off.frame.y, 0, p), lerp(off.frame.z, 0, p));
      internalsGroup.position.set(0, lerp(off.inter.y, 0, p), lerp(off.inter.z, 0, p));
      screenMesh.position.set(0, lerp(off.screen.y, 0, p), lerp(off.screen.z, 0.06, p));

      /* -- internals fade in then out -- */
      var iAlpha = p < 0.5 ? p * 2 * 0.8 : (1 - (p - 0.5) * 2) * 0.8;
      internalsGroup.children.forEach(function (ch) {
        if (ch.material) { ch.material.transparent = true; ch.material.opacity = Math.max(0, iAlpha); }
      });

      /* -- screen power on -- */
      if (p > 0.85 && !phoneState.screenOn) phoneState.screenOn = true;
      if (phoneState.screenOn) phoneState.screenPower = Math.min(phoneState.screenPower + dt * 0.6, 1);
      var sp = phoneState.screenPower;

      matOLED.emissiveIntensity = sp * 0.6;
      screenGlow.intensity = sp * 1.5;
      screenGlow.color.setHex(0xff8c00);

      if (phoneState.iconMat) phoneState.iconMat.opacity = clamp(sp * 2 - 0.3, 0, 1);
      if (phoneState.labelMat) phoneState.labelMat.opacity = clamp(sp * 2 - 0.6, 0, 1);
      if (phoneState.iconMesh && sp > 0.4) {
        var sc = 1 + Math.sin(t * 2.5) * 0.04;
        phoneState.iconMesh.scale.set(sc, sc, 1);
      }

      /* -- single 360° rotation during assembly, then hover tilt only -- */
      var spin = clamp(p, 0, 1) * Math.PI * 2; // one full turn mapped to assembly progress
      phoneGroup.rotation.y = spin + phoneState.mouseX * 0.3;
      phoneGroup.rotation.x = -phoneState.mouseY * 0.2;

      /* -- particles -- */
      pMat.opacity = lerp(0, 0.6, p);
      var pp = pGeom.attributes.position.array;
      for (var i = 0; i < pCount; i++) {
        pp[i*3]   += pSpd[i].x;
        pp[i*3+1] += pSpd[i].y;
        pp[i*3+2] += pSpd[i].z;
        if (Math.abs(pp[i*3])   > 2) pSpd[i].x *= -1;
        if (Math.abs(pp[i*3+1]) > 2) pSpd[i].y *= -1;
        if (Math.abs(pp[i*3+2]) > 1.2) pSpd[i].z *= -1;
      }
      pGeom.attributes.position.needsUpdate = true;

      /* -- camera breathing -- */
      camera.position.x = Math.sin(t * 0.2) * 0.08;
      camera.position.y = Math.cos(t * 0.15) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    /* ===== RESIZE ===== */
    window.addEventListener('resize', function () {
      W = wrap.clientWidth || 320;
      H = wrap.clientHeight || 560;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  // Boot with longer delay to ensure DOM is ready
  setTimeout(boot, 300);
})();
