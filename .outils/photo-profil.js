/* CHANGER MA PHOTO DE PROFIL — une seule commande
       node .outils/photo-profil.js "C:\chemin\vers\ma nouvelle photo.jpg"
   (La photo doit etre retouchee par Alexandre, verticale de preference.)

   Ce que fait la commande :
   1. elle range les photos actuelles dans .archives\AAAA-MM-JJ photo de profil\  (rien n est supprime) ;
   2. elle fabrique  images/profil.webp  : la grande photo de la page A propos ;
   3. elle fabrique  images/avatar.webp  : la petite photo ronde de la page Liens,
      recadree automatiquement autour du visage (300 x 300) ;
   4. elle dit ce qu il reste a regarder.

   La photo n est jamais etiree : elle est recadree, jamais deformee.
   Options, a ajouter a la fin de la commande si le recadrage automatique ne convient pas :
       --avatar=haut | centre | bas      ou placer le carre de la petite photo ronde
       --sans-avatar                     ne pas toucher a la photo de la page Liens

   OU MON VISAGE APPARAIT SUR LE SITE (releve du 8 octobre 2026) :
     - images/profil.webp   -> page A propos (grande photo en haut) ; aussi citee dans les
                               donnees pour Google de cette page ;
     - images/avatar.webp   -> page Liens (petite photo ronde en haut) ;
     - images/partage.webp  -> l image qui s affiche quand on partage le site : elle ne
                               montre PAS mon visage (trois photos du portfolio et le nom).
   L icone du site et l icone d ecran d accueil du telephone sont la lettre A : pas de visage. */
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const RACINE = path.join(__dirname, "..");

(async () => {
  const args = process.argv.slice(2);
  const source = args.find(a => !a.startsWith("--"));
  if (!source || !fs.existsSync(source)) { console.error("Donne le chemin de la nouvelle photo :\n  node .outils/photo-profil.js \"C:\\chemin\\vers\\la photo.jpg\""); process.exit(1); }
  const sansAvatar = args.includes("--sans-avatar");
  const placeAvatar = (args.find(a => a.startsWith("--avatar=")) || "").split("=")[1] || "auto";

  const jour = new Date().toISOString().slice(0, 10);
  const arch = path.join(RACINE, ".archives", jour + " photo de profil");
  fs.mkdirSync(arch, { recursive: true });
  for (const f of ["profil.webp", "avatar.webp"]) {
    if (f === "avatar.webp" && sansAvatar) continue;
    const actuel = path.join(RACINE, "images", f);
    if (fs.existsSync(actuel)) {
      let dest = path.join(arch, f), n = 1;
      while (fs.existsSync(dest)) dest = path.join(arch, f.replace(".webp", "-" + (++n) + ".webp"));
      fs.copyFileSync(actuel, dest);      // copie de l ancienne ; elle est ensuite remplacee, pas supprimee
    }
  }
  fs.writeFileSync(path.join(arch, "POURQUOI.txt"), "Anciennes photos de profil du site, remplacees le " + jour + " par : " + path.basename(source) + "\n", { flag: "a" });

  const meta = await sharp(source).rotate().metadata();
  const couche = meta.orientation >= 5;
  const L = couche ? meta.height : meta.width, H = couche ? meta.width : meta.height;
  /* la grande photo : 1200 px de large au plus, sans jamais agrandir */
  const p = await sharp(source).rotate().resize({ width: 1200, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(RACINE, "images", "profil.webp"));
  console.log("images/profil.webp : " + p.width + " x " + p.height + " px, " + Math.round(p.size / 1024) + " Ko");
  if (!sansAvatar) {
    const position = placeAvatar === "haut" ? "top" : placeAvatar === "bas" ? "bottom" : placeAvatar === "centre" ? "centre" : sharp.strategy.attention;
    const a = await sharp(source).rotate().resize({ width: 300, height: 300, fit: "cover", position }).webp({ quality: 84 }).toFile(path.join(RACINE, "images", "avatar.webp"));
    console.log("images/avatar.webp : " + a.width + " x " + a.height + " px, " + Math.round(a.size / 1024) + " Ko (recadrage : " + placeAvatar + ")");
  }
  /* la page A propos annonce les dimensions de la photo : on les met a jour */
  const ap = path.join(RACINE, "apropos.html");
  let h = fs.readFileSync(ap, "utf8");
  const h2 = h.replace(/(<img src="\/images\/profil\.webp"[^>]*?) width="\d+" height="\d+"/, "$1 width=\"" + p.width + "\" height=\"" + p.height + "\"");
  if (h2 !== h) fs.writeFileSync(ap, h2);
  console.log("\nPhoto d origine : " + L + " x " + H + " px" + (L > H ? "  (ATTENTION : photo horizontale ; la page A propos l affiche dans un cadre vertical, donc recadree sur les cotes)" : ""));
  console.log("Anciennes photos rangees dans : .archives\\" + jour + " photo de profil\\");
  console.log("A faire : ouvrir /apropos et /links en local pour verifier le cadrage, puis mettre en ligne.");
})().catch(e => { console.error("ECHEC : " + e.message); process.exit(1); });
