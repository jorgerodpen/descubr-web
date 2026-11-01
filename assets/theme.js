// Dark-mode toggle, sticky-header state, reading-progress bar, back-to-top
// button, docs TOC scroll-spy, nav wayfinding and the home page's walking route. Each feature no-ops if its
// markup isn't on the page, so this file is safe to include everywhere.
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

  // Wayfinding: the nav link for the section you're reading stays lit
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav-links a[href^="#"]'));

  function updateNavSpy() {
    var line = (header ? header.offsetHeight : 0) + 80;
    navLinks.forEach(function (a) {
      var section = document.querySelector(a.getAttribute('href'));
      if (!section) return;
      var r = section.getBoundingClientRect();
      var here = r.top <= line && r.bottom > line;
      a.classList.toggle('active', here);
      if (here) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
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
    updateNavSpy();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Dashed walking route between the "how it works" screenshots: from the
  // bottom of each one, across the gap, into the top of the next. Drawn as
  // one SVG path per leg (not two CSS borders) so the dashes run unbroken
  // through the bends. Each leg traces itself in the first time it scrolls
  // into view; a solid path in a mask uncovers the dashed one.
  var steps = document.querySelector('.steps');
  if (steps) {
    var NS = 'http://www.w3.org/2000/svg';
    var svgEl = function (tag, attrs, parent) {
      var el = document.createElementNS(NS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      parent.appendChild(el);
      return el;
    };
    var route = svgEl('svg', { 'class': 'steps-route', 'aria-hidden': 'true' }, steps);
    var defs = svgEl('defs', {}, route);
    var stepEls = steps.querySelectorAll('.step');
    var legs = [];
    for (var i = 0; i < stepEls.length - 1; i++) {
      var mask = svgEl('mask', { id: 'route-leg-' + i, maskUnits: 'userSpaceOnUse' }, defs);
      legs.push({
        from: stepEls[i].querySelector('.step-shot'),
        to: stepEls[i + 1].querySelector('.step-shot'),
        reveal: svgEl('path', { 'class': 'route-reveal', pathLength: '1' }, mask),
        line: svgEl('path', { 'class': 'route-line', mask: 'url(#route-leg-' + i + ')' }, route)
      });
    }

    var drawRoute = function () {
      var box = steps.getBoundingClientRect();
      legs.forEach(function (leg) {
        var a = leg.from.getBoundingClientRect();
        var b = leg.to.getBoundingClientRect();
        var x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
        var x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top;
        var ym = (y1 + y2) / 2;
        var r = Math.min(28, (y2 - y1) / 2, Math.abs(x2 - x1) / 2);
        var dir = x2 > x1 ? 1 : -1;
        var d = 'M' + x1 + ' ' + y1 + 'V' + (ym - r) +
                'Q' + x1 + ' ' + ym + ' ' + (x1 + dir * r) + ' ' + ym +
                'H' + (x2 - dir * r) +
                'Q' + x2 + ' ' + ym + ' ' + x2 + ' ' + (ym + r) +
                'V' + y2;
        leg.line.setAttribute('d', d);
        leg.reveal.setAttribute('d', d);
      });
    };
    drawRoute();
    // covers window resizes and the lazy screenshots settling in
    if (window.ResizeObserver) new ResizeObserver(drawRoute).observe(steps);
    else window.addEventListener('resize', drawRoute);

    var showLeg = function (leg) { leg.reveal.classList.add('shown'); };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !window.IntersectionObserver) {
      legs.forEach(showLeg);
    } else {
      // a leg traces in once the screenshot it leads to is a third of the way up the screen
      var routeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          legs.forEach(function (leg) { if (leg.to === entry.target) showLeg(leg); });
          routeObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -30% 0px' });
      legs.forEach(function (leg) { routeObserver.observe(leg.to); });
    }
  }
})();
