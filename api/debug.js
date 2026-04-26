// api/debug.js — temporary diagnostic endpoint
// Hit GET /api/debug to verify env vars and Supabase connectivity
// DELETE THIS FILE before going to production

export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://wijgarmlllvlqfzxgoee.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BmuItK5AvBrdqJM9NOTqGA_Zh84U75U'

export default async function handler(req) {
  const results = {}

  // 1. Check env vars
  results.GROQ_API_KEY_set = !!process.env.GROQ_API_KEY

  // 2. Test Supabase connectivity — try inserting a test search row
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/searches`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        from_code: 'XX',
        to_code:   'XX',
        verdict:   'debug-test',
      }),
    })
    results.supabase_insert_status = res.status
    results.supabase_insert_ok     = res.status === 201
    if (!res.ok) {
      results.supabase_insert_error = await res.text()
    }
  } catch (e) {
    results.supabase_insert_exception = e.message
  }

  // 3. Test Supabase read
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/searches?limit=3&order=created_at.desc`,
      {
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    results.supabase_read_status = res.status
    if (res.ok) {
      results.supabase_read_rows = await res.json()
    } else {
      results.supabase_read_error = await res.text()
    }
  } catch (e) {
    results.supabase_read_exception = e.message
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
