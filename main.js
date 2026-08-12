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
  `
  .about-card,
  .why-card,
  .mv-card,
  .contact__info,
  .contact__form,
  .solution,
  .capability
  `
);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {

  // Accessibility: show everything immediately
  revealTargets.forEach(el => {
    el.classList.add("visible");
  });

} else {

  // Add reveal class and create a small stagger
  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");

    const delay = Math.min(index * 70, 350);
    el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        // We only need to animate an element once
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15
    }
  );

  revealTargets.forEach(el => {
    observer.observe(el);
  });
}

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

    // ===================================================
  // Engineering Team — Bento Profile
  // ===================================================

  const teamMembers = {
    david: {
      name: "David F Mwakajonga",
      role: "Frontend Engineering & UI/UX",
      description:
        "Focused on crafting polished digital experiences and engineering intelligent systems that turn complex business problems into usable solutions.",
      skills: [
        "UI / UX",
        "Frontend Engineering",
        "Decision Support",
        "Expert Systems"
      ]
    },

    gwamaka: {
      name: "Gwamaka A Mwakabuta",
      role: "Backend Engineering & System Logic",
      description:
        "Focused on backend architecture, business logic, and reliable system foundations that connect applications, services, and real-world business processes.",
      skills: [
        "Backend Architecture",
        "Business Logic",
        "APIs",
        "GIS"
      ]
    },

    stephane: {
      name: "Stephane H Chibwaye",
      role: "Data & Database Engineering",
      description:
        "Focused on database architecture, data management, and API-driven systems that make information reliable, accessible, and useful across applications.",
      skills: [
        "Database Systems",
        "Data Management",
        "APIs",
        "Data Integration"
      ]
    }
  };


  const teamButtons = document.querySelectorAll(".team-member");

  const teamProfile = document.getElementById("team-profile");

  const teamProfileName =
    document.getElementById("team-profile-name");

  const teamProfileRole =
    document.getElementById("team-profile-role");

  const teamProfileDescription =
    document.getElementById("team-profile-description");

  const teamProfileSkills =
    document.getElementById("team-profile-skills");


  // Stop here if the Team Bento section is not on the page
  if (
    teamButtons.length > 0 &&
    teamProfile &&
    teamProfileName &&
    teamProfileRole &&
    teamProfileDescription &&
    teamProfileSkills
  ) {

    function updateTeamProfile(memberId) {

      const member = teamMembers[memberId];

      if (!member) return;


      // -----------------------------------------------
      // Update active Bento member
      // -----------------------------------------------

      teamButtons.forEach(button => {

        const isActive =
          button.dataset.member === memberId;

        button.classList.toggle(
          "team-member--active",
          isActive
        );

        button.setAttribute(
          "aria-pressed",
          String(isActive)
        );

      });


      // -----------------------------------------------
      // Update profile information
      // -----------------------------------------------

      teamProfileName.textContent =
        member.name;

      teamProfileRole.textContent =
        member.role;

      teamProfileDescription.textContent =
        member.description;


      // -----------------------------------------------
      // Update specialization tags
      // -----------------------------------------------

      teamProfileSkills.innerHTML = "";

      member.skills.forEach(skill => {

        const skillElement =
          document.createElement("span");

        skillElement.textContent = skill;

        teamProfileSkills.appendChild(
          skillElement
        );

      });


      // -----------------------------------------------
      // Small profile transition
      // -----------------------------------------------

      teamProfile.classList.remove(
        "team-profile--updated"
      );

      window.requestAnimationFrame(() => {

        teamProfile.classList.add(
          "team-profile--updated"
        );

      });

    }


    // =================================================
    // Mouse / Click Interaction
    // =================================================

    teamButtons.forEach(button => {

      button.addEventListener("click", () => {

        const memberId =
          button.dataset.member;

        updateTeamProfile(memberId);

      });

    });


    // =================================================
    // Keyboard Navigation
    // =================================================

    teamButtons.forEach((button, index) => {

      button.addEventListener("keydown", event => {

        let nextIndex = null;


        if (event.key === "ArrowRight") {

          nextIndex =
            (index + 1) % teamButtons.length;

        }


        if (event.key === "ArrowLeft") {

          nextIndex =
            (index - 1 + teamButtons.length) %
            teamButtons.length;

        }


        if (event.key === "Home") {

          nextIndex = 0;

        }


        if (event.key === "End") {

          nextIndex =
            teamButtons.length - 1;

        }


        if (nextIndex !== null) {

          event.preventDefault();

          const nextButton =
            teamButtons[nextIndex];

          nextButton.focus();

          updateTeamProfile(
            nextButton.dataset.member
          );

        }

      });

    });


    // =================================================
    // Initialize Active Member
    // =================================================

    const initialMember =
      document.querySelector(
        ".team-member--active"
      );

    if (initialMember) {

      updateTeamProfile(
        initialMember.dataset.member
      );

    } else {

      updateTeamProfile(
        teamButtons[0].dataset.member
      );

    }

  }

  // ---- Hero Interactive Aurora Mesh ----
  const heroSection = document.getElementById("home");
  const orbWrappers = document.querySelectorAll(".orb-wrapper");

  if (heroSection && orbWrappers.length > 0) {
    heroSection.addEventListener("mousemove", (e) => {
      // Calculate mouse position relative to center of the hero section
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      orbWrappers.forEach((wrapper, index) => {
        // Different depth multipliers for 3D parallax effect
        const depth = (index + 1) * 0.04; 
        
        // Update CSS variables for translation
        wrapper.style.setProperty("--mouse-x", `${x * depth}px`);
        wrapper.style.setProperty("--mouse-y", `${y * depth}px`);
      });
    });
    

    // Reset smoothly when mouse leaves
    heroSection.addEventListener("mouseleave", () => {
      orbWrappers.forEach(wrapper => {
        wrapper.style.setProperty("--mouse-x", "0px");
        wrapper.style.setProperty("--mouse-y", "0px");
      });
    });
  }
})();

// ---- Language Switcher Visual Toggle ----
  const langBtns = document.querySelectorAll(".lang-btn");
  
  if (langBtns.length > 0) {
    langBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        // Remove active class from all buttons
        langBtns.forEach(b => b.classList.remove("active"));
        
        // Add active class to the clicked button
        this.classList.add("active");
        
        // Update the global language variable if you are using one
        window.currentLang = this.getAttribute("data-lang");
        
        // (Optional) Call your translation function here
        // translatePage(window.currentLang);
      });
    });
  }

 // ===================================================
  // Typewriter Effect for Hero Title (Fixed for i18n & Colors)
  // ===================================================
  function initTypewriter() {
    const titleElement = document.querySelector('.hero__title');
    if (!titleElement) return;

    // 1. Chukua maneno yote kutoka kwenye heading (baada ya i18n.js kutafsiri)
    const fullText = titleElement.textContent.trim();
    
    let text1 = "";
    let text2 = "";

    // 2. Tunagawa sentensi ili maneno mawili ya mwisho yapate rangi (Cyan)
    const words = fullText.split(" ");
    if (words.length > 2) {
      // Chukua maneno mawili ya mwisho (mf. "Modern Businesses" au "Biashara za Kisasa")
      text2 = words.slice(-2).join(" "); 
      // Chukua maneno yaliyobaki ya mwanzo
      text1 = words.slice(0, -2).join(" ") + " "; 
    } else {
      text1 = fullText; // Kama sentensi ni fupi sana
    }

    // 3. Futa yaliyomo kwenye heading ili ianze tupu kwa ajili ya Typewriter
    titleElement.innerHTML = '';

    // 4. Tengeneza span kwa ajili ya maneno ya mwisho (Cyan Color)
    const coloredSpan = document.createElement('span');
    coloredSpan.className = 'text-blue-light'; // Hii inaweka ile rangi ya #00E5FF

    // 5. Tengeneza Cursor inayometa
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';

    // Weka cursor ndani ya heading
    titleElement.appendChild(cursor);

    let i = 0;
    let j = 0;
    const speed = 65; // Kasi ya kuandika (millisecond 65 kwa herufi)

    // Andika sehemu ya kwanza (Rangi Nyeupe)
    function typeFirstPart() {
      if (i < text1.length) {
        cursor.insertAdjacentText('beforebegin', text1.charAt(i));
        i++;
        setTimeout(typeFirstPart, speed);
      } else {
        // Ikimiza sehemu ya kwanza, weka span ya rangi kisha anza kuandika sehemu ya pili
        titleElement.insertBefore(coloredSpan, cursor);
        setTimeout(typeSecondPart, speed);
      }
    }

    // Andika sehemu ya pili (Rangi ya Cyan)
    function typeSecondPart() {
      if (j < text2.length) {
        coloredSpan.textContent += text2.charAt(j);
        j++;
        setTimeout(typeSecondPart, speed);
      }
    }

    // Anza kuandika
    typeFirstPart();
  }

  // Tunasubiri sekunde 0.8 ili kuruhusu i18n.js imalize kutafsiri kwanza
  setTimeout(initTypewriter, 800);