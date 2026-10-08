/* Met toutes les dates <lastmod> du sitemap à la date du jour.
   Lancé automatiquement avant chaque déploiement (voir package.json).
   Pourquoi : Google se sert de <lastmod> comme signal de fraîcheur. Une date figée
   au 15/07 alors que le site a changé le 18/08 le fait passer moins souvent. */
const fs = require('fs');
const d = new Date().toISOString().slice(0, 10);
const p = 'sitemap.xml';
const avant = fs.readFileSync(p, 'utf8');
const apres = avant.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${d}</lastmod>`);
if (avant !== apres) { fs.writeFileSync(p, apres); console.log(`sitemap.xml : dates mises à jour au ${d}`); }
else console.log(`sitemap.xml : déjà au ${d}`);
