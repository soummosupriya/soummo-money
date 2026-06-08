// /api/read-prescription.js
// Vercel serverless function. Reads a prescription photo with OpenAI's vision model
// and returns the prescribed medicines as structured JSON.
//
// SETUP (one time):
//   1. Put this file at  /api/read-prescription.js  in your GitHub repo (same repo as index.html).
//   2. In Vercel > your project > Settings > Environment Variables, add:
//        OPENAI_API_KEY = sk-...   (your key from platform.openai.com)
//   3. Redeploy.
//
// The key lives ONLY here on the server -- it is never sent to the browser.

const MODEL = 'gpt-4o'; // vision OCR, inexpensive. For stronger reading you can try 'gpt-4.1'.

const PROMPT = `You are reading a doctor's prescription image. Extract EVERY prescribed medicine.
Return a JSON object shaped exactly like: {"medicines":[ ... ]}
where each item in the array has:
- "name": medicine name including strength if shown (e.g. "Napa 500mg").
- "times_per_day": integer doses per day. Read the notation:
    "1+0+1" = 2, "1+1+1" = 3, "0+0+1" = 1, "1+0+0" = 1;
    OD / once daily = 1, BD / twice = 2, TDS / TID / thrice = 3, QID = 4.
    Bengali digits like "1+0+1" written in Bangla count the same way.
- "days": integer number of days the course runs ("1 week" = 7, "10 days" = 10).
    If the duration is not written, use null.
Respond with ONLY the JSON object, no prose and no markdown fences.
If nothing is readable, return {"medicines":[]}.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  // Optional light guard: if ALLOWED_ORIGIN is set in Vercel env, only allow that origin.
  const allow = process.env.ALLOWED_ORIGIN;
  if (allow && req.headers.origin && req.headers.origin !== allow) {
    res.status(403).json({ error: 'Origin not allowed' }); return;
  }

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
      headers: {
        'Authorization': 'Bearer ' + key,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
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
    if (!apiRes.ok) {
      res.status(502).json({ error: (data && data.error && data.error.message) || 'OpenAI API error' });
      return;
    }

    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed = {};
    try { parsed = JSON.parse(text); }
    catch (e) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) {} }
    }

    let meds = Array.isArray(parsed) ? parsed : ((parsed && parsed.medicines) || []);
    if (!Array.isArray(meds)) meds = [];

    meds = meds
      .filter(x => x && x.name)
      .map(x => ({
        name: String(x.name).slice(0, 80),
        times_per_day: Math.max(1, Math.min(12, parseInt(x.times_per_day) || 1)),
        days: (x.days == null ? null : (Math.max(1, Math.min(90, parseInt(x.days) || 0)) || null))
      }));

    res.status(200).json({ medicines: meds });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
