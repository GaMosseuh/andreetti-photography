/* ACCUEIL — témoignages + carrousel
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* ---------- AVIS CLIENTS ----------
   GOOGLE_REVIEW_URL : coller ici le lien "Demander des avis" de la fiche Google Business
   (dès qu'il est renseigné, le bouton "Donner mon avis sur Google" apparaît automatiquement).
   TESTIMONIALS : copier ici les meilleurs avis reçus. source:'google' affiche l'étiquette "Avis Google".
   Exemple : {text:"Photos magnifiques, très pro !", who:"Marie L.", stars:5, source:'google'} */
var GOOGLE_REVIEW_URL = "https://g.page/r/CUqtmkfR_G4MEBM/review";
var TESTIMONIALS = [
  { text:"Alexandre a fait un travail remarquable lors de notre mariage. Il a réussi à immortaliser le plus beau jour de notre vie avec une grande technique et est resté professionnel tout au long de la soirée. Merci encore !", who:"Diane G. · Mariage", stars:5, source:'google' }
];

(function renderTestimonials(){
  var pair = document.getElementById('testiPair');
  var soon = document.getElementById('testiSoon');
  // chaque vrai avis est inséré comme une carte AVANT la carte "à venir" / le CTA,
  // dans la même rangée : on garde ainsi la mise en page équilibrée en carrés.
  if(pair && TESTIMONIALS.length){
    var html = TESTIMONIALS.map(function(t){
      var stars = t.stars ? '<div class="stars" aria-label="'+t.stars+' étoiles sur 5">'+'★'.repeat(t.stars)+'☆'.repeat(5-t.stars)+'</div>' : '';
      var src = t.source==='google' ? '<span class="gsrc">Avis Google</span>' : '';
      return '<div class="testi fade-in visible">'+stars+'<p>«&nbsp;'+t.text+'&nbsp;»</p><div class="who">'+t.who+src+'</div></div>';
    }).join('');
    if(soon) soon.insertAdjacentHTML('beforebegin', html);
  }
  // la carte « à venir » disparaît dès qu'il y a de vrais témoignages
  if(soon && TESTIMONIALS.length){ soon.classList.add('hidden'); }
  // le bouton « Donner mon avis sur Google » pointe vers la fiche
  var link = document.getElementById('reviewLink');
  if(link && GOOGLE_REVIEW_URL){ link.href = GOOGLE_REVIEW_URL; }
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
