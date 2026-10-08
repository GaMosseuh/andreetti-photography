/* CONSTRUIRE — remet a jour les parties communes et les blocs de donnees dans les pages.
   (Dossier .outils : jamais publie.)

   A LANCER apres avoir modifie assets/data.js, .outils/pages.js, ou ce fichier :
       node .outils/construire.js
   Il ne supprime rien et ne touche qu a ce qui se trouve ENTRE des reperes :
       <!--@tete-->  ...  <!--/@tete-->      l en-tete invisible (titre, description, Google)
       <!--@haut-->  ...  <!--/@haut-->      la barre du haut et le menu
       <!--@bas-->   ...  <!--/@bas-->       le pied de page et les scripts
       <!--@visio--> ...  <!--/@visio-->     la visionneuse
       <!--@bloc nom:reglage--> ... <!--/@bloc-->   un bloc venant de data.js (avis, seances...)
   Tout le reste d une page s ecrit a la main, directement dans le fichier .html.
   Le deploiement automatique (GitHub) le lance aussi, juste avant de publier. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const RACINE = path.join(__dirname, "..");
const { SITE, NOM, PAGES } = require("./pages.js");
const lire = f => fs.readFileSync(path.join(RACINE, f), "utf8");

/* ---------- on charge les donnees du site exactement comme le fait le navigateur ---------- */
function chargerDonnees() {
  const faux = { querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, dispatchEvent() {}, createElement: () => ({}), head: { appendChild() {} },
    documentElement: { setAttribute() {}, getAttribute: () => null, classList: { add() {}, remove() {}, toggle() {} } } };
  const ctx = { document: faux, localStorage: { getItem: () => null, setItem() {} }, console, CustomEvent: function () {} };
  ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["assets/i18n.js", "assets/data.js", "assets/dimensions.js", "assets/rendu.js"]) {
    /* "use strict" en tete d un fichier empecherait ses "var" de rester visibles ici */
    let code = lire(f).replace(/^\s*"use strict";/m, "");
    /* var X -> this.X pour que les donnees soient visibles d un fichier a l autre */
    vm.runInContext(code, ctx, { filename: f });
  }
  return ctx;
}

/* ---------- petites icones (traits fins, couleur du texte) ---------- */
const ICONES = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8.3V14h2.2v7z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 8.5H4.2V19h2.74zM5.57 4.5A1.59 1.59 0 104 6.09 1.58 1.58 0 005.57 4.5M20 19v-5.77c0-3.08-1.64-4.51-3.83-4.51a3.3 3.3 0 00-3 1.64V8.5h-2.6V19h2.74v-5.55c0-1.46.28-2.87 2.08-2.87s1.8 1.66 1.8 3V19z"/></svg>',
  partage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.3M8.3 13.3l7.4 4.3"/></svg>',
  theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 000 17z" fill="currentColor" stroke="none"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" stroke-linejoin="round"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
  telephone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.700a2 2 0 012-2.200z" stroke-linejoin="round"/></svg>',
  lieu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-6.500-5.800-6.500-10.500a6.500 6.500 0 0113 0C18.500 15.200 12 21 12 21z"/><circle cx="12" cy="10.500" r="2.300"/></svg>',
  horloge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L20 20M8 10.500h5M10.500 8v5"/></svg>',
  moins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L20 20M8 10.500h5"/></svg>',
  ecran: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  precedent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg>',
  suivant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>'
};
const ech = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Le numero de telephone : on l ecrit de facon a gener les robots qui ramassent les numeros
   sans rien changer pour un visiteur. Dans le texte, chaque chiffre est ecrit par son code
   (le navigateur affiche "06 82 ..." normalement, un robot qui lit le fichier brut ne voit
   pas un numero). Le lien "appeler" est pose par le script au chargement de la page. */
function telChiffres(tel) { return tel.split("").map(c => /\d/.test(c) ? "&#" + c.charCodeAt(0) + ";" : (c === " " ? "&nbsp;" : c)).join(""); }
function telCode(lien) { return Buffer.from(lien, "utf8").toString("base64"); }
function telEchappe(lien) { return lien.split("").map(c => "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4)).join(""); }
function lienTel(C, classe) {
  return '<a class="tel' + (classe ? " " + classe : "") + '" data-tel="' + telCode(C.telLien) + '" href="/contact">' + telChiffres(C.telephone) + "</a>";
}

/* ---------- les donnees pour Google (JSON-LD) ---------- */
function service(D) {
  const C = D.COORDONNEES;
  const offres = D.FORMULES.map(f => ({ "@type": "Offer", name: f.nom.fr + " (" + f.duree.fr + ", " + f.photos + " photos retouchées)", price: String(f.prix), priceCurrency: "EUR",
    itemOffered: { "@type": "Service", name: f.nom.fr, serviceType: "Photographie de portrait" } }));
  offres.push({ "@type": "Offer", itemOffered: { "@type": "Service", name: "Reportage sportif", serviceType: "Photographie de sport" } });
  offres.push({ "@type": "Offer", itemOffered: { "@type": "Service", name: "Reportage événementiel", serviceType: "Photographie événementielle" } });
  return {
    "@context": "https://schema.org", "@type": "ProfessionalService", "@id": SITE + "/#photographe",
    name: NOM, alternateName: "Alexandre ANDREETTI, photographe",
    description: "Photographe portrait, sport et événementiel à Dijon (21) et dans l'Yonne (89). Devis gratuit, réponse sous 48 h, photos livrées sous 10 jours. Déplacement compris jusqu'à 25 km autour de Dijon.",
    url: SITE + "/", image: SITE + "/images/partage.webp", logo: SITE + "/images/partage.webp",
    email: C.mail, telephone: "@TEL@",
    address: { "@type": "PostalAddress", addressLocality: "Dijon", addressRegion: "Bourgogne-Franche-Comté", addressCountry: "FR" },
    areaServed: [{ "@type": "City", name: "Dijon" }, { "@type": "AdministrativeArea", name: "Côte-d'Or (21)" }, { "@type": "AdministrativeArea", name: "Yonne (89)" }],
    knowsAbout: ["Photographie de portrait", "Photographie de sport", "Photographie événementielle"],
    availableLanguage: ["fr", "en"],
    founder: { "@id": SITE + "/#alexandre" },
    sameAs: [C.instagram, C.facebook, D.GOOGLE_FICHE_URL],
    makesOffer: offres
  };
}
function personne(D) {
  const C = D.COORDONNEES;
  return { "@context": "https://schema.org", "@type": "Person", "@id": SITE + "/#alexandre", name: "Alexandre ANDREETTI", givenName: "Alexandre", familyName: "ANDREETTI",
    jobTitle: "Photographe", url: SITE + "/apropos", image: SITE + "/images/profil.webp",
    worksFor: { "@id": SITE + "/#photographe" }, homeLocation: { "@type": "City", name: "Dijon" },
    knowsAbout: ["Photographie de portrait", "Photographie de sport", "Photographie événementielle", "Montage vidéo"],
    sameAs: [C.instagram, C.facebook, C.linkedin] };
}
function filAriane(page) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: page.menu || page.titre.split(" · ")[0], item: SITE + page.chemin }] };
}
function galerieGoogle(D) {
  const R = D.Rendu;
  return { "@context": "https://schema.org", "@type": "ImageGallery", name: "Portfolio d'Alexandre ANDREETTI, photographe à Dijon", url: SITE + "/portfolio",
    author: { "@id": SITE + "/#alexandre" },
    image: D.PHOTOS.map(p => { const x = R.photo(p.id); return { "@type": "ImageObject", contentUrl: SITE + x.src, caption: x.alt, width: x.w, height: x.h,
      creator: { "@type": "Person", name: "Alexandre ANDREETTI" }, creditText: "Alexandre ANDREETTI", copyrightNotice: "© Alexandre ANDREETTI" }; }) };
}
/* La FAQ pour Google est lue DANS la page : elle ne peut donc pas dire autre chose que la page. */
function faqGoogle(html) {
  const out = []; const re = /<details class="faq-q"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="faq-a"[^>]*>([\s\S]*?)<\/div>\s*<\/details>/g; let m;
  const net = s => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, " ").trim();
  while ((m = re.exec(html))) out.push({ "@type": "Question", name: net(m[1]), acceptedAnswer: { "@type": "Answer", text: net(m[2]) } });
  return out.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: out } : null;
}
function ld(obj, D) {
  let s = JSON.stringify(obj);
  s = s.replace(/"@TEL@"/g, '"' + telEchappe(D.COORDONNEES.telLien) + '"').replace(/</g, "\\u003c");
  return '<script type="application/ld+json">' + s + "</script>";
}

/* ---------- l en-tete invisible ---------- */
function tete(page, D, htmlPage) {
  const url = SITE + page.chemin, t = ech(page.titre), d = ech(page.description);
  const robots = page.robots || "index, follow, max-image-preview:large, max-snippet:-1";
  let h = [];
  h.push('<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "<title>" + t + "</title>", '<meta name="description" content="' + d + '">',
    '<meta name="author" content="Alexandre ANDREETTI">', '<meta name="robots" content="' + robots + '">',
    '<meta name="geo.region" content="FR-21">', '<meta name="geo.placename" content="Dijon, Côte-d\'Or">');
  if (page.id === "accueil") h.push(
    "<!-- Verification Google Search Console. NE PAS MODIFIER NI SUPPRIMER, meme apres validation :",
    "     Google reverifie regulierement, et sans ces balises l acces a Search Console est perdu.",
    "     La premiere prouve la propriete de l ancienne adresse andreetti-photography.netlify.app",
    "     (necessaire au changement d adresse), la seconde celle de andreettiphoto.fr.",
    "     Le fichier google6071a8daa44044c2.html a la racine fait la meme chose en secours. -->",
    '<meta name="google-site-verification" content="AsFyBL63fL2S-Izu1Oi_3jA-iGOKLUJJGYdxtkft53U" />',
    '<meta name="google-site-verification" content="1CpIicORCdYnNOE4eiCDTbtQpq73NWiVUg8BA25iDsM" />');
  h.push('<meta name="theme-color" content="#F5FAFB" media="(prefers-color-scheme: light)">', '<meta name="theme-color" content="#0E1A1E" media="(prefers-color-scheme: dark)">',
    '<link rel="canonical" href="' + url + '">', '<link rel="alternate" hreflang="fr" href="' + url + '">', '<link rel="alternate" hreflang="x-default" href="' + url + '">',
    "<!-- Theme clair/sombre applique avant l affichage (pas de clignotement). Signale aussi que les scripts fonctionnent. -->",
    "<script>(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('theme');if(s==='dark'||s==='light'){d.setAttribute('data-theme',s);}else{d.setAttribute('data-theme',(window.matchMedia&&window.matchMedia('(prefers-color-scheme:light)').matches)?'light':'dark');}}catch(e){d.setAttribute('data-theme','dark');}})();</script>",
    '<meta property="og:type" content="website">', '<meta property="og:site_name" content="ANDREETTI">', '<meta property="og:title" content="' + t + '">',
    '<meta property="og:description" content="' + d + '">', '<meta property="og:url" content="' + url + '">', '<meta property="og:locale" content="fr_FR">',
    '<meta property="og:image" content="' + SITE + '/images/partage.webp">', '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:title" content="' + t + '">', '<meta name="twitter:description" content="' + d + '">',
    '<meta name="twitter:image" content="' + SITE + '/images/partage.webp">',
    '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">',
    "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230E1A1E'/%3E%3Ctext x='50%25' y='53%25' font-family='Georgia,serif' font-size='40' fill='%23F5FAFB' text-anchor='middle' dominant-baseline='central'%3EA%3C/text%3E%3C/svg%3E\">",
    '<link rel="preload" href="/assets/polices/inter-latin.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/assets/polices/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="stylesheet" href="/assets/styles.css">');
  if (page.id === "accueil") h.push('<link rel="preload" as="image" href="/images/hero.webp" fetchpriority="high">');
  if (!page.robots) {
    h.push(ld(service(D), D));
    if (page.id !== "accueil") h.push(ld(filAriane(page), D));
    if (page.id === "apropos") h.push(ld(personne(D), D));
    if (page.id === "portfolio") h.push(ld(galerieGoogle(D), D));
    if (page.id === "prestations") { const f = faqGoogle(htmlPage); if (f) h.push(ld(f, D)); }
  }
  return h.join("\n");
}

/* ---------- la barre du haut ---------- */
const MENU = [["accueil", "/", "navHome", "Accueil"], ["portfolio", "/portfolio", "navPortfolio", "Portfolio"], ["prestations", "/prestations", "navServices", "Prestations"], ["apropos", "/apropos", "navAbout", "À propos"], ["contact", "/contact", "navContact", "Contact"]];
function reseaux(C, classe) {
  const l = (url, nom, ico, etiquette) => '<a class="' + classe + '" href="' + url + '" target="_blank" rel="noopener noreferrer" aria-label="' + ech(etiquette) + '" title="' + nom + '">' + ico + "</a>";
  return l(C.instagram, "Instagram", ICONES.instagram, "Instagram " + C.instagramNom + " (nouvel onglet)") +
    l(C.facebook, "Facebook", ICONES.facebook, "Facebook d'ANDREETTI Photography (nouvel onglet)") +
    l(C.linkedin, "LinkedIn", ICONES.linkedin, "LinkedIn d'Alexandre ANDREETTI (nouvel onglet)");
}
function haut(page, D) {
  const C = D.COORDONNEES;
  const lien = ([id, href, cle, nom], extra) => '<a' + (id === "contact" && extra ? ' class="nav-contact"' : "") + ' href="' + href + '" data-i18n="' + cle + '"' + (page.id === id ? ' aria-current="page"' : "") + ">" + nom + "</a>";
  return [
    '<a class="lien-evitement" href="#main" data-i18n="evitement">Aller au contenu</a>',
    '<nav class="nav" aria-label="Navigation principale">',
    '<a class="nav-logo" href="/" aria-label="ANDREETTI, accueil">ANDREETTI</a>',
    '<div class="nav-droite">',
    '<div class="nav-liens">' + MENU.map(m => lien(m, true)).join("") + "</div>",
    '<a class="nav-icone nav-ig" href="' + C.instagram + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram ' + C.instagramNom + ' (nouvel onglet)" title="Instagram">' + ICONES.instagram + "</a>",
    '<div class="nav-langue js-seul" data-langues role="group" aria-label="Choisir la langue"></div>',
    '<button class="nav-icone nav-partage js-seul" id="boutonPartage" type="button" onclick="partagerPage()" aria-label="Partager cette page">' + ICONES.partage + "</button>",
    '<button class="nav-icone js-seul" id="boutonTheme" type="button" onclick="basculerTheme()" aria-label="Changer de thème">' + ICONES.theme + "</button>",
    '<button class="burger js-seul" type="button" onclick="basculerMenu()" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menuMobile"><span></span><span></span><span></span></button>',
    "</div>", "</nav>",
    '<div class="menu-mobile" id="menuMobile">' + MENU.filter(m => m[0] !== "contact").map(m => lien(m, false)).join("") +
      '<a class="btn" href="/contact" data-i18n="ctaDevis">Demander mon devis gratuit</a>' +
      '<div class="menu-reseaux">' + reseaux(C, "") + "</div></div>"
  ].join("\n");
}

/* ---------- le pied de page et les scripts ---------- */
function bas(page, D) {
  const C = D.COORDONNEES, an = new Date().getFullYear();
  const scripts = ["i18n.js", "data.js", "dimensions.js", "rendu.js", "common.js", "stats.js"].concat(page.scripts || []);
  return [
    '<footer class="pied">',
    '<div class="contenu pied-grille">',
    '<div class="pied-marque"><a class="pied-logo" href="/" aria-label="ANDREETTI, accueil">ANDREETTI</a>' +
      '<p data-i18n="footTag">Photographe portrait, sport et événementiel à Dijon et dans l\'Yonne</p>' +
      '<p class="pied-promesse" data-i18n="footPromesse">Devis gratuit · Réponse sous 48 h</p></div>',
    '<nav class="pied-nav" aria-label="Plan du site">' + MENU.map(([id, href, cle, nom]) => '<a href="' + href + '" data-i18n="' + cle + '">' + nom + "</a>").join("") + "</nav>",
    '<div class="pied-contact"><a href="mailto:' + C.mail + '">' + C.mail + "</a>" +
      '<div class="reseaux">' + reseaux(C, "reseau") + "</div></div>",
    "</div>",
    '<div class="contenu pied-bas"><span>© ' + an + ' Alexandre ANDREETTI</span>' +
      '<a href="/links" data-i18n="footLinks">Mes liens</a>' +
      '<a href="' + D.GOOGLE_AVIS_URL + '" target="_blank" rel="noopener noreferrer" data-i18n="footReview">Laisser un avis</a>' +
      '<a href="/mentions-legales" data-i18n="legalLink">Mentions légales et confidentialité</a></div>',
    "</footer>",
    page.id === "contact" || page.id === "merci" ? "" : '<a class="devis-flottant" href="/contact">' + ICONES.message + '<span data-i18n="floatCta">Devis gratuit</span></a>',
    scripts.map(s => '<script src="/assets/' + s + '"></script>').join("\n")
  ].filter(Boolean).join("\n");
}

/* ---------- la visionneuse ---------- */
function visio() {
  return [
    '<div class="visio" id="visio" role="dialog" aria-modal="true" aria-label="Photo en grand" hidden>',
    '<div class="visio-barre"><span class="visio-compteur" aria-live="polite"></span><div class="visio-outils">',
    '<button type="button" class="visio-moins" aria-label="Dézoomer" disabled>' + ICONES.moins + "</button>",
    '<button type="button" class="visio-plus" aria-label="Zoomer">' + ICONES.plus + "</button>",
    '<button type="button" class="visio-ecran" aria-label="Plein écran">' + ICONES.ecran + "</button>",
    '<button type="button" class="visio-fermer" aria-label="Fermer">' + ICONES.fermer + "</button>",
    "</div></div>",
    '<div class="visio-scene"><img class="visio-photo" alt="" draggable="false"><span class="visio-filigrane" aria-hidden="true">©&nbsp;ANDREETTI</span>' +
      '<p class="visio-message" role="status" hidden></p><span class="visio-aide" hidden></span></div>',
    '<button type="button" class="visio-prec" aria-label="Photo précédente">' + ICONES.precedent + "</button>",
    '<button type="button" class="visio-suiv" aria-label="Photo suivante">' + ICONES.suivant + "</button>",
    '<div class="visio-pied"><p class="visio-legende"></p></div>',
    "</div>"
  ].join("\n");
}

/* ---------- remplacement entre reperes ---------- */
function entre(html, nom, contenu) {
  const re = new RegExp("(<!--@" + nom + "-->)[\\s\\S]*?(<!--/@" + nom + "-->)");
  if (!re.test(html)) return { html, fait: false };
  return { html: html.replace(re, (m, a, b) => a + "\n" + contenu + "\n" + b), fait: true };
}
function blocs(html, D, page) {
  let n = 0;
  html = html.replace(/(<!--@bloc ([a-zA-Z]+)(?::([a-zA-Z0-9_-]+))?-->)[\s\S]*?(<!--\/@bloc-->)/g, (m, a, nom, reglage, b) => {
    if (typeof D.Rendu[nom] !== "function") throw new Error(page.fichier + " : bloc inconnu « " + nom + " »");
    n++; return a + D.Rendu[nom](reglage) + b;
  });
  /* icones : <!--@icone nom--> ... <!--/@icone--> */
  html = html.replace(/(<!--@icone ([a-z]+)-->)[\s\S]*?(<!--\/@icone-->)/g, (m, a, nom, b) => { if (!ICONES[nom]) throw new Error("icone inconnue : " + nom); return a + ICONES[nom] + b; });
  /* telephone : <!--@tel--> ... <!--/@tel--> */
  html = html.replace(/(<!--@tel-->)[\s\S]*?(<!--\/@tel-->)/g, (m, a, b) => a + lienTel(D.COORDONNEES) + b);
  /* les sections qui n existent que s il y a une video */
  html = html.replace(/<([a-z]+)([^>]*\sdata-si="video"[^>]*)>/g, (m, balise, attrs) => {
    attrs = attrs.replace(/\shidden(="")?/g, "");
    return "<" + balise + attrs + (D.Rendu.videoPresente() ? "" : " hidden") + ">";
  });
  return { html, n };
}

function construire() {
  const D = chargerDonnees();
  const bilan = [];
  for (const page of PAGES) {
    const f = path.join(RACINE, page.fichier);
    if (!fs.existsSync(f)) { bilan.push(page.fichier + " : ABSENT"); continue; }
    let html = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
    const avant = html;
    const b = blocs(html, D, page); html = b.html;
    for (const [nom, contenu] of [["tete", null], ["haut", haut(page, D)], ["bas", bas(page, D)], ["visio", visio()]]) {
      const r = entre(html, nom, nom === "tete" ? tete(page, D, html) : contenu); html = r.html;
    }
    if (html !== avant) fs.writeFileSync(f, html);
    bilan.push(page.fichier + " : " + (html !== avant ? "mis a jour" : "deja a jour") + " (" + b.n + " blocs)");
  }
  /* le plan du site pour Google : adresses sans .html, dates du jour */
  const jour = new Date().toISOString().slice(0, 10);
  const urls = PAGES.filter(p => !p.robots).map(p => "  <url>\n    <loc>" + SITE + p.chemin + "</loc>\n    <lastmod>" + jour + "</lastmod>\n  </url>");
  fs.writeFileSync(path.join(RACINE, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join("\n") + "\n</urlset>\n");
  bilan.push("sitemap.xml : " + urls.length + " adresses, datees du " + jour);
  return bilan;
}
module.exports = { construire, chargerDonnees, ICONES };
if (require.main === module) { try { console.log(construire().join("\n")); } catch (e) { console.error("ECHEC : " + e.message); process.exit(1); } }
