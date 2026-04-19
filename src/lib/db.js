// Phase 1: local data store.
// Phase 2: this is replaced by the Vercel Edge Function response.
// Shape must stay identical — edge fn returns the same schema.

export const DB = {
  'IN-TH': {
    verdict: 'voa',
    vtype: 'Visa on arrival',
    duration: '30 days',
    extend: 'Yes, once (30 days)',
    cost: '~2,000 THB (~$55)',
    processing: 'On arrival, 15–30 min',
    brief: 'Indian passport holders get visa on arrival at major Thai airports including Suvarnabhumi and Phuket. The VOA queue can be 30–60 min during peak hours — the e-Visa ($35, approved in ~3 days) skips the queue entirely. Thai authorities occasionally verify accommodation bookings. The 30-day limit resets only after a proper border run — land border runs now give only 15 days on VOA.',
    gotchas: [
      { t: 'warn',   text: '<strong>Proof of onward travel required</strong> — airlines may deny boarding without it. Book a refundable ticket if unsure.' },
      { t: 'warn',   text: '<strong>Funds check:</strong> Expect to show 10,000 THB (~$280) per person in cash or card.' },
      { t: 'danger', text: '<strong>Overstay penalty:</strong> 500 THB/day fine + possible blacklist. Thai immigration takes this seriously.' },
      { t: 'ok',     text: '<strong>e-Visa available</strong> ($35, ~3 days approval) — skip the VOA queue entirely.' },
    ],
    community: [
      { passport: 'IN', date: 'Jan 2025', text: 'Smooth at BKK, 25 mins. Asked for hotel booking and return ticket. No funds check this time.', tags: ['BKK', 'smooth'] },
      { passport: 'IN', date: 'Dec 2024', text: 'Phuket during Christmas — VOA queue was 80+ mins. Getting e-Visa next time.', tags: ['HKT', 'long queue', 'holiday'] },
    ],
  },

  'IN-PT': {
    verdict: 'visa',
    vtype: 'Schengen visa required',
    duration: 'Up to 90 days / 180-day period',
    extend: 'No (must leave Schengen)',
    cost: '€80 visa fee',
    processing: '15–45 working days at VFS',
    brief: 'Portugal requires a Schengen C visa for Indian nationals. The D7 Passive Income Visa is a popular nomad alternative requiring €760/month in provable income. VFS Global handles appointments in India — slots often book weeks in advance. Portugal is one of the more nomad-friendly Schengen destinations with strong co-working infrastructure in Lisbon and Porto.',
    gotchas: [
      { t: 'danger', text: '<strong>Apply 3–6 months early.</strong> VFS Global slots in India are extremely scarce — especially Mumbai and Delhi.' },
      { t: 'warn',   text: '<strong>Travel insurance mandatory:</strong> Min €30,000 coverage for the entire Schengen stay.' },
      { t: 'warn',   text: '<strong>Proof of accommodation for every night</strong> — hotel bookings or a formal host invitation letter.' },
      { t: 'danger', text: '<strong>90/180 rule is Schengen-wide</strong> — days spent in France, Germany, or any Schengen country all count.' },
    ],
    community: [
      { passport: 'IN', date: 'Mar 2025', text: 'Appointment 6 weeks after applying on VFS. Visa arrived in 12 working days. Interview was very brief.', tags: ['Mumbai VFS', 'approved', '12 days'] },
      { passport: 'IN', date: 'Nov 2024', text: 'Rejected first time — insufficient bank statement. Reapplied with 6 months of history above €5k. Approved.', tags: ['rejected', 'reapply', 'bank statement'] },
    ],
  },

  'IN-GE': {
    verdict: 'free',
    vtype: 'Visa-free entry',
    duration: '365 days per year',
    extend: 'Leave and re-enter (resets)',
    cost: 'Free',
    processing: 'On arrival',
    brief: 'Georgia is the best visa-free destination for Indian passport holders — a full year with no requirements beyond a valid passport. Tbilisi has become a major digital nomad hub with affordable living from $600/month, fast internet, and a lively expat community. The Kazbegi mountains and Black Sea coast are within 3 hours. Re-entry resets the 365-day counter.',
    gotchas: [
      { t: 'ok',   text: '<strong>365 days visa-free</strong> — the single best deal available to Indian passport holders worldwide.' },
      { t: 'warn', text: '<strong>Not a Schengen replacement:</strong> Georgia days do not count toward the 90/180 Schengen rule. Use it as a base.' },
      { t: 'ok',   text: '<strong>Remote work friendly:</strong> No restrictions on working remotely. Tbilisi co-working scene is thriving.' },
      { t: 'warn', text: '<strong>Banking:</strong> TBC Bank is most foreigner-friendly for opening a local account.' },
    ],
    community: [
      { passport: 'IN', date: 'Feb 2025', text: 'Zero queue at TBS airport, stamp in 2 mins. Rented a flat in Vera for $400/month. Unreal for Indians.', tags: ['TBS', 'zero friction', 'nomad'] },
      { passport: 'IN', date: 'Jan 2025', text: 'Stayed 4 months. Left for Armenia for a week then re-entered. Counter reset. Zero issues.', tags: ['long stay', 're-entry', 'Armenia'] },
    ],
  },

  'IN-AE': {
    verdict: 'voa',
    vtype: 'Visa on arrival',
    duration: '14 days (extendable)',
    extend: 'Yes, once (14 days)',
    cost: 'Free',
    processing: 'On arrival, ~10 min',
    brief: 'Indian nationals receive visa on arrival in the UAE valid for 14 days, extendable once at any immigration office. Dubai is a major transit and nomad hub with excellent connectivity and a large Indian expat community. The UAE also offers a 1-year remote work visa ($287) for those wanting to stay longer.',
    gotchas: [
      { t: 'ok',     text: '<strong>Fast-tracked for Indians:</strong> UAE VOA typically completed in under 15 minutes.' },
      { t: 'warn',   text: '<strong>No Israel stamps:</strong> A passport with Israeli stamps may cause issues at immigration.' },
      { t: 'danger', text: '<strong>VPN usage restricted</strong> — some VOIP apps are blocked. Standard WhatsApp calls may not work.' },
    ],
    community: [
      { passport: 'IN', date: 'Mar 2025', text: 'VOA at DXB under 10 mins. Have hotel confirmation ready just in case — they did not check but good to have.', tags: ['DXB', 'quick', 'smooth'] },
    ],
  },

  'IN-US': {
    verdict: 'visa',
    vtype: 'B1/B2 visa required',
    duration: 'Up to 180 days (CBP discretion)',
    extend: 'Possible via I-539',
    cost: '$185 MRV fee (non-refundable)',
    processing: 'Interview wait: 400–700+ days in India',
    brief: 'The US B1/B2 visa for Indian nationals has extraordinary interview wait times — exceeding 600 days in Delhi and Mumbai as of 2025. Kolkata sometimes has shorter queues. Once obtained, the visa is typically 10 years multiple-entry. The I-94 duration of stay is set by CBP at the port of entry — never assume 180 days automatically.',
    gotchas: [
      { t: 'danger', text: '<strong>Interview wait is 400–900 days</strong> in Indian cities as of 2025. Apply as early as humanly possible.' },
      { t: 'danger', text: '<strong>Non-immigrant intent burden:</strong> You must convincingly demonstrate ties to India — job, property, family. Primary refusal reason.' },
      { t: 'warn',   text: '<strong>DS-160 must match your documents exactly</strong> — any discrepancy is an immediate red flag.' },
      { t: 'warn',   text: '<strong>ESTA is not available</strong> for Indian nationals. There is no shortcut.' },
    ],
    community: [
      { passport: 'IN', date: 'Feb 2025', text: '14 months of waiting. Interview was 3 minutes. Asked about job, employer, and purpose of visit. Approved same day.', tags: ['Mumbai', 'approved', 'long wait'] },
      { passport: 'IN', date: 'Jan 2025', text: 'Rejected at Delhi — officer felt I did not demonstrate enough ties to India. Reapplying with property doc and employer letter.', tags: ['Delhi', 'rejected', 'ties to India'] },
    ],
  },

  'GB-TH': {
    verdict: 'free',
    vtype: 'Visa-free entry',
    duration: '60 days (air) / 30 days (land)',
    extend: 'Yes, once at immigration office',
    cost: 'Free',
    processing: 'On arrival',
    brief: 'UK passport holders enter Thailand visa-free for 60 days when arriving by air, extended from 30 days in late 2024 as part of Thailand\'s tourism expansion. Land border crossings still give only 30 days. No paperwork needed beyond a valid passport — ensure 6 months validity and a return or onward ticket.',
    gotchas: [
      { t: 'ok',   text: '<strong>60 days visa-free by air</strong> — extended from 30 days in late 2024. One of the best passport perks for Thailand.' },
      { t: 'warn', text: '<strong>Land border gives only 30 days</strong>, not 60. Fly in if you want the full allowance.' },
      { t: 'ok',   text: '<strong>Extendable once</strong> at any immigration office for 800 THB.' },
    ],
    community: [
      { passport: 'GB', date: 'Mar 2025', text: 'Waved through in under 5 mins at BKK. 60-day stamp, no questions asked. Thailand rolled out the welcome mat.', tags: ['BKK', '60 days', 'smooth'] },
    ],
  },

  'IN-ID': {
    verdict: 'free',
    vtype: 'Visa-free (30 days)',
    duration: '30 days',
    extend: 'No (extension withdrawn 2024)',
    cost: 'Free + $10 Bali tourist levy',
    processing: 'On arrival',
    brief: 'Indian nationals receive 30 days visa-free in Indonesia including Bali. The 2024 regulatory changes removed the extension option previously available via visa runs. For stays beyond 30 days, the B211A Social Visa applied via an Indonesian consulate before travel is the cleanest route — gives 60 days extendable to 180.',
    gotchas: [
      { t: 'danger', text: '<strong>Extensions stopped in 2024.</strong> Bali visa runs to Singapore or KL are the common workaround for longer stays.' },
      { t: 'warn',   text: '<strong>Bali tourist levy:</strong> $10 per person charged on arrival since February 2024.' },
      { t: 'ok',     text: '<strong>B211A Social Visa ($45)</strong> — apply before travel for 60 days extendable to 180. Worth it for longer stays.' },
    ],
    community: [
      { passport: 'IN', date: 'Feb 2025', text: '30-day stamp, smooth entry. Paid $10 Bali levy on arrival. No extension possible — did a visa run to Singapore at day 28.', tags: ['DPS', '30 days', 'visa run'] },
    ],
  },
}
