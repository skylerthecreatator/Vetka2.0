 let currentSlideIndex = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    // Полностью очищаем все 3D-классы у всех карточек
    slides.forEach(slide => {
        slide.classList.remove('active-slide', 'prev-slide', 'next-slide');
    });

    // Считаем индекс новой центральной карточки
    currentSlideIndex += direction;
    if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;

    // Вычисляем индексы для левой (prev) и правой (next) карточек
    let prevIndex = currentSlideIndex - 1;
    if (prevIndex < 0) prevIndex = slides.length - 1;

    let nextIndex = currentSlideIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;

    // Раздаем карточкам их новые 3D-роли
    slides[currentSlideIndex].classList.add('active-slide');
    slides[prevIndex].classList.add('prev-slide');
    slides[nextIndex].classList.add('next-slide');
}
 
// Финальная и железобетонная логика переключения окна
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('modal-active');
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('modal-active');
    }
}

function closeBonusBadge() {
    const badge = document.getElementById('bonusBadge');
    if (!badge || badge.classList.contains('bonus-closing') || badge.classList.contains('bonus-hidden')) return;

    const finishClosing = () => {
        badge.classList.add('bonus-hidden');
        badge.classList.remove('bonus-closing');
    };

    badge.classList.add('bonus-closing');
    badge.addEventListener('animationend', finishClosing, { once: true });
    window.setTimeout(finishClosing, 1500);
}

function copyPromoCode() {
    const code = 'VETKA500';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
    }

    const badge = document.getElementById('bonusBadge');
    if (badge) {
        badge.classList.add('bonus-copied');
        window.setTimeout(() => badge.classList.remove('bonus-copied'), 1800);
    }
}

function parsePixelValue(value, fallback) {
    const parsedValue = parseInt(value, 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function getAnchorOffset(target) {
    const rootStyles = getComputedStyle(document.documentElement);
    const baseOffset = parsePixelValue(rootStyles.getPropertyValue('--anchor-offset'), 120);

    if (!target) return baseOffset;

    const targetStyles = getComputedStyle(target);
    return parsePixelValue(targetStyles.getPropertyValue('--section-anchor-offset'), baseOffset);
}

function scrollToAnchor(targetId, behavior = 'smooth') {
    if (!targetId || targetId === '#') return false;

    const target = document.querySelector(targetId);
    if (!target) return false;

    const targetTop = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset(target);
    window.scrollTo({
        top: Math.max(0, targetTop),
        behavior
    });

    return true;
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        event.preventDefault();
        if (scrollToAnchor(targetId)) {
            history.pushState(null, '', targetId);
        }
    });
});

window.addEventListener('load', () => {
    if (window.location.hash) {
        window.setTimeout(() => scrollToAnchor(window.location.hash, 'auto'), 0);
    }
});



let currentReviewIndex = 0;

function changeReviewSlide(direction) {
    const track = document.getElementById('reviews-track');
    const items = document.querySelectorAll('.review-slide-item-wide');

    if (!track || items.length === 0) return;

    // Проверяем ширину экрана пользователя в реальном времени
    const isMobile = window.innerWidth <= 768;

    // На мобилках листаем по 1 карточке, на десктопе — сразу по 3
    const step = isMobile ? 1 : 3;
    currentReviewIndex += (direction * step);

    // Круговая логика карусели
    if (currentReviewIndex >= items.length) {
        currentReviewIndex = 0;
    }
    if (currentReviewIndex < 0) {
        currentReviewIndex = isMobile ? items.length - 1 : items.length - 3;
    }

    // Берём реальную ширину карточки (включая padding-right как зазор) напрямую из DOM,
    // а не хардкодим число в пикселях — так сдвиг никогда не разойдётся с фактической раскладкой
    const cardWidth = items[0].getBoundingClientRect().width;
    const shiftAmount = currentReviewIndex * cardWidth;

    track.style.transform = `translateX(-${shiftAmount}px)`;
}

function applyOption(button) {
    const category = button.dataset.cat;
    const optionName = button.dataset.val;
    const selectedText = button.textContent.trim();

    // 1. Снимаем подсветку у всех кнопок этой категории, зажигаем у нажатой
    document.querySelectorAll(`.opt-btn[data-cat="${category}"]`).forEach(btn => {
        btn.classList.remove('active-opt');
    });
    button.classList.add('active-opt');

    // 2. Синхронизируем живой превью букета — переключаем data-атрибут,
    // а какие SVG-слои показывать решает CSS (см. .bq-layer правила в style.css)
    const preview = document.getElementById('bouquet-preview');
    if (preview) {
        preview.setAttribute(`data-${category}`, optionName);
    }

    const summary = document.getElementById(`summary-${category}`);
    if (summary) {
        summary.textContent = selectedText;
    }

    const previewImage = document.getElementById('constructorPreviewImage');
    const previewImages = {
        base: {
            composition: 'images/hero-light-1.jpg',
            loose: 'images/hero-light-2.jpg',
            kenzan: 'images/catalog-compositions.jpg'
        },
        flower: {
            lily: 'images/hero-light-1.jpg',
            gerbera: 'images/flagship1.jpg',
            'french-rose': 'images/flagship2.jpg',
            sunflower: 'images/flagship3.jpg',
            greenball: 'images/catalog-compositions.jpg'
        },
        character: {
            soft: 'images/hero-light-2.jpg',
            graphic: 'images/catalog-wedding.jpg',
            dog: 'images/summcollect.jpg'
        }
    };

    if (previewImage && previewImages[category] && previewImages[category][optionName]) {
        previewImage.src = previewImages[category][optionName];
    }
}

// Навешиваем по одному слушателю на каждую кнопку конструктора при загрузке страницы
document.querySelectorAll('.opt-btn[data-cat]').forEach(button => {
    button.addEventListener('click', () => applyOption(button));
});

// ===== ЛЁГКИЙ ПАРАЛЛАКС ДЕКОРАТИВНЫХ ЭЛЕМЕНТОВ HERO =====
// Ветка, папоротники и туман двигаются с разной скоростью при скролле — создаёт ощущение глубины.
// requestAnimationFrame + флаг ticking, чтобы не вызывать пересчёт стилей чаще, чем браузер успевает рисовать кадр.
(function initHeroParallax() {
    const branch = document.querySelector('.hero-branch-decor');
    const fernLeft = document.querySelector('.fern-left');
    const fernRight = document.querySelector('.fern-right');
    const fog = document.querySelector('.hero-fog');

    if (!branch && !fernLeft && !fernRight && !fog) return;

    let ticking = false;

    function applyParallax() {
        const y = window.scrollY;

        // Каждый слой двигается со своим коэффициентом — чем дальше "на фоне", тем медленнее.
        // ВАЖНО: у папоротников в CSS уже есть свой transform (поворот/зеркало) — его нельзя
        // перезаписывать инлайн-стилем, поэтому translateY всегда идёт ПЕРЕД сохранённым поворотом.
        if (branch) branch.style.transform = `translateY(${y * 0.15}px)`;
        if (fernLeft) fernLeft.style.transform = `translateY(${y * 0.08}px) rotate(25deg)`;
        if (fernRight) fernRight.style.transform = `translateY(${y * 0.08}px) rotate(-35deg) scaleX(-1)`;
        if (fog) fog.style.transform = `translateY(${y * 0.25}px)`;

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(applyParallax);
            ticking = true;
        }
    });
})();

