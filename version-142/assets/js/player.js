(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll(".player-frame").forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector(".player-overlay");
      var stream = frame.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;

      function loadStream() {
        if (loaded || !video || !stream) {
          return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({
            maxBufferLength: 28,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startPlay() {
        loadStream();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlay);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlay();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("emptied", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          loaded = false;
        });
      }
    });
  });
})();
