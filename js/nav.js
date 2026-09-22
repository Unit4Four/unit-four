/* ============================================================
   UNIT FOUR — nav.js
   Mobile hamburger menu. Shared across every page (index, services,
   about, contact) since the nav markup is identical on all of them.
   Pure vanilla JS / CSS transitions — no GSAP dependency, so it works
   the same whether the page also loads main.js or page.js.
   ============================================================ */

(function () {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  burger.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
})();
