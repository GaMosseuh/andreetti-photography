/* PORTFOLIO — galerie, filtres, lightbox
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* ---------- CONSTRUCTION GALERIE ---------- */
/* état de la pagination du portfolio (déclaré AVANT buildMasonry qui appelle renderPortfolio) */
var PF_STEP = 9, pfFilter = 'all', pfShown = PF_STEP;
(function buildMasonry(){
  var m = document.getElementById('masonry');
  PHOTOS.forEach(function(p,i){
    var btn = document.createElement('button');
    btn.type='button';
    btn.className='masonry-item fade-in';
    btn.dataset.category=p.cat;
    // p.nowmark : la photo a déjà un © incrusté (fichier retouché) -> ne pas en rajouter un
    if(p.nowmark) btn.dataset.nowmark='1';
    btn.style.transitionDelay=(Math.min(i,8)*0.05)+'s'; // apparition en cascade
    btn.setAttribute('aria-label','Agrandir une photo '+CAT_LABEL[p.cat]);
    /* On memorise l adresse de la photo SUR la vignette. La visionneuse s en sert
       directement au lieu de recopier l image de la grille : une vignette encore en
       chargement differe (loading=lazy) faisait afficher "IMAGE A VENIR" a tort. */
    btn.dataset.photo = 'images/portfolio/'+p.file.replace(/[.]jpg$/,'')+'.webp';
    btn.dataset.photoAlt = (p.alt||CAT_ALT[p.cat]||CAT_LABEL[p.cat]);
    var base='images/portfolio/'+p.file.replace(/\.jpg$/,'');
    btn.innerHTML =
      '<div class="media" style="height:'+p.h+'px">'+
        '<div class="ph '+PH_CLASS[p.cat]+'"><span class="lbl">'+CAT_LABEL[p.cat]+'</span></div>'+
        '<img src="'+base+'.webp" data-fallback="'+base+'.jpg" alt="'+(p.alt||CAT_ALT[p.cat]||CAT_LABEL[p.cat])+'" loading="lazy" decoding="async" data-img>'+
        /* plus de <span> filigrane ici : il est pose par CSS (::after) sur .media,
           ce qui le rend independant de l ordre des balises. Voir styles.css. */
        '<span class="zoom-ic" aria-hidden="true">⤢</span>'+
      '</div>';
    btn.addEventListener('click', function(){ openLightbox(btn); });
    m.appendChild(btn);
  });
  renderPortfolio(); // applique la limite initiale (pagination « Voir plus »)
})();

/* ---------- FILTRE PORTFOLIO + PAGINATION « VOIR PLUS » ---------- */
/* PF_STEP, pfFilter, pfShown sont initialisés plus haut (avant buildMasonry) */
function renderPortfolio(){
  var items = [].slice.call(document.querySelectorAll('.masonry-item'));
  var count = 0, total = 0;
  items.forEach(function(item){
    var match = (pfFilter==='all' || item.dataset.category===pfFilter);
    /* data-match distingue "ecartee par le filtre" de "pas encore affichee par la
       pagination". La visionneuse navigue sur data-match, donc sur TOUTES les photos
       de la categorie, meme celles pas encore revelees par "Voir plus". */
    item.dataset.match = match ? '1' : '0';
    if(match){
      total++;
      var within = (count < pfShown);
      if(within) count++;
      item.classList.toggle('hidden', !within);
      if(within) item.classList.add('visible'); // un item ré-affiché ne doit pas rester invisible
    } else {
      item.classList.add('hidden');
    }
  });
  var more = document.getElementById('voirPlus');
  if(more){
    var reste = (total > pfShown);
    more.style.display = reste ? 'inline-block' : 'none';
    /* CORRECTION 26/08 : le conteneur du bouton garde un padding bas de 64 px. Une fois
       toutes les photos affichees, cela laissait un grand vide sous la grille. On masque
       donc le conteneur lui-meme, pas seulement le bouton. */
    if(more.parentElement) more.parentElement.style.display = reste ? '' : 'none';
  }
}
function filterPortfolio(cat, btn){
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
  btn.setAttribute('aria-pressed','true');
  pfFilter = cat;
  pfShown = PF_STEP;
  renderPortfolio();
}
function voirPlus(){ pfShown += PF_STEP; renderPortfolio(); }

/* ---------- LIGHTBOX ---------- */
var lbItems = [], lbIdx = 0, lastFocus = null;
var lbAttente = null, lbJeton = 0; // minuteur du rond de chargement + numero de la navigation en cours
var lightbox = document.getElementById('lightbox');
var lbImg = document.getElementById('lightboxImg');
var lbFallback = document.getElementById('lbFallback');
var lbMedia = document.getElementById('lbMedia'); // bloc qui épouse la photo (porte le filigrane)
var lbCaption = document.getElementById('lbCaption');

/* Avant : '.masonry-item:not(.hidden)' -> ne renvoyait que les 9 photos affichees par
   la pagination. Avec 33 photos, la visionneuse tournait donc en rond sur 9 (bug
   constate le 19/08). Desormais : toutes les photos de la categorie active. */
function getVisibleItems(){ return [].slice.call(document.querySelectorAll('.masonry-item[data-match="1"]')); }
function openLightbox(el){
  lbItems = getVisibleItems();
  if(!lbItems.length) return;
  lbIdx = lbItems.indexOf(el); if(lbIdx<0) lbIdx=0;
  lastFocus = document.activeElement;
  updateLightbox();
  lightbox.classList.add('open');
  masquerFond(true);
  document.body.style.overflow='hidden';
  document.querySelector('.lightbox-close').focus();
}
/* Masque le reste de la page aux lecteurs d'écran pendant que la photo est
   ouverte (sinon ils continuent de lire le contenu situé derrière).
   Avant la refonte, le site entier était dans un <div id="app"> qui n'existe
   plus : on cible désormais <main>, la nav et le pied de page. */
function masquerFond(masquer){
  document.querySelectorAll('main, .nav, .footer, .mobile-menu').forEach(function(el){
    if(masquer) el.setAttribute('aria-hidden','true');
    else el.removeAttribute('aria-hidden');
  });
}
function closeLightbox(){
  lightbox.classList.remove('open');
  masquerFond(false);
  document.body.style.overflow='';
  resetZoom();
  lbImg.removeAttribute('src');
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
function navLightbox(dir){
  lbItems = getVisibleItems();
  if(!lbItems.length) return;
  lbIdx = (lbIdx + dir + lbItems.length) % lbItems.length;
  updateLightbox();
}
function updateLightbox(){
  var item = lbItems[lbIdx];
  if(!item) return;
  resetZoom();
  var capTxt = CAT_LABEL[item.dataset.category] || '';
  lbCaption.textContent = capTxt;
  var wmark = document.getElementById('lbWmark');

  /* On charge la photo depuis l adresse memorisee sur la vignette, et NON depuis
     l image de la grille : celle-ci peut ne pas encore etre chargee (loading=lazy),
     ce qui faisait afficher "IMAGE A VENIR" sur des photos qui existent pourtant. */
  var src = item.dataset.photo;
  if(!src){ montrerPlaceholder(item); return; }

  lbFallback.style.display='none';
  if(lbMedia) lbMedia.style.display='inline-block';
  lbImg.style.display='block';
  lbImg.alt = item.dataset.photoAlt || capTxt;
  /* .no-wm : cette photo a deja un (c) incruste dans le fichier -> pas de second. */
  if(lbMedia) lbMedia.classList.toggle('no-wm', item.dataset.nowmark==='1');
  if(wmark) wmark.style.display='none'; // remplace par le ::after de .lb-media

  /* Indicateur de chargement : il n apparait qu au-dela de 250 ms, pour ne pas
     clignoter sur les photos deja en cache. */
  /* CORRECTION 26/08 : le rond de chargement restait a tourner indefiniment sur une
     photo pourtant affichee, des qu on enchainait vite les fleches. Chaque appel
     creait SON minuteur local : celui d une navigation deja abandonnee se declenchait
     apres coup et rallumait le rond, sans plus personne pour l eteindre.
     On partage donc UN seul minuteur, et un numero de navigation (lbJeton) fait
     ignorer tout ce qui revient d une photo qu on a deja quittee. */
  var jeton = ++lbJeton;
  clearTimeout(lbAttente);
  lbAttente = setTimeout(function(){ if(jeton === lbJeton) lightbox.classList.add('loading'); }, 250);
  function fini(){
    if(jeton !== lbJeton) return;      // reponse d une photo abandonnee : on l ignore
    clearTimeout(lbAttente);
    lightbox.classList.remove('loading');
  }

  lbImg.onload  = function(){ fini(); precharger(); };
  lbImg.onerror = function(){ fini(); montrerPlaceholder(item); };
  if(lbImg.getAttribute('src') === src){ fini(); precharger(); }
  else { lbImg.src = src; }
}

/* Precharge UNIQUEMENT la photo suivante et la precedente : de quoi supprimer le
   temps blanc au changement, sans charger tout le portfolio (quota Netlify). */
function precharger(){
  if(!lbItems.length) return;
  [1,-1].forEach(function(d){
    var v = lbItems[(lbIdx + d + lbItems.length) % lbItems.length];
    if(v && v.dataset.photo){ var im = new Image(); im.src = v.dataset.photo; }
  });
}

/* Repli : uniquement si la photo est reellement introuvable. */
function montrerPlaceholder(item){
  var wmark = document.getElementById('lbWmark');
  if(wmark) wmark.style.display='none';
  if(lbMedia) lbMedia.style.display='none';
  lbImg.removeAttribute('src'); lbImg.style.display='none';
  var ph = item.querySelector('.ph');
  lbFallback.className='lb-fallback '+(ph?ph.className.replace('ph ',''):'ph-portrait');
  lbFallback.style.display='flex';
  var media = item.querySelector('.media');
  var w = media ? media.offsetWidth : 3, h = media ? media.offsetHeight : 2;
  lbFallback.style.aspectRatio = w + ' / ' + h;
  if(h > w){ lbFallback.style.height = '78vh'; lbFallback.style.width = 'auto'; }
  else { lbFallback.style.height = 'auto'; lbFallback.style.width = 'min(86vw, 560px)'; }
}
/* clavier + piège de focus dans la lightbox */
document.addEventListener('keydown', function(e){
  if(!lightbox.classList.contains('open')) return;
  if(e.key==='Escape'){ closeLightbox(); return; }
  if(e.key==='ArrowLeft'){ navLightbox(-1); return; }
  if(e.key==='ArrowRight'){ navLightbox(1); return; }
  if(e.key==='Tab'){
    var f = lightbox.querySelectorAll('button');
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});
lightbox.addEventListener('click', function(e){ if(e.target===lightbox || e.target.classList.contains('lightbox-stage')) closeLightbox(); });

/* ---------- ZOOM LIBRE dans la lightbox (molette / double-clic / glisser) ---------- */
var lbScale=1, lbX=0, lbY=0, lbDrag=false, lbSX=0, lbSY=0;
function applyZoom(){
  lbImg.style.transform = 'translate('+lbX+'px,'+lbY+'px) scale('+lbScale+')';
  lbImg.style.cursor = lbScale>1 ? 'grab' : 'zoom-in';
}
function resetZoom(){ lbScale=1; lbX=0; lbY=0; lbImg.style.transform='none'; lbImg.style.cursor='zoom-in'; }
lbImg.addEventListener('wheel', function(e){
  if(lbImg.style.display==='none') return;
  e.preventDefault();
  lbScale = Math.min(4, Math.max(1, lbScale + (e.deltaY<0?0.25:-0.25)));
  if(lbScale===1){ lbX=0; lbY=0; }
  applyZoom();
}, {passive:false});
lbImg.addEventListener('dblclick', function(e){
  if(lbImg.style.display==='none') return;
  if(lbScale>1){ resetZoom(); } else { lbScale=2.2; applyZoom(); }
});
lbImg.addEventListener('mousedown', function(e){ if(lbScale<=1) return; lbDrag=true; lbSX=e.clientX-lbX; lbSY=e.clientY-lbY; lbImg.style.cursor='grabbing'; e.preventDefault(); });
window.addEventListener('mousemove', function(e){ if(!lbDrag) return; lbX=e.clientX-lbSX; lbY=e.clientY-lbSY; applyZoom(); });
window.addEventListener('mouseup', function(){ if(lbDrag){ lbDrag=false; if(lbScale>1) lbImg.style.cursor='grab'; } });

/* ---------- PARTAGE D'UNE PHOTO (Web Share API + repli copie du lien) ---------- */
/* sharePhoto() supprimee : le partage se fait desormais uniquement depuis la barre
   du haut (window.sharePage dans common.js), avec un texte adapte a chaque page. */

/* ---------- MICRODONNÉES IMAGES (SEO Google Images + © affirmé) ---------- */
(function(){
  try{
    var base='https://andreettiphoto.fr/images/portfolio/';
    var imgs=PHOTOS.map(function(p){ return {"@type":"ImageObject",contentUrl:base+p.file.replace(/\.jpg$/,'.webp'),creator:{"@type":"Person",name:"Alexandre Andreetti"},copyrightNotice:"© ANDREETTI",creditText:"ANDREETTI",license:"https://andreettiphoto.fr/mentions-legales.html"}; });
    var ld={"@context":"https://schema.org","@type":"ImageGallery",name:"Portfolio — ANDREETTI",author:{"@type":"Person",name:"Alexandre Andreetti"},image:imgs};
    var s=document.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
  }catch(e){}
})();

/* ---------- FILTRE DEPUIS L'URL ----------
   Les cartes de l'accueil pointent vers portfolio.html?cat=sport : on applique le filtre. */
(function(){
  var cat = new URLSearchParams(location.search).get('cat');
  if(!cat) return;
  var btn = [].slice.call(document.querySelectorAll('.filter-btn')).filter(function(b){ return b.dataset.filter === cat; })[0];
  if(btn) filterPortfolio(cat, btn);
})();


/* ═══════════ GESTES TACTILES DANS LA VISIONNEUSE (ajouté le 21/08/2026) ═══════════
   Avant, sur téléphone, seules les flèches permettaient de changer de photo et le
   zoom n'existait pas. Désormais :
     • pincement à deux doigts .......... zoome / dézoome
     • glissement à un doigt, zoomé ..... déplace la photo
     • balayage à un doigt, non zoomé ... photo suivante / précédente
     • double-tap ....................... remet au zoom normal
   Le balayage ne change de photo QUE si l'on est au zoom normal : sinon il déplacerait
   la photo, ce qui est le geste attendu quand on est zoomé. */
(function(){
  if(!lbImg) return;
  var d0=0, s0=1, doigts=0, xDep=0, yDep=0, tDep=0, dernierTap=0, aBouge=false;

  function distance(t){
    var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY;
    return Math.sqrt(dx*dx+dy*dy);
  }

  lbImg.addEventListener('touchstart', function(e){
    doigts = e.touches.length;
    aBouge = false;
    if(doigts===2){ d0=distance(e.touches); s0=lbScale; }
    else if(doigts===1){
      xDep=e.touches[0].clientX; yDep=e.touches[0].clientY; tDep=Date.now();
      if(lbScale>1){ lbSX=xDep-lbX; lbSY=yDep-lbY; }
      /* double-tap : deux appuis rapprochés -> retour au zoom normal */
      var maintenant=Date.now();
      if(maintenant-dernierTap < 300){ resetZoom(); dernierTap=0; }
      else dernierTap=maintenant;
    }
  }, {passive:true});

  lbImg.addEventListener('touchmove', function(e){
    aBouge = true;
    if(e.touches.length===2 && d0>0){
      e.preventDefault();                       // empêche le zoom de la page entière
      var f = distance(e.touches)/d0;
      lbScale = Math.min(4, Math.max(1, s0*f));
      if(lbScale===1){ lbX=0; lbY=0; }
      applyZoom();
    } else if(e.touches.length===1 && lbScale>1){
      e.preventDefault();                       // on déplace la photo, pas la page
      lbX = e.touches[0].clientX - lbSX;
      lbY = e.touches[0].clientY - lbSY;
      applyZoom();
    }
  }, {passive:false});

  lbImg.addEventListener('touchend', function(e){
    /* balayage : uniquement au zoom normal, un seul doigt, geste franc et rapide */
    if(doigts===1 && lbScale<=1 && aBouge && e.changedTouches.length){
      var dx = e.changedTouches[0].clientX - xDep;
      var dy = e.changedTouches[0].clientY - yDep;
      var duree = Date.now()-tDep;
      if(Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)*1.5 && duree < 700){
        navLightbox(dx < 0 ? 1 : -1);           // vers la gauche = photo suivante
      }
    }
    doigts = e.touches.length;
    if(doigts===0){ d0=0; }
  }, {passive:true});
})();

/* ORDINATEUR : un clic zoome, un second declique. Le curseur indique l etat.
   (Avant, il fallait double-cliquer et rien n indiquait que c etait possible.)
   On ne l active que sur les appareils avec un vrai pointeur, pour ne pas entrer
   en conflit avec les gestes tactiles ci-dessus. */
(function(){
  if(!lbImg) return;
  var pointeurFin = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!pointeurFin) return;
  function majCurseur(){ lbImg.style.cursor = lbScale>1 ? 'zoom-out' : 'zoom-in'; }
  lbImg.addEventListener('click', function(e){
    e.stopPropagation();               // ne pas fermer la visionneuse
    if(lbScale>1){ resetZoom(); } else { lbScale=2.2; applyZoom(); }
    majCurseur();
  });
  lbImg.addEventListener('mouseenter', majCurseur);
})();
