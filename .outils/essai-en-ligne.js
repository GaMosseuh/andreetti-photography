/* ESSAI DU SITE EN LIGNE, apres une mise en ligne.
       node .outils/essai-en-ligne.js             les pages, la console, la visionneuse
       node .outils/essai-en-ligne.js --message   en plus : envoie UN vrai message par le formulaire
   Le message d essai est clairement marque « ESSAI, a ignorer ». Il arrive dans la boite mail
   comme une vraie demande : c est le but, on verifie toute la chaine. */
const { chrome } = require("./lib.js");
const SITE = "https://andreettiphoto.fr";
const pause = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const nav = await chrome(); let ko = 0;
  const dire = (ok, texte) => { if (!ok) ko++; console.log((ok ? "  ok     " : "  ECHEC  ") + texte); };
  for (const chemin of ["/", "/portfolio", "/prestations", "/apropos", "/contact", "/links", "/mentions-legales"]) {
    const page = await nav.newPage(); const erreurs = [];
    page.on("pageerror", e => erreurs.push(e.message)); page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
    page.on("requestfailed", r => { if (!/umami/.test(r.url())) erreurs.push("echec : " + r.url()); });
    const rep = await page.goto(SITE + chemin, { waitUntil: "networkidle2", timeout: 60000 });
    const info = await page.evaluate(() => ({ h1: (document.querySelector("h1") || {}).textContent, images: [].slice.call(document.images).filter(i => i.complete && !i.naturalWidth && i.getAttribute("src")).length, video: [].slice.call(document.querySelectorAll('section[data-si="video"]')).filter(s => !s.hidden).length }));
    dire(rep.status() === 200 && !erreurs.length && !info.images && !info.video, chemin + " : " + rep.status() + ", " + (erreurs.length ? erreurs.slice(0, 2).join(" | ") : "aucune erreur") + ", images cassees : " + info.images + ", bloc video visible : " + info.video);
    await page.close();
  }
  /* la visionneuse, en ligne */
  const p = await nav.newPage();
  await p.goto(SITE + "/portfolio?serie=ouanne", { waitUntil: "networkidle2" });
  await p.click("#serieGalerie .tuile");
  await p.waitForFunction(() => window.Visionneuse && window.Visionneuse.etat().charge, { timeout: 20000 });
  const filig = await p.evaluate(() => { const f = document.querySelector(".visio-filigrane"); return getComputedStyle(f).visibility === "visible" && f.getBoundingClientRect().width > 10; });
  dire(filig, "visionneuse en ligne : la photo de Ouanne s ouvre, avec son filigrane");
  await p.close();
  /* le formulaire */
  if (process.argv.includes("--message")) {
    const f = await nav.newPage(); const reponses = [];
    f.on("response", r => { if (r.request().method() === "POST") reponses.push(r.status() + " " + r.url()); });
    await f.goto(SITE + "/contact?prestation=sport", { waitUntil: "networkidle2" });
    await f.type('[name="nom"]', "ESSAI v2.0 (Claude)");
    await f.type('[name="email"]', "contact@andreettiphoto.fr");
    await f.type('[name="message"]', "ESSAI AUTOMATIQUE, A IGNORER. Message envoye par Claude juste apres la mise en ligne de la version 2.0, pour verifier que le formulaire du site arrive bien dans la boite mail. Rien a faire.");
    const choix = await f.evaluate(() => document.querySelector('[name="prestation"]').value);
    await Promise.all([f.waitForNavigation({ timeout: 30000 }).catch(() => {}), f.click('#contactForm button[type="submit"], #contactForm .btn')]);
    await pause(2500);
    const fin = await f.evaluate(() => ({ chemin: location.pathname, texte: (document.querySelector("h1") || {}).textContent, erreur: (document.querySelector(".form-erreur, [role=alert]") || {}).textContent || "" }));
    dire(fin.chemin === "/merci" && reponses.some(r => /^200|^303|^302/.test(r)), "formulaire : prestation preremplie « " + choix + " », envoi → " + fin.chemin + " (« " + String(fin.texte).trim().slice(0, 40) + " ») ; reponses : " + reponses.join(", ") + (fin.erreur ? " ; " + fin.erreur : ""));
    await f.close();
  }
  await nav.close();
  console.log(ko ? "\n" + ko + " ECHEC(S)" : "\ntout est bon");
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error("ECHEC : " + e.message); process.exit(1); });
