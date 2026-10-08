const fs = require("fs"); const p = "assets/data.js"; let s = fs.readFileSync(p, "utf8");
const R = [
 ['fr:"Spectatrices pendant le spectacle « Hippolyte et Antiope », église de Ouanne (Yonne)", en:"Audience members during the show “Hippolyte et Antiope”, Ouanne church (Yonne)"', 'fr:"Pendant le spectacle « Hippolyte et Antiope », église de Ouanne (Yonne)", en:"During the show “Hippolyte et Antiope”, Ouanne church (Yonne)"'],
 ['deux joueurs au bord du terrain", en:"CL Marsannay handball match, Marsannay-la-Côte: two players at the edge of the court"', 'deux joueurs pendant le match", en:"CL Marsannay handball match, Marsannay-la-Côte: two players during the match"'],
 ['les deux équipes en fin de match", en:"CL Marsannay handball match, Marsannay-la-Côte: both teams at the end of the match"', 'les deux équipes réunies", en:"CL Marsannay handball match, Marsannay-la-Côte: both teams together"'],
 ['fr:"Match de football : les joueurs avant une remise en jeu", en:"Football match: players before a restart"', 'fr:"Match de football : des joueurs sur le terrain", en:"Football match: players on the pitch"'],
 ['fr:"Portrait d\'une randonneuse en pleine nature", en:"Portrait of a hiker out in nature"', 'fr:"Portrait d\'une femme marchant en pleine nature", en:"Portrait of a woman walking out in nature"'],
 ['fr:"Portrait dans la fumée, lumières de fête", en:"Portrait in the smoke, party lights"', 'fr:"Portrait dans la fumée, sous une guirlande de lumières", en:"Portrait in the smoke, under a string of lights"']
];
for (const [a, b] of R) { if (s.split(a).length !== 2) { console.error("introuvable : " + a.slice(0, 50)); process.exit(1); } s = s.replace(a, b); }
fs.writeFileSync(p, s); console.log(R.length + " descriptions corrigees");
