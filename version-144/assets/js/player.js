function initMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var started = false;
    var hlsInstance = null;

    if (!video || !cover || !source) {
        return;
    }

    function prepare() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
        } else if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                if (video.paused) {
                    video.play().catch(function () {});
                }
            });
        } else {
            video.src = source;
            video.load();
        }
    }

    function play() {
        cover.classList.add("is-hidden");
        video.controls = true;
        prepare();
        var result = video.play();
        if (result && result.catch) {
            result.catch(function () {
                setTimeout(function () {
                    video.play().catch(function () {
                        if (video.paused) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }, 420);
            });
        }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        if (hlsInstance && hlsInstance.stopLoad) {
            hlsInstance.stopLoad();
        }
    });
}
