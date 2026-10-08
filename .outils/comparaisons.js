/* PLANCHES AVANT / APRES pour les rapports.
       node .outils/comparaisons.js "<dossier des captures>"
   Le dossier doit contenir les sous-dossiers  avant  et  apres  (fabriques par captures.js).
   Pour chaque page, une image  comparaisons/<page> - <format>.jpg  : l avant a gauche,
   l apres a droite, le haut de la page seulement (les pages entieres sont dans avant/ et apres/). */
const fs = require("fs"), path = require("path"), sharp = require("sharp");
const dos = process.argv[2];
const PAGES = ["accueil", "portfolio", "prestations", "contact", "apropos", "liens"];
const FORMATS = [["ordinateur", 620, 1150], ["telephone", 300, 1150]];
const etiquette = (texte, l) => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + l + '" height="34"><rect width="100%" height="100%" fill="#0F5A68"/><text x="12" y="23" font-family="Arial" font-size="15" font-weight="700" fill="#F5FAFB">' + texte + "</text></svg>");

(async () => {
  if (!dos) { console.error('usage : node .outils/comparaisons.js "<dossier des captures>"'); process.exit(1); }
  const sortie = path.join(dos, "comparaisons"); fs.mkdirSync(sortie, { recursive: true });
  for (const p of PAGES) for (const [fmt, l, hmax] of FORMATS) {
    const cotes = [];
    for (const quand of ["avant", "apres"]) {
      const f = path.join(dos, quand, p + " - " + fmt + ".jpg");
      if (!fs.existsSync(f)) { console.log("absent : " + f); continue; }
      const img = sharp(f).resize({ width: l });
      const { data, info } = await img.toBuffer({ resolveWithObject: true });
      const h = Math.min(info.height, hmax);
      cotes.push({ quand, h, buf: await sharp(data).extract({ left: 0, top: 0, width: l, height: h }).toBuffer() });
    }
    if (cotes.length < 2) continue;
    const H = Math.max(cotes[0].h, cotes[1].h) + 34, ecart = 16;
    await sharp({ create: { width: l * 2 + ecart, height: H, channels: 3, background: "#ffffff" } })
      .composite([
        { input: etiquette("AVANT (v1.9, en ligne)", l), left: 0, top: 0 }, { input: cotes[0].buf, left: 0, top: 34 },
        { input: etiquette("APRES (v2.0, pas encore en ligne)", l), left: l + ecart, top: 0 }, { input: cotes[1].buf, left: l + ecart, top: 34 }
      ]).jpeg({ quality: 82 }).toFile(path.join(sortie, p + " - " + fmt + ".jpg"));
    console.log(p + " - " + fmt + " : fait");
  }
})().catch(e => { console.error("ECHEC : " + e.message); process.exit(1); });
