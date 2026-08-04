/* DONNÉES PHOTOS — partagé (accueil + portfolio)
   Généré depuis l'ancien index.html monopage (refonte multi-pages du 15/07/2026). */
"use strict";

/* ---------- DONNÉES PORTFOLIO (les vrais fichiers se déposent dans images/portfolio/) ---------- */
/* Ordre équilibré et valorisant : alternance portrait / sport / événementiel,
   belles photos en tête. Les 3 photos de tir à l'arc (sport-06/07/08) sont
   réparties dans la catégorie Sport comme les autres. La carte "Tir à l'arc"
   de l'accueil ouvre simplement la galerie Sport. */
var PHOTOS = [
  {cat:'portrait', file:'portrait-01.jpg', h:360},
  {cat:'evenement',file:'event-10.jpg', alt:"Scène de théâtre grec — spectacle Hippolyte et Antiope, église de Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'sport',    file:'sport-01.jpg',    h:220},
  {cat:'portrait', file:'portrait-02.jpg', h:300},
  {cat:'evenement',file:'event-01.jpg',    h:240},
  {cat:'sport',    file:'sport-06.jpg', alt:"Tir à l'arc en extérieur dans l'Yonne — photographe sport",    h:380},
  {cat:'evenement',file:'event-06.jpg', alt:"Reportage du spectacle Hippolyte et Antiope — théâtre à l'église de Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'portrait', file:'portrait-03.jpg', h:420},
  {cat:'evenement',file:'event-02.jpg',    h:200},
  {cat:'sport',    file:'sport-02.jpg',    h:300},
  {cat:'portrait', file:'portrait-04.jpg', h:240},
  {cat:'evenement',file:'event-07.jpg', alt:"Comédiennes en costume — spectacle Hippolyte et Antiope, église de Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'sport',    file:'sport-07.jpg', alt:"Tir à l'arc en pleine forêt, Yonne — photographe sport",    h:340},
  {cat:'evenement',file:'event-03.jpg',    h:340},
  {cat:'portrait', file:'portrait-05.jpg', h:300},
  {cat:'sport',    file:'sport-03.jpg',    h:260},
  {cat:'evenement',file:'event-08.jpg', alt:"Comédienne en costume, lumière de scène — théâtre à Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'portrait', file:'portrait-06.jpg', h:260},
  {cat:'evenement',file:'event-04.jpg',    h:280},
  {cat:'evenement',file:'event-09.jpg', alt:"Musiciens accompagnant le spectacle — église de Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'sport',    file:'sport-08.jpg', alt:"Séance de tir à l'arc au petit matin dans l'Yonne",    h:400},
  {cat:'portrait', file:'portrait-07.jpg', h:220},
  {cat:'evenement',file:'event-11.jpg', alt:"Comédiennes devant les vitraux — théâtre à l'église de Ouanne (Yonne)", nowmark:true, h:400},
  {cat:'sport',    file:'sport-04.jpg',    h:200},
  {cat:'evenement',file:'event-05.jpg',    h:240},
  {cat:'portrait', file:'portrait-08.jpg', h:320},
  {cat:'sport',    file:'sport-05.jpg',    h:360}
];
var CAR = [
  {cat:'portrait', file:'portrait-01.jpg', cap:'Portrait'},
  {cat:'sport',    file:'sport-02.jpg',    cap:'Sport'},
  {cat:'evenement',file:'event-01.jpg',    cap:'Événementiel'},
  {cat:'portrait', file:'portrait-03.jpg', cap:'Portrait'},
  {cat:'sport',    file:'sport-05.jpg',    cap:'Sport'},
  {cat:'evenement',file:'event-10.jpg',    cap:'Événementiel'}
];
var PH_CLASS = {portrait:'ph-portrait', sport:'ph-sport', evenement:'ph-event'};
var CAT_LABEL = {portrait:'Portrait', sport:'Sport', evenement:'Événementiel'};
/* Texte alternatif des photos (lu par les lecteurs d'écran et par Google Images).
   Séparé de CAT_LABEL : « Photographie Événementiel » était incorrect. */
var CAT_ALT = {
  portrait:  "Photographe portrait à Dijon et dans l'Yonne — Alexandre Andreetti",
  sport:     "Photographe de sport à Dijon et dans l'Yonne — Alexandre Andreetti",
  evenement: "Photographe événementiel à Dijon et dans l'Yonne — Alexandre Andreetti"
};
