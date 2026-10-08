/* Import ponctuel de la v2.0 (8 octobre 2026) : grandes tailles depuis les originaux du NAS
   + les 10 photos de Marsannay. Garde comme trace de ce qui a ete fait ; ne pas relancer. */
const fs = require("fs"), path = require("path");
const { fabriquer, dimensions } = require("./photos.js");
const V15 = "W:/andreetti.photography/Entreprise/Site web/PHOTOS DU SITE/Archives/V1.5/";
const ARC = "W:/andreetti.photography/Entreprise/Photos/Publiées et retouchées (ma banque de photos)/2026-07-12 Tir à l'arc/";
const MARS = "W:/andreetti.photography/Entreprise/Photos/Publiées et retouchées (ma banque de photos)/2026-09 Handball Marsannay/Pour Insta (2e tri retouches différentes)/";
(async () => {
  const bilan = { grandes: 0, marsannay: 0 };
  for (const d of ["portrait", "sport", "event"]) for (const f of fs.readdirSync(V15 + d).filter(x => /\.jpe?g$/i.test(x))) {
    const r = await fabriquer(V15 + d + "/" + f, f.replace(/\.jpe?g$/i, "")); if (r.grande) bilan.grandes++;
  }
  for (const [src, id] of [["1.jpg", "sport-06"], ["2.jpg", "sport-07"], ["3.jpg", "sport-08"]]) { const r = await fabriquer(ARC + src, id); if (r.grande) bilan.grandes++; }
  const posts = ["post-01", "post-03", "post-05", "post-08", "post-10", "post-02", "post-04", "post-09", "post-11", "post-12"];
  for (let i = 0; i < posts.length; i++) { const r = await fabriquer(MARS + posts[i] + ".png", "handball-marsannay-" + String(i + 1).padStart(2, "0")); if (r.normale) bilan.marsannay++; }
  bilan.dimensions = await dimensions();
  console.log(JSON.stringify(bilan));
})().catch(e => { console.error("ECHEC", e); process.exit(1); });
