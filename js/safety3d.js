/* ══════════════════════════════════════════════════════════
   LittleFriends – Safety & Security  ▸  Cinematic 3D CCTV
   Exploded view → Scroll assembly → Lens activation →
   Surveillance scanning — hyper-realistic dome camera
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ── Globals ── */
  var PR   = Math.min(window.devicePixelRatio || 1, 2);
  var MOB  = window.innerWidth <= 768;
  var NOMO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeRenderer(w, h, opts) {
    var r = new THREE.WebGLRenderer(Object.assign({ antialias: true, alpha: true }, opts || {}));
    r.setPixelRatio(PR);
    r.setSize(w, h);
    r.outputColorSpace = THREE.SRGBColorSpace;
    return r;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ═══════════════════════════════════════════════════════
     1 ▸ PAGE HERO — Security-themed 3D floating shapes
     ═══════════════════════════════════════════════════════ */
  function initPageHero() {
    var hero = document.querySelector('.page-hero');
    if (!hero || NOMO) return;

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
    var es = new THREE.Scene(); es.background = new THREE.Color(0xfff5eb);
    var envMap = pmrem.fromScene(es, 0.04).texture; pmrem.dispose();

    var colors = [0x2196F3, 0x4CAF50, 0xFFC107, 0x9C27B0, 0x00BCD4, 0xFF5722, 0x3F51B5, 0x8BC34A];
    var meshes = [], COUNT = MOB ? 8 : 14;
    var geos = [
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.TorusGeometry(0.3, 0.12, 12, 32),
      new THREE.IcosahedronGeometry(0.4, 0),
      new THREE.ConeGeometry(0.3, 0.6, 6),
      new THREE.DodecahedronGeometry(0.35, 0),
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
    ];

    for (var i = 0; i < COUNT; i++) {
      var mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length], metalness: 0.2, roughness: 0.4,
        envMap: envMap, transparent: true, opacity: 0.5,
        emissive: colors[i % colors.length], emissiveIntensity: 0.08,
      });
      var m = new THREE.Mesh(geos[i % geos.length], mat);
      var ex = (Math.random() - 0.5) * 22, ey = (Math.random() - 0.5) * 10;
      if (Math.abs(ex) < 5 && Math.abs(ey) < 2.5) {
        ex = (ex >= 0 ? 1 : -1) * (5 + Math.random() * 5);
        ey = (ey >= 0 ? 1 : -1) * (2.5 + Math.random() * 2);
      }
      m.position.set(ex, ey, -5 - Math.random() * 8);
      m.scale.setScalar(0.4 + Math.random() * 0.5);
      m.userData = { baseY: m.position.y, speed: 0.3 + Math.random() * 0.6,
        amp: 0.3 + Math.random() * 0.5, rotSpeed: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2, depth: m.position.z };
      scene.add(m); meshes.push(m);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    var dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 8, 6); scene.add(dir);
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
        m.rotation.x += u.rotSpeed * 0.008; m.rotation.y += u.rotSpeed * 0.012;
        var pf = (u.depth + 8) / 8;
        m.position.x += (mouseX * 0.6 * pf - m.position.x) * 0.001;
      }
      renderer.render(scene, cam);
    }
    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { if (!running) { running = true; clock.start(); animate(); } }
      else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(hero);
    window.addEventListener('resize', function () {
      var nw = hero.offsetWidth, nh = hero.offsetHeight;
      cam.aspect = nw / nh; cam.updateProjectionMatrix(); renderer.setSize(nw, nh);
    });
  }


  /* ═══════════════════════════════════════════════════════
     2 ▸ SURVEILLANCE VISUALIZER
     ─────────────────────────────────────────────────────
     Dome camera (small) + WiFi anim + Landscape phone
     ═══════════════════════════════════════════════════════ */
  function initDomeCameras() {
    var visualizer = document.getElementById('survVisualizer');
    if (!visualizer) return;

    /* ── Hide ALL old CSS cameras ── */
    var cssCams = document.querySelectorAll('.cctv-unit');
    cssCams.forEach(function (u) { u.style.display = 'none'; });

    /* ── Placeholder — replaced below ── */
    var container = visualizer;

    /* ────────────────────────────────────
       A) DOME CAMERA — smaller canvas
       ──────────────────────────────────── */
    (function initCamScene() {
      var wrap = document.getElementById('survCam');
      var cvs  = document.getElementById('survCamCanvas');
      if (!wrap || !cvs) return;

      var W = wrap.offsetWidth || 320, H = wrap.offsetHeight || 320;

      var renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
      renderer.setPixelRatio(PR); renderer.setSize(W, H);
      renderer.outputColorSpace   = THREE.SRGBColorSpace;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled   = !MOB;
      renderer.shadowMap.type      = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      var viewCam = new THREE.PerspectiveCamera(38, W / H, 0.1, 80);
      viewCam.position.set(0, 0.3, 5.8); viewCam.lookAt(0, -0.1, 0);

      /* Env */
      var pmrem = new THREE.PMREMGenerator(renderer);
      var envSc = new THREE.Scene(); envSc.background = new THREE.Color(0x0a0e14);
      envSc.add(new THREE.AmbientLight(0x354565, 0.4));
      var ed1 = new THREE.DirectionalLight(0x6688bb, 0.5); ed1.position.set(3, 4, 2); envSc.add(ed1);
      var ed2 = new THREE.DirectionalLight(0x445566, 0.3); ed2.position.set(-3, 2, -3); envSc.add(ed2);
      var envMap = pmrem.fromScene(envSc, 0.02).texture; pmrem.dispose();

      /* Lights */
      var kL = new THREE.DirectionalLight(0xffffff, 1.2); kL.position.set(4, 6, 5);
      kL.castShadow = !MOB;
      if (!MOB) { kL.shadow.mapSize.set(512, 512); kL.shadow.bias = -0.001; }
      scene.add(kL);
      var fl = new THREE.DirectionalLight(0x6688cc, 0.4); fl.position.set(-4, 3, -3); scene.add(fl);
      var rl = new THREE.DirectionalLight(0x99bbff, 0.45); rl.position.set(-2, 5, -6); scene.add(rl);
      scene.add(new THREE.AmbientLight(0xd0dde8, 0.35));
      var accentL = new THREE.PointLight(0x00ccff, 0.2, 10); accentL.position.set(0, -2, 3); scene.add(accentL);

      var camRoot = new THREE.Group(); scene.add(camRoot);

      /* Shared mats */
      var wM = new THREE.MeshStandardMaterial({ color: 0xebebeb, roughness: 0.55, metalness: 0.08, envMap: envMap, envMapIntensity: 0.6 });
      var dkM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.45, metalness: 0.15, envMap: envMap });
      var chrM = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.12, metalness: 0.85, envMap: envMap, envMapIntensity: 1.4 });
      var scM = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.35, metalness: 0.65, envMap: envMap });

      var parts = [];

      /* ① MOUNT PLATE */
      (function () {
        var g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 48), wM.clone()));
        var rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.02, 12, 48), chrM);
        rim.rotation.x = Math.PI / 2; rim.position.y = -0.05; g.add(rim);
        var sG = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16);
        var cG1 = new THREE.BoxGeometry(0.04, 0.01, 0.005), cG2 = new THREE.BoxGeometry(0.005, 0.01, 0.04);
        var cMt = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.5 });
        for (var i = 0; i < 4; i++) {
          var a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          var s = new THREE.Mesh(sG, scM); s.position.set(Math.cos(a) * 0.52, 0.06, Math.sin(a) * 0.52);
          var c1 = new THREE.Mesh(cG1, cMt); c1.position.y = 0.019; s.add(c1);
          var c2 = new THREE.Mesh(cG2, cMt); c2.position.y = 0.019; s.add(c2);
          g.add(s);
        }
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16),
          new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9, metalness: 0 })));
        var aP = new THREE.Vector3(0, 1.35, 0), eP = new THREE.Vector3(0, 3.2, -1.2);
        g.position.copy(eP); camRoot.add(g);
        parts.push({ obj: g, aPos: aP, ePos: eP, aRot: new THREE.Euler(0, 0, 0), eRot: new THREE.Euler(0.12, 0.25, 0.08) });
      })();

      /* ② BASE HOUSING */
      var sLedMat, sLedLt;
      (function () {
        var g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.02, 0.32, 64), wM.clone()));
        var lip = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.022, 12, 64), chrM);
        lip.rotation.x = Math.PI / 2; lip.position.y = 0.16; g.add(lip);
        var btm = new THREE.Mesh(new THREE.TorusGeometry(1.01, 0.018, 12, 64), chrM);
        btm.rotation.x = Math.PI / 2; btm.position.y = -0.16; g.add(btm);
        sLedMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.4 });
        var led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), sLedMat); led.position.set(0.85, 0, 0.45); g.add(led);
        sLedLt = new THREE.PointLight(0x00ff00, 0, 2); sLedLt.position.copy(led.position); g.add(sLedLt);
        var aP = new THREE.Vector3(0, 1.05, 0), eP = new THREE.Vector3(-1.5, 1.3, 0.8);
        g.position.copy(eP); camRoot.add(g);
        parts.push({ obj: g, aPos: aP, ePos: eP, aRot: new THREE.Euler(0, 0, 0), eRot: new THREE.Euler(0, -0.35, 0.06) });
      })();

      /* ③ LENS MODULE */
      var lensGrp, lensAsm;
      (function () {
        var g = new THREE.Group(); lensGrp = g;
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 32), dkM));
        var aG = new THREE.BoxGeometry(0.06, 0.28, 0.06);
        var aL = new THREE.Mesh(aG, dkM); aL.position.set(-0.22, 0.18, 0); g.add(aL);
        var aR = new THREE.Mesh(aG, dkM); aR.position.set(0.22, 0.18, 0); g.add(aR);
        lensAsm = new THREE.Group(); lensAsm.position.y = 0.22; g.add(lensAsm);
        var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.22, 32),
          new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.35, metalness: 0.3, envMap: envMap }));
        barrel.rotation.x = Math.PI / 2; lensAsm.add(barrel);
        var fr = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.02, 12, 32), chrM); fr.position.z = 0.08; lensAsm.add(fr);
        var r2 = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.015, 12, 32), chrM); r2.position.z = -0.04; lensAsm.add(r2);
        var lg = new THREE.Mesh(new THREE.CircleGeometry(0.24, 48),
          new THREE.MeshPhysicalMaterial({ color: 0x050515, roughness: 0.03, metalness: 0.3, envMap: envMap, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.02 }));
        lg.position.z = 0.112; lensAsm.add(lg);
        var iris = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 8, 32),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.4, envMap: envMap }));
        iris.position.z = 0.11; lensAsm.add(iris);
        var IRC = 12, irLG = new THREE.SphereGeometry(0.018, 8, 8);
        for (var il = 0; il < IRC; il++) {
          var ia = (il / IRC) * Math.PI * 2;
          var iM = new THREE.Mesh(irLG, new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0, roughness: 0.3, metalness: 0.1 }));
          iM.position.set(Math.cos(ia) * 0.35, Math.sin(ia) * 0.35, 0.02); iM.userData.isIR = true; lensAsm.add(iM);
        }
        var irGl = new THREE.PointLight(0xff2222, 0, 3); irGl.position.set(0, 0, 0.3); lensAsm.add(irGl);
        g.userData.irGlow = irGl;
        var aP = new THREE.Vector3(0, 0.35, 0), eP = new THREE.Vector3(1.8, 0.15, 1.2);
        g.position.copy(eP); camRoot.add(g);
        parts.push({ obj: g, aPos: aP, ePos: eP, aRot: new THREE.Euler(0, 0, 0), eRot: new THREE.Euler(-0.15, 0.4, 0.12) });
      })();

      /* ④ GLASS DOME */
      (function () {
        var dG = new THREE.SphereGeometry(0.92, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.52);
        var dMt = new THREE.MeshPhysicalMaterial({
          color: 0x080810, roughness: 0.04, metalness: 0.08, transmission: 0.42, thickness: 0.8, ior: 1.52,
          envMap: envMap, envMapIntensity: 1.0, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
          clearcoat: 0.6, clearcoatRoughness: 0.1, attenuationColor: new THREE.Color(0x111122), attenuationDistance: 2.5,
        });
        var dome = new THREE.Mesh(dG, dMt); dome.rotation.x = Math.PI; dome.castShadow = true;
        var bz = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 12, 64), chrM); bz.rotation.x = Math.PI / 2; dome.add(bz);
        var aP = new THREE.Vector3(0, 0.88, 0), eP = new THREE.Vector3(0, -2.0, 2.0);
        dome.position.copy(eP); camRoot.add(dome);
        parts.push({ obj: dome, aPos: aP, ePos: eP, aRot: new THREE.Euler(Math.PI, 0, 0), eRot: new THREE.Euler(Math.PI, 0.5, -0.15) });
      })();

      /* ⑤ SCAN BEAM */
      var beamMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      var beam = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 32, 1, true), beamMat);
      beam.position.set(0, -1.2, 0); beam.rotation.x = Math.PI; camRoot.add(beam);

      /* Timeline */
      var TF = 1.2, TA = 2.0, TD = 0.5, TAC = 0.8, TS = 0.6;
      var TAS = TF, TAE = TAS + TA, TACS = TAE, TACE = TACS + TAC, TSS = TACE;
      var TPS = TAS + TA * 0.4, TPE = TACE;

      var mNX = 0, mNY = 0;
      wrap.addEventListener('mousemove', function (ev) {
        var r = wrap.getBoundingClientRect();
        mNX = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        mNY = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      });
      wrap.addEventListener('mouseleave', function () { mNX = 0; mNY = 0; });

      var running = false, raf = 0, clk = new THREE.Clock();
      function anim() {
        raf = requestAnimationFrame(anim);
        var t = clk.getElapsedTime();
        var aT = clamp((t - TAS) / TA, 0, 1), eA = easeOutCubic(aT);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.obj.position.lerpVectors(p.ePos, p.aPos, eA);
          p.obj.rotation.x = lerp(p.eRot.x, p.aRot.x, eA);
          p.obj.rotation.y = lerp(p.eRot.y, p.aRot.y, eA);
          p.obj.rotation.z = lerp(p.eRot.z, p.aRot.z, eA);
        }
        if (aT < 1) { for (var f = 0; f < parts.length; f++) {
          parts[f].obj.position.y += Math.sin(t * 0.6 + f * 1.5) * (1 - eA) * 0.12;
        }}
        var dP = parts[3], dL = easeOutCubic(clamp((t - (TAS + TD)) / (TA - TD), 0, 1));
        dP.obj.position.lerpVectors(dP.ePos, dP.aPos, dL);
        dP.obj.rotation.x = lerp(dP.eRot.x, dP.aRot.x, dL);
        dP.obj.rotation.y = lerp(dP.eRot.y, dP.aRot.y, dL);

        var actE = easeInOutQuad(clamp((t - TACS) / TAC, 0, 1));
        sLedMat.emissiveIntensity = actE * 1.5; sLedMat.opacity = 0.4 + actE * 0.6; sLedLt.intensity = actE * 0.5;
        lensAsm.children.forEach(function (ch) {
          if (ch.userData && ch.userData.isIR) ch.material.emissiveIntensity = actE * (0.6 + Math.sin(t * 4 + ch.position.x * 10) * 0.3);
        });
        lensGrp.userData.irGlow.intensity = actE * 0.35;
        beamMat.opacity = actE * 0.06;

        var scE = easeInOutQuad(clamp((t - TSS) / TS, 0, 1));
        if (scE > 0) {
          lensAsm.rotation.y = Math.sin(t * 0.35) * 0.25 * scE + Math.sin(t * 2.5) * 0.015 * scE;
          lensAsm.rotation.x = Math.sin(t * 0.22 + 1) * 0.12 * scE;
          lensAsm.position.z = Math.sin(t * 0.8) * 0.008 * scE;
          var lp = 0.8 + Math.sin(t * 3) * 0.5;
          sLedMat.emissiveIntensity = 1 + lp * 0.5; sLedLt.intensity = 0.3 + lp * 0.3;
          beam.rotation.y = t * 0.4; beamMat.opacity = scE * (0.04 + Math.sin(t * 1.5) * 0.02);
        }
        var puE = easeOutCubic(clamp((t - TPS) / (TPE - TPS), 0, 1));
        camRoot.position.z = puE * 0.8;
        camRoot.rotation.y = lerp(camRoot.rotation.y, mNX * 0.12, 0.04);
        camRoot.rotation.x = lerp(camRoot.rotation.x, -mNY * 0.04, 0.04);
        viewCam.fov = lerp(viewCam.fov, 38 - puE * 3, 0.03);
        viewCam.updateProjectionMatrix(); viewCam.lookAt(0, -0.1, 0);
        accentL.intensity = 0.15 + scE * (0.1 + Math.sin(t * 2) * 0.05);
        renderer.render(scene, viewCam);
      }
      var obs = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!running) { running = true; clk.start(); anim(); } }
        else { running = false; cancelAnimationFrame(raf); }
      }, { threshold: 0.02 }); obs.observe(wrap);
      window.addEventListener('resize', function () {
        var nw = wrap.offsetWidth || 320, nh = wrap.offsetHeight || 320;
        viewCam.aspect = nw / nh; viewCam.updateProjectionMatrix(); renderer.setSize(nw, nh);
      });
    })();


    /* ────────────────────────────────────
       B) WIFI ANIMATION (SVG arcs)
       ──────────────────────────────────── */
    (function initWifi() {
      var arcs = document.querySelectorAll('.wifi-arc');
      var dot  = document.querySelector('.wifi-dot');
      if (!arcs.length) return;

      arcs.forEach(function (arc) {
        var len = arc.getTotalLength();
        arc.style.strokeDasharray  = len;
        arc.style.strokeDashoffset = len;
        arc.style.opacity = '0';
      });
      if (dot) dot.style.opacity = '0';

      var wObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) startWifi();
      }, { threshold: 0.3 });
      wObs.observe(document.getElementById('survWifi'));

      var started = false;
      function startWifi() {
        if (started) return; started = true;
        var groups = [
          document.querySelectorAll('.wifi-arc-1, .wifi-arc-1b'),
          document.querySelectorAll('.wifi-arc-2, .wifi-arc-2b'),
          document.querySelectorAll('.wifi-arc-3, .wifi-arc-3b'),
        ];
        groups.forEach(function (grp, idx) {
          grp.forEach(function (a) {
            a.style.transition = 'stroke-dashoffset 0.6s ease ' + (0.6 + idx * 0.35) + 's, opacity 0.4s ease ' + (0.6 + idx * 0.35) + 's';
            a.style.strokeDashoffset = '0';
            a.style.opacity = '1';
          });
        });
        if (dot) { dot.style.transition = 'opacity 0.4s ease 0.3s'; dot.style.opacity = '1'; }
      }
    })();


    /* ────────────────────────────────────
       C) LANDSCAPE PHONE with Play Button
       ──────────────────────────────────── */
    (function initPhone() {
      var wrap = document.getElementById('survPhone');
      var cvs  = document.getElementById('survPhoneCanvas');
      if (!wrap || !cvs) return;

      var W = wrap.offsetWidth || 500, H = wrap.offsetHeight || 340;

      var renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
      renderer.setPixelRatio(PR); renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 50);
      camera.position.set(0, 0, 5);

      scene.add(new THREE.AmbientLight(0x8888bb, 0.9));
      var kL2 = new THREE.DirectionalLight(0xffffff, 2.5); kL2.position.set(3, 4, 5); scene.add(kL2);
      scene.add(new THREE.DirectionalLight(0xa78bfa, 0.9).translateX(-3).translateY(2));
      var sGlow = new THREE.PointLight(0x4ecdc4, 0, 4); sGlow.position.set(0, 0, 1.2); scene.add(sGlow);

      /* Phone dims — LANDSCAPE */
      var PW = 3.2, PH = 1.6, PD = 0.08, CR = 0.12;

      function rrShape(w, h, r) {
        var s = new THREE.Shape(), hw = w / 2, hh = h / 2;
        s.moveTo(-hw + r, -hh); s.lineTo(hw - r, -hh);
        s.quadraticCurveTo(hw, -hh, hw, -hh + r); s.lineTo(hw, hh - r);
        s.quadraticCurveTo(hw, hh, hw - r, hh); s.lineTo(-hw + r, hh);
        s.quadraticCurveTo(-hw, hh, -hw, hh - r); s.lineTo(-hw, -hh + r);
        s.quadraticCurveTo(-hw, -hh, -hw + r, -hh); return s;
      }
      function rrGeo(w, h, d, r) {
        var g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 12 });
        g.translate(0, 0, -d / 2); return g;
      }

      var phoneGrp = new THREE.Group(); scene.add(phoneGrp);

      /* Back */
      phoneGrp.add(new THREE.Mesh(rrGeo(PW, PH, PD, CR),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.3, roughness: 0.2, side: THREE.DoubleSide })));
      /* Frame */
      phoneGrp.add(new THREE.Mesh(rrGeo(PW + 0.03, PH + 0.03, PD + 0.04, CR + 0.015),
        new THREE.MeshStandardMaterial({ color: 0x9e9ea3, metalness: 0.85, roughness: 0.25, side: THREE.DoubleSide })));
      /* Screen */
      var screenM = new THREE.Mesh(rrGeo(PW - 0.04, PH - 0.04, 0.02, CR - 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0a0a14, metalness: 0.1, roughness: 0.05, side: THREE.DoubleSide }));
      phoneGrp.add(screenM);

      /* OLED */
      var oC = document.createElement('canvas'); oC.width = 512; oC.height = 256;
      var oCtx = oC.getContext('2d');
      var oGr = oCtx.createLinearGradient(0, 0, 512, 256);
      oGr.addColorStop(0, '#0a0a14'); oGr.addColorStop(0.5, '#111128'); oGr.addColorStop(1, '#0a0a14');
      oCtx.fillStyle = oGr; oCtx.fillRect(0, 0, 512, 256);
      var oTex = new THREE.CanvasTexture(oC); oTex.colorSpace = THREE.SRGBColorSpace;
      var matOLED = new THREE.MeshStandardMaterial({ map: oTex, emissive: 0x222244, emissiveIntensity: 0, roughness: 0.1, side: THREE.FrontSide });
      var oledM = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(PW - 0.12, PH - 0.12, CR - 0.03), 12), matOLED);
      oledM.position.z = 0.012; screenM.add(oledM);

      /* Play button */
      var playGrp = new THREE.Group(); playGrp.position.set(0, 0, 0.015); screenM.add(playGrp);
      var cRing = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.26, 48),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false }));
      cRing.renderOrder = 10; playGrp.add(cRing);
      var cFill = new THREE.Mesh(new THREE.CircleGeometry(0.22, 48),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false }));
      cFill.renderOrder = 9; playGrp.add(cFill);
      var triS = new THREE.Shape();
      triS.moveTo(-0.06, -0.1); triS.lineTo(-0.06, 0.1); triS.lineTo(0.1, 0); triS.lineTo(-0.06, -0.1);
      var triMesh = new THREE.Mesh(new THREE.ShapeGeometry(triS),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false }));
      triMesh.position.set(0.02, 0, 0.001); triMesh.renderOrder = 11; playGrp.add(triMesh);

      /* Label */
      var lC = document.createElement('canvas'); lC.width = 512; lC.height = 64;
      var lCtx = lC.getContext('2d');
      lCtx.fillStyle = '#ffffff'; lCtx.font = '24px Arial, sans-serif';
      lCtx.textAlign = 'center'; lCtx.textBaseline = 'middle';
      lCtx.fillText('Live Classroom Feed', 256, 32);
      var labMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lC), transparent: true, opacity: 0, depthTest: false });
      var labM = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), labMat);
      labM.position.set(0, -0.32, 0.015); labM.renderOrder = 10; screenM.add(labM);

      /* Assembly anim */
      var assembled = false, progress = 0;
      var pObs = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !assembled) assembled = true;
      }, { threshold: 0.25 }); pObs.observe(wrap);

      var mX2 = 0, mY2 = 0, tX2 = 0, tY2 = 0;
      wrap.addEventListener('mousemove', function (ev) {
        var r = wrap.getBoundingClientRect();
        tX2 = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        tY2 = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      });
      wrap.addEventListener('mouseleave', function () { tX2 = 0; tY2 = 0; });

      var pClk = new THREE.Clock(); pClk.start();
      function pAnim() {
        requestAnimationFrame(pAnim);
        var t = pClk.getElapsedTime();
        if (assembled && progress < 1) progress = Math.min(progress + 0.012, 1);
        var p = easeOutCubic(progress);
        mX2 = lerp(mX2, tX2, 0.06); mY2 = lerp(mY2, tY2, 0.06);
        phoneGrp.position.x = lerp(MOB ? 0 : 2.5, 0, p);
        phoneGrp.position.y = lerp(MOB ? -1.5 : 0, 0, p);
        phoneGrp.rotation.y = lerp(0.6, 0, p) + mX2 * 0.2;
        phoneGrp.rotation.x = -mY2 * 0.12;
        var sPow = clamp((p - 0.6) / 0.4, 0, 1);
        matOLED.emissiveIntensity = sPow * 0.3; sGlow.intensity = sPow * 1.2;
        var bPow = clamp((p - 0.75) / 0.25, 0, 1);
        cRing.material.opacity = bPow * 0.9; cFill.material.opacity = bPow * 0.15;
        triMesh.material.opacity = bPow * 0.9; labMat.opacity = bPow * 0.7;
        if (bPow > 0) { var pu = 1 + Math.sin(t * 2) * 0.06; playGrp.scale.set(pu, pu, 1); }
        camera.position.x = Math.sin(t * 0.2) * 0.04;
        camera.position.y = Math.cos(t * 0.15) * 0.02;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      pAnim();

      window.addEventListener('resize', function () {
        var nw = wrap.offsetWidth || 500, nh = wrap.offsetHeight || 340;
        camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
      });
    })();
  }


  /* ═══════════════════════════════════════════
     3 ▸ RATIO CARD — 3D tilt
     ═══════════════════════════════════════════ */
  function initRatioTilt() {
    var card = document.querySelector('.ratio-visual');
    if (!card || NOMO) return;
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';
    var numEl = card.querySelector('.ratio-number');
    var tiltX = 0, tiltY = 0, tX = 0, tY = 0;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      tX = ((e.clientY - r.top) / r.height - 0.5) * -10;
      tY = ((e.clientX - r.left) / r.width - 0.5) * 10;
    });
    card.addEventListener('mouseleave', function () { tX = 0; tY = 0; });
    (function tick() {
      tiltX = lerp(tiltX, tX, 0.08); tiltY = lerp(tiltY, tY, 0.08);
      card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
      if (numEl) numEl.style.transform = 'translateZ(' + (Math.abs(tiltX) + Math.abs(tiltY)) * 2 + 'px)';
      requestAnimationFrame(tick);
    })();
  }


  /* ═══════════════════════════════════════════
     4 ▸ NUTRITION ITEMS — 3D tilt
     ═══════════════════════════════════════════ */
  function initNutritionTilt() {
    var items = document.querySelectorAll('.nf-item');
    if (!items.length || NOMO) return;
    items.forEach(function (item) {
      item.style.transformStyle = 'preserve-3d';
      item.style.willChange = 'transform';
      var icon = item.querySelector('.nf-icon');
      var tx = 0, ty = 0, cx = 0, cy = 0;
      item.addEventListener('mousemove', function (e) {
        var r = item.getBoundingClientRect();
        cx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        cy = ((e.clientX - r.left) / r.width - 0.5) * 8;
      });
      item.addEventListener('mouseleave', function () { cx = 0; cy = 0; });
      (function tick() {
        tx = lerp(tx, cx, 0.08); ty = lerp(ty, cy, 0.08);
        item.style.transform = 'perspective(700px) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg)';
        if (icon) icon.style.transform = 'translateZ(' + (Math.abs(tx) + Math.abs(ty)) * 1.5 + 'px)';
        requestAnimationFrame(tick);
      })();
    });
  }


  /* ═══════════════════════════════════════════
     5 ▸ LIVE STREAM — Particle glow
     ═══════════════════════════════════════════ */
  function initLiveParticles() {
    var sec = document.querySelector('.live-stream-info');
    if (!sec || NOMO) return;
    var w = sec.offsetWidth, h = sec.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 50);
    cam.position.z = 8;
    var renderer = makeRenderer(w, h);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;';
    sec.style.position = 'relative';
    sec.insertBefore(canvas, sec.firstChild);

    var CT = MOB ? 25 : 50;
    var positions = new Float32Array(CT * 3);
    var sizes = new Float32Array(CT);
    var phases = [];
    for (var i = 0; i < CT; i++) {
      positions[i*3] = rand(-6, 6); positions[i*3+1] = rand(-3, 3); positions[i*3+2] = rand(-2, 2);
      sizes[i] = rand(3, 9); phases.push(rand(0, Math.PI * 2));
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: [
        'attribute float size;', 'varying float vAlpha;', 'uniform float uTime;',
        'void main() {', '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = size * (6.0 / -mv.z);', '  gl_Position = projectionMatrix * mv;',
        '  float pulse = sin(uTime * 1.5 + position.x * 2.0 + position.y) * 0.5 + 0.5;',
        '  vAlpha = 0.12 + pulse * 0.3;', '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vAlpha;', 'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));', '  if (d > 0.5) discard;',
        '  float glow = 1.0 - smoothstep(0.0, 0.5, d);', '  glow = pow(glow, 2.5);',
        '  vec3 col = mix(vec3(1.0, 0.15, 0.15), vec3(0.0, 0.8, 1.0), glow);',
        '  gl_FragColor = vec4(col, glow * vAlpha);', '}'
      ].join('\n'),
    });
    var pts = new THREE.Points(geo, mat); scene.add(pts);

    var running = false, raf = 0, clock = new THREE.Clock();
    function anim() {
      raf = requestAnimationFrame(anim);
      var t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      var arr = geo.attributes.position.array;
      for (var p = 0; p < CT; p++) {
        var i3 = p * 3;
        arr[i3] += Math.sin(t * 0.3 + phases[p]) * 0.003;
        arr[i3+1] += 0.003 + Math.sin(t * 0.2 + phases[p] * 1.5) * 0.002;
        if (arr[i3+1] > 4) arr[i3+1] = -4;
        if (arr[i3] > 7) arr[i3] = -7; if (arr[i3] < -7) arr[i3] = 7;
      }
      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
    }
    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { if (!running) { running = true; clock.start(); anim(); } }
      else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(sec);
    window.addEventListener('resize', function () {
      var nw = sec.offsetWidth, nh = sec.offsetHeight;
      cam.aspect = nw / nh; cam.updateProjectionMatrix(); renderer.setSize(nw, nh);
    });
  }


  /* ═══════════════════════════════════════════
     BOOT ALL
     ═══════════════════════════════════════════ */
  function bootAll() {
    initPageHero();
    initDomeCameras();
    initRatioTilt();
    initNutritionTilt();
    initLiveParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootAll, 200); });
  } else { setTimeout(bootAll, 200); }
})();
