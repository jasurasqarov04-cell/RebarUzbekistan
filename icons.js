// ═══════════════════════════════════════════════════════════════
// REBAR UZBEKISTAN — SVG Icon Library v3
// Two-tone (stroke + faint fill) for prominent/card icons,
// crisp strokes for nav/utility. All paths tuned to a 24×24 viewBox.
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  // ── NAV / UI (crisp strokes, optimized for ~22px) ───────────────
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>`,
  cart: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h2.5l.7 3h15.3l-2.2 9.4a2 2 0 0 1-1.9 1.6H8.6a2 2 0 0 1-1.9-1.5L4.2 6"/><circle cx="9" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  heartFilled: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8.2" r=".8" fill="currentColor" stroke="none"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4-4"/></svg>`,
  back: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>`,
  minus: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>`,
  remove: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4.2A2 2 0 0 1 10 2.2h4a2 2 0 0 1 2 2V6"/><path d="M19 6 17.7 20a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 6"/><path d="M10 11v6M14 11v6"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  loader: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" aria-hidden="true"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
  external: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><path d="M10 14 21 3"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6"  x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6"  r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  spec: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9l-6.9 6.9a2 2 0 0 1-2.8-2.8l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.6 3.6z"/></svg>`,
  spark: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 13.6 9 21 10.5l-7.4 1.5L12 19l-1.6-7L3 10.5 10.4 9z"/></svg>`,

  // ── CONTACTS (two-tone) ─────────────────────────────────────────
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 3.5h3a1.5 1.5 0 0 1 1.5 1.2l.7 3.3a1.5 1.5 0 0 1-.4 1.4l-1.5 1.5a14 14 0 0 0 5.8 5.8l1.5-1.5a1.5 1.5 0 0 1 1.4-.4l3.3.7a1.5 1.5 0 0 1 1.2 1.5v3a1.5 1.5 0 0 1-1.7 1.5 18 18 0 0 1-16-16A1.5 1.5 0 0 1 5 3.5z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  telegram: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m21.5 4.5-19 7.3 6.2 2.5 1.8 5.7 3.2-3.4 5.3 3.9z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="m9.7 14.3 8-6.3-6.2 8 .7 4-2.5-5.7z" fill="currentColor"/>
  </svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="2"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3.5 7 12 13l8.5-6"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3 12h18"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 3.2c2.7 2.7 4 6 4 8.8s-1.3 6.1-4 8.8c-2.7-2.7-4-6-4-8.8s1.3-6.1 4-8.8z"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 21l1.5-5A9 9 0 1 1 21 12 9 9 0 0 1 6.5 19.5L3 21z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M9 9c.5-.6 1.1-.4 1.5.3l.7 1.4c.2.4.1.7-.2 1l-.4.4c.5 1.1 1.4 2 2.5 2.5l.4-.4c.3-.3.6-.4 1-.2l1.4.7c.7.4.9 1 .3 1.5l-.7.7c-.6.6-1.4.8-2.2.5-2.7-1.1-4.8-3.2-5.9-5.9-.3-.8-.1-1.6.5-2.2z"
      fill="currentColor"/>
  </svg>`,
  pin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s9-7 9-13a9 9 0 1 0-18 0c0 6 9 13 9 13z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="2.8" fill="currentColor"/>
  </svg>`,
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="1.5" y="6" width="13" height="10" rx="1.5"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M14.5 10h4l3 3.5V16h-7z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="6" cy="18.5" r="2.4" fill="currentColor"/>
    <circle cx="18" cy="18.5" r="2.4" fill="currentColor"/>
  </svg>`,

  // ── REBAR / INDUSTRIAL CATEGORY (two-tone) ──────────────────────
  // Steel rod with characteristic ribbed thread spiral
  rebar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.7 17.5 17.5 3.7l2.8 2.8L6.5 20.3z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M5.5 16.5 7 18M8 14l1.5 1.5M10.5 11.5 12 13M13 9l1.5 1.5M15.5 6.5 17 8"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>
  </svg>`,
  // Welded steel mesh (rebar grid)
  mesh: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="1.5"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"
      stroke="currentColor" stroke-width="1.5" opacity=".7"/>
    <circle cx="9" cy="9"  r="1.1" fill="currentColor"/>
    <circle cx="15" cy="9" r="1.1" fill="currentColor"/>
    <circle cx="9" cy="15" r="1.1" fill="currentColor"/>
    <circle cx="15" cy="15" r="1.1" fill="currentColor"/>
  </svg>`,
  // Box / package
  box: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M3.3 7 12 12l8.7-5M12 22V12"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M7.5 4.7l9 5.2"
      stroke="currentColor" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>
  </svg>`,
  // Construction site / building
  construction: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 21V8.5a2 2 0 0 1 2-2h2V3.5h4v3h6a2 2 0 0 1 2 2V21z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="8.5" y="11"   width="2.4" height="2.4" rx=".4" fill="currentColor"/>
    <rect x="13.1" y="11"  width="2.4" height="2.4" rx=".4" fill="currentColor"/>
    <rect x="8.5" y="15.5" width="2.4" height="2.4" rx=".4" fill="currentColor"/>
    <rect x="13.1" y="15.5" width="2.4" height="2.4" rx=".4" fill="currentColor"/>
  </svg>`,
  // Factory
  factory: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 21V11l5 3V9l5 3V7l6 3-1 11z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M2 21h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="6"  y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <rect x="16" y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <path d="M7 5.5c0-1 .8-1 .8-2s-.8-1-.8-2M11 3.5c0-1 .8-1 .8-2"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
  </svg>`,
  // Shield (compliance / quality)
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M8.5 12.2l2.5 2.5 4.5-5"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  // Measuring scale / ruler / standards
  scale: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="9" width="20" height="6" rx="1.5"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M5 9v3M9 9v4M13 9v3M17 9v4M21 9v3"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  // Lightweight / feather (low weight benefit)
  feather: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M16 8 2 22"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M17.5 15 9 15"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
  </svg>`,
  // Anti-corrosion droplet
  drop: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.7s5.7 5.7 5.7 10.3a5.7 5.7 0 0 1-11.4 0c0-4.6 5.7-10.3 5.7-10.3z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M9.5 14a3 3 0 0 0 2.5 2"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
  </svg>`,
  // Award / certificate medal
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="9" r="6"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M8.2 13.7 7 22l5-3 5 3-1.2-8.3"
      fill="currentColor" fill-opacity=".25"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12 6 13.2 8.4 16 8.8l-2 2 .5 2.7L12 12.2 9.5 13.5l.5-2.7-2-2 2.8-.4z"
      fill="currentColor"/>
  </svg>`,
  // Thermometer
  thermo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 13.5V4a2.5 2.5 0 0 0-5 0v9.5a4.5 4.5 0 1 0 5 0z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="11.5" cy="17.5" r="2.4" fill="currentColor"/>
    <line x1="11.5" y1="11.5" x2="11.5" y2="15.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M16 6h1.6M16 9h1.6M16 12h1.6"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
  </svg>`,
  // Star (quality)
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5l3 6.4 7 1-5 4.9 1.2 6.9L12 18.4l-6.2 3.3L7 14.8 2 9.9l7-1z"
      fill="currentColor" fill-opacity=".22"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
};

function getIcon(name, className = '') {
  let icon = ICONS[name] || '';
  if (className && icon) {
    icon = icon.replace('<svg', `<svg class="${className}"`);
  }
  return icon;
}

// Auto-inject all data-icon="name" placeholders.
function injectIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    if (ICONS[name] && !el.dataset.injected) {
      el.innerHTML = ICONS[name];
      el.dataset.injected = '1';
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => injectIcons());
  } else {
    injectIcons();
  }
}
