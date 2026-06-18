(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "×" : "☰";
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var index = 0;
            var show = function (next) {
                slides[index].classList.remove("active");
                if (dots[index]) {
                    dots[index].classList.remove("active");
                }
                index = (next + slides.length) % slides.length;
                slides[index].classList.add("active");
                if (dots[index]) {
                    dots[index].classList.add("active");
                }
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector(".search-input");
            var type = scope.querySelector(".type-select");
            var year = scope.querySelector(".year-select");
            var sort = scope.querySelector(".sort-select");
            var grid = scope.querySelector("[data-card-grid]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
            var empty = scope.querySelector(".empty-state");

            var apply = function () {
                var q = input ? input.value.trim().toLowerCase() : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && card.dataset.type !== t) {
                        ok = false;
                    }
                    if (y && card.dataset.year !== y) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            };

            var sortCards = function () {
                if (!sort || !grid) {
                    return;
                }
                var value = sort.value;
                var sorted = cards.slice();
                sorted.sort(function (a, b) {
                    if (value === "year-desc") {
                        return (parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10));
                    }
                    if (value === "year-asc") {
                        return (parseInt(a.dataset.year || "0", 10) - parseInt(b.dataset.year || "0", 10));
                    }
                    if (value === "title-asc") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }
                    return 0;
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = sorted;
                apply();
            };

            [input, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            if (sort) {
                sort.addEventListener("change", sortCards);
            }
        });
    });

    window.setupHlsPlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".play-overlay");
        if (!video || !streamUrl) {
            return;
        }

        var hls;
        var bound = false;

        var bind = function () {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        };

        var play = function () {
            bind();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
