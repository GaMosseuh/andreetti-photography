/* CONTACT — formulaire Netlify
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* ---------- FORMULAIRE (Netlify Forms) ---------- */
var form = document.getElementById('contactForm');
form.addEventListener('submit', function(e){
  // En local (file:// ou serveur de preview sans Netlify) on laisse faire le POST natif pour ne pas bloquer les tests
  if(location.protocol==='file:' || !location.hostname || location.hostname==='localhost' || location.hostname==='127.0.0.1'){ return; }
  // Navigateur très ancien sans fetch : le POST natif du formulaire fonctionne aussi (redirection merci.html)
  if(!window.fetch){ return; }
  e.preventDefault();
  var btn=document.getElementById('submitBtn');
  var fb=document.getElementById('feedback');
  btn.disabled=true; btn.textContent=tr('sending');
  fetch('/', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams(new FormData(form)).toString()
  })
    .then(function(r){ if(!r.ok) throw new Error(r.status); })
    .then(function(){
      fb.className='feedback ok'; fb.textContent=tr('feedbackOk');
      form.reset(); btn.disabled=false; btn.textContent=tr('btnSend');
    })
    .catch(function(){
      fb.className='feedback err'; fb.textContent=tr('feedbackErr');
      btn.disabled=false; btn.textContent=tr('btnSend');
    });
});

/* ---------- PRÉ-SÉLECTION DE LA PRESTATION DEPUIS L'URL ----------
   Les boutons "Demander un devis" de la page Prestations pointent vers contact.html?prestation=portrait. */
(function(){
  var p = new URLSearchParams(location.search).get('prestation');
  if(!p) return;
  var sel = document.getElementById('prestation');
  if(!sel) return;
  for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===p){ sel.selectedIndex=i; break; } }
})();

