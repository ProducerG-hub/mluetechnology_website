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

  // ---- Contact form — Email (Formsubmit.co) + WhatsApp ----
  const WHATSAPP_NUMBER = "255752804154";

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const origText = btn.textContent;
      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const message = form.querySelector("#message").value.trim();

      if (!name || !email || !message) return;

      // Disable button while sending
      btn.disabled = true;
      btn.textContent = currentLang === "sw" ? "Inatuma..." : "Sending...";

      // Send email via Formsubmit.co AJAX
      const formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      })
      .then(res => {
        if (res.ok) {
          // Build WhatsApp message
          const waMsg = encodeURIComponent(
            "*New Inquiry — MLUE Technology*\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n\n" +
            "Message:\n" + message
          );
          //const waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + waMsg;

          // Show success toast
          showToast(
            "success",
            currentLang === "sw" ? "Imetumwa!" : "Message Sent!",
            currentLang === "sw"
              ? "Ujumbe wako umetumwa kwa barua pepe. Pia unatumwa WhatsApp..."
              : "Your message was sent to our email. Also sending via WhatsApp..."
          );

          form.reset();

          // Open WhatsApp after a short delay
          setTimeout(() => {
            //window.open(waUrl, "_blank");
          }, 1500);
        } else {
          throw new Error("Server error");
        }
      })
      .catch(() => {
        showToast(
          "error",
          currentLang === "sw" ? "Imeshindikana" : "Failed to Send",
          currentLang === "sw"
            ? "Barua pepe haijatumwa. Tafadhali jaribu tena au wasiliana nasi moja kwa moja."
            : "Email could not be sent. Please try again or contact us directly."
        );
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = origText;
      });
    });
  }

  // ---- Hero Canvas — Network / node animation ----
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, nodes;
    const NODE_COUNT = 60;
    const MAX_DIST = 140;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2 + 1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = 1 - dist / MAX_DIST;
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
    });
  }
})();
