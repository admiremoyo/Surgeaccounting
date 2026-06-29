/* ==========================================================================
   Surge Accounting — interactions (dependency-free)
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "263779695563"; // primary line, international format, no +

  /* ---- Mobile nav ---- */
  var body = document.body;
  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.querySelector(".nav-overlay");

  function closeNav() { body.classList.remove("nav-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  function openNav() { body.classList.add("nav-open"); if (toggle) toggle.setAttribute("aria-expanded", "true"); }

  if (toggle) {
    toggle.addEventListener("click", function () {
      body.classList.contains("nav-open") ? closeNav() : openNav();
    });
  }
  if (overlay) overlay.addEventListener("click", closeNav);
  document.querySelectorAll(".nav-menu a, .nav-collapse .btn").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal + counters (manual viewport check; resilient) ----
     We avoid relying solely on IntersectionObserver callbacks so content
     is never left hidden. Elements reveal as they enter the viewport. */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  var ticking = false;

  function animateCounter(el) {
    if (el._done) return; el._done = true;
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "", dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh - (margin || 0) && r.bottom > 0;
  }

  function checkReveals() {
    ticking = false;
    reveals = reveals.filter(function (el) {
      if (inView(el, 60)) { el.classList.add("in"); return false; }
      return true;
    });
    counters = counters.filter(function (el) {
      if (inView(el, 0)) { animateCounter(el); return false; }
      return true;
    });
  }

  function onRevealScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(checkReveals); }
  }

  // Reveal anything already in view immediately, then watch for scroll.
  checkReveals();
  window.addEventListener("scroll", onRevealScroll, { passive: true });
  window.addEventListener("resize", onRevealScroll, { passive: true });
  window.addEventListener("load", checkReveals);
  // Final safety net: never leave content hidden.
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      if (inView(el, -200)) el.classList.add("in");
    });
  }, 1200);

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".accordion-item").forEach(function (item) {
    var trigger = item.querySelector(".accordion-trigger");
    var panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".accordion-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".accordion-panel").style.maxHeight = null;
          other.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        panel.style.maxHeight = null;
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Contact form -> WhatsApp (zero-backend, always works) ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var phone = (fd.get("phone") || "").toString().trim();
      var service = (fd.get("service") || "").toString().trim();
      var message = (fd.get("message") || "").toString().trim();

      var lines = [
        "*New enquiry — Surge Accounting website*",
        "",
        "Name: " + (name || "—"),
        "Email: " + (email || "—"),
        "Phone: " + (phone || "—"),
        "Service: " + (service || "—"),
        "",
        "Message:",
        message || "—"
      ];
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      showToast("Opening WhatsApp to send your enquiry…");
      form.reset();
    });
  }

  /* ---- Toast ---- */
  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.querySelector(".toast-msg").textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 3800);
  }

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
