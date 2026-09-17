(function () {
    const script = document.currentScript || document.querySelector('script[src*="include.js"]');

    if (!script) {
        return;
    }

    function applyCommonContent() {
        const scriptUrl = new URL(script.src, window.location.href);
        const siteRootUrl = new URL('../', scriptUrl);
        const commonHeadUrl = new URL('common/head-common.html', siteRootUrl);
        const commonFooterUrl = new URL('common/footer.html', siteRootUrl);
        const commonHeaderUrl = new URL('common/header.html',siteRootUrl);
        const currentDirSegments = new URL('.', window.location.href).pathname.split('/').filter(Boolean);
        const siteRootSegments = new URL('.', siteRootUrl).pathname.split('/').filter(Boolean);
        const relativeBasePath = '../'.repeat(Math.max(0, currentDirSegments.length - siteRootSegments.length));

        fetch(commonHeadUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('head-common.htmlを取得できませんでした。');
                }

                return response.text();
            })
            .then(function (data) {
                const rendered = data.replace(/\{\{BASE_PATH\}\}/g, relativeBasePath);
                document.head.insertAdjacentHTML('beforeend', rendered);
            })
            .catch(function (error) {
                console.error('head-commonの読み込みに失敗しました:', error);
            });

        fetch(commonFooterUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('common/footer.htmlを取得できませんでした。');
                }

                return response.text();
            })
            .then(function (data) {
                const existingFooter = document.querySelector('footer');

                if (existingFooter) {
                    existingFooter.remove();
                }

                document.body.insertAdjacentHTML('beforeend', data);
            })
            .catch(function (error) {
                console.error('footerの読み込みに失敗しました:', error);
            });
        fetch(commonHeaderUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('common/header.htmlを取得できませんでした。');
                }

                return response.text();
            })
            .then(function (data) {
                const existingHeader = document.querySelector('header');

                if (existingHeader) {
                    existingHeader.remove();
                }

                const body = document.body;
                if (body) {
                    body.insertAdjacentHTML('afterbegin', data);
                }
            })
            .catch(function (error) {
                console.error('headerの読み込みに失敗しました:', error);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyCommonContent, { once: true });
    } else {
        applyCommonContent();
    }
})();