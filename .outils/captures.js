/* CAPTURES D ECRAN de toutes les pages, en pleine hauteur.
       node .outils/captures.js <dossier de sortie> [sombre|clair] [racine d un autre site]
   Ordinateur (1440 px) et telephone (390 px). Sert aux comparaisons avant / apres. */
const { serveur, chrome, stabiliser } = require("./lib.js");
const fs = require("fs"), path = require("path"), sharp = require("sharp");
const sortie = process.argv[2], theme = process.argv[3] || "sombre", racine = process.argv[4];
const ancien = !!racine;
const PAGES = [["accueil", "/"], ["portfolio", ancien ? "/portfolio.html" : "/portfolio"], ["prestations", ancien ? "/prestations.html" : "/prestations"],
  ["contact", ancien ? "/contact.html" : "/contact"], ["apropos", ancien ? "/apropos.html" : "/apropos"], ["liens", ancien ? "/links.html" : "/links"]];
if (!ancien) PAGES.push(["portfolio - une seance ouverte", "/portfolio?serie=marsannay"], ["portfolio - toutes les photos", "/portfolio?vue=photos"], ["mentions legales", "/mentions-legales"]);
const FORMATS = [["ordinateur", 1440, 900, 1], ["telephone", 390, 844, 2]];
(async () => {
  if (!sortie) { console.error("usage : node .outils/captures.js <dossier> [sombre|clair]"); process.exit(1); }
  fs.mkdirSync(sortie, { recursive: true });
  const srv = await serveur(8171, racine); const nav = await chrome();
  for (const [nom, url] of PAGES) for (const [fmt, w, h, dpr] of FORMATS) {
    const page = await nav.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: fmt === "telephone", hasTouch: fmt === "telephone" });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme === "clair" ? "light" : "dark" }]);
    await page.evaluateOnNewDocument(t => { try { localStorage.setItem("theme", t); localStorage.setItem("cookie-ack", "1"); sessionStorage.setItem("introVue", "1"); } catch (e) {} }, theme === "clair" ? "light" : "dark");
    await page.goto("http://127.0.0.1:8171" + url, { waitUntil: "networkidle2", timeout: 60000 });
    await stabiliser(page);
    const png = await page.screenshot({ fullPage: true, type: "png" });
    const f = path.join(sortie, nom + " - " + fmt + ".jpg");
    await sharp(png).jpeg({ quality: 86 }).toFile(f);
    const m = await sharp(png).metadata();
    console.log(nom + " - " + fmt + " : " + m.width + "x" + m.height + "  " + (fs.statSync(f).size / 1024).toFixed(0) + " Ko");
    await page.close();
  }
  await nav.close(); srv.close();
})().catch(e => { console.error("ECHEC", e); process.exit(1); });
