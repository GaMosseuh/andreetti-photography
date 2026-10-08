/* DONNEES DU SITE — le seul fichier a modifier pour le contenu courant.
   Refait le 8 octobre 2026 (v2.0). Tout ce qui change souvent est ICI :
   les seances, les photos, les avis, les formules portrait, la video, les coordonnees.

   Apres une modification : lancer  node .outils/construire.js  (il recopie ces donnees
   dans les pages pour les visiteurs sans JavaScript et pour Google). Le site marche
   aussi sans le lancer : les pages relisent ce fichier a chaque ouverture.

   Un texte peut s ecrire de deux facons :
     "Bonjour"                          -> le meme texte dans toutes les langues
     {fr:"Bonjour", en:"Hello"}         -> un texte par langue
   Le francais et l anglais sont obligatoires pour tout texte visible. */
"use strict";

/* ══ INTERRUPTEUR UNIQUE DU FILIGRANE ══
   true  = le site pose lui-meme "(c) ANDREETTI" sur chaque photo affichee.
   false = plus aucun filigrane pose par le site.
   A passer a false LE JOUR OU les photos auront le filigrane incruste dans le
   fichier (reexport depuis le Studio). C est le SEUL endroit a modifier. */
var FILIGRANE_HTML = true;
try{ document.documentElement.setAttribute('data-filigrane', FILIGRANE_HTML ? 'on' : 'off'); }catch(e){}

/* ---------- COORDONNEES ----------
   Une seule source : le pied de page, la page Contact, la page A propos, la page Liens
   et les donnees pour Google viennent d ici. */
var COORDONNEES = {
  mail:      "contact@andreettiphoto.fr",
  telephone: "06 82 29 86 58",                 // tel qu il s affiche
  telLien:   "+33682298658",                   // pour le lien "appeler" des telephones
  instagram: "https://instagram.com/andreetti.photography",
  instagramNom: "@andreetti.photography",
  facebook:  "https://www.facebook.com/Andreetti.photography",
  linkedin:  "https://www.linkedin.com/in/alexandre-andreetti/"
};

/* ---------- VIDEO DE PRESENTATION ----------
   Tant que "youtube" est vide, la section n apparait nulle part.
   Le jour ou la video est en ligne : coller ici l identifiant YouTube, c est-a-dire ce qui
   suit "watch?v=" dans l adresse (ex. pour https://www.youtube.com/watch?v=AbCdEfGhIjK,
   ecrire "AbCdEfGhIjK"), et un titre. Rien d autre a toucher.
   La video ne demarre jamais toute seule : le lecteur n est charge qu au clic.
   vignette : (facultatif) une image a moi pour la couverture, ex. "/images/video.webp".
              Sans rien, c est la couverture de YouTube qui est montree. */
var VIDEO_PRESENTATION = {
  youtube: "",
  vignette: "",
  titre: {fr:"", en:""}
};

/* ---------- LES SEANCES (series de photos) ----------
   POUR AJOUTER UNE SEANCE : copier un bloc, le coller EN TETE de la liste (la plus recente
   en premier), changer les valeurs. Puis donner son "id" aux photos concernees, plus bas,
   dans le champ serie.
     id         : un mot simple, sans espace ni accent (il sert dans l adresse de la page)
     titre      : le nom de la seance
     date       : AAAA-MM-JJ, ou AAAA-MM si le jour n a pas d importance
     lieu       : ou c etait (facultatif)
     univers    : portrait | sport | evenement
     couverture : l id de la photo qui represente la seance
     texte      : deux ou trois phrases de contexte
     accueil    : true = la seance a sa carte dans "Dernieres seances" (3 cartes au plus,
                  dans l ordre de cette liste)
     texteAccueil : texte de la carte de l accueil, s il doit differer de "texte"
     imageAccueil : image paysage de la carte (dans images/seances/). Si elle manque, la
                    carte prend la photo de couverture.
   Une seance qui n a encore aucune photo reste invisible partout : pas de carte vide. */
var SERIES = [
  { id:"elsa", univers:"portrait", date:"2026-09-26", couverture:"", accueil:true,
    titre:{fr:"Portrait avec Elsa", en:"Portrait session with Elsa"},
    lieu:{fr:"Parc de la Colombière, Dijon", en:"Parc de la Colombière, Dijon"},
    texte:{fr:"Séance portrait avec Elsa, le 26 septembre au parc de la Colombière, à Dijon.",
           en:"A portrait session with Elsa on 26 September at the Parc de la Colombière in Dijon."},
    texteAccueil:{fr:"Séance portrait avec Elsa, le 26 septembre au parc de la Colombière, à Dijon. Elle a passé un bon moment, et c'est elle qui le dit : son avis est juste en dessous.",
                  en:"A portrait session with Elsa on 26 September at the Parc de la Colombière in Dijon. She had a good time, and those are her words: her review is just below."},
    imageAccueil:"" },

  { id:"marsannay", univers:"sport", date:"2026-09-27", couverture:"handball-marsannay-01", accueil:true,
    titre:{fr:"Handball à Marsannay", en:"Handball in Marsannay"},
    lieu:{fr:"Espace du Rocher, Marsannay-la-Côte", en:"Espace du Rocher, Marsannay-la-Côte"},
    texte:{fr:"Le 27 septembre, j'ai couvert un match du CL Marsannay Handball, à l'Espace du Rocher. Mon premier match pour un club. En salle ça va très vite et la lumière est compliquée, c'est un vrai exercice. Le club a reçu ses photos retouchées.",
           en:"On 27 September I covered a CL Marsannay Handball match at the Espace du Rocher. My first match for a club. Indoors everything moves fast and the light is tricky, so it is a real challenge. The club received its edited photos."},
    imageAccueil:"seance-marsannay.webp" },

  { id:"ouanne", univers:"evenement", date:"2026-07-23", couverture:"event-10", accueil:true,
    titre:{fr:"Théâtre à Ouanne", en:"Theatre in Ouanne"},
    lieu:{fr:"Église de Ouanne, Yonne", en:"Ouanne church, Yonne"},
    texte:{fr:"Sous les vitraux de l'église de Ouanne, reportage en soirée du spectacle « Hippolyte et Antiope » par la troupe Les Folies Artistiques : j'ai suivi les comédiens au plus près de leur jeu.",
           en:"Beneath the stained glass of Ouanne church, an evening report on the show “Hippolyte et Antiope” by the Les Folies Artistiques company: I followed the actors as closely as I could."},
    imageAccueil:"seance-2.webp" },

  { id:"tir-a-l-arc", univers:"sport", date:"2026-07-12", couverture:"sport-06", accueil:false,
    titre:{fr:"Tir à l'arc", en:"Archery"},
    lieu:{fr:"En forêt, dans l'Yonne", en:"In the forest, Yonne"},
    texte:{fr:"Entraînement matinal de tir à l'arc, en pleine forêt : concentration, précision et lumière douce d'été.",
           en:"A morning archery practice deep in the forest: focus, precision and soft summer light."} },

  { id:"festival", univers:"evenement", date:"2024-07", dateTexte:{fr:"Été 2024", en:"Summer 2024"}, couverture:"event-02", accueil:false,
    titre:{fr:"Festival de musique", en:"Music festival"},
    lieu:{fr:"", en:""},
    texte:{fr:"Un festival de musique, à l'été 2024 : la captation vidéo de 11 groupes sur deux scènes, et pas mal de photos.",
           en:"A music festival in summer 2024: I filmed 11 bands on two stages, and took quite a few photos."} },

  { id:"islande", univers:"evenement", date:"2024-10", couverture:"event-03", accueil:false,
    titre:{fr:"Mariage en Islande", en:"Wedding in Iceland"},
    lieu:{fr:"Islande", en:"Iceland"},
    texte:{fr:"Un mariage en Islande, en octobre 2024. J'étais le photographe du mariage.",
           en:"A wedding in Iceland in October 2024. I was the wedding photographer."} }
];

/* ---------- LES PHOTOS ----------
   POUR AJOUTER DES PHOTOS : voir le mode d emploi en tete de .outils/photos.js
   (une commande fabrique les fichiers et affiche les lignes a coller ici).
     id      : le nom du fichier, sans ".webp" (images/portfolio/ID.webp)
     cat     : portrait | sport | evenement  (le filtre de "Toutes les photos")
     serie   : l id de la seance, ou rien si la photo n appartient a aucune seance
     alt     : ce que montre la photo, en une phrase vraie (lue par Google et par les
               lecteurs d ecran). Jamais de detail invente.
     nowmark : true si la photo a DEJA "(c) ANDREETTI" incruste dans le fichier
               (le site n en pose alors pas un second)
   L ordre de cette liste est l ordre d affichage dans "Toutes les photos".
   Les clientes de portrait : ne mettre QUE les photos qu elles ont validees. */
var PHOTOS = [
  {id:"portrait-02", cat:"portrait", alt:{fr:"Portrait d'un homme en veste en jean et lunettes de soleil", en:"Portrait of a man in a denim jacket and sunglasses"}},
  {id:"handball-marsannay-01", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : le gardien face à un tir", en:"CL Marsannay handball match, Marsannay-la-Côte: the goalkeeper facing a shot"}},
  {id:"event-10", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Scène du spectacle « Hippolyte et Antiope », église de Ouanne (Yonne)", en:"A scene from the show “Hippolyte et Antiope”, Ouanne church (Yonne)"}},
  {id:"portrait-08", cat:"portrait", alt:{fr:"Portrait de profil d'une jeune femme en extérieur", en:"Outdoor profile portrait of a young woman"}},
  {id:"event-03", cat:"evenement", serie:"islande", alt:{fr:"Mariage en Islande : les mariés", en:"Wedding in Iceland: the bride and groom"}},
  {id:"handball-marsannay-02", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : tir en suspension", en:"CL Marsannay handball match, Marsannay-la-Côte: a jump shot"}},
  {id:"sport-06", cat:"sport", serie:"tir-a-l-arc", alt:{fr:"Tir à l'arc en forêt dans l'Yonne : un archer en pleine visée", en:"Archery in the forest in Yonne: an archer taking aim"}},
  {id:"event-08", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Comédienne en costume dans la lumière de scène, théâtre à l'église de Ouanne (Yonne)", en:"An actress in costume in the stage light, theatre at Ouanne church (Yonne)"}},
  {id:"portrait-01", cat:"portrait", alt:{fr:"Portrait de nuit sous les lampadaires", en:"Night portrait under the street lamps"}},
  {id:"sport-02", cat:"sport", alt:{fr:"Footballeur, brassard de capitaine au bras, pendant un match", en:"A footballer wearing the captain's armband during a match"}},
  {id:"event-01", cat:"evenement", serie:"islande", alt:{fr:"Mariage en Islande : le prêtre pendant la cérémonie", en:"Wedding in Iceland: the priest during the ceremony"}},
  {id:"handball-marsannay-03", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : attaque face à la défense", en:"CL Marsannay handball match, Marsannay-la-Côte: an attack against the defence"}},
  {id:"portrait-03", cat:"portrait", alt:{fr:"Portrait d'une jeune femme attablée en extérieur", en:"Portrait of a young woman sitting at a table outdoors"}},
  {id:"event-06", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Pendant le spectacle « Hippolyte et Antiope », église de Ouanne (Yonne)", en:"During the show “Hippolyte et Antiope”, Ouanne church (Yonne)"}},
  {id:"sport-01", cat:"sport", alt:{fr:"Match de football : duel pour le ballon", en:"Football match: a duel for the ball"}},
  {id:"handball-marsannay-04", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : un tir face au gardien", en:"CL Marsannay handball match, Marsannay-la-Côte: a shot at the goalkeeper"}},
  {id:"portrait-06", cat:"portrait", alt:{fr:"Portrait d'un jeune homme en chemise blanche", en:"Portrait of a young man in a white shirt"}},
  {id:"event-07", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Comédiennes en costume, spectacle « Hippolyte et Antiope », église de Ouanne (Yonne)", en:"Actresses in costume, the show “Hippolyte et Antiope”, Ouanne church (Yonne)"}},
  {id:"sport-07", cat:"sport", serie:"tir-a-l-arc", alt:{fr:"Tir à l'arc en forêt dans l'Yonne : des archers sur le pas de tir", en:"Archery in the forest in Yonne: archers on the shooting line"}},
  {id:"event-02", cat:"evenement", serie:"festival", alt:{fr:"Chanteur au micro sur scène, lumières de concert", en:"A singer at the microphone on stage, concert lights"}},
  {id:"handball-marsannay-05", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : phase de jeu devant la défense", en:"CL Marsannay handball match, Marsannay-la-Côte: play in front of the defence"}},
  {id:"portrait-07", cat:"portrait", alt:{fr:"Portrait à la lumière chaude d'un lampadaire", en:"Portrait in the warm light of a street lamp"}},
  {id:"event-09", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Musiciens accompagnant le spectacle, église de Ouanne (Yonne)", en:"Musicians accompanying the show, Ouanne church (Yonne)"}},
  {id:"sport-04", cat:"sport", alt:{fr:"Match de football : course vers le ballon", en:"Football match: a run for the ball"}},
  {id:"handball-marsannay-06", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : l'équipe réunie", en:"CL Marsannay handball match, Marsannay-la-Côte: the team huddle"}},
  {id:"portrait-04", cat:"portrait", alt:{fr:"Portrait dans la fumée, sous une guirlande de lumières", en:"Portrait in the smoke, under a string of lights"}},
  {id:"event-11", cat:"evenement", serie:"ouanne", nowmark:true, alt:{fr:"Comédiennes devant les vitraux, théâtre à l'église de Ouanne (Yonne)", en:"Actresses in front of the stained glass, theatre at Ouanne church (Yonne)"}},
  {id:"sport-08", cat:"sport", serie:"tir-a-l-arc", alt:{fr:"Tir à l'arc en forêt dans l'Yonne : deux archers à l'entraînement", en:"Archery in the forest in Yonne: two archers practising"}},
  {id:"handball-marsannay-07", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : deux joueurs en défense", en:"CL Marsannay handball match, Marsannay-la-Côte: two players defending"}},
  {id:"event-05", cat:"evenement", serie:"festival", alt:{fr:"Batteur sur scène pendant un concert", en:"A drummer on stage during a concert"}},
  {id:"portrait-05", cat:"portrait", alt:{fr:"Portrait d'une femme marchant en pleine nature", en:"Portrait of a woman walking out in nature"}},
  {id:"handball-marsannay-08", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : deux joueurs pendant le match", en:"CL Marsannay handball match, Marsannay-la-Côte: two players during the match"}},
  {id:"sport-03", cat:"sport", alt:{fr:"Match de football : des joueurs sur le terrain", en:"Football match: players on the pitch"}},
  {id:"event-04", cat:"evenement", serie:"festival", alt:{fr:"Saxophoniste sur scène pendant un concert", en:"A saxophonist on stage during a concert"}},
  {id:"handball-marsannay-09", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : le banc pendant le match", en:"CL Marsannay handball match, Marsannay-la-Côte: the bench during the match"}},
  {id:"sport-05", cat:"sport", alt:{fr:"Footballeur balle au pied", en:"A footballer with the ball at his feet"}},
  {id:"handball-marsannay-10", cat:"sport", serie:"marsannay", alt:{fr:"Match de handball du CL Marsannay, Marsannay-la-Côte : les deux équipes réunies", en:"CL Marsannay handball match, Marsannay-la-Côte: both teams together"}}
];

/* ---------- LES TROIS UNIVERS DE L ACCUEIL ----------
   La composition fixe sous le haut de page : une photo par univers. Pour changer une
   photo, remplacer son id (prendre une photo verticale, elle remplit mieux le panneau). */
var UNIVERS_ACCUEIL = [
  {cat:"portrait",  photo:"portrait-02"},
  {cat:"sport",     photo:"handball-marsannay-02"},
  {cat:"evenement", photo:"event-08"}
];

/* ---------- FORMULES PORTRAIT (prix fixes) ----------
   Les prix viennent de la grille officielle (Business\Tarifs). Pour changer un prix :
   modifier "prix" ici, c est tout. Ne jamais ecrire "a partir de".
   exemple : l id de la photo montree a cote de la formule ; un clic l ouvre dans le portfolio.
   cadrage : (facultatif) ou placer la photo dans son cadre quand le sujet n est pas au centre,
             ex. "26% 50%" = decalee vers la gauche. Sans rien : centree. */
var FORMULES = [
  { id:"etudiant", prix:40, photos:10, exemple:"portrait-06",
    nom:{fr:"Portrait étudiant", en:"Student portrait"},
    duree:{fr:"1 h", en:"1 hour"},
    compris:{fr:"Sur présentation de la carte étudiante", en:"On presentation of a student card"} },
  { id:"essentiel", prix:50, photos:10, exemple:"portrait-08", cadrage:"26% 50%",
    nom:{fr:"Portrait essentiel", en:"Essential portrait"},
    duree:{fr:"1 h", en:"1 hour"},
    compris:{fr:"Un lieu, deux ou trois ambiances", en:"One location, two or three moods"} },
  { id:"confort", prix:65, photos:15, exemple:"portrait-07",
    nom:{fr:"Portrait confort", en:"Comfort portrait"},
    duree:{fr:"1 h 30", en:"1 h 30"},
    compris:{fr:"Un ou deux lieux, changement de tenue possible", en:"One or two locations, outfit change possible"} }
];

/* ---------- AVIS CLIENTS (fiche Google Business) ----------
   POUR AJOUTER UN AVIS : copier une ligne, la coller EN TETE de la liste (le plus recent
   en premier), puis remplacer les valeurs. Rien d autre a toucher.

   REGLE ABSOLUE : le texte se recopie MOT POUR MOT depuis la fiche Google, fautes,
   majuscules et ponctuation comprises. On ne corrige pas, on ne raccourcit pas, on ne
   traduit pas. Un retour a la ligne dans l avis s ecrit avec antislash + n.

   prenom : le prenom seul, tel qu il apparait sur Google. Jamais le nom de famille.
   texte  : le texte exact de l avis
   note   : nombre d etoiles, de 1 a 5
   date   : date de publication sur Google, au format AAAA-MM-JJ
   source : "google" (le badge renvoie vers la fiche, pour que l avis soit verifiable)
   ou     : les pages ou l avis s affiche : "accueil", "formules" (sous les formules
            portrait de la page Prestations), "contact" (pres du formulaire)

   Textes releves sur la fiche Google caractere par caractere : le 15/09/2026 pour les
   trois premiers, le 08/10/2026 pour celui d Elsa (apostrophes droites chez Celia et
   Elsa, apostrophe typographique chez Emmaneth : c est ce qu elles ont tape). */
var AVIS = [
  { prenom:"Elsa",            texte:"Super photographe ! Alexandre est très respectueux, il sait mettre à l'aise ! Les photos sont magnifiques. J'ai passé un super bon moment :) Je recommande fortement !", note:5, date:"2026-10-06", source:"google", ou:["accueil","formules"],
    en:"Great photographer! Alexandre is very respectful and knows how to put you at ease! The photos are gorgeous. I had a really good time :) I highly recommend him!" },
  { prenom:"Célia",           texte:"Une super expérience !!! Les photos sont supers belles et Alexandre a su me mettre à l'aise!!\nMerci encore", note:5, date:"2026-09-15", source:"google", ou:["accueil","formules"],
    en:"A great experience!!! The photos are really beautiful and Alexandre knew how to put me at ease!!\nThanks again" },
  { prenom:"Emmaneth (Anne)", texte:"Super shooting sur Paris avec Alexandre, on s’est promené au jardin du Luxembourg et on a fait plein de super photos. Merci beaucoup!!", note:5, date:"2026-08-27", source:"google", ou:["accueil"],
    en:"Great shoot in Paris with Alexandre, we walked around the Luxembourg Gardens and took lots of great photos. Thank you so much!!" },
  { prenom:"Diane",           texte:"Alexandre a fait un travail remarquable lors de notre mariage. Il a réussi à immortaliser le plus beau jour de notre vie avec une grande technique et est resté professionnel tout au long de la soirée.\nMerci encore !", note:5, date:"2026-07-17", source:"google", ou:["accueil","contact"],
    en:"Alexandre did a remarkable job at our wedding. He managed to capture the most beautiful day of our lives with great technique and stayed professional throughout the evening.\nThanks again!" }
];

/* La fiche Google (pour lire et verifier les avis) et le lien pour en deposer un.
   Les deux menent a la meme fiche. Meme lien que la signature mail. */
var GOOGLE_FICHE_URL = "https://g.page/r/CUqtmkfR_G4MEBM";
var GOOGLE_AVIS_URL  = "https://g.page/r/CUqtmkfR_G4MEBM/review";

/* Noms des univers (affichage) */
var UNIVERS = {
  portrait:  {fr:"Portrait",     en:"Portrait"},
  sport:     {fr:"Sport",        en:"Sport"},
  evenement: {fr:"Événementiel", en:"Events"}
};
