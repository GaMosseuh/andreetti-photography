/* RENDU — fabrique le HTML des blocs qui viennent de assets/data.js :
   avis, seances, univers, formules, cases du portfolio, tuiles de photos, video.

   Ce fichier sert DEUX fois, avec le meme code :
   - dans le navigateur, a chaque ouverture de page (et quand le visiteur change de langue) ;
   - dans .outils/construire.js, qui ecrit ces memes blocs en dur dans les pages, pour les
     visiteurs sans JavaScript et pour Google.
   Un seul code, donc les deux versions ne peuvent pas se contredire.

   Il ne fait que fabriquer du texte : il ne touche pas a la page. Tout ce qui vient des
   donnees passe par ech() : un texte d avis ne peut pas casser la page. */
var Rendu = (function(){
"use strict";

var CHEMIN_ETOILE = 'M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.4 20l1.3-6.3L3 9.4l6.4-.7z';

function ech(s){
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function trad(cle){ return (typeof tr === 'function' && tr(cle) != null) ? tr(cle) : cle; }
function txt(x){ return (typeof L === 'function') ? L(x) : (typeof x === 'string' ? x : (x && x.fr) || ''); }
function date(iso, sansJour){ return (typeof dateLisible === 'function') ? dateLisible(iso, sansJour) : iso; }
function univers(cat){ return (typeof UNIVERS !== 'undefined' && UNIVERS[cat]) ? txt(UNIVERS[cat]) : cat; }

/* ---------- photos ---------- */
function photo(id){
  var p = null, i;
  if(typeof PHOTOS !== 'undefined'){ for(i = 0; i < PHOTOS.length; i++){ if(PHOTOS[i].id === id){ p = PHOTOS[i]; break; } } }
  var d = (typeof DIMENSIONS !== 'undefined' && DIMENSIONS[id]) || null;
  if(!p && !d) return null;
  p = p || { id: id };
  var w = d ? d[0] : 4, h = d ? d[1] : 5, gw = d ? d[2] : 0;
  return {
    id: id, cat: p.cat || '', serie: p.serie || '', nowmark: !!p.nowmark,
    w: w, h: h, gw: gw, r: Math.round(w / h * 1000) / 1000,
    alt: txt(p.alt) || '',
    src: '/images/portfolio/' + id + '.webp',
    srcPetite: '/images/portfolio/p/' + id + '.webp',
    srcGrande: gw ? '/images/portfolio/g/' + id + '.webp' : ''
  };
}
function serie(id){
  if(typeof SERIES === 'undefined') return null;
  for(var i = 0; i < SERIES.length; i++){ if(SERIES[i].id === id) return SERIES[i]; }
  return null;
}
function photosDe(idSerie){
  var out = [];
  if(typeof PHOTOS === 'undefined') return out;
  PHOTOS.forEach(function(p){ if(p.serie === idSerie){ var x = photo(p.id); if(x) out.push(x); } });
  return out;
}
/* les seances qui ont au moins une photo (les autres restent invisibles) */
function seriesVisibles(){
  if(typeof SERIES === 'undefined') return [];
  return SERIES.filter(function(s){ return photosDe(s.id).length > 0; });
}
/* l image d une photo, dans son cadre. tailles = l attribut "sizes" (la place qu elle prend). */
function image(p, tailles, options){
  options = options || {};
  var grandes = p.w > 720 ? ', ' + p.src + ' ' + p.w + 'w' : '';
  return '<span class="cadre' + (p.nowmark ? '' : ' filigrane') + '">' +
    '<img src="' + p.srcPetite + '" srcset="' + p.srcPetite + ' ' + Math.min(720, p.w) + 'w' + grandes + '" sizes="' + ech(tailles || '50vw') + '"' +
    ' width="' + p.w + '" height="' + p.h + '" alt="' + ech(options.alt != null ? options.alt : p.alt) + '"' +
    ' loading="' + (options.vite ? 'eager' : 'lazy') + '" decoding="async" data-img data-secours="' + p.src + '">' +
    '</span>';
}
function tuile(p){
  return '<a class="tuile" href="/portfolio?photo=' + encodeURIComponent(p.id) + '" data-photo="' + ech(p.id) + '" style="--r:' + p.r + '">' +
    image(p, '(max-width:520px) 60vw, (max-width:900px) 42vw, 30vw') + '</a>';
}
function galerie(liste){ return liste.map(tuile).join(''); }
/* toutes les photos, dans l ordre de data.js */
function toutesLesPhotos(){ var out = []; if(typeof PHOTOS !== 'undefined') PHOTOS.forEach(function(p){ var x = photo(p.id); if(x) out.push(x); }); return out; }
function galerieToutes(){ return galerie(toutesLesPhotos()); }

/* ---------- avis ---------- */
function etoiles(note){
  note = Math.max(0, Math.min(5, parseInt(note, 10) || 0));
  var s = '<div class="etoiles" role="img" aria-label="' + ech(String(trad('avisEtoiles')).replace('{n}', note)) + '">';
  for(var i = 1; i <= 5; i++){
    s += '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (i <= note ? '' : ' class="vide"') + '><path d="' + CHEMIN_ETOILE + '"/></svg>';
  }
  return s + '</div>';
}
/* la date d une seance : son texte libre s il existe (ex. « Ete 2024 »), sinon sa date */
function dateSerie(s, sansJour){ return s.dateTexte ? txt(s.dateTexte) : date(s.date, sansJour); }
function unAvis(a){
  var fiche = (typeof GOOGLE_FICHE_URL !== 'undefined') ? GOOGLE_FICHE_URL : '';
  var source = '';
  if(a.source === 'google' && fiche){
    source = '<a class="avis-source" href="' + ech(fiche) + '" target="_blank" rel="noopener noreferrer" aria-label="' +
      ech(trad('avisBadge') + ', ' + a.prenom + ' : ' + trad('avisOuvrir')) + '">' + ech(trad('avisBadge')) + '</a>';
  }
  /* en anglais, on montre la traduction (champ "en") et on le dit ; le francais reste l original */
  var traduit = (typeof curLang !== 'undefined' && curLang === 'en' && !!a.en);
  return '<figure class="avis">' + etoiles(a.note) +
    '<blockquote lang="' + (traduit ? 'en' : 'fr') + '"><p>« ' + ech(traduit ? a.en : a.texte) + ' »</p></blockquote>' +
    (traduit ? '<p class="avis-traduit">' + ech(trad('avisTraduit')) + '</p>' : '') +
    '<figcaption><span class="avis-prenom">' + ech(a.prenom) + '</span>' +
    (a.date ? '<time class="avis-date" datetime="' + ech(a.date) + '">' + ech(date(a.date)) + '</time>' : '') +
    source + '</figcaption></figure>';
}
/* les avis d un emplacement : "accueil", "formules" ou "contact" */
function avis(ou){
  if(typeof AVIS === 'undefined') return '';
  return AVIS.filter(function(a){ return !ou || !a.ou || a.ou.indexOf(ou) !== -1; }).map(unAvis).join('');
}

/* ---------- accueil : les trois univers ---------- */
function universAccueil(){
  if(typeof UNIVERS_ACCUEIL === 'undefined') return '';
  return UNIVERS_ACCUEIL.map(function(u, i){
    var p = photo(u.photo); if(!p) return '';
    return '<a href="/portfolio?vue=photos&amp;cat=' + ech(u.cat) + '">' +
      image(p, '(max-width:760px) 100vw, 34vw') +
      '<span class="univers-texte"><span class="univers-nom">' + ech(univers(u.cat)) + '</span>' +
      '<span class="univers-voir">' + ech(trad('universVoir')) + '<i class="fleche" aria-hidden="true"></i></span></span></a>';
  }).join('');
}

/* ---------- accueil : dernieres seances (3 cartes au plus) ---------- */
function cartesSeances(){
  var liste = seriesVisibles().filter(function(s){ return s.accueil; }).slice(0, 3);
  return liste.map(function(s){
    var couv = photo(s.couverture) || photosDe(s.id)[0];
    var img;
    if(s.imageAccueil){
      img = '<span class="cadre' + (couv && couv.nowmark ? '' : ' filigrane') + '"><img src="/images/seances/' + ech(s.imageAccueil) + '" alt="' + ech(couv ? couv.alt : txt(s.titre)) + '" width="1200" height="900" loading="lazy" decoding="async" data-img></span>';
    } else {
      img = image(couv, '(max-width:700px) 100vw, 33vw');
    }
    return '<a class="carte-seance" href="/portfolio?serie=' + encodeURIComponent(s.id) + '">' + img +
      '<span class="meta">' + ech(univers(s.univers)) + ' · ' + ech(dateSerie(s, true)) + '</span>' +
      '<h3>' + ech(txt(s.titre)) + '</h3>' +
      '<p>' + ech(txt(s.texteAccueil || s.texte)) + '</p>' +
      '<span class="lien"><span>' + ech(trad('serieOuvrir')) + '</span><i class="fleche" aria-hidden="true"></i></span></a>';
  }).join('');
}
function nbCartesSeances(){ return seriesVisibles().filter(function(s){ return s.accueil; }).slice(0, 3).length; }

/* ---------- portfolio : les cases des seances ---------- */
function nbPhotos(n){ return n === 1 ? trad('photoNb1') : String(trad('photosNb')).replace('{n}', n); }
function casesSeances(){
  return seriesVisibles().map(function(s){
    var photos = photosDe(s.id), couv = photo(s.couverture) || photos[0];
    var lieu = txt(s.lieu);
    return '<a class="case" href="/portfolio?serie=' + encodeURIComponent(s.id) + '" data-serie="' + ech(s.id) + '">' +
      image(couv, '(max-width:600px) 50vw, (max-width:1100px) 33vw, 25vw') +
      '<span class="meta">' + ech(univers(s.univers)) + ' · ' + ech(dateSerie(s, true)) + '</span>' +
      '<h3>' + ech(txt(s.titre)) + '</h3>' +
      '<span class="lieu">' + (lieu ? ech(lieu) + ' · ' : '') + ech(nbPhotos(photos.length)) + '</span></a>';
  }).join('');
}
/* l en-tete d une seance ouverte */
function teteSerie(s){
  var lieu = txt(s.lieu);
  return '<p class="meta">' + ech(univers(s.univers)) + ' · ' + ech(dateSerie(s)) + (lieu ? ' · ' + ech(lieu) : '') + '</p>' +
    '<h2 id="serieTitre" tabindex="-1">' + ech(txt(s.titre)) + '</h2>' +
    '<p>' + ech(txt(s.texte)) + '</p>';
}

/* ---------- prestations : les formules portrait ---------- */
function formules(){
  if(typeof FORMULES === 'undefined') return '';
  return FORMULES.map(function(f){
    var p = photo(f.exemple);
    var nom = txt(f.nom);
    return '<article class="formule">' +
      (p ? '<a class="formule-photo" data-visio="' + ech(p.id) + '" data-legende="' + ech(nom) + '" href="/portfolio?photo=' + encodeURIComponent(p.id) + '" aria-label="' + ech(trad('formuleVoirPhoto') + ' : ' + p.alt) + '">' +
            image(p, '(max-width:760px) 100vw, 30vw').replace('<img ', f.cadrage ? '<img style="object-position:' + ech(f.cadrage) + '" ' : '<img ') + '<span class="formule-exemple">' + ech(trad('formuleExemple')) + '<i class="fleche" aria-hidden="true"></i></span></a>' : '') +
      '<div class="formule-corps">' +
      '<h3>' + ech(nom) + '</h3>' +
      '<p class="formule-prix"><span class="prix">' + ech(f.prix) + ' €</span><span class="duree">' + ech(txt(f.duree)) + '</span></p>' +
      '<ul><li>' + ech(String(trad('formulePhotos')).replace('{n}', f.photos)) + '</li><li>' + ech(txt(f.compris)) + '</li></ul>' +
      '<a class="btn-2" href="/contact?prestation=portrait-' + encodeURIComponent(f.id) + '">' + ech(trad('formuleReserver')) + '</a>' +
      '</div></article>';
  }).join('');
}

/* une photo seule qui mene a sa seance (blocs Sport et Evenementiel des prestations) */
function photoSerie(id){
  var p = photo(id); if(!p) return '';
  return image(p, '(max-width:760px) 100vw, 40vw') + '<span class="formule-exemple">' + ech(trad('serieOuvrir')) + '<i class="fleche" aria-hidden="true"></i></span>';
}

/* ---------- contact : la liste « Ce qui vous interesse » ----------
   La valeur envoyee (value) est toujours en francais : c est ce qu Alexandre lit dans son mail.
   data-cle sert au lien direct  /contact?prestation=portrait-etudiant  */
function optionsPrestation(){
  var o = '<option value="À préciser" data-cle="">' + ech(trad('optAPreciser')) + '</option>';
  if(typeof FORMULES !== 'undefined') FORMULES.forEach(function(f){
    o += '<option value="' + ech(f.nom.fr + ' (' + f.prix + ' €)') + '" data-cle="portrait-' + ech(f.id) + '">' + ech(txt(f.nom) + ' · ' + txt(f.duree) + ' · ' + f.prix + ' €') + '</option>';
  });
  o += '<option value="Portrait (autre demande)" data-cle="portrait">' + ech(trad('optPortraitAutre')) + '</option>';
  o += '<option value="Sport" data-cle="sport">' + ech(univers('sport')) + '</option>';
  o += '<option value="Événementiel" data-cle="evenementiel">' + ech(univers('evenement')) + '</option>';
  o += '<option value="Autre" data-cle="autre">' + ech(trad('optAutre')) + '</option>';
  return o;
}

/* ---------- video de presentation ---------- */
function videoPresente(){ return typeof VIDEO_PRESENTATION !== 'undefined' && !!VIDEO_PRESENTATION.youtube; }
/* Une vignette et un bouton : le lecteur YouTube n est charge qu au clic (voir common.js) */
function video(){
  if(!videoPresente()) return '';
  var id = VIDEO_PRESENTATION.youtube, titre = txt(VIDEO_PRESENTATION.titre);
  return '<button class="video-vignette" type="button" data-youtube="' + ech(id) + '" data-titre="' + ech(titre) + '" aria-label="' + ech(trad('videoLire') + (titre ? ' : ' + titre : '')) + '">' +
    '<img src="' + (VIDEO_PRESENTATION.vignette ? ech(VIDEO_PRESENTATION.vignette) : 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg') + '" alt="" width="480" height="360" loading="lazy" decoding="async">' +
    '<span class="video-lecture" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span></button>';
}

return {
  ech: ech, photo: photo, serie: serie, photosDe: photosDe, seriesVisibles: seriesVisibles,
  image: image, tuile: tuile, galerie: galerie, galerieToutes: galerieToutes, toutesLesPhotos: toutesLesPhotos,
  etoiles: etoiles, avis: avis,
  universAccueil: universAccueil, cartesSeances: cartesSeances, nbCartesSeances: nbCartesSeances,
  casesSeances: casesSeances, teteSerie: teteSerie, nbPhotos: nbPhotos,
  formules: formules, photoSerie: photoSerie, optionsPrestation: optionsPrestation, video: video, videoPresente: videoPresente, dateSerie: dateSerie, univers: univers
};
})();
