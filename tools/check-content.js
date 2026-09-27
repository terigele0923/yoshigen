const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const site = readJson('data/site.json');
const translations = readJson('data/i18n.json');
const languages = ['ja', 'zh', 'en'];

function localize(value, language) {
    if (Array.isArray(value)) return value.map((item) => localize(item, language));
    if (!value || typeof value !== 'object') return value;
    const keys = Object.keys(value);
    if (keys.length === languages.length && languages.every((item) => Object.hasOwn(value, item))) return value[language];
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, language)]));
}

const localized = Object.fromEntries(languages.map((language) => [language, localize(translations, language)]));
const groups = {
    products: (lang) => localized[lang].products.items,
    facilities: (lang) => localized[lang].facilities.cases
};

function checkImage(image, label) {
    if (typeof image !== 'string' || !image.startsWith('images/')) {
        throw new Error(`${label}: images/ から始まる画像パスを指定してください`);
    }
    if (!fs.existsSync(path.join(root, image))) {
        throw new Error(`${label}: ${image} が見つかりません`);
    }
}

if (!Number.isInteger(site.hero.intervalMs) || site.hero.intervalMs < 1000) {
    throw new Error('hero.intervalMs は1000以上の整数にしてください');
}
if (!Array.isArray(site.hero.slides) || site.hero.slides.length === 0) {
    throw new Error('hero.slides に画像を1枚以上指定してください');
}
site.hero.slides.forEach((image, index) => checkImage(image, `hero.slides[${index}]`));
checkImage(site.pageHeroImage, 'pageHeroImage');
if (!site.contact.mapQuery) throw new Error('contact.mapQuery がありません');

for (const [group, getItems] of Object.entries(groups)) {
    const images = site.media[group];
    if (!images || typeof images !== 'object') throw new Error(`media.${group} がありません`);
    const expected = Object.keys(images).sort().join(',');
    for (const [id, image] of Object.entries(images)) checkImage(image, `media.${group}.${id}`);
    for (const lang of languages) {
        const ids = getItems(lang).map((item) => item.id);
        const hasDuplicate = new Set(ids).size !== ids.length;
        const hasMissingImage = ids.some((id) => !Object.hasOwn(images, id));
        const hasDifferentProductIds = group === 'products' && ids.slice().sort().join(',') !== expected;
        if (hasDuplicate || hasMissingImage || hasDifferentProductIds) {
            throw new Error(`${lang}.${group}: id と media.${group} の対応を確認してください`);
        }
    }
}

for (const lang of languages) {
    for (const facility of localized[lang].facilities.cases) {
        if (!Array.isArray(facility.details) || facility.details.length === 0) {
            throw new Error(`${lang}.facilities.${facility.id}.details に内容を1件以上指定してください`);
        }
        const detailIds = facility.details.map((detail) => detail.id);
        if (new Set(detailIds).size !== detailIds.length) {
            throw new Error(`${lang}.facilities.${facility.id}.details の id が重複しています`);
        }
        for (const detail of facility.details) {
            const imageId = detail.imageId || facility.id;
            if (!Object.hasOwn(site.media.facilities, imageId)) {
                throw new Error(`${lang}.facilities.${facility.id}.${detail.id}: media.facilities.${imageId} がありません`);
            }
        }
    }
}

const productIds = localized.ja.products.items.map((item) => item.id).sort();
for (const lang of languages) {
    const productGroups = localized[lang].products.groups;
    if (!Array.isArray(productGroups) || productGroups.length === 0) {
        throw new Error(`${lang}.products.groups に分類を1件以上指定してください`);
    }
    const groupIds = productGroups.map((group) => group.id);
    if (new Set(groupIds).size !== groupIds.length) {
        throw new Error(`${lang}.products.groups の id が重複しています`);
    }
    const classifiedIds = productGroups.flatMap((group) => group.itemIds).sort();
    if (new Set(classifiedIds).size !== classifiedIds.length || classifiedIds.join(',') !== productIds.join(',')) {
        throw new Error(`${lang}.products.groups: 全商品を重複なく分類してください`);
    }
}

console.log('JSON と画像パスを確認しました。');
