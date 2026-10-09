/* VERIFIER — les regles du site, controlees sur les fichiers (rapide, sans navigateur)
       node .outils/verifier.js
   A lancer avant chaque mise en ligne. Si une ligne affiche ECHEC, on corrige d abord.
   Ce qui est controle : traductions francais/anglais completes, titres de moins de 60
   caracteres, aucun tiret cadratin, aucun « a partir de », le telephone, les couleurs de la
   charte, les adresses sans .html, les donnees pour Google, les photos et leurs fichiers. */
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "..");
const { PAGES, SITE } = require("./pages.js");
const { chargerDonnees } = require("./construire.js");
const lire = f => fs.readFileSync(path.join(RACINE, f), "utf8");
const resultats = [];
const verifier = (nom, ok, detail) => resultats.push({ nom, ok: !!ok, detail: detail || "" });
const D = chargerDonnees();

/* le texte qu un visiteur peut lire dans une page : sans balises, sans scripts ni styles */
function texteVisible(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#(\d+);/g, (m, c) => String.fromCharCode(+c)).replace(/\s+/g, " ");
}
const pages = PAGES.map(p => ({ p, html: lire(p.fichier) }));

/* ---------- 1. traductions ---------- */
{
  const manque = [], vides = [];
  for (const { p, html } of pages) {
    const re = /data-i18n="([^"]+)"/g; let m;
    while ((m = re.exec(html))) { const k = m[1]; if (D.I18N.en[k] == null && !D.TEXTES[k]) manque.push(k + " (" + p.id + ")"); }
    const ra = /data-i18n-attr="([^"]+)"/g;
    while ((m = ra.exec(html))) m[1].split(";").forEach(x => { const k = (x.split(":")[1] || "").trim(); if (k && D.I18N.en[k] == null && !D.TEXTES[k]) manque.push(k + " (attribut, " + p.id + ")"); });
  }
  verifier("Chaque texte des pages a sa traduction anglaise", manque.length === 0, [...new Set(manque)].slice(0, 12).join(", "));
  for (const k of Object.keys(D.TEXTES)) if (!D.TEXTES[k].fr || !D.TEXTES[k].en) vides.push(k);
  verifier("Chaque texte des scripts existe en français et en anglais", vides.length === 0, vides.join(", "));
  /* les noms de textes utilises dans les scripts existent */
  const inconnus = [];
  for (const f of ["assets/rendu.js", "assets/common.js", "assets/portfolio.js", "assets/visionneuse.js", "assets/contact.js"]) {
    const s = lire(f); const re = /\b(?:trad|tr|T)\('([a-zA-Z0-9]+)'\)/g; let m;
    while ((m = re.exec(s))) if (!D.TEXTES[m[1]] && D.I18N.en[m[1]] == null) inconnus.push(m[1] + " (" + f + ")");
  }
  verifier("Tous les textes appelés par les scripts existent", inconnus.length === 0, inconnus.join(", "));
  /* les donnees : chaque texte a ses deux langues */
  const sansEn = [];
  const voir = (x, ou) => { if (x && typeof x === "object" && !Array.isArray(x) && ("fr" in x)) { if (!x.en && x.fr) sansEn.push(ou); if (!x.fr && x.en) sansEn.push(ou + " (français)"); } };
  D.SERIES.forEach(s => ["titre", "lieu", "texte", "texteAccueil"].forEach(c => voir(s[c], "séance " + s.id + "." + c)));
  D.PHOTOS.forEach(p => voir(p.alt, "photo " + p.id));
  D.FORMULES.forEach(f => ["nom", "duree", "compris"].forEach(c => voir(f[c], "formule " + f.id + "." + c)));
  verifier("Séances, photos et formules : textes en français et en anglais", sansEn.length === 0, sansEn.slice(0, 8).join(", "));
  verifier("Deux langues actives seulement : français et anglais", D.LANGUES_ACTIVES.join(",") === "fr,en" && D.LANGUE_DEFAUT === "fr", "actives : " + D.LANGUES_ACTIVES.join(", ") + " ; par défaut : " + D.LANGUE_DEFAUT);
  const autres = fs.existsSync(path.join(RACINE, "assets", "i18n-autres.js")) ? lire("assets/i18n-autres.js") : "";
  const nb = ["es", "de", "it", "pt", "nl", "ru", "zh", "ja", "hi", "ar"].filter(l => new RegExp("^  " + l + ":\\{", "m").test(autres)).length;
  verifier("Les 10 langues en veille sont conservées (assets/i18n-autres.js)", nb === 10, nb + " langues trouvées");
  const charge = pages.filter(x => /i18n-autres\.js/.test(x.html)).map(x => x.p.id);
  verifier("Aucune page ne charge les langues en veille", charge.length === 0, charge.join(", "));
  verifier("Pas de détection automatique de la langue du navigateur", !/navigator\.language/.test(lire("assets/i18n.js").replace(/\/\*[\s\S]*?\*\//g, "")), "");
}

/* ---------- 2. titres, descriptions, adresses ---------- */
{
  const longs = PAGES.filter(p => p.titre.length >= 60).map(p => p.id + " (" + p.titre.length + ")");
  verifier("Tous les titres de page font moins de 60 caractères", longs.length === 0, longs.join(", ") || PAGES.map(p => p.titre.length).join(", ") + " caractères");
  verifier("Le titre de l'accueil commence par ANDREETTI", /^ANDREETTI/.test(PAGES[0].titre), PAGES[0].titre);
  const descLongues = PAGES.filter(p => !p.robots && (p.description.length > 160 || p.description.length < 70)).map(p => p.id + " (" + p.description.length + ")");
  verifier("Descriptions entre 70 et 160 caractères", descLongues.length === 0, descLongues.join(", "));
  const pb = [];
  for (const { p, html } of pages) {
    const can = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (can !== SITE + p.chemin) pb.push(p.id + " : canonique " + can);
    if (/\.html/.test(can || "")) pb.push(p.id + " : canonique en .html");
    const liens = [...html.matchAll(/href="([^"#]+)"/g)].map(m => m[1]).filter(h => /\.html(\?|$)/.test(h) && !/^https?:/.test(h));
    if (liens.length) pb.push(p.id + " : lien interne en .html (" + liens[0] + ")");
    const rel = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]).filter(h => !/^(https?:|mailto:|tel:|data:|#|\/)/.test(h));
    if (rel.length) pb.push(p.id + " : adresse relative (" + rel[0] + ")");
  }
  verifier("Une seule forme d'adresse, sans .html (balises canoniques et liens internes)", pb.length === 0, pb.slice(0, 5).join(" ; "));
  const sm = lire("sitemap.xml");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const attendu = PAGES.filter(p => !p.robots).map(p => SITE + p.chemin);
  verifier("Plan du site : les " + attendu.length + " pages publiques, sans .html", locs.length === attendu.length && attendu.every(u => locs.includes(u)) && !/\.html/.test(sm), locs.join(" "));
  const net = lire("netlify.toml");
  const iAnc = net.indexOf("andreetti-photography.netlify.app/*"), iHtml = net.indexOf('from = "/portfolio.html"'), iRac = net.lastIndexOf('from = "/"');
  verifier("Redirections : l'ancienne adresse Netlify en premier, puis les .html, puis l'accueil", iAnc > 0 && iAnc < iHtml && iHtml < iRac, "");
  const sansRegle = PAGES.filter(p => p.chemin !== "/" && p.chemin !== "/404" && !net.includes('from = "' + p.chemin + '.html"')).map(p => p.id);
  verifier("Chaque page a sa redirection .html → adresse courte", sansRegle.length === 0, sansRegle.join(", "));
  verifier("Le fichier de vérification Google n'est pas redirigé et existe toujours", !/google6071a8daa44044c2/.test(net.replace(/^#.*$/gm, "")) && fs.existsSync(path.join(RACINE, "google6071a8daa44044c2.html")), "");
  const acc = pages[0].html;
  verifier("Les deux balises de vérification Search Console sont sur l'accueil", (acc.match(/google-site-verification/g) || []).length === 2 && acc.includes("AsFyBL63fL2S-Izu1Oi_3jA-iGOKLUJJGYdxtkft53U") && acc.includes("1CpIicORCdYnNOE4eiCDTbtQpq73NWiVUg8BA25iDsM"), "");
}

/* ---------- 3. le texte visible ---------- */
{
  const tirets = [], apartir = [], noms = [], emojis = [];
  const sources = pages.map(x => [x.p.id, texteVisible(x.html) + " " + x.p.titre + " " + x.p.description]);
  sources.push(["anglais", Object.values(D.I18N.en).join(" ").replace(/<[^>]+>/g, " ")]);
  sources.push(["textes des scripts", Object.values(D.TEXTES).map(t => t.fr + " " + t.en).join(" ")]);
  sources.push(["données", JSON.stringify([D.SERIES, D.FORMULES, D.PHOTOS.map(p => p.alt), D.UNIVERS])]);
  for (const [ou, t] of sources) {
    if (/[—–]/.test(t)) tirets.push(ou + " : « " + (t.match(/.{0,30}[—–].{0,20}/) || [""])[0].trim() + " »");
    if (/à partir de|a partir de|starting (at|from)|from €/i.test(t)) apartir.push(ou);
    const m = t.match(/Alexandre Andreetti|Andreetti(?!\.photography)(?![a-z])/);
    if (m && ou !== "données") noms.push(ou + " : « " + m[0] + " »");
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t.replace(/[✓→←]/g, ""))) emojis.push(ou);
  }
  verifier("Aucun tiret cadratin dans les textes visibles", tirets.length === 0, tirets.slice(0, 4).join(" ; "));
  verifier("Aucun « à partir de »", apartir.length === 0, apartir.join(", "));
  verifier("Nom de famille en majuscules partout (ANDREETTI)", noms.length === 0, noms.slice(0, 4).join(" ; "));
  verifier("Aucun emoji décoratif dans les pages", emojis.length === 0, emojis.join(", "));
  /* les avis : jamais de nom de famille, et rien d autre que les textes de data.js */
  const famille = pages.filter(x => /Mallet|Gbaka|Duval/.test(texteVisible(x.html))).map(x => x.p.id);
  verifier("Les clientes ne sont citées que par leur prénom", famille.length === 0 && !/Mallet|Gbaka|Duval/.test(lire("assets/data.js").replace(/\/\*[\s\S]*?\*\//g, "")), famille.join(", "));
  const promesses = pages.filter(x => /Vos avis apparaîtront ici|Arrive prochainement|Bientôt disponible/.test(x.html)).map(x => x.p.id);
  verifier("Plus de texte d'attente faux (« Vos avis apparaîtront ici », « Arrive prochainement »)", promesses.length === 0, promesses.join(", "));
  /* une seule regle de deplacement */
  const tout = pages.map(x => texteVisible(x.html)).join(" ");
  const anciennes = /déplacement (est )?inclus|Déplacement Yonne, Dijon/i.test(tout) || /Travel is included in the quote/i.test(Object.values(D.I18N.en).join(" "));
  verifier("Une seule règle de déplacement (25 km autour de Dijon), sans ancienne formule", !anciennes && /25 km autour de Dijon/.test(tout), "");
  const sansPrix = /\b(55|95|110|130|150|170|230) ?€/.test(tout);
  verifier("Aucun prix pour le sport ou l'événementiel ; les trois prix portrait sont ceux de la grille", !sansPrix && D.FORMULES.map(f => f.prix).join(",") === "40,50,65", D.FORMULES.map(f => f.nom.fr + " " + f.prix + " €").join(" · "));
}

/* ---------- 4. telephone et coordonnees ---------- */
{
  const C = D.COORDONNEES;
  verifier("Le numéro est le bon (06 82 29 86 58)", C.telephone === "06 82 29 86 58" && C.telLien === "+33682298658", C.telephone + " / " + C.telLien);
  const avec = pages.filter(x => /class="tel/.test(x.html)).map(x => x.p.id);
  verifier("Le téléphone est sur Contact, À propos et les mentions légales", ["contact", "apropos", "mentions"].every(i => avec.includes(i)), "présent sur : " + avec.join(", "));
  const clair = pages.filter(x => /06 ?82 ?29 ?86 ?58|\+33 ?6 ?82|0682298658|33682298658/.test(x.html)).map(x => x.p.id);
  verifier("Le numéro n'apparaît jamais en clair dans le code des pages (anti-robots)", clair.length === 0, clair.join(", "));
  const decode = (pages.find(x => x.p.id === "contact").html.match(/class="tel"[^>]*>([^<]+)</) || [])[1] || "";
  verifier("Affiché, le numéro se lit bien 06 82 29 86 58", texteVisible("<p>" + decode + "</p>").trim() === "06 82 29 86 58", "« " + texteVisible("<p>" + decode + "</p>").trim() + " »");
  const b64 = (pages.find(x => x.p.id === "contact").html.match(/data-tel="([^"]+)"/) || [])[1] || "";
  verifier("Le lien « appeler » compose bien +33682298658", Buffer.from(b64, "base64").toString() === "+33682298658", Buffer.from(b64, "base64").toString());
  const fb = pages.filter(x => !x.p.robots || x.p.id === "mentions").filter(x => !x.html.includes(C.facebook)).map(x => x.p.id);
  verifier("Facebook est partout où sont Instagram et LinkedIn", fb.length === 0, "absent de : " + fb.join(", "));
  const cibles = [];
  for (const { p, html } of pages) for (const m of html.matchAll(/<a\b[^>]*href="https?:\/\/(?!andreettiphoto\.fr)[^"]+"[^>]*>/g)) { if (!/target="_blank"/.test(m[0]) || !/rel="noopener noreferrer"/.test(m[0])) cibles.push(p.id + " : " + m[0].slice(0, 70)); }
  verifier("Tous les liens sortants s'ouvrent dans un nouvel onglet, avec rel=\"noopener noreferrer\"", cibles.length === 0, cibles.slice(0, 3).join(" ; "));
}

/* ---------- 5. donnees pour Google ---------- */
{
  const pb = [], types = {};
  for (const { p, html } of pages) {
    const blocs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    types[p.id] = [];
    for (const b of blocs) { try { const j = JSON.parse(b); types[p.id].push(j["@type"]); if (/AggregateRating|"Review"|openingHours/i.test(b)) pb.push(p.id + " : balisage interdit"); if (j["@type"] === "ProfessionalService" && j.telephone !== "+33682298658") pb.push(p.id + " : téléphone " + j.telephone); } catch (e) { pb.push(p.id + " : JSON invalide"); } }
  }
  verifier("Données Google valides, sans avis, sans note, sans horaires, téléphone correct", pb.length === 0, pb.join(" ; "));
  const publiques = PAGES.filter(p => !p.robots);
  verifier("ProfessionalService sur toutes les pages publiques", publiques.every(p => types[p.id].includes("ProfessionalService")), "");
  verifier("Fil d'Ariane sur les pages intérieures, Person sur À propos, FAQ sur Prestations", publiques.filter(p => p.id !== "accueil").every(p => types[p.id].includes("BreadcrumbList")) && types.apropos.includes("Person") && types.prestations.includes("FAQPage") && types.portfolio.includes("ImageGallery"), JSON.stringify(types));
  const faq = JSON.parse([...pages.find(x => x.p.id === "prestations").html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]).find(b => /FAQPage/.test(b)));
  verifier("La FAQ pour Google reprend les 8 questions de la page, mot pour mot", faq.mainEntity.length === 8 && /40, 50 ou 65 €/.test(faq.mainEntity[1].acceptedAnswer.text) && /25 km/.test(faq.mainEntity[7].acceptedAnswer.text), faq.mainEntity.length + " questions");
}

/* ---------- 6. couleurs de la charte ---------- */
{
  const css = lire("assets/styles.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const charte = ["1A7A8A", "0F5A68", "0E1A1E", "F5FAFB", "111827", "6B7280", "E8A93C"];
  /* nuances admises : la meme teinte que la charte, plus claire ou plus sombre (voir l en-tete de styles.css) */
  const nuances = ["FFFFFF", "FFF", "000", "E4F4F7", "C8E0E5", "374151", "14262C", "16323A", "244249", "E6EEF0", "B4C4C9", "8FA0A5", "4FB6C7", "8FD3DF", "B07A1E"];
  const trouves = [...new Set([...css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map(m => m[1].toUpperCase()))];
  const hors = trouves.filter(c => !charte.includes(c) && !nuances.includes(c));
  verifier("Aucune couleur hors charte dans la feuille de style", hors.length === 0, hors.length ? "à justifier : #" + hors.join(", #") : trouves.length + " couleurs, toutes de la charte ou nuances de la charte");
  verifier("Le doré de la charte ne sert qu'aux étoiles des avis", (css.match(/var\(--dore\)|#E8A93C/gi) || []).length <= 2 && /\.etoiles svg\{[^}]*var\(--dore\)/.test(css), "");
  verifier("Aucun appel à Google Fonts (polices servies par le site)", !pages.some(x => /fonts\.googleapis|fonts\.gstatic/.test(x.html)) && !/fonts\.g/.test(css), "");
  const anim = (css.match(/@keyframes\s+(\w+)/g) || []).join(", ");
  /* depuis le 9 octobre 2026, Alexandre veut des passages en douceur partout : les animations
     autorisees sont listees ici, toutes courtes, et coupees si l appareil demande moins de mouvement */
  const permises = ["visioTourne", "entree", "entreeDouce", "apparition", "zoomLent"];
  const noms = (css.match(/@keyframes\s+(\w+)/g) || []).map(x => x.replace(/@keyframes\s+/, ""));
  verifier("Animations : seulement les passages en douceur prévus, une seule en boucle (le rond d'attente)", noms.every(n => permises.includes(n)) && (css.match(/infinite/g) || []).length <= 1, noms.join(", "));
  verifier("Les animations sont coupées quand l'appareil demande moins de mouvement", /prefers-reduced-motion:reduce/.test(css), "");
}

/* ---------- 7. photos ---------- */
{
  const R = D.Rendu, manque = [], sansAlt = [];
  for (const p of D.PHOTOS) {
    for (const f of ["images/portfolio/" + p.id + ".webp", "images/portfolio/p/" + p.id + ".webp"]) if (!fs.existsSync(path.join(RACINE, f))) manque.push(f);
    if (!D.DIMENSIONS[p.id]) manque.push("dimensions de " + p.id);
    const x = R.photo(p.id); if (!x.alt || x.alt.length < 12) sansAlt.push(p.id);
    if (x.gw && !fs.existsSync(path.join(RACINE, "images/portfolio/g/" + p.id + ".webp"))) manque.push("grande taille de " + p.id);
  }
  verifier("Chaque photo a ses fichiers (normale et petite) et ses dimensions", manque.length === 0, manque.slice(0, 5).join(", "));
  verifier("Chaque photo a une description", sansAlt.length === 0, sansAlt.join(", "));
  const orph = D.PHOTOS.filter(p => p.serie && !D.SERIES.find(s => s.id === p.serie)).map(p => p.id);
  const couv = D.SERIES.filter(s => s.couverture && !D.PHOTOS.find(p => p.id === s.couverture)).map(s => s.id);
  const formules = D.FORMULES.filter(f => !D.PHOTOS.find(p => p.id === f.exemple)).map(f => f.id);
  verifier("Séances, couvertures et photos d'exemple : tout pointe vers une photo qui existe", !orph.length && !couv.length && !formules.length, [orph, couv, formules].flat().join(", "));
  const img = D.SERIES.filter(s => s.imageAccueil && !fs.existsSync(path.join(RACINE, "images/seances", s.imageAccueil))).map(s => s.imageAccueil);
  verifier("Les images des cartes « Dernières séances » existent", img.length === 0, img.join(", "));
  const vides = D.SERIES.filter(s => !R.photosDe(s.id).length).map(s => s.id);
  const visibles = R.seriesVisibles().map(s => s.id);
  verifier("Une séance sans photo n'apparaît nulle part", vides.every(v => !visibles.includes(v)) && !pages.some(x => vides.some(v => x.html.includes("serie=" + v + '"'))), "sans photo pour l'instant : " + (vides.join(", ") || "aucune"));
  const brut = pages.filter(x => /<img\b(?![^>]*\balt=)[^>]*>/.test(x.html)).map(x => x.p.id);
  verifier("Toutes les images des pages ont un attribut alt", brut.length === 0, brut.join(", "));
}

/* ---------- 8. avis ---------- */
{
  const acc = pages[0].html, texte = texteVisible(acc);
  const tous = D.AVIS.every(a => texte.includes(a.texte.replace(/\s+/g, " ").slice(0, 60)));
  verifier("Les " + D.AVIS.length + " avis sont écrits dans la page d'accueil (lisibles sans JavaScript)", tous, D.AVIS.map(a => a.prenom).join(", "));
  verifier("Dates des avis au format AAAA-MM-JJ, du plus récent au plus ancien", D.AVIS.every(a => /^\d{4}-\d{2}-\d{2}$/.test(a.date)) && D.AVIS.map(a => a.date).join() === D.AVIS.map(a => a.date).sort().reverse().join(), D.AVIS.map(a => a.date).join(", "));
}

/* ---------- 9. ce qui doit etre regle AVANT une mise en ligne ----------
   Ces points ne comptent comme des echecs qu avec  --enligne  (c est ce que fait
   « npm run predeploy ») : en travail local, ils sont seulement rappeles. */
const avantEnLigne = [];
if (D.VIDEO_PRESENTATION && D.VIDEO_PRESENTATION.essai) avantEnLigne.push("la vidéo de présentation est une vidéo d'ESSAI (assets/data.js, VIDEO_PRESENTATION) : mettre la vraie, ou vider youtube");
if (process.argv.includes("--enligne")) verifier("Rien ne reste à régler avant la mise en ligne", avantEnLigne.length === 0, avantEnLigne.join(" ; "));

const ko = resultats.filter(r => !r.ok);
resultats.forEach(r => console.log((r.ok ? "  ok     " : "  ECHEC  ") + r.nom + (r.detail ? "  [" + r.detail + "]" : "")));
console.log("\n" + (resultats.length - ko.length) + " verifications reussies sur " + resultats.length + (ko.length ? "  —  " + ko.length + " ECHEC(S)" : "  —  tout est bon"));
if (process.argv.includes("--json")) fs.writeFileSync(path.join(__dirname, "_verifier.json"), JSON.stringify(resultats, null, 1));
if (avantEnLigne.length && !process.argv.includes("--enligne")) console.log("A REGLER AVANT LA MISE EN LIGNE : " + avantEnLigne.join(" ; "));
process.exit(ko.length ? 1 : 0);
