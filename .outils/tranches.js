/* decoupe une capture pleine page en tranches lisibles (pour relecture) */
const sharp = require("sharp"), fs = require("fs"), path = require("path");
(async () => {
  const [src, prefixe, hTranche = 1800, largeur = 1100] = process.argv.slice(2);
  const m = await sharp(src).metadata();
  const dos = path.dirname(prefixe); fs.mkdirSync(dos, { recursive: true });
  let n = 0;
  for (let y = 0; y < m.height; y += +hTranche) {
    const h = Math.min(+hTranche, m.height - y);
    const f = `${prefixe}-${String(++n).padStart(2,"0")}.jpg`;
    await sharp(src).extract({ left: 0, top: y, width: m.width, height: h }).resize({ width: Math.min(+largeur, m.width) }).jpeg({ quality: 80 }).toFile(f);
  }
  console.log(n + " tranches -> " + prefixe);
})();
