/* TEST DE LA VISIONNEUSE — a relancer apres toute retouche de assets/visionneuse.js
       node .outils/test-visionneuse.js
   Il ouvre le site dans un vrai Chrome (sans fenetre), et joue les gestes d un visiteur :
   clic, glisse, molette, clavier, puis les doigts (pincement, double touche, balayage).
   LE TEST N° 1 EST CELUI DU BUG D OCTOBRE 2026 : se deplacer dans une photo zoomee ne
   doit jamais la dezoomer. Si une ligne affiche ECHEC, ne pas mettre en ligne.
   Le filigrane est verifie a chaque etape : coin bas droit de la partie visible. */
const { serveur, chrome } = require("./lib.js");

const resultats = [];
function verifier(nom, ok, detail) { resultats.push({ nom, ok: !!ok, detail: detail || "" }); }
const pause = ms => new Promise(r => setTimeout(r, ms));
const proche = (a, b, tol) => Math.abs(a - b) <= tol;

async function etat(page) { return page.evaluate(() => window.Visionneuse.etat()); }
async function repos(page) {      // attend la fin du passage en douceur
  await page.waitForFunction(() => !document.getElementById("visio").hasAttribute("data-anim"), { timeout: 3000 });
  await pause(40);
}
async function ouvrir(page, base, photo) {
  await page.goto(base + "/portfolio?photo=" + photo, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForFunction(() => window.Visionneuse && window.Visionneuse.etat().charge, { timeout: 15000 });
  await pause(120);
}
/* la geometrie reelle a l ecran : photo, scene, filigrane */
async function geo(page) {
  return page.evaluate(() => {
    const r = e => { const b = e.getBoundingClientRect(); return { g: b.left, d: b.right, h: b.top, b: b.bottom, l: b.width, ha: b.height }; };
    const s = r(document.querySelector(".visio-scene")), i = r(document.querySelector(".visio-photo")), f = document.querySelector(".visio-filigrane");
    const fr = r(f), fs = getComputedStyle(f);
    return { scene: s, photo: i, filigrane: fr, filigraneVisible: fs.visibility === "visible", taillePolice: fs.fontSize,
      visible: { g: Math.max(s.g, i.g), d: Math.min(s.d, i.d), h: Math.max(s.h, i.h), b: Math.min(s.b, i.b) } };
  });
}
/* le filigrane est-il dans le coin bas droit de la partie visible de la photo ? */
async function filigraneAuCoin(page, etiquette, hauteurRef) {
  const g = await geo(page);
  const f = g.filigrane, v = g.visible;
  const ecartD = v.d - f.d, ecartB = v.b - f.b;
  const dedans = f.g >= v.g - 0.5 && f.h >= v.h - 0.5 && f.d <= v.d + 0.5 && f.b <= v.b + 0.5;
  const ok = g.filigraneVisible && dedans && proche(ecartD, 12, 1.5) && proche(ecartB, 12, 1.5) && (hauteurRef == null || proche(f.ha, hauteurRef, 0.6));
  verifier("Filigrane au coin bas droit : " + etiquette, ok,
    "à " + ecartD.toFixed(1) + " px du bord droit et " + ecartB.toFixed(1) + " px du bas de la partie visible, hauteur " + f.ha.toFixed(1) + " px" + (dedans ? "" : " — HORS DE LA PHOTO"));
  return f.ha;
}
/* la photo sort-elle de l ecran ? Si elle est plus grande que la scene, elle doit la couvrir ; sinon etre centree. */
async function photoBornee(page, etiquette) {
  const g = await geo(page); const s = g.scene, p = g.photo;
  const okX = p.l > s.l + 1 ? (p.g <= s.g + 1 && p.d >= s.d - 1) : proche((p.g + p.d) / 2, (s.g + s.d) / 2, 1.5);
  const okY = p.ha > s.ha + 1 ? (p.h <= s.h + 1 && p.b >= s.b - 1) : proche((p.h + p.b) / 2, (s.h + s.b) / 2, 1.5);
  verifier("La photo ne sort pas de l'écran : " + etiquette, okX && okY, "photo " + p.l.toFixed(0) + "×" + p.ha.toFixed(0) + " dans une scène de " + s.l.toFixed(0) + "×" + s.ha.toFixed(0));
}

/* ═══════════════ ORDINATEUR ═══════════════ */
async function ordinateur(nav, base) {
  const page = await nav.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const erreurs = []; page.on("pageerror", e => erreurs.push(e.message)); page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await ouvrir(page, base, "portrait-02");
  let e = await etat(page), g = await geo(page);
  verifier("Lien direct vers une photo : elle s'ouvre en grand", e.ouvert && e.id === "portrait-02" && e.echelle === 1, "photo " + e.id + ", zoom " + e.echelle);
  await photoBornee(page, "photo entière");
  const hFil = await filigraneAuCoin(page, "photo entière", null);

  /* un clic zoome SUR LE POINT CLIQUE */
  const cx = g.photo.g + g.photo.l * 0.70, cy = g.photo.h + g.photo.ha * 0.30;
  await page.mouse.click(cx, cy); await repos(page);
  e = await etat(page); g = await geo(page);
  verifier("Un clic zoome", e.echelle > 2, "zoom " + e.echelle.toFixed(2));
  // le point de la photo qui etait sous le curseur doit toujours y etre (a la limite des bords pres)
  const fracX = (cx - g.photo.g) / g.photo.l, fracY = (cy - g.photo.h) / g.photo.ha;
  /* photo verticale : une fois zoomee elle reste plus etroite que l ecran, donc centree en largeur ;
     seul le sens vertical peut suivre le curseur. Les deux sens sont verifies plus bas sur une photo horizontale. */
  verifier("Le zoom se fait sur le point cliqué (photo verticale, sens vertical)", proche(fracY, 0.30, 0.06), "point visé à 30 % de la hauteur, point sous le curseur à " + (fracY * 100).toFixed(0) + " %");
  await photoBornee(page, "après un clic");
  await filigraneAuCoin(page, "après un clic (zoom " + e.echelle.toFixed(1) + ")", hFil);

  /* ★ LE BUG : glisser dans une photo zoomee ne doit pas la dezoomer */
  const avant = await etat(page);
  await page.mouse.move(700, 450); await page.mouse.down();
  await page.mouse.move(640, 410, { steps: 6 }); await page.mouse.move(560, 360, { steps: 8 });
  const pendant = await etat(page);
  await page.mouse.up(); await pause(450);
  const apres = await etat(page);
  verifier("★ Glisser dans une photo zoomée NE DÉZOOME PAS", apres.echelle === avant.echelle && pendant.echelle === avant.echelle,
    "zoom avant " + avant.echelle.toFixed(2) + ", pendant " + pendant.echelle.toFixed(2) + ", après " + apres.echelle.toFixed(2));
  verifier("Le glissé déplace bien la photo", Math.abs(apres.tx - avant.tx) > 60 || Math.abs(apres.ty - avant.ty) > 40, "déplacement de " + (apres.tx - avant.tx).toFixed(0) + " px et " + (apres.ty - avant.ty).toFixed(0) + " px");
  await photoBornee(page, "après un glissé");
  await filigraneAuCoin(page, "après un glissé", hFil);

  /* dix glisses de suite, dans tous les sens */
  for (let i = 0; i < 10; i++) { await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(720 + (i % 2 ? 1 : -1) * (60 + i * 25), 450 + (i % 3 - 1) * 90, { steps: 5 }); await page.mouse.up(); await pause(30); }
  await pause(400); e = await etat(page);
  verifier("★ Dix glissés de suite : toujours zoomé", e.echelle === avant.echelle, "zoom " + e.echelle.toFixed(2));

  /* glisser tres loin : la photo bute contre les bords */
  await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(-900, -900, { steps: 6 }); await page.mouse.up(); await pause(80);
  await photoBornee(page, "glissé très loin vers le haut à gauche");
  await filigraneAuCoin(page, "photo poussée contre un bord", hFil);
  await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(2600, 2400, { steps: 6 }); await page.mouse.up(); await pause(80);
  await photoBornee(page, "glissé très loin vers le bas à droite");
  await filigraneAuCoin(page, "photo poussée contre l'autre bord", hFil);

  /* un clic sans deplacement sur une photo zoomee dezoome */
  await pause(400); await page.mouse.click(720, 450); await repos(page);
  e = await etat(page);
  verifier("Un clic sans déplacement dézoome", e.echelle === 1 && e.tx === 0 && e.ty === 0, "zoom " + e.echelle);

  /* un double-clic ne fait pas clignoter : on finit zoome, une seule fois */
  await pause(450); await page.mouse.click(720, 450, { clickCount: 2, delay: 60 }); await repos(page); await pause(200);
  e = await etat(page);
  verifier("Un double-clic zoome une seule fois (pas de clignotement)", e.echelle > 2, "zoom " + e.echelle.toFixed(2));
  await pause(450); await page.keyboard.press("0"); await repos(page);

  /* molette : zoom sous la souris, par petits pas (pave tactile) puis par crans (molette) */
  g = await geo(page);
  const mx = g.photo.g + g.photo.l * 0.25, my = g.photo.h + g.photo.ha * 0.75;
  await page.mouse.move(mx, my);
  let precedent = 1, monotone = true, sautMax = 0;
  for (let i = 0; i < 40; i++) { await page.mouse.wheel({ deltaY: -8 }); const z = (await etat(page)).echelle; if (z < precedent - 1e-6) monotone = false; sautMax = Math.max(sautMax, z / precedent); precedent = z; }
  verifier("Pavé tactile : le zoom monte en douceur, sans saut", monotone && sautMax < 1.05 && precedent > 1.5, "40 petits mouvements, zoom final " + precedent.toFixed(2) + ", plus grand saut ×" + sautMax.toFixed(3));
  g = await geo(page);
  const fx = (mx - g.photo.g) / g.photo.l, fy = (my - g.photo.h) / g.photo.ha;
  verifier("La molette zoome sous la souris (photo verticale, sens vertical)", proche(fy, 0.75, 0.05), "souris à 75 % de la hauteur, point sous la souris après zoom à " + (fy * 100).toFixed(0) + " %");
  await filigraneAuCoin(page, "après la molette", hFil);
  const z0 = (await etat(page)).echelle; await page.mouse.wheel({ deltaY: -100 }); const z1 = (await etat(page)).echelle;
  verifier("Molette à crans : un cran donne un pas raisonnable", z1 / z0 > 1.1 && z1 / z0 < 1.5, "un cran multiplie le zoom par " + (z1 / z0).toFixed(2));
  for (let i = 0; i < 60; i++) await page.mouse.wheel({ deltaY: -100 });
  e = await etat(page);
  verifier("Le zoom s'arrête à son maximum", proche(e.echelle, e.max, 0.001), "zoom " + e.echelle.toFixed(2) + ", maximum " + e.max.toFixed(2));
  await photoBornee(page, "zoom maximum");
  await filigraneAuCoin(page, "zoom maximum (" + e.echelle.toFixed(1) + ")", hFil);
  for (let i = 0; i < 80; i++) await page.mouse.wheel({ deltaY: 100 });
  e = await etat(page);
  verifier("Dézoomer à la molette revient à la photo entière, centrée", e.echelle === 1 && e.tx === 0 && e.ty === 0, "zoom " + e.echelle);

  /* clavier */
  await page.keyboard.press("+"); await repos(page); const zp = (await etat(page)).echelle;
  await page.keyboard.press("+"); await repos(page); const zpp = (await etat(page)).echelle;
  await page.keyboard.press("-"); await repos(page); const zm = (await etat(page)).echelle;
  await page.keyboard.press("0"); await repos(page); const z00 = (await etat(page)).echelle;
  verifier("Clavier : + zoome, − dézoome, 0 remet à zéro", zp > 1 && zpp > zp && zm < zpp && z00 === 1, "+ → " + zp.toFixed(2) + ", + → " + zpp.toFixed(2) + ", − → " + zm.toFixed(2) + ", 0 → " + z00);
  await page.keyboard.press("+"); await repos(page);
  const idAvant = (await etat(page)).id;
  await page.keyboard.press("ArrowRight"); await page.waitForFunction(i => window.Visionneuse.etat().id !== i && window.Visionneuse.etat().charge, {}, idAvant); await pause(80);
  e = await etat(page);
  verifier("Flèche droite : photo suivante, zoom remis à zéro", e.id !== idAvant && e.echelle === 1, "de " + idAvant + " à " + e.id + ", zoom " + e.echelle);
  await filigraneAuCoin(page, "photo suivante", hFil);
  await page.keyboard.press("ArrowLeft"); await page.waitForFunction(i => window.Visionneuse.etat().id === i && window.Visionneuse.etat().charge, {}, idAvant); await pause(60);
  verifier("Flèche gauche : retour à la photo précédente", (await etat(page)).id === idAvant, "");

  /* 150 fleches a toute vitesse : pas de rond d attente bloque (bug d aout) */
  for (let i = 0; i < 150; i++) await page.keyboard.press(i % 3 ? "ArrowRight" : "ArrowLeft");
  await page.waitForFunction(() => window.Visionneuse.etat().charge, { timeout: 15000 }); await pause(700);
  const bloque = await page.evaluate(() => document.getElementById("visio").classList.contains("charge"));
  verifier("150 flèches à toute vitesse : pas de rond d'attente bloqué", !bloque, "");

  /* photo deja signee dans le fichier : pas de second filigrane */
  /* (plus aucune photo du site n est dans ce cas depuis le 9 octobre 2026 : on en fabrique une
     pour l essai, en ouvrant directement la visionneuse avec une photo marquee nowmark) */
  await ouvrir(page, base, "event-10");
  g = await geo(page);
  verifier("Photo du site : le filigrane est bien posé (Ouanne, signalé le 9 octobre)", g.filigraneVisible, "");
  await page.evaluate(() => { const p = Object.assign({}, Rendu.photo("event-10"), { nowmark: true }); Visionneuse.fermer(true); Visionneuse.ouvrir([p], 0, {}); });
  await page.waitForFunction(() => window.Visionneuse.etat().charge, { timeout: 15000 });
  await pause(150);
  g = await geo(page);
  verifier("Photo déjà signée (nowmark) : pas de second filigrane", !g.filigraneVisible, "");
  /* photo horizontale */
  await ouvrir(page, base, "sport-01");
  await photoBornee(page, "photo horizontale entière");
  await filigraneAuCoin(page, "photo horizontale entière", hFil);
  g = await geo(page);
  { const hx = g.photo.g + g.photo.l * 0.72, hy = g.photo.h + g.photo.ha * 0.34;
    await page.mouse.click(hx, hy); await repos(page); const g2 = await geo(page);
    const ax = (hx - g2.photo.g) / g2.photo.l, ay = (hy - g2.photo.h) / g2.photo.ha;
    verifier("Le zoom se fait sur le point cliqué (photo horizontale, les deux sens)", proche(ax, 0.72, 0.03) && proche(ay, 0.34, 0.03), "point visé 72 % / 34 %, point sous le curseur " + (ax * 100).toFixed(0) + " % / " + (ay * 100).toFixed(0) + " %");
    await pause(450); await page.keyboard.press("0"); await repos(page);
    const g3 = await geo(page); const wx = g3.photo.g + g3.photo.l * 0.2, wy = g3.photo.h + g3.photo.ha * 0.8;
    await page.mouse.move(wx, wy); for (let i = 0; i < 6; i++) await page.mouse.wheel({ deltaY: -100 });
    const g4 = await geo(page); const bx = (wx - g4.photo.g) / g4.photo.l, by = (wy - g4.photo.h) / g4.photo.ha;
    verifier("La molette zoome sous la souris (photo horizontale, les deux sens)", proche(bx, 0.2, 0.03) && proche(by, 0.8, 0.03), "souris à 20 % / 80 %, point sous la souris après zoom " + (bx * 100).toFixed(0) + " % / " + (by * 100).toFixed(0) + " %"); }
  await filigraneAuCoin(page, "photo horizontale zoomée", hFil);
  await photoBornee(page, "photo horizontale zoomée");

  /* fermeture : Echap, et le bouton retour du navigateur */
  await page.keyboard.press("Escape"); await pause(300);
  let ferme = await page.evaluate(() => !window.Visionneuse.estOuverte() && !/photo=/.test(location.search) && !document.documentElement.classList.contains("visio-ouverte"));
  verifier("Échap ferme la photo et rend le défilement à la page", ferme, "");
  await page.click("#galerie .tuile:not([hidden])"); await page.waitForFunction(() => window.Visionneuse.etat().charge); await pause(100);
  const adr = await page.evaluate(() => location.search);
  await page.goBack(); await pause(300);
  ferme = await page.evaluate(() => !window.Visionneuse.estOuverte());
  verifier("Le bouton « retour » du navigateur ferme la photo", /photo=/.test(adr) && ferme, "adresse pendant la photo : " + adr);
  /* clic sur le fond sombre : ferme */
  await page.click("#galerie .tuile:not([hidden])"); await page.waitForFunction(() => window.Visionneuse.etat().charge); await pause(100);
  g = await geo(page);
  await page.mouse.click(g.scene.g + 200, g.scene.h + 24); await pause(300);      // dans le fond sombre, loin des fleches
  verifier("Un clic à côté de la photo la ferme", await page.evaluate(() => !window.Visionneuse.estOuverte()), "");
  verifier("Aucune erreur dans la console (ordinateur)", erreurs.length === 0, erreurs.slice(0, 3).join(" | "));
  await page.close();
}

/* ═══════════════ TELEPHONE (doigts) ═══════════════ */
async function telephone(nav, base) {
  const page = await nav.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const erreurs = []; page.on("pageerror", e => erreurs.push(e.message)); page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await ouvrir(page, base, "portrait-02");
  const ecran = page.touchscreen;
  let g = await geo(page);
  const hFil = await filigraneAuCoin(page, "téléphone, photo entière", null);
  await photoBornee(page, "téléphone, photo entière");

  /* pincement : deux doigts qui s ecartent autour d un point */
  const px = g.photo.g + g.photo.l * 0.35, py = g.photo.h + g.photo.ha * 0.40;
  const d1 = await ecran.touchStart(px - 30, py); const d2 = await ecran.touchStart(px + 30, py);
  for (let i = 1; i <= 10; i++) { await d1.move(px - 30 - i * 9, py); await d2.move(px + 30 + i * 9, py); }
  await pause(120);        // les gestes sont livres a la page au rythme de l affichage : on attend avant de lire
  let e = await etat(page); g = await geo(page);
  verifier("Pincer zoome", e.echelle > 2.5, "écart des doigts ×4, zoom " + e.echelle.toFixed(2));
  const fx = (px - g.photo.g) / g.photo.l, fy = (py - g.photo.h) / g.photo.ha;
  verifier("Le pincement zoome ENTRE les doigts", proche(fx, 0.35, 0.05) && proche(fy, 0.40, 0.05), "doigts à 35 % / 40 % de la photo, point entre les doigts après zoom " + (fx * 100).toFixed(0) + " % / " + (fy * 100).toFixed(0) + " %");
  await filigraneAuCoin(page, "pendant le pincement", hFil);
  /* un doigt se leve : le doigt restant ne doit pas faire sauter l image */
  const avantLever = await etat(page);
  await d2.end(); await pause(60);
  const apresLever = await etat(page);
  verifier("Lever un doigt après un pincement : l'image ne saute pas", proche(apresLever.tx, avantLever.tx, 1) && proche(apresLever.ty, avantLever.ty, 1) && apresLever.echelle === avantLever.echelle,
    "décalage " + (apresLever.tx - avantLever.tx).toFixed(1) + " px / " + (apresLever.ty - avantLever.ty).toFixed(1) + " px");
  /* le doigt restant deplace la photo d exactement son propre deplacement */
  await d1.move(px - 120 + 25, py + 18); await pause(120); const apresBouge = await etat(page);
  verifier("Le doigt restant déplace la photo sans à-coup", proche(apresBouge.tx - apresLever.tx, 25, 2.5) && proche(apresBouge.ty - apresLever.ty, 18, 2.5), "doigt déplacé de 25 px, photo déplacée de " + (apresBouge.tx - apresLever.tx).toFixed(1) + " px");
  await d1.end(); await pause(350);
  e = await etat(page);
  verifier("Après le pincement, la photo reste zoomée", e.echelle > 2.5, "zoom " + e.echelle.toFixed(2));
  await photoBornee(page, "téléphone, après pincement");
  await filigraneAuCoin(page, "téléphone, après pincement", hFil);

  /* ★ un doigt qui glisse dans la photo zoomee : pas de dezoom */
  const zAvant = e.echelle;
  for (let k = 0; k < 6; k++) { const d = await ecran.touchStart(200, 420); for (let i = 1; i <= 6; i++) await d.move(200 + (k % 2 ? 1 : -1) * i * 14, 420 + i * 9); await d.end(); await pause(40); }
  await pause(400); e = await etat(page);
  verifier("★ Téléphone : glisser dans une photo zoomée NE DÉZOOME PAS", e.echelle === zAvant, "zoom avant " + zAvant.toFixed(2) + ", après six glissés " + e.echelle.toFixed(2));
  /* ★ deux deplacements rapides ne sont pas une double touche (bug de l ancienne version) */
  for (let k = 0; k < 2; k++) { const d = await ecran.touchStart(190, 430); await d.move(205, 441); await d.move(222, 452); await d.end(); await pause(70); }
  await pause(400); e = await etat(page);
  verifier("★ Deux petits déplacements rapides ne sont pas pris pour une double touche", e.echelle === zAvant, "zoom " + e.echelle.toFixed(2));
  /* balayage sur une photo zoomee : on ne change pas de photo */
  const idZ = e.id; { const d = await ecran.touchStart(320, 420); for (let i = 1; i <= 8; i++) await d.move(320 - i * 30, 420); await d.end(); } await pause(300);
  verifier("Balayer une photo zoomée ne change pas de photo", (await etat(page)).id === idZ, "");
  await filigraneAuCoin(page, "téléphone, photo zoomée déplacée", hFil);

  /* double touche : retour a la photo entiere, puis zoom sur le point touche */
  await page.touchscreen.tap(195, 420); await pause(110); await page.touchscreen.tap(195, 420); await repos(page); await pause(120);
  e = await etat(page);
  verifier("Double touche sur une photo zoomée : retour à la photo entière", e.echelle === 1, "zoom " + e.echelle);
  await pause(450); g = await geo(page);
  const tx0 = g.photo.g + g.photo.l * 0.7, ty0 = g.photo.h + g.photo.ha * 0.3;
  await page.touchscreen.tap(tx0, ty0); await pause(110); await page.touchscreen.tap(tx0, ty0); await repos(page); await pause(120);
  e = await etat(page); g = await geo(page);
  const dfx = (tx0 - g.photo.g) / g.photo.l, dfy = (ty0 - g.photo.h) / g.photo.ha;
  verifier("Double touche : zoom sur le point touché", e.echelle > 2 && proche(dfx, 0.7, 0.07) && proche(dfy, 0.3, 0.07), "zoom " + e.echelle.toFixed(2) + ", point touché à " + (dfx * 100).toFixed(0) + " % / " + (dfy * 100).toFixed(0) + " %");
  await pause(450); await page.touchscreen.tap(195, 420); await pause(110); await page.touchscreen.tap(195, 420); await repos(page);
  /* une seule touche ne fait rien */
  await pause(500); await page.touchscreen.tap(195, 420); await pause(500);
  e = await etat(page);
  verifier("Une touche simple ne zoome pas et ne ferme pas", e.ouvert && e.echelle === 1, "");

  /* balayage photo entiere : photo suivante / precedente */
  const id0 = e.id;
  { const d = await ecran.touchStart(300, 380); for (let i = 1; i <= 8; i++) await d.move(300 - i * 30, 380); await d.end(); }
  await page.waitForFunction(i => window.Visionneuse.etat().id !== i && window.Visionneuse.etat().charge, { timeout: 8000 }, id0).catch(() => {});
  const id1 = (await etat(page)).id;
  verifier("Balayer vers la gauche (photo entière) : photo suivante", id1 !== id0, "de " + id0 + " à " + id1);
  await pause(200);
  verifier("(le balayage a bien changé de photo avant le test du retour)", id1 !== id0, "");
  { const d = await ecran.touchStart(80, 380); for (let i = 1; i <= 8; i++) await d.move(80 + i * 30, 380); await d.end(); }
  await page.waitForFunction(i => window.Visionneuse.etat().id === i && window.Visionneuse.etat().charge, { timeout: 8000 }, id0).catch(() => {});
  verifier("Balayer vers la droite : photo précédente", (await etat(page)).id === id0, "");
  /* un balayage vertical ne change pas de photo */
  { const d = await ecran.touchStart(195, 300); for (let i = 1; i <= 8; i++) await d.move(195 + i * 3, 300 + i * 30); await d.end(); } await pause(300);
  verifier("Un geste vertical ne change pas de photo", (await etat(page)).id === id0, "");

  /* rotation du telephone pendant un zoom */
  { const a = await ecran.touchStart(165, 400), b = await ecran.touchStart(225, 400); for (let i = 1; i <= 8; i++) { await a.move(165 - i * 8, 400); await b.move(225 + i * 8, 400); } await a.end(); await b.end(); }
  await pause(300);
  await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await pause(500);
  await photoBornee(page, "téléphone tourné en paysage, photo zoomée");
  await filigraneAuCoin(page, "téléphone tourné en paysage", hFil);
  verifier("Aucune erreur dans la console (téléphone)", erreurs.length === 0, erreurs.slice(0, 3).join(" | "));
  await page.close();
}

/* ═══════════════ PLEIN ECRAN : TOUTES LES TAILLES ═══════════════ */
async function tailles(nav, base) {
  const liste = [[320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [430, 932], [568, 320], [844, 390], [932, 430], [768, 1024], [1024, 768], [820, 1180], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [3840, 2160]];
  const defauts = [];
  for (const [l, h] of liste) {
    const page = await nav.newPage();
    await page.setViewport({ width: l, height: h, deviceScaleFactor: 1, isMobile: l < 900, hasTouch: l < 900 });
    for (const id of ["portrait-02", "sport-01"]) {
      await ouvrir(page, base, id);
      const r = await page.evaluate(() => {
        const R = e => e.getBoundingClientRect(), L = innerWidth, H = innerHeight;
        const scene = R(document.querySelector(".visio-scene")), photo = R(document.querySelector(".visio-photo")), fil = R(document.querySelector(".visio-filigrane"));
        const pb = [];
        if (photo.left < scene.left - 0.5 || photo.right > scene.right + 0.5 || photo.top < scene.top - 0.5 || photo.bottom > scene.bottom + 0.5) pb.push("photo coupée");
        if (Math.abs((photo.left + photo.right) / 2 - (scene.left + scene.right) / 2) > 1.5 || Math.abs((photo.top + photo.bottom) / 2 - (scene.top + scene.bottom) / 2) > 1.5) pb.push("photo mal centrée");
        if (photo.width < 40 || photo.height < 40) pb.push("photo minuscule");
        const boutons = [].slice.call(document.querySelectorAll(".visio button")).filter(b => !b.hidden && b.offsetParent !== null);
        boutons.forEach(b => { const r = R(b); const n = b.className;
          if (r.left < -0.5 || r.right > L + 0.5 || r.top < -0.5 || r.bottom > H + 0.5) pb.push(n + " hors de l'écran");
          if (r.width < 43.5 || r.height < 43.5) pb.push(n + " trop petit (" + r.width.toFixed(0) + "×" + r.height.toFixed(0) + ")");
          const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!(el === b || b.contains(el))) pb.push(n + " recouvert"); });
        for (let i = 0; i < boutons.length; i++) for (let j = i + 1; j < boutons.length; j++) { const a = R(boutons[i]), b = R(boutons[j]);
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) pb.push(boutons[i].className + " chevauche " + boutons[j].className); }
        if (getComputedStyle(document.querySelector(".visio-filigrane")).visibility === "visible" && (fil.right > photo.right + 0.5 || fil.bottom > photo.bottom + 0.5 || fil.left < photo.left - 0.5)) pb.push("filigrane hors de la photo");
        if (document.documentElement.scrollWidth > L + 1) pb.push("la page déborde");
        const leg = R(document.querySelector(".visio-pied")); if (leg.bottom > H + 0.5) pb.push("légende hors de l'écran");
        return { pb, photo: Math.round(photo.width) + "×" + Math.round(photo.height) };
      });
      if (r.pb.length) defauts.push(l + "×" + h + " " + id + " : " + r.pb.join(", "));
    }
    await page.close();
  }
  verifier("Plein écran sur " + liste.length + " tailles d'écran × 2 formats de photo : rien de coupé, de décentré ni de recouvert", defauts.length === 0, defauts.slice(0, 6).join(" ; "));
}

(async () => {
  const PORT = 8141, base = "http://127.0.0.1:" + PORT;
  const srv = await serveur(PORT); const nav = await chrome();
  try { await ordinateur(nav, base); await telephone(nav, base); await tailles(nav, base); }
  catch (e) { verifier("Le test est allé jusqu'au bout", false, e.message.slice(0, 300)); }
  await nav.close(); srv.close();
  const ko = resultats.filter(r => !r.ok);
  resultats.forEach(r => console.log((r.ok ? "  ok     " : "  ECHEC  ") + r.nom + (r.detail ? "  [" + r.detail + "]" : "")));
  console.log("\n" + (resultats.length - ko.length) + " verifications reussies sur " + resultats.length + (ko.length ? "  —  " + ko.length + " ECHEC(S)" : "  —  tout est bon"));
  if (process.argv.includes("--json")) require("fs").writeFileSync(require("path").join(__dirname, "_test-visionneuse.json"), JSON.stringify(resultats, null, 1));
  process.exit(ko.length ? 1 : 0);
})();
