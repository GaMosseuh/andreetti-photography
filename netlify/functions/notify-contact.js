/* ENVOI DU FORMULAIRE DE CONTACT
   Netlify recoit le formulaire, puis appelle cette fonction, qui envoie le mail a Alexandre
   par le service Resend.

   ══ D OU PART LE MAIL, ET OU IL ARRIVE ══
   Deux reglages, qui se changent dans Netlify SANS toucher a ce fichier
   (Netlify > Site configuration > Environment variables) :

     CONTACT_FROM   l expediteur    ex. : ANDREETTI Photography <site@andreettiphoto.fr>
     CONTACT_TO     le destinataire ex. : contact@andreettiphoto.fr

   Tant que ces deux reglages n existent pas, rien ne change : le mail part de
   onboarding@resend.dev et arrive sur contact.andreettiphotography@gmail.com, comme avant.

   ⚠️ NE PAS CREER CES REGLAGES AVANT que le domaine andreettiphoto.fr soit « Verified »
   dans Resend (voir le pas-a-pas : Site web\2026-10-08 FORMULAIRE - envoi direct sur
   l adresse pro (pas a pas).pdf). Avec un domaine non verifie, Resend refuse d envoyer
   ailleurs que vers l adresse du titulaire du compte.

   FILET DE SECURITE : si l envoi avec les nouveaux reglages est refuse, la fonction
   renvoie aussitot le message par l ancien chemin. Aucune demande ne peut etre perdue. */

const ANCIEN_FROM = 'ANDREETTI Photography <onboarding@resend.dev>';
const ANCIEN_TO = 'contact.andreettiphotography@gmail.com';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function envoyer(from, to, replyTo, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, status: res.status, detail };
  }
  return { ok: true };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const payload = body.payload || body;
  const data = payload.data || {};
  const nom = data.nom || 'Non renseigné';
  const email = data.email || 'Non renseigné';
  const prestation = data.prestation || 'Non renseigné';
  const message = data.message || '';

  // Prenom = premier mot du nom (pour personnaliser le brouillon)
  const prenom = String(nom).trim().split(/\s+/)[0] || '';

  // Intro du brouillon selon la prestation choisie.
  // Depuis la v2.0 la liste propose aussi les formules ("Portrait étudiant (40 €)", etc.).
  let intro = "J'ai bien noté votre demande.";
  if (/^Portrait/i.test(prestation)) {
    intro = /\(\d+\s*€\)/.test(prestation)
      ? `J'ai bien noté votre envie d'une séance, formule ${prestation.replace(/\s*\(.*$/, '').toLowerCase()}.`
      : "J'ai bien noté votre envie d'une séance portrait.";
  } else if (/^Sport/i.test(prestation)) {
    intro = "J'ai bien noté votre demande pour une couverture sport.";
  } else if (/^[ÉE]v[ée]nementiel/i.test(prestation)) {
    intro = "J'ai bien noté votre projet d'événement à photographier.";
  }

  // Brouillon de reponse pret a copier
  const brouillon =
`Bonjour ${prenom},

Merci beaucoup pour votre message, ça me fait plaisir ! ${intro}

Pour vous préparer une proposition adaptée, il me manque juste quelques précisions :
- la date ou la période que vous envisagez ;
- le lieu approximatif ;
- et si vous avez des envies particulières (ambiance, tenues, personnes présentes...).

Je reviens vers vous très vite.

À très bientôt,
Alexandre ANDREETTI
ANDREETTI Photography`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5FAFB;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:#0F5A68;">ANDREETTI</span>
  </div>
  <div style="background:#ffffff;border:1px solid #C8E0E5;border-radius:14px;padding:28px 32px;">
    <h2 style="font-family:Georgia,serif;font-weight:400;font-size:20px;color:#111827;margin:0 0 20px;">Nouveau message depuis le site</h2>
    <p style="font-size:14px;color:#374151;margin:0 0 12px;line-height:1.6;"><strong style="color:#0F5A68;">Nom :</strong> ${escapeHtml(nom)}</p>
    <p style="font-size:14px;color:#374151;margin:0 0 12px;line-height:1.6;"><strong style="color:#0F5A68;">Mail :</strong> <a href="mailto:${escapeHtml(email)}" style="color:#1A7A8A;text-decoration:none;">${escapeHtml(email)}</a></p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;"><strong style="color:#0F5A68;">Ce qui l'intéresse :</strong> ${escapeHtml(prestation)}</p>
    <p style="font-size:13px;color:#6B7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;"><strong>Message</strong></p>
    <div style="background:#F5FAFB;border-left:3px solid #1A7A8A;border-radius:4px;padding:14px 18px;">
      <p style="font-size:14px;color:#111827;margin:0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
    </div>
  </div>

  <div style="background:#ffffff;border:1px dashed #1A7A8A;border-radius:14px;padding:22px 26px;margin-top:18px;">
    <p style="font-size:13px;color:#0F5A68;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em;"><strong>Brouillon de réponse (à copier-coller et ajuster)</strong></p>
    <p style="font-size:14px;color:#111827;margin:0;white-space:pre-wrap;line-height:1.65;font-family:Arial,sans-serif;">${escapeHtml(brouillon)}</p>
  </div>

  <p style="text-align:center;font-size:11px;color:#6B7280;margin-top:20px;">Réponds directement à ce mail (la réponse part vers le client) ou copie le brouillon ci-dessus · andreettiphoto.fr</p>
</div>`.trim();

  const subject = `Nouveau message via andreettiphoto.fr · ${nom}`;
  const from = process.env.CONTACT_FROM || ANCIEN_FROM;
  const to = process.env.CONTACT_TO || ANCIEN_TO;

  try {
    let r = await envoyer(from, to, email, subject, html);
    if (!r.ok && (from !== ANCIEN_FROM || to !== ANCIEN_TO)) {
      // les nouveaux reglages sont refuses (domaine pas encore verifie, faute de frappe...) :
      // on repasse par l ancien chemin pour ne perdre aucune demande.
      console.error('Envoi refuse avec les nouveaux reglages, repli sur l ancien chemin :', r.status, r.detail);
      r = await envoyer(ANCIEN_FROM, ANCIEN_TO, email, subject + ' (repli)', html);
    }
    if (!r.ok) {
      console.error('Resend error:', r.status, r.detail);
      return { statusCode: 502, body: 'Email send failed' };
    }
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
