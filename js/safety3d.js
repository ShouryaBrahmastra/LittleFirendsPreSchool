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
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 50);
      camera.position.set(0, 0, 5);

      /* Environment map for reflections */
      var pmrem = new THREE.PMREMGenerator(renderer);
      var envSc = new THREE.Scene();
      envSc.background = new THREE.Color(0x101018);
      envSc.add(new THREE.AmbientLight(0x334455, 0.5));
      var eD1 = new THREE.DirectionalLight(0x5577aa, 0.6); eD1.position.set(3, 4, 2); envSc.add(eD1);
      var eD2 = new THREE.DirectionalLight(0x334466, 0.3); eD2.position.set(-3, 2, -3); envSc.add(eD2);
      var envMap = pmrem.fromScene(envSc, 0.02).texture; pmrem.dispose();

      /* Lighting */
      scene.add(new THREE.AmbientLight(0x8888bb, 0.8));
      var kL2 = new THREE.DirectionalLight(0xffffff, 2.8);
      kL2.position.set(3, 4, 5); kL2.castShadow = !MOB; scene.add(kL2);
      var fL2 = new THREE.DirectionalLight(0xa78bfa, 1.0);
      fL2.position.set(-4, 2, 3); scene.add(fL2);
      var rimL = new THREE.DirectionalLight(0xffe66d, 0.5);
      rimL.position.set(0, -3, -2); scene.add(rimL);
      var sGlow = new THREE.PointLight(0x4ecdc4, 0, 4);
      sGlow.position.set(0, 0, 1.2); scene.add(sGlow);

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
        var g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 16 });
        g.translate(0, 0, -d / 2); return g;
      }

      var phoneGrp = new THREE.Group(); scene.add(phoneGrp);

      /* ── Back Panel ── */
      var matBack = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e, metalness: 0.35, roughness: 0.18,
        envMap: envMap, envMapIntensity: 0.6, side: THREE.DoubleSide
      });
      var backMesh = new THREE.Mesh(rrGeo(PW, PH, PD, CR), matBack);
      phoneGrp.add(backMesh);

      /* Camera module on back (landscape: top-left corner) */
      var camBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.38, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.3, roughness: 0.3, envMap: envMap })
      );
      camBlock.position.set(-PW / 2 + 0.35, PH / 2 - 0.32, -PD / 2 - 0.02);
      backMesh.add(camBlock);

      var matLens = new THREE.MeshStandardMaterial({
        color: 0x1a237e, metalness: 0.4, roughness: 0.08,
        emissive: 0x2196f3, emissiveIntensity: 0.12, envMap: envMap, envMapIntensity: 1.2
      });
      var lens1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.035, 24).rotateX(Math.PI / 2), matLens);
      lens1.position.set(-0.06, 0.06, -0.02); camBlock.add(lens1);
      var lensRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.15, envMap: envMap }));
      lensRing1.position.copy(lens1.position); lensRing1.position.z -= 0.018; camBlock.add(lensRing1);

      var lens2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 24).rotateX(Math.PI / 2), matLens);
      lens2.position.set(0.08, 0.06, -0.02); camBlock.add(lens2);
      var lensRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.15, envMap: envMap }));
      lensRing2.position.copy(lens2.position); lensRing2.position.z -= 0.018; camBlock.add(lensRing2);

      var flash = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 12).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xffe66d, emissive: 0xffe66d, emissiveIntensity: 0.5 }));
      flash.position.set(0.08, -0.06, -0.02); camBlock.add(flash);

      /* ── Frame (metallic band) ── */
      var matFrame = new THREE.MeshStandardMaterial({
        color: 0xb0b0b5, metalness: 0.92, roughness: 0.18,
        envMap: envMap, envMapIntensity: 1.4, side: THREE.DoubleSide
      });
      var frameMesh = new THREE.Mesh(rrGeo(PW + 0.03, PH + 0.03, PD + 0.04, CR + 0.015), matFrame);
      phoneGrp.add(frameMesh);

      /* Side buttons (landscape: on top edge = +Y) */
      var btnMat = new THREE.MeshStandardMaterial({ color: 0xa0a0a5, metalness: 0.88, roughness: 0.2, envMap: envMap });
      var volUp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.035), btnMat);
      volUp.position.set(-0.5, PH / 2 + 0.026, 0); frameMesh.add(volUp);
      var volDn = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.035), btnMat);
      volDn.position.set(-0.2, PH / 2 + 0.026, 0); frameMesh.add(volDn);
      var pwrBtn = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.035), btnMat);
      pwrBtn.position.set(0.4, PH / 2 + 0.026, 0); frameMesh.add(pwrBtn);

      /* Antenna lines (subtle cuts in frame) */
      var antMat = new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.3 });
      for (var ai = 0; ai < 2; ai++) {
        var antLine = new THREE.Mesh(new THREE.BoxGeometry(0.003, PH + 0.04, 0.005), antMat);
        antLine.position.set((ai === 0 ? -1 : 1) * (PW / 2 - 0.3), 0, PD / 2 + 0.015);
        frameMesh.add(antLine);
      }

      /* ── Screen bezel ── */
      var matScreen = new THREE.MeshStandardMaterial({
        color: 0x080810, metalness: 0.08, roughness: 0.04,
        envMap: envMap, envMapIntensity: 0.3, side: THREE.DoubleSide
      });
      var screenM = new THREE.Mesh(rrGeo(PW - 0.04, PH - 0.04, 0.02, CR - 0.02), matScreen);
      phoneGrp.add(screenM);

      /* ── OLED display surface ── */
      var oC = document.createElement('canvas'); oC.width = 640; oC.height = 320;
      var oCtx = oC.getContext('2d');
      var oGr = oCtx.createRadialGradient(320, 160, 0, 320, 160, 380);
      oGr.addColorStop(0, '#12122a'); oGr.addColorStop(0.6, '#0d0d1e'); oGr.addColorStop(1, '#080812');
      oCtx.fillStyle = oGr; oCtx.fillRect(0, 0, 640, 320);
      /* Subtle vignette */
      var vGr = oCtx.createRadialGradient(320, 160, 100, 320, 160, 380);
      vGr.addColorStop(0, 'rgba(0,0,0,0)'); vGr.addColorStop(1, 'rgba(0,0,0,0.3)');
      oCtx.fillStyle = vGr; oCtx.fillRect(0, 0, 640, 320);
      var oTex = new THREE.CanvasTexture(oC); oTex.colorSpace = THREE.SRGBColorSpace;
      var matOLED = new THREE.MeshStandardMaterial({
        map: oTex, emissive: 0x1a1a3a, emissiveIntensity: 0,
        roughness: 0.06, metalness: 0.05, envMap: envMap, envMapIntensity: 0.15,
        side: THREE.FrontSide
      });
      var oledM = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(PW - 0.12, PH - 0.12, CR - 0.03), 16), matOLED);
      oledM.position.z = 0.012; screenM.add(oledM);

      /* Screen glass reflection layer */
      var glassM = new THREE.Mesh(
        new THREE.ShapeGeometry(rrShape(PW - 0.12, PH - 0.12, CR - 0.03), 16),
        new THREE.MeshPhysicalMaterial({
          color: 0x000000, transparent: true, opacity: 0.04,
          roughness: 0.01, metalness: 0, clearcoat: 1.0, clearcoatRoughness: 0.03,
          envMap: envMap, envMapIntensity: 0.5, side: THREE.FrontSide
        })
      );
      glassM.position.z = 0.013; screenM.add(glassM);

      /* Notch / Dynamic Island (landscape: on left edge) */
      var niW = 0.06, niH = 0.22, niR = niW / 2;
      var niShape = new THREE.Shape();
      niShape.moveTo(-niW / 2 + niR, -niH / 2);
      niShape.lineTo(niW / 2 - niR, -niH / 2);
      niShape.absarc(niW / 2 - niR, 0, niR, -Math.PI / 2, Math.PI / 2, false);
      niShape.lineTo(-niW / 2 + niR, niH / 2);
      niShape.absarc(-niW / 2 + niR, 0, niR, Math.PI / 2, -Math.PI / 2, false);
      var notch = new THREE.Mesh(
        new THREE.ShapeGeometry(niShape, 16),
        new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.3, metalness: 0.1 })
      );
      notch.position.set(-PW / 2 + 0.16, 0, 0.0135); screenM.add(notch);

      /* Front camera in notch */
      var fCam = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a237e, emissive: 0x2196f3, emissiveIntensity: 0.25, envMap: envMap })
      );
      fCam.position.set(-PW / 2 + 0.16, 0.03, 0.018); screenM.add(fCam);

      /* Proximity sensor dot */
      var proxDot = new THREE.Mesh(
        new THREE.CircleGeometry(0.008, 12),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
      );
      proxDot.position.set(-PW / 2 + 0.16, -0.03, 0.014); screenM.add(proxDot);

      /* ── Play button ── */
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
      lCtx.fillStyle = '#ffffff'; lCtx.font = '600 24px Arial, sans-serif';
      lCtx.textAlign = 'center'; lCtx.textBaseline = 'middle';
      lCtx.fillText('Live Classroom Feed', 256, 32);
      var labMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lC), transparent: true, opacity: 0, depthTest: false });
      var labM = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), labMat);
      labM.position.set(0, -0.32, 0.015); labM.renderOrder = 10; screenM.add(labM);

      /* ── Assembly anim ── */
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

        /* Screen power-on */
        var sPow = clamp((p - 0.6) / 0.4, 0, 1);
        matOLED.emissiveIntensity = sPow * 0.35; sGlow.intensity = sPow * 1.2;
        glassM.material.opacity = 0.04 + sPow * 0.02;

        /* Play button fade-in */
        var bPow = clamp((p - 0.75) / 0.25, 0, 1);
        cRing.material.opacity = bPow * 0.9; cFill.material.opacity = bPow * 0.15;
        triMesh.material.opacity = bPow * 0.9; labMat.opacity = bPow * 0.7;
        if (bPow > 0) { var pu = 1 + Math.sin(t * 2) * 0.06; playGrp.scale.set(pu, pu, 1); }

        /* Subtle camera drift */
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
     5 ▸ LIVE STREAM — Neon Red 3D Particle Glow
     ═══════════════════════════════════════════ */
  function initLiveParticles() {
    var sec = document.getElementById('liveStreamInfo');
    var cvs = document.getElementById('liveNeonCanvas');
    if (!sec || !cvs || NOMO) return;

    var w = sec.offsetWidth, h = sec.offsetHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 80);
    cam.position.z = 10;

    var renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
    renderer.setPixelRatio(PR);
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ── Red neon fog atmosphere ── */
    scene.fog = new THREE.FogExp2(0x110000, 0.04);

    /* ── Neon red ambient + point lights ── */
    scene.add(new THREE.AmbientLight(0x220000, 0.3));
    var neonPL1 = new THREE.PointLight(0xff2222, 1.2, 20);
    neonPL1.position.set(0, 0, 5);
    scene.add(neonPL1);
    var neonPL2 = new THREE.PointLight(0xff0000, 0.6, 15);
    neonPL2.position.set(-5, 2, 3);
    scene.add(neonPL2);
    var neonPL3 = new THREE.PointLight(0xff4444, 0.4, 12);
    neonPL3.position.set(5, -2, 4);
    scene.add(neonPL3);

    /* ── Floating 3D neon particles ── */
    var CT = MOB ? 40 : 80;
    var positions = new Float32Array(CT * 3);
    var sizes = new Float32Array(CT);
    var phases = [];
    var depths = [];
    for (var i = 0; i < CT; i++) {
      positions[i * 3]     = rand(-8, 8);
      positions[i * 3 + 1] = rand(-4, 4);
      positions[i * 3 + 2] = rand(-6, 4);
      sizes[i] = rand(4, 14);
      phases.push(rand(0, Math.PI * 2));
      depths.push(rand(0.3, 1.0));
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: [
        'attribute float size;',
        'varying float vAlpha;',
        'varying float vDepth;',
        'uniform float uTime;',
        'void main() {',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = size * (8.0 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '  float pulse = sin(uTime * 2.0 + position.x * 1.5 + position.y * 0.8) * 0.5 + 0.5;',
        '  vAlpha = 0.15 + pulse * 0.45;',
        '  vDepth = clamp(-mv.z / 15.0, 0.0, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vAlpha;',
        'varying float vDepth;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  float glow = 1.0 - smoothstep(0.0, 0.5, d);',
        '  glow = pow(glow, 2.0);',
        '  // Neon red core fading to dark red at edges',
        '  vec3 core = vec3(1.0, 0.2, 0.15);',
        '  vec3 edge = vec3(0.6, 0.04, 0.02);',
        '  vec3 col = mix(core, edge, 1.0 - glow);',
        '  // Depth dimming for 3D feel',
        '  float depthFade = 1.0 - vDepth * 0.6;',
        '  gl_FragColor = vec4(col * depthFade, glow * vAlpha * depthFade);',
        '}'
      ].join('\n'),
    });
    var pts = new THREE.Points(geo, mat);
    scene.add(pts);

    /* ── 3D floating neon ring (depth element) ── */
    var ringGeo = new THREE.TorusGeometry(3.5, 0.03, 8, 64);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xff2222, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI * 0.4;
    ring1.position.z = -2;
    scene.add(ring1);

    var ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.material.opacity = 0.08;
    ring2.rotation.x = Math.PI * 0.55;
    ring2.rotation.y = Math.PI * 0.3;
    ring2.position.z = -4;
    ring2.scale.setScalar(0.7);
    scene.add(ring2);

    /* ── Scan line (horizontal sweep) ── */
    var scanGeo = new THREE.PlaneGeometry(20, 0.05);
    var scanMat = new THREE.MeshBasicMaterial({
      color: 0xff3333, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    var scanLine = new THREE.Mesh(scanGeo, scanMat);
    scanLine.position.z = 2;
    scene.add(scanLine);

    /* ── Animation ── */
    var running = false, raf = 0, clock = new THREE.Clock();
    function anim() {
      raf = requestAnimationFrame(anim);
      var t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      // Move particles — drift upward, sway side to side
      var arr = geo.attributes.position.array;
      for (var p = 0; p < CT; p++) {
        var i3 = p * 3;
        arr[i3]   += Math.sin(t * 0.4 + phases[p]) * 0.004;
        arr[i3+1] += 0.004 + Math.sin(t * 0.25 + phases[p] * 1.5) * 0.003;
        arr[i3+2] += Math.sin(t * 0.15 + phases[p] * 0.7) * 0.002;
        if (arr[i3+1] > 5) arr[i3+1] = -5;
        if (arr[i3] > 9) arr[i3] = -9;
        if (arr[i3] < -9) arr[i3] = 9;
      }
      geo.attributes.position.needsUpdate = true;

      // Rotate rings slowly for 3D depth
      ring1.rotation.z = t * 0.08;
      ring1.rotation.y = Math.sin(t * 0.1) * 0.2;
      ring2.rotation.z = -t * 0.06;
      ring2.rotation.x = Math.PI * 0.55 + Math.sin(t * 0.12) * 0.15;

      // Scan line sweep
      scanLine.position.y = Math.sin(t * 0.8) * 3;
      scanMat.opacity = 0.1 + Math.abs(Math.sin(t * 0.8)) * 0.12;

      // Neon light pulse
      neonPL1.intensity = 1.0 + Math.sin(t * 2) * 0.3;
      neonPL2.intensity = 0.5 + Math.sin(t * 1.5 + 1) * 0.2;

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
     6 ▸ CERTIFICATION BADGE — 3D Premium Seal
     ═══════════════════════════════════════════ */
  function initCertBadge() {
    var wrap = document.getElementById('certBadge3d');
    var cvs  = document.getElementById('certBadgeCanvas');
    if (!wrap || !cvs || NOMO) return;

    var W = wrap.offsetWidth || 200, H = wrap.offsetHeight || 240;
    var renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
    renderer.setPixelRatio(PR);
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(36, W / H, 0.1, 60);
    cam.position.set(0, -0.05, 7.0);
    cam.lookAt(0, -0.05, 0);

    /* Env map */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envSc = new THREE.Scene();
    envSc.background = new THREE.Color(0xfff8e1);
    envSc.add(new THREE.AmbientLight(0xffe0a0, 0.5));
    var ed = new THREE.DirectionalLight(0xffffff, 0.6);
    ed.position.set(3, 5, 4); envSc.add(ed);
    var envMap = pmrem.fromScene(envSc, 0.04).texture;
    pmrem.dispose();

    /* Lights */
    var keyL = new THREE.DirectionalLight(0xfff5e0, 1.6);
    keyL.position.set(3, 5, 6); scene.add(keyL);
    var fillL = new THREE.DirectionalLight(0xffe0b0, 0.5);
    fillL.position.set(-4, 2, 3); scene.add(fillL);
    var rimL = new THREE.DirectionalLight(0xffd700, 0.3);
    rimL.position.set(0, -3, 4); scene.add(rimL);
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.4));

    /* Materials */
    var goldMat = new THREE.MeshStandardMaterial({
      color: 0xDAA520, roughness: 0.2, metalness: 0.85,
      envMap: envMap, envMapIntensity: 1.3
    });
    var goldSatin = new THREE.MeshStandardMaterial({
      color: 0xCDA000, roughness: 0.35, metalness: 0.75,
      envMap: envMap, envMapIntensity: 1.0
    });
    var creamMat = new THREE.MeshStandardMaterial({
      color: 0xFFF8DC, roughness: 0.6, metalness: 0.05,
      envMap: envMap, envMapIntensity: 0.3
    });
    var ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xE8665A, roughness: 0.5, metalness: 0.1,
      envMap: envMap, envMapIntensity: 0.4,
      side: THREE.DoubleSide
    });
    var darkGoldMat = new THREE.MeshStandardMaterial({
      color: 0x8B6914, roughness: 0.4, metalness: 0.6,
      envMap: envMap, envMapIntensity: 0.8
    });

    var badgeRoot = new THREE.Group();
    scene.add(badgeRoot);

    /* ── OUTER GOLD RING ── */
    var outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.18, 24, 64),
      goldMat
    );
    badgeRoot.add(outerRing);

    /* Outer rim highlight */
    var outerRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.04, 12, 64),
      goldSatin
    );
    outerRim.position.z = 0.16;
    badgeRoot.add(outerRim);

    /* ── INNER GOLD RING (detail rim) ── */
    var innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.05, 16, 64),
      goldSatin
    );
    innerRing.position.z = 0.05;
    badgeRoot.add(innerRing);

    /* ── CREAM CENTER DISC ── */
    var centerDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.28, 1.28, 0.15, 64),
      creamMat
    );
    centerDisc.rotation.x = Math.PI / 2;
    centerDisc.position.z = -0.02;
    badgeRoot.add(centerDisc);

    /* ── DASHED RING DETAIL ── */
    var DASH_COUNT = 36;
    var dashGeo = new THREE.BoxGeometry(0.06, 0.015, 0.03);
    for (var di = 0; di < DASH_COUNT; di++) {
      var da = (di / DASH_COUNT) * Math.PI * 2;
      var dash = new THREE.Mesh(dashGeo, goldSatin);
      dash.position.set(Math.cos(da) * 1.15, Math.sin(da) * 1.15, 0.08);
      dash.rotation.z = da;
      badgeRoot.add(dash);
    }

    /* ── MEDAL ICON (top center) ── */
    (function buildMedalIcon() {
      var ig = new THREE.Group();
      ig.position.set(0, 0.35, 0.1);

      // Medal body
      var medalBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32),
        goldMat
      );
      medalBody.rotation.x = Math.PI / 2;
      ig.add(medalBody);

      // Medal rim
      var medalRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.02, 8, 32),
        goldSatin
      );
      medalRim.position.z = 0.03;
      ig.add(medalRim);

      // Star icon in center
      var starShape = new THREE.Shape();
      var STAR_PTS = 5, outerR = 0.12, innerR = 0.05;
      for (var si = 0; si < STAR_PTS * 2; si++) {
        var sa = (si / (STAR_PTS * 2)) * Math.PI * 2 - Math.PI / 2;
        var sr = si % 2 === 0 ? outerR : innerR;
        if (si === 0) starShape.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        else starShape.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
      }
      starShape.closePath();
      var starMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 }),
        goldMat
      );
      starMesh.position.z = 0.02;
      ig.add(starMesh);

      badgeRoot.add(ig);
    })();

    /* ── TEXT: "CERTIFIED" ── */
    (function buildText() {
      // Use canvas texture for sharp text
      var tCanvas = document.createElement('canvas');
      var tW = 512, tH = 256;
      tCanvas.width = tW; tCanvas.height = tH;
      var ctx = tCanvas.getContext('2d');
      ctx.clearRect(0, 0, tW, tH);

      // CERTIFIED
      ctx.fillStyle = '#7B3F00';
      ctx.font = 'bold 90px "Bubblegum Sans", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CERTIFIED', tW / 2, tH * 0.38);

      // Dietitian Approved
      ctx.font = 'bold 40px "Nunito", sans-serif';
      ctx.fillStyle = '#8B5A2B';
      ctx.letterSpacing = '2px';
      ctx.fillText('DIETITIAN APPROVED', tW / 2, tH * 0.65);

      var tex = new THREE.CanvasTexture(tCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      var textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 1.05),
        new THREE.MeshStandardMaterial({
          map: tex, transparent: true, alphaTest: 0.01,
          roughness: 0.7, metalness: 0.0
        })
      );
      textPlane.position.set(0, -0.25, 0.1);
      badgeRoot.add(textPlane);
    })();

    /* ── RIBBONS ── */
    (function buildRibbons() {
      var rShape = new THREE.Shape();
      rShape.moveTo(0, 0);
      rShape.lineTo(0.22, 0);
      rShape.lineTo(0.22, -0.7);
      rShape.lineTo(0.11, -0.55);
      rShape.lineTo(0, -0.7);
      rShape.closePath();

      var rGeo = new THREE.ExtrudeGeometry(rShape, {
        depth: 0.04, bevelEnabled: true, bevelThickness: 0.008,
        bevelSize: 0.008, bevelSegments: 2
      });

      // Left ribbon
      var rLeft = new THREE.Mesh(rGeo, ribbonMat);
      rLeft.position.set(-0.5, -1.35, -0.12);
      rLeft.rotation.z = 0.2;
      badgeRoot.add(rLeft);

      // Right ribbon
      var rRight = new THREE.Mesh(rGeo, ribbonMat);
      rRight.position.set(0.28, -1.35, -0.12);
      rRight.rotation.z = -0.2;
      badgeRoot.add(rRight);
    })();

    /* ── FIVE GOLD STARS ── */
    (function buildStars() {
      var starShape = new THREE.Shape();
      var PTS = 5, oR = 0.08, iR = 0.035;
      for (var s = 0; s < PTS * 2; s++) {
        var a = (s / (PTS * 2)) * Math.PI * 2 - Math.PI / 2;
        var r = s % 2 === 0 ? oR : iR;
        if (s === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      starShape.closePath();
      var sGeo = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.02, bevelEnabled: true, bevelThickness: 0.004,
        bevelSize: 0.004, bevelSegments: 1
      });

      for (var si = 0; si < 5; si++) {
        var star = new THREE.Mesh(sGeo, goldMat);
        star.position.set((si - 2) * 0.24, -1.85, 0.02);
        badgeRoot.add(star);
      }
    })();

    /* ── Subtle emboss bevels around the badge ── */
    var bevelBack = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.08, 64),
      darkGoldMat
    );
    bevelBack.rotation.x = Math.PI / 2;
    bevelBack.position.z = -0.12;
    badgeRoot.add(bevelBack);

    /* ── Mouse parallax ── */
    var mNX = 0, mNY = 0;
    wrap.addEventListener('mousemove', function (ev) {
      var r = wrap.getBoundingClientRect();
      mNX = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      mNY = ((ev.clientY - r.top) / r.height - 0.5) * 2;
    });
    wrap.addEventListener('mouseleave', function () { mNX = 0; mNY = 0; });

    /* ── Animation ── */
    var running = false, raf = 0, clk = new THREE.Clock();
    function anim() {
      raf = requestAnimationFrame(anim);
      var t = clk.getElapsedTime();

      // Gentle floating
      badgeRoot.position.y = Math.sin(t * 1.2) * 0.04;

      // Slow Y rotation (showcase)
      badgeRoot.rotation.y = Math.sin(t * 0.5) * 0.15;

      // Mouse parallax
      badgeRoot.rotation.y += mNX * 0.12;
      badgeRoot.rotation.x = lerp(badgeRoot.rotation.x, -mNY * 0.08, 0.05);

      // Subtle shimmer on gold ring
      goldMat.envMapIntensity = 1.2 + Math.sin(t * 2) * 0.15;

      renderer.render(scene, cam);
    }

    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { if (!running) { running = true; clk.start(); anim(); } }
      else { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    obs.observe(wrap);

    window.addEventListener('resize', function () {
      var nw = wrap.offsetWidth || 280, nh = wrap.offsetHeight || 340;
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
    initCertBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootAll, 200); });
  } else { setTimeout(bootAll, 200); }
})();
