/* Passage ponctuel (v2.0) : a partir des anciens fichiers de traduction (archives),
   fabrique  assets/i18n-autres.js  (les 10 langues mises en veille, aucune traduction perdue)
   et affiche le dictionnaire anglais existant, a reprendre dans le nouveau assets/i18n.js. */
const vm = require("vm"), fs = require("fs"), path = require("path");
const A = path.join(__dirname, "..", ".archives", "2026-10-08 avant v2.0");
const ctx = { document: { querySelectorAll: () => [], getElementById: () => null, documentElement: { setAttribute() {}, getAttribute() { return null; } }, addEventListener() {} },
  localStorage: { getItem() { return null; }, setItem() {} }, navigator: { language: "fr" }, location: { search: "", pathname: "/" }, console };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(A, "i18n.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(A, "i18n-faq.js"), "utf8"), ctx);
const I = ctx.I18N, F = ctx.I18N_FAQ;
const autres = {};
for (const l of Object.keys(I)) { if (l === "fr" || l === "en") continue; autres[l] = Object.assign({}, I[l], F[l] || {}); }
const lignes = Object.keys(autres).map(l => "  " + l + ":" + JSON.stringify(autres[l]));
fs.writeFileSync(path.join(__dirname, "..", "assets", "i18n-autres.js"),
  "/* LES 10 LANGUES EN VEILLE (es, de, it, pt, nl, ru, zh, ja, hi, ar)\n" +
  "   Mises de cote le 8 octobre 2026 : le site s affiche en francais et en anglais seulement,\n" +
  "   le temps que les textes soient definitifs. AUCUNE traduction n a ete supprimee : elles\n" +
  "   sont toutes ici, telles qu elles etaient.\n" +
  "   Ce fichier n est charge par personne tant qu une de ces langues n est pas reactivee\n" +
  "   dans LANGUES_ACTIVES (assets/i18n.js) : il ne pese donc rien pour les visiteurs.\n" +
  "   Les textes ajoutes depuis la v2.0 n y figurent pas : ils s afficheront en anglais\n" +
  "   dans ces langues tant qu ils n auront pas ete traduits. */\n" +
  "var I18N_AUTRES = {\n" + lignes.join(",\n") + "\n};\n" +
  "if (typeof I18N !== 'undefined') { Object.keys(I18N_AUTRES).forEach(function(l){ I18N[l] = Object.assign({}, I18N_AUTRES[l], I18N[l] || {}); }); }\n");
const en = Object.assign({}, I.en, F.en || {});
fs.writeFileSync(path.join(__dirname, "_en-existant.json"), JSON.stringify(en, null, 1));
console.log("langues en veille :", Object.keys(autres).join(", "), "|", Object.keys(autres).map(l => Object.keys(autres[l]).length).join("/"), "cles");
console.log("anglais existant :", Object.keys(en).length, "cles");
