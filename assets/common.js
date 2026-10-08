/* COMMUN — charge sur toutes les pages (refait le 8 octobre 2026, v2.0)
   Images, blocs venant des donnees, theme clair/sombre, langue, menu, partage, video.

   Ce qui a ete retire avec la v2.0, volontairement : l ecran d intro au chargement, les
   apparitions en fondu au defilement, la barre de progression, le zoom lent de la photo
   d accueil et le bandeau cookies. Rien de tout cela ne servait le visiteur. */
"use strict";

/* ---------- IMAGES ----------
   Chaque image marquee data-img apparait des qu elle est chargee. Si le fichier manque,
   on essaie le fichier de secours (data-secours), sinon le cadre reste vide, sans icone cassee.
   NE PAS DEPLACER dans un script de page : c est ce qui affiche TOUTES les images du site. */
function brancherImage(img){
  if(img.__branche) return; img.__branche = true;
  function ok(){ if(img.naturalWidth > 0) img.classList.add('charge'); }
  function ko(){
    var secours = img.getAttribute('data-secours');
    if(secours && img.getAttribute('src') !== secours){ img.removeAttribute('data-secours'); img.removeAttribute('srcset'); img.src = secours; }
    else { img.style.visibility = 'hidden'; }
  }
  img.addEventListener('load', ok);
  img.addEventListener('error', ko);
  if(img.complete){ if(img.naturalWidth > 0) ok(); else if(img.getAttribute('src')) ko(); }
}
function brancherImages(zone){ (zone || document).querySelectorAll('img[data-img]').forEach(brancherImage); }

/* ---------- BLOCS VENANT DES DONNEES ----------
   Un element qui porte data-bloc="nom:reglage" est rempli par Rendu.nom(reglage)
   (voir assets/rendu.js). C est refait quand le visiteur change de langue. */
function remplirBlocs(zone){
  if(typeof Rendu === 'undefined') return;
  (zone || document).querySelectorAll('[data-bloc]').forEach(function(el){
    var p = el.getAttribute('data-bloc').split(':');
    if(typeof Rendu[p[0]] !== 'function') return;
    var html = Rendu[p[0]](p[1]);
    el.innerHTML = html;
    brancherImages(el);
    /* une section peut dependre de son contenu : data-si-vide="cacher" sur un parent */
    var parent = el.closest('[data-cacher-si-vide]');
    if(parent) parent.hidden = !html;
  });
  /* la video : la section n existe que si un identifiant YouTube est renseigne dans data.js */
  document.querySelectorAll('[data-si="video"]').forEach(function(el){ el.hidden = !Rendu.videoPresente(); });
  /* previent les scripts de page que les blocs viennent d etre (re)ecrits */
  try{ document.dispatchEvent(new CustomEvent('blocsremplis')); }catch(e){}
}

/* ---------- THEME CLAIR / SOMBRE ---------- */
(function(){
  var root = document.documentElement;
  function sync(){
    var b = document.getElementById('boutonTheme'); if(!b) return;
    var sombre = root.getAttribute('data-theme') === 'dark';
    var texte = tr(sombre ? 'themeClair' : 'themeSombre');
    b.setAttribute('aria-label', texte); b.setAttribute('title', texte);
    b.setAttribute('aria-pressed', sombre ? 'true' : 'false');
  }
  window.basculerTheme = function(){
    var suivant = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', suivant);
    try{ localStorage.setItem('theme', suivant); }catch(e){}
    sync();
  };
  /* Le sombre est le mode par defaut pour tous les visiteurs (decision d Alexandre) : on ne
     suit pas le reglage de l appareil. Le clair n apparait que si le visiteur le choisit. */
  document.addEventListener('languechange', sync);
  window.__syncTheme = sync;
})();

/* ---------- LANGUE ----------
   Les boutons sont fabriques a partir de LANGUES_ACTIVES (assets/i18n.js) : deux ou trois
   langues donnent des boutons, davantage donnent une liste deroulante. */
function construireLangues(){
  document.querySelectorAll('[data-langues]').forEach(function(zone){
    zone.setAttribute('aria-label', tr('langueChoix'));
    if(LANGUES_ACTIVES.length < 2){ zone.hidden = true; return; }
    var html = '';
    if(LANGUES_ACTIVES.length <= 3){
      LANGUES_ACTIVES.forEach(function(c){
        html += '<button type="button" data-langue="' + c + '" lang="' + c + '" aria-pressed="' + (c === curLang ? 'true' : 'false') + '">' + (NOMS_LANGUES[c] || c.toUpperCase()) + '</button>';
      });
    } else {
      html = '<select aria-label="' + tr('langueChoix') + '">' + LANGUES_ACTIVES.map(function(c){
        return '<option value="' + c + '"' + (c === curLang ? ' selected' : '') + '>' + (NOMS_LANGUES[c] || c.toUpperCase()) + '</option>'; }).join('') + '</select>';
    }
    zone.innerHTML = html;
  });
}
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-langue]');
  if(b) window.setLang(b.getAttribute('data-langue'));
});
document.addEventListener('change', function(e){
  if(e.target.closest && e.target.closest('[data-langues]') && e.target.tagName === 'SELECT') window.setLang(e.target.value);
});
document.addEventListener('languechange', function(){
  construireLangues();
  remplirBlocs();
});

/* ---------- MENU DU TELEPHONE ---------- */
function etatMenu(ouvert){
  var menu = document.getElementById('menuMobile'), b = document.querySelector('.burger');
  if(!menu || !b) return;
  menu.classList.toggle('ouvert', ouvert);
  b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  b.setAttribute('aria-label', tr(ouvert ? 'menuFermer' : 'menuOuvrir'));
  document.documentElement.classList.toggle('menu-ouvert', ouvert);
}
window.basculerMenu = function(){ var m = document.getElementById('menuMobile'); etatMenu(!(m && m.classList.contains('ouvert'))); };
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ var m = document.getElementById('menuMobile'); if(m && m.classList.contains('ouvert')){ etatMenu(false); var b = document.querySelector('.burger'); if(b) b.focus(); } } });
/* Le menu se referme tout seul quand l ecran repasse en grand (rotation d une tablette,
   fenetre agrandie) : sinon il restait par-dessus la page et bloquait le defilement. */
(function(){
  if(!window.matchMedia) return;
  var grand = window.matchMedia('(min-width:961px)');
  var f = function(e){ if(e.matches) etatMenu(false); };
  if(grand.addEventListener) grand.addEventListener('change', f); else if(grand.addListener) grand.addListener(f);
})();

/* ---------- PARTAGER ---------- */
window.partagerPage = function(){
  var b = document.getElementById('boutonPartage');
  var url = location.href.split('#')[0];
  var desc = document.querySelector('meta[name="description"]');
  var donnees = { title: document.title, text: desc ? desc.getAttribute('content') : '', url: url };
  function fin(){ if(b && b.blur) b.blur(); }      // evite le bouton qui reste "allume" sur Android
  if(navigator.share){ navigator.share(donnees).then(fin).catch(fin); return; }
  if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(function(){
      if(!b) return;
      var avant = b.getAttribute('aria-label');
      b.classList.add('fait'); b.setAttribute('aria-label', tr('lienCopie')); b.setAttribute('title', tr('lienCopie'));
      setTimeout(function(){ b.classList.remove('fait'); b.setAttribute('aria-label', avant); b.setAttribute('title', avant); fin(); }, 2000);
    });
  }
};

/* ---------- VIDEO ----------
   Rien de YouTube n est charge avant le clic : la page reste legere, et aucun echange
   avec YouTube n a lieu tant que le visiteur n a pas choisi de lancer la video.
   youtube-nocookie.com + rel=0 : pas de pistage avant lecture, et a la fin YouTube ne
   propose pas les videos d autres chaines. */
document.addEventListener('click', function(e){
  var v = e.target.closest && e.target.closest('.video-vignette');
  if(!v) return;
  var id = v.getAttribute('data-youtube'); if(!id) return;
  var cadre = document.createElement('iframe');
  cadre.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
  cadre.title = v.getAttribute('data-titre') || tr('videoLire');
  cadre.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  cadre.allowFullscreen = true;
  cadre.setAttribute('loading', 'lazy');
  v.parentNode.replaceChild(cadre, v);
  cadre.focus();
});

/* ---------- Dissuasion du telechargement des photos (clic droit et glisser desactives) ---------- */
document.addEventListener('contextmenu', function(e){ if(e.target && e.target.tagName === 'IMG') e.preventDefault(); });
document.addEventListener('dragstart', function(e){ if(e.target && e.target.tagName === 'IMG') e.preventDefault(); });

/* ---------- DEMARRAGE ---------- */
(function(){
  function demarrer(){
    remplirBlocs();
    brancherImages();
    construireLangues();
    /* le numero de telephone : le lien « appeler » est pose ici (voir .outils/construire.js) */
    document.querySelectorAll('a.tel[data-tel]').forEach(function(a){ try{ a.href = 'tel:' + atob(a.getAttribute('data-tel')); }catch(e){} });
    if(window.__syncTheme) window.__syncTheme();
    if(typeof applyI18n === 'function' && curLang !== 'fr') applyI18n();
    var b = document.querySelector('.burger'); if(b) b.setAttribute('aria-label', tr('menuOuvrir'));
    var p = document.getElementById('boutonPartage'); if(p){ p.setAttribute('aria-label', tr('partager')); p.setAttribute('title', tr('partager')); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
