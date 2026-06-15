// /api/coach.js
// Vercel serverless function. Takes a summary of the household's spending + savings goal
// and asks OpenAI for specific, practical money-saving tips. Returns structured JSON the
// app renders. Uses the same OPENAI_API_KEY env var as read-bill.js / read-prescription.js.
// Setup: put this file at /api/coach.js in the repo and redeploy. No other changes needed.

const MODEL = 'gpt-4o';

function buildPrompt(d) {
  const cats = Array.isArray(d.by_category)
    ? d.by_category.map(c => '- ' + c.category + ': ' + c.amount).join('\n')
    : '(none)';
  return [
    'You are a sharp, practical personal-finance coach for a single-income household in Bangladesh (currency BDT, written as Taka).',
    'The user wants concrete, doable ways to spend less and save more. Be specific to THEIR numbers below.',
    'Avoid generic advice ("make a budget", "track spending") — they already track everything in this app.',
    'No investment, stock, or product recommendations. Focus only on cutting/optimising their own spending and habits.',
    'Amounts are monthly unless noted. One cycle = one salary month.',
    '',
    'THEIR NUMBERS (BDT):',
    'Monthly salary: ' + d.salary,
    'Savings goal this cycle: ' + d.savings_goal,
    'Spend cap to hit goal (salary - goal): ' + d.spend_cap,
    'Already spent this cycle (bills + partner + daily): ' + d.spent_so_far,
    'Fixed bills still to pay this cycle: ' + d.bills_remaining,
    'Days left until next salary: ' + d.days_left,
    'Safe daily-extras budget the app computed: ' + d.safe_daily + ' per day',
    'Projected savings at current pace: ' + d.projected_savings,
    '',
    'SPENDING BY CATEGORY (last 30 days):',
    cats,
    '',
    'Return ONLY a JSON object shaped exactly like:',
    '{"summary":"one or two sentences on whether they are on track and the single most important thing","one_big_move":"the highest-impact change, concrete with a Taka figure","tips":[{"title":"short imperative","detail":"one or two sentences, specific to their categories and numbers, ideally with a Taka figure"}]}',
    'Give 4 to 6 tips, ordered by how much money they save. Reference their actual biggest categories by name.',
    'Keep every string plain text, no markdown. Respond with ONLY the JSON object, no prose, no code fences.'
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const allow = process.env.ALLOWED_ORIGIN;
  if (allow && req.headers.origin && req.headers.origin !== allow) { res.status(403).json({ error: 'Origin not allowed' }); return; }
  const key = process.env.OPENAI_API_KEY;
  if (!key) { res.status(500).json({ error: 'OPENAI_API_KEY is not set in Vercel env vars' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    body = body || {};

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildPrompt(body) }]
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) { res.status(502).json({ error: (data && data.error && data.error.message) || 'OpenAI API error' }); return; }

    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed = {};
    try { parsed = JSON.parse(text); }
    catch (e) { const m = text.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) {} } }

    const out = {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      one_big_move: typeof parsed.one_big_move === 'string' ? parsed.one_big_move : '',
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 6).map(t => ({
        title: (t && typeof t.title === 'string') ? t.title : '',
        detail: (t && typeof t.detail === 'string') ? t.detail : ''
      })) : []
    };
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: 'coach failed: ' + (e && e.message ? e.message : String(e)) });
  }
}
