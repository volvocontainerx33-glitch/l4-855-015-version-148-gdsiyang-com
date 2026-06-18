(() => {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(() => {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", () => {
        const open = mobilePanel.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(open));
      });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let heroIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) return;
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === heroIndex));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === heroIndex));
    };

    const restart = () => {
      if (timer) window.clearInterval(timer);
      if (slides.length > 1) {
        timer = window.setInterval(() => showSlide(heroIndex + 1), 5200);
      }
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        showSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        showSlide(heroIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        showSlide(heroIndex + 1);
        restart();
      });
    }

    restart();

    document.querySelectorAll(".filter-panel").forEach((panel) => {
      const root = panel.parentElement || document;
      const input = panel.querySelector(".filter-input");
      const year = panel.querySelector(".filter-year");
      const region = panel.querySelector(".filter-region");
      const items = Array.from(root.querySelectorAll(".filter-card"));

      const apply = () => {
        const q = (input?.value || "").trim().toLowerCase();
        const selectedYear = year?.value || "全部年份";
        const selectedRegion = region?.value || "全部地区";

        items.forEach((item) => {
          const haystack = [
            item.dataset.title,
            item.dataset.year,
            item.dataset.region,
            item.dataset.genre,
            item.dataset.tags
          ].join(" ").toLowerCase();
          const itemYear = item.dataset.year || "";
          const itemRegion = item.dataset.region || "";
          const yearOk = selectedYear === "全部年份" || (selectedYear === "更早" ? Number(itemYear) < 2018 : itemYear === selectedYear);
          const regionOk = selectedRegion === "全部地区" || itemRegion.includes(selectedRegion) || (selectedRegion === "其他" && !["中国大陆", "中国台湾", "中国香港", "美国", "日本", "韩国", "英国", "法国"].some((r) => itemRegion.includes(r)));
          const qOk = !q || haystack.includes(q);
          item.classList.toggle("is-filtered-out", !(qOk && yearOk && regionOk));
        });
      };

      input?.addEventListener("input", apply);
      year?.addEventListener("change", apply);
      region?.addEventListener("change", apply);
    });

    const playButton = document.querySelector(".play-overlay");
    const video = document.querySelector("#videoPlayer");
    if (playButton && video) {
      const startVideo = () => {
        const stream = playButton.getAttribute("data-stream");
        if (!stream) return;

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else {
          video.src = stream;
          video.play().catch(() => {});
        }

        playButton.classList.add("is-hidden");
      };

      playButton.addEventListener("click", startVideo);
      video.addEventListener("click", () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    const catalogForm = document.querySelector(".catalog-search");
    const results = document.querySelector("#searchResults");
    if (catalogForm && results && Array.isArray(window.MOVIE_CATALOG)) {
      const qInput = document.querySelector("#catalogQuery");
      const cInput = document.querySelector("#catalogCategory");
      const yInput = document.querySelector("#catalogYear");
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("q") || "";
      if (qInput && initial) qInput.value = initial;

      const render = () => {
        const q = (qInput?.value || "").trim().toLowerCase();
        const category = cInput?.value || "";
        const year = yInput?.value || "";
        const filtered = window.MOVIE_CATALOG.filter((movie) => {
          const haystack = [movie.title, movie.year, movie.region, movie.genre, movie.tags, movie.line].join(" ").toLowerCase();
          const qOk = !q || haystack.includes(q);
          const cOk = !category || movie.category === category;
          const yOk = !year || movie.year === year;
          return qOk && cOk && yOk;
        }).slice(0, 120);

        results.innerHTML = filtered.map((movie) => `
          <article class="movie-card">
            <a class="poster-link" href="./${movie.url}" aria-label="${escapeHtml(movie.title)}">
              <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
              <span class="poster-shade"></span>
              <span class="poster-play">播放</span>
            </a>
            <div class="card-body">
              <div class="card-meta">
                <span>${escapeHtml(movie.year)}</span>
                <span>${escapeHtml(movie.region)}</span>
              </div>
              <h3><a href="./${movie.url}">${escapeHtml(movie.title)}</a></h3>
              <p>${escapeHtml(movie.line)}</p>
              <div class="tag-row"><span>${escapeHtml(movie.genre)}</span></div>
            </div>
          </article>
        `).join("");
      };

      catalogForm.addEventListener("submit", (event) => {
        event.preventDefault();
        render();
      });
      qInput?.addEventListener("input", render);
      cInput?.addEventListener("change", render);
      yInput?.addEventListener("change", render);
      render();
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
