/* PHOTO D ECRAN d une page (outil de relecture).
   node .outils/photo-ecran.js <adresse> <fichier.jpg> [largeur] [hauteur] [clair|sombre] [pleine|vue] [script a executer avant] */
const { serveur, chrome, stabiliser } = require("./lib.js");
const sharp = require("sharp"), path = require("path"), fs = require("fs");
(async () => {
  const [url, sortie, l = 1440, h = 900, theme = "sombre", mode = "pleine", script = ""] = process.argv.slice(2);
  const srv = await serveur(8151); const nav = await chrome(); const page = await nav.newPage();
  const tel = +l < 700;
  await page.setViewport({ width: +l, height: +h, deviceScaleFactor: tel ? 2 : 1, isMobile: tel, hasTouch: tel });
  await page.evaluateOnNewDocument(t => { try { localStorage.setItem("theme", t === "clair" ? "light" : "dark"); } catch (e) {} }, theme);
  const erreurs = []; page.on("pageerror", e => erreurs.push(e.message)); page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto("http://127.0.0.1:8151/" + String(url).split("/").filter((x, i) => i > 0 || x).join("/"), { waitUntil: "networkidle2", timeout: 60000 });
  if (mode === "pleine") await stabiliser(page); else await new Promise(r => setTimeout(r, 500));
  if (script) { await page.evaluate(script); await new Promise(r => setTimeout(r, 700)); }
  const png = await page.screenshot({ fullPage: mode === "pleine", type: "png" });
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  await sharp(png).jpeg({ quality: 84 }).toFile(sortie);
  const m = await sharp(png).metadata();
  console.log(path.basename(sortie) + " : " + m.width + "x" + m.height + (erreurs.length ? "  ERREURS : " + erreurs.slice(0, 3).join(" | ") : ""));
  await nav.close(); srv.close();
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
