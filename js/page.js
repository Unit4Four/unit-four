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

/* ---------------- Contact form (contact.html only) ----------------
   Submits to Formspree (emails hello@unitfourgroup.com) and, if
   Supabase is configured (see js/supabase-config.js), also saves the
   submission so it shows up in /admin. Formspree is the one that must
   succeed for the user to see a success message — the Supabase save
   is best-effort and never blocks the form. */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const submitBtn = contactForm.querySelector('.form__submit');
  const submitLabel = submitBtn.querySelector('span');
  const errorEl = document.getElementById('formError');
  const successEl = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    errorEl.hidden = true;
    submitBtn.disabled = true;
    const originalLabel = submitLabel.textContent;
    submitLabel.textContent = 'Sending...';

    const data = new FormData(contactForm);
    const submission = {
      full_name: data.get('fullName').trim(),
      business_name: data.get('businessName').trim(),
      email: data.get('email').trim(),
      phone: data.get('phone').trim(),
      message: data.get('message').trim(),
    };

    let emailSent = false;
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });
      emailSent = res.ok;
    } catch (err) {
      emailSent = false;
    }

    if (supabaseClient) {
      try {
        await supabaseClient.from('submissions').insert([submission]);
      } catch (err) {
        console.error('Supabase insert failed:', err);
      }
    }

    submitBtn.disabled = false;
    submitLabel.textContent = originalLabel;

    if (emailSent) {
      contactForm.hidden = true;
      successEl.hidden = false;
    } else {
      errorEl.hidden = false;
    }
  });
}

window.addEventListener('resize', () => ScrollTrigger.refresh());
