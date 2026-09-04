// Dark-mode toggle, sticky-header glass state, reading-progress bar,
// back-to-top button and docs table-of-contents scroll-spy. Every feature
// no-ops when its markup isn't on the page, so this one file is safe to
// include on every page (see the inline theme-init snippet in <head> for
// the pre-paint half of the dark-mode logic, which avoids a flash).
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');

  function isDark() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('descubr-theme', next); } catch (e) {}
    });
  }

  var header = document.querySelector('.site-header');
  var progressFill = document.querySelector('[data-progress-fill]');
  var backToTop = document.querySelector('[data-back-to-top]');

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var allHeadings = Array.prototype.slice.call(document.querySelectorAll('.doc-card h2[id]'));

  // Scroll-spy: walk the *currently visible* language's headings (the
  // other language's are display:none, so offsetParent is null for them)
  // and activate the last one that has scrolled past the trigger line.
  // Manual, rather than IntersectionObserver — a thin trigger band leaves
  // long sections with nothing active while you're reading their body text.
  function updateTocSpy() {
    if (!tocLinks.length || !allHeadings.length) return;
    var visible = allHeadings.filter(function (h) { return h.offsetParent !== null; });
    if (!visible.length) return;
    var current = visible[0];
    for (var i = 0; i < visible.length; i++) {
      if (visible[i].getBoundingClientRect().top <= 120) {
        current = visible[i];
      } else {
        break;
      }
    }
    var href = '#' + current.id;
    tocLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === href);
    });
  }

  function onScroll() {
    var scrolled = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', scrolled > 6);
    if (backToTop) backToTop.classList.toggle('show', scrolled > 480);
    if (progressFill) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? Math.min(100, (scrolled / scrollable) * 100) : 0;
      progressFill.style.width = pct + '%';
    }
    updateTocSpy();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
