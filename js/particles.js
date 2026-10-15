/* ============================================================
   UNIT FOUR — particles.js
   Hero background: slow drifting dots joined by faint lines, with a
   gentle pull-apart and a few connecting lines around the mouse.
   Plain canvas, no libraries. It only runs while the hero is on screen,
   the tab is visible and the intro is no longer covering it, and it
   draws a single still frame if the visitor prefers reduced motion.
   ============================================================ */

(function () {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const host = canvas.parentElement;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

  const GOLD = '255,215,0';
  const WHITE = '255,255,255';

  const AREA_PER_PARTICLE = touch ? 11000 : 15000;
  const MIN_PARTICLES = 12;
  const MAX_PARTICLES = touch ? 34 : 70;
  const LINK_DISTANCE = touch ? 105 : 135;
  const LINK_ALPHA = 0.15;
  const MOUSE_RADIUS = 150;
  const MIN_FRAME_MS = 15;   // ~60fps ceiling, so 120Hz screens don't double the work

  const particles = [];      // same array for the lifetime of the page
  const pointer = { x: 0, y: 0, seen: false };
  let width = 0;
  let height = 0;
  let running = false;
  let rafId = 0;
  let lastTime = 0;
  let inView = false;
  let pollId = 0;

  function makeParticle (x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 12;   // px per second
    const bx = Math.cos(angle) * speed;
    const by = Math.sin(angle) * speed;
    return {
      x, y,
      bx, by,             // the drift each dot settles back to
      vx: bx, vy: by,     // current velocity (the mouse can push this)
      r: 0.8 + Math.random() * 1.1,
      a: 0.35 + Math.random() * 0.4,
      color: Math.random() < 0.7 ? GOLD : WHITE,
    };
  }

  function resize () {
    const nextW = host.clientWidth;
    const nextH = host.clientHeight;
    if (!nextW || !nextH) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(nextW * dpr);
    canvas.height = Math.round(nextH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (width && height) {
      const sx = nextW / width;
      const sy = nextH / height;
      particles.forEach((p) => { p.x *= sx; p.y *= sy; });
    }
    width = nextW;
    height = nextH;

    const target = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE)));
    while (particles.length < target) {
      particles.push(makeParticle(Math.random() * width, Math.random() * height));
    }
    particles.length = Math.min(particles.length, target);

    draw();   // always leave a frame on the canvas, even when not animating
  }

  function step (dt) {
    const rect = canvas.getBoundingClientRect();
    const mx = pointer.x - rect.left;
    const my = pointer.y - rect.top;
    const mouseOn = pointer.seen && mx > -MOUSE_RADIUS && mx < width + MOUSE_RADIUS
                                 && my > -MOUSE_RADIUS && my < height + MOUSE_RADIUS;
    pointer.localX = mx;
    pointer.localY = my;
    pointer.on = mouseOn;

    const ease = Math.min(1, dt * 1.2);
    const r2 = MOUSE_RADIUS * MOUSE_RADIUS;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (mouseOn) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / MOUSE_RADIUS) * 260 * dt;
          p.vx += (dx / d) * push;
          p.vy += (dy / d) * push;
        }
      }

      p.vx += (p.bx - p.vx) * ease;
      p.vy += (p.by - p.vy) * ease;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); p.bx = Math.abs(p.bx); }
      else if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx); p.bx = -Math.abs(p.bx); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); p.by = Math.abs(p.by); }
      else if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy); p.by = -Math.abs(p.by); }
    }
  }

  function draw () {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    const link2 = LINK_DISTANCE * LINK_DISTANCE;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < link2) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DISTANCE) * LINK_ALPHA;
          ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (pointer.on) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - pointer.localX;
        const dy = p.y - pointer.localY;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          const alpha = (1 - Math.sqrt(d2) / MOUSE_RADIUS) * 0.28;
          ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(pointer.localX, pointer.localY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame (now) {
    rafId = requestAnimationFrame(frame);
    if (now - lastTime < MIN_FRAME_MS) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    step(dt);
    draw();
  }

  function start () {
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop () {
    running = false;
    cancelAnimationFrame(rafId);
  }

  /* The intro covers the hero until its autoAlpha reaches 0 (GSAP then
     sets visibility:hidden) and is removed from the page entirely once
     the visitor has scrolled back up through it. */
  function introCovering () {
    const intro = document.getElementById('intro');
    return !!intro && intro.style.visibility !== 'hidden';
  }

  function sync () {
    const visible = inView && !document.hidden;
    const show = visible && !introCovering();

    canvas.classList.toggle('is-live', show);

    if (show && !reduceMotion && !running) start();
    else if ((!show || reduceMotion) && running) stop();

    // watch for the intro finishing only while there's something to wait for
    if (visible && !pollId) pollId = setInterval(sync, 250);
    else if (!visible && pollId) { clearInterval(pollId); pollId = 0; }
  }

  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.seen = true;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { pointer.seen = false; });
  }

  document.addEventListener('visibilitychange', sync);

  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    sync();
  }, { threshold: 0 }).observe(host);

  let resizeQueued = false;
  new ResizeObserver(() => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; resize(); });
  }).observe(host);

  resize();
})();
