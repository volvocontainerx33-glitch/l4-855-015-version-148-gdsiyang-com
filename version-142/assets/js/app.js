(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (toggle && mobilePanel) {
      toggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeSlide);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === activeSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var noResults = document.querySelector(".no-results");

    function applyFilter() {
      if (!filterInput || !filterCards.length) {
        return;
      }
      var query = filterInput.value.trim().toLowerCase();
      var shown = 0;
      filterCards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var ok = !query || haystack.indexOf(query) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", shown === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    var globalInputs = Array.prototype.slice.call(document.querySelectorAll(".global-search"));
    var index = window.SEARCH_INDEX || [];

    function renderResults(input) {
      var panel = input.parentElement.querySelector(".search-results");
      if (!panel) {
        return;
      }
      var query = input.value.trim().toLowerCase();
      if (!query) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      var matches = index.filter(function (item) {
        return item.text.indexOf(query) !== -1;
      }).slice(0, 9);
      panel.innerHTML = matches.map(function (item) {
        return "<a href=\"" + escapeHtml(item.url) + "\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\"><span><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.meta) + "</span></span></a>";
      }).join("");
      panel.classList.toggle("is-open", matches.length > 0);
    }

    globalInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        renderResults(input);
      });
      input.addEventListener("focus", function () {
        renderResults(input);
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav-search") && !event.target.closest(".mobile-search")) {
        document.querySelectorAll(".search-results").forEach(function (panel) {
          panel.classList.remove("is-open");
        });
      }
    });
  });
})();
