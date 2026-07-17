/* ============================================================================
   STATISTIQUES DE VISITE — Umami (sans cookie, respectueux du RGPD)
   ----------------------------------------------------------------------------
   POUR ACTIVER (2 minutes) :
     1. Crée un compte gratuit sur  https://cloud.umami.is
     2. Ajoute ton site ("Add website"), nom : ANDREETTI, domaine : andreetti.photography
     3. Umami te donne un identifiant (Website ID) qui ressemble à :
          b3f2c1a4-9d7e-4c88-a1b2-5f6e7d8c9a0b
     4. Colle-le ci-dessous entre les guillemets, à la place du vide. C'est tout.
        Tant que la ligne est vide, RIEN n'est chargé ni envoyé : aucune stat,
        aucune requête réseau, zéro impact. Le site fonctionne normalement.

   CE QUI EST MESURÉ une fois activé :
     - le nombre de visites et les pages vues (automatique)
     - les clics sur les onglets du menu (Portfolio, Contact, À propos…)
     - les clics sur les photos du portfolio (quelle photo intéresse)
     - les clics sur les cartes de catégorie et les "Dernières séances"
     - les clics sur les boutons importants (devis, contact, avis Google)
     - les clics vers Instagram / Facebook / la page Liens
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
var UMAMI_DOMAINS = "andreetti-photography.netlify.app,andreetti.photography";

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

  /* 3) Un seul écouteur pour toute la page (léger et robuste) */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("a, button") : null;
    if (!el) return;

    var page = document.body.getAttribute("data-page") || "?";

    // Onglets du menu (desktop + mobile)
    var nav = el.getAttribute("data-nav");
    if (nav) { suivre("menu", { onglet: nav, depuis: page }); return; }

    // Photo du portfolio agrandie
    if (el.classList.contains("masonry-item")) {
      var img = el.querySelector("img");
      var fichier = img ? (img.getAttribute("src") || "").split("/").pop() : "?";
      suivre("photo", { fichier: fichier, categorie: el.dataset.category || "?" });
      return;
    }

    // Carte de catégorie (accueil) et carte "Dernières séances"
    if (el.classList.contains("cat-card") || el.classList.contains("last-card")) {
      var href = el.getAttribute("href") || "";
      var cat = (href.split("cat=")[1] || "?").split("&")[0];
      suivre(el.classList.contains("cat-card") ? "categorie" : "derniere-seance", { categorie: cat });
      return;
    }

    // Liens sortants importants
    var h = el.getAttribute("href") || "";
    if (h.indexOf("g.page") !== -1) { suivre("avis-google", { depuis: page }); return; }
    if (h.indexOf("instagram.com") !== -1) { suivre("instagram", { depuis: page }); return; }
    if (h.indexOf("facebook.com") !== -1) { suivre("facebook", { depuis: page }); return; }
    if (h.indexOf("mailto:") === 0) { suivre("clic-email", { depuis: page }); return; }
    if (h.indexOf("links.html") !== -1) { suivre("page-liens", { depuis: page }); return; }

    // Boutons d'action (devis, contact, portfolio…)
    if (el.classList.contains("btn-teal") || el.classList.contains("btn-ghost") || el.classList.contains("btn-ghost-teal")) {
      suivre("bouton", { texte: (el.textContent || "").trim().slice(0, 40), depuis: page });
    }
  }, true); // phase de capture : l'événement est relevé même si un autre code arrête sa propagation

  /* 4) Envoi du formulaire de contact */
  var form = document.querySelector('form[name="contact"]');
  if (form) {
    form.addEventListener("submit", function () {
      var p = document.getElementById("prestation");
      suivre("formulaire-envoye", { prestation: p ? p.value : "?" });
    });
  }
})();
