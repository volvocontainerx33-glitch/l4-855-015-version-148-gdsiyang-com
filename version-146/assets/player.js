const MovieStream = {
    init: function (source) {
        const video = document.getElementById('movieVideo');
        const button = document.getElementById('playButton');
        const shell = document.getElementById('playerShell');
        let loaded = false;
        let hls = null;

        if (!video || !button || !source) {
            return;
        }

        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            bindSource();
            button.classList.add('is-hidden');
            if (shell) {
                shell.classList.add('is-started');
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }
};
