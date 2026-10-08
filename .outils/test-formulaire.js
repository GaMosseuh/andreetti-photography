/* TEST DE LA FONCTION D ENVOI DU FORMULAIRE (sans rien envoyer pour de vrai)
       node .outils/test-formulaire.js
   On remplace le service d envoi par un faux, et on verifie les trois cas :
   1. sans les nouveaux reglages : le mail part par l ancien chemin (comme aujourd hui) ;
   2. avec les nouveaux reglages : il part de l adresse pro vers l adresse pro ;
   3. nouveaux reglages refuses par Resend : le message repart par l ancien chemin (rien de perdu). */
const path = require("path");
const fichier = path.join(__dirname, "..", "netlify", "functions", "notify-contact.js");
const resultats = [];
const verifier = (nom, ok, detail) => resultats.push({ nom, ok: !!ok, detail: detail || "" });

async function jouer(env, reponses) {
  delete require.cache[require.resolve(fichier)];
  for (const k of ["CONTACT_FROM", "CONTACT_TO"]) delete process.env[k];
  Object.assign(process.env, { RESEND_API_KEY: "cle-de-test" }, env);
  const envois = [];
  global.fetch = async (url, opts) => {
    const corps = JSON.parse(opts.body); envois.push(corps);
    const r = reponses[envois.length - 1] || { ok: true };
    return { ok: r.ok, status: r.ok ? 200 : 403, text: async () => "refus simule" };
  };
  const { handler } = require(fichier);
  const silence = console.error; console.error = () => {};
  const rep = await handler({ httpMethod: "POST", body: JSON.stringify({ payload: { data: { nom: "Camille Test", email: "camille@exemple.fr", prestation: "Portrait étudiant (40 €)", message: "Bonjour,\n<b>test</b>" } } }) });
  console.error = silence;
  return { rep, envois };
}

(async () => {
  let r = await jouer({}, [{ ok: true }]);
  verifier("Sans nouveaux réglages : un seul envoi, par l'ancien chemin", r.rep.statusCode === 200 && r.envois.length === 1 && /onboarding@resend\.dev/.test(r.envois[0].from) && r.envois[0].to[0] === "contact.andreettiphotography@gmail.com",
    "de " + r.envois[0].from + " vers " + r.envois[0].to[0]);
  verifier("La réponse au mail part vers le client", r.envois[0].reply_to === "camille@exemple.fr", "répondre à : " + r.envois[0].reply_to);
  verifier("Le message ne peut pas injecter de code dans le mail", r.envois[0].html.includes("&lt;b&gt;test&lt;/b&gt;") && !r.envois[0].html.includes("<b>test</b>"), "");
  verifier("La formule choisie figure dans le mail et dans le brouillon", r.envois[0].html.includes("Portrait étudiant (40 €)") && r.envois[0].html.includes("formule portrait étudiant"), "");

  r = await jouer({ CONTACT_FROM: "ANDREETTI Photography <site@andreettiphoto.fr>", CONTACT_TO: "contact@andreettiphoto.fr" }, [{ ok: true }]);
  verifier("Avec les nouveaux réglages : un seul envoi, vers l'adresse pro", r.rep.statusCode === 200 && r.envois.length === 1 && r.envois[0].to[0] === "contact@andreettiphoto.fr" && /site@andreettiphoto\.fr/.test(r.envois[0].from),
    "de " + r.envois[0].from + " vers " + r.envois[0].to[0]);

  r = await jouer({ CONTACT_FROM: "ANDREETTI Photography <site@andreettiphoto.fr>", CONTACT_TO: "contact@andreettiphoto.fr" }, [{ ok: false }, { ok: true }]);
  verifier("Nouveaux réglages refusés : le message repart par l'ancien chemin", r.rep.statusCode === 200 && r.envois.length === 2 && r.envois[1].to[0] === "contact.andreettiphotography@gmail.com",
    r.envois.length + " envois ; le second vers " + (r.envois[1] ? r.envois[1].to[0] : "?"));

  r = await jouer({}, [{ ok: false }]);
  verifier("Si tout échoue, la fonction le signale (le site affiche alors l'erreur)", r.rep.statusCode === 502, "code " + r.rep.statusCode);

  const ko = resultats.filter(x => !x.ok);
  resultats.forEach(x => console.log((x.ok ? "  ok     " : "  ECHEC  ") + x.nom + (x.detail ? "  [" + x.detail + "]" : "")));
  console.log("\n" + (resultats.length - ko.length) + " verifications reussies sur " + resultats.length + (ko.length ? "  —  " + ko.length + " ECHEC(S)" : "  —  tout est bon"));
  process.exit(ko.length ? 1 : 0);
})();
