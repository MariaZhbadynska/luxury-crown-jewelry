(() => {
  const YEAR = 365 * 24 * 60 * 60;

  const setCookie = (k, v, max = YEAR) =>
    (document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(
      v
    )}; Max-Age=${max}; Path=/; SameSite=Lax`);

  const getCookie = (k) => {
    const m = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(k)}=([^;]*)`)
    );
    return m ? decodeURIComponent(m[1]) : null;
  };

  const ROOT =
    document.getElementById("cookie-root") ||
    (() => {
      const d = document.createElement("div");
      d.id = "cookie-root";
      document.body.appendChild(d);
      return d;
    })();

  const KEY = "crown_consent_v1";
  const DEFAULT = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  };

  const read = () => {
    try {
      return JSON.parse(getCookie(KEY)) || { ...DEFAULT };
    } catch {
      return { ...DEFAULT };
    }
  };
  const write = (c) => setCookie(KEY, JSON.stringify(c), YEAR);

  const api = {
    get: () => read(),
    setAll: (yes) =>
      save({ essential: true, analytics: !!yes, marketing: !!yes }),
    set: (opt) => save({ ...read(), ...opt, essential: true }),
    revoke: () => {
      write({ ...DEFAULT, timestamp: 0 });
      update();
    },
  };
  window.CROWN_CONSENT = api;

  let banner = null,
    modal = null;

  const save = (c) => {
    write({ ...c, timestamp: Date.now() });
    update();
    runDeferred();
  };
  const hideBanner = () => {
    banner && banner.remove();
    banner = null;
  };
  const closePrefs = () => {
    modal && modal.remove();
    modal = null;
  };

  const showBanner = () => {
    hideBanner();
    banner = document.createElement("div");
    banner.innerHTML = `
        <div class="cookie cbar" role="dialog" aria-live="polite" aria-label="Cookies">
          <p>We use cookies to improve your experience. Manage preferences in our <a href="./cookies.html">Cookies Policy</a>.</p>
          <div class="cbar__actions">
            <button class="btn btn--outline" data-a="reject">Reject non-essential</button>
            <button class="btn btn--solid"   data-a="accept">Accept all</button>
            <button class="link"             data-a="prefs">Preferences</button>
          </div>
        </div>`;
    ROOT.appendChild(banner);
    banner.querySelector('[data-a="accept"]').addEventListener("click", () => {
      api.setAll(true);
      hideBanner();
    });
    banner.querySelector('[data-a="reject"]').addEventListener("click", () => {
      api.setAll(false);
      hideBanner();
    });
    banner
      .querySelector('[data-a="prefs"]')
      .addEventListener("click", openPrefs);
  };

  const openPrefs = () => {
    closePrefs();
    const c = read();
    modal = document.createElement("div");
    modal.innerHTML = `
        <div class="cmodal" role="dialog" aria-modal="true" aria-label="Cookie preferences">
          <div class="cmodal__card">
            <h3>Cookie Preferences</h3>
            <form id="cookieForm">
              <label class="row"><input type="checkbox" checked disabled><span><strong>Essential</strong> — required for the site to work.</span></label>
              <label class="row"><input type="checkbox" name="analytics" ${
                c.analytics ? "checked" : ""
              }><span><strong>Analytics</strong> — to improve the product.</span></label>
              <label class="row"><input type="checkbox" name="marketing" ${
                c.marketing ? "checked" : ""
              }><span><strong>Marketing</strong> — personalised content.</span></label>
              <div class="cmodal__actions">
                <button type="button" class="btn" data-a="close">Cancel</button>
                <button type="submit" class="btn btn--solid">Save</button>
              </div>
            </form>
          </div>
        </div>`;
    ROOT.appendChild(modal);

    const form = modal.querySelector("#cookieForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      api.set({
        analytics: !!form.elements.analytics.checked,
        marketing: !!form.elements.marketing.checked,
      });
      closePrefs();
      hideBanner();
    });
    modal
      .querySelector('[data-a="close"]')
      .addEventListener("click", closePrefs);
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("cmodal")) closePrefs();
    });
  };

  const update = () => (read().timestamp > 0 ? hideBanner() : showBanner());

  const runDeferred = () => {
    const c = read();
    document
      .querySelectorAll("script[data-consent][data-src]")
      .forEach((tag) => {
        if (tag.dataset.loaded) return;
        const type = tag.getAttribute("data-consent");
        if (type === "analytics" && !c.analytics) return;
        if (type === "marketing" && !c.marketing) return;
        const s = document.createElement("script");
        s.src = tag.getAttribute("data-src");
        s.async = true;
        tag.after(s);
        tag.dataset.loaded = "1";
      });
  };

  read().timestamp === 0 ? showBanner() : runDeferred();

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#cookie-prefs"]');
    if (!a) return;
    e.preventDefault();
    openPrefs();
  });
})();
