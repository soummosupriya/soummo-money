// /api/read-bill.js
// Vercel serverless function. Reads a bill / invoice photo with OpenAI's vision model
// and returns the bill's name, amount, and due day so the Add-bill form can be prefilled.
// Uses the same OPENAI_API_KEY env var as read-prescription.js. No extra setup beyond
// putting this file at /api/read-bill.js and redeploying.

const MODEL = 'gpt-4o';

const PROMPT = `You are reading a utility bill, invoice, or shop receipt image.
Return a JSON object shaped exactly like: {"bill":{"name":"...","amount":0,"due_day":null}}
- "name": the biller or bill type, short (e.g. "DESCO Electricity", "Internet - Link3", "Gas Bill"). If a shop receipt, use the shop name.
- "amount": the TOTAL amount payable, as a plain number — no currency symbol, no commas, no spaces. Use the grand total / amount due, not a line item.
- "due_day": the day-of-month the payment is due, as an integer 1-31. If no due date is shown, use null.
Respond with ONLY the JSON object, no prose and no markdown fences.
If you cannot read it, return {"bill":{}}.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const allow = process.env.ALLOWED_ORIGIN;
  if (allow && req.headers.origin && req.headers.origin !== allow) { res.status(403).json({ error: 'Origin not allowed' }); return; }
  const key = process.env.OPENAI_API_KEY;
  if (!key) { res.status(500).json({ error: 'OPENAI_API_KEY is not set in Vercel env vars' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const image = body && body.image;
    const media_type = (body && body.media_type) || 'image/jpeg';
    if (!image) { res.status(400).json({ error: 'No image provided' }); return; }

    const dataUrl = 'data:' + media_type + ';base64,' + image;
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }]
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) { res.status(502).json({ error: (data && data.error && data.error.message) || 'OpenAI API error' }); return; }

    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed = {};
    try { parsed = JSON.parse(text); }
    catch (e) { const m = text.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) {} } }

    const b = (parsed && parsed.bill) || {};
    const out = {
      name: b.name ? String(b.name).slice(0, 60) : '',
      amount: (b.amount == null || isNaN(parseFloat(b.amount))) ? null : Math.round(parseFloat(b.amount)),
      due_day: (b.due_day == null) ? null : (Math.max(1, Math.min(31, parseInt(b.due_day) || 0)) || null)
    };
    res.status(200).json({ bill: out });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
