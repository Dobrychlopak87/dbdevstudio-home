(() => {
  const navItems = [
    { label: 'Studio', href: '/studio/' },
    {
      label: 'Usługi',
      href: '/uslugi/',
      items: [
        { label: 'Strony WWW', href: '/uslugi/www/' },
        { label: 'Aplikacje', href: '/uslugi/aplikacje/' },
        { label: 'Design', href: '/uslugi/design/' },
        { label: 'Marketing', href: '/uslugi/marketing/' },
      ],
    },
    { label: 'Realizacje', href: '/realizacje/' },
    { label: 'Cennik', href: '/cennik/' },
    {
      label: 'Wiedza',
      href: '/wiedza/',
      items: [
        { label: 'Słownik pojęć', href: '/wiedza/slownik/' },
        { label: 'Artykuły', href: '/wiedza/' },
      ],
    },
    { label: 'FAQ', href: '/faq/' },
    { label: 'Kontakt', href: '/kontakt/' },
  ];

  const normalize = (path) => {
    if (!path) return '/';
    const clean = path.split('#')[0].split('?')[0];
    if (clean === '/') return '/';
    return clean.replace(/\/$/, '') + '/';
  };

  const createLink = ({ label, href }, className = 'site-nav__link') => {
    const link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = label;
    return link;
  };

  const markActiveLinks = (header) => {
    const current = normalize(window.location.pathname);
    header.querySelectorAll('a[href]').forEach((link) => {
      const href = normalize(link.getAttribute('href'));
      const active = href === current || (href !== '/' && current.startsWith(href));
      link.toggleAttribute('aria-current', active && href === current);
      link.classList.toggle('is-active', active);
    });
  };

  const closeMobileNav = (header) => {
    header.classList.remove('is-open');
    const button = header.querySelector('.site-nav-toggle');
    if (button) button.setAttribute('aria-expanded', 'false');
  };

  const enhanceNavigation = () => {
    if (document.querySelector('.site-header')) return;

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = '<div class="site-header__inner"><a class="site-brand" href="/" aria-label="DBDEVSTUDIO — strona główna"><span class="site-brand__mark" aria-hidden="true">DB</span><span class="site-brand__text">DBDEVSTUDIO</span></a><button class="site-nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="site-nav-toggle__bar"></span><span class="site-nav-toggle__bar"></span><span class="site-nav-toggle__bar"></span><span class="sr-only">Menu</span></button><nav id="site-nav" class="site-nav" aria-label="Główna nawigacja"></nav></div>';

    const nav = header.querySelector('.site-nav');
    navItems.forEach((item) => {
      if (!item.items) {
        nav.append(createLink(item));
        return;
      }

      const group = document.createElement('div');
      group.className = 'site-nav__group';
      const trigger = createLink(item, 'site-nav__link site-nav__link--dropdown');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.insertAdjacentHTML('beforeend', '<span class="site-nav__chevron" aria-hidden="true">⌄</span>');

      const dropdown = document.createElement('div');
      dropdown.className = 'site-nav__dropdown';
      item.items.forEach((subItem) => dropdown.append(createLink(subItem, 'site-nav__dropdown-link')));
      group.append(trigger, dropdown);
      nav.append(group);

      group.addEventListener('mouseenter', () => trigger.setAttribute('aria-expanded', 'true'));
      group.addEventListener('mouseleave', () => trigger.setAttribute('aria-expanded', 'false'));
      group.addEventListener('focusin', () => trigger.setAttribute('aria-expanded', 'true'));
      group.addEventListener('focusout', (event) => {
        if (!group.contains(event.relatedTarget)) trigger.setAttribute('aria-expanded', 'false');
      });
    });

    header.querySelector('.site-nav-toggle').addEventListener('click', () => {
      const open = !header.classList.contains('is-open');
      header.classList.toggle('is-open', open);
      header.querySelector('.site-nav-toggle').setAttribute('aria-expanded', String(open));
    });

    header.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMobileNav(header);
    });

    markActiveLinks(header);
    const skipLink = document.querySelector('.skip-link');
    (skipLink || document.body.firstChild)?.after(header);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceNavigation, { once: true });
  } else {
    enhanceNavigation();
  }
})();
