(()=>{
  // === A11y: łączenie <label> z inputami które nie mają for/id ===
  function connectLabels(root=document){
    root.querySelectorAll('label:not([for])').forEach((label)=>{
      const field=label.parentElement?.querySelector('input,select,textarea');
      if(field){ if(!field.id) field.id='field-'+Math.random().toString(36).slice(2,9); label.htmlFor=field.id; }
    });
  }

  // === A11y: linki bez rozpoznawalnych nazw ===
  // - jeżeli link zawiera tylko ikonę / obrazek albo pusty tekst, spróbuj
  //   dodać aria-label na podstawie kontekstu (title, alt, href) tak żeby
  //   asystujące technologie miały czytelną nazwę.
  function labelIconLinks(root=document){
    root.querySelectorAll('a,button').forEach(el=>{
      if(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')) return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(text.length>0) return;
      // Weź title z pierwszego dziecka lub alt obrazka, albo href, albo aria-hidden
      const img=el.querySelector('img[alt]');
      const svg=el.querySelector('svg');
      const title=el.getAttribute('title');
      let name=title||img?.getAttribute('alt')||'';
      if(!name && svg){
        const t=svg.querySelector('title');
        if(t) name=t.textContent||'';
      }
      if(!name){
        const href=el.getAttribute('href')||'';
        if(href==='/'||href==='') name='Strona główna';
        else if(href.startsWith('mailto:')) name='Napisz e-mail';
        else if(href.startsWith('tel:')) name='Zadzwoń';
        else if(/facebook\.com/i.test(href)) name='Facebook';
        else if(/instagram\.com/i.test(href)) name='Instagram';
        else if(/linkedin\.com/i.test(href)) name='LinkedIn';
        else if(/twitter\.com|x\.com/i.test(href)) name='X / Twitter';
        else if(/youtube\.com/i.test(href)) name='YouTube';
        else if(/tiktok\.com/i.test(href)) name='TikTok';
        else if(href.startsWith('/')){
          const seg=href.replace(/\/$/,'').split('/').filter(Boolean).pop()||'strona';
          name=seg.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        }
      }
      if(name) el.setAttribute('aria-label',name);
    });
  }

  // === A11y: kolejność nagłówków ===
  // Jeżeli po <h1> pojawia się od razu <h3> (albo pomija poziomy), zamień
  // aria-level tak, żeby drzewo dostępności widziało prawidłową hierarchię
  // (nie zmieniamy widoku - CSS pozostaje taki sam).
  function fixHeadingOrder(root=document){
    const heads=[...root.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    let expected=1;
    heads.forEach(h=>{
      const lvl=+h.tagName[1];
      // dopuszczamy schodzenie w dół płynne, ale nie skoki w górę
      if(lvl>expected+1){
        // podnieś logicznie
        h.setAttribute('role','heading');
        h.setAttribute('aria-level', String(expected+1));
        expected=expected+1;
      } else {
        expected=lvl;
      }
    });
  }

  function runAll(){ connectLabels(); labelIconLinks(); fixHeadingOrder(); }
  runAll();
  new MutationObserver(runAll).observe(document.documentElement,{childList:true,subtree:true});

  // === SEO: dynamiczne <title>/canonical dla routes SPA ===
  const routes={
    '/':'DBDEVSTUDIO — strony, aplikacje i marketing digital',
    '/studio':'Studio — DBDEVSTUDIO',
    '/uslugi':'Usługi cyfrowe — DBDEVSTUDIO',
    '/uslugi/www':'Strony WWW — DBDEVSTUDIO',
    '/uslugi/aplikacje':'Aplikacje mobilne i webowe — DBDEVSTUDIO',
    '/uslugi/marketing':'Marketing i SEO — DBDEVSTUDIO',
    '/uslugi/design':'Branding i design — DBDEVSTUDIO',
    '/portfolio':'Portfolio — DBDEVSTUDIO',
    '/realizacje':'Portfolio — DBDEVSTUDIO',
    '/cennik':'Cennik netto i brutto — DBDEVSTUDIO',
    '/wiedza':'Wiedza — DBDEVSTUDIO',
    '/blog':'Blog — DBDEVSTUDIO',
    '/faq':'FAQ — DBDEVSTUDIO',
    '/kontakt':'Kontakt i bezpłatna wycena — DBDEVSTUDIO'
  };
  function seo(){
    const path=location.pathname.replace(/\/$/,'')||'/';
    const url='https://dbdevstudio.pl'+(path==='/'?'/':path+'/');
    document.title=routes[path]||document.title;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',url);
    document.querySelector('link[hreflang="pl"]')?.setAttribute('href',url);
    document.querySelector('link[hreflang="en"]')?.setAttribute('href',url+'?lang=en');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',url);
  }
  addEventListener('popstate',seo);
  document.addEventListener('click',e=>{if(e.target.closest('a[href^="/"]'))setTimeout(seo,20)});
  seo();

  // === Cookie dialog (bez zmian funkcjonalnych, tylko a11y) ===
  function cookieDialog(){
    document.querySelector('#cookie-dialog')?.remove();
    const saved=JSON.parse(localStorage.getItem('cookieCategories')||'{}');
    const dialog=document.createElement('dialog');
    dialog.id='cookie-dialog';
    dialog.setAttribute('aria-labelledby','cookie-title');
    dialog.setAttribute('aria-describedby','cookie-desc');
    dialog.style.cssText='max-width:480px;border:1px solid #555;border-radius:20px;padding:24px;background:#17171b;color:#fff;font:14px Inter,sans-serif;box-shadow:0 20px 80px #000a';
    dialog.innerHTML='<h2 id="cookie-title">Ustawienia cookies</h2>'
      +'<p id="cookie-desc">Wybierz opcjonalne kategorie. Niezbędne pliki są zawsze aktywne.</p>'
      +'<p><label><input type="checkbox" checked disabled aria-label="Niezbędne pliki cookie (zawsze aktywne)"> Niezbędne</label></p>'
      +'<p><label><input id="cookies-analytics" type="checkbox" '+(saved.analytics?'checked':'')+'> Analityczne</label></p>'
      +'<p><label><input id="cookies-marketing" type="checkbox" '+(saved.marketing?'checked':'')+'> Marketingowe</label></p>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<button id="cookies-save" type="button">Zapisz wybór</button>'
      +'<button id="cookies-reject" type="button">Odrzuć opcjonalne</button>'
      +'<button id="cookies-close" type="button">Anuluj</button>'
      +'</div>';
    document.body.append(dialog); dialog.showModal();
    dialog.querySelectorAll('button').forEach(b=>b.style.cssText='padding:10px 14px;border:0;border-radius:99px;font-weight:700;cursor:pointer');
    dialog.querySelector('#cookies-save').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:dialog.querySelector('#cookies-analytics').checked,marketing:dialog.querySelector('#cookies-marketing').checked}));localStorage.setItem('cookieConsent','custom');localStorage.setItem('dbdev-cookies-consent','custom');dialog.close();location.reload()};
    dialog.querySelector('#cookies-reject').onclick=()=>{localStorage.setItem('cookieCategories',JSON.stringify({necessary:true,analytics:false,marketing:false}));localStorage.setItem('cookieConsent','necessary');localStorage.setItem('dbdev-cookies-consent','necessary');dialog.close();location.reload()};
    dialog.querySelector('#cookies-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>dialog.remove());
  }
  addEventListener('cookie-settings',cookieDialog);
})();
