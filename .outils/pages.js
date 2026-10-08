/* LES PAGES DU SITE : adresse, titre et description de chacune.
   C est ICI qu on change un titre de page ou sa description (ce que Google affiche).
   Apres modification : node .outils/construire.js

   Regles (decisions d Alexandre) :
   - un titre fait MOINS DE 60 caracteres, sinon Google le coupe ;
   - pas de tiret cadratin dans un titre : utiliser  ·  ou  |  ;
   - le titre de l accueil commence par ANDREETTI ;
   - une seule forme d adresse, SANS ".html". */
module.exports = {
  SITE: "https://andreettiphoto.fr",
  NOM: "ANDREETTI Photography",
  PAGES: [
    { fichier: "accueil.html", chemin: "/", id: "accueil", menu: "Accueil",
      titre: "ANDREETTI · Photographe à Dijon et dans l'Yonne",
      description: "Photographe à Dijon (21) et dans l'Yonne (89). Portrait, sport, événementiel. Devis gratuit, réponse sous 48 h, photos livrées sous 10 jours.",
      scripts: [] },
    { fichier: "portfolio.html", chemin: "/portfolio", id: "portfolio", menu: "Portfolio",
      titre: "Portfolio · Photographe à Dijon | ANDREETTI",
      description: "Le portfolio d'Alexandre ANDREETTI, photographe à Dijon : portraits, photos de sport et reportages d'événements, séance par séance.",
      scripts: ["visionneuse.js", "portfolio.js"] },
    { fichier: "prestations.html", chemin: "/prestations", id: "prestations", menu: "Prestations",
      titre: "Prestations et tarifs · Photographe à Dijon | ANDREETTI",
      description: "Portrait à prix fixe : 40, 50 ou 65 €, tout compris. Sport et événementiel sur devis gratuit sous 48 h. Photographe à Dijon et dans l'Yonne.",
      scripts: [] },
    { fichier: "apropos.html", chemin: "/apropos", id: "apropos", menu: "À propos",
      titre: "À propos · Alexandre ANDREETTI, photographe à Dijon",
      description: "Alexandre ANDREETTI, photographe portrait, sport et événementiel à Dijon et dans l'Yonne. Mon approche, et ce que j'ai déjà fait.",
      scripts: [] },
    { fichier: "contact.html", chemin: "/contact", id: "contact", menu: "Contact",
      titre: "Contact et devis gratuit · Photographe à Dijon | ANDREETTI",
      description: "Écrivez à Alexandre ANDREETTI, photographe à Dijon : portrait, sport, événementiel. Devis gratuit et réponse sous 48 h.",
      scripts: ["contact.js"] },
    { fichier: "links.html", chemin: "/links", id: "links", horsMenu: true,
      titre: "Mes liens · ANDREETTI, photographe à Dijon",
      description: "Tous les liens d'Alexandre ANDREETTI, photographe à Dijon et dans l'Yonne : site, Instagram, Facebook, LinkedIn, avis Google, contact.",
      scripts: [] },
    { fichier: "mentions-legales.html", chemin: "/mentions-legales", id: "mentions", horsMenu: true, robots: "noindex, follow",
      titre: "Mentions légales et confidentialité · ANDREETTI",
      description: "Mentions légales et politique de confidentialité du site andreettiphoto.fr.",
      scripts: [] },
    { fichier: "merci.html", chemin: "/merci", id: "merci", horsMenu: true, robots: "noindex",
      titre: "Merci · ANDREETTI",
      description: "Votre message est bien parti.",
      scripts: [] },
    { fichier: "404.html", chemin: "/404", id: "introuvable", horsMenu: true, robots: "noindex",
      titre: "Page introuvable · ANDREETTI",
      description: "Cette page n'existe pas ou a été déplacée.",
      scripts: [] }
  ]
};
