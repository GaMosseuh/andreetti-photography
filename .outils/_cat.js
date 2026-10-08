const fs = require("fs"); let s = fs.readFileSync("assets/styles.css", "utf8");
if (s.indexOf("11. PRESTATIONS ─") > -1) { console.error("deja ajoute"); process.exit(1); }
s = s.replace(/\s*$/, "\n") + fs.readFileSync(".outils/_styles-suite.css", "utf8");
const a = ".seances{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--e4);justify-content:center}\n.seances.deux{max-width:920px;margin-inline:auto}\n.carte-seance{display:flex;flex-direction:column;text-decoration:none;color:inherit}";
if (s.split(a).length !== 2) { console.error("seances introuvable"); process.exit(1); }
s = s.replace(a, "/* deux ou trois cartes : toujours centrees, jamais de trou */\n.seances{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--e5) var(--e4)}\n.carte-seance{flex:1 1 300px;max-width:400px;display:flex;flex-direction:column;text-decoration:none;color:inherit}");
fs.writeFileSync("assets/styles.css", s); console.log("styles.css : " + s.split("\n").length + " lignes, " + (s.length / 1024).toFixed(1) + " Ko");
