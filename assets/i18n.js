/* LANGUES DU SITE — charge sur toutes les pages
   Refait le 8 octobre 2026 (v2.0).

   COMMENT CA MARCHE
   - Le FRANCAIS est ecrit directement dans les pages (.html). C est la reference : pour
     changer un texte francais, on le change dans la page, nulle part ailleurs.
   - L ANGLAIS est dans le dictionnaire I18N.en ci-dessous. Chaque texte d une page porte
     un nom (data-i18n="nom") ; quand le visiteur clique sur EN, on remplace le texte par
     celui du dictionnaire qui porte le meme nom.
   - Un texte sans traduction reste en francais : rien ne casse, il manque juste l anglais.

   TOUT TEXTE NOUVEAU OU MODIFIE DOIT EXISTER EN FRANCAIS ET EN ANGLAIS.
   Verification : node .outils/verifier.js  (liste les traductions manquantes). */
"use strict";

/* ══ LE SEUL REGLAGE DES LANGUES ══
   Les langues proposees au visiteur, dans l ordre des boutons.
   Aujourd hui : francais et anglais seulement (decision d Alexandre, 7 octobre 2026).
   Les dix autres (es, de, it, pt, nl, ru, zh, ja, hi, ar) sont en veille dans
   assets/i18n-autres.js : rien n a ete supprime. Pour en reactiver une, ajouter son code
   ici, par exemple ['fr','en','es'] : le fichier des langues en veille se charge alors
   tout seul et le selecteur affiche la langue. */
var LANGUES_ACTIVES = ['fr', 'en'];
/* La langue affichee a l arrivee. TOUJOURS le francais : ne jamais remettre de detection
   de la langue du navigateur. Googlebot s annonce en anglais ; avec la detection, le site
   basculait en anglais POUR GOOGLE et les resultats de recherche sortaient en anglais
   (constate le 11/08/2026). L anglais ne s affiche que si le visiteur clique sur EN. */
var LANGUE_DEFAUT = 'fr';
var NOMS_LANGUES = {fr:'FR', en:'EN', es:'ES', de:'DE', it:'IT', pt:'PT', nl:'NL', ru:'Русский', zh:'中文', ja:'日本語', hi:'हिन्दी', ar:'العربية'};

/* Textes utilises par les scripts (pas ecrits dans les pages) : ils ont besoin des deux langues ici. */
var TEXTES = {
  /* visionneuse */
  visioTitre:      {fr:"Photo en grand", en:"Full-size photo"},
  visioFermer:     {fr:"Fermer", en:"Close"},
  visioPrec:       {fr:"Photo précédente", en:"Previous photo"},
  visioSuiv:       {fr:"Photo suivante", en:"Next photo"},
  visioZoomPlus:   {fr:"Zoomer", en:"Zoom in"},
  visioZoomMoins:  {fr:"Dézoomer", en:"Zoom out"},
  visioEcran:      {fr:"Plein écran", en:"Full screen"},
  visioEcranFin:   {fr:"Quitter le plein écran", en:"Exit full screen"},
  visioErreur:     {fr:"Cette photo n'a pas pu être chargée.", en:"This photo could not be loaded."},
  visioCompteur:   {fr:"{n} sur {t}", en:"{n} of {t}"},
  visioAideSouris: {fr:"Cliquez pour zoomer, glissez pour vous déplacer", en:"Click to zoom, drag to move"},
  visioAideTactile:{fr:"Pincez pour zoomer, touchez deux fois pour revenir", en:"Pinch to zoom, double-tap to reset"},
  /* portfolio */
  photosNb:        {fr:"{n} photos", en:"{n} photos"},
  photoNb1:        {fr:"1 photo", en:"1 photo"},
  serieOuvrir:     {fr:"Voir la séance", en:"View the session"},
  universVoir:     {fr:"Voir les photos", en:"View the photos"},
  /* prestations : les formules portrait */
  formulePhotos:   {fr:"{n} photos retouchées", en:"{n} edited photos"},
  formuleReserver: {fr:"Réserver cette formule", en:"Book this session"},
  formuleExemple:  {fr:"Voir cet exemple en grand", en:"See this example full size"},
  formuleVoirPhoto:{fr:"Ouvrir la photo d'exemple dans le portfolio", en:"Open the example photo in the portfolio"},
  /* avis */
  avisBadge:       {fr:"Avis Google", en:"Google review"},
  avisEtoiles:     {fr:"{n} étoiles sur 5", en:"{n} out of 5 stars"},
  avisOuvrir:      {fr:"ouvre la fiche Google dans un nouvel onglet", en:"opens the Google profile in a new tab"},
  /* video */
  videoLire:       {fr:"Lire la vidéo", en:"Play the video"},
  /* formulaire */
  sending:         {fr:"Envoi en cours…", en:"Sending…"},
  btnSend:         {fr:"Envoyer", en:"Send"},
  feedbackOk:      {fr:"Message envoyé. Je vous réponds sous 48 h.", en:"Message sent. I will reply within 48 hours."},
  feedbackErr:     {fr:"L'envoi n'a pas abouti. Réessayez, ou écrivez-moi directement à contact@andreettiphoto.fr.", en:"The message could not be sent. Please try again, or write to me directly at contact@andreettiphoto.fr."},
  /* menu, theme, partage */
  menuOuvrir:      {fr:"Ouvrir le menu", en:"Open the menu"},
  menuFermer:      {fr:"Fermer le menu", en:"Close the menu"},
  themeClair:      {fr:"Passer en mode clair", en:"Switch to light mode"},
  themeSombre:     {fr:"Passer en mode sombre", en:"Switch to dark mode"},
  partager:        {fr:"Partager cette page", en:"Share this page"},
  lienCopie:       {fr:"Lien copié", en:"Link copied"},
  langueChoix:     {fr:"Choisir la langue", en:"Choose the language"}
};
var MOIS = {
  fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December']
};

/* ══ LE DICTIONNAIRE ANGLAIS ══ (les noms correspondent aux data-i18n des pages) */
var I18N = { en: {
/*@EN@*/
} };

var curLang = LANGUE_DEFAUT;

/* Le texte d une donnee qui peut etre "texte" ou {fr:"...", en:"..."} */
function L(x){
  if(x == null) return '';
  if(typeof x === 'string') return x;
  if(x[curLang] != null && x[curLang] !== '') return x[curLang];
  if(curLang !== 'fr' && x.en != null && x.en !== '') return x.en;
  return x.fr != null ? x.fr : '';
}
/* Le texte d un nom : d abord les textes des scripts, puis le dictionnaire */
function tr(key){
  if(TEXTES[key]) return L(TEXTES[key]);
  if(curLang === 'fr') return null;
  var d = I18N[curLang] || {};
  if(d[key] != null) return d[key];
  if(I18N.en[key] != null) return I18N.en[key];
  return null;
}
/* Une date AAAA-MM-JJ ou AAAA-MM ecrite en clair : "27 septembre 2026" ou "Octobre 2024".
   Decoupage a la main : new Date("2026-09-15") est lu en heure UTC et peut afficher la
   veille selon le fuseau du visiteur. */
function dateLisible(iso, sansJour){
  var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso || '');
  if(!m) return iso || '';
  var mois = (MOIS[curLang] || MOIS.en)[+m[2] - 1];
  if(!m[3] || sansJour){ return mois.charAt(0).toUpperCase() + mois.slice(1) + ' ' + m[1]; }
  if(curLang === 'en') return mois + ' ' + (+m[3]) + ', ' + m[1];
  return (+m[3]) + (+m[3] === 1 && curLang === 'fr' ? 'er' : '') + ' ' + mois + ' ' + m[1];
}

/* Applique la langue courante aux textes de la page (ou d un morceau de page).
   Le francais d origine de chaque element est garde en memoire, pour pouvoir y revenir. */
function applyI18n(racine){
  var zone = racine || document;
  zone.querySelectorAll('[data-i18n]').forEach(function(el){
    if(el.__fr === undefined) el.__fr = el.innerHTML;
    if(curLang === 'fr'){ if(el.innerHTML !== el.__fr) el.innerHTML = el.__fr; return; }
    var v = tr(el.getAttribute('data-i18n'));
    if(v == null){ if(el.innerHTML !== el.__fr) el.innerHTML = el.__fr; return; }
    if(el.hasAttribute('data-i18n-html')) el.innerHTML = v; else el.textContent = v;
  });
  /* attributs : data-i18n-attr="aria-label:nom;title:autreNom" */
  zone.querySelectorAll('[data-i18n-attr]').forEach(function(el){
    if(!el.__frAttr) el.__frAttr = {};
    el.getAttribute('data-i18n-attr').split(';').forEach(function(paire){
      var p = paire.split(':'); if(p.length !== 2) return;
      var attr = p[0].trim(), cle = p[1].trim();
      if(el.__frAttr[attr] === undefined) el.__frAttr[attr] = el.getAttribute(attr);
      var v = (curLang === 'fr') ? null : tr(cle);
      el.setAttribute(attr, v != null ? v : (el.__frAttr[attr] || ''));
    });
  });
}

window.setLang = function(code){
  if(LANGUES_ACTIVES.indexOf(code) === -1) code = LANGUE_DEFAUT;   // langue en veille ou inconnue : francais
  /* une langue en veille reactivee a besoin de son dictionnaire : on le charge une fois */
  if(code !== 'fr' && code !== 'en' && !I18N[code] && !window.__i18nAutres){
    window.__i18nAutres = true;
    var s = document.createElement('script');
    s.src = 'assets/i18n-autres.js';
    s.onload = function(){ window.setLang(code); };
    document.head.appendChild(s);
    return;
  }
  curLang = code;
  var root = document.documentElement;
  root.setAttribute('lang', code);
  root.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
  applyI18n();
  try{ localStorage.setItem('lang', code); }catch(e){}
  /* previent les blocs fabriques par script (avis, seances, visionneuse) de se reecrire */
  try{ document.dispatchEvent(new CustomEvent('languechange', {detail:{langue:code}})); }catch(e){}
};

(function(){
  var memo = null; try{ memo = localStorage.getItem('lang'); }catch(e){}
  var code = (memo && LANGUES_ACTIVES.indexOf(memo) !== -1) ? memo : LANGUE_DEFAUT;
  if(code !== 'fr') window.setLang(code);        // en francais il n y a rien a faire : la page EST en francais
  else { curLang = 'fr'; document.documentElement.setAttribute('lang', 'fr'); }
})();
