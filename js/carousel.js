/* ============================================================
   UNIT FOUR — carousel.js
   Case study carousel on the homepage: native scroll snapping, with
   the left/right buttons scrolling it one card at a time.
   ============================================================ */

(function () {
  const track = document.getElementById('caseTrack');
  const prev = document.getElementById('casePrev');
  const next = document.getElementById('caseNext');
  if (!track || !prev || !next) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function step () {
    const card = track.querySelector('.case-card');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function update () {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }

  /* Move to the neighbouring card's snap position, worked out from the
     card index rather than "current position + one card", so a quick
     double click can't land between two cards. */
  function go (dir) {
    const size = step();
    const max = track.scrollWidth - track.clientWidth;
    const index = Math.round(track.scrollLeft / size) + dir;
    const left = Math.max(0, Math.min(index * size, max));
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
