/* Retours d Alexandre du 9 octobre au soir : ordre melange dans « Toutes les photos », titres
   mis en valeur, bande sur Prestations, encadres. Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "..");
function fichier(f, paires) {
  const p = path.join(R, f); let t = fs.readFileSync(p, "utf8");
  for (const [a, b] of paires) { if (!t.includes(a)) { console.log("   ABSENT dans " + f + " : " + a.slice(0, 80)); continue; } t = t.replace(a, b); }
  fs.writeFileSync(p, t); console.log(f + " : fait");
}

fichier("assets/rendu.js", [
  ["function tuile(p){\n  return '<a class=\"tuile\" href=\"/portfolio?photo=' + encodeURIComponent(p.id) + '\" data-photo=\"' + ech(p.id) + '\" style=\"--r:' + p.r + '\">' +\n    image(p, '(max-width:520px) 60vw, (max-width:900px) 42vw, 30vw') + '</a>';\n}",
   "function tuile(p){\n  /* le nom de la seance apparait au survol, dans « Toutes les photos » (voir .tuile-titre) */\n  var s = p.serie ? serie(p.serie) : null;\n  return '<a class=\"tuile\" href=\"/portfolio?photo=' + encodeURIComponent(p.id) + '\" data-photo=\"' + ech(p.id) + '\" style=\"--r:' + p.r + '\">' +\n    image(p, '(max-width:520px) 60vw, (max-width:900px) 42vw, 30vw') +\n    (s ? '<span class=\"tuile-titre\" aria-hidden=\"true\">' + ech(txt(s.titre)) + '</span>' : '') + '</a>';\n}"],
  ["/* toutes les photos, dans l ordre de data.js */\nfunction toutesLesPhotos(){ var out = []; if(typeof PHOTOS !== 'undefined') PHOTOS.forEach(function(p){ var x = photo(p.id); if(x) out.push(x); }); return out; }",
   "/* toutes les photos : dans l ordre de data.js, ou dans l ordre melange choisi a l ouverture\n   du portfolio (ORDRE_PHOTOS, une liste d id posee par portfolio.js) */\nvar ORDRE_PHOTOS = null;\nfunction ordonner(ids){ ORDRE_PHOTOS = ids && ids.length ? ids : null; }\nfunction toutesLesPhotos(){\n  var out = []; if(typeof PHOTOS === 'undefined') return out;\n  if(ORDRE_PHOTOS){ ORDRE_PHOTOS.forEach(function(id){ var x = photo(id); if(x) out.push(x); }); return out; }\n  PHOTOS.forEach(function(p){ var x = photo(p.id); if(x) out.push(x); }); return out;\n}"],
  ["video: video, videoPresente: videoPresente,", "video: video, videoPresente: videoPresente, ordonner: ordonner,"]
]);

fichier("assets/portfolio.js", [
  ["/* ---------- affichage ---------- */",
   "/* ---------- « Toutes les photos » : un ordre different a chaque visite ----------\n" +
   "   Les photos sont melangees au hasard, avec une regle : deux photos de la meme seance (donc\n" +
   "   de la meme personne) ne se suivent jamais de pres. On tire chaque photo au sort parmi les\n" +
   "   seances qui ne sont pas apparues dans les dernieres places ; les seances qui ont le plus\n" +
   "   de photos restantes ont plus de chances, pour ne pas finir avec un paquet de la meme. */\n" +
   "function melanger(){\n" +
   "  var groupes = {}, cles = [];\n" +
   "  PHOTOS.forEach(function(p){\n" +
   "    if(!R.photo(p.id)) return;\n" +
   "    var c = p.serie || ('seule-' + p.id);\n" +
   "    if(!groupes[c]){ groupes[c] = []; cles.push(c); }\n" +
   "    groupes[c].push(p.id);\n" +
   "  });\n" +
   "  cles.forEach(function(c){ var g = groupes[c]; for(var i = g.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var x = g[i]; g[i] = g[j]; g[j] = x; } });\n" +
   "  var sortie = [], derniers = [], ECART = 4;\n" +
   "  function reste(){ return cles.filter(function(c){ return groupes[c].length; }); }\n" +
   "  var r = reste();\n" +
   "  while(r.length){\n" +
   "    var possibles = [], ecart = ECART;\n" +
   "    while(!possibles.length && ecart >= 0){\n" +
   "      var recents = derniers.slice(-ecart);\n" +
   "      possibles = r.filter(function(c){ return ecart === 0 || recents.indexOf(c) === -1; });\n" +
   "      ecart--;\n" +
   "    }\n" +
   "    var total = 0; possibles.forEach(function(c){ total += groupes[c].length * groupes[c].length; });\n" +
   "    var tirage = Math.random() * total, choisi = possibles[0];\n" +
   "    for(var k = 0; k < possibles.length; k++){ tirage -= groupes[possibles[k]].length * groupes[possibles[k]].length; if(tirage <= 0){ choisi = possibles[k]; break; } }\n" +
   "    sortie.push(groupes[choisi].pop()); derniers.push(choisi);\n" +
   "    r = reste();\n" +
   "  }\n" +
   "  return sortie;\n" +
   "}\n\n" +
   "/* ---------- affichage ---------- */"],
  ["  if(!galerie.querySelector('.tuile')){ galerie.innerHTML = R.galerieToutes(); brancherImages(galerie); }\n  var e = lire();",
   "  R.ordonner(melanger());\n  galerie.innerHTML = R.galerieToutes(); brancherImages(galerie);\n  var e = lire();"]
]);

fichier("prestations.html", [['<header class="entete">', '<header class="entete bande">']]);
fichier("accueil.html", [['<div class="ligne-reseau" style="margin-top:var(--section)">', '<div class="ligne-reseau encadre" style="margin-top:var(--section)">']]);
fichier("apropos.html", [['<section class="section appel">', '<section class="section appel encadre-appel">']]);
fichier(".outils/verifier.js", [['const permises = ["visioTourne", "entree", "entreeDouce", "apparition"];', 'const permises = ["visioTourne", "entree", "entreeDouce", "apparition", "dezoom"];']]);
