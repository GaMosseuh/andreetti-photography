const fs = require("fs"); const { PAGES } = require("./pages.js");
const vu = {}; const attrs = {};
for (const p of PAGES) { const h = fs.readFileSync(p.fichier, "utf8");
  const re = /<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g; let m;
  while ((m = re.exec(h))) { const k = m[2], t = m[3].replace(/\s+/g, " ").trim(); if (!vu[k]) vu[k] = { fr: t, pages: [] }; if (vu[k].fr !== t) vu[k].conflit = t; if (!vu[k].pages.includes(p.id)) vu[k].pages.push(p.id); }
  const ra = /data-i18n-attr="([^"]+)"/g; while ((m = ra.exec(h))) m[1].split(";").forEach(x => { const [a, k] = x.split(":"); attrs[k.trim()] = a.trim() + " @" + p.id; }); }
const ex = JSON.parse(fs.readFileSync(__dirname + "/_en-existant.json", "utf8"));
const out = Object.keys(vu).map(k => k + " | " + vu[k].fr + (vu[k].conflit ? "  !!CONFLIT: " + vu[k].conflit : "") + (ex[k] ? "\n      (EN existant) " + ex[k] : ""));
fs.writeFileSync(__dirname + "/_cles.txt", out.join("\n") + "\n\nATTRIBUTS:\n" + Object.keys(attrs).map(k => k + " | " + attrs[k]).join("\n"));
console.log(Object.keys(vu).length + " cles de texte, " + Object.keys(attrs).length + " cles d attributs ; conflits : " + Object.keys(vu).filter(k => vu[k].conflit).join(", "));
