export const PASSPORTS = {
  IN: 'India',
  PK: 'Pakistan',
  AE: 'UAE',
  GB: 'United Kingdom',
  US: 'United States',
  DE: 'Germany',
  AU: 'Australia',
  SG: 'Singapore',
  JP: 'Japan',
  NG: 'Nigeria',
  BR: 'Brazil',
  ZA: 'South Africa',
}

export const DESTINATIONS = {
  TH: 'Thailand',
  PT: 'Portugal',
  ID: 'Indonesia (Bali)',
  MX: 'Mexico',
  GE: 'Georgia',
  TR: 'Turkey',
  JP: 'Japan',
  AE: 'UAE (Dubai)',
  DE: 'Germany (Schengen)',
  US: 'United States',
  MA: 'Morocco',
  VN: 'Vietnam',
  KE: 'Kenya',
  ES: 'Spain (Schengen)',
}

export const FLAGS = {
  IN: '🇮🇳', PK: '🇵🇰', AE: '🇦🇪', GB: '🇬🇧',
  US: '🇺🇸', DE: '🇩🇪', AU: '🇦🇺', SG: '🇸🇬',
  JP: '🇯🇵', NG: '🇳🇬', BR: '🇧🇷', ZA: '🇿🇦',
  TH: '🇹🇭', PT: '🇵🇹', ID: '🇮🇩', MX: '🇲🇽',
  GE: '🇬🇪', TR: '🇹🇷', MA: '🇲🇦', VN: '🇻🇳',
  KE: '🇰🇪', ES: '🇪🇸',
}

export const VERDICT_META = {
  free: { label: 'Visa-free',       short: 'Free',     cls: 'verdict-free' },
  voa:  { label: 'Visa on arrival', short: 'VOA',      cls: 'verdict-voa'  },
  visa: { label: 'Visa required',   short: 'Visa req', cls: 'verdict-visa' },
  no:   { label: 'Entry denied',    short: 'Denied',   cls: 'verdict-no'   },
}
