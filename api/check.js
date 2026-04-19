// api/check.js — Vercel Edge Function
// Policy chain (Apigee Edge pattern applied to serverless):
//   1. CORS preflight
//   2. Input validation      — allowlist, no unknown codes reach the LLM
//   3. Injection guard       — regex equiv. of RegularExpressionProtection
//   4. Rate limiting         — Vercel KV (uncomment when KV addon active)
//   5. Groq / LLaMA call     — JSON mode, temp 0.2, structured output
//   6. Response validation   — required fields check before returning
//   7. Community injection   — merge live Supabase reports into response
//   8. Search logging        — fire-and-forget analytics insert

export const config = { runtime: 'edge' }

// ── Allowlists ────────────────────────────────────────────────────
const VALID_PASSPORTS = new Set([
  'IN','PK','AE','GB','US','DE','AU','SG','JP','NG','BR','ZA'
])
const VALID_DESTINATIONS = new Set([
  'TH','PT','ID','MX','GE','TR','JP','AE','DE','US','MA','VN','KE','ES'
])

// ── Prompt injection guard ────────────────────────────────────────
const INJECTION_PATTERNS = [
  /ignore\s+previous/i, /you\s+are\s+now/i, /disregard/i,
  /system\s*prompt/i,   /jailbreak/i,        /<\s*script/i,
  /\beval\b/i,          /\\n\s*system:/i,
]
function isSafeInput(str) {
  return typeof str === 'string'
    && str.length <= 3
    && !INJECTION_PATTERNS.some(p => p.test(str))
}

// ── CORS ──────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extra },
  })
}

// ── System prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a precise visa and border entry expert. Given two ISO country codes, return a single JSON object — no markdown, no prose, no extra keys:

{
  "verdict":    "free" | "voa" | "visa" | "no",
  "vtype":      string,
  "duration":   string,
  "extend":     string,
  "cost":       string,
  "processing": string,
  "brief":      string,
  "gotchas": [{ "t": "warn"|"danger"|"ok", "text": string }],
  "community":  []
}

Rules:
- verdict: "free"=visa-free, "voa"=visa on arrival, "visa"=must obtain in advance, "no"=entry not possible
- brief: 3-4 sentences, plain text, accurate to 2025 rules, no hedging
- gotchas: 3-5 entries, "text" may use <strong> tags. Include specific amounts, durations, and consequences.
- community is always []
- Return ONLY the JSON object.`

// ── Supabase REST helper (edge-compatible, no Node APIs) ──────────
function sbHeaders(serviceKey) {
  return {
    'apikey':        serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
  }
}

async function fetchCommunityReports(supabaseUrl, serviceKey, from, to) {
  try {
    const url = `${supabaseUrl}/rest/v1/community_reports`
      + `?from_code=eq.${from}&to_code=eq.${to}&flagged=eq.false`
      + `&order=created_at.desc&limit=15`
      + `&select=passport,report_text,tags,created_at`

    const res = await fetch(url, { headers: { ...sbHeaders(serviceKey), 'Prefer': 'return=representation' } })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function logSearch(supabaseUrl, serviceKey, from, to, verdict) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/searches`, {
      method: 'POST',
      headers: sbHeaders(serviceKey),
      body: JSON.stringify({ from_code: from, to_code: to, verdict }),
    })
  } catch {
    // fire-and-forget — never block the response
  }
}

// ── Edge handler ──────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  // 2. Parse + validate
  const { searchParams } = new URL(req.url)
  const from = (searchParams.get('from') || '').toUpperCase().trim()
  const to   = (searchParams.get('to')   || '').toUpperCase().trim()

  if (!VALID_PASSPORTS.has(from) || !VALID_DESTINATIONS.has(to)) {
    return json({ error: 'Invalid country codes.' }, 400)
  }
  if (!isSafeInput(from) || !isSafeInput(to)) {
    return json({ error: 'Invalid input.' }, 400)
  }

  // 4. Rate limiting (uncomment after adding Vercel KV)
  // import { kv } from '@vercel/kv'
  // const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  // const count = await kv.incr(`sc:rl:${ip}`)
  // if (count === 1) await kv.expire(`sc:rl:${ip}`, 60)
  // if (count > 20) return json({ error: 'Rate limit exceeded.' }, 429, { 'Retry-After': '60' })

  const GROQ_API_KEY   = process.env.GROQ_API_KEY
  const SUPABASE_URL   = process.env.SUPABASE_URL
  const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY  // service key — server only, never VITE_

  if (!GROQ_API_KEY) return json({ error: 'Service not configured.' }, 503)

  // 5. LLM call + 7. Community fetch — run in parallel
  const [groqRes, communityRaw] = await Promise.all([
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: `Passport: ${from}\nDestination: ${to}` },
        ],
      }),
    }),
    (SUPABASE_URL && SUPABASE_KEY)
      ? fetchCommunityReports(SUPABASE_URL, SUPABASE_KEY, from, to)
      : Promise.resolve([]),
  ])

  // 6. Parse + validate LLM response
  let parsed
  try {
    if (!groqRes.ok) throw new Error(`Groq ${groqRes.status}`)
    const groqData = await groqRes.json()
    const raw      = groqData.choices?.[0]?.message?.content ?? ''
    parsed         = JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch (err) {
    console.error('[StateChange] LLM error:', err.message)
    return json({ error: 'Failed to fetch entry data. Please try again.' }, 502)
  }

  const REQUIRED = ['verdict','vtype','duration','extend','cost','processing','brief','gotchas']
  for (const f of REQUIRED) {
    if (!(f in parsed)) return json({ error: 'Malformed response. Please try again.' }, 502)
  }
  if (!['free','voa','visa','no'].includes(parsed.verdict)) parsed.verdict = 'visa'

  // 7. Inject community reports
  parsed.community = communityRaw.map(r => ({
    passport: r.passport,
    date:     new Date(r.created_at).toLocaleString('en', { month: 'short', year: 'numeric' }),
    text:     r.report_text,
    tags:     r.tags ?? [],
  }))

  // 8. Log search (fire-and-forget — does not block response)
  if (SUPABASE_URL && SUPABASE_KEY) {
    logSearch(SUPABASE_URL, SUPABASE_KEY, from, to, parsed.verdict)
  }

  return json(parsed)
}
