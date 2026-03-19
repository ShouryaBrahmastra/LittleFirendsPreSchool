/* ============================================
   whatsapp3d.js — Three.js 3D WhatsApp Button
   Renders a glossy 3D sphere with WhatsApp logo
   that floats, breathes, and tilts on hover.
   Works on every page that loads Three.js.
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var MOB = /Mobi|Android/i.test(navigator.userAgent);
  var PR  = Math.min(window.devicePixelRatio || 1, 2);

  function initWhatsApp3D() {
    var floatDiv = document.querySelector('.whatsapp-float');
    var btn      = document.querySelector('.whatsapp-btn');
    if (!floatDiv || !btn) return;

    /* ── Dimensions ── */
    var SIZE = MOB ? 52 : 60;

    /* ── Canvas ── */
    var canvas = document.createElement('canvas');
    canvas.className = 'whatsapp-3d-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:' + SIZE + 'px;height:' + SIZE + 'px;pointer-events:none;z-index:2;border-radius:50%;';

    /* Insert canvas over the button */
    btn.style.position = 'relative';
    btn.appendChild(canvas);

    /* ── Renderer ── */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(PR);
    renderer.setSize(SIZE, SIZE);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    /* ── Scene ── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 3.8);

    /* ── Environment Map ── */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.add(new THREE.AmbientLight(0x88ffaa, 0.6));
    var eD1 = new THREE.DirectionalLight(0xffffff, 1); eD1.position.set(2, 3, 4); envScene.add(eD1);
    var eD2 = new THREE.DirectionalLight(0x88ddaa, 0.4); eD2.position.set(-3, -1, 2); envScene.add(eD2);
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();

    /* ── Lighting ── */
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0x88ffbb, 0.5);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, -2, -2);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0x44aa66, 0.4));

    /* ── Main Sphere (WhatsApp green button body) ── */
    var sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    var sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x25D366,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      envMap: envMap,
      envMapIntensity: 0.8,
      reflectivity: 0.6
    });
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    /* ── WhatsApp logo — official SVG rendered to texture ── */
    var logoCanvas = document.createElement('canvas');
    logoCanvas.width = 256;
    logoCanvas.height = 256;
    var lCtx = logoCanvas.getContext('2d');

    /* Draw official WhatsApp icon path */
    lCtx.clearRect(0, 0, 256, 256);
    lCtx.fillStyle = '#ffffff';
    lCtx.save();
    lCtx.translate(128, 128);
    lCtx.scale(9.5, 9.5);
    lCtx.translate(-12, -12);

    /* Official WhatsApp SVG path */
    var p = new Path2D('M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z');
    lCtx.fill(p);
    lCtx.restore();

    var logoTexture = new THREE.CanvasTexture(logoCanvas);
    logoTexture.needsUpdate = true;

    /* Disc with logo texture sitting on sphere surface */
    var discGeo = new THREE.CircleGeometry(0.62, 64);
    var discMat = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide
    });
    var logoDisc = new THREE.Mesh(discGeo, discMat);
    logoDisc.position.z = 1.005;
    sphere.add(logoDisc);

    /* ── Glow ring (pulse effect) ── */
    var ringGeo = new THREE.TorusGeometry(1.15, 0.025, 8, 64);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0x25D366,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var glowRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(glowRing);

    /* ── Second outer ring ── */
    var ring2Geo = new THREE.TorusGeometry(1.3, 0.015, 8, 64);
    var ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x25D366,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var glowRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    scene.add(glowRing2);

    /* ── State ── */
    var hovered = false;
    var mNX = 0, mNY = 0;
    var clock = new THREE.Clock();
    var running = true; // always running since it's fixed on screen
    var raf = 0;

    /* Mouse interaction on the whole float div */
    floatDiv.addEventListener('mouseenter', function () { hovered = true; });
    floatDiv.addEventListener('mouseleave', function () { hovered = false; mNX = 0; mNY = 0; });
    floatDiv.addEventListener('mousemove', function (ev) {
      var r = btn.getBoundingClientRect();
      mNX = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      mNY = ((ev.clientY - r.top) / r.height - 0.5) * 2;
    });

    /* ── Animation ── */
    function animate() {
      raf = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Breathing / floating */
      var breathe = Math.sin(t * 1.5) * 0.03;
      sphere.position.y = breathe;

      /* Slow idle rotation */
      sphere.rotation.y = Math.sin(t * 0.4) * 0.08;
      sphere.rotation.x = Math.cos(t * 0.35) * 0.05;

      /* Hover tilt toward mouse */
      if (hovered) {
        sphere.rotation.y += mNX * 0.35;
        sphere.rotation.x += -mNY * 0.25;
        /* Slight scale up */
        sphere.scale.setScalar(THREE.MathUtils.lerp(sphere.scale.x, 1.08, 0.08));
      } else {
        sphere.scale.setScalar(THREE.MathUtils.lerp(sphere.scale.x, 1.0, 0.06));
      }

      /* Pulse rings */
      var pulse = (t % 2.5) / 2.5; // 0→1 every 2.5s
      glowRing.scale.setScalar(1 + pulse * 0.35);
      ringMat.opacity = (1 - pulse) * 0.35;

      var pulse2 = ((t + 0.6) % 2.5) / 2.5;
      glowRing2.scale.setScalar(1 + pulse2 * 0.4);
      ring2Mat.opacity = (1 - pulse2) * 0.2;

      /* Clearcoat shimmer on hover */
      sphereMat.clearcoatRoughness = hovered ? 0.03 : 0.08;
      sphereMat.envMapIntensity = hovered ? 1.2 : 0.8;

      renderer.render(scene, camera);
    }

    clock.start();
    animate();

    /* Hide the flat SVG icon since the 3D version takes over */
    var svgIcon = btn.querySelector('svg');
    if (svgIcon) svgIcon.style.opacity = '0';

    /* Make the CSS green bg transparent since 3D sphere is the bg */
    btn.style.background = 'transparent';
    btn.style.boxShadow = 'none';
    btn.style.animation = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsApp3D);
  } else {
    initWhatsApp3D();
  }
})();
