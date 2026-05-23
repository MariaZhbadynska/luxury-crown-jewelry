document.addEventListener('DOMContentLoaded', () => {
    const load = async (sel, url) => {
      const host = document.querySelector(sel);
      if (!host) return;
      const res = await fetch(url, { cache: 'no-cache' }).catch(() => null);
      if (res?.ok) host.innerHTML = await res.text();
    };
  
    document.documentElement.classList.add('js');
  
    Promise.all([
      load('#site-header', './header.html'),
      load('#site-footer', './footer.html'),
    ]).then(() => {
      document.dispatchEvent(new Event('partials:ready'));
      document.querySelectorAll('#site-header .nav')
        .forEach(el => el.classList.add('is-ready'));
    });
  });
  