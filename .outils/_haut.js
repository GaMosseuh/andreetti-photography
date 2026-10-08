const s = require("sharp"); const [dos, noms, h = 1500, l = 1100, y = 0] = process.argv.slice(2);
(async () => { for (const n of noms.split(",")) { const f = dos + "/" + n + ".jpg"; const m = await s(f).metadata(); const top = Math.min(+y, Math.max(0, m.height - 10));
  await s(f).extract({ left: 0, top, width: m.width, height: Math.min(m.height - top, +h) }).resize({ width: Math.min(+l, m.width) }).jpeg({ quality: 80 }).toFile(dos + "/" + n + "-x.jpg"); } })();
