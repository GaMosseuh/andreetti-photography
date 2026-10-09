/* Retours d Alexandre du 9 octobre : seances Elsa, Celia, Alyson, Fet Estival, filigrane de
   Ouanne, photo d exemple de la formule essentiel, video d essai. Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "..");
const f = path.join(R, "assets", "data.js");
let t = fs.readFileSync(f, "utf8");
function rempl(a, b, tous) { if (!t.includes(a)) { console.log("ABSENT : " + a.slice(0, 80)); return; } t = tous ? t.split(a).join(b) : t.replace(a, b); }
function bloc(debut, fin, nouveau) { const i = t.indexOf(debut), j = t.indexOf(fin, i); if (i < 0 || j < 0) { console.log("BLOC ABSENT : " + debut.slice(0, 60)); return; } t = t.slice(0, i) + nouveau + t.slice(j); }

/* 1. les photos de Ouanne ne portent aucune signature incrustee : le site doit poser la sienne */
rempl(' serie:"ouanne", nowmark:true,', ' serie:"ouanne",', true);

/* 2. Elsa : la seance, affichee « Octobre 2026 » (choix d Alexandre, la seance a eu lieu fin septembre) */
bloc('  { id:"elsa", univers:"portrait"', '  { id:"marsannay"',
  '  { id:"elsa", univers:"portrait", date:"2026-10", couverture:"portrait-elsa-06", accueil:true,\n' +
  '    titre:{fr:"Portrait avec Elsa", en:"Portrait session with Elsa"},\n' +
  '    lieu:{fr:"Parc de la Colombière, Dijon", en:"Parc de la Colombière, Dijon"},\n' +
  '    texte:{fr:"Séance portrait avec Elsa, au parc de la Colombière, à Dijon.",\n' +
  '           en:"A portrait session with Elsa at the Parc de la Colombière in Dijon."},\n' +
  '    texteAccueil:{fr:"Séance portrait avec Elsa, au parc de la Colombière, à Dijon. Elle a passé un bon moment, et c\'est elle qui le dit : son avis est juste en dessous.",\n' +
  '                  en:"A portrait session with Elsa at the Parc de la Colombière in Dijon. She had a good time, and those are her words: her review is just below."},\n' +
  '    imageAccueil:"seance-elsa.webp" },\n\n');

/* 3. Celia et Alyson, apres Marsannay */
rempl('  { id:"ouanne", univers:"evenement"',
  '  { id:"celia", univers:"portrait", date:"2026-09", couverture:"portrait-celia-01", accueil:false,\n' +
  '    titre:{fr:"Portrait avec Célia", en:"Portrait session with Célia"},\n' +
  '    lieu:{fr:"Dijon", en:"Dijon"},\n' +
  '    texte:{fr:"Séance portrait avec Célia, à Dijon, en septembre 2026.",\n' +
  '           en:"A portrait session with Célia in Dijon, in September 2026."} },\n\n' +
  '  { id:"alyson", univers:"portrait", date:"2026-09", couverture:"portrait-alyson-08", accueil:false,\n' +
  '    titre:{fr:"Portrait avec Alyson", en:"Portrait session with Alyson"},\n' +
  '    lieu:{fr:"Dijon", en:"Dijon"},\n' +
  '    texte:{fr:"Séance portrait avec Alyson, à Dijon, en septembre 2026.",\n' +
  '           en:"A portrait session with Alyson in Dijon, in September 2026."} },\n\n' +
  '  { id:"ouanne", univers:"evenement"');

/* 4. le festival porte son vrai nom */
bloc('    titre:{fr:"Festival de musique", en:"Music festival"},', '  { id:"islande"',
  '    titre:{fr:"Fet\'Estival", en:"Fet\'Estival"},\n' +
  '    lieu:{fr:"Villemoisson-sur-Orge (91)", en:"Villemoisson-sur-Orge (91)"},\n' +
  '    texte:{fr:"Le Fet\'Estival, un festival de musique à Villemoisson-sur-Orge (91), à l\'été 2024 : la captation vidéo de 11 groupes sur deux scènes, et pas mal de photos.",\n' +
  '           en:"The Fet\'Estival, a music festival in Villemoisson-sur-Orge (91), in summer 2024: I filmed 11 bands on two stages, and took quite a few photos."} },\n\n');

/* 5. les 23 nouvelles photos, melees aux autres en tete de « Toutes les photos » */
const P = (id, serie, fr, en) => '  {id:"' + id + '", cat:"portrait", serie:"' + serie + '", alt:{fr:"' + fr + '", en:"' + en + '"}},';
const E = (n, fr, en) => P("portrait-elsa-0" + n, "elsa", "Portrait d'Elsa, parc de la Colombière à Dijon : " + fr, "Portrait of Elsa, Parc de la Colombière in Dijon: " + en);
const C = (n, fr, en) => P("portrait-celia-0" + n, "celia", "Portrait de Célia, à Dijon : " + fr, "Portrait of Célia in Dijon: " + en);
const A = (n, fr, en) => P("portrait-alyson-0" + n, "alyson", "Portrait d'Alyson, à Dijon : " + fr, "Portrait of Alyson in Dijon: " + en);
const nouvelles = [
  E(6, "sur une balançoire, souriante", "on a swing, smiling"),
  A(8, "en chapeau, regard vers l'objectif", "wearing a hat, looking at the camera"),
  C(1, "assise sur un muret, en robe à fleurs", "sitting on a low wall in a floral dress"),
  E(7, "accoudée à une table, la tête dans la main", "leaning on a table, head resting on her hand"),
  A(2, "de profil, en noir et blanc", "in profile, in black and white"),
  C(3, "de profil, la main dans les cheveux", "in profile, a hand in her hair"),
  E(1, "en marche dans une allée", "walking along a path"),
  A(1, "ajustant son chapeau", "adjusting her hat"),
  C(5, "assise, les mains dans les cheveux", "sitting, hands in her hair"),
  E(4, "de profil, en noir et blanc", "in profile, in black and white"),
  A(7, "de profil, en gros plan", "close-up in profile"),
  C(2, "en marche dans une allée, en noir et blanc", "walking along a path, in black and white"),
  E(8, "adossée à un arbre", "leaning against a tree"),
  A(3, "debout, les mains sur les hanches", "standing, hands on her hips"),
  C(4, "assise sur un rocher", "sitting on a rock"),
  E(2, "assise au pied d'un arbre", "sitting at the foot of a tree"),
  A(6, "en pied, dans une allée du parc", "full-length, on a path in the park"),
  C(6, "assise au milieu de la verdure", "sitting among the greenery"),
  E(3, "de profil, le visage levé", "in profile, face raised"),
  A(4, "de profil, en chapeau", "in profile, wearing a hat"),
  E(5, "en marche, un sac à la main", "walking, a bag in her hand"),
  A(5, "de dos dans une allée, en noir et blanc", "from behind on a path, in black and white"),
  E(9, "assise sur un banc, en noir et blanc", "sitting on a bench, in black and white")
];
rempl("var PHOTOS = [\n", "var PHOTOS = [\n" + nouvelles.join("\n") + "\n");

/* 6. la photo d exemple de la formule essentiel : Elsa sur la balancoire */
rempl('exemple:"portrait-08", cadrage:"26% 50%",', 'exemple:"portrait-elsa-06",');

/* 7. la video : un identifiant d ESSAI (un clip que j aime bien), pour voir le bloc en place.
      "essai:true" bloque la mise en ligne tant que ce n est pas ma vraie video. */
rempl('  youtube: "",\n  vignette: "",', '  youtube: "xzBTvODwmr8",\n  essai: true,          // VIDEO D ESSAI : a remplacer par ma vraie video, puis retirer cette ligne\n  vignette: "",');
rempl('   vignette : (facultatif)', '   essai    : true tant que la video n est qu un essai ; la verification d avant mise en ligne\n              refuse alors de laisser partir le site.\n   vignette : (facultatif)');

fs.writeFileSync(f, t); console.log("data.js : fait");
