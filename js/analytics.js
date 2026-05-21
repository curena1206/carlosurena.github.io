/**
 * carlosurena.com — Analytics
 * GA4 + Microsoft Clarity | No PII | No email gate
 * v1.0 — 2026-05
 */
(function () {
  "use strict";

  // ── CONFIG ────────────────────────────────────────────────────────────────
  var GA4_ID     = "G-WF7JCXD2HL";
  var CLARITY_ID = "wu674xzdbf";

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function scoreBand(score) {
    var s = parseInt(score, 10);
    if (isNaN(s) || s < 0)  return "unknown";
    if (s <= 25)             return "structural_failure";
    if (s <= 50)             return "fragile_franchise";
    if (s <= 70)             return "operationally_stable";
    if (s <= 85)             return "strategically_aligned";
    return "best_in_class";
  }

  function slugify(str) {
    return (str || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }

  // ── GA4 INIT ──────────────────────────────────────────────────────────────
  function initGA4() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    gtag("js", new Date());
    gtag("config", GA4_ID, { send_page_view: false, anonymize_ip: true });

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
  }

  // ── CLARITY INIT ──────────────────────────────────────────────────────────
  function initClarity() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);

    // Mask all input text — zero PII
    window.clarity("set", "mask", "all");
  }

  // ── CORE TRACK ────────────────────────────────────────────────────────────
  function track(eventName, params) {
    params = params || {};

    if (typeof window.gtag === "function") {
      gtag("event", eventName, params);
    }
    if (typeof window.clarity === "function") {
      window.clarity("set", "last_event", eventName);
      if (params.pfi_score_band)     window.clarity("set", "pfi_score_band",     params.pfi_score_band);
      if (params.structural_pattern) window.clarity("set", "structural_pattern", params.structural_pattern);
    }
  }

  // ── PAGE VIEW ─────────────────────────────────────────────────────────────
  function autoPageView() {
    var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();

    var eventName;
    if (path === "" || path === "/index" || path === "/index.html") {
      eventName = "home_viewed";
    } else if (path.indexOf("payments-portfolio-diagnostic") !== -1) {
      eventName = "pfi_page_viewed";
    } else if (path === "/pfi" || path === "/pfi.html") {
      eventName = "pfi_page_viewed";
    } else if (path === "/consulting" || path === "/consulting.html") {
      eventName = "consulting_page_viewed";
    } else {
      eventName = "page_viewed";
    }

    track(eventName, { page_path: path });

    // Also fire native GA4 page_view for built-in reports
    if (typeof window.gtag === "function") {
      gtag("event", "page_view", {
        page_title:    document.title,
        page_location: window.location.href
      });
    }
  }

  // ── CONTACT CLICK ─────────────────────────────────────────────────────────
  var contactKeywords = ["contact", "get in touch", "reach out", "book a call",
                         "book call", "schedule", "let's talk", "lets talk", "email me"];

  function wireContactClicks() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("a, button");
      if (!el) return;

      var href = (el.getAttribute("href") || "").toLowerCase();
      var text = (el.innerText || el.textContent || "").trim().toLowerCase();

      var isContact = href.indexOf("mailto:") === 0
        || href.indexOf("/contact") !== -1
        || href.indexOf("#contact") !== -1
        || contactKeywords.some(function (kw) { return text.indexOf(kw) !== -1; });

      if (isContact) {
        track("contact_clicked", {
          link_text: text.substring(0, 80),
          link_type: href.indexOf("mailto:") === 0 ? "email" : "page"
        });
      }
    });
  }

  // ── PUBLIC API (used by app.js PPD hooks) ─────────────────────────────────
  window.CUA = {
    scoreBand:  scoreBand,
    slugify:    slugify,

    trackEvent: function (eventName, params) {
      track(eventName, params || {});
    },

    pfiStarted: function () {
      track("pfi_started");
    },

    pfiCompleted: function (score, label, extraParams) {
      var band    = scoreBand(score);
      var pattern = slugify(label);
      var params  = Object.assign({
        pfi_score:          parseInt(score, 10) || 0,
        pfi_score_band:     band,
        structural_pattern: pattern
      }, extraParams || {});
      track("pfi_completed", params);
      if (typeof window.clarity === "function") {
        window.clarity("set", "pfi_completed", "true");
        if (params.structural_stability_label) window.clarity("set", "structural_stability", params.structural_stability_label);
        if (params.dependency_patterns)        window.clarity("set", "dependency_patterns",   params.dependency_patterns);
      }
    },

    pdfGenerated: function (score, label) {
      track("pfi_pdf_download_clicked", {
        pfi_score:          parseInt(score, 10) || 0,
        pfi_score_band:     scoreBand(score),
        structural_pattern: slugify(label)
      });
    },

    pfiExamplePDFClicked: function (scenarioLabel) {
      track("pfi_example_pdf_clicked", { scenario_label: scenarioLabel || "" });
    }
  };

  // ── BOOT ──────────────────────────────────────────────────────────────────
  function boot() {
    initGA4();
    initClarity();
    autoPageView();
    wireContactClicks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
