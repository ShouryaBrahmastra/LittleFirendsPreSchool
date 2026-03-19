/* ============================================
   Three.js 3D Rubik's Cube with Layer Animations
   ============================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var CUBIE = 0.92;   // cubie size
  var GAP   = 0.08;   // gap between cubies
  var UNIT  = CUBIE + GAP; // 1.0

  // Official Rubik's palette  [R, L, U, D, F, B]
  //                            +x  -x  +y  -y  +z  -z
  var FACE_COLORS = [
    0xC41E3A, // Right  – Red
    0xFF5800, // Left   – Orange
    0xFFD500, // Up     – Yellow
    0xFFFFFF, // Down   – White
    0x0051BA, // Front  – Blue
    0x009E60  // Back   – Green
  ];
  var BLACK = 0x111111;

  function boot() {
    var wrap = document.getElementById('rubikCubeWrap');
    if (!wrap) return;

    var W = wrap.clientWidth  || 340;
    var H = wrap.clientHeight || 340;

    /* ── Renderer ── */
    var canvas = document.getElementById('rubikCubeCanvas');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ── Scene & Camera ── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, 6, 5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xddeeff, 1.2);
    fill.position.set(-4, 2, 4);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(0, -3, -3);
    scene.add(rim);
    // Specular highlight light
    var spec = new THREE.PointLight(0xffffff, 1.5, 20);
    spec.position.set(2, 5, 4);
    scene.add(spec);

    /* ── Environment map for reflections ── */
    var pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x222233);
    // Add colored lights to env scene for interesting reflections
    var el1 = new THREE.PointLight(0x4ecdc4, 8, 10); el1.position.set(3, 3, 3); envScene.add(el1);
    var el2 = new THREE.PointLight(0xff6b6b, 8, 10); el2.position.set(-3, 2, -3); envScene.add(el2);
    var el3 = new THREE.PointLight(0xffe66d, 6, 10); el3.position.set(0, -3, 2); envScene.add(el3);
    var el4 = new THREE.PointLight(0xffffff, 10, 12); el4.position.set(0, 5, 0); envScene.add(el4);
    var envMap = pmremGen.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmremGen.dispose();

    /* ── Build cubie materials ── */
    // Each cubie has 6 faces: [+x, -x, +y, -y, +z, -z]
    function makeCubieMaterials(ix, iy, iz) {
      var mats = [];
      for (var f = 0; f < 6; f++) {
        var color = BLACK;
        if (f === 0 && ix ===  1) color = FACE_COLORS[0]; // Right
        if (f === 1 && ix === -1) color = FACE_COLORS[1]; // Left
        if (f === 2 && iy ===  1) color = FACE_COLORS[2]; // Up
        if (f === 3 && iy === -1) color = FACE_COLORS[3]; // Down
        if (f === 4 && iz ===  1) color = FACE_COLORS[4]; // Front
        if (f === 5 && iz === -1) color = FACE_COLORS[5]; // Back
        mats.push(new THREE.MeshStandardMaterial({
          color: color,
          metalness: color === BLACK ? 0.4 : 0.35,
          roughness: color === BLACK ? 0.3 : 0.15,
          envMapIntensity: 1.5,
          side: THREE.FrontSide
        }));
      }
      return mats;
    }

    /* ── Create 27 cubies ── */
    var cubieGeom = new THREE.BoxGeometry(CUBIE, CUBIE, CUBIE);
    // Round edges with bevel — use RoundedBoxGeometry-like approach via beveling edges
    // For simplicity use BoxGeometry + slightly smaller size for gap effect

    var cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    var cubies = []; // { mesh, home: {x,y,z} }
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        for (var z = -1; z <= 1; z++) {
          var mesh = new THREE.Mesh(cubieGeom, makeCubieMaterials(x, y, z));
          mesh.position.set(x * UNIT, y * UNIT, z * UNIT);
          cubeGroup.add(mesh);
          cubies.push({ mesh: mesh, home: { x: x, y: y, z: z } });
        }
      }
    }

    /* ── Layer rotation system ── */
    // Moves: axis ('x','y','z'), layer (-1,0,1), angle (±π/2)
    var pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    var isAnimating = false;

    function getCubiesInLayer(axis, layer) {
      var result = [];
      cubies.forEach(function (c) {
        var pos = c.mesh.position;
        var val = axis === 'x' ? pos.x : axis === 'y' ? pos.y : pos.z;
        if (Math.abs(Math.round(val / UNIT) - layer) < 0.01) {
          result.push(c);
        }
      });
      return result;
    }

    function animateLayerRotation(axis, layer, angle, duration, callback) {
      if (isAnimating) return;
      isAnimating = true;

      var layerCubies = getCubiesInLayer(axis, layer);

      // Move cubies into pivot group
      pivotGroup.rotation.set(0, 0, 0);
      pivotGroup.position.set(0, 0, 0);
      pivotGroup.updateMatrixWorld();

      layerCubies.forEach(function (c) {
        cubeGroup.remove(c.mesh);
        pivotGroup.add(c.mesh);
      });

      var startAngle = 0;
      var startTime = null;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function tick(time) {
        if (!startTime) startTime = time;
        var elapsed = time - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easedProgress = easeInOutCubic(progress);
        var currentAngle = startAngle + angle * easedProgress;

        if (axis === 'x') pivotGroup.rotation.x = currentAngle;
        else if (axis === 'y') pivotGroup.rotation.y = currentAngle;
        else pivotGroup.rotation.z = currentAngle;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Apply final rotation and move cubies back
          pivotGroup.updateMatrixWorld();
          layerCubies.forEach(function (c) {
            c.mesh.updateMatrixWorld();
            var worldPos = new THREE.Vector3();
            var worldQuat = new THREE.Quaternion();
            c.mesh.getWorldPosition(worldPos);
            c.mesh.getWorldQuaternion(worldQuat);
            pivotGroup.remove(c.mesh);
            c.mesh.position.copy(worldPos);
            c.mesh.quaternion.copy(worldQuat);
            // Snap position to grid
            c.mesh.position.x = Math.round(c.mesh.position.x / UNIT) * UNIT;
            c.mesh.position.y = Math.round(c.mesh.position.y / UNIT) * UNIT;
            c.mesh.position.z = Math.round(c.mesh.position.z / UNIT) * UNIT;
            cubeGroup.add(c.mesh);
          });

          pivotGroup.rotation.set(0, 0, 0);
          isAnimating = false;
          if (callback) callback();
        }
      }

      requestAnimationFrame(tick);
    }

    /* ── Move definitions (standard notation) ── */
    var MOVES = {
      'R':  { axis: 'x', layer:  1, angle: -Math.PI / 2 },
      'Ri': { axis: 'x', layer:  1, angle:  Math.PI / 2 },
      'L':  { axis: 'x', layer: -1, angle:  Math.PI / 2 },
      'Li': { axis: 'x', layer: -1, angle: -Math.PI / 2 },
      'U':  { axis: 'y', layer:  1, angle: -Math.PI / 2 },
      'Ui': { axis: 'y', layer:  1, angle:  Math.PI / 2 },
      'D':  { axis: 'y', layer: -1, angle:  Math.PI / 2 },
      'Di': { axis: 'y', layer: -1, angle: -Math.PI / 2 },
      'F':  { axis: 'z', layer:  1, angle: -Math.PI / 2 },
      'Fi': { axis: 'z', layer:  1, angle:  Math.PI / 2 },
      'B':  { axis: 'z', layer: -1, angle:  Math.PI / 2 },
      'Bi': { axis: 'z', layer: -1, angle: -Math.PI / 2 }
    };

    var MOVE_NAMES = ['R', 'L', 'U', 'D', 'F', 'B'];

    function inverseMove(name) {
      return name.length === 1 ? name + 'i' : name.charAt(0);
    }

    function executeMove(moveName, speed) {
      return new Promise(function (resolve) {
        var m = MOVES[moveName];
        if (!m) { resolve(); return; }
        animateLayerRotation(m.axis, m.layer, m.angle, speed, resolve);
      });
    }

    /* ── Scramble & Solve cycle ── */
    function generateScramble(len) {
      var moves = [];
      var last = '';
      for (var i = 0; i < len; i++) {
        var name;
        do { name = MOVE_NAMES[Math.floor(Math.random() * MOVE_NAMES.length)]; } while (name === last);
        last = name;
        var prime = Math.random() > 0.5;
        moves.push(prime ? name + 'i' : name);
      }
      return moves;
    }

    function reverseMoves(moves) {
      return moves.slice().reverse().map(function (m) {
        return inverseMove(m);
      });
    }

    async function executeMoveSequence(moves, getSpeed) {
      for (var i = 0; i < moves.length; i++) {
        var speed = getSpeed ? getSpeed(i, moves.length) : 400;
        await executeMove(moves[i], speed);
      }
    }

    /* ── Camera orbit ── */
    var camAngle = 0;
    var camRadius = 8.5;
    var camHeight = 3.5;
    var idleActive = false;

    function updateCameraIdle() {
      if (!idleActive) return;
      camAngle += 0.003;
      camera.position.x = Math.cos(camAngle) * camRadius;
      camera.position.z = Math.sin(camAngle) * camRadius;
      camera.position.y = camHeight + Math.sin(camAngle * 0.5) * 0.5;
      camera.lookAt(0, 0, 0);
    }

    /* ── Mouse hover tilt ── */
    var mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      targetMouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      targetMouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    wrap.addEventListener('mouseleave', function () {
      targetMouseX = 0;
      targetMouseY = 0;
    });

    /* ── Main cycle ── */
    async function cycle() {
      // Idle — show solved state
      idleActive = true;
      await new Promise(function (r) { setTimeout(r, 3000); });

      // Scramble — medium speed
      var scramble = generateScramble(12 + Math.floor(Math.random() * 6));
      await executeMoveSequence(scramble, function () { return 350; });

      // Pause — admire scrambled state
      await new Promise(function (r) { setTimeout(r, 2000); });

      // Solve — accelerating
      var solve = reverseMoves(scramble);
      await executeMoveSequence(solve, function (i, total) {
        return 500 - (i / total) * 350;
      });

      // Pause — admire solved state
      await new Promise(function (r) { setTimeout(r, 1500); });

      // Repeat
      cycle();
    }

    /* ── Render loop ── */
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      clock.getDelta();

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (idleActive) {
        updateCameraIdle();
      }

      // Subtle whole-cube tilt from mouse
      cubeGroup.rotation.x = -mouseY * 0.15;
      cubeGroup.rotation.y = mouseX * 0.15;

      renderer.render(scene, camera);
    }

    animate();

    /* ── Start on scroll into view ── */
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        cycle();
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(wrap);

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = wrap.clientWidth  || 340;
      H = wrap.clientHeight || 340;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  setTimeout(boot, 200);
})();
