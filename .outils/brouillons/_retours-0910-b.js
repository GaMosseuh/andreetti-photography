/* Retours d Alexandre du 9 octobre, suite : textes (bio, video, coulisses, Fet Estival),
   bande bleue d A propos, photo d exemple ouverte sur place. Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..", "..");
const nb = "&nbsp;";
function fichier(f, fn) { const p = path.join(R, f); let t = fs.readFileSync(p, "utf8"); t = fn(t); fs.writeFileSync(p, t); console.log(f + " : fait"); }
function rempl(t, a, b) { if (!t.includes(a)) { console.log("   ABSENT : " + a.slice(0, 90)); return t; } return t.split(a).join(b); }
/* remplace le contenu d un element repere par data-i18n="cle" (jusqu a la balise fermante donnee) */
function contenu(t, cle, fermante, nouveau) {
  const i = t.indexOf('data-i18n="' + cle + '"'); if (i < 0) { console.log("   CLE ABSENTE : " + cle); return t; }
  const d = t.indexOf(">", i) + 1, f = t.indexOf(fermante, d);
  return t.slice(0, d) + nouveau + t.slice(f);
}
/* remplace la valeur anglaise d une cle du dictionnaire (cle:"...") */
function en(t, cle, valeur) {
  const re = new RegExp("(^|[\\s,{])" + cle + ':"(?:[^"\\\\]|\\\\.)*"', "m");
  if (!re.test(t)) { console.log("   CLE EN ABSENTE : " + cle); return t; }
  return t.replace(re, (m, avant) => avant + cle + ":" + JSON.stringify(valeur));
}

fichier("apropos.html", t => {
  t = rempl(t, '<header class="entete">', '<header class="entete bande">');
  t = contenu(t, "bio1", "</p>", "Photographe de 19" + nb + "ans, basé à Dijon et dans l'Yonne (89), en Bourgogne. Portrait, sport, événementiel" + nb + ": ce que je cherche, c'est le naturel. Les moments authentiques, les émotions vraies, pas les poses forcées.");
  t = contenu(t, "bio2", "</p>", "J'ai commencé par photographier ce qui m'entourait" + nb + ": mes proches, les terrains de sport, les soirées du coin. C'est resté ma façon de faire" + nb + ": des images justes, sans artifice.");
  t = contenu(t, "bio3", "</p>", "Aujourd'hui, je travaille avec des particuliers, des clubs et des associations de la région. Mon but est simple" + nb + ": que vous soyez fier de vos photos.");
  t = contenu(t, "c3Texte", "</p>", "Captation et montage. C'est une prestation à part, plutôt pour les événements" + nb + ": sur une même date, je suis soit à la photo, soit à la vidéo. Parlez-m'en dans votre message.");
  t = rempl(t, "<li>Darktable</li><li>Photoshop Express</li>", "<li>Darktable</li>");
  t = contenu(t, "p2Texte", "</span>", "<strong>Le Fet'Estival,</strong> un festival de musique à Villemoisson-sur-Orge (91)" + nb + ": la captation vidéo de 11" + nb + "groupes sur deux scènes, et pas mal de photos.");
  return t;
});

fichier("prestations.html", t => {
  t = contenu(t, "videoPossible", "</p>", "Besoin d'une vidéo plutôt que de photos" + nb + "? La captation et le montage sont une prestation à part, surtout pour les événements" + nb + ": sur une même date, je fais l'un ou l'autre. Parlez-m'en dans votre message.");
  /* une phrase sur les coulisses, sous les quatre etapes */
  t = rempl(t, '<div class="etape"><h3 data-i18n="step4T">Livraison</h3><p data-i18n="step4D">Photos triées et retouchées, livrées sous 10&nbsp;jours.</p></div>\n</div>',
    '<div class="etape"><h3 data-i18n="step4T">Livraison</h3><p data-i18n="step4D">Photos triées et retouchées, livrées sous 10&nbsp;jours.</p></div>\n</div>\n' +
    '<p class="coulisses"><span data-i18n="coulissesTexte">Envie de voir comment je travaille' + nb + '? Les coulisses de mes séances sont sur Instagram.</span> <a class="lien" href="https://www.instagram.com/andreetti.photography/" target="_blank" rel="noopener noreferrer"><span data-i18n="coulissesLien">Voir les coulisses</span><i class="fleche" aria-hidden="true"></i></a></p>');
  /* la visionneuse sur place : la photo d exemple s ouvre ici, et se referme ici */
  if (!t.includes("<!--@visio-->")) t = rempl(t, "</main>\n", "</main>\n\n<!--@visio-->\n<!--/@visio-->\n");
  return t;
});

fichier("assets/i18n.js", t => {
  t = en(t, "bio1", "A 19-year-old photographer based in Dijon and the Yonne (89), in Burgundy. Portrait, sport, events: what I look for is the natural. Authentic moments, genuine emotions, not forced poses.");
  t = en(t, "bio2", "I started by photographing what was around me: my family and friends, the sports fields, local parties. That is still how I work: honest images, without artifice.");
  t = en(t, "bio3", "Today I work with individuals, clubs and associations across the region. My goal is simple: that you are proud of your photos.");
  t = en(t, "c3Texte", "Filming and editing. It is a separate service, mostly for events: on a given date I am either on photo or on video. Tell me about it in your message.");
  t = en(t, "p2Texte", "<strong>The Fet'Estival,</strong> a music festival in Villemoisson-sur-Orge (91): filming 11 bands on two stages, and quite a few photos.");
  t = en(t, "videoPossible", "Need a video rather than photos? Filming and editing are a separate service, mostly for events: on a given date I do one or the other. Tell me about it in your message.");
  t = rempl(t, 'sommaireLabel:"On this page",', 'coulissesTexte:"Want to see how I work? Behind the scenes of my sessions is on Instagram.", coulissesLien:"See behind the scenes",\nsommaireLabel:"On this page",');
  return t;
});

fichier(".outils/pages.js", t => {
  const i = t.indexOf('id: "prestations"'); const j = t.indexOf("scripts: []", i);
  if (i < 0 || j < 0 || j - i > 700) { console.log("   scripts de prestations introuvables"); return t; }
  return t.slice(0, j) + 'scripts: ["visionneuse.js"]' + t.slice(j + "scripts: []".length);
});

fichier("assets/rendu.js", t => rempl(t,
  "'<a class=\"formule-photo\" href=\"/portfolio?photo=' + encodeURIComponent(p.id) + '\"",
  "'<a class=\"formule-photo\" data-visio=\"' + ech(p.id) + '\" data-legende=\"' + ech(nom) + '\" href=\"/portfolio?photo=' + encodeURIComponent(p.id) + '\""));
