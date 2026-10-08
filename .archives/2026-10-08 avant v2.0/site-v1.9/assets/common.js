/* COMMUN — chargé sur toutes les pages
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* gestion image : fondu net (blur-up) au chargement ; cascade WebP -> JPG -> placeholder */
function wireImg(img){
  function onErr(){
    var fb = img.getAttribute('data-fallback');
    if(fb){ img.removeAttribute('data-fallback'); img.src = fb; } // essaie le .jpg si le .webp manque
    else { img.style.display='none'; }                            // sinon : placeholder coloré
  }
  function onLoad(){
    if(img.naturalWidth<=0) return;
    img.classList.add('loaded');
    // dans le portfolio : la tuile prend le ratio naturel de la photo (aucune coupe)
    var item = img.closest('.masonry-item');
    if(item){ var m = item.querySelector('.media'); if(m) m.classList.add('natural'); }
  }
  img.addEventListener('load', onLoad);
  img.addEventListener('error', onErr);
  if(img.complete){ if(img.naturalWidth>0) onLoad(); else onErr(); }
}

/* ---------- FADE-IN (observer unique + fail-open) ---------- */
var fadeObs = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
}, {threshold:0, rootMargin:'0px 0px -8% 0px'}) : null;
function revealIn(root){
  var els = root.querySelectorAll('.fade-in:not(.visible)');
  if(!fadeObs){ els.forEach(function(el){ el.classList.add('visible'); }); return; }
  els.forEach(function(el){ fadeObs.observe(el); });
  // filet de sécurité (indépendant de requestAnimationFrame, throttlé en arrière-plan) :
  // révèle les items déjà dans le viewport pour qu'aucune section affichée ne reste vide
  setTimeout(function(){ root.querySelectorAll('.fade-in:not(.visible)').forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('visible'); if(fadeObs) fadeObs.unobserve(el); }
  }); }, 250);
}

function flashProgress(){
  var p=document.getElementById('navProgress');
  if(!p) return;
  p.classList.remove('run'); void p.offsetWidth; p.classList.add('run');
}

/* ---------- MENU MOBILE ---------- */
function toggleMobile(){
  var open = document.querySelector('.mobile-menu').classList.toggle('open');
  document.querySelector('.hamburger').classList.toggle('open', open);
  document.querySelector('.hamburger').setAttribute('aria-expanded', open?'true':'false');
  document.querySelector('.hamburger').setAttribute('aria-label', open?'Fermer le menu':'Ouvrir le menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobile(){
  document.querySelector('.mobile-menu').classList.remove('open');
  document.querySelector('.hamburger').classList.remove('open');
  document.querySelector('.hamburger').setAttribute('aria-expanded','false');
  document.querySelector('.hamburger').setAttribute('aria-label','Ouvrir le menu');
  document.body.style.overflow='';
}

/* CORRECTION 26/08 : le menu mobile restait affiche quand la fenetre s elargissait.
   .mobile-menu.open{display:flex} n a aucune limite de largeur : en passant en mode
   ordinateur (rotation d une tablette, fenetre agrandie), le panneau restait par-dessus
   la page ET le defilement restait bloque (body overflow:hidden pose a l ouverture).
   Des qu on repasse au-dessus du seuil ou le bouton ☰ disparait, on referme. */
(function(){
  if(!window.matchMedia) return;
  var grandEcran = window.matchMedia('(min-width:769px)');
  function siGrandEcran(e){
    if(e.matches && document.querySelector('.mobile-menu.open')) closeMobile();
  }
  if(grandEcran.addEventListener) grandEcran.addEventListener('change', siGrandEcran);
  else if(grandEcran.addListener) grandEcran.addListener(siGrandEcran); // navigateurs anciens
})();

/* ---------- Dissuasion du téléchargement (clic droit + glisser désactivés sur les images) ---------- */
document.addEventListener('contextmenu', function(e){ if(e.target && e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('dragstart', function(e){ if(e.target && e.target.tagName==='IMG') e.preventDefault(); });

/* ---------- THÈME CLAIR / SOMBRE ---------- */
(function(){
  var root=document.documentElement;
  function syncThemeBtn(){
    var b=document.getElementById('themeToggle'); if(!b) return;
    var dark=root.getAttribute('data-theme')==='dark';
    b.textContent=dark?'☀':'☾';
    b.setAttribute('aria-label', dark?'Activer le mode clair':'Activer le mode sombre');
    b.setAttribute('title', dark?'Mode clair':'Mode sombre');
  }
  window.toggleTheme=function(){
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{ localStorage.setItem('theme',next); }catch(e){}
    syncThemeBtn();
  };
  // suit le système tant que l'utilisateur n'a pas choisi manuellement
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function(e){
      var saved; try{ saved=localStorage.getItem('theme'); }catch(err){}
      if(!saved){ root.setAttribute('data-theme', e.matches?'dark':'light'); syncThemeBtn(); }
    });
  }
  syncThemeBtn();
})();

/* ---------- BOUTON PARTAGER (injecté sur toutes les pages) ----------
   Le header est répété dans chaque page HTML. Plutôt que d'éditer 8 fichiers,
   on greffe ici un bouton « Partager » juste avant le sélecteur de thème.
   Web Share API sur mobile (partage natif) ; sinon copie de l'URL avec un ✓. */
/* Textes de partage, adaptes a chaque page. Sans ca, WhatsApp ou Facebook
   n affichent qu une URL nue. On n ajoute PAS l adresse dans le texte : la
   plupart des applications l ajoutent deja, et on aurait le lien en double. */
var PARTAGE_TEXTES = {
  accueil:     {t:"ANDREETTI Photography",                       d:"Photographe portrait, sport et événementiel à Dijon et dans l’Yonne. Devis gratuit, réponse sous 48 h."},
  portfolio:   {t:"Portfolio — ANDREETTI Photography",           d:"Les photos d’Alexandre Andreetti : portrait, sport, événementiel à Dijon et dans l’Yonne."},
  prestations: {t:"Prestations & tarifs — ANDREETTI Photography", d:"Portrait, sport, événementiel à Dijon. Devis gratuit, réponse sous 48 h, livraison sous 10 jours."},
  contact:     {t:"Contacter ANDREETTI Photography",             d:"Un projet photo à Dijon ou dans l’Yonne ? Devis gratuit, réponse sous 48 h."},
  apropos:     {t:"Alexandre Andreetti, photographe",            d:"Photographe portrait, sport et événementiel à Dijon et dans l’Yonne."},
  links:       {t:"ANDREETTI Photography",                       d:"Photographe portrait, sport et événementiel à Dijon et dans l’Yonne. Devis gratuit, réponse sous 48 h."}
};
window.sharePage=function(){
  var url  = location.href.split('#')[0];
  var page = document.body.getAttribute('data-page') || 'accueil';
  var txt  = PARTAGE_TEXTES[page] || PARTAGE_TEXTES.accueil;
  var data = {title: txt.t, text: txt.d, url: url};
  var b    = document.getElementById('shareBtn');
  function confirmer(msg){
    if(!b) return;
    var o = b.innerHTML;
    b.classList.add('ok'); b.textContent = '✓';
    b.setAttribute('title', msg); b.setAttribute('aria-label', msg);
    /* on REMET toujours le bouton dans son etat normal : sinon il reste allume. */
    setTimeout(function(){
      b.classList.remove('ok'); b.innerHTML = o;
      b.setAttribute('title','Partager'); b.setAttribute('aria-label','Partager cette page');
      if(b.blur) b.blur(); // evite le survol collant sur Android apres un appui
    }, 2000);
  }
  if(navigator.share){
    navigator.share(data).then(function(){ if(b&&b.blur) b.blur(); }).catch(function(){ if(b&&b.blur) b.blur(); });
    return;
  }
  if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){ confirmer('Lien copié'); }); }
};

(function(){
  var tt=document.getElementById('themeToggle');
  if(!tt || document.getElementById('shareBtn')) return;
  var b=document.createElement('button');
  b.id='shareBtn'; b.type='button'; b.className='nav-icon nav-share';
  b.setAttribute('aria-label','Partager cette page'); b.setAttribute('title','Partager');
  b.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.3M8.3 13.3l7.4 4.3"/></svg>';
  b.addEventListener('click', window.sharePage);
  tt.parentNode.insertBefore(b, tt);
})();

/* ---------- BOUTON FLOTTANT « Devis gratuit » + LIGNE DE CONFIANCE (toutes pages) ----------
   Conversion : un appel à l'action toujours visible (pouce sur mobile), présent partout
   SAUF sur /contact (qui EST déjà le formulaire). data-i18n sur le <span> interne
   uniquement (pas sur le <a>) pour ne pas effacer l'icône SVG lors des changements de langue. */
(function(){
  var page = document.body.getAttribute('data-page');
  if(page !== 'contact' && !document.querySelector('.float-cta')){
    var a=document.createElement('a');
    a.className='float-cta'; a.href='contact.html';
    a.setAttribute('aria-label','Demander un devis gratuit');
    a.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg><span class="fc-txt" data-i18n="floatCta">'+(window.tr?tr('floatCta'):'Devis gratuit')+'</span>';
    document.body.appendChild(a);
  }
  var tag=document.querySelector('.footer .footer-tag');
  if(tag && !document.querySelector('.foot-trust')){
    var s=document.createElement('div');
    s.className='foot-trust'; s.setAttribute('data-i18n','footTrust');
    s.textContent=(window.tr?tr('footTrust'):'Réponse sous 48 h · Devis gratuit');
    tag.insertAdjacentElement('afterend', s);
  }
})();

/* ---------- BANDEAU COOKIES (cookies essentiels uniquement) ---------- */
(function(){
  var banner=document.getElementById('cookie-banner');
  if(!banner) return;
  var ok; try{ ok=localStorage.getItem('cookie-ack'); }catch(e){}
  /* Quand le bandeau cookies est visible, il recouvrait le bouton flottant
     "Devis gratuit" en bas a droite (constate le 21/08 sur tous les ecrans <= 768 px).
     On mesure sa hauteur reelle et on remonte le bouton d autant. */
  function calerBouton(){
    var h = banner.classList.contains('show') ? banner.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--cookie-h', Math.round(h)+'px');
  }
  if(!ok){ setTimeout(function(){ banner.classList.add('show'); calerBouton(); }, 800); }
  window.addEventListener('resize', calerBouton);
  window.acceptCookies=function(){
    banner.classList.remove('show');
    calerBouton();
    try{ localStorage.setItem('cookie-ack','1'); }catch(e){}
  };
})();

/* ---------- PRELOADER (intro courte, ne bloque pas le chargement des images) ----------
   IMPORTANT (refonte multi-pages) : avant, le site était monopage, l'intro ne
   passait donc qu'une fois. Maintenant chaque onglet est une vraie page : sans
   garde-fou, l'intro se rejouerait à CHAQUE clic dans le menu (700 ms d'attente
   à chaque fois) et la navigation paraîtrait lourde.
   -> On ne la joue qu'une seule fois par visite (sessionStorage). Ensuite, la
   navigation est instantanée : seules les transitions de page (fondu + secIn)
   restent. L'intro revient à la prochaine visite. */
(function(){
  var pl=document.getElementById('preloader'); if(!pl) return;
  var dejaVue=false;
  try{ dejaVue = sessionStorage.getItem('introVue')==='1'; }catch(e){}
  if(dejaVue){ if(pl.parentNode) pl.parentNode.removeChild(pl); return; }
  function hide(){
    pl.classList.add('hide');
    try{ sessionStorage.setItem('introVue','1'); }catch(e){}
  }
  setTimeout(hide, 700);
  window.addEventListener('load', hide);
})();

/* ---------- TRANSITION DE PAGE ----------
   Le site est une SPA : passer d'une section à l'autre est animé (secIn).
   Mais aller sur une VRAIE page (links.html, mentions-legales.html) = chargement
   navigateur, donc coupure brutale. Ici on fait un fondu de sortie avant de partir ;
   la page d'arrivée fait son fondu d'entrée. Résultat : ça reste fluide. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href) return;
    if(a.target === '_blank' || a.hasAttribute('download')) return;
    if(/^(mailto:|tel:|#)/i.test(href)) return;
    if(/^https?:/i.test(href) && a.hostname !== location.hostname) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if(reduce){ location.href = href; return; }
    if(typeof flashProgress==='function') flashProgress();
    document.body.classList.add('leaving');
    setTimeout(function(){ location.href = href; }, 200);
  });
  /* si on revient via le bouton Précédent, on ne doit pas rester en fondu */
  window.addEventListener('pageshow', function(){ document.body.classList.remove('leaving'); });
})();

/* ---------- ÉTAT ACTIF DE LA NAVIGATION ----------
   Chaque page porte data-page="accueil|portfolio|..." sur <body>.
   On marque le lien correspondant dans le menu (desktop + mobile). */
(function(){
  var page = document.body.getAttribute('data-page');
  if(!page) return;
  document.querySelectorAll('.nav-links a[data-nav], .mobile-menu a[data-nav]').forEach(function(a){
    if(a.getAttribute('data-nav') === page) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
})();

/* ---------- INITIALISATION DE FIN DE PAGE ----------
   DOMContentLoaded se déclenche APRÈS l'exécution des scripts de page
   (home.js, portfolio.js…). C'est donc le seul moment où l'on est sûr que
   les images créées dynamiquement (galerie, carrousel) existent déjà.
   ATTENTION : c'est ici que TOUTES les images sont activées (fondu au
   chargement + repli si le fichier manque). Sans ça, aucune photo ne
   s'affiche sur une page. Ne pas déplacer dans un script de page. */
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('img[data-img]').forEach(wireImg);
  revealIn(document);
});
