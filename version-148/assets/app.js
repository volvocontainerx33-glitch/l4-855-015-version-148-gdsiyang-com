(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    var search = document.querySelector('.nav-search');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            if (search) {
                search.classList.toggle('is-open');
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    function applyFilter(input, scope) {
        var q = (input.value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-filter') || card.textContent || '').toLowerCase();
            var hit = !q || text.indexOf(q) !== -1;
            card.style.display = hit ? '' : 'none';
            if (hit) {
                visible += 1;
            }
        });

        var empty = scope.querySelector('[data-no-result]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
        var scope = document.querySelector(input.getAttribute('data-filter-target')) || document;
        input.addEventListener('input', function () {
            applyFilter(input, scope);
        });
        applyFilter(input, scope);
    });

    var searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            searchInput.value = query;
        }
        var searchScope = document.querySelector('[data-search-scope]') || document;
        searchInput.addEventListener('input', function () {
            applyFilter(searchInput, searchScope);
        });
        applyFilter(searchInput, searchScope);
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 360);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
