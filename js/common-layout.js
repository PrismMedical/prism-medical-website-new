/* Prism Medical — shared header/footer components (same pattern as the previous site).
   Pages hold <div id="common-layout-header"> and <div id="common-layout-footer">.
   This script loads layouts/header.html and layouts/footer.html into them, marks the
   current menu item from <body data-nav="...">, loads js/main.js, then fades out the
   .preloader overlay (which hides the page until the shared parts are in, so nothing
   flashes). Edit layouts/header.html or layouts/footer.html once and every page updates.
   Needs an http(s) server (fetch does not work from file://). */
(function () {
  "use strict";

  var HEADER_ID = "common-layout-header";
  var FOOTER_ID = "common-layout-footer";

  function fetchFragment(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load " + path);
      }
      return response.text();
    });
  }

  function replaceBlock(id, path) {
    var host = document.getElementById(id);
    if (!host) {
      return Promise.resolve(false);
    }
    return fetchFragment(path).then(function (html) {
      if (!html || !html.trim()) {
        return false;
      }
      host.outerHTML = html;
      return true;
    }).catch(function () {
      return false;
    });
  }

  function markMenuState() {
    var key = document.body.getAttribute("data-nav");
    if (!key) {
      return;
    }
    var link = document.querySelector('.nav-item[data-nav="' + key + '"]');
    if (link) {
      link.classList.add("active");
    }
  }

  function loadMain() {
    var script = document.createElement("script");
    script.src = "js/main.js";
    document.body.appendChild(script);
  }

  var preloaderDone = false;
  function handlePreloader() {
    if (preloaderDone) {
      return;
    }
    preloaderDone = true;
    var preloader = document.querySelector(".preloader");
    if (!preloader) {
      return;
    }
    preloader.style.opacity = "0";
    setTimeout(function () {
      if (preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 260);
  }

  function applyCommonLayout() {
    // Never leave the page covered if a fragment is slow or fails.
    setTimeout(handlePreloader, 3000);

    Promise.all([
      replaceBlock(HEADER_ID, "layouts/header.html"),
      replaceBlock(FOOTER_ID, "layouts/footer.html")
    ]).then(function () {
      markMenuState();
      loadMain();
      handlePreloader();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyCommonLayout);
  } else {
    applyCommonLayout();
  }
})();
