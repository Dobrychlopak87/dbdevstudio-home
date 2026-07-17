(()=>{
  function connectLabels(root=document){
    root.querySelectorAll('label:not([for])').forEach((label,i)=>{
      const field=label.parentElement?.querySelector('input,select,textarea');
      if(field){ if(!field.id) field.id='field-'+Math.random().toString(36).slice(2,9); label.htmlFor=field.id; }
    });
  }
  connectLabels(); new MutationObserver(()=>connectLabels()).observe(document.documentElement,{childList:true,subtree:true});

  const routes={
    '/':'DBDEVSTUDIO — strony, aplikacje i marketing digital','/studio':'Studio — DBDEVSTUDIO','/uslugi':'Usługi cyfrowe — DBDEVSTUDIO','/realizacje':'Portfolio — DBDEVSTUDIO','/cennik':'Cennik netto i brutto — DBDEVSTUDIO','/wiedza':'Wiedza — DBDEVSTUDIO','/faq':'FAQ — DBDEVSTUDIO','/kontakt':'Kontakt i bezpłatna wycena — DBDEVSTUDIO'
  };
  function setupSubmenus() {
    const nav = document.querySelector('header nav') || document.querySelector('nav');
    if (!nav) return;

    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      if (link.textContent.includes('Usługi') && !link.parentElement.classList.contains('has-dropdown')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-item relative has-dropdown';
        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(link);
        
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.innerHTML = `
          <a href="/uslugi/www" class="dropdown-item">Strony WWW</a>
          <a href="/uslugi/aplikacje" class="dropdown-item">Aplikacje</a>
          <a href="/uslugi/design" class="dropdown-item">Design</a>
          <a href="/uslugi/marketing" class="dropdown-item">Marketing</a>
        `;
        wrapper.appendChild(dropdown);
      }
      
      if (link.textContent.includes('Wiedza') && !link.parentElement.classList.contains('has-dropdown')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-item relative has-dropdown';
        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(link);
        
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.innerHTML = `
          <a href="/wiedza/slownik" class="dropdown-item">Słownik pojęć</a>
          <a href="/wiedza/sklep-osiedlowy-vs-sieciowka" class="dropdown-item">Sklep osiedlowy</a>
          <a href="/wiedza/restauracja-menu-online-zamowienia" class="dropdown-item">Restauracja online</a>
        `;
        wrapper.appendChild(dropdown);
      }
    });
  }

  const observer = new MutationObserver(() => {
    setupSubmenus();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setupSubmenus();

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
    dialog.style.cssText='max-width:480px;border:1px solid var(--color-border);border-radius:var(--radius-standard);padding:24px;background:var(--color-bg-card);color:var(--color-text);font:14px var(--font-sans);box-shadow:0 20px 80px #000a';
    dialog.innerHTML='<h2 id="cookie-title" style="margin-bottom:12px;font-family:var(--font-display)">Ustawienia cookies</h2><p style="margin-bottom:16px;color:var(--color-text-muted)">Wybierz opcjonalne kategorie. Niezbędne pliki są zawsze aktywne.</p><p style="margin-bottom:8px"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked disabled> Niezbędne</label></p><p style="margin-bottom:8px"><label style="display:flex;align-items:center;gap:8px"><input id="cookies-analytics" type="checkbox" '+(saved.analytics?'checked':'')+'> Analityczne</label></p><p style="margin-bottom:24px"><label style="display:flex;align-items:center;gap:8px"><input id="cookies-marketing" type="checkbox" '+(saved.marketing?'checked':'')+'> Marketingowe</label></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="cookies-save" style="background:var(--color-primary);color:#fff">Zapisz wybór</button><button id="cookies-reject" style="background:transparent;border:1px solid var(--color-border);color:var(--color-text)">Odrzuć opcjonalne</button><button id="cookies-close" style="background:transparent;color:var(--color-text-muted)">Anuluj</button></div>';
    document.body.append(dialog); dialog.showModal();
    dialog.querySelectorAll('button').forEach(b=>{
      b.style.cssText+=';padding:10px 18px;border-radius:99px;font-weight:700;cursor:pointer;transition:all 0.3s';
      b.onmouseover=()=>b.style.filter='brightness(1.2)';
      b.onmouseout=()=>b.style.filter='none';
    });
    dialog.querySelector('#cookies-save').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:dialog.querySelector('#cookies-analytics').checked,marketing:dialog.querySelector('#cookies-marketing').checked}));localStorage.setItem('cookieConsent','custom');localStorage.setItem('dbdev-cookies-consent','custom');dialog.close();location.reload()};
    dialog.querySelector('#cookies-reject').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:false,marketing:false}));localStorage.setItem('cookieConsent','necessary');localStorage.setItem('dbdev-cookies-consent','necessary');dialog.close();location.reload()};
    dialog.querySelector('#cookies-close').onclick=()=>dialog.close(); dialog.addEventListener('close',()=>dialog.remove());
  }
  addEventListener('cookie-settings',cookieDialog);
})();
