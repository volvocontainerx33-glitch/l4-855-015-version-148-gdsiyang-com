(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav-links]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

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

    function runCarousel() {
        if (slides.length <= 1) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            runCarousel();
        });
    });

    showSlide(0);
    runCarousel();

    const input = document.querySelector('[data-filter-input]');
    const select = document.querySelector('[data-filter-select]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        const keyword = normalize(input ? input.value : '');
        const type = normalize(select ? select.value : '');
        cards.forEach(function (card) {
            const haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags')
            ].join(' '));
            const cardType = normalize(card.getAttribute('data-type'));
            card.classList.toggle('hidden-card', !((!keyword || haystack.indexOf(keyword) !== -1) && (!type || cardType.indexOf(type) !== -1)));
        });
    }

    if (input) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');
        if (initial) {
            input.value = initial;
        }
        input.addEventListener('input', applyFilter);
    }

    if (select) {
        select.addEventListener('change', applyFilter);
    }

    applyFilter();
})();
