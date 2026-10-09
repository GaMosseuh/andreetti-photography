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
  /* contact : la liste des prestations */
  optAPreciser:    {fr:"Je ne sais pas encore", en:"I am not sure yet"},
  optPortraitAutre:{fr:"Portrait · autre demande (duo, famille, séance longue…)", en:"Portrait · other request (couple, family, longer session…)"},
  optAutre:        {fr:"Autre", en:"Other"},
  /* avis */
  avisBadge:       {fr:"Avis Google", en:"Google review"},
  avisTraduit:     {fr:"Traduit du français", en:"Translated from French"},
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
/* --- barre du haut, pied de page, boutons communs --- */
evitement:"Skip to content",
navHome:"Home", navPortfolio:"Portfolio", navServices:"Services", navAbout:"About", navContact:"Contact", navLinks:"Links",
ctaDevis:"Request my free quote", floatCta:"Free quote", quoteBtn:"Request a quote", surDevis:"Quote on request",
footTag:"Portrait, sport and event photographer in Dijon and the Yonne", footPromesse:"Free quote · Reply within 48 hours",
footLinks:"My links", footReview:"Leave a review", legalLink:"Legal notice and privacy",
catPortrait:"Portrait", catSport:"Sport", catEvent:"Events",
retourAccueil:"Back to home", voirPhotos:"See the photos",
deplacementRegle:"Travel is included within 25 km of Dijon. Further away, or in the Yonne where I am regularly, travel is shown in the quote.",
spamPhrase:"I reply to every email. If you have no reply within 48 hours, please check your spam folder.",
spamNote:"I reply to every email. No reply within 48 hours? Please check your spam folder.",
appelTitre:"Do you have a project in mind?", appelTexte:"Tell me what you are looking for. The quote is free, and I reply within 48 hours.",
ctaBandTitle:"Ready to book your session?", ctaBandText:"Tell me about your project: I reply within 48 hours with a free, no-obligation quote.",

/* --- accueil --- */
heroCta1:"View the portfolio", heroCta2:"Get in touch",
tagline:"Portrait, sport & event photographer in Dijon and the Yonne",
universLabel:"The three fields",
whoText:"I'm Alexandre, a photographer based in Dijon and the Yonne. Portrait, sport, events: I capture the authenticity of each moment.",
whoMore:"More about me",
statFree:"Free", statQuoteL:"Custom quote", statReplyL:"Reply time", statDeliveryN:"10 days", statDeliveryL:"Photo delivery",
tariffsEyebrow:"Services", tariffsTitle:"Services and prices", tariffsBtn:"See services and prices",
prestaIntro:"For a portrait, prices are fixed and everything is included. For a club, an association or an event, every request is different, so I send you a quote, free and within 48 hours.",
offrePortraitPrix:"Fixed-price sessions", offrePortraitTexte:"€40, €50 or €65 depending on the session, all included.",
offreSportTexte:"Matches, tournaments, training sessions, team photos and player portraits.",
offreEventTexte:"Shows, concerts, galas, meetings, community days, openings.",
lastEyebrow:"Latest", lastTitle:"Latest sessions", lastAll:"View the full portfolio",
igText:"My latest photos and behind-the-scenes are on Instagram.",
testiEyebrow:"Reviews", testiTitle:"What clients say", avisVoirTous:"Read the reviews on Google",
videoEyebrow:"On video", videoTitre:"A quick introduction", videoNote:"The video is hosted by YouTube. It only loads if you play it.",
faqMiniAll:"All the questions",
zonesEyebrow:"Travel", zonesTitle:"Areas covered", zonesAll:"See all towns",
zonesIntro:"Based in Dijon and the Yonne, I travel across the region for your sessions and reports.",

/* --- portfolio --- */
portfolioSous:"Portrait, sport and event photographer in Dijon",
ongletsLabel:"Ways to browse the portfolio", ongletSeances:"Sessions", ongletPhotos:"All photos",
filtresLabel:"Filter the photos", filtreTous:"All",
serieRetour:"All sessions", serieQuestion:"Would you like photos like these?", serieDevisBtn:"Request a quote",

/* --- prestations --- */
prestaSous:"Photographer in Dijon · Free quote within 48 hours",
formulesTitre:"Three fixed-price sessions",
formulesNote1:"Photos selected and edited, delivered within 10 days in high definition.",
formulesNote2:"Duo, couple, family, a longer session or a particular need: I will send you a quote.",
avisPortraitTitre:"What clients say about it",
devisEyebrow:"Clubs, associations, events", devisTitre:"Sport and events, quote on request",
devisSportPhoto:"View the Handball in Marsannay session", devisEventPhoto:"View the Theatre in Ouanne session",
sportTexte:"Matches, tournaments, training sessions, team photos and player portraits. I select, I edit, and you receive photos ready to post on your social media.",
sportP1:"Selection and editing included", sportP2:"Photos ready for Instagram and Facebook", sportP3:"Optional: a folder of photos per player",
eventTexte:"Shows, concerts, galas, meetings, community days, openings. I am there from start to finish, and you receive a complete report of your event.",
eventP1:"Coverage from start to finish", eventP2:"Photos selected and edited", eventP3:"Delivery within 10 days",
methodEyebrow:"Method", methodTitle:"How it works",
step1T:"We talk", step1D:"We discuss your project and what you expect.",
step2T:"Quote", step2D:"I send you a clear, free quote within 48 hours.",
step3T:"Session", step3D:"On the day, we capture the real moments.",
step4T:"Delivery", step4D:"Photos selected and edited, delivered within 10 days.",
faqEyebrow:"Questions", faqTitle:"Frequently asked questions",
faqQ1:"How does a photo session work?",
faqA1:"We always start by talking through your project: the mood you're after, the location, what you have in mind. On the day, I'll guide you from start to finish, no experience in front of the camera needed. A portrait session lasts about an hour, in a location we choose together. My goal is for you to forget the camera is even there, so the photos stay natural.",
faqQ2:"How much does a session cost?",
faqA2:"For a portrait, the prices are shown just above: €40, €50 or €65 depending on the session, all included. For sport and events, every request is different: describe what you need in the form and I will send you a free quote within 48 hours.",
faqQ3:"How and when will I get my photos?",
faqA3:"Your sorted and retouched photos are delivered within 10 days in a private online gallery, accessible only with your link. You can view them, download them in high definition and share them with your loved ones. A quick tip: download your photos as soon as you get them, since the gallery stays available for several months, but not forever.",
faqQ4:"Who owns the rights to the photos?",
faqA4:"You receive your photos with full personal usage rights: printing, sharing, social media. On my side, I may publish certain images in my portfolio or on my social media, but only with your consent, which I always ask for beforehand. And if you'd rather keep your photos completely private, that's entirely your right and I respect it without question.",
faqQ5:"What happens if the weather is bad?",
faqA5:"For an outdoor session, if the weather really doesn't cooperate, we simply reschedule to a date that suits you, at no extra cost. Either way, we check in together the day before based on the forecast.",
faqQ6:"How do I book a date?",
faqA6:"Send me a message through the contact form with your preferred date. Once the quote is confirmed, the date is reserved for you. For bigger events (full coverage, associations, clubs), it's best to book several weeks ahead.",
faqQ7:"I'm not comfortable in front of a camera, is that a problem?",
faqA7:"Not at all, and don't worry: that's the case for most people I photograph. My job is precisely to help you feel at ease. We talk, move around, try things out, and the best photos often happen when you least expect them. Keeping it natural is at the heart of how I work.",
faqQ8:"How far do you travel?",
faqA8:"I am based in Dijon, and travel is included within 25 km. I am also regularly in the Yonne (Auxerre, Sens, Joigny, Avallon…) and I travel across Burgundy. Beyond 25 km from Dijon, travel is simply shown in the quote, according to the distance. Is your project further away? Let's talk about it.",

/* --- a propos --- */
aproposSous:"Alexandre ANDREETTI, photographer in Dijon",
moiEyebrow:"Who I am", moiVoir:"See my photos",
compEyebrow:"Skills", compTitre:"What I can do", compDomaines:"Fields", compOutils:"Tools",
c1Titre:"Photography", c1Texte:"Portrait, sport and events, outdoors and indoors. It is my job, and what you see in the portfolio.",
c2Titre:"Editing", c2Texte:"I edit all my photos myself. I even built my own editing studio, tailor-made for my work.", oStudio:"My editing studio",
c3Titre:"Video", c3Texte:"Filming and editing. It is a separate service, mostly for events: on a given date I am either on photo or on video. Tell me about it in your message.",
c4Titre:"Layout and design", c4Texte:"Posters, visuals, documents. I have already created the visual identity of a company.",
coulissesTexte:"Want to see how I work? Behind the scenes of my sessions is on Instagram.", coulissesLien:"See behind the scenes",
sommaireLabel:"On this page", somDeroulement:"How it works", somFaq:"Questions", somVideo:"Video",
videoPossible:"Need a video rather than photos? Filming and editing are a separate service, mostly for events: on a given date I do one or the other. Tell me about it in your message.",
bio1:"A 19-year-old photographer based in Dijon and the Yonne (89), in Burgundy. Portrait, sport, events: what I look for is the natural. Authentic moments, genuine emotions, not forced poses.",
bio2:"I started by photographing what was around me: my family and friends, the sports fields, local parties. That is still how I work: honest images, without artifice.",
bio3:"Today I work with individuals, clubs and associations across the region. My goal is simple: that you are proud of your photos.",
parcoursEyebrow:"Experience", parcoursTitre:"What I have already done",
p1Quand:"October 2024", p1Texte:"<strong>A wedding in Iceland.</strong> My first real paid job, and I was the wedding photographer.",
p2Quand:"Summer 2024", p2Texte:"<strong>The Fet'Estival,</strong> a music festival in Villemoisson-sur-Orge (91): filming 11 bands on two stages, and quite a few photos.",
p3Quand:"February 2023 and February 2024", p3Texte:"<strong>The TIM Essonne,</strong> an international under-14 tennis tournament. The first time as part of my SNU (French national service), the second as a volunteer, because I wanted to go back. I did the photos, the interviews with a journalist and the video editing for the tournament's communication.",
p4Texte:"<strong>Two competitive volleyball matches.</strong>",
p5Quand:"July 2026", p5Texte:"<strong>Theatre,</strong> with the show “Hippolyte et Antiope” at Ouanne church.",
p6Quand:"September 2026", p6Texte:"<strong>My first club,</strong> with a CL Marsannay Handball match.",
p7Texte:"Portrait sessions, in Dijon and in Paris.", p8Texte:"And private events, such as birthdays.",
parcoursPlus:"Alongside photography, I also do video editing (DaVinci Resolve) and layout (Photoshop, Illustrator, InDesign). I have already created the visual identity of a company. I edit all my photos myself.",
parcoursFin:"Does your project look like none of this? Tell me, and I will say frankly whether I am the right person.",
approachTitle:"My approach", approachText:"Listen before pressing the shutter, favour what is natural, deliver careful work on time.",
valeursLabel:"My values", valFiab:"Reliability", valQual:"Quality", valAuth:"Authenticity", valResp:"Respect", valProg:"Progress",

/* --- contact --- */
contactSous:"Photographer in Dijon · Free quote", contactIntro:"Tell me what you are looking for, even in two lines. I reply within 48 hours.",
lblNom:"Your name", lblEmail:"Your email address", lblPrestation:"What you are interested in", lblMessage:"Your message",
aideMessage:"If you know them: the date, the place, the number of people.",
coordTitle:"Contact details", coordLoc:"Dijon and the Yonne (89), travel across Burgundy", coordResp:"Reply within 48 hours, free quote",

/* --- page liens --- */
lkLabel:"My links", lkPages:"Pages of the site", lkSub:"Portrait, sport and event photographer", lkGeo:"Dijon · Côte-d'Or · Yonne",
lkDevisDetail:"Portrait, sport, events", lkSite:"See my photos", lkSiteDetail:"The portfolio, session by session",
lkFacebook:"My Facebook page", lkAvis:"Leave a Google review", lkAvisDetail:"It helps me a lot (30 seconds)",
lkMail:"Write me an email", lkExplorer:"Explore the site",

/* --- merci, page introuvable --- */
merciTitre:"Message sent", merciTexte:"Thank you for your message. I will reply within 48 hours.",
merciSpam:"If you have no reply within 48 hours, please check your spam folder.",
introuvableTitre:"Page not found", introuvableTexte:"This page does not exist, or it has been moved.",

/* --- mentions legales --- */
mlTitre:"Legal notice and privacy", mlMaj:"Last updated: October 2026",
mlEditeurT:"Publisher", mlEditeur1:"The website <strong>andreettiphoto.fr</strong> is published by <strong>Alexandre ANDREETTI</strong>, photographer.",
mlLocalisation:"Location: Dijon (21), France", mlMailLabel:"Email:", mlTelLabel:"Phone:", mlEditeur2:"Publication director: Alexandre ANDREETTI.",
mlHebergeurT:"Hosting", mlHebergeur1:"The site is hosted by <strong>Netlify, Inc.</strong>", mlEtatsUnis:"United States",
mlProprieteT:"Intellectual property",
mlPropriete1:"All photographs, texts and graphic elements on this site are the exclusive property of Alexandre ANDREETTI, unless stated otherwise. Any reproduction, representation, distribution or download, in whole or in part, without prior written permission is forbidden and constitutes an infringement (articles L.335-2 and following of the French Intellectual Property Code).",
mlDonneesT:"Personal data (GDPR)",
mlDonnees1:"The contact form collects <strong>your name</strong>, <strong>your email address</strong>, the service you are interested in and <strong>your message</strong>, for the sole purpose of answering your request.",
mlDonnees2:"This information is sent by email (through the Netlify Forms and Resend services) and is neither sold nor passed on to third parties. It is kept for as long as needed to handle your request, then deleted.",
mlDonnees3:"Under the GDPR, you have the right to access, correct and delete your data: simply ask by email at <a href=\"mailto:contact@andreettiphoto.fr\">contact@andreettiphoto.fr</a>.",
mlCookiesT:"Cookies",
mlCookies1:"This site uses <strong>no tracking or advertising cookies</strong>. Only two preferences (light or dark theme, and the chosen language) are stored in your browser. They are never sent anywhere.",
mlCookies2:"The fonts are served by the site itself: opening a page does not contact any outside service.",
mlAudienceT:"Audience measurement",
mlAudience1:"This site uses <strong>Umami</strong>, a privacy-friendly statistics tool, to know how the site is used (number of visits, pages viewed, content visitors are interested in).",
mlAudience2:"No cookie is set and no personal data is collected: the figures are anonymous and aggregated. No visitor is identified individually, and no data is sold or used for advertising. In line with the recommendations of the CNIL, this anonymous audience measurement requires no prior consent.",
mlVideoT:"Video",
mlVideo1:"When a video is offered on the site, it is hosted by YouTube. Nothing is loaded from YouTube until you play the video. If you play it, YouTube may set its own cookies, under its own rules.",
mlAvisT:"Client reviews",
mlAvis1:"The reviews shown on this site are copied word for word from the Google profile of ANDREETTI Photography, where anyone can check them. Only the author's first name is shown. In the English version of the site they are translated, and this is stated under each review.",
mlReseauxT:"Social media",
mlReseaux1:"You can follow the work of Alexandre ANDREETTI on <a href=\"https://instagram.com/andreetti.photography\" target=\"_blank\" rel=\"noopener noreferrer\">Instagram</a>, <a href=\"https://www.facebook.com/Andreetti.photography\" target=\"_blank\" rel=\"noopener noreferrer\">Facebook</a> and <a href=\"https://www.linkedin.com/in/alexandre-andreetti/\" target=\"_blank\" rel=\"noopener noreferrer\">LinkedIn</a>."
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
