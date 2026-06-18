(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  });

  var filterScopes = document.querySelectorAll('[data-filter-scope]');

  filterScopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var tagButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-tag-filter]'));
    var activeTag = '';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var matchesKeyword = keyword === '' || searchText.indexOf(keyword) !== -1;
        var matchesTag = activeTag === '' || searchText.indexOf(activeTag) !== -1;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesTag));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        input.value = query;
      }

      input.addEventListener('input', applyFilter);
    }

    tagButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeTag = button.getAttribute('data-tag-filter') || '';
        tagButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  var scrollButton = document.querySelector('[data-scroll-player]');

  if (scrollButton) {
    scrollButton.addEventListener('click', function (event) {
      var video = document.querySelector('[data-player]');
      if (video) {
        event.preventDefault();
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();

function initMoviePlayer(videoUrl) {
  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play]');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !videoUrl) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      video.src = videoUrl;
    }

    loaded = true;
  }

  function startVideo() {
    loadVideo();

    if (playButton) {
      playButton.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('hidden');
    }
  });

  video.addEventListener('error', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
      loaded = false;
    }
  });
}
