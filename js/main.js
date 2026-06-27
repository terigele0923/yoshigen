document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.getElementById('lpCarousel');

    if (!carousel) {
        return;
    }

    if (window.bootstrap) {
        new bootstrap.Carousel(carousel, {
            interval: 2000,
            ride: 'carousel',
            pause: 'hover',
            touch: true,
            wrap: true
        });
        carousel.dataset.sliderReady = 'bootstrap';
        return;
    }

    const items = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-item'));
    const indicators = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-indicators button'));
    const prev = carousel.querySelector('.carousel-control-prev');
    const next = carousel.querySelector('.carousel-control-next');
    let currentIndex = items.findIndex(function (item) {
        return item.classList.contains('active');
    });

    if (currentIndex < 0) {
        currentIndex = 0;
    }

    function showSlide(index) {
        if (items.length === 0) {
            return;
        }

        currentIndex = (index + items.length) % items.length;

        items.forEach(function (item, itemIndex) {
            item.classList.toggle('active', itemIndex === currentIndex);
        });

        indicators.forEach(function (indicator, indicatorIndex) {
            const active = indicatorIndex === currentIndex;
            indicator.classList.toggle('active', active);

            if (active) {
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.removeAttribute('aria-current');
            }
        });

        carousel.dataset.activeSlide = String(currentIndex);
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentIndex - 1);
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentIndex + 1);
        });
    }

    indicators.forEach(function (indicator, indicatorIndex) {
        indicator.addEventListener('click', function () {
            showSlide(indicatorIndex);
        });
    });

    carousel.dataset.sliderReady = 'fallback';
    showSlide(currentIndex);

    setInterval(function () {
        showSlide(currentIndex + 1);
    }, 2000);
});
async function loadItemProducts() {
    const page = document.querySelector('[data-item-key]');

    if (!page) {
        return;
    }

    const itemKey = page.dataset.itemKey;
    const dataPath = page.dataset.dataPath || 'data/items.json';
    const assetRoot = page.dataset.assetRoot || '';
    const productList = document.getElementById('productList');
    const title = document.getElementById('itemTitle');
    const lead = document.getElementById('itemLead');
    const metaDescription = document.querySelector('meta[name="description"]');

    try {
        const response = await fetch(dataPath, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('商品データを取得できませんでした。');
        }

        const data = await response.json();
        const item = data[itemKey];

        if (!item || !Array.isArray(item.products)) {
            throw new Error('商品データが見つかりませんでした。');
        }

        document.title = item.title + '｜吉源商事';

        if (title) {
            title.textContent = item.title;
        }

        if (lead) {
            lead.textContent = item.lead;
        }

        if (metaDescription) {
            metaDescription.setAttribute('content', item.lead);
        }

        if (!productList) {
            return;
        }

        productList.replaceChildren();

        item.products.forEach(function (product) {
            const article = document.createElement('article');
            article.className = 'product-row';

            const imageWrap = document.createElement('div');
            imageWrap.className = 'product-image';

            const image = document.createElement('img');
            image.src = assetRoot + product.image;
            image.alt = product.name;
            imageWrap.appendChild(image);

            const description = document.createElement('div');
            description.className = 'product-description';

            const heading = document.createElement('h3');
            heading.className = 'h4';
            heading.textContent = product.name;

            const text = document.createElement('p');
            text.textContent = product.description;

            description.appendChild(heading);
            description.appendChild(text);
            article.appendChild(imageWrap);
            article.appendChild(description);
            productList.appendChild(article);
        });
    } catch (error) {
        if (productList) {
            productList.innerHTML = '<p class="product-loading">商品情報を読み込めませんでした。XAMPPのApache経由で表示しているか確認してください。</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadItemProducts);