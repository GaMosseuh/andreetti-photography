/* CONTACT — le formulaire (refait le 8 octobre 2026, v2.0)
   Le formulaire est un formulaire Netlify : Netlify recoit le message, puis previent la
   fonction netlify/functions/notify-contact.js, qui envoie le mail a Alexandre. */
"use strict";

(function(){
var form = document.getElementById('contactForm');
if(!form) return;
var select = document.getElementById('prestation');
var bouton = document.getElementById('submitBtn');
var retour = document.getElementById('feedback');

/* ---------- la prestation choisie d avance ----------
   Les boutons du site menent ici avec la prestation dans l adresse :
     /contact?prestation=portrait-etudiant   (ou portrait-essentiel, portrait-confort)
     /contact?prestation=sport               /contact?prestation=evenementiel
   On la selectionne dans la liste, pour que le visiteur n ait pas a la rechoisir. */
var cle = '';
(function(){
  var p = (new URLSearchParams(location.search).get('prestation') || '').toLowerCase();
  if(p === 'evenement' || p === 'événementiel') p = 'evenementiel';
  cle = p;
})();
function choisir(){
  if(!select || !cle) return;
  for(var i = 0; i < select.options.length; i++){
    if(select.options[i].getAttribute('data-cle') === cle){ select.selectedIndex = i; return; }
  }
}
choisir();
if(select) select.addEventListener('change', function(){ var o = select.options[select.selectedIndex]; cle = o ? (o.getAttribute('data-cle') || '') : ''; });
/* La liste est reecrite au chargement puis a chaque changement de langue (elle vient de
   assets/data.js) : on y remet a chaque fois le choix du visiteur. */
document.addEventListener('blocsremplis', choisir);

/* ---------- le message de retour : impossible a rater ---------- */
function montrer(type, texte){
  retour.className = 'retour montre' + (type === 'err' ? ' erreur' : '');
  retour.textContent = texte;
  retour.setAttribute('tabindex', '-1');
  try{
    var r = retour.getBoundingClientRect();
    if(r.top < 80 || r.bottom > window.innerHeight) retour.scrollIntoView({ block: 'center' });
  }catch(e){}
  setTimeout(function(){ try{ retour.focus({preventScroll:true}); }catch(e){} }, 100);
}

/* ---------- l envoi ---------- */
form.addEventListener('submit', function(e){
  /* En local (pas de Netlify) on laisse faire l envoi classique, pour ne pas bloquer les essais */
  if(location.protocol === 'file:' || !location.hostname || location.hostname === 'localhost' || location.hostname === '127.0.0.1'){ return; }
  if(!window.fetch){ return; }             // tres vieux navigateur : l envoi classique marche aussi (page /merci)
  e.preventDefault();
  if(bouton.disabled) return;              // un seul envoi, meme si on clique dix fois
  bouton.disabled = true; bouton.textContent = tr('sending');
  /* Avec une mauvaise connexion, l envoi peut ne JAMAIS repondre : on abandonne au bout de
     20 secondes et on le dit, pour que le visiteur puisse reessayer ou ecrire par mail. */
  var abandon = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var delai = abandon ? setTimeout(function(){ abandon.abort(); }, 20000) : null;
  var options = { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() };
  if(abandon) options.signal = abandon.signal;
  fetch('/', options)
    .then(function(r){ if(!r.ok) throw new Error(r.status); })
    .then(function(){
      clearTimeout(delai);
      montrer('ok', tr('feedbackOk'));
      form.reset(); cle = '';
      bouton.disabled = false; bouton.textContent = tr('btnSend');
    })
    .catch(function(){
      clearTimeout(delai);
      montrer('err', tr('feedbackErr'));
      bouton.disabled = false; bouton.textContent = tr('btnSend');
    });
});
})();
