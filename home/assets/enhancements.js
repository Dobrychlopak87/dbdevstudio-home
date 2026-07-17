(()=>{
  function connectLabels(root=document){
    root.querySelectorAll('label:not([for])').forEach((label,i)=>{
      const field=label.parentElement?.querySelector('input,select,textarea');
      if(field){ if(!field.id) field.id='field-'+Math.random().toString(36).slice(2,9); label.htmlFor=field.id; }
    });
  }
  connectLabels();

  /* ---- Podmenu nawigacji: Usługi / Wiedza --------------------------------
     Minimalna ingerencja: istniejące linki menu zostają nietknięte,
     do ich kontenera dokładany jest wyłącznie panel <ul.nav-dropdown>.
     Etykiety pochodzą z nagłówków (h1) istniejących podstron serwisu.
  ------------------------------------------------------------------------- */
  const SUBMENU={
    '/uslugi':[
      ['Strony WWW','/uslugi/www'],
      ['Aplikacje','/uslugi/aplikacje'],
      ['Design','/uslugi/design'],
      ['Marketing','/uslugi/marketing']
    ],
    '/wiedza':[
      ['Słownik pojęć','/wiedza/slownik'],
      ['Restauracja: menu online i zamówienia','/wiedza/restauracja-menu-online-zamowienia'],
      ['Sklep osiedlowy vs sieciówka','/wiedza/sklep-osiedlowy-vs-sieciowka'],
      ['Skrzynka firmowa, podpis i marketing','/wiedza/skrzynka-firmowa-podpis-i-marketing'],
      ['Strona Www Dla Salonu Fryzjerskiego','/wiedza/strona-www-dla-salonu-fryzjerskiego'],
      ['Warsztat Samochodowy Strona Www','/wiedza/warsztat-samochodowy-strona-www'],
      ['Wlasna Domena I Email Firmowy','/wiedza/wlasna-domena-i-email-firmowy']
    ]
  };
  function enhanceNavDropdowns(){
    Object.keys(SUBMENU).forEach((base)=>{
      let links;
      try{ links=document.querySelectorAll('nav:not([aria-label="Okruszki"]) a[href="'+base+'"], nav:not([aria-label="Okruszki"]) a[href="'+base+'/"]'); }catch(e){ return; }
      links.forEach((link)=>{
        if(link.closest('footer')||link.closest('.nav-dropdown')) return;
        const parent=link.parentElement;
        if(!parent||parent.dataset.navDropdown) return;
        parent.dataset.navDropdown='1';
        parent.classList.add('nav-has-dropdown');
        link.classList.add('nav-parent-link');
        link.setAttribute('aria-haspopup','true');
        link.setAttribute('aria-expanded','false');
        const ul=document.createElement('ul'); ul.className='nav-dropdown';
        SUBMENU[base].forEach(([label,href])=>{
          const li=document.createElement('li');
          const a=document.createElement('a'); a.href=href; a.textContent=label;
          li.append(a); ul.append(li);
        });
        parent.append(ul);
        const sync=()=>link.setAttribute('aria-expanded',(parent.matches(':hover')||parent.matches(':focus-within'))?'true':'false');
        parent.addEventListener('mouseenter',sync);
        parent.addEventListener('mouseleave',sync);
        parent.addEventListener('focusin',sync);
        parent.addEventListener('focusout',sync);
      });
    });
  }
  enhanceNavDropdowns();

  new MutationObserver(()=>{connectLabels(); enhanceNavDropdowns();}).observe(document.documentElement,{childList:true,subtree:true});

  const routes={
    '/':'DBDEVSTUDIO — strony, aplikacje i marketing digital','/studio':'Studio — DBDEVSTUDIO','/uslugi':'Usługi cyfrowe — DBDEVSTUDIO','/realizacje':'Portfolio — DBDEVSTUDIO','/cennik':'Cennik netto i brutto — DBDEVSTUDIO','/wiedza':'Wiedza — DBDEVSTUDIO','/faq':'FAQ — DBDEVSTUDIO','/kontakt':'Kontakt i bezpłatna wycena — DBDEVSTUDIO'
  };
  function seo(){
    const path=location.pathname.replace(/\/$/,'')||'/'; const url='https://dbdevstudio.pl'+(path==='/'?'/':path+'/');
    document.title=routes[path]||document.title;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',url);
    document.querySelector('link[hreflang="pl"]')?.setAttribute('href',url);
    document.querySelector('link[hreflang="en"]')?.setAttribute('href',url+'?lang=en');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',url);
  }
  addEventListener('popstate',seo); document.addEventListener('click',e=>{if(e.target.closest('a[href^="/"]'))setTimeout(seo,20)}); seo();

  function cookieDialog(){
    document.querySelector('#cookie-dialog')?.remove(); const saved=JSON.parse(localStorage.getItem('cookieCategories')||'{}');
    const dialog=document.createElement('dialog'); dialog.id='cookie-dialog'; dialog.setAttribute('aria-labelledby','cookie-title');
    dialog.style.cssText='max-width:480px;border:1px solid #2e2e36;border-radius:16px;padding:24px;background:#24242a;color:#e2e2e8;font:14px Inter,sans-serif;box-shadow:0 20px 80px #000a';
    dialog.innerHTML='<h2 id="cookie-title">Ustawienia cookies</h2><p>Wybierz opcjonalne kategorie. Niezbędne pliki są zawsze aktywne.</p><p><label><input type="checkbox" checked disabled> Niezbędne</label></p><p><label><input id="cookies-analytics" type="checkbox" '+(saved.analytics?'checked':'')+'> Analityczne</label></p><p><label><input id="cookies-marketing" type="checkbox" '+(saved.marketing?'checked':'')+'> Marketingowe</label></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="cookies-save">Zapisz wybór</button><button id="cookies-reject">Odrzuć opcjonalne</button><button id="cookies-close">Anuluj</button></div>';
    document.body.append(dialog); dialog.showModal();
    dialog.querySelectorAll('button').forEach(b=>b.style.cssText='padding:10px 14px;border:0;border-radius:99px;font-weight:700;cursor:pointer');
    dialog.querySelector('#cookies-save').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:dialog.querySelector('#cookies-analytics').checked,marketing:dialog.querySelector('#cookies-marketing').checked}));localStorage.setItem('cookieConsent','custom');localStorage.setItem('dbdev-cookies-consent','custom');dialog.close();location.reload()};
    dialog.querySelector('#cookies-reject').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:false,marketing:false}));localStorage.setItem('cookieConsent','necessary');localStorage.setItem('dbdev-cookies-consent','necessary');dialog.close();location.reload()};
    dialog.querySelector('#cookies-close').onclick=()=>dialog.close(); dialog.addEventListener('close',()=>dialog.remove());
  }
  addEventListener('cookie-settings',cookieDialog);
})();
