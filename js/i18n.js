
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

    function localize(value, lang) {
        if (Array.isArray(value)) return value.map((item) => localize(item, lang));
        if (!value || typeof value !== 'object') return value;
        const keys = Object.keys(value);
        if (keys.length === LANGS.length && LANGS.every((language) => Object.hasOwn(value, language))) return value[lang];
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, lang)]));
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

    function renderNews(target, news) {
        if (!target || !Array.isArray(news) || !news.length) return;
        const items = news.map((item) => `<article class="news-ticker-item"><time>${escapeHTML(item.date)}</time><span>${escapeHTML(item.text)}</span></article>`).join('');
        target.innerHTML = `<strong class="news-ticker-label">NEWS</strong><div class="news-ticker-window"><div class="news-ticker-track"><div class="news-ticker-group">${items}</div><div class="news-ticker-group" aria-hidden="true">${items}</div></div></div>`;
    }

    function renderFeatureCards(target, items, linkLabel) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item, index) => `<article class="feature-card tilt-card" data-animate><span class="feature-index">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div>${item.link ? `<a class="card-link" href="${escapeHTML(item.link)}">${escapeHTML(linkLabel || 'View more')}</a>` : ''}</article>`).join('');
    }

    function renderHeroServices(target, items) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.slice(0, 3).map((item) => `<a class="hero-quick-card" href="${escapeHTML(item.link || 'products.html')}"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.text)}</span></a>`).join('');
    }

    function renderProductToc(target, groups) {
        if (!target || !Array.isArray(groups)) return;
        const links = groups.map((group) => `<a href="#product-group-${escapeHTML(group.id)}"><span>${escapeHTML(group.title)}</span><b aria-hidden="true">→</b></a>`).join('');
        target.innerHTML = `<div class="product-toc-links">${links}</div>`;
    }

    function selectProductGroup(targetId) {
        const sections = Array.from(document.querySelectorAll('.product-group'));
        if (!sections.length) return;
        const selected = sections.find((section) => section.id === targetId) || sections[0];
        sections.forEach((section) => {
            section.hidden = section !== selected;
        });
        document.querySelectorAll('.product-toc-links a').forEach((link) => {
            const active = link.hash === `#${selected.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    function renderProductCard(item, images) {
        return `<article class="product-card tilt-card" data-animate><div class="product-visual" style="background-image:url('${escapeHTML(images[item.id] || '')}')"></div><div class="product-card-content"><span class="category-pill">${escapeHTML(item.category)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div></article>`;
    }

    function renderProducts(target, items, groups, images) {
        if (!target || !Array.isArray(items) || !Array.isArray(groups)) return;
        const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
        target.innerHTML = groups.map((group, index) => {
            const cards = group.itemIds.map((id) => itemsById[id]).filter(Boolean).map((item) => renderProductCard(item, images)).join('');
            return `<section class="product-group" id="product-group-${escapeHTML(group.id)}"><div class="product-group-heading" data-animate><span>${String(index + 1).padStart(2, '0')}</span><h2>${escapeHTML(group.title)}</h2></div><div class="product-grid">${cards}</div></section>`;
        }).join('');
        selectProductGroup(window.location.hash.slice(1));
    }

    function renderCases(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item) => {
            const image = images[item.id] || '';
            return `<a class="case-card tilt-card" data-animate href="#facility-${escapeHTML(item.id)}" style="--case-bg:url('${escapeHTML(image)}')"><div class="case-stat">${escapeHTML(item.stat)}</div><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></div></a>`;
        }).join('');
    }

    function renderFacilityDetails(target, items, images) {
        if (!target || !Array.isArray(items)) return;
        target.innerHTML = items.map((item, index) => {
            const backgroundClass = index % 2 === 0 ? ' section-soft' : '';
            const details = Array.isArray(item.details) ? item.details : [];
            const detailCards = details.map((detail, detailIndex) => {
                const points = Array.isArray(detail.items) ? detail.items : [];
                const pointList = points.map((point) => `<li>${escapeHTML(point)}</li>`).join('');
                const image = images[detail.imageId || item.id] || '';
                return `<article class="facility-detail" id="facility-${escapeHTML(item.id)}-${escapeHTML(detail.id)}" data-animate><div class="facility-detail-visual" style="background-image:url('${escapeHTML(image)}')"></div><div class="facility-detail-body"><p class="section-kicker">${String(detailIndex + 1).padStart(2, '0')}</p><h3>${escapeHTML(detail.title)}</h3><p>${escapeHTML(detail.text)}</p>${pointList ? `<ul class="detail-list">${pointList}</ul>` : ''}</div></article>`;
            }).join('');
            return `<section class="section facility-detail-section${backgroundClass}" id="facility-${escapeHTML(item.id)}"><div class="container"><div class="section-heading" data-animate><p class="section-kicker">${escapeHTML(item.stat || String(index + 1).padStart(2, '0'))}</p><h2 class="section-title">${escapeHTML(item.title)}</h2><p>${escapeHTML(item.text)}</p></div><div class="facility-detail-list">${detailCards}</div></div></section>`;
        }).join('');
    }

    function renderDynamic(data, site) {
        const media = site.media;
        renderNews(document.querySelector('[data-render="homeNews"]'), data.home && data.home.news);
        document.querySelectorAll('[data-render="heroServices"]').forEach((target) => renderHeroServices(target, data.home && data.home.services));
        renderFeatureCards(document.querySelector('[data-render="homeServices"]'), data.home && data.home.services, data.common && data.common.viewMore);
        renderRows(document.querySelector('[data-render="companyOutline"]'), data.company && data.company.outline);
        renderFeatureCards(document.querySelector('[data-render="companyPhilosophy"]'), data.company && data.company.philosophy, data.common && data.common.viewMore);
        renderProductToc(document.querySelector('[data-render="productToc"]'), data.products && data.products.groups);
        renderProducts(document.querySelector('[data-render="products"]'), data.products && data.products.items, data.products && data.products.groups, media.products);
        renderCases(document.querySelector('[data-render="facilities"]'), data.facilities && data.facilities.cases, media.facilities);
        renderFacilityDetails(document.querySelector('[data-render="facilityDetails"]'), data.facilities && data.facilities.cases, media.facilities);
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
        const selectedLang = LANGS.includes(lang) ? lang : 'ja';
        if (!document.body.dataset.siteReady) {
            renderSite(site);
            document.body.dataset.siteReady = 'true';
        }
        const data = localize(all, selectedLang);
        document.documentElement.lang = selectedLang;
        window.localStorage.setItem('yoshigen-lang', selectedLang);
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
            button.classList.toggle('active', button.dataset.lang === selectedLang);
        });
        renderDynamic(data, site);
        window.dispatchEvent(new CustomEvent('yoshigen:i18n-ready'));
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyLanguage(currentLang()).catch((error) => console.error('i18n load failed:', error));
        document.querySelectorAll('.lang-switch button').forEach((button) => {
            button.addEventListener('click', () => applyLanguage(button.dataset.lang).catch((error) => console.error('i18n switch failed:', error)));
        });
        document.addEventListener('click', (event) => {
            const link = event.target.closest('.product-toc-links a[href^="#product-group-"]');
            if (!link) return;
            event.preventDefault();
            window.history.replaceState(null, '', link.hash);
            selectProductGroup(link.hash.slice(1));
        });
        window.addEventListener('hashchange', () => selectProductGroup(window.location.hash.slice(1)));
    });
})();
