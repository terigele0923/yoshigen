
(function () {
    const LANGS = ['ja', 'zh', 'en'];
    const labels = { ja: '日本語', zh: '中文', en: 'English' };
    let dictionary = null;
    let siteConfig = null;

    const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);

    function getValue(source, path) {
        return path.split('.').reduce((value, key) => value && value[key], source);
    }

    function currentLang() {
        const param = new URLSearchParams(window.location.search).get('lang');
        const saved = window.localStorage.getItem('yoshigen-lang');
        return LANGS.includes(param) ? param : (LANGS.includes(saved) ? saved : 'ja');
    }

    function renderRows(target, rows) {
        if (!target || !Array.isArray(rows)) return;
        target.innerHTML = rows.map((row) => `<dl class="info-row" data-animate><dt>${escapeHTML(row.label)}</dt><dd>${escapeHTML(row.value)}</dd></dl>`).join('');
    }

    function renderStats(target, stats) {
        if (!target || !Array.isArray(stats)) return;
        target.innerHTML = stats.map((item) => `<div class="metric-item"><div class="metric-number"><span class="counter-number" data-count="${escapeHTML(item.number)}">0</span><span>${escapeHTML(item.suffix)}</span></div><p>${escapeHTML(item.label)}</p></div>`).join('');
    }

    function renderFeatureCards(target, items, linkLabel) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item, index) => `<article class="feature-card tilt-card" data-animate><span class="feature-index">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div>${item.link ? `<a class="card-link" href="${escapeHTML(item.link)}">${escapeHTML(linkLabel || 'View more')}</a>` : ''}</article>`).join('');
    }

    function renderHeroServices(target, items) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.slice(0, 3).map((item) => `<a class="hero-quick-card" href="${escapeHTML(item.link || 'products.html')}"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.text)}</span></a>`).join('');
    }

    function renderFlow(target, items) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item) => `<article class="flow-card" data-animate><span class="flow-step">${escapeHTML(item.step)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></article>`).join('');
    }

    function renderProducts(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item) => `<article class="product-card tilt-card" data-animate><div class="product-visual" style="background-image:url('${escapeHTML(images[item.id] || '')}')"></div><div class="product-card-content"><span class="category-pill">${escapeHTML(item.category)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div></article>`).join('');
    }

    function renderCases(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item, index) => {
            const image = images[item.id] || '';
            return `<a class="case-card tilt-card" data-animate href="#facility-detail-${index + 1}" style="--case-bg:url('${escapeHTML(image)}')"><div class="case-stat">${escapeHTML(item.stat)}</div><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div></a>`;
        }).join('');
    }

    function renderFacilityDetails(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item, index) => {
            const points = Array.isArray(item.detailItems) ? item.detailItems : [];
            const pointList = points.map((point) => `<li>${escapeHTML(point)}</li>`).join('');
            return `<article class="facility-detail" id="facility-detail-${index + 1}" data-animate><div class="facility-detail-visual" style="background-image:url('${escapeHTML(images[item.id] || '')}')"></div><div class="facility-detail-body"><p class="section-kicker">${escapeHTML(item.stat || String(index + 1).padStart(2, '0'))}</p><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.detailLead || item.text)}</p>${pointList ? `<ul class="detail-list">${pointList}</ul>` : ''}</div></article>`;
        }).join('');
    }

    function renderGallery(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item) => `<article class="gallery-card tilt-card" data-animate><div class="gallery-visual" style="background-image:url('${escapeHTML(images[item.id] || '')}')"></div><div class="gallery-card-content"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div></article>`).join('');
    }

    function renderDynamic(data, site) {
        const media = site.media;
        document.querySelectorAll('[data-render="homeStats"]').forEach((target) => renderStats(target, data.home && data.home.stats));
        document.querySelectorAll('[data-render="heroServices"]').forEach((target) => renderHeroServices(target, data.home && data.home.services));
        renderFeatureCards(document.querySelector('[data-render="homeServices"]'), data.home && data.home.services, data.common && data.common.viewMore);
        renderFlow(document.querySelector('[data-render="homeFlow"]'), data.home && data.home.flow);
        renderRows(document.querySelector('[data-render="companyOutline"]'), data.company && data.company.outline);
        renderFeatureCards(document.querySelector('[data-render="companyPhilosophy"]'), data.company && data.company.philosophy, data.common && data.common.viewMore);
        renderProducts(document.querySelector('[data-render="products"]'), data.products && data.products.items, media.products);
        renderCases(document.querySelector('[data-render="facilities"]'), data.facilities && data.facilities.cases, media.facilities);
        renderFacilityDetails(document.querySelector('[data-render="facilityDetails"]'), data.facilities && data.facilities.cases, media.facilities);
        renderGallery(document.querySelector('[data-render="gallery"]'), data.gallery && data.gallery.sections, media.gallery);
        renderRows(document.querySelector('[data-render="contactRows"]'), data.contact && data.contact.contactRows);
        renderRows(document.querySelector('[data-render="bankRows"]'), data.contact && data.contact.bankRows);
    }

    async function loadDictionary() {
        if (dictionary) return dictionary;
        const response = await fetch('data/i18n.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`i18n.json: ${response.status}`);
        dictionary = await response.json();
        return dictionary;
    }

    async function loadSiteConfig() {
        if (siteConfig) return siteConfig;
        const response = await fetch('data/site.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`site.json: ${response.status}`);
        siteConfig = await response.json();
        return siteConfig;
    }

    function renderSite(config) {
        const carousel = document.getElementById('lpCarousel');
        const track = carousel && carousel.querySelector('.hero-track');
        if (track && Array.isArray(config.hero.slides) && config.hero.slides.length) {
            const template = track.querySelector('.hero-slide');
            const slides = config.hero.slides.map((image, index) => {
                const slide = template.cloneNode(true);
                slide.classList.toggle('active', index === 0);
                slide.style.backgroundImage = `url(${JSON.stringify(image)})`;
                return slide;
            });
            track.replaceChildren(...slides);
            carousel.dataset.interval = String(config.hero.intervalMs);
        }
        document.querySelectorAll('.page-hero-bg').forEach((hero) => {
            hero.style.backgroundImage = `url(${JSON.stringify(config.pageHeroImage)})`;
        });
        const map = document.querySelector('.map-frame iframe');
        if (map) map.src = `https://www.google.com/maps?q=${encodeURIComponent(config.contact.mapQuery)}&output=embed`;
    }

    async function applyLanguage(lang) {
        const [all, site] = await Promise.all([loadDictionary(), loadSiteConfig()]);
        if (!document.body.dataset.siteReady) {
            renderSite(site);
            document.body.dataset.siteReady = 'true';
        }
        const data = all[lang] || all.ja;
        document.documentElement.lang = lang;
        window.localStorage.setItem('yoshigen-lang', lang);
        document.querySelectorAll('[data-i18n]').forEach((node) => {
            const value = getValue(data, node.dataset.i18n);
            if (value !== undefined) node.textContent = value;
        });
        const title = document.querySelector('title[data-title-key]');
        if (title) {
            const value = getValue(data, title.dataset.titleKey);
            if (value) document.title = value;
        }
        document.querySelectorAll('.lang-switch button').forEach((button) => {
            button.textContent = labels[button.dataset.lang] || button.dataset.lang;
            button.classList.toggle('active', button.dataset.lang === lang);
        });
        renderDynamic(data, site);
        window.dispatchEvent(new CustomEvent('yoshigen:i18n-ready'));
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyLanguage(currentLang()).catch((error) => console.error('i18n load failed:', error));
        document.querySelectorAll('.lang-switch button').forEach((button) => {
            button.addEventListener('click', () => applyLanguage(button.dataset.lang).catch((error) => console.error('i18n switch failed:', error)));
        });
    });
})();
