/* Experience : quel reglage ralentit l affichage (LCP) ? Script jetable. */
const { serveur, chrome } = require("../lib.js");
const VARIANTES = {
  "tel quel": "",
  "sans entree": "main > *, .pied{animation:none!important}",
  "sans zoom": ".hero .cadre img{animation:none!important}",
  "sans les deux": "main > *, .pied, .hero .cadre img{animation:none!important}"
};
async function mesurer(nav, url, css) {
  const page = await nav.newPage(); const cdp = await page.createCDPSession();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setCacheEnabled(false);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.setRequestInterception(true);
  page.on("request", r => { if (/umami/.test(r.url())) r.abort(); else r.continue(); });
  await page.evaluateOnNewDocument(css => {
    window.__lcp = []; try { new PerformanceObserver(l => { l.getEntries().forEach(e => window.__lcp.push({ t: Math.round(e.renderTime || e.loadTime || e.startTime), quoi: (e.element ? e.element.tagName + "." + String(e.element.className).slice(0, 30) : "?") + " " + (e.url || "").split("/").pop(), taille: e.size })); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch (e) {}
    if (css) { const poser = () => { const s = document.createElement("style"); s.textContent = css; (document.head || document.documentElement).appendChild(s); }; if (document.documentElement) poser(); else new MutationObserver((m, o) => { if (document.documentElement) { poser(); o.disconnect(); } }).observe(document, { childList: true }); }
  }, css);
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await new Promise(r => setTimeout(r, 3000));
  const l = await page.evaluate(() => window.__lcp);
  await page.close(); return l;
}
(async () => {
  const srv = await serveur(8199); const nav = await chrome();
  for (const chemin of process.argv.slice(2).length ? process.argv.slice(2) : ["", "prestations"]) for (const nom of Object.keys(VARIANTES)) {
    const l = await mesurer(nav, "http://127.0.0.1:8199/" + chemin, VARIANTES[nom]);
    console.log(("/" + chemin).padEnd(14) + nom.padEnd(15) + l.map(e => e.t + " ms " + e.quoi + " (" + e.taille + ")").join("  →  "));
  }
  await nav.close(); srv.close();
})().catch(e => { console.error("ECHEC", e); process.exit(1); });
