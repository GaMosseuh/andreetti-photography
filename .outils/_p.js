const fs=require("fs");let s=fs.readFileSync("assets/rendu.js","utf8");
const a="function galerie(liste){ return liste.map(tuile).join(''); }";
if(s.split(a).length!==2){console.error("ancre");process.exit(1);}
s=s.replace(a,a+"\n/* toutes les photos, dans l ordre de data.js */\nfunction toutesLesPhotos(){ var out = []; if(typeof PHOTOS !== 'undefined') PHOTOS.forEach(function(p){ var x = photo(p.id); if(x) out.push(x); }); return out; }\nfunction galerieToutes(){ return galerie(toutesLesPhotos()); }");
s=s.replace("image: image, tuile: tuile, galerie: galerie,","image: image, tuile: tuile, galerie: galerie, galerieToutes: galerieToutes, toutesLesPhotos: toutesLesPhotos,");
fs.writeFileSync("assets/rendu.js",s);console.log("ok");
