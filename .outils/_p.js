const fs=require("fs");
function patch(f, paires) { let s = fs.readFileSync(f, "utf8"); for (const [a, b] of paires) { if (s.split(a).length !== 2) { console.error(f + " : motif trouve " + (s.split(a).length - 1) + " fois : " + a.slice(0, 70)); process.exit(1); } s = s.replace(a, b); } fs.writeFileSync(f, s); console.log(f + " : " + paires.length + " retouches"); }
patch(".outils/construire.js", [
 ["  mail: '<svg", "  photo: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"1.8\"/><path d=\"M4 17l5-4 4 3 3-2 4 3\"/></svg>',\n  etoile: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3.2l2.6 5.6 6.1.7-4.6 4.1 1.3 6L12 16.5l-5.4 3.1 1.3-6-4.6-4.1 6.1-.7z\"/></svg>',\n  mail: '<svg"],
 ['    page.id === "contact" || page.id === "merci" ? ""', '    page.id === "contact" || page.id === "merci" || page.id === "links" ? ""']
]);
patch("links.html", [["<a href=\"/portfolio\"><!--@icone lieu--><!--/@icone-->", "<a href=\"/portfolio\"><!--@icone photo--><!--/@icone-->"]]);
