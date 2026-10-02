/* ============================================================
   UNIT FOUR — emailjs-config.js
   EmailJS settings for the contact form. Fill in the four values
   from your EmailJS dashboard. The public key is designed to sit in
   front-end code; lock it to your domain under Account > Domains.
   ============================================================ */

const EMAILJS_PUBLIC_KEY = 'ojcxtCMRz2UeHa-z9';
const EMAILJS_SERVICE_ID = 'service_nvuzvx8';
const EMAILJS_NOTIFY_TEMPLATE_ID = 'template_j83514k';
const EMAILJS_REPLY_TEMPLATE_ID = 'template_54uuvqk';

const PRICING_GUIDE_URL = 'https://claude.ai/artifact/TLicjj3EJfNJsiV2xrH6oL';

const emailjsConfigured = Boolean(window.emailjs) && ![
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_NOTIFY_TEMPLATE_ID,
  EMAILJS_REPLY_TEMPLATE_ID,
].some((value) => value.startsWith('YOUR_'));

if (emailjsConfigured) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
} else {
  console.warn('EmailJS is not configured yet. See js/emailjs-config.js. Contact form emails will not send until it is.');
}
