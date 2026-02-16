#!/usr/bin/env node
/**
 * ClawPurse i18n Build Script
 * Generates per-language HTML pages from a single template + JSON locale files.
 * Also generates sitemap.xml with hreflang entries.
 *
 * Usage: node build.js
 * Output: dist/<lang>/index.html for each locale, dist/index.html (English root), dist/sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, 'locales');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const DIST_DIR = path.join(__dirname, 'dist');
const BASE_URL = 'https://clawpurse.ai';

// Language display names (in their own language)
const LANG_NAMES = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  zh: '中文',
  id: 'Bahasa Indonesia'
};

// Canonical language order — English always first
const LANG_ORDER = Object.keys(LANG_NAMES);

// Load all locale files in canonical order
const locales = {};
for (const lang of LANG_ORDER) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) { console.error(`❌ Missing locale: ${file}`); process.exit(1); }
  locales[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Flatten nested JSON keys to dot notation: { nav: { wallet: "x" } } => { "nav.wallet": "x" }
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

// Build language switcher HTML
function buildLangSwitcher(currentLang) {
  const options = Object.entries(LANG_NAMES).map(([lang, name]) => {
    const selected = lang === currentLang ? ' selected' : '';
    const url = lang === 'en' ? '/' : `/${lang}/`;
    return `<option value="${url}"${selected}>${name}</option>`;
  }).join('\n            ');

  return `<select id="langSwitcher" aria-label="${locales[currentLang].langSwitcher.label}" onchange="window.location.href=this.value">
            ${options}
          </select>`;
}

// Build hreflang link tags
function buildHreflangTags(currentLang) {
  const tags = LANG_ORDER.map(lang => {
    const href = lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
    return `<link rel="alternate" hreflang="${lang}" href="${href}" />`;
  });
  tags.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`);
  return tags.join('\n  ');
}

// Build font import URL (combine base fonts + locale-specific fonts)
function buildFontUrl(locale) {
  let url = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Fira+Code:wght@400;500&';
  if (locale.meta.fontImport) {
    url += locale.meta.fontImport;
  }
  url += 'display=swap';
  return url;
}

// Process template: replace {{key}} with locale values
function renderTemplate(lang) {
  const locale = locales[lang];
  const flat = flatten(locale);

  let html = template;

  // Special replacements first (use replaceAll for keys appearing multiple times)
  html = html.replaceAll('{{LANG_SWITCHER}}', buildLangSwitcher(lang));
  html = html.replaceAll('{{HREFLANG_TAGS}}', buildHreflangTags(lang));
  html = html.replaceAll('{{FONT_URL}}', buildFontUrl(locale));
  html = html.replaceAll('{{CANONICAL_URL}}', lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`);

  // Replace all {{key}} placeholders
  html = html.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
    if (flat[key] !== undefined) return flat[key];
    console.warn(`  ⚠️  Missing key "${key}" in ${lang}.json`);
    return match;
  });

  return html;
}

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Generate HTML for each language
for (const lang of LANG_ORDER) {
  const html = renderTemplate(lang);

  if (lang === 'en') {
    // English goes to root
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
    console.log(`✅ Built: dist/index.html (${lang})`);
  }

  // All languages also get their own directory (including en for consistency)
  const langDir = path.join(DIST_DIR, lang);
  fs.mkdirSync(langDir, { recursive: true });
  fs.writeFileSync(path.join(langDir, 'index.html'), html);
  console.log(`✅ Built: dist/${lang}/index.html`);
}

// Generate sitemap.xml
const today = new Date().toISOString().split('T')[0];
const sitemapEntries = LANG_ORDER.map(lang => {
  const loc = lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
  const xhtmlLinks = LANG_ORDER.map(l => {
    const href = l === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${l}/`;
    return `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}" />`;
  }).join('\n');
  const xdefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`;

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang === 'en' ? '1.0' : '0.8'}</priority>
${xhtmlLinks}
${xdefault}
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
console.log(`✅ Built: dist/sitemap.xml`);
console.log(`\n🎉 Done! ${LANG_ORDER.length} languages built.`);
