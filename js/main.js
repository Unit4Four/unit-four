/* ============================================================
   UNIT FOUR — main.js
   Native scroll + GSAP ScrollTrigger choreography
   ============================================================ */

document.getElementById('year').textContent = new Date().getFullYear();

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Intro: logo zoom ---------------- */

const isMobile = window.matchMedia('(max-width:720px)').matches;
const screenEl = document.getElementById('logoStage');
/* kept short on purpose — this is a quick zoom-through, not a long scroll */
const introScrollLength = () => (isMobile ? window.innerHeight * 1.1 : window.innerHeight * 1.3);

/* scale needed for the logo to fully cover the viewport, plus a little
   overshoot so the black "dive through" reads as deliberate rather than an
   abrupt cut into the hero */
function getCoverScale () {
  const rect = screenEl.getBoundingClientRect();
  const baseW = rect.width / (gsap.getProperty(screenEl, 'scaleX') || 1);
  const baseH = rect.height / (gsap.getProperty(screenEl, 'scaleY') || 1);
  const scaleX = window.innerWidth / baseW;
  const scaleY = window.innerHeight / baseH;
  return Math.max(scaleX, scaleY) * 1.15;
}

/* Nav reveal + hero headline mask-slide both need to react to the intro's
   scroll progress. Creating separate ScrollTrigger.create() calls on the
   same pinned '#intro' element is unreliable — once an element is pinned,
   a second trigger measuring "top" against it resolves post-pin-spacer and
   ends up wildly offset. So everything is driven from the single pin
   trigger's own onUpdate instead. */
const nav = document.getElementById('siteNav');

gsap.set('.hero__headline .line', { y: '110%' });
const headlineTl = gsap.timeline({ paused: true }).to('.hero__headline .line', {
  y: '0%',
  duration: 1.1,
  ease: 'power4.out',
  stagger: 0.1,
});
let headlinePlayed = false;

const introTl = gsap.timeline({
  scrollTrigger: {
    trigger: '#intro',
    start: 'top top',
    end: () => '+=' + introScrollLength(),
    /* a low smoothing value keeps this tightly coupled to scroll position —
       with a short pin distance, the old scrub:1 lag made scrolling back up
       look like it was stuck near the "zoomed in" end state before it
       caught up and unwound to the small logo */
    scrub: 0.3,
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      nav.classList.toggle('is-visible', self.progress > 0.9);

      if (self.progress > 0.7 && !headlinePlayed) {
        headlinePlayed = true;
        headlineTl.play();
      } else if (self.progress < 0.7 && headlinePlayed) {
        headlinePlayed = false;
        headlineTl.reverse();
      }
    }
  }
});

introTl
  .to('#logoStage', {
      scale: () => getCoverScale(),
      duration: 0.85,
      ease: 'power1.in'
    }, 0)
  .to('.intro__hint', { opacity: 0, duration: 0.08 }, 0)
  .to('.intro', { autoAlpha: 0, duration: 0.15 }, 0.82);

ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top+=40',
  onEnter: () => nav.classList.add('is-solid'),
  onLeaveBack: () => nav.classList.remove('is-solid'),
});

/* ---------------- Section entrance reveals ---------------- */

gsap.utils.toArray('.reveal').forEach((el, i) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    }
  });
});

/* Recalculate on resize */
window.addEventListener('resize', () => ScrollTrigger.refresh());
