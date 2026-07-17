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
    btn.style.transitionDelay=(Math.min(i,8)*0.05)+'s'; // apparition en cascade
    btn.setAttribute('aria-label','Agrandir une photo '+CAT_LABEL[p.cat]);
    var base='images/portfolio/'+p.file.replace(/\.jpg$/,'');
    btn.innerHTML =
      '<div class="media" style="height:'+p.h+'px">'+
        '<div class="ph '+PH_CLASS[p.cat]+'"><span class="lbl">'+CAT_LABEL[p.cat]+'</span></div>'+
        '<img src="'+base+'.webp" data-fallback="'+base+'.jpg" alt="Photographie '+CAT_LABEL[p.cat]+'" loading="lazy" decoding="async" data-img>'+
        '<span class="wmark">© ANDREETTI</span>'+
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
  if(more) more.style.display = (total > pfShown) ? 'inline-block' : 'none';
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
var lightbox = document.getElementById('lightbox');
var lbImg = document.getElementById('lightboxImg');
var lbFallback = document.getElementById('lbFallback');
var lbCaption = document.getElementById('lbCaption');

function getVisibleItems(){ return [].slice.call(document.querySelectorAll('.masonry-item:not(.hidden)')); }
function openLightbox(el){
  lbItems = getVisibleItems();
  if(!lbItems.length) return;
  lbIdx = lbItems.indexOf(el); if(lbIdx<0) lbIdx=0;
  lastFocus = document.activeElement;
  updateLightbox();
  lightbox.classList.add('open');
  document.getElementById('app').setAttribute('aria-hidden','true');
  document.body.style.overflow='hidden';
  document.querySelector('.lightbox-close').focus();
}
function closeLightbox(){
  lightbox.classList.remove('open');
  document.getElementById('app').removeAttribute('aria-hidden');
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
  var img = item.querySelector('img');
  var capTxt = CAT_LABEL[item.dataset.category] || '';
  lbCaption.textContent = capTxt;
  var hasReal = img && img.naturalWidth>0 && img.classList.contains('loaded');
  var wmark = document.getElementById('lbWmark');
  if(hasReal){
    lbImg.style.display='block'; lbFallback.style.display='none';
    lbImg.src = img.currentSrc || img.src; lbImg.alt = capTxt;
    if(wmark) wmark.style.display='block'; // filigrane sur les vraies photos
  } else {
    if(wmark) wmark.style.display='none';
    lbImg.removeAttribute('src'); lbImg.style.display='none';
    var ph = item.querySelector('.ph');
    lbFallback.className='lb-fallback '+(ph?ph.className.replace('ph ',''):'ph-portrait');
    lbFallback.style.display='flex';
    // le placeholder agrandi reprend la forme (ratio) de la vignette cliquée
    var media = item.querySelector('.media');
    var w = media ? media.offsetWidth : 3, h = media ? media.offsetHeight : 2;
    lbFallback.style.aspectRatio = w + ' / ' + h;
    if(h > w){ lbFallback.style.height = '78vh'; lbFallback.style.width = 'auto'; }
    else { lbFallback.style.height = 'auto'; lbFallback.style.width = 'min(86vw, 560px)'; }
  }
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
window.sharePhoto=function(){
  var btn=document.getElementById('lbShare');
  var url=location.href.split('#')[0];
  var data={title:'ANDREETTI — Photographe', text:'Photographie ANDREETTI', url:url};
  if(navigator.share){ navigator.share(data).catch(function(){}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){ if(btn){ btn.classList.add('ok'); btn.textContent='✓'; setTimeout(function(){ btn.classList.remove('ok'); btn.textContent='⤴'; },1500); } }); }
};

/* ---------- MICRODONNÉES IMAGES (SEO Google Images + © affirmé) ---------- */
(function(){
  try{
    var base='https://andreetti-photography.netlify.app/images/portfolio/';
    var imgs=PHOTOS.map(function(p){ return {"@type":"ImageObject",contentUrl:base+p.file.replace(/\.jpg$/,'.webp'),creator:{"@type":"Person",name:"Alexandre Andreetti"},copyrightNotice:"© ANDREETTI",creditText:"ANDREETTI",license:"https://andreetti-photography.netlify.app/mentions-legales.html"}; });
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

