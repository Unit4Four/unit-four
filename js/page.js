/* ============================================================
   UNIT FOUR — page.js
   Shared behaviour for interior pages (services / about / contact):
   nav goes solid on scroll, and .reveal elements fade up into view.
   No intro/logo-zoom logic here — that only exists on index.html.
   ============================================================ */

document.getElementById('year').textContent = new Date().getFullYear();

gsap.registerPlugin(ScrollTrigger);

const nav = document.getElementById('siteNav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-solid', window.scrollY > 40);
}, { passive: true });

gsap.utils.toArray('.reveal').forEach((el) => {
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

/* ---------------- Contact form (contact.html only) ---------------- */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const fullName = data.get('fullName').trim();
    const companyName = data.get('companyName').trim();
    const companyAbout = data.get('companyAbout').trim();
    const email = data.get('email').trim();
    const phone = data.get('phone').trim() || 'Not provided';
    const service = data.get('service');

    const subject = `New Project Inquiry from ${companyName}`;
    const body =
      `Full Name: ${fullName}\n` +
      `Company Name: ${companyName}\n` +
      `What They Do: ${companyAbout}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Service Interested In: ${service}\n\n` +
      `Submitted via the Unit Four contact form.`;

    const mailtoUrl = `mailto:hello@unitfourgroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const submitBtn = contactForm.querySelector('.form__submit span');
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Opening Your Email...';

    window.location.href = mailtoUrl;

    setTimeout(() => { submitBtn.textContent = originalLabel; }, 2500);
  });
}

window.addEventListener('resize', () => ScrollTrigger.refresh());
