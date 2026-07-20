/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        srf: {
          // Verified from Self-Realization Fellowship's own brand (yogananda.org):
          // a deep, solemn navy and a bright emblem gold. These are the two
          // anchors — used sparingly and with reverence.
          navy: '#052956',      // canonical SRF primary (deep midnight blue)
          blue: '#052956',      // alias so existing `srf-blue` utilities read as the correct navy
          'blue-700': '#0A3D73', // hover / raised navy
          'blue-500': '#14508C', // lighter navy for accents on dark surfaces
          gold: '#DCBD23',      // SRF emblem gold — decorative fills, rules, on-navy accents only
          'gold-deep': '#8A6A12', // darker gold that passes WCAG as text/icon on light backgrounds

          // Warm, restrained supporting tones — the feel of aged paper and a
          // quiet reading room, not pastels.
          white: '#F8F6F1',     // warm off-white base
          ivory: '#F1E9D9',     // soft ivory for gentle surfaces
          lotus: '#E9DEC8',     // warm sand for subtle hovers / meta pills (replaces the old peach)
          sky: '#B9C7DA',       // a true light tint of the navy (replaces the unrelated light blue)

          // SRF's secondary olive/sage family, for the rare earthy accent.
          olive: '#696C0B',
          earth: '#87893C',

          ink: '#2A2E33',       // warm near-charcoal for body text
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        quote: ['"Crimson Text"', 'serif'],
      },
    },
  },
  plugins: [],
}
