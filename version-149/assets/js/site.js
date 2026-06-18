(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = one('.menu-toggle');
    var nav = one('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initBackTop() {
    var button = one('.back-top');
    if (!button) {
      return;
    }
    function sync() {
      if (window.pageYOffset > 360) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    }
    window.addEventListener('scroll', sync, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    sync();
  }

  function yearMatches(value, filter) {
    var year = parseInt(value, 10);
    if (!filter) {
      return true;
    }
    if (filter === 'classic') {
      return year && year < 2000;
    }
    if (filter === '2010') {
      return year >= 2010 && year <= 2019;
    }
    if (filter === '2000') {
      return year >= 2000 && year <= 2009;
    }
    return String(value).indexOf(filter) !== -1;
  }

  function initFilters() {
    all('[data-filter-panel]').forEach(function (panel) {
      var grid = panel.parentNode.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = all('[data-card="movie"]', grid);
      var search = one('[data-filter-field="search"]', panel);
      var year = one('[data-filter-field="year"]', panel);
      var region = one('[data-filter-field="region"]', panel);
      var genre = one('[data-filter-field="genre"]', panel);
      var empty = panel.parentNode.querySelector('[data-no-results]');

      function apply() {
        var q = normalize(search && search.value);
        var y = year ? year.value : '';
        var r = normalize(region && region.value);
        var g = normalize(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (ok && y && !yearMatches(cardYear, y)) {
            ok = false;
          }
          if (ok && r && cardRegion.indexOf(r) === -1) {
            ok = false;
          }
          if (ok && g && cardGenre.indexOf(g) === -1) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, year, region, genre].forEach(function (field) {
        if (!field) {
          return;
        }
        field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', apply);
      });
      apply();
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initMoviePlayer(sourceUrl) {
    var wrap = one('.watch-player');
    if (!wrap || !sourceUrl) {
      return;
    }
    var video = one('video', wrap);
    var cover = one('.player-cover', wrap);
    var hlsInstance = null;
    var ready = false;

    function attach() {
      if (ready || !video) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attach();
      wrap.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initBackTop();
    initFilters();
    initHero();
  });

  window.initMoviePlayer = initMoviePlayer;
})();
