const { serveur, chrome } = require("./lib.js");
(async () => {
  const srv = await serveur(8142); const nav = await chrome(); const page = await nav.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto("http://127.0.0.1:8142/portfolio?photo=portrait-02", { waitUntil: "networkidle2" });
  await page.waitForFunction(() => window.Visionneuse.etat().charge);
  await page.evaluate(() => { window.__ev = []; const s = document.querySelector(".visio-scene");
    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(n => s.addEventListener(n, e => window.__ev.push(n.replace("pointer", "") + "@" + Math.round(e.clientX) + "," + Math.round(e.clientY) + " t" + Math.round(e.timeStamp)), true)); });
  const t0 = Date.now();
  const d = await page.touchscreen.touchStart(330, 420); for (let i = 1; i <= 8; i++) await d.move(330 - i * 30, 420); await d.end();
  await new Promise(r => setTimeout(r, 400));
  console.log("duree du geste cote test :", Date.now() - t0 - 400, "ms");
  console.log((await page.evaluate(() => window.__ev)).join("  "));
  console.log(JSON.stringify(await page.evaluate(() => window.Visionneuse.etat())));
  await nav.close(); srv.close();
})();
