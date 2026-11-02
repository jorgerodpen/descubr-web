// Dark-mode toggle, sticky-header state, reading-progress bar, back-to-top
// button, docs TOC scroll-spy, nav wayfinding and the home page's motion
// (walking route, pinned walkthrough, hero depth, rewards pop). Each feature no-ops if its
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

  // App screenshots follow the site's theme: app-x.jpg ↔ app-x-dark.jpg
  // (Spanish ones too). Runs now, before lang.js swaps in the Spanish files
  // on DOMContentLoaded, so a dark page doesn't fetch the light ones first.
  function syncShots() {
    var dark = isDark();
    document.querySelectorAll('img[src*="assets/app-"]').forEach(function (img) {
      var src = img.getAttribute('src');
      var light = src.replace(/-dark\.jpg$/, '.jpg');
      var want = dark ? light.replace(/\.jpg$/, '-dark.jpg') : light;
      if (src !== want) img.setAttribute('src', want);
    });
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncShots);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      syncShots();
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

    // Desktop: one pinned phone shows the screenshot of whichever step is in
    // the middle of the screen, and a route track fills down through the
    // step numbers as you scroll. Built from the existing step screenshots.
    // Phones get the same track down the left edge (no pinned phone).
    var stepList = Array.prototype.slice.call(stepEls);
    var stage = document.createElement('div');
    stage.className = 'steps-stage';
    stage.setAttribute('aria-hidden', 'true');
    var stageFrame = document.createElement('div');
    stageFrame.className = 'phone-frame';
    stageFrame.innerHTML = '<div class="phone-notch"></div>';
    var stageShots = stepList.map(function (step) {
      var shot = step.querySelector('.step-shot').cloneNode(true);
      shot.className = 'stage-shot';
      shot.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; img.alt = ''; });
      stageFrame.appendChild(shot);
      return shot;
    });
    stage.appendChild(stageFrame);
    steps.insertBefore(stage, steps.firstChild);
    var track = document.createElement('div');
    track.className = 'steps-track';
    track.innerHTML = '<div class="steps-track-fill"></div>';
    steps.appendChild(track);
    var trackFill = track.firstChild;
    var wide = window.matchMedia('(min-width: 900px)');
    var narrow = window.matchMedia('(max-width: 640px)');
    var shownStep = -1;

    var updateWalkthrough = function () {
      if (!wide.matches && !narrow.matches) return;
      var box = steps.getBoundingClientRect();
      var mid = window.innerHeight / 2;
      var nodes = stepList.map(function (step) { return step.querySelector('.step-number').getBoundingClientRect(); });
      var first = nodes[0], last = nodes[nodes.length - 1];
      var x = first.left + first.width / 2 - box.left - 1.5;
      var top = first.top + first.height / 2 - box.top;
      var height = last.top + last.height / 2 - box.top - top;
      track.style.left = x + 'px';
      track.style.top = top + 'px';
      track.style.height = height + 'px';
      // the stop sits above its step's text, so fill to a line a bit below
      // the middle: a stop lights up as its screenshot takes over the phone
      var fillLine = window.innerHeight * 0.62;
      var filled = Math.max(0, Math.min(height, fillLine - (box.top + top)));
      trackFill.style.height = filled + 'px';
      var active = 0, best = Infinity;
      stepList.forEach(function (step, i) {
        var nodeY = nodes[i].top + nodes[i].height / 2 - box.top - top;
        step.classList.toggle('reached', nodeY <= filled + 1);
        var r = step.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < best) { best = d; active = i; }
      });
      // the new screen fades in over the old one, which stays solid underneath,
      // so the phone's dark frame never shows through mid-crossfade
      if (wide.matches && active !== shownStep) {
        stageShots.forEach(function (shot, i) {
          shot.classList.toggle('is-prev', i === shownStep);
          shot.classList.toggle('is-active', i === active);
        });
        shownStep = active;
      }
    };
    var applyLayout = function () {
      steps.classList.toggle('is-pinned', wide.matches);
      steps.classList.toggle('is-tracked', narrow.matches);
      updateWalkthrough();
    };
    if (wide.addEventListener) {
      wide.addEventListener('change', applyLayout);
      narrow.addEventListener('change', applyLayout);
    }
    window.addEventListener('scroll', updateWalkthrough, { passive: true });
    window.addEventListener('resize', updateWalkthrough);
    applyLayout();
  }

  // Hero depth: as the page scrolls, the detail phone behind lags a little,
  // so the two phones read as sitting at different distances.
  var heroBack = document.querySelector('.hero-visual .phone-back');
  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroBack && motionOk) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      // capped: .hero clips at its bottom edge (its full-bleed white background)
      heroBack.style.translate = '0 ' + Math.min(y * 0.12, 60).toFixed(1) + 'px';
    }, { passive: true });
  }

  // after the walkthrough has cloned its screenshots, so the clones follow too
  syncShots();

  // Rewards row: once it's mostly on screen, pop the "+20 Descoins" chip and
  // count the Marketplace balance up by those 20 coins, to the 59 shown.
  var rewardsRow = document.querySelector('.phone-row');
  var coinCount = document.querySelector('.coin-count');
  if (rewardsRow && coinCount) {
    var end = parseInt(coinCount.textContent, 10);
    var playRewards = function () {
      rewardsRow.classList.add('rewards-live');
      if (!motionOk) return;
      var start = end - 20, t0 = null;
      var tick = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0 - 350) / 900);
        if (p > 0) coinCount.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // show the pre-reward balance until the row is on screen, so there's no jump
    if (motionOk && window.IntersectionObserver) coinCount.textContent = end - 20;
    if (window.IntersectionObserver) {
      var rewardsObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        rewardsObserver.disconnect();
        playRewards();
      }, { threshold: 0.6 });
      rewardsObserver.observe(rewardsRow);
    } else {
      playRewards();
    }
  }
})();
