/* FABRIQUE UN PDF A PARTIR D UN FICHIER .md (rapports, pas-a-pas).
       node .outils/md-pdf.js "<fichier.md>" ["<fichier.pdf>"]
   Le PDF porte le meme nom que le .md si on ne precise rien. Mise en page aux couleurs
   et aux polices de la charte (Cormorant Garamond pour les titres, Inter pour le texte).
   Les images du .md sont cherchees a cote du fichier .md. */
const fs = require("fs"), path = require("path");
const { marked } = require("marked");
const { chrome, RACINE } = require("./lib.js");

const source = process.argv[2];
if (!source) { console.error('usage : node .outils/md-pdf.js "<fichier.md>" ["<fichier.pdf>"]'); process.exit(1); }
const sortie = (process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "") || source.replace(/\.md$/i, "") + ".pdf";
const police = f => "data:font/woff2;base64," + fs.readFileSync(path.join(RACINE, "assets", "polices", f)).toString("base64");
const polices = fs.readdirSync(path.join(RACINE, "assets", "polices")).filter(f => f.endsWith(".woff2"));
const trouver = motif => polices.find(f => motif.test(f));

(async () => {
  const md = fs.readFileSync(source, "utf8");
  let corps = marked.parse(md, { gfm: true });
  /* les images locales sont mises dans la page elle-meme */
  corps = corps.replace(/<img src="([^"]+)"/g, (tout, src) => {
    if (/^(https?:|data:)/.test(src)) return tout;
    const f = path.resolve(path.dirname(source), decodeURIComponent(src));
    if (!fs.existsSync(f)) return tout;
    const type = /\.png$/i.test(f) ? "image/png" : /\.webp$/i.test(f) ? "image/webp" : "image/jpeg";
    return '<img src="data:' + type + ";base64," + fs.readFileSync(f).toString("base64") + '"';
  });
  const titre = trouver(/^cormorant-garamond-latin.woff2$/);
  const texte = trouver(/^inter-latin.woff2$/);
  const css = `
${titre ? `@font-face{font-family:"Titre";src:url(${police(titre)}) format("woff2");font-weight:100 900}` : ""}
${texte ? `@font-face{font-family:"Texte";src:url(${police(texte)}) format("woff2");font-weight:100 900}` : ""}
@page{size:A4;margin:18mm 16mm 18mm 16mm}
*{box-sizing:border-box}
:root{color-scheme:light}
html{background:#fff}
body{font-family:"Texte",Arial,sans-serif;font-size:10.2pt;line-height:1.55;color:#111827;margin:0}
h1,h2,h3{font-family:"Titre",Georgia,serif;font-weight:500;color:#0F5A68;line-height:1.2;break-after:avoid}
h1{font-size:25pt;margin:0 0 4pt;color:#111827}
h2{font-size:17pt;margin:22pt 0 8pt;padding-top:10pt;border-top:1px solid #cfe1e5}
h3{font-size:13pt;margin:16pt 0 6pt}
p{margin:0 0 8pt}
a{color:#0F5A68;word-break:break-word}
strong{font-weight:650}
hr{border:0;height:0;margin:0}
ul,ol{margin:0 0 8pt;padding-left:18pt}
li{margin:0 0 3pt}
table{border-collapse:collapse;width:100%;margin:6pt 0 12pt;font-size:9.4pt;break-inside:auto}
tr{break-inside:avoid}
th{background:#0F5A68;color:#F5FAFB;text-align:left;font-weight:600;padding:5pt 7pt}
th:empty{display:none}
td{padding:5pt 7pt;border-bottom:1px solid #dbe7ea;vertical-align:top}
tr:nth-child(even) td{background:#F5FAFB}
code{font-family:Consolas,monospace;font-size:8.8pt;background:#eaf3f5;padding:1pt 3pt;border-radius:2pt;word-break:break-word}
pre{background:#eaf3f5;padding:8pt 10pt;border-radius:4pt;white-space:pre-wrap;word-break:break-word;break-inside:avoid}
pre code{background:none;padding:0}
blockquote{margin:0 0 8pt;padding:6pt 12pt;border-left:3px solid #1A7A8A;background:#F5FAFB;color:#111827;break-inside:avoid}
blockquote p:last-child{margin-bottom:0}
img{max-width:100%;display:block;margin:6pt auto;border:1px solid #dbe7ea}
`;
  const html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>' + css + "</style></head><body>" + corps + "</body></html>";
  const nav = await chrome(); const page = await nav.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  /* --apercu=<image.jpg> : une image du debut du document, pour controler la mise en page */
  const apercu = process.argv.find(a => a.startsWith("--apercu="));
  if (apercu) { await page.setViewport({ width: 794, height: 1600, deviceScaleFactor: 1 }); await page.screenshot({ path: apercu.slice(9), type: "jpeg", quality: 80 }); }
  await page.pdf({ path: sortie, format: "A4", printBackground: true, displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="width:100%;font-family:Arial;font-size:7pt;color:#6B7280;padding:0 16mm;display:flex;justify-content:space-between"><span>ANDREETTI Photography · andreettiphoto.fr</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
  await nav.close();
  console.log(path.basename(sortie) + " : " + Math.round(fs.statSync(sortie).size / 1024) + " Ko");
})().catch(e => { console.error("ECHEC : " + e.message); process.exit(1); });
