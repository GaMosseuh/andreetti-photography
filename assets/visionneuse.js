/* VISIONNEUSE — la photo en grand, le zoom, le deplacement, le filigrane.
   Reecrite entierement le 8 octobre 2026 (v2.0).

   POURQUOI ELLE A ETE REFAITE
   L ancienne ecoutait l evenement "click" pour zoomer et dezoomer. Or le navigateur envoie
   aussi un "click" a la FIN d un glisse : se deplacer dans une photo zoomee la dezoomait.
   Ici, aucun zoom ne depend de "click". On suit le doigt ou la souris du debut a la fin du
   geste (evenements "pointer"), et on decide a la fin : si ca a bouge de plus de quelques
   pixels c est un glisse, sinon c est un clic. UN GLISSE NE DEZOOME JAMAIS.

   CE QU ELLE FAIT
   Ordinateur : clic = zoom sur le point clique ; clic sur une photo zoomee = retour ;
                glisser = se deplacer ; molette ou pave tactile = zoom sous la souris ;
                clavier : fleches, Echap, + - 0, F (plein ecran).
   Telephone  : pincer = zoom entre les doigts ; un doigt = se deplacer (photo zoomee) ou
                changer de photo (photo entiere) ; deux touches rapides = zoom / retour.
   Partout    : la photo ne peut pas sortir de l ecran ; changer de photo ou fermer remet
                le zoom a zero ; le filigrane reste dans le coin bas droit de la partie
                VISIBLE de la photo, a taille constante, quel que soit le zoom.

   Test automatique : node .outils/test-visionneuse.js  (a relancer apres toute retouche). */
(function(){
"use strict";

var racine = document.getElementById('visio');
if(!racine) return;
var scene    = racine.querySelector('.visio-scene');
var img      = racine.querySelector('.visio-photo');
var filig    = racine.querySelector('.visio-filigrane');
var message  = racine.querySelector('.visio-message');
var legende  = racine.querySelector('.visio-legende');
var compteur = racine.querySelector('.visio-compteur');
var aide     = racine.querySelector('.visio-aide');
var bPrec    = racine.querySelector('.visio-prec');
var bSuiv    = racine.querySelector('.visio-suiv');
var bFermer  = racine.querySelector('.visio-fermer');
var bPlus    = racine.querySelector('.visio-plus');
var bMoins   = racine.querySelector('.visio-moins');
var bEcran   = racine.querySelector('.visio-ecran');

var T = (typeof tr === 'function') ? tr : function(k){ return k; };

/* reglages */
var SEUIL_SOURIS = 5;        // px : en dessous, c est un clic ; au-dessus, un glisse
var SEUIL_DOIGT  = 10;       // px : un doigt tremble plus qu une souris
var ZOOM_CLIC    = 2.5;      // niveau de zoom d un clic ou d une double touche
var DUREE        = 160;      // ms : duree du passage d un niveau de zoom a l autre
var MARGE_FILIG  = 12;       // px : ecart du filigrane avec le coin de la photo
var GOUTTIERE    = 72;       // px : place laissee aux fleches quand elles sont sur les cotes
var LARGEUR_TEL  = 700;      // px : en dessous, les fleches passent en bas (voir styles.css)

/* etat */
var liste = [], index = 0, ouvert = false, options = {}, dernierFocus = null;
var e = 1, tx = 0, ty = 0;                // echelle et decalage (px) par rapport au centre de la scene
var baseL = 0, baseH = 0;                 // taille de la photo affichee entiere
var SL = 0, SH = 0, sceneG = 0, sceneT = 0;  // taille et position de la scene
var jeton = 0, minuteur = null, charge = false, enErreur = false;
var anim = null;
var points = {}, nbPoints = 0, geste = null;
var dernierBascule = 0, dernierTap = null;
var aideMontree = false;
var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function photo(){ return liste[index] || null; }
function borne(v, min, max){ return v < min ? min : (v > max ? max : v); }
function maintenant(){ return (window.performance && performance.now) ? performance.now() : Date.now(); }

/* ---------- geometrie ---------- */
function mesurer(){
  var r = scene.getBoundingClientRect();
  SL = r.width; SH = r.height; sceneG = r.left; sceneT = r.top;
  var p = photo(); if(!p || !SL || !SH) return;
  /* Fleches sur les cotes : on leur laisse une gouttiere, la photo entiere ne passe jamais
     dessous. Sur telephone elles sont en bas, la photo prend toute la largeur. */
  var gout = SL > LARGEUR_TEL ? GOUTTIERE : 0;
  var dispoL = Math.max(60, SL - 2 * gout), dispoH = SH;
  var ratio = p.w / p.h;
  var l = Math.min(dispoL, dispoH * ratio), h = l / ratio;
  /* jamais plus grand que le fichier lui-meme : une photo agrandie devient molle.
     Sur un tres grand ecran, une photo de 1080 px de large s affiche donc a 1080 px. */
  var maxL = Math.max(p.w, p.gw || 0);
  if(l > maxL){ l = maxL; h = l / ratio; }
  baseL = l; baseH = h;
  img.style.width = l + 'px'; img.style.height = h + 'px';
  img.style.marginLeft = (-l / 2) + 'px'; img.style.marginTop = (-h / 2) + 'px';
}
/* Zoom maximum : tres fort, pour aller chercher un detail (jusqu a 5 fois les pixels du
   fichier), au moins 8 fois la photo entiere, au plus 20. Au-dela des pixels du fichier
   l image devient forcement plus douce : c est normal, il n y a pas plus de detail. */
function echelleMax(){
  var p = photo(); if(!p || !baseL) return 3;
  var maxL = Math.max(p.w, p.gw || 0);
  return borne(5 * maxL / baseL, 8, 20);
}
/* La photo ne sort jamais de la scene : si elle est plus petite que la scene dans un sens
   elle reste centree dans ce sens, sinon ses bords ne peuvent pas rentrer dans le cadre. */
function borner(){
  if(e <= 1.0005){ e = 1; tx = 0; ty = 0; return; }
  var L2 = baseL * e, H2 = baseH * e;
  var mx = Math.max(0, (L2 - SL) / 2), my = Math.max(0, (H2 - SH) / 2);
  tx = borne(tx, -mx, mx); ty = borne(ty, -my, my);
}
function appliquer(){
  borner();
  img.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + e.toFixed(4) + ')';
  placerFiligrane();
  var z = e > 1;
  racine.classList.toggle('zoome', z);
  if(bMoins) bMoins.disabled = !z;
  if(bPlus)  bPlus.disabled  = e >= echelleMax() - 0.001;
  racine.setAttribute('data-echelle', e.toFixed(3));
}
/* Le filigrane : coin bas droit de la partie VISIBLE de la photo (la photo coupee par les
   bords de la scene), avec une marge. Sa taille ne depend pas du zoom. */
function placerFiligrane(){
  if(!filig) return;
  var p = photo();
  var montrer = !!p && charge && !enErreur && !p.nowmark && document.documentElement.getAttribute('data-filigrane') !== 'off';
  if(!montrer){ filig.style.visibility = 'hidden'; return; }
  var L2 = baseL * e, H2 = baseH * e;
  var gauche = Math.max(0, SL / 2 + tx - L2 / 2), droite = Math.min(SL, SL / 2 + tx + L2 / 2);
  var haut   = Math.max(0, SH / 2 + ty - H2 / 2), bas    = Math.min(SH, SH / 2 + ty + H2 / 2);
  filig.style.right  = (SL - droite + MARGE_FILIG) + 'px';
  filig.style.bottom = (SH - bas + MARGE_FILIG) + 'px';
  filig.style.maxWidth = Math.max(0, droite - gauche - 2 * MARGE_FILIG) + 'px';
  filig.style.visibility = (droite - gauche > 90 && bas - haut > 40) ? 'visible' : 'hidden';
}

/* ---------- zoom ---------- */
function arreterAnim(){ if(anim){ cancelAnimationFrame(anim.id); anim = null; racine.removeAttribute('data-anim'); } }
/* passe en douceur a (e2, tx2, ty2). Le filigrane est replace a chaque image : il ne
   deborde jamais de la photo, meme pendant le passage. */
function allerVers(e2, tx2, ty2, immediat){
  arreterAnim();
  if(immediat || reduit){ e = e2; tx = tx2; ty = ty2; appliquer(); apresZoom(); return; }
  var e1 = e, x1 = tx, y1 = ty, t0 = maintenant();
  racine.setAttribute('data-anim', '1');
  anim = {};
  (function pas(){
    var k = Math.min(1, (maintenant() - t0) / DUREE);
    var q = 1 - Math.pow(1 - k, 3);
    e = e1 + (e2 - e1) * q; tx = x1 + (tx2 - x1) * q; ty = y1 + (ty2 - y1) * q;
    appliquer();
    if(k < 1){ anim.id = requestAnimationFrame(pas); }
    else { anim = null; racine.removeAttribute('data-anim'); e = e2; tx = tx2; ty = ty2; appliquer(); apresZoom(); }
  })();
}
/* zoome a l echelle "nouv" en gardant sous le curseur le point (px, py) de la photo.
   (px, py) sont comptes depuis le centre de la scene. */
function zoomer(nouv, px, py, doux){
  nouv = borne(nouv, 1, echelleMax());
  if(px == null){ px = 0; py = 0; }
  var k = nouv / e;
  var x2 = px - (px - tx) * k, y2 = py - (py - ty) * k;
  if(nouv <= 1.0005){ nouv = 1; x2 = 0; y2 = 0; }
  else {
    var mx = Math.max(0, (baseL * nouv - SL) / 2), my = Math.max(0, (baseH * nouv - SH) / 2);
    x2 = borne(x2, -mx, mx); y2 = borne(y2, -my, my);
  }
  if(doux) allerVers(nouv, x2, y2); else { arreterAnim(); e = nouv; tx = x2; ty = y2; appliquer(); apresZoom(); }
}
function remettreAZero(doux){ if(doux && e > 1) allerVers(1, 0, 0); else { arreterAnim(); e = 1; tx = 0; ty = 0; appliquer(); } }
function apresZoom(){ if(e > 1.2) chargerGrande(); montrerAide(); }
function versCentre(cx, cy){ return { x: cx - sceneG - SL / 2, y: cy - sceneT - SH / 2 }; }
function dansPhoto(cx, cy){
  var p = versCentre(cx, cy);
  return Math.abs(p.x - tx) <= baseL * e / 2 && Math.abs(p.y - ty) <= baseH * e / 2;
}
/* clic (souris) ou double touche (doigt) : zoome sur le point, ou revient a la photo entiere */
function basculer(cx, cy){
  var t = maintenant();
  if(t - dernierBascule < 350) return;     // un double-clic ne zoome qu une fois (sinon ca clignote)
  dernierBascule = t;
  if(e > 1){ remettreAZero(true); return; }
  var p = versCentre(cx, cy);
  zoomer(Math.min(ZOOM_CLIC, echelleMax()), p.x, p.y, true);
}

/* ---------- chargement des photos ---------- */
function source(p, grande){ return (grande && p.srcGrande) ? p.srcGrande : p.src; }
function besoinGrande(p){
  if(!p.srcGrande) return false;
  var dpr = Math.min(window.devicePixelRatio || 1, 3);
  return baseL * e * dpr > p.w * 1.08;
}
function montrer(){
  var p = photo(); if(!p) return;
  arreterAnim(); e = 1; tx = 0; ty = 0; charge = false; enErreur = false;
  img.style.visibility = 'hidden';
  message.hidden = true;
  img.alt = p.alt || '';
  legende.textContent = p.legende || '';
  compteur.textContent = liste.length > 1 ? String(T('visioCompteur')).replace('{n}', index + 1).replace('{t}', liste.length) : '';
  var seul = liste.length < 2;
  bPrec.hidden = seul; bSuiv.hidden = seul;
  mesurer(); appliquer();

  var j = ++jeton;
  clearTimeout(minuteur);
  racine.classList.remove('charge');
  /* le rond d attente n apparait qu au-dela de 250 ms : pas de clignotement sur une photo deja en memoire */
  minuteur = setTimeout(function(){ if(j === jeton) racine.classList.add('charge'); }, 250);
  var url = source(p, besoinGrande(p));
  var pre = new Image();
  pre.onload = function(){
    if(j !== jeton) return;                // on a deja change de photo : on ignore
    clearTimeout(minuteur); racine.classList.remove('charge');
    img.src = url; charge = true;
    img.style.visibility = 'visible';
    mesurer(); appliquer(); precharger();
  };
  pre.onerror = function(){
    if(j !== jeton) return;
    clearTimeout(minuteur); racine.classList.remove('charge');
    if(url !== p.src){ pre.src = url = p.src; return; }     // la grande taille manque : on prend la normale
    enErreur = true; img.removeAttribute('src'); img.style.visibility = 'hidden';
    message.textContent = T('visioErreur'); message.hidden = false;
    appliquer();
  };
  pre.src = url;
  if(typeof options.surChange === 'function'){ try{ options.surChange(p, index); }catch(err){} }
}
/* Au zoom, on passe a la grande taille si elle existe (la boite ne change pas : aucun saut) */
function chargerGrande(){
  var p = photo(); if(!p || !p.srcGrande || !charge) return;
  if(img.getAttribute('src') === p.srcGrande || p.__grandeDemandee) return;
  if(!besoinGrande(p)) return;
  p.__grandeDemandee = true;
  var j = jeton, g = new Image();
  g.onload = function(){ if(j === jeton && photo() === p) img.src = p.srcGrande; };
  g.src = p.srcGrande;
}
/* On precharge seulement la suivante et la precedente : assez pour ne pas attendre,
   sans telecharger tout le portfolio (quota Netlify). */
function precharger(){
  if(liste.length < 2) return;
  [1, -1].forEach(function(d){
    var v = liste[(index + d + liste.length) % liste.length];
    if(v && !v.__pre){ v.__pre = true; var im = new Image(); im.src = v.src; }
  });
}
function aller(dir){
  if(liste.length < 2) return;
  index = (index + dir + liste.length) % liste.length;
  montrer();
}

/* ---------- ouverture, fermeture ---------- */
function masquerFond(oui){
  document.querySelectorAll('main, .nav, .pied, .menu-mobile, .devis-flottant').forEach(function(el){
    if(oui) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
  });
}
function ouvrir(photos, depart, opts){
  if(!photos || !photos.length) return;
  liste = photos; index = borne(depart || 0, 0, photos.length - 1); options = opts || {};
  if(!ouvert){
    dernierFocus = document.activeElement;
    ouvert = true;
    racine.hidden = false;
    racine.classList.add('ouverte');
    document.documentElement.classList.add('visio-ouverte');
    masquerFond(true);
  }
  majTextes();
  montrer();
  try{ bFermer.focus({preventScroll:true}); }catch(err){ bFermer.focus(); }
}
function fermer(silencieux){
  if(!ouvert) return;
  ouvert = false;
  arreterAnim(); clearTimeout(minuteur); jeton++;
  if(document.fullscreenElement === racine && document.exitFullscreen){ try{ document.exitFullscreen(); }catch(err){} }
  racine.classList.remove('ouverte', 'zoome', 'charge', 'glisse');
  racine.hidden = true;
  document.documentElement.classList.remove('visio-ouverte');
  masquerFond(false);
  e = 1; tx = 0; ty = 0; points = {}; nbPoints = 0; geste = null;
  img.removeAttribute('src'); img.style.visibility = 'hidden';
  var f = dernierFocus; dernierFocus = null;
  if(f && f.focus && document.contains(f)){ try{ f.focus({preventScroll:true}); }catch(err){ f.focus(); } }
  if(!silencieux && typeof options.surFermeture === 'function'){ try{ options.surFermeture(); }catch(err){} }
}
function majTextes(){
  racine.setAttribute('aria-label', T('visioTitre'));
  bFermer.setAttribute('aria-label', T('visioFermer')); bFermer.title = T('visioFermer');
  bPrec.setAttribute('aria-label', T('visioPrec'));     bSuiv.setAttribute('aria-label', T('visioSuiv'));
  bPlus.setAttribute('aria-label', T('visioZoomPlus')); bPlus.title = T('visioZoomPlus');
  bMoins.setAttribute('aria-label', T('visioZoomMoins')); bMoins.title = T('visioZoomMoins');
  majBoutonEcran();
}
function montrerAide(){
  if(aideMontree || !aide || e <= 1) return;
  aideMontree = true;
  aide.textContent = T(geste && geste.type !== 'mouse' ? 'visioAideTactile' : 'visioAideSouris');
  aide.hidden = false;
  setTimeout(function(){ aide.hidden = true; }, 3200);
}

/* ---------- souris, doigts, stylet : un seul systeme (evenements "pointer") ---------- */
function deuxPoints(){
  var ids = Object.keys(points); if(ids.length < 2) return null;
  var a = points[ids[0]], b = points[ids[1]];
  var dx = a.x - b.x, dy = a.y - b.y;
  return { d: Math.sqrt(dx * dx + dy * dy) || 1, m: versCentre((a.x + b.x) / 2, (a.y + b.y) / 2) };
}
scene.addEventListener('pointerdown', function(ev){
  if(!ouvert) return;
  if(ev.pointerType === 'mouse' && ev.button !== 0) return;
  ev.preventDefault();
  try{ scene.setPointerCapture(ev.pointerId); }catch(err){}
  if(!points[ev.pointerId]) nbPoints++;
  points[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
  arreterAnim();
  mesurer();
  if(nbPoints === 1){
    geste = { type: ev.pointerType || 'mouse', x0: ev.clientX, y0: ev.clientY, t0: maintenant(), tx0: tx, ty0: ty,
              bouge: false, pince: false, aPince: false, surPhoto: dansPhoto(ev.clientX, ev.clientY) };
  } else if(nbPoints === 2 && geste){
    /* deuxieme doigt : debut du pincement. On retient l ecart des doigts, leur milieu et
       l etat de la photo ; tout le pincement est calcule a partir de ce depart. */
    var d = deuxPoints();
    geste.pince = true; geste.aPince = true; geste.bouge = true;
    geste.d0 = d.d; geste.e0 = e; geste.mx0 = d.m.x; geste.my0 = d.m.y; geste.tx0 = tx; geste.ty0 = ty;
  }
});
scene.addEventListener('pointermove', function(ev){
  if(!ouvert || !points[ev.pointerId] || !geste) return;
  points[ev.pointerId].x = ev.clientX; points[ev.pointerId].y = ev.clientY;
  if(geste.pince && nbPoints >= 2){
    /* le point de la photo qui etait entre les doigts au depart reste entre les doigts */
    var d = deuxPoints();
    var nouv = borne(geste.e0 * d.d / geste.d0, 1, echelleMax());
    var k = nouv / geste.e0;
    e = nouv;
    tx = d.m.x - (geste.mx0 - geste.tx0) * k;
    ty = d.m.y - (geste.my0 - geste.ty0) * k;
    appliquer();
    return;
  }
  if(nbPoints !== 1) return;
  var dx = ev.clientX - geste.x0, dy = ev.clientY - geste.y0;
  if(!geste.bouge){
    var seuil = geste.type === 'mouse' ? SEUIL_SOURIS : SEUIL_DOIGT;
    if(dx * dx + dy * dy < seuil * seuil) return;
    geste.bouge = true;
  }
  if(e > 1){
    tx = geste.tx0 + dx; ty = geste.ty0 + dy;
    racine.classList.add('glisse');
    appliquer();
  }
});
function finPointeur(ev){
  if(!points[ev.pointerId]) return;
  delete points[ev.pointerId]; nbPoints--;
  try{ scene.releasePointerCapture(ev.pointerId); }catch(err){}
  if(!ouvert || !geste) { if(nbPoints <= 0){ nbPoints = 0; geste = null; } return; }
  if(nbPoints === 1 && geste.aPince){
    /* un doigt se leve apres un pincement : le doigt restant repart de SA position
       actuelle et de l etat actuel de la photo, sinon l image sauterait. */
    var id = Object.keys(points)[0];
    geste.pince = false; geste.bouge = true;
    geste.x0 = points[id].x; geste.y0 = points[id].y; geste.tx0 = tx; geste.ty0 = ty;
    if(e <= 1.02) remettreAZero(false);
    apresZoom();
    return;
  }
  if(nbPoints > 0) return;
  nbPoints = 0;
  var g = geste; geste = null;
  racine.classList.remove('glisse');
  if(ev.type === 'pointercancel') return;
  if(g.aPince){ if(e <= 1.02) remettreAZero(false); apresZoom(); return; }
  var dx = ev.clientX - g.x0, dy = ev.clientY - g.y0, dt = maintenant() - g.t0;
  if(!g.bouge){
    /* ni glisse ni pincement : c est un clic (souris) ou une touche (doigt) */
    if(g.type === 'mouse'){
      if(g.surPhoto && charge) basculer(ev.clientX, ev.clientY);
      else if(!g.surPhoto) fermer();
      return;
    }
    if(!g.surPhoto || !charge || dt > 400){ dernierTap = null; return; }
    var t = maintenant();
    if(dernierTap && t - dernierTap.t < 320 && Math.abs(ev.clientX - dernierTap.x) < 40 && Math.abs(ev.clientY - dernierTap.y) < 40){
      dernierTap = null; dernierBascule = 0;
      basculer(ev.clientX, ev.clientY);                  // deux touches rapides au meme endroit
    } else {
      dernierTap = { t: t, x: ev.clientX, y: ev.clientY };
    }
    return;
  }
  dernierTap = null;                                     // un deplacement n est jamais une double touche
  /* balayage : seulement au doigt, seulement quand la photo est entiere */
  if(g.type !== 'mouse' && e <= 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 800){
    aller(dx < 0 ? 1 : -1);
  }
}
scene.addEventListener('pointerup', finPointeur);
scene.addEventListener('pointercancel', finPointeur);
/* on neutralise les gestes par defaut du navigateur dans la scene */
scene.addEventListener('dragstart', function(ev){ ev.preventDefault(); });
scene.addEventListener('dblclick', function(ev){ ev.preventDefault(); });
scene.addEventListener('contextmenu', function(ev){ ev.preventDefault(); });
['gesturestart', 'gesturechange', 'gestureend'].forEach(function(n){ racine.addEventListener(n, function(ev){ ev.preventDefault(); }); });

/* Molette et pave tactile : zoom sous la souris, proportionnel au mouvement. Une molette
   a crans envoie de gros pas, un pave tactile une pluie de petits : avec une puissance
   (et non un pas fixe) les deux donnent un zoom regulier. */
scene.addEventListener('wheel', function(ev){
  if(!ouvert) return;
  ev.preventDefault();
  if(!charge) return;
  var d = ev.deltaY;
  if(ev.deltaMode === 1) d *= 16; else if(ev.deltaMode === 2) d *= SH;
  d = borne(d, -240, 240);
  var facteur = Math.exp(-d * (ev.ctrlKey ? 0.012 : 0.0022));
  mesurer();
  var p = versCentre(ev.clientX, ev.clientY);
  zoomer(e * facteur, p.x, p.y, false);
}, { passive: false });

/* ---------- boutons ---------- */
function stop(ev){ ev.stopPropagation(); }
[bPrec, bSuiv, bFermer, bPlus, bMoins, bEcran].forEach(function(b){ if(b) b.addEventListener('pointerdown', stop); });
bPrec.addEventListener('click', function(){ aller(-1); });
bSuiv.addEventListener('click', function(){ aller(1); });
bFermer.addEventListener('click', function(){ fermer(); });
bPlus.addEventListener('click', function(){ mesurer(); zoomer(e * 1.6, 0, 0, true); });
bMoins.addEventListener('click', function(){ mesurer(); zoomer(e / 1.6, 0, 0, true); });

/* vrai plein ecran (quand le navigateur le permet ; l iPhone ne le permet pas) */
var pleinEcranPossible = !!(document.fullscreenEnabled && racine.requestFullscreen);
function majBoutonEcran(){
  if(!bEcran) return;
  bEcran.hidden = !pleinEcranPossible;
  var actif = document.fullscreenElement === racine;
  bEcran.setAttribute('aria-label', T(actif ? 'visioEcranFin' : 'visioEcran'));
  bEcran.title = T(actif ? 'visioEcranFin' : 'visioEcran');
  bEcran.setAttribute('aria-pressed', actif ? 'true' : 'false');
}
function basculerEcran(){
  if(!pleinEcranPossible) return;
  if(document.fullscreenElement === racine) document.exitFullscreen();
  else { var pr = racine.requestFullscreen(); if(pr && pr.catch) pr.catch(function(){}); }
}
if(bEcran) bEcran.addEventListener('click', basculerEcran);
document.addEventListener('fullscreenchange', function(){ majBoutonEcran(); if(ouvert){ remesurer(); } });

/* ---------- clavier ---------- */
document.addEventListener('keydown', function(ev){
  if(!ouvert) return;
  var k = ev.key;
  if(k === 'Escape'){ ev.preventDefault(); fermer(); return; }
  if(ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if(k === 'ArrowLeft'){ ev.preventDefault(); aller(-1); return; }
  if(k === 'ArrowRight'){ ev.preventDefault(); aller(1); return; }
  if(k === '+' || k === '='){ ev.preventDefault(); mesurer(); zoomer(e * 1.6, 0, 0, true); return; }
  if(k === '-' || k === '_'){ ev.preventDefault(); mesurer(); zoomer(e / 1.6, 0, 0, true); return; }
  if(k === '0'){ ev.preventDefault(); remettreAZero(true); return; }
  if(k === 'f' || k === 'F'){ ev.preventDefault(); basculerEcran(); return; }
  if(k === 'Tab'){
    /* le focus reste dans la visionneuse tant qu elle est ouverte */
    var f = [].slice.call(racine.querySelectorAll('button')).filter(function(b){ return !b.hidden && !b.disabled && b.offsetParent !== null; });
    if(!f.length) return;
    var premier = f[0], dernier = f[f.length - 1];
    if(ev.shiftKey && (document.activeElement === premier || !racine.contains(document.activeElement))){ ev.preventDefault(); dernier.focus(); }
    else if(!ev.shiftKey && (document.activeElement === dernier || !racine.contains(document.activeElement))){ ev.preventDefault(); premier.focus(); }
  }
});

/* ---------- changement de taille (rotation du telephone, fenetre redimensionnee) ---------- */
function remesurer(){ if(!ouvert) return; mesurer(); appliquer(); }
window.addEventListener('resize', remesurer);
window.addEventListener('orientationchange', function(){ setTimeout(remesurer, 250); });
if(window.ResizeObserver){ try{ new ResizeObserver(remesurer).observe(scene); }catch(err){} }
document.addEventListener('languechange', function(){ if(ouvert){ majTextes(); var p = photo(); if(p){ compteur.textContent = liste.length > 1 ? String(T('visioCompteur')).replace('{n}', index + 1).replace('{t}', liste.length) : ''; } } });

/* ---------- ce que les autres scripts peuvent utiliser ---------- */
window.Visionneuse = {
  ouvrir: ouvrir,
  fermer: fermer,
  estOuverte: function(){ return ouvert; },
  /* pour les tests : l etat exact du zoom */
  etat: function(){ return { ouvert: ouvert, index: index, total: liste.length, echelle: e, tx: tx, ty: ty, baseL: baseL, baseH: baseH,
                             sceneL: SL, sceneH: SH, max: echelleMax(), charge: charge, anim: !!anim, id: (photo() || {}).id }; }
};
})();
