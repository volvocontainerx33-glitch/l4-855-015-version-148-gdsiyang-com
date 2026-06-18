function initPlayer(mediaUrl) {
    var video = document.querySelector('[data-player-video]');
    var trigger = document.querySelector('[data-player-trigger]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !mediaUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(mediaUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }
    }

    function begin() {
        attach();
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
        var request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            begin();
        }
    });

    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (trigger) {
            trigger.classList.remove('is-hidden');
        }
    });
}
