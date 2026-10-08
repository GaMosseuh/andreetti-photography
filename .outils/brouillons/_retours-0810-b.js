/* Retours d Alexandre du 8 octobre au soir, suite : sommaire, lien « Liens » en haut, FAQ,
   mentions legales, textes anglais. Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "..");
function modifier(f, paires) {
  const p = path.join(R, f); let t = fs.readFileSync(p, "utf8");
  for (const [a, b] of paires) { if (!t.includes(a)) { console.log("ABSENT dans " + f + " : " + a.slice(0, 70)); continue; } t = t.split(a).join(b); }
  fs.writeFileSync(p, t); console.log(f + " : fait");
}
const nb = " ";

modifier("prestations.html", [
  ["</header>\n\n<!-- PORTRAIT : trois formules",
   "</header>\n\n<!-- SOMMAIRE DE LA PAGE : un clic emmene a la partie voulue. A gauche sur grand ecran,\n     en bandeau sous le menu sur telephone. Chaque lien vise l id d une partie de la page. -->\n" +
   '<nav class="sommaire" aria-label="Sur cette page" data-i18n-attr="aria-label:sommaireLabel">\n' +
   '<a href="#portrait" data-i18n="catPortrait">Portrait</a>\n<a href="#sport" data-i18n="catSport">Sport</a>\n<a href="#evenementiel" data-i18n="catEvent">Événementiel</a>\n' +
   '<a href="#deroulement" data-i18n="somDeroulement">Déroulement</a>\n<a href="#faq" data-i18n="somFaq">Questions</a>\n</nav>\n\n<!-- PORTRAIT : trois formules'],
  ['<section class="section" aria-labelledby="methodeTitre">', '<section class="section" id="deroulement" aria-labelledby="methodeTitre">'],
  ["</article>\n</div>\n</section>",
   "</article>\n" +
   '<p class="devis-plus" data-i18n="videoPossible">Besoin aussi d\'une vidéo' + nb + "? Je fais du montage, et je peux en proposer un en plus des photos selon votre demande" + nb + ": dites-le dans votre message.</p>\n</div>\n</section>"],
  ["car la galerie ne reste pas en ligne indéfiniment.", "car la galerie reste disponible plusieurs mois, mais pas indéfiniment."]
]);

modifier("apropos.html", [
  ["</header>\n\n<!-- QUI JE SUIS.",
   "</header>\n\n<!-- SOMMAIRE DE LA PAGE (voir prestations.html) -->\n" +
   '<nav class="sommaire" aria-label="Sur cette page" data-i18n-attr="aria-label:sommaireLabel">\n' +
   '<a href="#moi" data-i18n="moiEyebrow">Qui je suis</a>\n<a href="#competences" data-i18n="compEyebrow">Compétences</a>\n<a href="#experiences" data-i18n="parcoursEyebrow">Expériences</a>\n' +
   '<a href="#video" data-si="video" data-i18n="somVideo" hidden>Vidéo</a>\n<a href="#approche" data-i18n="approachTitle">Mon approche</a>\n</nav>\n\n<!-- QUI JE SUIS.'],
  ['<li data-i18n="uPortrait">', '<li data-i18n="catPortrait">'], ['<li data-i18n="uSport">', '<li data-i18n="catSport">'], ['<li data-i18n="uEvent">', '<li data-i18n="catEvent">']
]);

modifier("mentions-legales.html", [["Localisation" + "&nbsp;: Yonne (89), France", "Localisation" + "&nbsp;: Dijon (21), France"]]);

modifier("assets/i18n.js", [
  ['mlLocalisation:"Location: Yonne (89), France"', 'mlLocalisation:"Location: Dijon (21), France"'],
  ["since the gallery isn't kept online forever.", "since the gallery stays available for several months, but not forever."],
  ['navContact:"Contact",', 'navContact:"Contact", navLinks:"Links",'],
  ['aproposSous:"Alexandre ANDREETTI, photographer in Dijon",',
   'aproposSous:"Alexandre ANDREETTI, photographer in Dijon",\n' +
   'moiEyebrow:"Who I am", moiVoir:"See my photos",\n' +
   'compEyebrow:"Skills", compTitre:"What I can do", compDomaines:"Fields", compOutils:"Tools",\n' +
   'c1Titre:"Photography", c1Texte:"Portrait, sport and events, outdoors and indoors. It is my job, and what you see in the portfolio.",\n' +
   'c2Titre:"Editing", c2Texte:"I edit all my photos myself. I even built my own editing studio, tailor-made for my work.", oStudio:"My editing studio",\n' +
   'c3Titre:"Video", c3Texte:"Filming and editing. Depending on your request, I can offer a video edit on top of the photos: tell me about it in your message.",\n' +
   'c4Titre:"Layout and design", c4Texte:"Posters, visuals, documents. I have already created the visual identity of a company.",\n' +
   'sommaireLabel:"On this page", somDeroulement:"How it works", somFaq:"Questions", somVideo:"Video",\n' +
   'videoPossible:"Need a video too? I do video editing, and I can offer one on top of the photos depending on your request: just say so in your message.",']
]);

modifier(".outils/construire.js", [
  ['["apropos", "/apropos", "navAbout", "À propos"], ["contact"', '["apropos", "/apropos", "navAbout", "À propos"], ["links", "/links", "navLinks", "Liens"], ["contact"']
]);
