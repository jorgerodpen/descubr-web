(function () {
  var SUPPORTED = ['en', 'es'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'descubr-lang';

  function resolveLang() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = (params.get('lang') || '').toLowerCase();
    if (SUPPORTED.indexOf(fromQuery) !== -1) return fromQuery;

    var stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;

    var nav = ((navigator.language || DEFAULT_LANG).split(/[-_]/)[0] || DEFAULT_LANG).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : DEFAULT_LANG;
  }

  // Pages can carry a Spanish title/description on <html> (data-title-es /
  // data-description-es) so the tab and search snippet follow the language.
  var html = document.documentElement;
  var defaults = { title: document.title, description: (document.querySelector('meta[name="description"]') || {}).content };

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    var es = lang === 'es';
    document.title = (es && html.getAttribute('data-title-es')) || defaults.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta && defaults.description) meta.setAttribute('content', (es && html.getAttribute('data-description-es')) || defaults.description);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('[data-lang-select]').forEach(function (el) {
      el.value = lang;
    });
    // Screenshots with a Spanish version: <img data-src-es data-alt-es>.
    if (es) {
      document.querySelectorAll('img[data-src-es]').forEach(function (img) {
        img.src = img.getAttribute('data-src-es');
        if (img.hasAttribute('data-alt-es')) img.alt = img.getAttribute('data-alt-es');
      });
    }
    document.querySelectorAll('[data-i18n-placeholder-' + lang + ']').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-i18n-placeholder-' + lang));
    });
  }

  function switchLang(lang) {
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(resolveLang());
    document.querySelectorAll('[data-lang-select]').forEach(function (el) {
      el.addEventListener('change', function () {
        switchLang(el.value);
      });
    });
  });
})();
