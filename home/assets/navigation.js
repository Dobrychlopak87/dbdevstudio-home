/* Small progressive enhancement for the existing React navigation. It does not replace the header or alter its layout. */
(function () {
  'use strict';

  var serviceItems = [
    ['/uslugi/www', 'Strony WWW'],
    ['/uslugi/aplikacje', 'Aplikacje'],
    ['/uslugi/design', 'Design'],
    ['/uslugi/marketing', 'Marketing']
  ];
  var knowledgeItems = [
    ['/blog/slownik', 'Słownik pojęć'],
    ['/blog/restauracja-menu-online-zamowienia', 'Restauracja: menu online i zamówienia'],
    ['/blog/sklep-osiedlowy-vs-sieciowka', 'Sklep osiedlowy vs sieciówka'],
    ['/blog/skrzynka-firmowa-podpis-i-marketing', 'Skrzynka firmowa, podpis i marketing'],
    ['/blog/warsztat-samochodowy-strona-www', 'Warsztat samochodowy — strona WWW'],
    ['/blog/wlasna-domena-i-email-firmowy', 'Własna domena i email firmowy']
  ];

  function makeSubmenu(items, extraClass) {
    var menu = document.createElement('div');
    menu.className = 'site-dropdown__menu' + (extraClass ? ' ' + extraClass : '');
    menu.setAttribute('role', 'menu');
    items.forEach(function (item) {
      var link = document.createElement('a');
      link.href = item[0];
      link.textContent = item[1];
      link.setAttribute('role', 'menuitem');
      menu.appendChild(link);
    });
    return menu;
  }

  function addDropdown(anchor, items, label, extraClass) {
    if (!anchor || anchor.dataset.dropdownReady) return;
    var parent = anchor.parentElement;
    if (!parent) return;
    parent.classList.add('site-dropdown');
    anchor.dataset.dropdownReady = 'true';
    anchor.setAttribute('aria-haspopup', 'true');
    anchor.setAttribute('aria-expanded', 'false');
    if (label) anchor.textContent = label;
    parent.appendChild(makeSubmenu(items, extraClass));
    parent.addEventListener('mouseenter', function () { anchor.setAttribute('aria-expanded', 'true'); });
    parent.addEventListener('mouseleave', function () { anchor.setAttribute('aria-expanded', 'false'); });
    parent.addEventListener('focusout', function (event) {
      if (!parent.contains(event.relatedTarget)) anchor.setAttribute('aria-expanded', 'false');
    });
  }

  function enhanceNavigation() {
    var nav = document.querySelector('nav.sticky') || document.querySelector('header nav');
    if (!nav) return;
    addDropdown(nav.querySelector('a[href="/uslugi"]'), serviceItems, null, 'site-dropdown__menu--services');
    addDropdown(nav.querySelector('a[href="/blog"]'), knowledgeItems, 'Wiedza', 'site-dropdown__menu--knowledge');
  }

  function addNanoPlaceholders() {
    if (!location.pathname.replace(/\/$/, '').endsWith('/portfolio/nano4hr')) return;
    var main = document.querySelector('#main-content');
    if (!main || main.querySelector('.nano4hr-placeholders')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'nano4hr-placeholders';
    [
      ['/images/placeholders/portfolio/nano4hr-overview.avif', 'nano4HR — widok projektu'],
      ['/images/placeholders/portfolio/nano4hr-details.avif', 'nano4HR — szczegóły projektu']
    ].forEach(function (item, index) {
      var image = document.createElement('img');
      image.src = item[0];
      image.alt = item[1];
      image.width = 1024;
      image.height = 1024;
      image.loading = index ? 'lazy' : 'eager';
      image.decoding = 'async';
      wrapper.appendChild(image);
    });
    main.appendChild(wrapper);
  }

  function run() {
    enhanceNavigation();
    addNanoPlaceholders();
  }

  run();
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
}());
