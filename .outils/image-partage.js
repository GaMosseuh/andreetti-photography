/* L IMAGE DE PARTAGE — celle qui s affiche quand on envoie le lien du site par WhatsApp,
   Facebook, LinkedIn ou SMS (images/partage.webp, 1200 x 630).
       node .outils/image-partage.js
   Elle est fabriquee a partir des trois photos des univers de l accueil (UNIVERS_ACCUEIL,
   dans assets/data.js), avec le nom et l adresse du site, aux polices et couleurs de la charte.
   L ancienne image est rangee dans .archives avant d etre remplacee. */
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const { serveur, chrome } = require("./lib.js");
const { chargerDonnees } = require("./construire.js");
const RACINE = path.join(__dirname, "..");

(async () => {
  const D = chargerDonnees();
  const photos = D.UNIVERS_ACCUEIL.map(u => D.Rendu.photo(u.photo));
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><link rel="stylesheet" href="/assets/styles.css">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E1A1E}
.p{position:absolute;top:0;height:630px;width:400px;overflow:hidden}
.p img{width:100%;height:100%;object-fit:cover;display:block}
.voile{position:absolute;inset:0;background:linear-gradient(0deg,rgba(14,26,30,.94) 0%,rgba(14,26,30,.72) 34%,rgba(14,26,30,.18) 66%,rgba(14,26,30,.30) 100%)}
.t{position:absolute;left:0;right:0;bottom:64px;text-align:center;color:#F5FAFB}
.n{font-family:'Cormorant Garamond',Georgia,serif;font-size:92px;letter-spacing:.28em;margin-right:-.28em;line-height:1}
.s{margin-top:22px;font-family:'Inter',Arial,sans-serif;font-size:27px;letter-spacing:.06em;color:rgba(245,250,251,.9)}
.a{margin-top:14px;font-family:'Inter',Arial,sans-serif;font-size:21px;letter-spacing:.16em;color:#4FB6C7}
</style></head><body>
${photos.map((p, i) => `<div class="p" style="left:${i * 400}px"><img src="${p.src}"></div>`).join("")}
<div class="voile"></div>
<div class="t"><div class="n">ANDREETTI</div><div class="s">Photographe portrait, sport et événementiel · Dijon et Yonne</div><div class="a">andreettiphoto.fr</div></div>
</body></html>`;
  const tmp = path.join(RACINE, "_partage-temporaire.html");
  fs.writeFileSync(tmp, html);
  const srv = await serveur(8181); const nav = await chrome(); const page = await nav.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:8181/_partage-temporaire.html", { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await nav.close(); srv.close();
  fs.renameSync(tmp, path.join(__dirname, "_partage-gabarit.html"));     // on garde le gabarit, hors du site publie
  const dest = path.join(RACINE, "images", "partage.webp");
  const jour = new Date().toISOString().slice(0, 10);
  const arch = path.join(RACINE, ".archives", jour + " image de partage");
  if (fs.existsSync(dest)) { fs.mkdirSync(arch, { recursive: true }); let a = path.join(arch, "partage.webp"), n = 1; while (fs.existsSync(a)) a = path.join(arch, "partage-" + (++n) + ".webp"); fs.copyFileSync(dest, a); }
  const r = await sharp(png).webp({ quality: 86 }).toFile(dest);
  console.log("images/partage.webp : " + r.width + " x " + r.height + " px, " + Math.round(r.size / 1024) + " Ko (ancienne rangee dans .archives\\" + jour + " image de partage\\)");
})().catch(e => { console.error("ECHEC : " + e.message); process.exit(1); });
