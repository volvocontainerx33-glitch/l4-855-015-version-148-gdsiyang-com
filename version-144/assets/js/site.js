(function () {
    var header = document.querySelector("[data-site-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    var forms = document.querySelectorAll("[data-search-form]");
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var searchInput = document.querySelector("[data-search-input]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeFilter = "all";
    var activeSlide = 0;
    var slideTimer;

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    function openSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === activeSlide);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(slideTimer);
        slideTimer = setInterval(function () {
            openSlide(activeSlide + 1);
        }, 5200);
    }

    function applySearch() {
        if (!searchCards.length) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var visible = 0;
        searchCards.forEach(function (card) {
            var text = (card.getAttribute("data-search-text") || "").toLowerCase();
            var filters = (card.getAttribute("data-filter-text") || "").toLowerCase();
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var filterMatch = activeFilter === "all" || filters.indexOf(activeFilter.toLowerCase()) !== -1;
            var show = keywordMatch && filterMatch;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("[data-search-query]");
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                return;
            }
            event.preventDefault();
            window.location.href = "search.html?q=" + encodeURIComponent(value);
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            openSlide(index);
            startSlides();
        });
    });
    openSlide(0);
    startSlides();

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener("input", applySearch);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "all";
            filterButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applySearch();
        });
    });

    applySearch();
})();
