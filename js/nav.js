(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  function initNav(){
    const nav = $('#site-header .nav') || $('.nav');
    if (!nav || nav.dataset.inited === '1') return;

    const toggle  = $('.nav__toggle', nav);
    const overlay = $('.nav__overlay', nav);
    const drawer  = $('.nav__drawer', nav);

    const lockScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const sbw = window.innerWidth - document.documentElement.clientWidth; // ширина скролбару
      document.body.style.setProperty('--lock-top', `-${y}px`);
      document.body.style.setProperty('--sbw', `${sbw}px`);
      document.body.dataset.lockY = String(y);
      document.body.classList.add('nav-lock');
    };
    const unlockScroll = () => {
      const y = parseInt(document.body.dataset.lockY || '0', 10);
      document.body.classList.remove('nav-lock');
      document.body.style.removeProperty('--lock-top');
      document.body.style.removeProperty('--sbw');
      delete document.body.dataset.lockY;
      window.scrollTo(0, y);
    };

    const setMenu = (open) => {
      nav.classList.toggle('nav--open', open);
      toggle?.setAttribute('aria-expanded', String(open));
      drawer?.setAttribute('aria-hidden', String(!open));
      if (open) lockScroll(); else unlockScroll();
    };

    on(toggle,  'click', () => setMenu(!nav.classList.contains('nav--open')));
    on(overlay, 'click', () => setMenu(false));
    $$('.nav__drawer a', nav).forEach(a => on(a, 'click', () => setMenu(false)));

    const mq = window.matchMedia('(min-width:901px)');
    const closeIfWide = () => { if (mq.matches) setMenu(false); };
    mq.addEventListener('change', closeIfWide);
    on(window, 'resize', closeIfWide, { passive:true });
    on(window, 'orientationchange', closeIfWide);

    nav.classList.add('is-ready');
    nav.dataset.inited = '1';
  }

  if (document.readyState !== 'loading') initNav();
  else document.addEventListener('DOMContentLoaded', initNav);

  document.addEventListener('partials:ready', initNav);
})();

