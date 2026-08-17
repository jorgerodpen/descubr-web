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

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('[data-lang-select]').forEach(function (el) {
      el.value = lang;
    });
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
