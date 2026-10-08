/* ACCUEIL — témoignages + carrousel
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* ---------- AVIS CLIENTS ----------
   Refait le 15/09/2026 (v1.9). Les avis sont dans assets/data.js (tableau AVIS) :
   ce bloc ne fait que les afficher, il n y a rien a modifier ici pour en ajouter un.
   Les cartes sont construites avec textContent, jamais innerHTML : le texte d un avis
   ne peut pas casser la page, et ses retours a la ligne sont gardes par le CSS
   (white-space:pre-line). Les etoiles sont de vrais SVG, au dore de la charte. */
(function afficherAvis(){
  var grille  = document.getElementById('avisGrille');
  var attente = document.getElementById('testiSoon');
  if(!grille) return;
  var liste = (typeof AVIS !== 'undefined' && AVIS && AVIS.length) ? AVIS : [];
  var fiche = (typeof GOOGLE_FICHE_URL !== 'undefined') ? GOOGLE_FICHE_URL : '';
  var depot = (typeof GOOGLE_AVIS_URL  !== 'undefined') ? GOOGLE_AVIS_URL  : '';
  var t = (typeof tr === 'function') ? tr : function(k){ return k; };
  var NS = 'http://www.w3.org/2000/svg';
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

  function etoile(pleine){
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if(!pleine) svg.setAttribute('class', 'vide');
    var chemin = document.createElementNS(NS, 'path');
    chemin.setAttribute('d', 'M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.4 20l1.3-6.3L3 9.4l6.4-.7z');
    svg.appendChild(chemin);
    return svg;
  }
  /* AAAA-MM-JJ -> "15 septembre 2026". Decoupage a la main : new Date("2026-09-15")
     est lu en heure UTC et peut afficher la veille selon le fuseau du visiteur. */
  function dateLisible(iso){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if(!m) return iso || '';
    var a = +m[1], mo = +m[2], j = +m[3];
    var langue = (typeof curLang !== 'undefined' && curLang) ? curLang : 'fr';
    if(langue !== 'fr'){
      try{ return new Date(Date.UTC(a, mo-1, j)).toLocaleDateString(langue, {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}); }catch(e){}
    }
    return j + ' ' + MOIS[mo-1] + ' ' + a;
  }

  liste.forEach(function(avis){
    var note = Math.max(0, Math.min(5, parseInt(avis.note, 10) || 0));
    var carte = document.createElement('figure');
    carte.className = 'testi';

    var etoiles = document.createElement('div');
    etoiles.className = 'avis-etoiles';
    etoiles.setAttribute('role', 'img');
    etoiles.setAttribute('aria-label', String(t('avisEtoiles')).replace('{n}', note));
    for(var i = 1; i <= 5; i++) etoiles.appendChild(etoile(i <= note));

    var citation = document.createElement('blockquote');
    var p = document.createElement('p');
    p.textContent = '\u00AB\u00A0' + avis.texte + '\u00A0\u00BB';   // guillemets autour, texte intact
    citation.appendChild(p);

    var legende = document.createElement('figcaption');
    var qui = document.createElement('div');
    qui.className = 'who';
    var prenom = document.createElement('span');
    prenom.className = 'avis-prenom';
    prenom.textContent = avis.prenom;
    qui.appendChild(prenom);
    if(avis.source === 'google' && fiche){
      var badge = document.createElement('a');
      badge.className = 'gsrc';
      badge.href = fiche;
      badge.target = '_blank';
      badge.rel = 'noopener noreferrer';
      badge.setAttribute('data-i18n', 'avisBadge');
      badge.textContent = t('avisBadge');
      badge.setAttribute('aria-label', t('avisBadge') + ', ' + avis.prenom + ' : ' + t('avisOuvrir'));
      qui.appendChild(badge);
    }
    legende.appendChild(qui);
    if(avis.date){
      var quand = document.createElement('time');
      quand.className = 'testi-date';
      quand.setAttribute('datetime', avis.date);
      quand.textContent = dateLisible(avis.date);
      legende.appendChild(quand);
    }

    carte.appendChild(etoiles);
    carte.appendChild(citation);
    carte.appendChild(legende);
    grille.insertBefore(carte, attente || null);
  });

  // la carte d'attente n'apparait que s'il n'y a encore aucun avis
  if(attente) attente.classList.toggle('hidden', liste.length > 0);
  var lienFiche = document.getElementById('avisFiche');
  if(lienFiche){ if(fiche) lienFiche.href = fiche; else lienFiche.hidden = true; }
  var lienDepot = document.getElementById('reviewLink');
  if(lienDepot && depot) lienDepot.href = depot;
})();

/* ---------- CONSTRUCTION CARROUSEL ---------- */
var track = document.getElementById('carouselTrack');
var dotsC = document.getElementById('carouselDots');
(function buildCarousel(){
  CAR.forEach(function(c,i){
    var slide=document.createElement('div');
    slide.className='carousel-slide';
    slide.setAttribute('role','tabpanel');
    var cbase='images/portfolio/'+c.file.replace(/\.jpg$/,'');
    var eager = i===0 ? 'eager' : 'lazy'; // pré-chargement de la 1re image visible
    slide.innerHTML =
      '<div class="media" style="position:absolute;inset:0">'+
        '<div class="ph '+PH_CLASS[c.cat]+'"><span class="mono" aria-hidden="true">A<span class="dot">.</span></span></div>'+
        /* .cblur = copie floutée de la photo, posée en fond pour combler le cadre.
           Purement décorative : alt vide + aria-hidden, sinon les lecteurs d'écran
           annonceraient DEUX FOIS la même photo. Ne pas lui mettre de texte. */
        '<img class="cblur" src="'+cbase+'.webp" data-fallback="'+cbase+'.jpg" alt="" aria-hidden="true" loading="'+eager+'" decoding="async" data-img>'+
        '<img class="cmain" src="'+cbase+'.webp" data-fallback="'+cbase+'.jpg" alt="'+(CAT_ALT[c.cat]||c.cap)+'" loading="'+eager+'" decoding="async" data-img>'+
      '</div>'+
      '<div class="carousel-caption">'+c.cap+'</div>';
    track.appendChild(slide);
    var dot=document.createElement('button');
    dot.type='button'; dot.setAttribute('role','tab');
    dot.setAttribute('aria-label','Photo '+(i+1)+' sur '+CAR.length);
    dot.setAttribute('aria-current', i===0?'true':'false');
    dot.addEventListener('click', function(){ carouselGo(i); resetAutoplay(); });
    dotsC.appendChild(dot);
  });
})();

/* (le branchement des images est désormais dans common.js, sur DOMContentLoaded :
    il doit valoir pour TOUTES les pages, pas seulement l'accueil) */

var slides = track.children;
var carouselIdx = 0;
function carouselGo(i){
  carouselIdx = (i + slides.length) % slides.length;
  track.style.transform = 'translateX(-'+(carouselIdx*100)+'%)';
  var dots = dotsC.children;
  for(var k=0;k<dots.length;k++) dots[k].setAttribute('aria-current', k===carouselIdx?'true':'false');
}
function carouselMove(dir){ carouselGo(carouselIdx+dir); resetAutoplay(); }

/* autoplay avec respect de prefers-reduced-motion + pause */
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var autoplayTimer = null, autoplayOn = !reduceMotion;
function startAutoplay(){ if(autoplayTimer || !autoplayOn) return; autoplayTimer=setInterval(function(){ if(!document.hidden) carouselGo(carouselIdx+1); },4000); }
function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer=null; } }
function resetAutoplay(){ stopAutoplay(); startAutoplay(); }
function toggleAutoplay(){
  autoplayOn=!autoplayOn;
  var b=document.getElementById('carouselPlay');
  if(autoplayOn){ b.textContent='❚❚'; b.setAttribute('aria-label','Mettre en pause le défilement'); startAutoplay(); }
  else { stopAutoplay(); b.textContent='►'; b.setAttribute('aria-label','Reprendre le défilement'); }
}
var cw=document.querySelector('.carousel-wrap');
cw.addEventListener('mouseenter', stopAutoplay);
cw.addEventListener('mouseleave', function(){ if(autoplayOn) startAutoplay(); });
document.addEventListener('visibilitychange', function(){ if(document.hidden) stopAutoplay(); else if(autoplayOn) startAutoplay(); });
if(reduceMotion){ document.getElementById('carouselPlay').textContent='►'; document.getElementById('carouselPlay').setAttribute('aria-label','Reprendre le défilement'); }
startAutoplay();
