/* Retours d Alexandre du 8 octobre au soir : avis en anglais, serie du festival, cadrage de
   la photo d exemple, zoom plus fort. Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "..");
function modifier(f, paires) {
  const p = path.join(R, f); let t = fs.readFileSync(p, "utf8");
  for (const [a, b] of paires) { if (!t.includes(a)) { console.log("ABSENT dans " + f + " : " + a.slice(0, 70)); continue; } t = t.split(a).join(b); }
  fs.writeFileSync(p, t); console.log(f + " : fait");
}

modifier("assets/data.js", [
  /* avis : traduction anglaise, affichee seulement quand le site est en anglais */
  ['note:5, date:"2026-10-06", source:"google", ou:["accueil","formules"] }',
   'note:5, date:"2026-10-06", source:"google", ou:["accueil","formules"],\n    en:"Great photographer! Alexandre is very respectful and knows how to put you at ease! The photos are gorgeous. I had a really good time :) I highly recommend him!" }'],
  ['note:5, date:"2026-09-15", source:"google", ou:["accueil","formules"] }',
   'note:5, date:"2026-09-15", source:"google", ou:["accueil","formules"],\n    en:"A great experience!!! The photos are really beautiful and Alexandre knew how to put me at ease!!\\nThanks again" }'],
  ['note:5, date:"2026-08-27", source:"google", ou:["accueil"] }',
   'note:5, date:"2026-08-27", source:"google", ou:["accueil"],\n    en:"Great shoot in Paris with Alexandre, we walked around the Luxembourg Gardens and took lots of great photos. Thank you so much!!" }'],
  ['note:5, date:"2026-07-17", source:"google", ou:["accueil","contact"] }',
   'note:5, date:"2026-07-17", source:"google", ou:["accueil","contact"],\n    en:"Alexandre did a remarkable job at our wedding. He managed to capture the most beautiful day of our lives with great technique and stayed professional throughout the evening.\\nThanks again!" }'],
  /* la serie du festival */
  ['  { id:"islande", univers:"evenement", date:"2024-10"',
   '  { id:"festival", univers:"evenement", date:"2024-07", dateTexte:{fr:"Été 2024", en:"Summer 2024"}, couverture:"event-02", accueil:false,\n' +
   '    titre:{fr:"Festival de musique", en:"Music festival"},\n' +
   '    lieu:{fr:"", en:""},\n' +
   '    texte:{fr:"Un festival de musique, à l\'été 2024 : la captation vidéo de 11 groupes sur deux scènes, et pas mal de photos.",\n' +
   '           en:"A music festival in summer 2024: I filmed 11 bands on two stages, and took quite a few photos."} },\n\n' +
   '  { id:"islande", univers:"evenement", date:"2024-10"'],
  ['{id:"event-02", cat:"evenement", alt:', '{id:"event-02", cat:"evenement", serie:"festival", alt:'],
  ['{id:"event-05", cat:"evenement", alt:', '{id:"event-05", cat:"evenement", serie:"festival", alt:'],
  ['{id:"event-04", cat:"evenement", alt:{fr:"Guitariste sur scène pendant un concert", en:"A guitarist on stage during a concert"}}',
   '{id:"event-04", cat:"evenement", serie:"festival", alt:{fr:"Saxophoniste sur scène pendant un concert", en:"A saxophonist on stage during a concert"}}'],
  /* photo d exemple de la formule essentiel : le visage est a gauche de la photo */
  ['{ id:"essentiel", prix:50, photos:10, exemple:"portrait-08",', '{ id:"essentiel", prix:50, photos:10, exemple:"portrait-08", cadrage:"26% 50%",'],
  ['   exemple : l id de la photo montree a cote de la formule ; un clic l ouvre dans le portfolio. */',
   '   exemple : l id de la photo montree a cote de la formule ; un clic l ouvre dans le portfolio.\n   cadrage : (facultatif) ou placer la photo dans son cadre quand le sujet n est pas au centre,\n             ex. "26% 50%" = decalee vers la gauche. Sans rien : centree. */']
]);

modifier("assets/rendu.js", [
  ["'<blockquote><p>« ' + ech(a.texte) + ' »</p></blockquote>' +",
   "'<blockquote' + (traduit ? ' lang=\"en\"' : ' lang=\"fr\"') + '><p>« ' + ech(traduit ? a.en : a.texte) + ' »</p></blockquote>' +\n    (traduit ? '<p class=\"avis-traduit\">' + ech(trad('avisTraduit')) + '</p>' : '') +"],
  ["  return '<figure class=\"avis\">' + etoiles(a.note) +",
   "  /* en anglais, on montre la traduction (champ \"en\") et on le dit ; le francais reste l original */\n  var traduit = (typeof curLang !== 'undefined' && curLang === 'en' && !!a.en);\n  return '<figure class=\"avis\">' + etoiles(a.note) +"],
  ["image(p, '(max-width:760px) 100vw, 30vw') + '<span class=\"formule-exemple\">'",
   "image(p, '(max-width:760px) 100vw, 30vw').replace('<img ', f.cadrage ? '<img style=\"object-position:' + ech(f.cadrage) + '\" ' : '<img ') + '<span class=\"formule-exemple\">'"],
  ["ech(univers(s.univers)) + ' · ' + ech(date(s.date, true))", "ech(univers(s.univers)) + ' · ' + ech(dateSerie(s, true))"],
  ["ech(univers(s.univers)) + ' · ' + ech(date(s.date)) + (lieu", "ech(univers(s.univers)) + ' · ' + ech(dateSerie(s)) + (lieu"],
  ["function unAvis(a){", "/* la date d une seance : son texte libre s il existe (ex. « Ete 2024 »), sinon sa date */\nfunction dateSerie(s, sansJour){ return s.dateTexte ? txt(s.dateTexte) : date(s.date, sansJour); }\nfunction unAvis(a){"],
  ["video: video, videoPresente: videoPresente,", "video: video, videoPresente: videoPresente, dateSerie: dateSerie,"]
]);

modifier("assets/portfolio.js", [
  ["L(s.titre) + ' · ' + dateLisible(s.date, true)", "L(s.titre) + ' · ' + R.dateSerie(s, true)"]
]);

modifier("assets/i18n.js", [
  ['  avisBadge:       {fr:"Avis Google", en:"Google review"},',
   '  avisBadge:       {fr:"Avis Google", en:"Google review"},\n  avisTraduit:     {fr:"Traduit du français", en:"Translated from French"},']
]);

modifier("assets/visionneuse.js", [
  ["/* Zoom maximum : de quoi verifier la nettete (jusqu a 2 fois les pixels du fichier),\n   au moins 3 fois la photo entiere, au plus 8. */",
   "/* Zoom maximum : tres fort, pour aller chercher un detail (jusqu a 5 fois les pixels du\n   fichier), au moins 8 fois la photo entiere, au plus 20. Au-dela des pixels du fichier\n   l image devient forcement plus douce : c est normal, il n y a pas plus de detail. */"],
  ["  return borne(2 * maxL / baseL, 3, 8);", "  return borne(5 * maxL / baseL, 8, 20);"]
]);
