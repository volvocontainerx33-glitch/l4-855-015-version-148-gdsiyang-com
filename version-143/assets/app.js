(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        const header = document.querySelector("[data-site-header]");
        const toggle = document.querySelector("[data-menu-toggle]");
        const mobile = document.querySelector("[data-mobile-nav]");
        if (header) {
            const sync = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 18);
            };
            sync();
            window.addEventListener("scroll", sync, { passive: true });
        }
        if (toggle && mobile && header) {
            toggle.addEventListener("click", function () {
                const open = mobile.classList.toggle("is-open");
                header.classList.toggle("is-open", open);
            });
        }
    }

    function setupHero() {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const prev = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            const section = scope.closest("section") || document;
            const cards = Array.from(section.querySelectorAll("[data-filter-card]"));
            const search = scope.querySelector("[data-search-input]");
            const year = scope.querySelector("[data-year-filter]");
            const region = scope.querySelector("[data-region-filter]");
            const reset = scope.querySelector("[data-filter-reset]");
            const empty = section.querySelector("[data-no-results]");

            function apply() {
                const query = search ? search.value.trim().toLowerCase() : "";
                const selectedYear = year ? year.value : "";
                const selectedRegion = region ? region.value : "";
                let visible = 0;
                cards.forEach(function (card) {
                    const text = (card.getAttribute("data-keywords") || "").toLowerCase();
                    const cardYear = card.getAttribute("data-year") || "";
                    const cardRegion = card.getAttribute("data-region") || "";
                    const matched = (!query || text.indexOf(query) !== -1) &&
                        (!selectedYear || cardYear === selectedYear) &&
                        (!selectedRegion || cardRegion === selectedRegion);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    window.setupMoviePlayer = function (sourceUrl) {
        const frame = document.querySelector("[data-player-frame]");
        const video = document.querySelector("[data-player-video]");
        const button = document.querySelector("[data-play-button]");
        if (!frame || !video || !button || !sourceUrl) {
            return;
        }
        let loaded = false;
        let hls = null;

        function load() {
            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
                loaded = true;
            }
        }

        function play() {
            load();
            button.classList.add("is-hidden");
            const attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        frame.addEventListener("click", function (event) {
            if (event.target === frame || event.target === video) {
                if (video.paused) {
                    play();
                }
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
    });
})();
