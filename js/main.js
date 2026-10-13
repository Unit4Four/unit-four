/* ============================================================
   UNIT FOUR — main.js
   Native scroll + GSAP ScrollTrigger choreography
   ============================================================ */

document.getElementById('year').textContent = new Date().getFullYear();

gsap.registerPlugin(ScrollTrigger);

/* Mobile browsers fire `resize` every time the address bar slides in or
   out while scrolling. Without this, each one makes ScrollTrigger rebuild
   every pin and trigger mid-scroll, which shows up as jumps and stalls. */
ScrollTrigger.config({ ignoreMobileResize: true });

/* ---------------- Intro: logo zoom ---------------- */

const isMobile = window.matchMedia('(max-width:720px)').matches;
const screenEl = document.getElementById('logoStage');
const introEl = document.getElementById('intro');
/* kept short on purpose, this is a quick zoom-through, not a long scroll.
   Measured from the intro's own height (the stable small-viewport height)
   rather than window.innerHeight, which changes with the toolbar. */
const introScrollLength = () => introEl.offsetHeight * (isMobile ? 1.1 : 1.3);

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
const heroEl = document.getElementById('hero');
const mainEl = document.getElementById('site');

/* The intro is a one-way gate. Once it has been scrolled all the way
   through, the first scroll back up through its end removes it from the
   page for good (see collapseIntro), so the hero becomes the top of the
   site and the visitor can scroll freely. A reload plays it again. */
let introCompleted = false;
let introCollapsed = false;

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
      if (self.progress >= 1) introCompleted = true;

      nav.classList.toggle('is-visible', self.progress > 0.9);

      if (self.progress > 0.7 && !headlinePlayed) {
        headlinePlayed = true;
        headlineTl.play();
      } else if (self.progress < 0.7 && headlinePlayed) {
        headlinePlayed = false;
        headlineTl.reverse();
      }
    },
    /* Coming back up through the end of the intro (or jumping straight to
       the top). Only counts once the intro has actually been completed;
       scrolling back up mid-intro still just rewinds the zoom. Deferred
       to a microtask because a trigger can't safely kill itself from
       inside its own callback, and it still runs before the next paint. */
    onEnterBack: () => queueMicrotask(collapseIntro),
    onLeaveBack: () => queueMicrotask(collapseIntro),
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

const heroNavTrigger = ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top+=40',
  onEnter: () => nav.classList.add('is-solid'),
  onLeaveBack: () => nav.classList.remove('is-solid'),
});

function syncNavSolid () {
  nav.classList.toggle('is-solid', window.scrollY > 40);
}

function collapseIntro () {
  if (introCollapsed || !introCompleted) return;
  introCollapsed = true;

  const root = document.documentElement;
  const heroTopBefore = heroEl.getBoundingClientRect().top;

  /* Browsers' own scroll anchoring would also try to compensate for the
     layout shift below; switch it off for this one step so the correction
     further down is the only one applied. */
  root.style.overflowAnchor = 'none';

  introTl.scrollTrigger.kill(true);   // drops the pin and its spacer
  introTl.kill();
  introEl.remove();
  mainEl.classList.remove('main--with-intro');   // no more pull-up under the intro

  /* The hero was one intro-length down the page and is now at the very
     top. Scroll by exactly how far it moved so it stays where it was on
     screen: no visible jump. */
  const drift = heroEl.getBoundingClientRect().top - heroTopBefore;
  if (drift) window.scrollBy(0, drift);

  headlineTl.progress(1);
  nav.classList.add('is-visible');

  /* With no intro above it the hero is the top of the page, so the nav
     behaves like the other pages: solid once you've scrolled a little. */
  heroNavTrigger.kill();
  window.addEventListener('scroll', syncNavSolid, { passive: true });
  syncNavSolid();

  ScrollTrigger.refresh();
  requestAnimationFrame(() => { root.style.overflowAnchor = ''; });
}

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
