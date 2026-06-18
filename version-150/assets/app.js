(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slider = document.querySelector('.hero-slider');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAuto() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-slide'), 10);
        showSlide(index);
        stopAuto();
        startAuto();
      });
    });

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }

  var filterInput = document.querySelector('.js-card-search');
  var filterRegion = document.querySelector('.js-card-region');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var region = normalize(filterRegion ? filterRegion.value : '');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okRegion = !region || cardRegion.indexOf(region) !== -1;

      card.classList.toggle('is-hidden', !(okQuery && okRegion));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      filterInput.value = initialQuery;
      applyFilters();
    }
  }

  if (filterRegion) {
    filterRegion.addEventListener('change', applyFilters);
  }

  function playStage(stage) {
    var video = stage.querySelector('video');
    var src = stage.getAttribute('data-video-src');

    if (!video || !src) {
      return;
    }

    if (!video.getAttribute('data-ready')) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        stage.hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }

      video.setAttribute('data-ready', 'true');
    }

    stage.classList.add('is-playing');
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-stage')).forEach(function (stage) {
    var button = stage.querySelector('.play-overlay');
    var video = stage.querySelector('video');

    stage.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video' && video && !video.paused) {
        return;
      }

      playStage(stage);
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playStage(stage);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        stage.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          stage.classList.remove('is-playing');
        }
      });
    }
  });
})();
