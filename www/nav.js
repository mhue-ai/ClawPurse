/**
 * ClawPurse Ecosystem — Shared Navigation Bar
 * Include on any site: <script src="https://clawpurse.ai/nav.js"></script>
 * 
 * Auto-detects current language from <html lang=""> or URL path.
 * Auto-highlights the current site in the nav.
 * Injects CSS + HTML at the top of <body>.
 */
(function () {
  'use strict';

  var LANGS = ['en', 'ja', 'ko', 'es', 'fr', 'hi', 'zh', 'id'];

  var SITES = [
    { key: 'home',      url: 'https://clawpurse.ai',         pathMatch: 'clawpurse.ai' },
    { key: 'gateway',   url: 'https://gateway.clawpurse.ai',  pathMatch: 'gateway.clawpurse.ai' },
    { key: 'drip',      url: 'https://drip.clawpurse.ai',     pathMatch: 'drip.clawpurse.ai' },
    { key: 'get',       url: 'https://get.clawpurse.ai',      pathMatch: 'get.clawpurse.ai' },
    { key: 'ledger',    url: 'https://ledger.clawpurse.ai',   pathMatch: 'ledger.clawpurse.ai' },
    { key: 'nodewatch', url: 'https://nodewatch.clawpurse.ai', pathMatch: 'nodewatch.clawpurse.ai' },
  ];

  var T = {
    en: { home: 'ClawPurse', gateway: 'Gateway', drip: 'Drip Faucet', get: 'Get NTMPI', ledger: 'Ledger', nodewatch: 'NodeWatch', lang_label: 'Language' },
    ja: { home: 'ClawPurse', gateway: 'ゲートウェイ', drip: 'ドリップ蛇口', get: 'NTMPI取得', ledger: '台帳', nodewatch: 'NodeWatch', lang_label: '言語' },
    ko: { home: 'ClawPurse', gateway: '게이트웨이', drip: '드립 수도꼭지', get: 'NTMPI 받기', ledger: '원장', nodewatch: 'NodeWatch', lang_label: '언어' },
    es: { home: 'ClawPurse', gateway: 'Gateway', drip: 'Grifo Drip', get: 'Obtener NTMPI', ledger: 'Libro Mayor', nodewatch: 'NodeWatch', lang_label: 'Idioma' },
    fr: { home: 'ClawPurse', gateway: 'Passerelle', drip: 'Robinet Drip', get: 'Obtenir NTMPI', ledger: 'Registre', nodewatch: 'NodeWatch', lang_label: 'Langue' },
    hi: { home: 'ClawPurse', gateway: 'गेटवे', drip: 'ड्रिप फॉसेट', get: 'NTMPI प्राप्त करें', ledger: 'खाता बही', nodewatch: 'NodeWatch', lang_label: 'भाषा' },
    zh: { home: 'ClawPurse', gateway: '网关', drip: '水龙头', get: '获取NTMPI', ledger: '账本', nodewatch: '节点监控', lang_label: '语言' },
    id: { home: 'ClawPurse', gateway: 'Gateway', drip: 'Keran Drip', get: 'Dapatkan NTMPI', ledger: 'Buku Besar', nodewatch: 'NodeWatch', lang_label: 'Bahasa' },
  };

  function detectLang() {
    var htmlLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (LANGS.indexOf(htmlLang) !== -1) return htmlLang;
    var pathMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
    if (pathMatch && LANGS.indexOf(pathMatch[1]) !== -1) return pathMatch[1];
    return 'en';
  }

  function detectSite() {
    var host = window.location.hostname;
    for (var i = 0; i < SITES.length; i++) {
      if (host.indexOf(SITES[i].pathMatch) !== -1) return SITES[i].key;
    }
    return '';
  }

  function siteUrl(site, lang) {
    return site.url + '/' + lang + '/';
  }

  function langSwitchUrl(lang) {
    return '/' + lang + '/';
  }

  var lang = detectLang();
  var currentSite = detectSite();
  var t = T[lang] || T.en;

  var style = document.createElement('style');
  style.textContent = [
    '.cpnav{position:sticky;top:0;z-index:9999;background:rgba(12,14,19,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid #1e2230;padding:0 24px;font-family:"Outfit",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}',
    '.cpnav *{box-sizing:border-box;margin:0;padding:0}',
    '.cpnav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:56px;gap:12px}',
    '.cpnav-logo{font-weight:700;font-size:15px;color:#e2e4ea;display:flex;align-items:center;gap:8px;text-decoration:none}',
    '.cpnav-logo:hover{opacity:0.85}',
    '.cpnav-logo .cpnav-bolt{color:#f47458;font-size:18px}',
    '.cpnav-links{display:flex;gap:4px;align-items:center;flex-wrap:wrap}',
    '.cpnav-links a{font-size:13px;color:#8b8f9e;padding:6px 10px;border-radius:8px;text-decoration:none;transition:all 0.2s;white-space:nowrap}',
    '.cpnav-links a:hover{color:#e2e4ea;background:#13161d}',
    '.cpnav-links a.cpnav-active{color:#f47458;background:rgba(244,116,88,0.12)}',
    '.cpnav-lang{position:relative;display:inline-block}',
    '.cpnav-lang select{appearance:none;-webkit-appearance:none;background:#13161d;color:#8b8f9e;border:1px solid #1e2230;border-radius:8px;padding:5px 28px 5px 10px;font-size:12px;font-family:inherit;cursor:pointer;transition:border-color 0.2s;outline:none}',
    '.cpnav-lang select:hover{border-color:#2a2f40}',
    '.cpnav-lang::after{content:"▾";position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:10px;color:#5c6070;pointer-events:none}',
    '@media(max-width:640px){.cpnav-inner{height:auto;padding:12px 0;flex-wrap:wrap}.cpnav-links{gap:2px}}',
  ].join('\n');
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.className = 'cpnav';

  var inner = document.createElement('div');
  inner.className = 'cpnav-inner';

  var logo = document.createElement('a');
  logo.href = siteUrl(SITES[0], lang);
  logo.className = 'cpnav-logo';
  logo.innerHTML = '<span class="cpnav-bolt">\u26A1</span> ' + t.home;
  inner.appendChild(logo);

  var links = document.createElement('div');
  links.className = 'cpnav-links';

  SITES.forEach(function (site) {
    var a = document.createElement('a');
    a.href = siteUrl(site, lang);
    a.textContent = t[site.key];
    if (site.key === currentSite) a.className = 'cpnav-active';
    links.appendChild(a);
  });

  var langWrap = document.createElement('div');
  langWrap.className = 'cpnav-lang';
  var sel = document.createElement('select');
  sel.setAttribute('aria-label', t.lang_label);
  LANGS.forEach(function (l) {
    var opt = document.createElement('option');
    opt.value = langSwitchUrl(l);
    opt.textContent = l.toUpperCase();
    if (l === lang) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', function () {
    if (this.value) window.location.href = this.value;
  });
  langWrap.appendChild(sel);
  links.appendChild(langWrap);

  inner.appendChild(links);
  nav.appendChild(inner);

  if (document.body.firstChild) {
    document.body.insertBefore(nav, document.body.firstChild);
  } else {
    document.body.appendChild(nav);
  }

  if (!document.querySelector('link[href*="Outfit"]')) {
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
  }
})();
