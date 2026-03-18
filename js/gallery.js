/* ============================================
   LittleFriends - Gallery Page JS
   Pixel Dust Effect + Lightbox
   Images start as scattered dust tiles that
   auto-assemble when scrolled into view and
   stay assembled until page refresh.
   ============================================ */

const GalleryController = (() => {
  const TILE_SIZE = window.innerWidth <= 768 ? 8 : 5;
  let lightbox, lightboxImg, lightboxClose;

  /* ======== Pixel Dust Effect ======== */

  class DustImage {
    constructor(imgEl) {
      this.img = imgEl;
      this.cardInner = imgEl.closest('.gallery-card-inner');
      this.canvas = null;
      this.ctx = null;
      this.sourceCanvas = null;
      this.tiles = [];
      this.progress = 0;       // 0 = dust, 1 = assembled
      this.assembled = false;  // once true, stays assembled forever
      this.animating = false;

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        requestAnimationFrame(() => this.build());
      } else {
        imgEl.addEventListener('load', () => {
          requestAnimationFrame(() => this.build());
        });
      }
    }

    build() {
      const w = this.img.clientWidth;
      const h = this.img.clientHeight;
      if (w === 0 || h === 0) return;

      // Source canvas — draw image with object-fit:cover crop
      this.sourceCanvas = document.createElement('canvas');
      this.sourceCanvas.width = w;
      this.sourceCanvas.height = h;
      const sCtx = this.sourceCanvas.getContext('2d');
      drawCover(sCtx, this.img, w, h);

      // Display canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.className = 'pixel-dust-canvas';
      this.ctx = this.canvas.getContext('2d');

      // Generate tiles
      const cols = Math.ceil(w / TILE_SIZE);
      const rows = Math.ceil(h / TILE_SIZE);
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.hypot(cx, cy);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;
          const tw = Math.min(TILE_SIZE, w - x);
          const th = Math.min(TILE_SIZE, h - y);

          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 100;

          const fromCenter = Math.hypot(x + tw / 2 - cx, y + th / 2 - cy);
          const delay = (fromCenter / maxDist) * 0.45;

          this.tiles.push({
            x, y, w: tw, h: th,
            dustX: x + Math.cos(angle) * dist,
            dustY: y + Math.sin(angle) * dist,
            dustOpacity: 0.02 + Math.random() * 0.12,
            delay
          });
        }
      }

      // Insert canvas into DOM right after the image
      this.img.insertAdjacentElement('afterend', this.canvas);
      this.cardInner.classList.add('dust-ready');

      // Draw initial dust state
      this.draw(0);

      // Click canvas → open lightbox
      this.canvas.addEventListener('click', () => {
        openLightbox(this.img.src, this.img.alt);
      });

      // If assembly was requested before build finished, do it now
      if (this.pendingAssembly) {
        this.assemble();
      }
    }

    // Called once when the card scrolls into view
    assemble() {
      if (this.assembled) return;
      // If canvas isn't built yet, queue it for after build()
      if (!this.canvas) {
        this.pendingAssembly = true;
        return;
      }
      this.assembled = true;
      this.animateToAssembled();
    }

    animateToAssembled() {
      if (this.animating) return;
      this.animating = true;
      const tick = () => {
        const diff = 1 - this.progress;
        if (diff < 0.004) {
          this.progress = 1;
          this.draw(1);
          this.animating = false;
          return;
        }
        this.progress += diff * 0.06;
        this.draw(this.progress);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    draw(progress) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];

        const tp = clamp01((progress - t.delay) / (1 - t.delay));
        const e = easeInOutCubic(tp);

        const x = lerp(t.dustX, t.x, e);
        const y = lerp(t.dustY, t.y, e);
        const a = lerp(t.dustOpacity, 1, e);

        ctx.globalAlpha = a;
        ctx.drawImage(
          this.sourceCanvas,
          t.x, t.y, t.w, t.h,
          Math.round(x), Math.round(y), t.w, t.h
        );
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ======== Math Helpers ======== */

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Draw image mimicking CSS object-fit: cover
  function drawCover(ctx, img, dw, dh) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const ir = iw / ih;
    const cr = dw / dh;
    let sx, sy, sw, sh;
    if (ir > cr) {
      sh = ih; sw = ih * cr; sx = (iw - sw) / 2; sy = 0;
    } else {
      sw = iw; sh = iw / cr; sx = 0; sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  }

  /* ======== Lightbox ======== */

  function initLightbox() {
    lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;

    lightboxImg = lightbox.querySelector('img');
    lightboxClose = lightbox.querySelector('.gallery-lightbox-close');

    // Click on gallery images (mobile fallback when no canvas exists)
    document.querySelectorAll('.gallery-card-inner img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Gallery preview';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) lightboxImg.src = '';
    }, 400);
  }

  /* ======== Pixel Dust Init (scroll-triggered assembly) ======== */

  function initPixelDust() {

    const dustInstances = new Map();
    const pendingAssemblyImgs = new Set(); // imgs that need assembly but aren't built yet

    // Stage 1: Build canvases ahead of time (400px before visible)
    const buildObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dust = new DustImage(entry.target);
          dustInstances.set(entry.target, dust);
          buildObserver.unobserve(entry.target);
          // If assembly was already requested before build, trigger it
          if (pendingAssemblyImgs.has(entry.target)) {
            pendingAssemblyImgs.delete(entry.target);
            dust.assemble();
          }
        }
      });
    }, { rootMargin: '400px' });

    // Stage 2: Trigger assembly when card enters viewport
    const assembleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img');
          const dust = dustInstances.get(img);
          if (dust) {
            dust.assemble();
          } else {
            // DustImage not created yet — queue for when it's built
            pendingAssemblyImgs.add(img);
          }
          assembleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('.gallery-card-inner img').forEach(img => {
      buildObserver.observe(img);
    });

    document.querySelectorAll('.gallery-card-inner').forEach(card => {
      assembleObserver.observe(card);
    });
  }

  /* ======== Main Init ======== */

  function init() {
    initLightbox();
    initPixelDust();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  GalleryController.init();
});
