/* Visionneuse : ouverture, fermeture et changement de photo en douceur (9 octobre 2026).
   Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const f = path.join(__dirname, "..", "..", "assets", "visionneuse.js"); let t = fs.readFileSync(f, "utf8");
function rempl(a, b) { if (!t.includes(a)) { console.log("ABSENT : " + a.slice(0, 80)); return; } t = t.replace(a, b); }

rempl("var DUREE        = 160;", "var FONDU        = 190;      // ms : duree de la fermeture en fondu (voir .visio.ferme dans styles.css)\nvar DUREE        = 160;");
rempl("var anim = null;", "var anim = null, minuteurFerme = null;\nvar calme = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);");

/* la photo arrive en fondu */
rempl("    img.src = url; charge = true;\n    img.style.visibility = 'visible';",
      "    img.src = url; charge = true;\n    img.style.visibility = 'visible';\n    img.classList.remove('arrive'); void img.offsetWidth; img.classList.add('arrive');");

/* ouverture : on annule une fermeture encore en cours */
rempl("    ouvert = true;\n    racine.hidden = false;\n    racine.classList.add('ouverte');",
      "    ouvert = true;\n    clearTimeout(minuteurFerme); racine.classList.remove('ferme');\n    racine.hidden = false;\n    racine.classList.add('ouverte');");

/* fermeture : tout l etat est remis a zero tout de suite ; seul l effacement a l ecran prend un instant */
rempl("  racine.classList.remove('ouverte', 'zoome', 'charge', 'glisse');\n  racine.hidden = true;",
      "  racine.classList.remove('zoome', 'charge', 'glisse');\n  var finir = function(){ if(ouvert) return; racine.classList.remove('ouverte', 'ferme'); racine.hidden = true; img.removeAttribute('src'); img.style.visibility = 'hidden'; };\n  clearTimeout(minuteurFerme);\n  if(calme){ finir(); } else { racine.classList.add('ferme'); minuteurFerme = setTimeout(finir, FONDU); }");
rempl("  e = 1; tx = 0; ty = 0; points = {}; nbPoints = 0; geste = null;\n  img.removeAttribute('src'); img.style.visibility = 'hidden';",
      "  e = 1; tx = 0; ty = 0; points = {}; nbPoints = 0; geste = null;");
fs.writeFileSync(f, t); console.log("visionneuse.js : fait");
