// ═══════════════════════════════════════════════════════════════
// REBAR UZBEKISTAN — Animations & micro-interactions engine
// Parallax (scroll + pointer + device tilt), reveal, count-up,
// Telegram haptic feedback, ripple, header shadow on scroll.
// ═══════════════════════════════════════════════════════════════

(function () {
  const reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Telegram WebApp init (best-effort)
  const TG = window.Telegram && window.Telegram.WebApp;
  try {
    if (TG && typeof TG.ready === 'function') {
      TG.ready();
      if (typeof TG.expand === 'function') TG.expand();
      try { TG.setHeaderColor && TG.setHeaderColor('#15130F'); } catch {}
      try { TG.setBackgroundColor && TG.setBackgroundColor('#F3F2EE'); } catch {}
    }
  } catch (e) { /* silent */ }

  // ── Haptic helper
  window.hap = function (type) {
    try {
      const h = TG && TG.HapticFeedback;
      if (!h) return;
      if (type === 'success' || type === 'error' || type === 'warning') {
        h.notificationOccurred(type);
      } else {
        // light | medium | heavy | rigid | soft
        h.impactOccurred(type || 'light');
      }
    } catch (e) { /* silent */ }
  };

  // ── Reveal on scroll
  function initReveal() {
    const els = document.querySelectorAll('.reveal:not(.in-view)');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  // ── Count-up animation
  function animateCount(el) {
    if (reduced) {
      el.textContent = el.dataset.count;
      return;
    }
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration) || 1400;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const v = target * ease;
      el.textContent = (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('ru-RU')) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString('ru-RU')) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function initCountUp() {
    const els = document.querySelectorAll('[data-count]:not(.counted)');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => { el.classList.add('counted'); animateCount(el); });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('counted');
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
  }

  // ── Scroll parallax
  function initParallaxScroll() {
    const items = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!items.length || reduced) return;
    let ticking = false;
    function update() {
      const sy = window.scrollY || window.pageYOffset;
      items.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${(-sy * speed).toFixed(2)}px, 0)`;
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  // ── Pointer / device-orientation parallax (hero blobs)
  function initParallaxPointer() {
    if (reduced) return;
    const containers = document.querySelectorAll('[data-parallax-container]');
    if (!containers.length) return;

    containers.forEach((container) => {
      const layers = container.querySelectorAll('[data-depth]');
      if (!layers.length) return;

      let rx = 0, ry = 0; // current
      let tx = 0, ty = 0; // target
      let running = false;

      function loop() {
        rx += (tx - rx) * 0.08;
        ry += (ty - ry) * 0.08;
        layers.forEach((layer) => {
          const d = parseFloat(layer.dataset.depth) || 0.25;
          layer.style.transform = `translate3d(${(rx * 30 * d).toFixed(2)}px, ${(ry * 30 * d).toFixed(2)}px, 0)`;
        });
        if (Math.abs(tx - rx) > 0.001 || Math.abs(ty - ry) > 0.001) {
          requestAnimationFrame(loop);
        } else {
          running = false;
        }
      }
      function trigger() {
        if (!running) {
          running = true;
          requestAnimationFrame(loop);
        }
      }
      container.addEventListener('pointermove', (e) => {
        const r = container.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        trigger();
      });
      container.addEventListener('pointerleave', () => {
        tx = 0; ty = 0;
        trigger();
      });

      // Device orientation fallback for mobile
      if (window.DeviceOrientationEvent) {
        let lastTime = 0;
        window.addEventListener('deviceorientation', (e) => {
          const now = Date.now();
          if (now - lastTime < 40) return; // throttle ~25fps
          lastTime = now;
          if (e.gamma == null || e.beta == null) return;
          tx = Math.max(-1, Math.min(1, e.gamma / 35));
          ty = Math.max(-1, Math.min(1, (e.beta - 30) / 35));
          trigger();
        });
      }
    });
  }

  // ── Header shadow on scroll
  function bindHeaderScroll() {
    const header = document.querySelector('.top-bar');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 6) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Ripple on tappable elements
  function bindRipple() {
    if (reduced) return;
    const selector = '.cat-tab, .lang-btn, .btn-red, .btn-ghost-light, .detail-btn, .submit-btn, .contact-card, .add-cart-btn';
    document.addEventListener('click', (e) => {
      const target = e.target.closest(selector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const span = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.6;
      span.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:radial-gradient(circle,rgba(255,255,255,.35) 0%,transparent 70%);
        border-radius:50%;
        pointer-events:none;
        transform:scale(0);
        opacity:1;
        transition:transform .55s var(--ease-out, cubic-bezier(.16,.84,.32,1)), opacity .55s;
        z-index:0;
      `;
      const prev = getComputedStyle(target).position;
      if (prev === 'static') target.style.position = 'relative';
      const prevOverflow = target.style.overflow;
      target.style.overflow = 'hidden';
      target.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = 'scale(1)';
        span.style.opacity = '0';
      });
      setTimeout(() => { span.remove(); target.style.overflow = prevOverflow; }, 620);
    }, { passive: true });
  }

  // ── Fly-to-cart animation
  window.flyToCart = function (sourceEl) {
    if (reduced) return;
    const navCart = document.querySelector('.nav-item[data-page="cart"]') ||
                    document.querySelector('.nav-item[href*="checkout"]');
    if (!navCart) return;
    const tRect = navCart.getBoundingClientRect();

    let sRect;
    if (sourceEl && sourceEl.getBoundingClientRect) {
      const r = sourceEl.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) sRect = r;
    }
    if (!sRect) {
      sRect = { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    }

    const dot = document.createElement('span');
    dot.className = 'fly-dot';
    dot.style.left = (sRect.left + sRect.width / 2 - 7) + 'px';
    dot.style.top = (sRect.top + sRect.height / 2 - 7) + 'px';
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.left = (tRect.left + tRect.width / 2 - 7) + 'px';
      dot.style.top = (tRect.top + tRect.height / 2 - 7) + 'px';
      dot.style.opacity = '0';
      dot.style.transform = 'scale(.4)';
    });
    setTimeout(() => {
      dot.remove();
      const badge = document.getElementById('navCartBadge');
      if (badge) {
        badge.classList.remove('cart-bounce');
        void badge.offsetWidth;
        badge.classList.add('cart-bounce');
      }
    }, 600);
  };

  // ── Public refresh API for dynamically loaded content
  window.TPAnim = {
    refresh() {
      if (typeof injectIcons === 'function') injectIcons();
      initReveal();
      initCountUp();
    },
    haptic: window.hap,
  };

  function init() {
    if (typeof injectIcons === 'function') injectIcons();
    initReveal();
    initCountUp();
    initParallaxScroll();
    initParallaxPointer();
    bindHeaderScroll();
    bindRipple();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
