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


  /* ── Nunchaku Physics Animation Engine ── */
  (() => {
    const stage = document.getElementById('nunchaku-stage');
    const weapon = document.getElementById('nunchaku-weapon');
    const handleB = document.getElementById('nunchaku-handle-b');
    const chain = document.getElementById('nunchaku-chain');
    const particlesEl = document.getElementById('nunchaku-particles');
    if (!stage || !weapon || !handleB) return;

    // Physics state
    let time = 0;
    let running = false;
    let rafId = null;

    // Animation phases
    const PHASES = ['idle', 'swing', 'spin', 'figure8', 'slowmo', 'rest'];
    let phase = 'idle';
    let phaseTime = 0;
    let phaseDuration = 0;

    // Easing helpers
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    // Particle spawner
    function spawnParticle(x, y) {
      if (!particlesEl) return;
      const p = document.createElement('div');
      p.className = 'nunchaku-particle';
      const size = 2 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = Math.random() > 0.5
        ? 'rgba(255,180,80,0.8)' : 'rgba(255,107,107,0.7)';
      particlesEl.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }

    // Apply transforms
    function applyFrame(weaponAngle, handleBAngle, weaponX, weaponY, weaponScale, perspShift) {
      const rx = 5 + perspShift * 8;
      const ry = perspShift * 15;
      weapon.style.transform =
        'translate(' + weaponX + 'px, ' + weaponY + 'px) ' +
        'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) ' +
        'rotate(' + weaponAngle + 'deg) ' +
        'scale(' + weaponScale + ')';
      handleB.style.transform = 'rotate(' + handleBAngle + 'deg)';

      // Chain tension — spread links based on handle angle
      if (chain) {
        const tension = Math.abs(handleBAngle) / 180;
        chain.style.gap = (3 + tension * 4) + 'px';
      }
    }

    // Phase: Idle float
    function tickIdle(dt) {
      const wobble = Math.sin(time * 1.2) * 8;
      const float = Math.sin(time * 0.8) * 12;
      const handleSwing = Math.sin(time * 1.5) * 15;
      const scale = 1 + Math.sin(time * 0.6) * 0.02;
      const persp = Math.sin(time * 0.4) * 0.15;
      applyFrame(wobble, handleSwing, 0, float, scale, persp);
    }

    // Phase: Dynamic swinging
    function tickSwing(dt) {
      const t = phaseTime / phaseDuration;
      const intensity = Math.sin(t * Math.PI); // ramp up then down
      const weaponA = Math.sin(time * 3.5) * (40 + intensity * 80);
      const handleA = Math.sin(time * 5) * (30 + intensity * 120);
      const sway = Math.sin(time * 2) * (10 + intensity * 25);
      const bob = Math.cos(time * 3) * (8 + intensity * 15);
      const scale = 1 + intensity * 0.08 + Math.sin(time * 6) * 0.03;
      const persp = Math.sin(time * 1.8) * 0.3 * intensity;
      applyFrame(weaponA, handleA, sway, bob, scale, persp);

      // Spawn particles at fast moments
      if (intensity > 0.4 && Math.random() < 0.15) {
        const rect = stage.getBoundingClientRect();
        spawnParticle(
          rect.width * 0.3 + Math.random() * rect.width * 0.4,
          rect.height * 0.2 + Math.random() * rect.height * 0.5
        );
      }
    }

    // Phase: Full spin
    function tickSpin(dt) {
      const t = phaseTime / phaseDuration;
      const spinSpeed = easeInOutCubic(Math.min(t * 2, 1)) * 720;
      const weaponA = (time * 200) % 360;
      const handleA = Math.sin(time * 8) * 160;
      const popOut = Math.sin(t * Math.PI);
      const scale = 1 + popOut * 0.25; // "coming out of screen" effect
      const y = -popOut * 30;
      const persp = popOut * 0.5;
      applyFrame(weaponA, handleA, Math.sin(time * 3) * 15, y, scale, persp);

      if (Math.random() < 0.2) {
        const rect = stage.getBoundingClientRect();
        spawnParticle(
          rect.width * 0.2 + Math.random() * rect.width * 0.6,
          rect.height * 0.1 + Math.random() * rect.height * 0.6
        );
      }
    }

    // Phase: Figure-8 pattern
    function tickFigure8(dt) {
      const t = phaseTime / phaseDuration;
      const intensity = Math.sin(t * Math.PI);
      // Lissajous figure-8
      const cx = Math.sin(time * 2) * 35 * intensity;
      const cy = Math.sin(time * 4) * 20 * intensity;
      const weaponA = Math.sin(time * 3) * 60 * intensity;
      const handleA = Math.cos(time * 4.5) * 140 * intensity;
      const scale = 1 + Math.sin(time * 2) * 0.1 * intensity;
      const persp = Math.sin(time * 1.5) * 0.25 * intensity;
      applyFrame(weaponA, handleA, cx, cy, scale, persp);

      if (intensity > 0.3 && Math.random() < 0.1) {
        const rect = stage.getBoundingClientRect();
        spawnParticle(
          rect.width * 0.3 + Math.random() * rect.width * 0.4,
          rect.height * 0.2 + Math.random() * rect.height * 0.5
        );
      }
    }

    // Phase: Slow-motion dramatic
    function tickSlowMo(dt) {
      const t = phaseTime / phaseDuration;
      const slowT = time * 0.3;
      const weaponA = Math.sin(slowT * 2) * 90;
      const handleA = Math.sin(slowT * 3) * 130;
      const scale = 1.15 + Math.sin(slowT) * 0.1;
      const y = Math.sin(slowT * 0.5) * 15;
      const persp = Math.sin(slowT * 0.8) * 0.4;
      applyFrame(weaponA, handleA, 0, y, scale, persp);
    }

    // Phase: Rest (return to center)
    function tickRest(dt) {
      const t = easeOutQuart(Math.min(phaseTime / phaseDuration, 1));
      // Blend smoothly back to idle
      const wobble = Math.sin(time * 1.2) * 8 * t;
      const float = Math.sin(time * 0.8) * 12 * t;
      const handleSwing = Math.sin(time * 1.5) * 15 * t;
      applyFrame(wobble * (1 - t), handleSwing * (1 - t), 0, float * (1 - t), 1, 0);
    }

    // Phase schedule
    const schedule = [
      { name: 'idle',    dur: 3.0 },
      { name: 'swing',   dur: 4.5 },
      { name: 'rest',    dur: 1.5 },
      { name: 'spin',    dur: 3.5 },
      { name: 'rest',    dur: 1.5 },
      { name: 'figure8', dur: 4.0 },
      { name: 'rest',    dur: 1.5 },
      { name: 'slowmo',  dur: 3.5 },
      { name: 'rest',    dur: 2.0 },
    ];
    let schedIdx = 0;

    function nextPhase() {
      const entry = schedule[schedIdx % schedule.length];
      phase = entry.name;
      phaseDuration = entry.dur;
      phaseTime = 0;
      schedIdx++;
    }

    function tick(dt) {
      time += dt;
      phaseTime += dt;

      if (phaseTime >= phaseDuration) nextPhase();

      switch (phase) {
        case 'idle':    tickIdle(dt); break;
        case 'swing':   tickSwing(dt); break;
        case 'spin':    tickSpin(dt); break;
        case 'figure8': tickFigure8(dt); break;
        case 'slowmo':  tickSlowMo(dt); break;
        case 'rest':    tickRest(dt); break;
      }
    }

    let lastT = 0;
    function loop(ts) {
      if (!running) return;
      const dt = Math.min((ts - lastT) / 1000, 0.05); // cap delta
      lastT = ts;
      tick(dt);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      time = 0;
      schedIdx = 0;
      nextPhase();
      lastT = performance.now();
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      applyFrame(0, 0, 0, 0, 1, 0);
    }

    // IntersectionObserver to start/stop
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.25 });
    obs.observe(stage);
  })();


  /* ── Art Brush Slider – CSS handles the infinite marquee ── */


  /* ── Abacus — now handled by abacus3d.js (Three.js) ── */


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


  /* ── Rubik's Cube — now handled by rubik3d.js (Three.js) ── */

})();
