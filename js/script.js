document.addEventListener("DOMContentLoaded", () => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  const nav = qs(".nav");
  const heroFrame = qs(".hero__frame");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 6);

    if (heroFrame) {
      const r = heroFrame.getBoundingClientRect();
      const centerDelta = r.top + r.height / 2 - window.innerHeight / 2;
      heroFrame.style.setProperty("--py", `${-centerDelta * 0.04}px`);
    }
  }
  if (nav) nav.classList.add("is-ready");
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(onScroll));

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="./#"]');
    if (!a) return;
    const id = (a.getAttribute("href") || "").replace("./", "");
    const target = qs(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );
  qsa(".reveal").forEach((el) => io.observe(el));

  const track = qs(".catalog__track");
  const btnPrev = qs(".cat-btn--prev");
  const btnNext = qs(".cat-btn--next");

  if (track) {
    const getStep = () => {
      const first = qs(".item", track);
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return (first ? first.getBoundingClientRect().width : 0) + gap;
    };

    function move(dir) {
      track.scrollBy({ left: dir * getStep(), behavior: "smooth" });
    }

    function updateButtons() {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (btnPrev) btnPrev.disabled = track.scrollLeft <= 2;
      if (btnNext) btnNext.disabled = track.scrollLeft >= max;
    }

    btnPrev && btnPrev.addEventListener("click", () => move(-1));
    btnNext && btnNext.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", () => setTimeout(updateButtons, 60));
    updateButtons();
  }

  const qv = qs("#qv");
  const qvImg = qs("#qvImg");
  const qvTitle = qs("#qvTitle");
  const qvPrice = qs("#qvPrice");
  const qvDesc = qs("#qvDesc");
  const qvMat = qs("#qvMaterials");
  const qvFin = qs("#qvFinish");
  const qvSize = qs("#qvSize");
  const qvStone = qs("#qvStone");
  const qvHi = qs("#qvHighlights");
  const qvStage = qs("#qvStage");
  const qvThumbs = qs("#qvThumbs");

  const dialogSupported =
    typeof HTMLDialogElement === "function" &&
    qv &&
    typeof qv.showModal === "function";

  function openQV() {
    if (!qv) return;
    if (dialogSupported) {
      if (!qv.open) qv.showModal();
    } else qv.classList.add("is-open");
  }
  function closeQV() {
    if (!qv) return;
    if (dialogSupported) qv.close();
    else qv.classList.remove("is-open");
  }

  qs(".qv__close", qv || undefined)?.addEventListener("click", closeQV);
  qv?.addEventListener("click", (e) => {
    if (e.target === qv) closeQV();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (qv?.open || qv?.classList.contains("is-open")))
      closeQV();
  });

  function setHighlights(text) {
    if (!qvHi) return;
    qvHi.innerHTML = "";
    (text || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        qvHi.appendChild(li);
      });
  }

  function setGallery(srcList) {
    if (!qvThumbs || !qvImg) return;
    qvThumbs.innerHTML = "";
    const list = (srcList || []).filter(Boolean);

    function setMain(src, li) {
      qvImg.src = src;
      qvImg.alt = qvTitle?.textContent || "Jewelry";
      qsa("#qvThumbs li").forEach((el) => el.removeAttribute("aria-current"));
      li && li.setAttribute("aria-current", "true");
    }

    list.forEach((src, i) => {
      const li = document.createElement("li");
      const im = document.createElement("img");
      im.src = src;
      li.appendChild(im);
      li.addEventListener("click", () => setMain(src, li));
      qvThumbs.appendChild(li);
      if (i === 0) setMain(src, li);
    });
  }

  if (qvStage && qvImg) {
    qvStage.addEventListener("mousemove", (e) => {
      const r = qvStage.getBoundingClientRect();
      qvStage.classList.add("qv__stage--zoom");
      const ox = ((e.clientX - r.left) / r.width) * 100;
      const oy = ((e.clientY - r.top) / r.height) * 100;
      qvImg.style.transformOrigin = `${ox}% ${oy}%`;
    });
    qvStage.addEventListener("mouseleave", () => {
      qvStage.classList.remove("qv__stage--zoom");
      qvImg.style.transformOrigin = "50% 50%";
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-quick");
    if (!btn) return;

    const card = btn.closest(".item");
    if (!card) return;

    const get = (k, def = "") => card.dataset[k] || def;

    qvTitle &&
      (qvTitle.textContent = get(
        "title",
        qs(".item__title", card)?.textContent?.trim() || "Jewelry"
      ));
    qvPrice &&
      (qvPrice.textContent = get(
        "price",
        qs(".item__price", card)?.textContent?.trim() || ""
      ));
    qvDesc && (qvDesc.textContent = get("desc"));
    qvMat && (qvMat.textContent = get("materials"));
    qvFin && (qvFin.textContent = get("finish"));
    qvSize && (qvSize.textContent = get("size"));
    qvStone && (qvStone.textContent = get("stone"));

    const gallery = get("gallery", get("img", "")).split("|").filter(Boolean);
    setHighlights(get("highlights", ""));
    setGallery(gallery.length ? gallery : [""]);

    if (gallery[0] && qvImg) {
      const probe = new Image();
      probe.onload = () => {
        qvImg.src = gallery[0];
        openQV();
      };
      probe.onerror = openQV;
      probe.src = gallery[0];
    } else {
      openQV();
    }
  });

  qs("#qvOrderBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeQV();
    qs("#order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const form = document.querySelector("#orderForm");
  if (form) {
    const state = document.querySelector("#formState");
    const submitBtn = form.querySelector('button[type="submit"]');

    const $f = (id) => form.querySelector("#" + id);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setHint(input, msg = "") {
      const fld = input.closest(".fld");
      if (!fld) return;
      const hint = fld.querySelector(".fld__hint");
      fld.classList.toggle("is-invalid", Boolean(msg));
      if (hint) hint.textContent = msg;
    }

    function validate() {
      let ok = true;

      const name = $f("name");
      if (!name.value.trim()) {
        setHint(name, "Please enter your full name.");
        ok = false;
      } else setHint(name);

      const email = $f("email");
      const em = email.value.trim();
      if (!em) {
        setHint(email, "Email is required.");
        ok = false;
      } else if (!emailRe.test(em)) {
        setHint(email, "Enter a valid email.");
        ok = false;
      } else setHint(email);

      const product = $f("product");
      if (!product.value) {
        setHint(product, "Please choose an item.");
        ok = false;
      } else setHint(product);

      const consent = form.querySelector("#consent");
      const consentRow = consent.closest(".consent");
      let consentMsg = consentRow.querySelector(".fld__hint-consent");
      if (!consentMsg) {
        consentMsg = document.createElement("span");
        consentMsg.className = "fld__hint fld__hint-consent";
        consentRow.appendChild(consentMsg);
      }
      if (!consent.checked) {
        consentMsg.textContent =
          "Please agree to the Terms and Privacy Policy.";
        ok = false;
      } else {
        consentMsg.textContent = "";
      }

      return ok;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) {
        if (state) state.textContent = "Please fix the highlighted fields.";
        return;
      }
      submitBtn.disabled = true;
      if (state) state.textContent = "Sending...";

      setTimeout(() => {
        if (state) state.textContent = "Thanks! We will contact you shortly.";
        form.reset();
        form
          .querySelectorAll(".is-invalid")
          .forEach((el) => el.classList.remove("is-invalid"));
        submitBtn.disabled = false;
      }, 700);
    });

    form.addEventListener("input", (e) => {
      if (e.target.matches("#name, #email, #product")) setHint(e.target);
      if (e.target.id === "consent") {
        const m = form.querySelector(".fld__hint-consent");
        if (m)
          m.textContent = e.target.checked
            ? ""
            : "Please agree to the Terms and Privacy Policy.";
      }
    });
  }
});
