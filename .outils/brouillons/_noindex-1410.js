/* 14 octobre 2026 : dans Google, seule la page d accueil doit apparaitre (demande d Alexandre).
   Script jetable (deja applique). */
const fs = require("fs"), path = require("path");
const O = path.join(__dirname, "..");
function fichier(f, paires) {
  const p = path.join(O, f); let t = fs.readFileSync(p, "utf8");
  if (t.includes("\r")) t = t.split("\r").join("");
  for (const [a, b] of paires) { if (!t.includes(a)) { console.log("   ABSENT dans " + f + " : " + a.slice(0, 90)); continue; } t = t.split(a).join(b); }
  fs.writeFileSync(p, t); console.log(f + " : fait");
}

/* 1. les 5 pages : visibles par les visiteurs, absentes des resultats Google */
const HG = 'robots: "noindex, follow", horsGoogle: true,';
fichier("pages.js", [
  ['PAGES: [', '/* horsGoogle : la page existe et se visite normalement depuis l accueil, mais Google ne\n     doit pas la montrer dans ses resultats (decision d Alexandre, 14 octobre 2026 : dans\n     Google, on ne doit tomber QUE sur l accueil). Elle porte "noindex, follow" : Google ne\n     la liste pas, mais continue de suivre ses liens. NE PAS la bloquer dans robots.txt :\n     Google ne verrait plus le noindex et pourrait la garder dans ses resultats. */\n  PAGES: ['],
  ['chemin: "/portfolio", id: "portfolio", menu: "Portfolio",', 'chemin: "/portfolio", id: "portfolio", menu: "Portfolio", ' + HG],
  ['chemin: "/prestations", id: "prestations", menu: "Prestations",', 'chemin: "/prestations", id: "prestations", menu: "Prestations", ' + HG],
  ['chemin: "/apropos", id: "apropos", menu: "À propos",', 'chemin: "/apropos", id: "apropos", menu: "À propos", ' + HG],
  ['chemin: "/contact", id: "contact", menu: "Contact",', 'chemin: "/contact", id: "contact", menu: "Contact", ' + HG],
  ['chemin: "/links", id: "links", horsMenu: true,', 'chemin: "/links", id: "links", horsMenu: true, ' + HG]
]);

/* 2. l en-tete : pas de canonique ni de fil d Ariane sur ces pages ; le reste ne change pas */
fichier("construire.js", [
  ["    '<link rel=\"canonical\" href=\"' + url + '\">', '<link rel=\"alternate\" hreflang=\"fr\" href=\"' + url + '\">', '<link rel=\"alternate\" hreflang=\"x-default\" href=\"' + url + '\">',\n",
   "    /* page hors Google : pas de canonique (elle dirait a Google « c est moi la bonne page » alors\n       que la page demande a ne pas etre listee) */\n    ...(page.horsGoogle ? [] : ['<link rel=\"canonical\" href=\"' + url + '\">', '<link rel=\"alternate\" hreflang=\"fr\" href=\"' + url + '\">', '<link rel=\"alternate\" hreflang=\"x-default\" href=\"' + url + '\">']),\n"],
  ["  if (!page.robots) {\n    h.push(ld(service(D), D));\n    if (page.id !== \"accueil\") h.push(ld(filAriane(page), D));",
   "  if (!page.robots || page.horsGoogle) {\n    h.push(ld(service(D), D));\n    if (page.id !== \"accueil\" && !page.horsGoogle) h.push(ld(filAriane(page), D));"]
]);

/* 3. les verifications suivent la nouvelle regle */
fichier("verifier.js", [
  ["  const descLongues = PAGES.filter(p => !p.robots && ", "  const descLongues = PAGES.filter(p => (!p.robots || p.horsGoogle) && "],
  ["    const can = (html.match(/<link rel=\"canonical\" href=\"([^\"]+)\"/) || [])[1];\n    if (can !== SITE + p.chemin) pb.push(p.id + \" : canonique \" + can);",
   "    const can = (html.match(/<link rel=\"canonical\" href=\"([^\"]+)\"/) || [])[1];\n    if (p.horsGoogle) { if (can) pb.push(p.id + \" : canonique alors que la page est hors Google\"); }\n    else if (can !== SITE + p.chemin) pb.push(p.id + \" : canonique \" + can);"],
  ["  verifier(\"Plan du site : les \" + attendu.length + \" pages publiques, sans .html\",",
   "  /* depuis le 14 octobre 2026 : seule l accueil est proposee a Google */\n  {\n    const rob = pages.map(({ p, html }) => ({ id: p.id, r: (html.match(/<meta name=\"robots\" content=\"([^\"]+)\"/) || [])[1] || \"\" }));\n    const malRegle = rob.filter(x => { const p = PAGES.find(q => q.id === x.id); if (p.id === \"accueil\") return !/^index, follow/.test(x.r); if (p.horsGoogle) return x.r !== \"noindex, follow\"; return !/noindex/.test(x.r); });\n    verifier(\"Dans Google, seule l'accueil : accueil en index, follow ; les 5 autres pages en noindex, follow\", malRegle.length === 0, rob.map(x => x.id + \" = \" + x.r.split(\",\")[0]).join(\" ; \"));\n    const rtxt = lire(\"robots.txt\");\n    verifier(\"robots.txt ne bloque aucune page (sinon Google ne verrait pas le noindex)\", !/Disallow:\\s*\\/\\S/.test(rtxt) && !/Disallow:\\s*\\/\\s*$/m.test(rtxt), rtxt.split(\"\\n\").filter(Boolean).join(\" | \"));\n  }\n  verifier(\"Plan du site : seulement l'accueil (\" + attendu.length + \" adresse), sans .html\","],
  ["  const fb = pages.filter(x => !x.p.robots || x.p.id === \"mentions\")", "  const fb = pages.filter(x => !x.p.robots || x.p.horsGoogle || x.p.id === \"mentions\")"],
  ["  const publiques = PAGES.filter(p => !p.robots);", "  const publiques = PAGES.filter(p => !p.robots || p.horsGoogle);"],
  ["  verifier(\"Fil d'Ariane sur les pages intérieures, Person sur À propos, FAQ sur Prestations\", publiques.filter(p => p.id !== \"accueil\").every(p => types[p.id].includes(\"BreadcrumbList\"))",
   "  verifier(\"Pas de fil d'Ariane sur les pages hors Google ; Person sur À propos, FAQ sur Prestations\", publiques.filter(p => p.horsGoogle).every(p => !types[p.id].includes(\"BreadcrumbList\"))"]
]);
