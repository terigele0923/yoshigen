
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeroSlider();
    initCanvasMotion();
    initDynamicMotion();
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
});

window.addEventListener('yoshigen:i18n-ready', initDynamicMotion);

function initNavigation() {
    const header = document.querySelector('.site-header');
    const active = header && header.dataset.activePage;
    document.querySelectorAll('.site-nav a').forEach((link) => link.classList.toggle('active', link.dataset.nav === active));

    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    const langs = document.querySelector('.lang-switch');
    if (!toggle || !nav || !langs) return;
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        langs.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    });
}

function initHeroSlider() {
    const carousel = document.getElementById('lpCarousel');
    if (!carousel || carousel.dataset.ready) return;
    carousel.dataset.ready = 'true';
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = document.querySelector('.slider-dots');
    const interval = Number(carousel.dataset.interval || 5000);
    let current = 0;
    let timer = null;
    if (slides.length < 2) return;
    const hero = carousel.closest('.eco-hero');
    let paused = window.matchMedia('(hover: hover) and (pointer: fine)').matches && hero.matches(':hover');

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === current;
            slide.classList.toggle('active', active);
            slide.inert = !active;
        });
        if (dots) dots.querySelectorAll('button').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === current));
    }
    function start() {
        if (timer) window.clearInterval(timer);
        if (paused) return;
        timer = window.setInterval(() => {
            if (document.hidden) return;
            show(current + 1);
        }, interval);
    }
    hero.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        paused = true;
        if (timer) window.clearInterval(timer);
    });
    hero.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse') return;
        paused = false;
        start();
    });

    if (dots) {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.addEventListener('click', () => { show(index); start(); });
            dots.appendChild(dot);
        });
    }
    document.querySelector('[data-slide="prev"]')?.addEventListener('click', () => { show(current - 1); start(); });
    document.querySelector('[data-slide="next"]')?.addEventListener('click', () => { show(current + 1); start(); });
    show(current);
    start();
}

function initDynamicMotion() {
    initReveal();
    initCounters();
    initTilts();
}

function initReveal() {
    const nodes = Array.from(document.querySelectorAll('[data-animate]:not([data-reveal-ready])'));
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
        nodes.forEach((node) => node.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    nodes.forEach((node) => {
        node.dataset.revealReady = 'true';
        observer.observe(node);
    });
}

function initCounters() {
    const counters = Array.from(document.querySelectorAll('.counter-number:not([data-counter-ready])'));
    if (!counters.length) return;
    const run = (counter) => {
        const target = Number(counter.dataset.count || 0);
        const start = performance.now();
        const duration = 900;
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            counter.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                run(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.7 });
    counters.forEach((counter) => {
        counter.dataset.counterReady = 'true';
        observer.observe(counter);
    });
}

function initTilts() {
    document.querySelectorAll('.tilt-card:not([data-tilt-ready])').forEach((card) => {
        card.dataset.tiltReady = 'true';
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function initCanvasMotion() {
    document.querySelectorAll('canvas.motion-canvas, canvas.motion-canvas-small').forEach((canvas) => {
        if (canvas.dataset.motionReady) return;
        canvas.dataset.motionReady = 'true';
        const ctx = canvas.getContext('2d');
        const points = Array.from({ length: canvas.classList.contains('motion-canvas-small') ? 28 : 52 }, () => ({
            x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0007, vy: (Math.random() - 0.5) * 0.0007
        }));
        function resize() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
            canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
        }
        function draw() {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            points.forEach((point) => {
                point.x += point.vx;
                point.y += point.vy;
                if (point.x < 0 || point.x > 1) point.vx *= -1;
                if (point.y < 0 || point.y > 1) point.vy *= -1;
            });
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const distance = Math.hypot(dx, dy);
                    if (distance < 0.18) {
                        ctx.strokeStyle = `rgba(183, 240, 90, ${0.18 - distance * 0.75})`;
                        ctx.lineWidth = window.devicePixelRatio;
                        ctx.beginPath();
                        ctx.moveTo(points[i].x * w, points[i].y * h);
                        ctx.lineTo(points[j].x * w, points[j].y * h);
                        ctx.stroke();
                    }
                }
            }
            points.forEach((point) => {
                ctx.fillStyle = 'rgba(183, 240, 90, .55)';
                ctx.beginPath();
                ctx.arc(point.x * w, point.y * h, 2.2 * window.devicePixelRatio, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });
        draw();
    });
}

function updateProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
