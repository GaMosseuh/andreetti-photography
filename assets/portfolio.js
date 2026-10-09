/* PORTFOLIO — les deux facons de regarder, sur la meme page (refait le 8 octobre 2026, v2.0)

   « Seances »          : une case par seance ; un clic ouvre la serie de cette seance.
   « Toutes les photos » : toutes les photos, avec le filtre Portrait / Sport / Evenementiel.

   L ADRESSE DE LA PAGE DIT CE QU ON REGARDE. On peut donc envoyer un lien direct :
     /portfolio                      les seances
     /portfolio?serie=marsannay      la serie d une seance
     /portfolio?vue=photos           toutes les photos
     /portfolio?cat=sport            toutes les photos, filtre Sport
     /portfolio?photo=portrait-06    une photo ouverte en grand
   Le bouton « retour » du navigateur ou du telephone revient d un cran : il ferme la photo,
   puis referme la serie. Les seances et les photos viennent de assets/data.js. */
(function(){
"use strict";

var R = Rendu;
var CATS = ['portrait', 'sport', 'evenement'];
var vueSeances = document.getElementById('vueSeances');
var vueSerie   = document.getElementById('vueSerie');
var vuePhotos  = document.getElementById('vuePhotos');
var cases      = document.getElementById('cases');
var serieTete  = document.getElementById('serieTete');
var serieGal   = document.getElementById('serieGalerie');
var serieDevis = document.getElementById('serieDevis');
var galerie    = document.getElementById('galerie');
var onglets    = [].slice.call(document.querySelectorAll('.onglets [data-vue]'));
var filtres    = [].slice.call(document.querySelectorAll('.filtres [data-cat]'));
if(!vuePhotos || !galerie) return;

var etat = { vue: 'seances', serie: '', cat: 'tous' };
var dernierDeclencheur = null;

/* ---------- l adresse <-> l etat ---------- */
function lire(){
  var q = new URLSearchParams(location.search);
  var e = { vue: 'seances', serie: '', cat: 'tous', photo: q.get('photo') || '' };
  var s = q.get('serie'), c = q.get('cat'), v = q.get('vue');
  if(e.photo && !R.photo(e.photo)) e.photo = '';
  if(s && R.serie(s) && R.photosDe(s).length){ e.vue = 'serie'; e.serie = s; }
  else if(CATS.indexOf(c) !== -1){ e.vue = 'photos'; e.cat = c; }
  else if(v === 'photos' || e.photo){ e.vue = 'photos'; }
  else if(!R.seriesVisibles().length){ e.vue = 'photos'; }     // aucune seance : on montre les photos
  return e;
}
function adresse(e, photo){
  var q = [];
  if(e.vue === 'serie') q.push('serie=' + encodeURIComponent(e.serie));
  else if(e.vue === 'photos'){ if(e.cat !== 'tous') q.push('cat=' + e.cat); else q.push('vue=photos'); }
  if(photo) q.push('photo=' + encodeURIComponent(photo));
  return location.pathname + (q.length ? '?' + q.join('&') : '');
}

/* ---------- des rangees de hauteur reguliere ----------
   Chaque photo garde ses proportions (jamais recadree, jamais etiree). On remplit les
   rangees une a une et on coupe la ou la hauteur de la rangee est la plus proche de la
   hauteur visee (--h, dans styles.css) : toutes les rangees font alors toute la largeur,
   avec des hauteurs voisines. Sans ce calcul, le CSS seul donne deja une grille correcte. */
function justifier(g){
  if(!g || !g.clientWidth) return;
  var tuiles = [].filter.call(g.querySelectorAll('.tuile'), function(t){ return !t.hidden; });
  if(!tuiles.length) return;
  var cs = getComputedStyle(g), L = g.clientWidth;
  var ecart = parseFloat(cs.columnGap) || 8, cible = parseFloat(cs.getPropertyValue('--h')) || 300;
  var rangees = [], rangee = [], somme = 0;
  function fermer(h){ rangees.push({ t: rangee, h: h }); rangee = []; somme = 0; }
  tuiles.forEach(function(t){
    var r = parseFloat(t.style.getPropertyValue('--r')) || 1;
    if(rangee.length){
      var avec = (L - ecart * rangee.length) / (somme + r);
      if(avec < cible){
        var sans = (L - ecart * (rangee.length - 1)) / somme;
        if(Math.abs(sans - cible) <= Math.abs(avec - cible)){ fermer(sans); rangee.push(t); somme = r; t.__r = r; return; }
        rangee.push(t); somme += r; t.__r = r; fermer(avec); return;
      }
    }
    rangee.push(t); somme += r; t.__r = r;
  });
  /* la derniere rangee n est pas forcee a toute la largeur : elle garde la hauteur visee */
  if(rangee.length) fermer(Math.min((L - ecart * (rangee.length - 1)) / somme, cible * 1.15));
  rangees.forEach(function(x){
    x.t.forEach(function(t){ t.style.flex = '0 0 auto'; t.style.maxWidth = 'none'; t.style.width = (Math.floor(t.__r * x.h * 100) / 100 - 0.02) + 'px'; });
  });
  g.classList.add('juste');
}
function justifierTout(){ justifier(galerie); justifier(serieGal); }
var minuteurTaille = null;
window.addEventListener('resize', function(){ clearTimeout(minuteurTaille); minuteurTaille = setTimeout(justifierTout, 80); });

/* ---------- « Toutes les photos » : un ordre different a chaque visite ----------
   Les photos sont melangees au hasard, avec une regle : deux photos de la meme seance (donc
   de la meme personne) ne se suivent jamais de pres. On tire chaque photo au sort parmi les
   seances qui ne sont pas apparues dans les dernieres places ; les seances qui ont le plus
   de photos restantes ont plus de chances, pour ne pas finir avec un paquet de la meme. */
function melanger(){
  var groupes = {}, cles = [];
  PHOTOS.forEach(function(p){
    if(!R.photo(p.id)) return;
    var c = p.serie || ('seule-' + p.id);
    if(!groupes[c]){ groupes[c] = []; cles.push(c); }
    groupes[c].push(p.id);
  });
  cles.forEach(function(c){ var g = groupes[c]; for(var i = g.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var x = g[i]; g[i] = g[j]; g[j] = x; } });
  var sortie = [], derniers = [], ECART = 4;
  function reste(){ return cles.filter(function(c){ return groupes[c].length; }); }
  var r = reste();
  while(r.length){
    var possibles = [], ecart = ECART;
    while(!possibles.length && ecart >= 0){
      var recents = derniers.slice(-ecart);
      possibles = r.filter(function(c){ return ecart === 0 || recents.indexOf(c) === -1; });
      ecart--;
    }
    var total = 0; possibles.forEach(function(c){ total += groupes[c].length * groupes[c].length; });
    var tirage = Math.random() * total, choisi = possibles[0];
    for(var k = 0; k < possibles.length; k++){ tirage -= groupes[possibles[k]].length * groupes[possibles[k]].length; if(tirage <= 0){ choisi = possibles[k]; break; } }
    sortie.push(groupes[choisi].pop()); derniers.push(choisi);
    r = reste();
  }
  return sortie;
}

/* ---------- affichage ---------- */
function montrerPanneau(el, oui){ if(el){ el.hidden = !oui; el.classList.toggle('actif', oui); } }
function afficher(e, focus){
  etat = { vue: e.vue, serie: e.serie, cat: e.cat };
  montrerPanneau(vueSeances, e.vue === 'seances');
  montrerPanneau(vueSerie, e.vue === 'serie');
  montrerPanneau(vuePhotos, e.vue === 'photos');
  onglets.forEach(function(b){
    var actif = (b.getAttribute('data-vue') === 'photos') ? e.vue === 'photos' : e.vue !== 'photos';
    b.setAttribute('aria-selected', actif ? 'true' : 'false');
    b.tabIndex = actif ? 0 : -1;
  });
  if(e.vue === 'serie'){
    var s = R.serie(e.serie);
    serieTete.innerHTML = R.teteSerie(s);
    serieGal.innerHTML = R.galerie(R.photosDe(e.serie));
    brancherImages(serieGal);
    if(serieDevis) serieDevis.href = '/contact?prestation=' + encodeURIComponent(s.univers);
    if(focus){ var t = document.getElementById('serieTitre'); window.scrollTo(0, 0); if(t){ try{ t.focus({preventScroll:true}); }catch(err){ t.focus(); } } }
  }
  if(e.vue === 'photos'){
    filtres.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-cat') === e.cat ? 'true' : 'false'); });
    [].forEach.call(galerie.querySelectorAll('.tuile'), function(t){
      var p = R.photo(t.getAttribute('data-photo'));
      t.hidden = !(e.cat === 'tous' || (p && p.cat === e.cat));
    });
  }
  justifierTout();
}
/* les photos que la visionneuse doit faire defiler, selon l endroit d ou l on vient */
function listePour(e){
  var liste = (e.vue === 'serie') ? R.photosDe(e.serie)
            : R.toutesLesPhotos().filter(function(p){ return e.cat === 'tous' || p.cat === e.cat; });
  return liste.map(function(p){
    var s = p.serie ? R.serie(p.serie) : null;
    p.legende = s ? L(s.titre) + ' · ' + R.dateSerie(s, true) : R.univers(p.cat);
    return p;
  });
}
function ouvrirPhoto(id, pousser){
  var liste = listePour(etat), i = -1;
  liste.forEach(function(p, k){ if(p.id === id) i = k; });
  if(i < 0){                                        // la photo n est pas dans le filtre en cours : on l elargit
    afficher({ vue: 'photos', serie: '', cat: 'tous' });
    liste = listePour(etat);
    liste.forEach(function(p, k){ if(p.id === id) i = k; });
    if(i < 0) return;
  }
  if(pousser) history.pushState({ visio: true }, '', adresse(etat, id));
  Visionneuse.ouvrir(liste, i, {
    surChange: function(p){ try{ history.replaceState(history.state, '', adresse(etat, p.id)); }catch(err){} },
    surFermeture: function(){
      if(history.state && history.state.visio) history.back();
      else { try{ history.replaceState(null, '', adresse(etat)); }catch(err){} }
    }
  });
}
function aller(e, declencheur){
  dernierDeclencheur = declencheur || null;
  history.pushState({ vue: e.vue }, '', adresse(e));
  afficher(e, true);
}

/* ---------- clics ---------- */
function clicNormal(ev){ return !(ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey); }
document.addEventListener('click', function(ev){
  if(!clicNormal(ev)) return;                         // Ctrl+clic, clic du milieu : le lien s ouvre normalement
  var t = ev.target.closest && ev.target.closest('.tuile');
  if(t && (galerie.contains(t) || serieGal.contains(t))){
    ev.preventDefault();
    ouvrirPhoto(t.getAttribute('data-photo'), true);
    return;
  }
  var c = ev.target.closest && ev.target.closest('.case');
  if(c && cases && cases.contains(c)){
    ev.preventDefault();
    aller({ vue: 'serie', serie: c.getAttribute('data-serie'), cat: 'tous' }, c);
    return;
  }
  var retour = ev.target.closest && ev.target.closest('#serieRetour');
  if(retour){
    ev.preventDefault();
    var id = etat.serie;
    aller({ vue: 'seances', serie: '', cat: 'tous' });
    var d = cases && cases.querySelector('[data-serie="' + id + '"]');
    if(d){ try{ d.focus({preventScroll:true}); }catch(err){ d.focus(); } d.scrollIntoView({ block: 'center' }); }
  }
});
onglets.forEach(function(b){
  b.addEventListener('click', function(){
    var v = b.getAttribute('data-vue');
    if((v === 'photos') === (etat.vue === 'photos') && etat.vue !== 'serie') return;
    aller({ vue: v === 'photos' ? 'photos' : 'seances', serie: '', cat: 'tous' });
  });
  /* fleches gauche/droite entre les deux onglets, comme le veut l usage */
  b.addEventListener('keydown', function(ev){
    if(ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    var autre = onglets[(onglets.indexOf(b) + 1) % onglets.length];
    if(autre){ ev.preventDefault(); autre.focus(); autre.click(); }
  });
});
filtres.forEach(function(b){
  b.addEventListener('click', function(){
    var e = { vue: 'photos', serie: '', cat: b.getAttribute('data-cat') };
    try{ history.replaceState(history.state, '', adresse(e)); }catch(err){}
    afficher(e);
  });
});

/* ---------- retour / avance du navigateur ---------- */
window.addEventListener('popstate', function(){
  var e = lire();
  if(!e.photo && Visionneuse.estOuverte()) Visionneuse.fermer(true);
  if(e.vue !== etat.vue || e.serie !== etat.serie || e.cat !== etat.cat) afficher(e);
  if(e.photo && !Visionneuse.estOuverte()) ouvrirPhoto(e.photo, false);
});
/* changement de langue : les textes des cases, de la serie et des photos sont refaits */
document.addEventListener('languechange', function(){
  galerie.innerHTML = R.galerieToutes(); brancherImages(galerie);
  afficher(etat);
});

/* ---------- demarrage ---------- */
(function(){
  R.ordonner(melanger());
  galerie.innerHTML = R.galerieToutes(); brancherImages(galerie);
  var e = lire();
  afficher(e);
  try{ history.replaceState(history.state, '', adresse(etat)); }catch(err){}
  if(e.photo){
    /* lien direct vers une photo : on l ouvre, et « retour » ramene a la grille */
    history.pushState({ visio: true }, '', adresse(etat, e.photo));
    ouvrirPhoto(e.photo, false);
  }
})();
})();
