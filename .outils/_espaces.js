/* Passage ponctuel (v2.0) : espaces insecables la ou un retour a la ligne serait laid
   ("48" en fin de ligne et "h" seul a la ligne suivante, "65" puis "€"...). */
const fs = require("fs");
const { PAGES } = require("./pages.js");
let total = 0;
function traiter(s) {
  // uniquement dans le texte, pas dans les balises ni les attributs
  return s.replace(/>([^<]+)</g, (m, t) => {
    const n = t
      .replace(/(\d) (h|km|€|jours|photos|ans|secondes|groupes)\b/g, "$1&nbsp;$2")
      .replace(/(\d) (%)/g, "$1&nbsp;$2")
      .replace(/ ([?!:;»])/g, "&nbsp;$1")
      .replace(/(«) /g, "$1&nbsp;");
    if (n !== t) total++;
    return ">" + n + "<";
  });
}
for (const p of PAGES) {
  const f = require("path").join(__dirname, "..", p.fichier);
  let h = fs.readFileSync(f, "utf8");
  const i = h.indexOf("<main"), j = h.indexOf("</main>");
  if (i < 0 || j < 0) continue;
  const avant = h.slice(i, j), apres = traiter(avant);
  if (apres !== avant) fs.writeFileSync(f, h.slice(0, i) + apres + h.slice(j));
}
console.log(total + " textes retouches (espaces insecables)");
