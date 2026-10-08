/* MESURE DE VITESSE ET DE POIDS, comme sur un telephone moyen avec une connexion moyenne.
       node .outils/mesure-vitesse.js [dossier d un autre site a comparer]
   Pour chaque page : nombre de fichiers charges, poids total, poids des images, et le temps
   au bout duquel le plus gros element visible est affiche (ce que Google appelle LCP).
   Reglages de la simulation : telephone 390 px, processeur ralenti 4 fois, reseau « 4G lente »
   (1,6 Mbit/s, 150 ms de latence), rien en memoire. Chaque page est mesuree 3 fois : on garde
   la valeur du milieu. Les statistiques Umami sont ecartees (elles ne changent pas). */
const { serveur, chrome } = require("./lib.js");
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const autre = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;

async function mesurer(nav, base, url) {
  const page = await nav.newPage();
  const cdp = await page.createCDPSession();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setCacheEnabled(false);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.setRequestInterception(true);
  const fichiers = [];
  page.on("request", r => { if (/umami/.test(r.url())) r.abort(); else r.continue(); });
  page.on("response", async r => {
    try { const u = r.url(); if (u.startsWith("data:")) return; const b = await r.buffer(); const type = (r.headers()["content-type"] || "").split(";")[0];
      const texte = /javascript|css|html|json|xml|svg/.test(type);
      /* le serveur local n envoie rien de compresse ; Netlify compresse les textes : on compte donc leur poids compresse */
      fichiers.push({ u, type, brut: b.length, envoye: texte ? zlib.gzipSync(b).length : b.length, image: /image/.test(type), police: /font/.test(type) || /\.woff2/.test(u), externe: !u.startsWith(base) });
    } catch (e) {}
  });
  await page.evaluateOnNewDocument(() => { window.__lcp = 0; try { new PerformanceObserver(l => { l.getEntries().forEach(e => { window.__lcp = Math.max(window.__lcp, e.renderTime || e.loadTime || e.startTime); }); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch (e) {}
    try { sessionStorage.setItem("introVue", "1"); } catch (e) {} });
  const t0 = Date.now();
  await page.goto(base + url, { waitUntil: "load", timeout: 120000 });
  const charge = Date.now() - t0;
  await new Promise(r => setTimeout(r, 2500));
  const lcp = await page.evaluate(() => window.__lcp);
  await page.close();
  const somme = f => fichiers.filter(f).reduce((a, x) => a + x.envoye, 0);
  return { fichiers: fichiers.length, externes: fichiers.filter(x => x.externe).length, total: somme(() => true), images: somme(x => x.image), code: somme(x => !x.image && !x.police), polices: somme(x => x.police), lcp: Math.round(lcp), charge };
}
const milieu = (liste, cle) => liste.map(x => x[cle]).sort((a, b) => a - b)[Math.floor(liste.length / 2)];

(async () => {
  const nav = await chrome();
  const sites = [["nouveau (v2.0)", null, { accueil: "/", portfolio: "/portfolio", prestations: "/prestations", contact: "/contact", apropos: "/apropos" }]];
  if (autre) sites.unshift(["avant (v1.9)", autre, { accueil: "/", portfolio: "/portfolio.html", prestations: "/prestations.html", contact: "/contact.html", apropos: "/apropos.html" }]);
  const sortie = {};
  let port = 8191;
  for (const [nom, racine, pages] of sites) {
    const srv = await serveur(++port, racine || undefined); const base = "http://127.0.0.1:" + port;
    sortie[nom] = {};
    for (const p of Object.keys(pages)) {
      const essais = []; for (let i = 0; i < 3; i++) essais.push(await mesurer(nav, base, pages[p]));
      const r = {}; for (const c of ["fichiers", "externes", "total", "images", "code", "polices", "lcp", "charge"]) r[c] = milieu(essais, c);
      sortie[nom][p] = r;
      console.log(nom.padEnd(16) + p.padEnd(13) + String(r.fichiers).padStart(3) + " fichiers (" + r.externes + " hors site)  " + (r.total / 1024).toFixed(0).padStart(5) + " Ko  dont images " + (r.images / 1024).toFixed(0).padStart(5) + " Ko, code " + (r.code / 1024).toFixed(0).padStart(4) + " Ko, polices " + (r.polices / 1024).toFixed(0).padStart(3) + " Ko   affichage " + (r.lcp / 1000).toFixed(2) + " s   chargement complet " + (r.charge / 1000).toFixed(2) + " s");
    }
    srv.close();
  }
  await nav.close();
  fs.writeFileSync(path.join(__dirname, "_vitesse.json"), JSON.stringify(sortie, null, 1));
})().catch(e => { console.error("ECHEC", e); process.exit(1); });
