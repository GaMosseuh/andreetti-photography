function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

  const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5FAFB;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:#0F5A68;">ANDREETTI</span>
  </div>
  <div style="background:#ffffff;border:1px solid #C8E0E5;border-radius:14px;padding:28px 32px;box-shadow:0 12px 32px rgba(15,61,71,.08);">
    <h2 style="font-family:Georgia,serif;font-weight:400;font-size:20px;color:#111827;margin:0 0 20px;">📸 Nouveau message de contact</h2>
    <p style="font-size:14px;color:#374151;margin:0 0 12px;line-height:1.6;"><strong style="color:#0F5A68;">Nom :</strong> ${escapeHtml(nom)}</p>
    <p style="font-size:14px;color:#374151;margin:0 0 12px;line-height:1.6;"><strong style="color:#0F5A68;">Email :</strong> <a href="mailto:${escapeHtml(email)}" style="color:#1A7A8A;text-decoration:none;">${escapeHtml(email)}</a></p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;"><strong style="color:#0F5A68;">Type de prestation :</strong> ${escapeHtml(prestation)}</p>
    <p style="font-size:13px;color:#6B7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;"><strong>Message</strong></p>
    <div style="background:#F5FAFB;border-left:3px solid #1A7A8A;border-radius:4px;padding:14px 18px;">
      <p style="font-size:14px;color:#111827;margin:0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#6B7280;margin-top:20px;">Répondre sous 48h · andreetti.photography</p>
</div>`.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ANDREETTI Photography <onboarding@resend.dev>',
        to: ['contact.andreettiphotography@gmail.com'],
        reply_to: email,
        subject: `📸 Nouveau message via andreetti.photography — ${nom}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', res.status, errText);
      return { statusCode: 502, body: 'Email send failed' };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
