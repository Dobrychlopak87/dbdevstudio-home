/**
 * Password Reset Module
 * Handles password reset functionality for client zone
 */
(function() {
  'use strict';

  const form = document.getElementById('password-reset-form');
  const messageEl = document.getElementById('reset-message');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = form.querySelector('[name="email"]')?.value.trim();
    if (!email) {
      showMessage('Proszę podać adres e-mail.', 'error');
      return;
    }

    try {
      const response = await fetch('/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'password-reset', email })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('Link do resetu hasła został wysłany na podany adres e-mail.', 'success');
        form.reset();
      } else {
        showMessage(data.message || 'Wystąpił błąd. Spróbuj ponownie.', 'error');
      }
    } catch (err) {
      showMessage('Wystąpił błąd połączenia. Spróbuj ponownie.', 'error');
    }
  });

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    messageEl.style.display = 'block';
  }
})();
