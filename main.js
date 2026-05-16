/* ===================================================
   MLUE TECHNOLOGY — Main JavaScript
   =================================================== */

(function () {
  "use strict";

  // ---- Footer year ----
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Header scroll effect ----
  const header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile hamburger ----
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      nav.classList.toggle("open");
    });

    // Close mobile nav on link click
    nav.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          }
        });
      }
    });
  }
  window.addEventListener("scroll", highlightNav, { passive: true });

  // ---- Scroll reveal ----
  const revealTargets = document.querySelectorAll(
    ".about-card, .service-card, .why-card, .mv-card, .contact__info, .contact__form"
  );
  revealTargets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach(el => observer.observe(el));

  // ---- Toast notification ----
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toastIcon");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");
  const toastClose = document.getElementById("toastClose");
  let toastTimer;

  function showToast(type, title, message) {
    if (!toast || !toastIcon || !toastTitle || !toastMsg) return;
    clearTimeout(toastTimer);
    toast.className = "toast toast--" + type + " toast--visible";
    toastIcon.innerHTML = type === "success"
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    toastTitle.textContent = title;
    toastMsg.textContent = message;
    toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 6000);
  }

  if (toastClose) {
    toastClose.addEventListener("click", () => {
      clearTimeout(toastTimer);
      toast.classList.remove("toast--visible");
    });
  }

  function getCurrentLang() {
    return typeof window.currentLang !== "undefined" ? window.currentLang : "en";
  }

  function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
  }

  function syncFutureDatetimeInputs(root) {
    if (!root) return;
    const minValue = formatLocalDateTime(new Date());
    root.querySelectorAll("[data-datetime-min]").forEach(input => {
      input.min = minValue;
    });
  }

  function isFutureDateTimeValid(input) {
    if (!input || !input.value) return false;
    const selectedTime = new Date(input.value);
    if (Number.isNaN(selectedTime.getTime())) return false;
    return selectedTime.getTime() >= Date.now();
  }

  function submitLeadForm(form, options) {
    const submitButton = form.querySelector("button[type=submit]");
    if (!submitButton) return;

    const originalText = submitButton.textContent;
    const lang = getCurrentLang();
    const loadingText = options.loadingText ? options.loadingText[lang] || options.loadingText.en : (lang === "sw" ? "Inatuma..." : "Sending...");
    const successTitle = options.successTitle ? options.successTitle[lang] || options.successTitle.en : (lang === "sw" ? "Imetumwa!" : "Request Sent!");
    const successMessage = options.successMessage ? options.successMessage[lang] || options.successMessage.en : (lang === "sw" ? "Ombi lako limetumwa kwa timu yetu." : "Your request was sent to our team.");
    const errorTitle = options.errorTitle ? options.errorTitle[lang] || options.errorTitle.en : (lang === "sw" ? "Imeshindikana" : "Failed to Send");
    const errorMessage = options.errorMessage ? options.errorMessage[lang] || options.errorMessage.en : (lang === "sw" ? "Tafadhali jaribu tena baadae." : "Please try again in a moment.");

    submitButton.disabled = true;
    submitButton.textContent = loadingText;

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Server error");
      }

      showToast("success", successTitle, successMessage);
      form.reset();

      if (typeof options.onSuccess === "function") {
        options.onSuccess();
      }
    })
    .catch(() => {
      showToast("error", errorTitle, errorMessage);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    });
  }

  function openModal(modal, trigger) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    syncFutureDatetimeInputs(modal);

    const autofocusTarget =
      modal.querySelector("[data-modal-autofocus]") ||
      modal.querySelector("input:not([type=hidden]), textarea") ||
      modal.querySelector("button[data-modal-close]");
    if (autofocusTarget) {
      window.requestAnimationFrame(() => autofocusTarget.focus({ preventScroll: true }));
    }

    modal._returnFocusTo = trigger || document.activeElement;
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (modal._returnFocusTo && typeof modal._returnFocusTo.focus === "function") {
      modal._returnFocusTo.focus({ preventScroll: true });
    }
    modal._returnFocusTo = null;
  }

  function wireAppointmentModal() {
    const modal = document.getElementById("appointmentModal");
    const form = document.getElementById("appointmentForm");

    if (!modal) return;

    document.querySelectorAll("[data-open-appointment-modal]").forEach(trigger => {
      trigger.addEventListener("click", () => openModal(modal, trigger));
    });

    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.hasAttribute("data-modal-close")) {
        closeModal(modal);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal(modal);
      }
    });

    if (form) {
      form.addEventListener("submit", event => {
        event.preventDefault();

        const dateTimeInput = form.querySelector("#appointmentDateTime");
        if (!isFutureDateTimeValid(dateTimeInput)) {
          showToast(
            "error",
            getCurrentLang() === "sw" ? "Chagua muda ujao" : "Choose a future time",
            getCurrentLang() === "sw"
              ? "Tafadhali weka tarehe na saa ambayo haijapita."
              : "Please select a date and time that has not already passed."
          );
          if (dateTimeInput) {
            dateTimeInput.focus({ preventScroll: true });
          }
          return;
        }

        submitLeadForm(form, {
          loadingText: {
            en: "Booking...",
            sw: "Inatuma..."
          },
          successTitle: {
            en: "Appointment Requested!",
            sw: "Ombi Limetumwa!"
          },
          successMessage: {
            en: "Your appointment request has been sent to our team.",
            sw: "Ombi lako la miadi limetumwa kwa timu yetu."
          },
          errorTitle: {
            en: "Failed to Send",
            sw: "Imeshindikana"
          },
          errorMessage: {
            en: "We could not send your appointment request. Please try again.",
            sw: "Hatukuweza kutuma ombi lako la miadi. Tafadhali jaribu tena."
          },
          onSuccess: () => closeModal(modal)
        });
      });
    }
  }

  wireAppointmentModal();

  // ---- Contact form — Email (Formsubmit.co) + WhatsApp ----
  const WHATSAPP_NUMBER = "255752804154";

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const message = form.querySelector("#message").value.trim();

      if (!name || !email || !message) return;

      submitLeadForm(form, {
        loadingText: {
          en: "Sending...",
          sw: "Inatuma..."
        },
        successTitle: {
          en: "Message Sent!",
          sw: "Imetumwa!"
        },
        successMessage: {
          en: "Your message was sent via email. Thank you for reaching out to us!.",
          sw: "Ujumbe wako umetumwa kwa barua pepe. Asante kwa kuwasiliana nasi!."
        },
        errorTitle: {
          en: "Failed to Send",
          sw: "Imeshindikana"
        },
        errorMessage: {
          en: "Email could not be sent. Please try again or contact us directly.",
          sw: "Barua pepe haijatumwa. Tafadhali jaribu tena au wasiliana nasi moja kwa moja."
        }
      });
    });
  }

  // ---- Hero Canvas — Network / node animation ----
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let w, h, nodes;
    let heroConfig = getHeroCanvasConfig();

    function getHeroCanvasConfig() {
      return mobileQuery.matches
        ? { nodeCount: 22, maxDist: 96, velocity: 0.35, radiusMin: 0.9, radiusMax: 1.7 }
        : { nodeCount: 60, maxDist: 140, velocity: 0.5, radiusMin: 1, radiusMax: 3 };
    }

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      heroConfig = getHeroCanvasConfig();
      nodes = [];
      for (let i = 0; i < heroConfig.nodeCount; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * heroConfig.velocity,
          vy: (Math.random() - 0.5) * heroConfig.velocity,
          r: Math.random() * (heroConfig.radiusMax - heroConfig.radiusMin) + heroConfig.radiusMin
        });
      }
    }

    function draw() {
      const { maxDist } = heroConfig;
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(21,101,192,${alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(21,101,192,0.35)";
        ctx.fill();
      });

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();
    window.addEventListener("resize", () => {
      resize();
      createNodes();
    }, { passive: true });

    const refreshForBreakpoint = () => {
      createNodes();
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", refreshForBreakpoint);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(refreshForBreakpoint);
    }
  }
})();
