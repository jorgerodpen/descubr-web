// Dark-mode toggle, sticky-header state, reading-progress bar, back-to-top
// button, docs TOC scroll-spy, and scroll-reveal. Each feature no-ops if its
// markup isn't on the page, so this file is safe to include everywhere.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');

  try {
    root.classList.add('js');
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (revealEls.length) {
      if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
      } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }
    }
  } catch (e) {}

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

  // Walks the visible language's headings (the other language is
  // display:none, so offsetParent is null there) and activates the last
  // one past the trigger line. suppressSpyUntil trusts a TOC click
  // directly for a moment instead of re-judging it mid-scroll.
  var suppressSpyUntil = 0;

  tocLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      tocLinks.forEach(function (b) { b.classList.toggle('active', b === a); });
      suppressSpyUntil = Date.now() + 700;
    });
  });

  function updateTocSpy() {
    if (!tocLinks.length || !allHeadings.length) return;
    if (Date.now() < suppressSpyUntil) return;
    var visible = allHeadings.filter(function (h) { return h.offsetParent !== null; });
    if (!visible.length) return;
    var current;
    // near the bottom, short trailing sections can all fit on screen with
    // none crossing the trigger line, so default to the last one
    var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      current = visible[visible.length - 1];
    } else {
      current = visible[0];
      for (var i = 0; i < visible.length; i++) {
        if (visible[i].getBoundingClientRect().top <= 120) {
          current = visible[i];
        } else {
          break;
        }
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
