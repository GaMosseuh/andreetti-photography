/* PHOTOS DU SITE : fabrication des trois tailles et du fichier des dimensions.
   (Dossier .outils : jamais publie.)

   AJOUTER DES PHOTOS, pas a pas :
     1. node .outils/photos.js importer "C:\chemin\vers\le dossier ou la photo" prefixe
        ex. : node .outils/photos.js importer "W:\...\Shooting Elsa\export" portrait-elsa
        -> cree images/portfolio/portrait-elsa-01.webp, -02, ... (et les tailles petite/grande)
     2. copier dans assets/data.js les lignes que la commande affiche, et les completer
        (serie, description).
     3. node .outils/construire.js   (met a jour les pages)

   Les trois tailles :
     images/portfolio/p/ID.webp   petite, 720 px de large   -> les grilles (legere)
     images/portfolio/ID.webp     normale, 1800 px au plus  -> la visionneuse
     images/portfolio/g/ID.webp   grande, 2400 px au plus   -> grands ecrans et zoom
   La grande n'existe que si la photo d'origine est assez grande : on n'agrandit JAMAIS
   une photo (une image agrandie est molle). .rotate() est obligatoire : il applique
   l'orientation enregistree par l'appareil, sinon les photos verticales sortent couchees. */
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const RACINE = path.join(__dirname, "..");
const DOS = path.join(RACINE, "images", "portfolio");
const PETITE = 720, NORMALE = 1800, GRANDE = 2400;

async function fabriquer(source, id, opts) {
  opts = opts || {};
  const meta = await sharp(source).rotate().metadata();
  const couche = meta.orientation >= 5;                 // photo verticale stockee couchee
  const W = couche ? meta.height : meta.width, H = couche ? meta.width : meta.height;
  const long = Math.max(W, H);
  const out = {};
  fs.mkdirSync(path.join(DOS, "p"), { recursive: true });
  fs.mkdirSync(path.join(DOS, "g"), { recursive: true });
  const normale = path.join(DOS, id + ".webp");
  if (!fs.existsSync(normale) || opts.refaireNormale) {
    await sharp(source).rotate().resize({ width: NORMALE, height: NORMALE, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(normale);
    out.normale = true;
  }
  const grande = path.join(DOS, "g", id + ".webp");
  if (long >= GRANDE && (!fs.existsSync(grande) || opts.refaire)) {
    await sharp(source).rotate().resize({ width: GRANDE, height: GRANDE, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(grande);
    out.grande = true;
  }
  return out;
}
async function petite(id, refaire) {
  const src = path.join(DOS, id + ".webp"), dst = path.join(DOS, "p", id + ".webp");
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (fs.existsSync(dst) && !refaire) return false;
  await sharp(src).resize({ width: PETITE, withoutEnlargement: true }).webp({ quality: 74 }).toFile(dst);
  return true;
}
/* ecrit assets/dimensions.js : largeur, hauteur de chaque photo, et si une grande taille existe */
async function dimensions() {
  const ids = fs.readdirSync(DOS).filter(f => /\.webp$/i.test(f)).map(f => f.replace(/\.webp$/i, "")).sort();
  const lignes = [];
  let crees = 0;
  for (const id of ids) {
    if (await petite(id)) crees++;
    const m = await sharp(path.join(DOS, id + ".webp")).metadata();
    const g = fs.existsSync(path.join(DOS, "g", id + ".webp"));
    let gw = 0;
    if (g) gw = (await sharp(path.join(DOS, "g", id + ".webp")).metadata()).width;
    lignes.push(`  "${id}":[${m.width},${m.height},${gw}]`);
  }
  const txt = "/* DIMENSIONS DES PHOTOS — fichier ecrit par .outils/photos.js, ne pas modifier a la main.\n" +
    "   Pour chaque photo : [largeur, hauteur, largeur de la grande taille (0 = pas de grande taille)].\n" +
    "   Sert a reserver la bonne place avant que l image arrive : la page ne saute plus. */\n" +
    "var DIMENSIONS = {\n" + lignes.join(",\n") + "\n};\n";
  fs.writeFileSync(path.join(RACINE, "assets", "dimensions.js"), txt);
  return { photos: ids.length, petites_creees: crees };
}
async function importer(source, prefixe) {
  let fichiers = [];
  if (fs.statSync(source).isDirectory()) fichiers = fs.readdirSync(source).filter(f => /\.(jpe?g|png|webp|tiff?)$/i.test(f)).sort().map(f => path.join(source, f));
  else fichiers = [source];
  let n = fs.readdirSync(DOS).filter(f => f.indexOf(prefixe + "-") === 0 && /\.webp$/i.test(f)).length;
  const lignes = [];
  for (const f of fichiers) {
    const id = prefixe + "-" + String(++n).padStart(2, "0");
    await fabriquer(f, id);
    lignes.push(`  {id:'${id}', cat:'portrait', serie:'', alt:{fr:"", en:""}},   // ${path.basename(f)}`);
  }
  console.log(JSON.stringify(await dimensions()));
  console.log("\nLignes a copier dans assets/data.js (tableau PHOTOS), puis a completer :\n" + lignes.join("\n"));
}
module.exports = { fabriquer, petite, dimensions, DOS };
if (require.main === module) {
  const [cmd, a, b] = process.argv.slice(2);
  (async () => {
    if (cmd === "importer" && a && b) await importer(a, b);
    else if (cmd === "dimensions" || !cmd) console.log(JSON.stringify(await dimensions()));
    else console.log("usage : node .outils/photos.js importer <dossier ou fichier> <prefixe>   |   node .outils/photos.js dimensions");
  })().catch(e => { console.error("ECHEC :", e.message); process.exit(1); });
}
