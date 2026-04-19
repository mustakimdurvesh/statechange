// api/check.js — Vercel Edge Function
// Layered policy chain (mirrors Apigee Edge architecture):
//   1. CORS preflight
//   2. Input validation  — allowlist of valid ISO codes only
//   3. Injection guard   — regex protection against prompt injection
//   4. Rate limiting     — Vercel KV (uncomment when KV addon added)
//   5. Groq / LLaMA call — structured JSON output, temp 0.2
//   6. Response validation — required fields check
//   7. Community injection — merge Supabase reports into response

export const config = { runtime: 'edge' }

// ── Allowlists ────────────────────────────────────────────────────
const VALID_PASSPORTS = new Set([
  'IN','PK','AE','GB','US','DE','AU','SG','JP','NG','BR','ZA'
])
const VALID_DESTINATIONS = new Set([
  'TH','PT','ID','MX','GE','TR','JP','AE','DE','US','MA','VN','KE','ES'
])

// ── Prompt injection guard (RegularExpressionProtection equivalent) ──
const INJECTION_PATTERNS = [
  /ignore\s+previous/i,
  /you\s+are\s+now/i,
  /disregard/i,
  /system\s*prompt/i,
  /jailbreak/i,
  /<\s*script/i,
  /\beval\b/i,
  /\\n\s*system:/i,
]

function isSafeInput(str) {
  return typeof str === 'string'
    && str.length <= 3
    && !INJECTION_PATTERNS.some(p => p.test(str))
}

// ── Shared CORS headers ───────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

// ── System prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a precise visa and border entry expert. Given two ISO country codes (passport country and destination), return a single JSON object with EXACTLY this shape — no markdown, no prose, no extra keys:

{
  "verdict":    "free" | "voa" | "visa" | "no",
  "vtype":      string,
  "duration":   string,
  "extend":     string,
  "cost":       string,
  "processing": string,
  "brief":      string,
  "gotchas": [
    { "t": "warn" | "danger" | "ok", "text": string }
  ],
  "community": []
}

Rules:
- verdict: "free"=visa-free, "voa"=visa on arrival, "visa"=must obtain in advance, "no"=entry not possible
- brief: 3-4 sentences, plain text, practical and specific to 2025 rules
- gotchas: 3-5 entries. "text" may contain <strong> tags for emphasis. Be specific — include amounts, days, penalties.
- community is always an empty array
- Return ONLY the JSON object. Nothing else.`

// ── Edge handler ──────────────────────────────────────────────────
export default async function handler(req) {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  // 2. Parse inputs
  const { searchParams } = new URL(req.url)
  const from = (searchParams.get('from') || '').toUpperCase().trim()
  const to   = (searchParams.get('to')   || '').toUpperCase().trim()

  // 3. Allowlist validation
  if (!VALID_PASSPORTS.has(from) || !VALID_DESTINATIONS.has(to)) {
    return json({ error: 'Invalid country codes.' }, 400)
  }

  // 4. Injection guard
  if (!isSafeInput(from) || !isSafeInput(to)) {
    return json({ error: 'Invalid input.' }, 400)
  }

  // 5. Rate limiting via Vercel KV
  // Uncomment after running: vercel env add KV_REST_API_URL, KV_REST_API_TOKEN
  //
  // import { kv } from '@vercel/kv'
  // const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  // const rlKey = `sc:rl:${ip}`
  // const count = await kv.incr(rlKey)
  // if (count === 1) await kv.expire(rlKey, 60)
  // if (count > 20) {
  //   return json({ error: 'Rate limit exceeded. Try again in a minute.' }, 429,
  //     { ...CORS, 'Retry-After': '60' })
  // }

  // 6. Groq call
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) {
    return json({ error: 'Service not configured.' }, 503)
  }

  let parsed
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          { role: 'user',   content: `Passport country: ${from}\nDestination country: ${to}` },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('[StateChange] Groq error:', groqRes.status, errText)
      throw new Error(`Groq ${groqRes.status}`)
    }

    const groqData = await groqRes.json()
    const raw = groqData.choices?.[0]?.message?.content ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)

  } catch (err) {
    console.error('[StateChange] LLM error:', err.message)
    return json({ error: 'Failed to fetch entry data. Please try again.' }, 502)
  }

  // 7. Validate response shape
  const REQUIRED = ['verdict', 'vtype', 'duration', 'extend', 'cost', 'processing', 'brief', 'gotchas']
  const VALID_VERDICTS = new Set(['free', 'voa', 'visa', 'no'])

  for (const field of REQUIRED) {
    if (!(field in parsed)) {
      console.error('[StateChange] Missing field:', field)
      return json({ error: 'Malformed response. Please try again.' }, 502)
    }
  }

  if (!VALID_VERDICTS.has(parsed.verdict)) {
    parsed.verdict = 'visa' // safe fallback
  }

  // 8. Inject community reports from Supabase
  // Uncomment after Phase 3 Supabase setup:
  //
  // import { createClient } from '@supabase/supabase-js'
  // const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  // const { data: reports } = await sb
  //   .from('community_reports')
  //   .select('passport, report_text, tags, created_at')
  //   .eq('from_code', from)
  //   .eq('to_code', to)
  //   .order('created_at', { ascending: false })
  //   .limit(10)
  //
  // parsed.community = (reports ?? []).map(r => ({
  //   passport: r.passport,
  //   date:     new Date(r.created_at).toLocaleString('en', { month: 'short', year: 'numeric' }),
  //   text:     r.report_text,
  //   tags:     r.tags ?? [],
  // }))

  parsed.community = parsed.community ?? []

  return json(parsed, 200)
}
