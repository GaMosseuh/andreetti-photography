/* Adapte verifier.js aux retours du 9 octobre (script jetable, deja applique). */
const fs = require("fs"), path = require("path");
const f = path.join(__dirname, "..", "verifier.js"); let t = fs.readFileSync(f, "utf8");
const a1 = t.split("\n").find(l => l.includes("Une seule animation dans tout le site"));
if (!a1) throw new Error("ligne animation absente");
t = t.replace(a1, [
  "  /* depuis le 9 octobre 2026, Alexandre veut des passages en douceur partout : les animations",
  "     autorisees sont listees ici, toutes courtes, et coupees si l appareil demande moins de mouvement */",
  "  const permises = [\"visioTourne\", \"entree\", \"entreeDouce\", \"apparition\"];",
  "  const noms = (css.match(/@keyframes\\s+(\\w+)/g) || []).map(x => x.replace(/@keyframes\\s+/, \"\"));",
  "  verifier(\"Animations : seulement les passages en douceur prévus, une seule en boucle (le rond d'attente)\", noms.every(n => permises.includes(n)) && (css.match(/infinite/g) || []).length <= 1, noms.join(\", \"));",
  "  verifier(\"Les animations sont coupées quand l'appareil demande moins de mouvement\", /prefers-reduced-motion:reduce/.test(css), \"\");"
].join("\n"));
const fin = "const ko = resultats.filter(r => !r.ok);";
if (!t.includes(fin)) throw new Error("fin absente");
t = t.replace(fin, [
  "/* ---------- 9. ce qui doit etre regle AVANT une mise en ligne ----------",
  "   Ces points ne comptent comme des echecs qu avec  --enligne  (c est ce que fait",
  "   « npm run predeploy ») : en travail local, ils sont seulement rappeles. */",
  "const avantEnLigne = [];",
  "if (D.VIDEO_PRESENTATION && D.VIDEO_PRESENTATION.essai) avantEnLigne.push(\"la vidéo de présentation est une vidéo d'ESSAI (assets/data.js, VIDEO_PRESENTATION) : mettre la vraie, ou vider youtube\");",
  "if (process.argv.includes(\"--enligne\")) verifier(\"Rien ne reste à régler avant la mise en ligne\", avantEnLigne.length === 0, avantEnLigne.join(\" ; \"));",
  "",
  fin
].join("\n"));
const sortie = "process.exit(ko.length ? 1 : 0);";
if (!t.includes(sortie)) throw new Error("sortie absente");
t = t.replace(sortie, "if (avantEnLigne.length && !process.argv.includes(\"--enligne\")) console.log(\"A REGLER AVANT LA MISE EN LIGNE : \" + avantEnLigne.join(\" ; \"));\n" + sortie);
fs.writeFileSync(f, t); console.log("verifier.js : fait");
