const form=document.querySelector('#reset-form');
const statusEl=document.querySelector('#status');
const hasToken=new URLSearchParams(location.search).has('token');
if(hasToken){document.querySelector('#email-row').hidden=true;form.password.required=true;}else{document.querySelector('label[for="password"]').hidden=true;form.password.hidden=true;form.email.required=true;}
form?.addEventListener('submit',async(event)=>{
  event.preventDefault(); statusEl.textContent='Wysyłanie…';
  try{
    const csrf=await fetch('/api.php?action=csrf_token',{credentials:'same-origin'}).then(r=>r.json());
    const token=new URLSearchParams(location.search).get('token')||'';
    const payload=token?{token,new_password:form.password.value}:{email:form.email.value};
    const result=await fetch('/api.php?action=password_reset',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.csrf_token},body:JSON.stringify(payload)}).then(r=>r.json());
    statusEl.textContent=result.message||result.error||'Gotowe.';
    if(result.success) form.reset();
  }catch(e){statusEl.textContent='Nie udało się połączyć z serwerem.';}
});
