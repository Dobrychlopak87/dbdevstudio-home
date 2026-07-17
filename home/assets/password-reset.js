/**
 * DBDEVSTUDIO - Password Reset Module v2026.07.17
 * Handles password reset with validation & UX
 */
(() => {
  'use strict';

  function init(root=document){
    const form = root.getElementById('password-reset-form');
    const msgEl = root.getElementById('reset-message');
    if (!form || form._bound) return;
    form._bound = true;

    const emailInput = form.querySelector('[name="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    function show(text, type){
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.className = 'message ' + type;
      msgEl.style.display = 'block';
      msgEl.setAttribute('role', type==='error'?'alert':'status');
    }

    function setLoading(loading){
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'Wysyłanie...' : 'Wyślij link';
    }

    function validEmail(email){
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = emailInput?.value.trim() || '';
      if (!email) { show('Proszę podać adres e-mail.', 'error'); emailInput?.focus(); return; }
      if (!validEmail(email)) { show('Podaj poprawny adres e-mail.', 'error'); emailInput?.focus(); return; }

      setLoading(true);
      try {
        const res = await fetch('/api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'password-reset', email })
        });
        if (!res.ok) throw new Error('HTTP '+res.status);
        const data = await res.json();
        if (data.success) {
          show('Jeśli e-mail istnieje w bazie, wysłaliśmy link do resetu. Sprawdź także spam. Link ważny 60 min.', 'success');
          form.reset();
        } else {
          show(data.message || 'Wystąpił błąd. Spróbuj ponownie.', 'error');
        }
      } catch (err){
        console.warn(err);
        show('Błąd połączenia. Sprawdź internet i spróbuj ponownie.', 'error');
      } finally {
        setLoading(false);
      }
    });

    // real-time validation
    emailInput?.addEventListener('input', ()=>{
      if (msgEl) msgEl.style.display='none';
    });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>init());
  else init();

  // for SPA navigation
  new MutationObserver(()=>init()).observe(document.documentElement,{childList:true,subtree:true});
})();
