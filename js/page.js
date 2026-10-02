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
   On submit, three things happen in parallel:
     1. EmailJS sends a notification to hello@unitfourgroup.com
     2. EmailJS sends the visitor an automatic reply with a link to
        the pricing guide
     3. The submission is saved to Supabase for the /admin dashboard
   Only the notification (1) has to succeed for the visitor to see the
   success message. The auto-reply and the save are best-effort, so a
   hiccup in either never turns a delivered enquiry into an error. */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const submitBtn = contactForm.querySelector('.form__submit');
  const submitLabel = submitBtn.querySelector('span');
  const errorEl = document.getElementById('formError');
  const successEl = document.getElementById('formSuccess');

  const fields = contactForm.querySelectorAll('input, textarea');
  const phoneField = document.getElementById('phone');

  /* Native `required` accepts whitespace-only values and the tel input
     checks nothing about format, so validity is set by hand here. */
  function checkField (field) {
    const value = field.value.trim();
    let message = '';

    if (field.required && !value) {
      message = 'Please fill out this field.';
    } else if (field === phoneField) {
      const digits = value.replace(/\D/g, '');
      if (!/^[+()\d\s.-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
        message = 'Please enter a valid phone number, for example 07123 456789.';
      }
    }

    field.setCustomValidity(message);
  }

  fields.forEach((field) => field.addEventListener('input', () => checkField(field)));

  function sendEmail (templateId, params) {
    if (!emailjsConfigured) return Promise.reject(new Error('EmailJS is not configured'));
    return emailjs.send(EMAILJS_SERVICE_ID, templateId, params);
  }

  function sendNotification (s) {
    return sendEmail(EMAILJS_NOTIFY_TEMPLATE_ID, {
      full_name: s.full_name,
      business_name: s.business_name,
      email: s.email,
      phone: s.phone,
      message: s.message,
      submitted_at: new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'short',
      }),
    });
  }

  function sendAutoReply (s) {
    return sendEmail(EMAILJS_REPLY_TEMPLATE_ID, {
      to_name: s.full_name.split(' ')[0],
      to_email: s.email,
      business_name: s.business_name,
      pricing_guide_url: PRICING_GUIDE_URL,
    });
  }

  async function saveSubmission (s) {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('submissions').insert([s]);
    if (error) throw error;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    fields.forEach(checkField);
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

    const steps = ['notification email', 'auto-reply email', 'Supabase save'];
    const results = await Promise.allSettled([
      sendNotification(submission),
      sendAutoReply(submission),
      saveSubmission(submission),
    ]);
    results.forEach((result, i) => {
      if (result.status === 'rejected') console.error(steps[i] + ' failed:', result.reason);
    });

    submitBtn.disabled = false;
    submitLabel.textContent = originalLabel;

    if (results[0].status === 'fulfilled') {
      contactForm.hidden = true;
      successEl.hidden = false;
    } else {
      errorEl.hidden = false;
    }
  });
}

window.addEventListener('resize', () => ScrollTrigger.refresh());
