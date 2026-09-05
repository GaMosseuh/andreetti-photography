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
  /* CORRECTION 26/08 : en zone de mauvaise reception, fetch peut ne JAMAIS repondre.
     Le bouton restait alors bloque sur "Envoi en cours" indefiniment, sans aucun moyen
     de reessayer autrement qu en rechargeant la page. On abandonne donc au bout de 20 s
     et on affiche le message d erreur, qui invite a ecrire directement par mail. */
  var horsDelai = null;
  var abandon = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  if(abandon) horsDelai = setTimeout(function(){ abandon.abort(); }, 20000);
  var options = {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams(new FormData(form)).toString()
  };
  if(abandon) options.signal = abandon.signal;
  fetch('/', options)
    .then(function(r){ if(!r.ok) throw new Error(r.status); })
    .then(function(){
      clearTimeout(horsDelai);
      afficherRetour(fb, 'ok', '✓ ' + tr('feedbackOk'));
      form.reset(); btn.disabled=false; btn.textContent=tr('btnSend');
    })
    .catch(function(){
      clearTimeout(horsDelai);
      afficherRetour(fb, 'err', '⚠ ' + tr('feedbackErr'));
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



/* Affiche le message de retour du formulaire de facon impossible a rater :
   icone, animation courte, defilement dans le champ de vision s il est hors ecran,
   et focus deplace dessus pour les lecteurs d ecran (role=status + tabindex -1). */
function afficherRetour(fb, type, texte){
  if(!fb) return;
  fb.className = 'feedback ' + type + ' show';
  fb.textContent = texte;
  fb.setAttribute('tabindex', '-1');
  try{
    var r = fb.getBoundingClientRect();
    var horsEcran = r.top < 70 || r.bottom > window.innerHeight;
    if(horsEcran) fb.scrollIntoView({behavior:'smooth', block:'center'});
  }catch(e){}
  setTimeout(function(){ try{ fb.focus({preventScroll:true}); }catch(e){} }, 120);
}
