/* ============================================================================
   STATISTIQUES DE VISITE — Umami (sans cookie, respectueux du RGPD)
   ----------------------------------------------------------------------------
   POUR ACTIVER (2 minutes) :
     1. Crée un compte gratuit sur  https://cloud.umami.is
     2. Ajoute ton site ("Add website"), nom : ANDREETTI, domaine : andreettiphoto.fr
     3. Umami te donne un identifiant (Website ID) qui ressemble à :
          b3f2c1a4-9d7e-4c88-a1b2-5f6e7d8c9a0b
     4. Colle-le ci-dessous entre les guillemets, à la place du vide. C'est tout.
        Tant que la ligne est vide, RIEN n'est chargé ni envoyé : aucune stat,
        aucune requête réseau, zéro impact. Le site fonctionne normalement.

   CE QUI EST MESURÉ une fois activé :
     - le nombre de visites et les pages vues (automatique)
     - les clics sur les onglets du menu (Portfolio, Contact, À propos…)
     - les clics sur les photos du portfolio (quelle photo intéresse)
     - les clics sur les trois univers de l'accueil, les séances et les formules portrait
     - les clics sur les boutons importants (devis, contact, avis Google)
     - les clics vers Instagram / Facebook / LinkedIn / la page Liens, et sur le téléphone
     - l'envoi du formulaire de contact

   VIE PRIVÉE : Umami ne pose AUCUN cookie et n'identifie personne
   individuellement. Pas de bannière de consentement nécessaire, et la promesse
   "aucun suivi publicitaire" du site reste vraie.
   ========================================================================== */
"use strict";

var UMAMI_ID = "c14dd643-c64a-4fb8-a47c-5040c0c03143"; // compte Umami d'Alexandre (identifiant public, pas un secret)
var UMAMI_SRC = "https://cloud.umami.is/script.js";

/* Domaines sur lesquels on compte VRAIMENT les visites.
   Sans ça, Umami compte aussi les tests en local (localhost / 127.0.0.1) et les
   stats deviennent fausses. Le jour du domaine perso, il est déjà prévu ici. */
var UMAMI_DOMAINS = "andreettiphoto.fr,andreetti-photography.netlify.app";

(function () {
  /* 1) Chargement du script de mesure, uniquement si un identifiant est renseigné */
  if (UMAMI_ID) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = UMAMI_SRC;
    s.setAttribute("data-website-id", UMAMI_ID);
    s.setAttribute("data-domains", UMAMI_DOMAINS); // ne compte que le vrai site, pas les tests locaux
    document.head.appendChild(s);
  }

  /* 2) Envoi d'un événement — ne fait jamais planter le site si Umami est absent,
        bloqué par un bloqueur de pub, ou pas encore configuré. */
  function suivre(nom, donnees) {
    try {
      if (window.umami && typeof window.umami.track === "function") {
        window.umami.track(nom, donnees || {});
      }
    } catch (e) {}
  }
  window.suivreEvenement = suivre; // utilisable ailleurs (ex. formulaire)

  /* 3) Un seul ecouteur pour toute la page (leger et robuste).
        Mis a jour le 8 octobre 2026 pour la v2.0 : nouvelles pages, seances, formules, telephone. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("a, button") : null;
    if (!el) return;
    var page = document.body.getAttribute("data-page") || "?";
    var h = el.getAttribute("href") || "";

    // Menu (barre du haut, menu du telephone, pied de page)
    if (el.closest(".nav-liens, .menu-mobile, .pied-nav") && h.charAt(0) === "/") { suivre("menu", { onglet: h === "/" ? "accueil" : h.slice(1).split("?")[0], depuis: page }); return; }

    // Photo ouverte en grand
    if (el.classList.contains("tuile")) { suivre("photo", { fichier: el.getAttribute("data-photo") || "?" }); return; }
    // Seance ouverte (case du portfolio ou carte de l accueil)
    if (el.classList.contains("case") || el.classList.contains("carte-seance")) { suivre(el.classList.contains("case") ? "seance" : "derniere-seance", { seance: (h.split("serie=")[1] || "?").split("&")[0] }); return; }
    // Les trois univers de l accueil
    if (el.closest(".univers")) { suivre("categorie", { categorie: (h.split("cat=")[1] || "?").split("&")[0] }); return; }
    // Onglets et filtres du portfolio
    if (el.hasAttribute("data-vue")) { suivre("portfolio-vue", { vue: el.getAttribute("data-vue") }); return; }
    if (el.hasAttribute("data-cat")) { suivre("portfolio-filtre", { categorie: el.getAttribute("data-cat") }); return; }
    // Formules portrait : la photo d exemple, ou le bouton de reservation
    if (el.classList.contains("formule-photo")) { suivre("formule-exemple", { photo: (h.split("photo=")[1] || "?") }); return; }
    if (h.indexOf("prestation=") !== -1) { suivre("devis", { prestation: (h.split("prestation=")[1] || "?").split("&")[0], depuis: page }); return; }
    // Telephone, langue, video
    if (el.classList.contains("tel")) { suivre("clic-telephone", { depuis: page }); return; }
    if (el.hasAttribute("data-langue")) { suivre("langue", { langue: el.getAttribute("data-langue") }); return; }
    if (el.classList.contains("video-vignette")) { suivre("video-lancee", { depuis: page }); return; }

    // Liens sortants importants
    if (h.indexOf("g.page") !== -1) { suivre("avis-google", { depuis: page }); return; }
    if (h.indexOf("instagram.com") !== -1) { suivre("instagram", { depuis: page }); return; }
    if (h.indexOf("facebook.com") !== -1) { suivre("facebook", { depuis: page }); return; }
    if (h.indexOf("linkedin.com") !== -1) { suivre("linkedin", { depuis: page }); return; }
    if (h.indexOf("mailto:") === 0) { suivre("clic-email", { depuis: page }); return; }
    if (h === "/links") { suivre("page-liens", { depuis: page }); return; }

    // Boutons d action (devis, contact...)
    if (el.classList.contains("btn") || el.classList.contains("btn-2") || el.classList.contains("devis-flottant")) {
      suivre("bouton", { texte: (el.textContent || "").trim().slice(0, 40), depuis: page });
    }
  }, true); // phase de capture : l evenement est releve meme si un autre code arrete sa propagation

  /* 4) Envoi du formulaire de contact */
  var form = document.querySelector('form[name="contact"]');
  if (form) {
    form.addEventListener("submit", function () {
      var p = document.getElementById("prestation");
      suivre("formulaire-envoye", { prestation: p ? p.value : "?" });
    });
  }
})();
