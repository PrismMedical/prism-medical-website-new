/* Prism Medical — shared site JS. No third-party scripts, no analytics,
   no cookies. Keep it that way unless a HIPAA review approves additions. */

(function () {
  // Mobile nav. The panel is a modal dialog: it must be hidden from assistive
  // tech and removed from the tab order while closed, and it must trap focus
  // while open. Body scroll is locked so the page behind doesn't move.
  var nav = document.getElementById('mobileNav');
  var openBtn = document.getElementById('navOpen');
  var closeBtn = document.getElementById('navClose');

  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) { nav.removeAttribute('inert'); } else { nav.setAttribute('inert', ''); }
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    } else if (openBtn) {
      openBtn.focus();
    }
  }

  if (openBtn && nav) openBtn.addEventListener('click', function () { setNav(true); });
  if (closeBtn && nav) closeBtn.addEventListener('click', function () { setNav(false); });

  document.addEventListener('keydown', function (e) {
    if (!nav) return;
    if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); return; }
    if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
    var items = nav.querySelectorAll('a[href], button');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Browsers without inert support: keep the closed panel out of the tab order.
  if (nav && !('inert' in HTMLElement.prototype)) {
    var sync = function () {
      var closed = !nav.classList.contains('open');
      nav.querySelectorAll('a[href], button').forEach(function (el) {
        if (closed) { el.setAttribute('tabindex', '-1'); } else { el.removeAttribute('tabindex'); }
      });
    };
    sync();
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
  }

  // Product Lines dropdown: tap/click toggles on touch devices where hover
  // doesn't exist. First tap opens; second tap follows the link.
  var linesToggle = document.getElementById('linesToggle');
  if (linesToggle) {
    var dropLi = linesToggle.parentElement;
    linesToggle.addEventListener('click', function (e) {
      var hoverCapable = window.matchMedia('(hover: hover)').matches;
      if (!hoverCapable && !dropLi.classList.contains('open')) {
        e.preventDefault();
        dropLi.classList.add('open');
        linesToggle.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('click', function (e) {
      if (!dropLi.contains(e.target)) {
        dropLi.classList.remove('open');
        linesToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll fade-ins (respects reduced motion via CSS)
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('visible'); obs.unobserve(x.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('visible'); });
  }

  // Only one FAQ item open at a time within a .faq block
  document.querySelectorAll('.faq').forEach(function (block) {
    block.addEventListener('toggle', function (e) {
      if (e.target.tagName === 'DETAILS' && e.target.open) {
        block.querySelectorAll('details[open]').forEach(function (d) {
          if (d !== e.target) d.open = false;
        });
      }
    }, true);
  });
})();
