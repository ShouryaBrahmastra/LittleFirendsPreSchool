/* ============================================
   LittleFriends - Activities Page JS
   Section nav dots, video play, art slider drag
   ============================================ */

(() => {
  'use strict';

  /* ── Section Nav Dots ── */
  const dots = document.querySelectorAll('.act-nav-dot');
  const sections = [...dots].map(d => document.getElementById(d.dataset.target));

  // click to scroll
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const sec = document.getElementById(dot.dataset.target);
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // highlight on scroll
  const dotObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('active'));
        const match = [...dots].find(d => d.dataset.target === entry.target.id);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => { if (sec) dotObserver.observe(sec); });


  /* ── Video Play Overlays ── */
  document.querySelectorAll('.act-video-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      const vid = document.getElementById(overlay.dataset.video);
      if (vid && vid.src) {
        vid.play();
        overlay.style.display = 'none';
      }
    });
  });


  /* ── Art Brush Slider – CSS handles the infinite marquee ── */


  /* ── Abacus Counting Engine ── */
  (() => {
    const frame = document.getElementById('abacus-frame');
    const display = document.getElementById('abacus-display');
    if (!frame || !display) return;

    const rods = Array.from(frame.querySelectorAll('.abacus-rod'));
    const BEADS_PER_ROD = 5;
    // State: how many beads are slid right on each rod (0-5)
    const state = rods.map(() => 0);

    function renderRod(rodIdx) {
      const rod = rods[rodIdx];
      const beads = Array.from(rod.querySelectorAll('.abacus-bead'));
      const count = state[rodIdx];
      beads.forEach((b, i) => {
        if (i < BEADS_PER_ROD - count) {
          b.classList.remove('slid');
          b.style.transform = '';
        } else {
          b.classList.add('slid');
          b.style.transform = 'translateX(' + ((BEADS_PER_ROD - count) * 6) + 'px)';
        }
      });
    }

    function renderAll() {
      rods.forEach((_, i) => renderRod(i));
      // Compute displayed number: each rod is a digit (row 0 = ten-thousands ... row 4 = ones)
      const num = state.reduce((acc, v) => acc * 10 + v, 0);
      display.textContent = num.toString();
    }

    // Click interactivity: toggle bead
    rods.forEach((rod, ri) => {
      rod.querySelectorAll('.abacus-bead').forEach((bead, bi) => {
        bead.addEventListener('click', () => {
          const slidCount = state[ri];
          const threshold = BEADS_PER_ROD - slidCount;
          if (bi >= threshold) {
            // Unslide: decrease count to bi position
            state[ri] = BEADS_PER_ROD - bi - 1;
          } else {
            // Slide: increase count so this bead is included
            state[ri] = BEADS_PER_ROD - bi;
          }
          renderAll();
        });
      });
    });

    // Automated counting animation
    let animRunning = false;
    let animId = null;

    async function sleep(ms) {
      return new Promise(r => { animId = setTimeout(r, ms); });
    }

    async function slideBead(rodIdx, newCount, delayMs) {
      state[rodIdx] = newCount;
      renderAll();
      await sleep(delayMs);
    }

    // Nudge the frame slightly for life-like feel
    function nudgeFrame(angle) {
      frame.style.transform = 'rotateX(' + (4 + angle * 0.5) + 'deg) rotateY(' + (-2 + angle * 0.3) + 'deg)';
    }

    async function countUpTo(target) {
      // target is 0–55555; convert to per-rod digits
      const digits = [];
      let t = target;
      for (let i = 4; i >= 0; i--) {
        digits[i] = t % 10;
        t = Math.floor(t / 10);
        if (digits[i] > BEADS_PER_ROD) digits[i] = BEADS_PER_ROD;
      }

      // Animate rod by rod from last to first (ones → ten-thousands)
      for (let ri = 4; ri >= 0; ri--) {
        const target_d = digits[ri];
        // Slide beads one at a time
        for (let c = 1; c <= target_d; c++) {
          if (!animRunning) return;
          const speed = 250 - (c * 20); // accelerating
          nudgeFrame(c * 0.3);
          await slideBead(ri, c, Math.max(speed, 100));
        }
      }
    }

    async function resetAll(fast) {
      const delay = fast ? 60 : 150;
      for (let ri = 0; ri < rods.length; ri++) {
        for (let c = state[ri]; c > 0; c--) {
          if (!animRunning) return;
          state[ri] = c - 1;
          renderAll();
          await sleep(delay);
        }
      }
      nudgeFrame(0);
    }

    async function animationCycle() {
      animRunning = true;
      // Initial rest
      await sleep(800);
      while (animRunning) {
        // Pick a random number to count to (with interesting digits)
        const target = Math.floor(Math.random() * 55555);
        await countUpTo(target);
        await sleep(1800);
        if (!animRunning) return;
        await resetAll(false);
        await sleep(1200);
      }
    }

    function stopAnimation() {
      animRunning = false;
      if (animId) { clearTimeout(animId); animId = null; }
    }

    // Start on scroll into view
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !animRunning) {
          animationCycle();
        } else if (!e.isIntersecting && animRunning) {
          stopAnimation();
          // Reset state silently
          state.fill(0);
          renderAll();
          nudgeFrame(0);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(frame.closest('.abacus-stage') || frame);

    renderAll();
  })();


  /* ── Colour Palette Dot Splash ── */
  document.querySelectorAll('.art-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const canvas = dot.closest('.art-canvas');
      if (!canvas) return;
      // change border colour of canvas to the dot colour
      canvas.style.borderColor = dot.style.background || dot.style.backgroundColor;
      // ripple on dot
      dot.style.transform = 'scale(1.5) translateY(-6px)';
      setTimeout(() => { dot.style.transform = ''; }, 350);
    });
  });


  /* ── Rubik's Cube — Hyper-Realistic Solve / Scramble ── */
  const cubeInner = document.querySelector('.rubik-cube-inner');
  if (cubeInner) {
    // Realistic Rubik's cube colors (official palette)
    const COLORS = ['#C41E3A','#FF5800','#0051BA','#009E60','#FFD500','#FFFFFF'];
    const FACE_NAMES = ['front','back','right','left','top','bottom'];

    // State: 6 faces × 9 cells
    let state = [];
    function resetState() {
      state = Array.from({length:6}, (_,i) => Array(9).fill(i));
    }
    resetState();

    const faceEls = FACE_NAMES.map(n => cubeInner.querySelector('.rubik-face.' + n));
    const cellEls = faceEls.map(f => [...f.querySelectorAll('.rubik-cell')]);

    function render() {
      for (let f = 0; f < 6; f++) {
        for (let c = 0; c < 9; c++) {
          cellEls[f][c].style.background = COLORS[state[f][c]];
        }
      }
    }
    render();

    // Face rotation logic
    function rotateFaceCW(fi) {
      const f = state[fi];
      state[fi] = [f[6],f[3],f[0],f[7],f[4],f[1],f[8],f[5],f[2]];
    }

    const MOVES = {
      U: { face: 4, strips: [[0,[0,1,2]], [3,[2,5,8]], [1,[8,7,6]], [2,[6,3,0]]] },
      D: { face: 5, strips: [[0,[6,7,8]], [2,[2,5,8]], [1,[2,1,0]], [3,[6,3,0]]] },
      R: { face: 2, strips: [[0,[2,5,8]], [4,[2,5,8]], [1,[6,3,0]], [5,[2,5,8]]] },
      L: { face: 3, strips: [[0,[0,3,6]], [5,[0,3,6]], [1,[8,5,2]], [4,[0,3,6]]] },
      F: { face: 0, strips: [[4,[6,7,8]], [2,[0,3,6]], [5,[2,1,0]], [3,[8,5,2]]] },
      B: { face: 1, strips: [[4,[2,1,0]], [3,[0,3,6]], [5,[6,7,8]], [2,[8,5,2]]] }
    };

    function applyMove(name, prime) {
      const m = MOVES[name];
      if (!prime) {
        rotateFaceCW(m.face);
        const s = m.strips;
        const tmp = [0,1,2].map(i => state[s[3][0]][s[3][1][i]]);
        for (let i = 3; i > 0; i--)
          for (let j = 0; j < 3; j++) state[s[i][0]][s[i][1][j]] = state[s[i-1][0]][s[i-1][1][j]];
        for (let j = 0; j < 3; j++) state[s[0][0]][s[0][1][j]] = tmp[j];
      } else {
        applyMove(name, false); applyMove(name, false); applyMove(name, false);
      }
    }

    // ── Cinematic Camera System ──
    // Smooth interpolation with easing (spring-like)
    let camRX = -25, camRY = 30;
    let targetRX = -25, targetRY = 30;
    let camVX = 0, camVY = 0;
    const SPRING = 0.08, DAMP = 0.75;

    function updateCamera() {
      camVX += (targetRX - camRX) * SPRING;
      camVY += (targetRY - camRY) * SPRING;
      camVX *= DAMP;
      camVY *= DAMP;
      camRX += camVX;
      camRY += camVY;
      cubeInner.style.transform = `rotateX(${camRX}deg) rotateY(${camRY}deg)`;
      requestAnimationFrame(updateCamera);
    }
    requestAnimationFrame(updateCamera);

    function setCameraTarget(rx, ry) {
      targetRX = rx;
      targetRY = ry;
    }

    // Move-specific camera angles (slight tilt to show the rotating face)
    const MOVE_VIEWS = {
      U: [-35, 20],  D: [20, -30],  R: [-20, -45],
      L: [-20, 45],  F: [-15, 5],   B: [-15, 175]
    };

    // Idle float — gentle orbit when paused
    let idleAngle = 0;
    let idleActive = false;
    function idleOrbit() {
      if (!idleActive) return;
      idleAngle += 0.004;
      targetRX = -22 + Math.sin(idleAngle * 0.7) * 8;
      targetRY = 30 + Math.sin(idleAngle) * 15;
      requestAnimationFrame(idleOrbit);
    }
    function startIdle() { idleActive = true; idleOrbit(); }
    function stopIdle() { idleActive = false; }

    // ── Animate a single move ──
    function animateMove(name, prime, speed) {
      return new Promise(resolve => {
        const [rx, ry] = MOVE_VIEWS[name];
        // Blend toward move view with slight random offset
        setCameraTarget(
          rx + (Math.random() * 8 - 4),
          ry + (Math.random() * 8 - 4)
        );

        // Wait for camera to start moving, then apply the state change
        const moveDelay = Math.max(120, speed * 0.45);
        const settleDelay = Math.max(100, speed * 0.55);

        setTimeout(() => {
          applyMove(name, prime);
          render();
          setTimeout(resolve, settleDelay);
        }, moveDelay);
      });
    }

    // ── Execute moves with variable speed ──
    async function executeMoves(moves, getSpeed) {
      for (let i = 0; i < moves.length; i++) {
        const [name, prime] = moves[i];
        const speed = getSpeed ? getSpeed(i, moves.length) : 500;
        await animateMove(name, prime, speed);
      }
    }

    const MOVE_NAMES = ['U','D','R','L','F','B'];

    function generateScramble(len) {
      const moves = [];
      let last = '';
      for (let i = 0; i < len; i++) {
        let m;
        do { m = MOVE_NAMES[Math.floor(Math.random() * 6)]; } while (m === last);
        last = m;
        moves.push([m, Math.random() > 0.5]);
      }
      return moves;
    }

    function reverseMoves(moves) {
      return moves.slice().reverse().map(([n, p]) => [n, !p]);
    }

    // ── Main Cycle ──
    async function cycle() {
      // 1. Start solved — idle float for a moment
      startIdle();
      await new Promise(r => setTimeout(r, 2500));
      stopIdle();

      // 2. Scramble — medium speed, constant pace
      const scramble = generateScramble(14 + Math.floor(Math.random() * 6));
      await executeMoves(scramble, () => 450);

      // Pause scrambled — slow dramatic orbit
      startIdle();
      await new Promise(r => setTimeout(r, 2000));
      stopIdle();

      // 3. Solve — starts slow, accelerates dramatically
      const solve = reverseMoves(scramble);
      await executeMoves(solve, (i, total) => {
        // Ease from 600ms down to 150ms (accelerating)
        const progress = i / total;
        return 600 - progress * 450;
      });

      // 4. Solved — dramatic slow zoom angle
      setCameraTarget(-20, 15);
      await new Promise(r => setTimeout(r, 1200));

      // Loop
      cycle();
    }

    // Start when in view
    const rubikObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        cycle();
        rubikObs.disconnect();
      }
    }, { threshold: 0.15 });
    rubikObs.observe(cubeInner.closest('.rubik-showcase'));
  }

})();
