const fs = require("fs");
function patch(f, paires) { let s = fs.readFileSync(f, "utf8"); for (const [a, b] of paires) { const n = s.split(a).length - 1; if (n !== 1) { console.error(f + " : motif trouve " + n + " fois : " + a.slice(0, 70)); process.exit(1); } s = s.replace(a, b); } fs.writeFileSync(f, s); console.log(f + " : " + paires.length + " retouches"); }
patch(".outils/construire.js", [
 ["    \"<!-- Theme clair/sombre applique avant l affichage (pas de clignotement). Signale aussi que les scripts fonctionnent. -->\",\n    \"<script>(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('theme');if(s==='dark'||s==='light'){d.setAttribute('data-theme',s);}else{d.setAttribute('data-theme',(window.matchMedia&&window.matchMedia('(prefers-color-scheme:light)').matches)?'light':'dark');}}catch(e){d.setAttribute('data-theme','dark');}})();</script>\",",
  "    \"<!-- Le mode SOMBRE est le mode par defaut, pour tout le monde. Le mode clair ne s affiche que si le visiteur l a choisi avec le bouton.\",\n    \"     Ce petit script s execute avant l affichage (pas de clignotement) et signale aussi que les scripts fonctionnent. -->\",\n    \"<script>(function(){var d=document.documentElement,t='dark';d.classList.add('js');try{if(localStorage.getItem('theme')==='light')t='light';}catch(e){}d.setAttribute('data-theme',t);})();</script>\","],
 ["'<meta name=\"theme-color\" content=\"#F5FAFB\" media=\"(prefers-color-scheme: light)\">', '<meta name=\"theme-color\" content=\"#0E1A1E\" media=\"(prefers-color-scheme: dark)\">',", "'<meta name=\"theme-color\" content=\"#0E1A1E\">',"]
]);
patch("assets/common.js", [
 ["  /* tant que le visiteur n a rien choisi, on suit le reglage de son appareil */\n  if(window.matchMedia){\n    var mq = window.matchMedia('(prefers-color-scheme:dark)');\n    var suivre = function(e){\n      var memo = null; try{ memo = localStorage.getItem('theme'); }catch(err){}\n      if(!memo){ root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); sync(); }\n    };\n    if(mq.addEventListener) mq.addEventListener('change', suivre); else if(mq.addListener) mq.addListener(suivre);\n  }\n",
  "  /* Le sombre est le mode par defaut pour tous les visiteurs (decision d Alexandre) : on ne\n     suit pas le reglage de l appareil. Le clair n apparait que si le visiteur le choisit. */\n"],
 ["  /* la video : la section n existe que si un identifiant YouTube est renseigne dans data.js */\n  document.querySelectorAll('[data-si=\"video\"]').forEach(function(el){ el.hidden = !Rendu.videoPresente(); });",
  "  /* la video : la section n existe que si un identifiant YouTube est renseigne dans data.js */\n  document.querySelectorAll('[data-si=\"video\"]').forEach(function(el){ el.hidden = !Rendu.videoPresente(); });\n  /* previent les scripts de page que les blocs viennent d etre (re)ecrits */\n  try{ document.dispatchEvent(new CustomEvent('blocsremplis')); }catch(e){}"]
]);
patch("assets/contact.js", [
 ["/* la liste est reecrite quand la langue change : on remet le choix du visiteur */\ndocument.addEventListener('languechange', function(){ setTimeout(choisir, 0); });",
  "/* La liste est reecrite au chargement puis a chaque changement de langue (elle vient de\n   assets/data.js) : on y remet a chaque fois le choix du visiteur. */\ndocument.addEventListener('blocsremplis', choisir);"]
]);
