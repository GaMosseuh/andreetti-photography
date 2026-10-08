/* TEST DU SITE DANS UN VRAI NAVIGATEUR
       node .outils/test-site.js            (tout)
       node .outils/test-site.js largeurs   (une seule partie : largeurs, console, langues,
                                             contrastes, liens, sansjs, images, menu)
   Il ouvre chaque page dans Chrome (sans fenetre) et mesure ce qu un visiteur verrait :
   - les 20 largeurs d ecran de 320 a 3840 px, en clair et en sombre : rien ne deborde ;
   - la console du navigateur : aucune erreur, en francais et en anglais ;
   - les langues : francais par defaut, anglais complet, retour au francais intact ;
   - les contrastes de TOUS les textes (minimum 4,5 pour 1 ; 3 pour 1 pour les gros titres) ;
   - les liens : chaque bouton de devis preremplit la bonne prestation, chaque photo
     d exemple ouvre la bonne photo, chaque carte ouvre la bonne seance ;
   - sans JavaScript : le site reste lisible et ne dit rien de faux ;
   - aucune image etiree, nulle part.
   Si une ligne affiche ECHEC, ne pas mettre en ligne. */
const { serveur, chrome } = require("./lib.js");
const { PAGES } = require("./pages.js");
const { chargerDonnees } = require("./construire.js");
const fs = require("fs"), path = require("path");

const D = chargerDonnees();
const LARGEURS = [320, 360, 375, 390, 393, 412, 414, 430, 480, 540, 600, 768, 820, 1024, 1280, 1440, 1600, 1920, 2560, 3840];
const resultats = [];
const verifier = (nom, ok, detail) => resultats.push({ nom, ok: !!ok, detail: detail || "" });
const pause = ms => new Promise(r => setTimeout(r, ms));
const partie = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "";
const veut = p => !partie || partie === p;
let base, nav;

/* les ecrans a controler : chaque page, plus les trois etats du portfolio */
const ECRANS = PAGES.map(p => ({ nom: p.id, url: p.chemin === "/404" ? "/une-page-qui-n-existe-pas" : p.chemin }))
  .concat([{ nom: "portfolio (une séance ouverte)", url: "/portfolio?serie=marsannay" }, { nom: "portfolio (toutes les photos)", url: "/portfolio?vue=photos" }]);

async function ouvrir(url, opts) {
  opts = opts || {};
  const page = await nav.newPage();
  const erreurs = [];
  page.on("pageerror", e => erreurs.push("erreur : " + e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push("console : " + m.text()); });
  page.on("requestfailed", r => { const u = r.url(); if (!/umami|youtube|ytimg/.test(u)) erreurs.push("fichier introuvable : " + u.replace(base, "")); });
  page.on("response", r => { if (r.status() >= 400 && r.url().startsWith(base) && !/une-page-qui-n-existe-pas/.test(r.url())) erreurs.push(r.status() + " : " + r.url().replace(base, "")); });
  await page.setViewport({ width: opts.l || 1280, height: opts.h || 900, deviceScaleFactor: 1 });
  if (opts.sansJs) await page.setJavaScriptEnabled(false);
  await page.evaluateOnNewDocument((theme, langue) => { try { localStorage.setItem("theme", theme); if (langue) localStorage.setItem("lang", langue); } catch (e) {} }, opts.theme === "clair" ? "light" : "dark", opts.langue || "");
  await page.goto(base + url, { waitUntil: "networkidle2", timeout: 60000 });
  await pause(150);
  page.__erreurs = erreurs;
  return page;
}

/* ═══════ 1. LES 20 LARGEURS, CLAIR ET SOMBRE ═══════ */
async function largeurs() {
  const defauts = []; let mesures = 0;
  for (const theme of ["sombre", "clair"]) for (const ecran of ECRANS) {
    const page = await ouvrir(ecran.url, { theme });
    for (const L of LARGEURS) {
      await page.setViewport({ width: L, height: L < 700 ? 800 : 900, deviceScaleFactor: 1, isMobile: L < 700, hasTouch: L < 700 });
      await pause(60);
      const r = await page.evaluate(() => {
        const L = document.documentElement.clientWidth, pb = [];
        /* on retire le garde-fou overflow-x pour voir la verite */
        const b = document.body, av = b.style.overflowX; b.style.overflowX = "visible"; document.documentElement.style.overflowX = "visible";
        const deb = document.documentElement.scrollWidth - L;
        b.style.overflowX = av; document.documentElement.style.overflowX = "";
        if (deb > 1) {
          const fautifs = [].slice.call(document.querySelectorAll("body *")).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > L + 1 && getComputedStyle(e).position !== "fixed"; }).slice(0, 2).map(e => e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0]);
          pb.push("déborde de " + Math.round(deb) + " px (" + fautifs.join(", ") + ")");
        }
        /* un texte coupe par sa propre boite */
        [].slice.call(document.querySelectorAll("h1,h2,h3,.btn,.btn-2,.nav-logo,.onglets button,.filtres button,.surtitre,.offre-prix,.devis-flottant,.pied-promesse,.formule-prix")).forEach(e => {
          if (e.offsetParent === null || e.classList.contains("lecteur")) return;
          if (e.scrollWidth > e.clientWidth + 2) pb.push("texte coupé : " + e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0] + " « " + e.textContent.trim().slice(0, 24) + " »");
        });
        /* la barre du haut : tout ce qui est visible tient dedans, sans chevauchement */
        const visibles = [].slice.call(document.querySelectorAll(".nav-logo, .nav-droite > *")).filter(e => e.offsetParent !== null && getComputedStyle(e).display !== "none");
        visibles.forEach(e => { const r = e.getBoundingClientRect(); if (r.left < -0.5 || r.right > L + 0.5) pb.push("barre du haut : " + String(e.className).split(" ")[0] + " hors écran"); });
        const logo = document.querySelector(".nav-logo").getBoundingClientRect(), droite = document.querySelector(".nav-droite").getBoundingClientRect();
        if (logo.right > droite.left + 1) pb.push("barre du haut : le logo touche les boutons");
        const burger = document.querySelector(".burger"), liens = document.querySelector(".nav-liens");
        const burgerVisible = burger && getComputedStyle(burger).display !== "none", liensVisibles = liens && getComputedStyle(liens).display !== "none";
        if (burgerVisible === liensVisibles) pb.push("barre du haut : ni menu ni bouton ☰, ou les deux");
        if (burgerVisible) { const r = burger.getBoundingClientRect(); if (r.width < 44 || r.height < 44) pb.push("bouton ☰ trop petit"); }
        /* le bouton flottant reste dans l ecran */
        const f = document.querySelector(".devis-flottant"); if (f) { const r = f.getBoundingClientRect(); if (r.right > L + 0.5 || r.left < 0) pb.push("bouton flottant hors écran"); }
        /* les cibles tactiles : au moins 40 px de haut pour les boutons */
        [].slice.call(document.querySelectorAll("main .btn, main .btn-2, .onglets button, .formulaire input, .formulaire select")).forEach(e => { if (e.offsetParent !== null && e.getBoundingClientRect().height < 40) pb.push("cible trop petite : " + String(e.className).split(" ")[0]); });
        return pb;
      });
      mesures++;
      [...new Set(r)].forEach(x => defauts.push(ecran.nom + " @" + L + " px " + theme + " : " + x));
    }
    await page.close();
  }
  verifier("Les 20 largeurs (320 → 3840 px), clair et sombre, sur " + ECRANS.length + " écrans : rien ne déborde, rien n'est coupé", defauts.length === 0,
    mesures + " mesures" + (defauts.length ? " ; " + defauts.length + " défauts : " + defauts.slice(0, 6).join(" | ") : ""));
  return { mesures, defauts };
}

/* ═══════ 2. LA CONSOLE, EN FRANCAIS ET EN ANGLAIS ═══════ */
async function consoleNav() {
  const pb = [];
  for (const langue of ["fr", "en"]) for (const ecran of ECRANS) {
    const page = await ouvrir(ecran.url, { langue });
    /* on fait vivre la page : defilement, menu, theme */
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); if (window.basculerTheme) { basculerTheme(); basculerTheme(); } });
    await pause(150);
    /* sur la page introuvable, le navigateur signale lui-meme que l adresse n existe pas : c est le but */
    page.__erreurs.filter(e => !(ecran.nom === "introuvable" && /404/.test(e))).forEach(e => pb.push(ecran.nom + " (" + langue + ") : " + e));
    await page.close();
  }
  verifier("Console du navigateur : aucune erreur sur " + ECRANS.length + " écrans, en français et en anglais", pb.length === 0, pb.slice(0, 5).join(" | "));
}

/* ═══════ 3. LES LANGUES ═══════ */
async function langues() {
  /* on repart d un navigateur qui n a rien retenu : les parties precedentes du test
     (la console, en anglais) laissent sinon l anglais en memoire et faussent la suite */
  const vide = await nav.newPage();
  await vide.goto(base + "/", { waitUntil: "domcontentloaded" });
  await vide.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  await vide.close();
  /* francais par defaut, meme avec un navigateur regle en anglais */
  const page = await nav.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, "language", { get: () => "en-US" }); Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] }); });
  await page.goto(base + "/", { waitUntil: "networkidle2" });
  let r = await page.evaluate(() => ({ lang: document.documentElement.lang, titre: document.querySelector(".titre-section h2").textContent, boutons: [].slice.call(document.querySelectorAll("[data-langue]")).map(b => b.textContent + (b.getAttribute("aria-pressed") === "true" ? "*" : "")) }));
  verifier("Français par défaut, même avec un navigateur réglé en anglais (cas de Google)", r.lang === "fr" && /Prestations/.test(r.titre), "langue de la page : " + r.lang + " ; titre lu : « " + r.titre + " »");
  verifier("Le sélecteur ne propose que FR et EN", r.boutons.join(",") === "FR*,EN", r.boutons.join(", "));
  await page.close();

  const restes = [], nonRevenus = [];
  for (const ecran of ECRANS) {
    const p = await ouvrir(ecran.url, {});
    const avant = await p.evaluate(() => [].slice.call(document.querySelectorAll("main, .pied, .nav, .menu-mobile")).map(e => e.innerText).join("\n"));
    await p.evaluate(() => window.setLang("en")); await pause(150);
    /* en anglais : aucun texte marque ne doit etre reste identique au francais (sauf noms propres et mots communs aux deux langues) */
    const identiques = await p.evaluate(() => [].slice.call(document.querySelectorAll("[data-i18n]")).filter(e => e.offsetParent !== null && e.__fr !== undefined && e.innerHTML === e.__fr && !/^(Portfolio|Contact|Portrait|Sport|Instagram|Facebook|LinkedIn|Cookies|Dijon · Côte-d'Or · Yonne|Questions|Respect|2026)$/.test(e.textContent.trim())).map(e => e.getAttribute("data-i18n")));
    identiques.forEach(k => restes.push(ecran.nom + " : " + k));
    const lg = await p.evaluate(() => document.documentElement.lang);
    if (lg !== "en") restes.push(ecran.nom + " : langue de la page = " + lg);
    await p.evaluate(() => window.setLang("fr")); await pause(150);
    const apres = await p.evaluate(() => [].slice.call(document.querySelectorAll("main, .pied, .nav, .menu-mobile")).map(e => e.innerText).join("\n"));
    if (apres !== avant) { const a = avant.split("\n"), b = apres.split("\n"); const i = a.findIndex((x, k) => x !== b[k]); nonRevenus.push(ecran.nom + " : « " + (a[i] || "").slice(0, 40) + " » ≠ « " + (b[i] || "").slice(0, 40) + " »"); }
    p.__erreurs.filter(e => !(ecran.nom === "introuvable" && /404/.test(e))).forEach(e => restes.push(ecran.nom + " : " + e));
    await p.close();
  }
  verifier("Passage en anglais : tous les textes sont traduits, sur chaque écran", restes.length === 0, [...new Set(restes)].slice(0, 8).join(" | "));
  verifier("Retour au français : chaque texte revient exactement comme avant", nonRevenus.length === 0, nonRevenus.slice(0, 4).join(" | "));

  /* le choix EN est memorise d une page a l autre */
  const p2 = await ouvrir("/", { langue: "en" });
  r = await p2.evaluate(() => ({ lang: document.documentElement.lang, t: document.querySelector(".titre-section h2").textContent, avis: document.querySelector(".avis blockquote p").textContent, date: document.querySelector(".avis-date").textContent }));
  verifier("L'anglais choisi est gardé d'une page à l'autre", r.lang === "en" && /Services/.test(r.t), "titre : « " + r.t + " »");
  /* depuis le 8 octobre 2026 (demande d Alexandre) : en anglais, les avis sont montres traduits, et c est dit */
  const mention = await p2.evaluate(() => { const m = document.querySelector(".avis .avis-traduit"); return m ? m.textContent : ""; });
  verifier("En anglais, les avis sont traduits et la traduction est signalée", r.avis.includes(D.AVIS[0].en.slice(0, 40)) && /October/.test(r.date) && /Translated/.test(mention), "mention : « " + mention + " » ; date : " + r.date);
  await p2.evaluate(() => window.setLang("fr")); await pause(200);
  const retour = await p2.evaluate(() => ({ avis: document.querySelector(".avis blockquote p").textContent, mention: !!document.querySelector(".avis .avis-traduit") }));
  verifier("En français, les avis restent mot pour mot, sans mention de traduction", retour.avis.includes(D.AVIS[0].texte.slice(0, 40)) && !retour.mention, "");
  await p2.close();
  /* un visiteur qui avait choisi une langue desormais en veille retombe sur le francais */
  const p3 = await ouvrir("/prestations", { langue: "es" });
  r = await p3.evaluate(() => ({ lang: document.documentElement.lang, memo: localStorage.getItem("lang"), t: document.querySelector("h1").textContent }));
  verifier("Une langue en veille déjà choisie (ex. espagnol) retombe sur le français, sans erreur", r.lang === "fr" && p3.__erreurs.length === 0, "langue : " + r.lang + (p3.__erreurs.length ? " ; " + p3.__erreurs[0] : ""));
  await p3.close();
}

/* ═══════ 4. LES CONTRASTES ═══════ */
async function contrastes() {
  let total = 0, minimum = 99, minOu = ""; const pb = []; const surPhoto = {};
  for (const theme of ["sombre", "clair"]) for (const ecran of ECRANS) for (const L of [390, 1440]) {
    const page = await ouvrir(ecran.url, { theme, l: L, h: 900 });
    const r = await page.evaluate(() => {
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const rgba = s => { const m = (s.match(/[\d.]+/g) || []).map(Number); return m.length >= 3 ? [m[0], m[1], m[2], m[3] === undefined ? 1 : m[3]] : null; };
      const sur = (h, b) => { const a = h[3]; return [h[0] * a + b[0] * (1 - a), h[1] * a + b[1] * (1 - a), h[2] * a + b[2] * (1 - a), 1]; };
      const fond = el => { const pile = []; let e = el; while (e) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { pile.push(c); if (c[3] >= 1) break; } e = e.parentElement; }
        let f = rgba(getComputedStyle(document.documentElement).getPropertyValue("--fond").trim() ? getComputedStyle(document.body).backgroundColor : "rgb(255,255,255)") || [255, 255, 255, 1];
        for (let i = pile.length - 1; i >= 0; i--) f = sur(pile[i], f); return f; };
      const out = [], vus = new Set();
      const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let n;
      while ((n = marcheur.nextNode())) {
        if (!n.nodeValue.trim()) continue;
        const el = n.parentElement; if (!el || vus.has(el)) continue; vus.add(el);
        if (el.closest("script,style,noscript,.visio,[hidden],.lecteur,.lien-evitement,option")) continue;
        const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || el.getClientRects().length === 0 || +cs.opacity === 0) continue;
        const zonePhoto = el.closest(".hero, .univers a, .formule-photo, .devis-photo");
        const taille = parseFloat(cs.fontSize), gras = parseInt(cs.fontWeight) || 400, grand = taille >= 24 || (taille >= 18.66 && gras >= 700);
        const c = rgba(cs.color); if (!c) continue;
        if (zonePhoto) { out.push({ photo: 1, t: el.textContent.trim().slice(0, 30), cls: String(zonePhoto.className).split(" ")[0] }); continue; }
        const f = fond(el), couleur = c[3] < 1 ? sur(c, f) : c;
        const l1 = lum(couleur), l2 = lum(f), ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        out.push({ r: Math.round(ratio * 100) / 100, seuil: grand ? 3 : 4.5, t: el.textContent.trim().slice(0, 34), cls: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""), taille });
      }
      return out;
    });
    for (const x of r) {
      if (x.photo) { surPhoto[x.cls] = (surPhoto[x.cls] || 0) + 1; continue; }
      total++;
      if (x.r < minimum) { minimum = x.r; minOu = ecran.nom + " " + theme + " : " + x.cls + " « " + x.t + " »"; }
      if (x.r < x.seuil) pb.push(ecran.nom + " " + theme + " @" + L + " : " + x.cls + " « " + x.t + " » " + x.r + ":1 (minimum " + x.seuil + ")");
    }
    await page.close();
  }
  verifier("Contrastes : tous les textes au-dessus du minimum (4,5:1 ; 3:1 pour les gros titres), clair et sombre", pb.length === 0,
    total + " textes mesurés ; le plus faible : " + minimum.toFixed(2) + ":1 (" + minOu + ")" + (pb.length ? " ; " + [...new Set(pb)].length + " sous le minimum : " + [...new Set(pb)].slice(0, 6).join(" | ") : ""));
  /* les textes poses sur une photo : mesure du pire cas, texte blanc sur le voile sombre */
  const p = await ouvrir("/", { theme: "sombre", l: 1440 });
  const voiles = await p.evaluate(() => {
    const out = {};
    const hv = getComputedStyle(document.querySelector(".hero-voile")).backgroundImage;
    out.hero = hv;
    out.univers = getComputedStyle(document.querySelector(".univers a"), "::before").backgroundImage;
    return out;
  });
  await p.close();
  /* blanc sur une photo, a travers un voile noir d opacite a : pire cas = photo blanche -> fond gris (255*(1-a)) */
  const pire = a => { const g = 255 * (1 - a) / 255; const lg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4); return (1.05) / (lg + 0.05); };
  verifier("Textes posés sur des photos : voile sombre suffisant même sur une photo toute blanche", pire(0.46) >= 3 && pire(0.55) >= 4.5,
    "haut de l'accueil, voile de 46 à 66 % : titre de 52 px à " + pire(0.56).toFixed(1) + ":1 au niveau du titre ; panneaux des univers, voile de 62 % en bas : " + pire(0.55).toFixed(1) + ":1 ; zones concernées : " + Object.keys(surPhoto).join(", "));
  return { total, minimum, minOu };
}

/* ═══════ 5. LES LIENS ═══════ */
async function liens() {
  /* a) chaque bouton de devis preremplit la bonne prestation */
  const attendu = { "portrait-etudiant": "Portrait étudiant (40 €)", "portrait-essentiel": "Portrait essentiel (50 €)", "portrait-confort": "Portrait confort (65 €)", "sport": "Sport", "evenementiel": "Événementiel", "portrait": "Portrait (autre demande)", "evenement": "Événementiel" };
  const pb = []; let n = 0;
  const p = await ouvrir("/prestations", {});
  const hrefs = await p.evaluate(() => [].slice.call(document.querySelectorAll('a[href*="prestation="]')).map(a => a.getAttribute("href")));
  await p.close();
  const p2 = await ouvrir("/portfolio?serie=ouanne", {}); const hSerie = await p2.evaluate(() => document.getElementById("serieDevis").getAttribute("href")); await p2.close();
  for (const h of [...new Set(hrefs.concat([hSerie, "/contact?prestation=portrait"]))]) {
    const cle = (h.split("prestation=")[1] || "").split("&")[0];
    const pc = await ouvrir(h, {});
    const val = await pc.evaluate(() => document.getElementById("prestation").value);
    if (val !== attendu[cle]) pb.push(h + " → « " + val + " » au lieu de « " + attendu[cle] + " »");
    n++; await pc.close();
  }
  verifier("Chaque bouton de devis préremplit la bonne prestation dans le formulaire", pb.length === 0 && hrefs.length >= 5, n + " liens essayés : " + [...new Set(hrefs)].map(h => h.split("=")[1]).join(", ") + (pb.length ? " ; " + pb.join(" | ") : ""));
  const pc = await ouvrir("/contact", {});
  const defaut = await pc.evaluate(() => ({ v: document.getElementById("prestation").value, n: document.getElementById("prestation").options.length }));
  verifier("Sans lien particulier, le formulaire propose « Je ne sais pas encore » et les " + (D.FORMULES.length + 5) + " choix", defaut.v === "À préciser" && defaut.n === D.FORMULES.length + 5, defaut.n + " choix, par défaut : " + defaut.v);
  await pc.close();

  /* b) chaque photo d exemple ouvre LA MEME photo dans le portfolio */
  const pf = await ouvrir("/prestations", {});
  const exemples = await pf.evaluate(() => [].slice.call(document.querySelectorAll(".formule")).map(f => ({ nom: f.querySelector("h3").textContent, href: f.querySelector(".formule-photo").getAttribute("href"), img: f.querySelector(".formule-photo img").getAttribute("src") })));
  await pf.close();
  const pbEx = [];
  for (const ex of exemples) {
    const id = ex.href.split("photo=")[1];
    const px = await ouvrir(ex.href, {});
    await px.waitForFunction(() => window.Visionneuse && window.Visionneuse.etat().charge, { timeout: 15000 }).catch(() => {});
    const e = await px.evaluate(() => ({ e: window.Visionneuse.etat(), src: document.querySelector(".visio-photo").getAttribute("src") }));
    if (!e.e.ouvert || e.e.id !== id || !ex.img.includes(id) || !e.src.includes(id)) pbEx.push(ex.nom + " : ouvre " + e.e.id + " au lieu de " + id);
    await px.close();
  }
  verifier("Chaque photo d'exemple d'une formule ouvre la même photo en grand dans le portfolio", pbEx.length === 0 && exemples.length === D.FORMULES.length, exemples.map(e => e.nom + " → " + e.href.split("photo=")[1]).join(" ; ") + (pbEx.length ? " ; " + pbEx.join(" | ") : ""));

  /* c) chaque carte de seance ouvre la bonne serie */
  const pa = await ouvrir("/", {});
  const cartes = await pa.evaluate(() => [].slice.call(document.querySelectorAll(".carte-seance")).map(c => ({ titre: c.querySelector("h3").textContent, href: c.getAttribute("href") })));
  const universLiens = await pa.evaluate(() => [].slice.call(document.querySelectorAll(".univers a")).map(a => a.getAttribute("href")));
  await pa.close();
  const pp = await ouvrir("/portfolio", {});
  const cases = await pp.evaluate(() => [].slice.call(document.querySelectorAll("#cases .case")).map(c => ({ titre: c.querySelector("h3").textContent, href: c.getAttribute("href"), id: c.getAttribute("data-serie") })));
  /* clic reel sur une case, puis retour */
  await pp.click('#cases .case[data-serie="ouanne"]'); await pause(300);
  const apresClic = await pp.evaluate(() => ({ titre: (document.getElementById("serieTitre") || {}).textContent, n: document.querySelectorAll("#serieGalerie .tuile").length, url: location.search, focus: document.activeElement && document.activeElement.id }));
  await pp.goBack(); await pause(300);
  const apresRetour = await pp.evaluate(() => ({ seances: !document.getElementById("vueSeances").hidden, url: location.search }));
  await pp.close();
  const pbSer = [];
  for (const c of cartes.concat(cases)) {
    const id = c.href.split("serie=")[1]; const s = D.SERIES.find(x => x.id === id);
    const ps = await ouvrir(c.href, {});
    const r = await ps.evaluate(() => ({ titre: (document.getElementById("serieTitre") || {}).textContent, n: document.querySelectorAll("#serieGalerie .tuile").length, visible: !document.getElementById("vueSerie").hidden }));
    const attenduN = D.PHOTOS.filter(x => x.serie === id).length;
    if (!s || !r.visible || r.titre !== s.titre.fr || r.titre !== c.titre || r.n !== attenduN) pbSer.push(c.titre + " → « " + r.titre + " », " + r.n + " photos (attendu " + attenduN + ")");
    await ps.close();
  }
  verifier("Chaque carte « Dernières séances » et chaque case du portfolio ouvre la bonne séance, avec toutes ses photos", pbSer.length === 0 && cartes.length >= 2 && cases.length >= 4,
    cartes.length + " cartes à l'accueil (" + cartes.map(c => c.titre).join(", ") + ") et " + cases.length + " cases au portfolio (" + cases.map(c => c.titre + " " + D.PHOTOS.filter(x => x.serie === c.id).length).join(", ") + ")" + (pbSer.length ? " ; " + pbSer.join(" | ") : ""));
  verifier("Un clic sur une case ouvre la série ; « retour » revient aux séances", apresClic.titre === "Théâtre à Ouanne" && apresClic.n === 6 && apresClic.url === "?serie=ouanne" && apresRetour.seances && apresRetour.url === "", "après le clic : " + apresClic.titre + ", " + apresClic.n + " photos, adresse " + apresClic.url);
  const pbU = [];
  for (const h of universLiens) { const cat = h.split("cat=")[1]; const pu = await ouvrir(h.replace(/&amp;/g, "&"), {});
    const r = await pu.evaluate(() => ({ vis: [].slice.call(document.querySelectorAll("#galerie .tuile")).filter(t => !t.hidden).length, actif: (document.querySelector('.filtres [aria-pressed="true"]') || {}).getAttribute ? document.querySelector('.filtres [aria-pressed="true"]').getAttribute("data-cat") : "" }));
    const att = D.PHOTOS.filter(x => x.cat === cat).length; if (r.vis !== att || r.actif !== cat) pbU.push(cat + " : " + r.vis + " photos (attendu " + att + ")"); await pu.close(); }
  verifier("Les trois univers de l'accueil ouvrent le portfolio filtré sur le bon univers", pbU.length === 0 && universLiens.length === 3, universLiens.map(h => h.split("cat=")[1] + " : " + D.PHOTOS.filter(x => x.cat === h.split("cat=")[1]).length + " photos").join(", ") + (pbU.length ? " ; " + pbU.join(" | ") : ""));

  /* d) reseaux, telephone, mail */
  const C = D.COORDONNEES, pbR = [];
  for (const ecran of ECRANS.filter(e => !/portfolio \(/.test(e.nom))) {
    const pr = await ouvrir(ecran.url, {});
    const r = await pr.evaluate(() => ({ ig: [].slice.call(document.querySelectorAll('a[href*="instagram.com"]')).map(a => a.href), fb: [].slice.call(document.querySelectorAll('a[href*="facebook.com"]')).map(a => a.href), li: [].slice.call(document.querySelectorAll('a[href*="linkedin.com"]')).map(a => a.href),
      tel: [].slice.call(document.querySelectorAll("a.tel")).map(a => a.getAttribute("href") + "|" + a.textContent), sansNom: [].slice.call(document.querySelectorAll("a, button")).filter(a => a.offsetParent !== null && !(a.textContent.trim() || a.getAttribute("aria-label") || a.title)).length }));
    if (!r.fb.length || r.fb.some(u => u !== C.facebook)) pbR.push(ecran.nom + " : Facebook " + (r.fb[0] || "absent"));
    if (!r.li.length || r.li.some(u => u !== C.linkedin)) pbR.push(ecran.nom + " : LinkedIn " + (r.li[0] || "absent"));
    if (!r.ig.length || r.ig.some(u => u.replace(/\/$/, "") !== C.instagram)) pbR.push(ecran.nom + " : Instagram " + (r.ig[0] || "absent"));
    if (r.tel.some(t => t !== "tel:" + C.telLien + "|" + C.telephone.replace(/ /g, " "))) pbR.push(ecran.nom + " : téléphone " + r.tel[0]);
    if (r.sansNom) pbR.push(ecran.nom + " : " + r.sansNom + " lien(s) sans nom lisible");
    await pr.close();
  }
  verifier("Instagram, Facebook et LinkedIn sur toutes les pages, bonnes adresses ; le téléphone compose le bon numéro", pbR.length === 0, pbR.slice(0, 5).join(" | "));
}

/* ═══════ 6. SANS JAVASCRIPT ═══════ */
async function sansJs() {
  const pb = [];
  for (const ecran of ECRANS.filter(e => !/portfolio \(/.test(e.nom))) for (const L of [390, 1280]) {
    const page = await ouvrir(ecran.url, { sansJs: true, l: L });
    const r = await page.evaluate(() => {
      const vis = e => e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden" && +getComputedStyle(e).opacity > 0;
      const t = document.body.innerText;
      return { faux: /Vos avis apparaîtront|Arrive prochainement|Bientôt/.test(t), longueur: t.length,
        imagesInvisibles: [].slice.call(document.querySelectorAll("main img")).filter(i => i.getClientRects().length > 0 && +getComputedStyle(i).opacity === 0).length,
        avis: document.querySelectorAll(".avis").length, tuiles: [].slice.call(document.querySelectorAll("#galerie .tuile")).filter(vis).length,
        menu: [].slice.call(document.querySelectorAll(".nav-liens a, .menu-mobile a")).filter(vis).length, options: document.querySelectorAll("#prestation option").length,
        boutonsMorts: [].slice.call(document.querySelectorAll("button.js-seul, .js-seul")).filter(vis).length, deb: document.documentElement.scrollWidth - document.documentElement.clientWidth, h1: (document.querySelector("h1") || {}).innerText };
    });
    const ou = ecran.nom + " @" + L + " : ";
    if (r.faux) pb.push(ou + "texte d'attente faux"); if (r.imagesInvisibles) pb.push(ou + r.imagesInvisibles + " image(s) invisible(s)");
    if (r.menu < 4) pb.push(ou + "navigation inaccessible (" + r.menu + " liens)"); if (r.boutonsMorts) pb.push(ou + r.boutonsMorts + " bouton(s) qui ne marcheraient pas");
    if (r.deb > 1) pb.push(ou + "déborde de " + r.deb + " px"); if (!r.h1) pb.push(ou + "pas de titre");
    if (ecran.nom === "accueil" && r.avis !== D.AVIS.length) pb.push(ou + r.avis + " avis au lieu de " + D.AVIS.length);
    if (ecran.nom === "portfolio" && r.tuiles !== D.PHOTOS.length) pb.push(ou + r.tuiles + " photos au lieu de " + D.PHOTOS.length);
    if (ecran.nom === "contact" && r.options < 5) pb.push(ou + "liste des prestations vide");
    await page.close();
  }
  verifier("Sans JavaScript : chaque page reste lisible, navigable, et ne dit rien de faux", pb.length === 0, pb.length ? pb.slice(0, 6).join(" | ") : "accueil : " + D.AVIS.length + " avis écrits dans la page ; portfolio : " + D.PHOTOS.length + " photos ; menu accessible ; aucun bouton mort");
}

/* ═══════ 7. AUCUNE IMAGE ETIREE ═══════ */
async function images() {
  const pb = []; let n = 0;
  for (const ecran of ECRANS) for (const L of [390, 820, 1440, 2560]) {
    const page = await ouvrir(ecran.url, { l: L });
    await page.evaluate(async () => { document.querySelectorAll("img").forEach(i => { i.loading = "eager"; }); for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      await Promise.all([].slice.call(document.images).map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); }))); });
    const r = await page.evaluate(() => [].slice.call(document.querySelectorAll("img")).filter(i => i.getClientRects().length > 0).map(i => {
      const b = i.getBoundingClientRect(), cs = getComputedStyle(i);
      return { src: (i.currentSrc || i.src).split("/").slice(-2).join("/"), nat: i.naturalWidth / i.naturalHeight, aff: b.width / b.height, fit: cs.objectFit, cassee: i.naturalWidth === 0, flou: i.naturalWidth > 0 && b.width > i.naturalWidth * 1.35 && b.width > 300, l: Math.round(b.width), nw: i.naturalWidth };
    }));
    for (const x of r) { n++;
      if (x.cassee) pb.push(ecran.nom + " @" + L + " : image absente " + x.src);
      else if (x.fit !== "cover" && x.fit !== "contain" && Math.abs(x.nat - x.aff) / x.nat > 0.015) pb.push(ecran.nom + " @" + L + " : ÉTIRÉE " + x.src + " (" + x.nat.toFixed(2) + " affichée en " + x.aff.toFixed(2) + ")");
    }
    await page.close();
  }
  verifier("Aucune image étirée ni absente, sur " + ECRANS.length + " écrans et 4 largeurs", pb.length === 0, n + " images contrôlées" + (pb.length ? " ; " + [...new Set(pb)].slice(0, 5).join(" | ") : " : chacune garde ses proportions (recadrée quand il le faut, jamais déformée)"));
}

/* ═══════ 8. LE MENU DU TELEPHONE ═══════ */
async function menu() {
  const page = await ouvrir("/prestations", { l: 390, h: 844 });
  await page.click(".burger"); await pause(150);
  let r = await page.evaluate(() => ({ ouvert: document.getElementById("menuMobile").classList.contains("ouvert"), liens: [].slice.call(document.querySelectorAll("#menuMobile a")).filter(a => a.getClientRects().length).length, bloque: document.documentElement.classList.contains("menu-ouvert"), exp: document.querySelector(".burger").getAttribute("aria-expanded") }));
  verifier("Téléphone : le bouton ☰ ouvre le menu (5 liens, le devis, les 3 réseaux)", r.ouvert && r.liens >= 8 && r.exp === "true", r.liens + " liens visibles");
  await page.setViewport({ width: 1280, height: 800 }); await pause(250);
  r = await page.evaluate(() => ({ ouvert: document.getElementById("menuMobile").classList.contains("ouvert"), bloque: document.documentElement.classList.contains("menu-ouvert") }));
  verifier("Le menu se referme tout seul quand l'écran s'élargit (rotation), et rend le défilement", !r.ouvert && !r.bloque, "");
  await page.setViewport({ width: 390, height: 844 }); await pause(150);
  await page.click(".burger"); await pause(100); await page.keyboard.press("Escape"); await pause(100);
  verifier("Échap referme le menu", await page.evaluate(() => !document.getElementById("menuMobile").classList.contains("ouvert")), "");
  /* theme */
  const t0 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.evaluate(() => basculerTheme());
  const t1 = await page.evaluate(() => [document.documentElement.getAttribute("data-theme"), localStorage.getItem("theme"), getComputedStyle(document.body).backgroundColor]);
  verifier("Le bouton de thème passe du sombre au clair et s'en souvient", t0 === "dark" && t1[0] === "light" && t1[1] === "light" && t1[2] === "rgb(245, 250, 251)", "fond en clair : " + t1[2]);
  verifier("Aucune erreur pendant ces manipulations", page.__erreurs.length === 0, page.__erreurs.slice(0, 2).join(" | "));
  await page.close();
  /* mode sombre par defaut pour un visiteur sans preference */
  /* un visiteur qui n a jamais rien choisi, avec un appareil regle en clair */
  const p = await nav.newPage(); await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  await p.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
  await p.goto(base + "/", { waitUntil: "domcontentloaded" });
  const th = await p.evaluate(() => [document.documentElement.getAttribute("data-theme"), getComputedStyle(document.body).backgroundColor]);
  verifier("Le mode sombre est le mode par défaut, même sur un appareil réglé en clair", th[0] === "dark" && th[1] === "rgb(14, 26, 30)", "fond : " + th[1]);
  await p.close();
}

(async () => {
  const PORT = 8161; base = "http://127.0.0.1:" + PORT;
  const srv = await serveur(PORT); nav = await chrome();
  const chiffres = {};
  try {
    if (veut("largeurs")) chiffres.largeurs = await largeurs();
    if (veut("console")) await consoleNav();
    if (veut("langues")) await langues();
    if (veut("contrastes")) chiffres.contrastes = await contrastes();
    if (veut("liens")) await liens();
    if (veut("sansjs")) await sansJs();
    if (veut("images")) await images();
    if (veut("menu")) await menu();
  } catch (e) { verifier("Le test est allé jusqu'au bout", false, (e.stack || e.message).slice(0, 400)); }
  await nav.close(); srv.close();
  const ko = resultats.filter(r => !r.ok);
  resultats.forEach(r => console.log((r.ok ? "  ok     " : "  ECHEC  ") + r.nom + (r.detail ? "  [" + r.detail + "]" : "")));
  console.log("\n" + (resultats.length - ko.length) + " verifications reussies sur " + resultats.length + (ko.length ? "  —  " + ko.length + " ECHEC(S)" : "  —  tout est bon"));
  if (process.argv.includes("--json")) fs.writeFileSync(path.join(__dirname, "_test-site.json"), JSON.stringify({ resultats, chiffres }, null, 1));
  process.exit(ko.length ? 1 : 0);
})();
