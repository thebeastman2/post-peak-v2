// 15 color schemes, each with light and dark variants.
// Solid rainbow colors first (ordered by hue), gradient schemes at the end.
// All values are HSL strings (hue, saturation%, lightness%).

export const colorSchemes = [
  // ── Rainbow (ordered by hue: red → orange → yellow → green → blue → violet) ──
  {
    id: 'ember', name: 'Ember',
    light: { primary: '0 72% 51%', accent: '15 80% 50%', bg: '0 25% 97%', card: '0 0% 100%', text: '0 30% 12%', textMuted: '0 15% 42%', border: '0 20% 88%' },
    dark: { primary: '0 72% 60%', accent: '15 80% 60%', bg: '0 20% 8%', card: '0 15% 12%', text: '0 15% 95%', textMuted: '0 15% 65%', border: '0 15% 20%' },
  },
  {
    id: 'sunset', name: 'Sunset',
    light: { primary: '16 100% 56%', accent: '340 80% 55%', bg: '20 40% 97%', card: '0 0% 100%', text: '20 40% 15%', textMuted: '20 20% 45%', border: '20 30% 88%' },
    dark: { primary: '16 100% 62%', accent: '340 80% 65%', bg: '20 30% 8%', card: '20 25% 12%', text: '20 15% 95%', textMuted: '20 15% 65%', border: '20 20% 20%' },
  },
  {
    id: 'peach', name: 'Peach',
    light: { primary: '28 90% 60%', accent: '350 70% 60%', bg: '25 40% 97%', card: '0 0% 100%', text: '25 35% 14%', textMuted: '25 15% 42%', border: '25 25% 89%' },
    dark: { primary: '28 90% 68%', accent: '350 70% 68%', bg: '20 25% 8%', card: '20 20% 12%', text: '25 15% 95%', textMuted: '25 15% 65%', border: '20 15% 20%' },
  },
  {
    id: 'amber', name: 'Amber',
    light: { primary: '35 92% 50%', accent: '20 80% 52%', bg: '35 35% 97%', card: '0 0% 100%', text: '30 35% 12%', textMuted: '30 15% 42%', border: '35 20% 88%' },
    dark: { primary: '35 92% 58%', accent: '20 80% 62%', bg: '30 20% 8%', card: '30 15% 12%', text: '30 15% 95%', textMuted: '30 15% 65%', border: '30 15% 20%' },
  },
  {
    id: 'forest', name: 'Forest',
    light: { primary: '152 63% 32%', accent: '140 60% 40%', bg: '140 25% 97%', card: '0 0% 100%', text: '140 40% 12%', textMuted: '140 15% 40%', border: '140 20% 88%' },
    dark: { primary: '152 63% 50%', accent: '140 60% 55%', bg: '150 25% 7%', card: '150 20% 11%', text: '140 15% 95%', textMuted: '140 10% 60%', border: '150 15% 18%' },
  },
  {
    id: 'mint', name: 'Mint',
    light: { primary: '168 100% 37%', accent: '190 80% 42%', bg: '165 35% 97%', card: '0 0% 100%', text: '165 35% 12%', textMuted: '165 15% 42%', border: '165 20% 88%' },
    dark: { primary: '168 100% 50%', accent: '190 80% 55%', bg: '165 25% 7%', card: '165 20% 11%', text: '165 15% 95%', textMuted: '165 15% 65%', border: '165 15% 18%' },
  },
  {
    id: 'ocean', name: 'Ocean',
    light: { primary: '199 89% 48%', accent: '240 70% 45%', bg: '200 40% 97%', card: '0 0% 100%', text: '210 40% 15%', textMuted: '210 20% 45%', border: '200 30% 88%' },
    dark: { primary: '199 89% 55%', accent: '240 70% 65%', bg: '210 40% 7%', card: '210 35% 11%', text: '200 20% 95%', textMuted: '200 15% 65%', border: '210 30% 18%' },
  },
  {
    id: 'midnight', name: 'Midnight',
    light: { primary: '230 70% 55%', accent: '250 60% 50%', bg: '225 30% 96%', card: '0 0% 100%', text: '230 30% 12%', textMuted: '230 15% 42%', border: '225 20% 87%' },
    dark: { primary: '230 80% 68%', accent: '250 60% 68%', bg: '225 40% 6%', card: '225 35% 10%', text: '225 20% 95%', textMuted: '225 15% 62%', border: '225 20% 17%' },
  },
  {
    id: 'lavender', name: 'Lavender',
    light: { primary: '255 80% 66%', accent: '280 60% 60%', bg: '260 30% 98%', card: '0 0% 100%', text: '260 30% 15%', textMuted: '260 15% 45%', border: '260 20% 90%' },
    dark: { primary: '255 80% 72%', accent: '280 60% 70%', bg: '260 25% 8%', card: '260 20% 12%', text: '260 15% 95%', textMuted: '260 15% 65%', border: '260 15% 20%' },
  },
  {
    id: 'royal', name: 'Royal',
    light: { primary: '262 83% 58%', accent: '230 70% 55%', bg: '260 30% 97%', card: '0 0% 100%', text: '260 40% 15%', textMuted: '260 20% 45%', border: '260 20% 88%' },
    dark: { primary: '262 83% 68%', accent: '230 70% 68%', bg: '260 30% 8%', card: '260 25% 12%', text: '260 15% 95%', textMuted: '260 15% 65%', border: '260 15% 20%' },
  },

  // ── Gradients (multi-color schemes) ──
  {
    id: 'instagram', name: 'Instagram',
    light: { primary: '330 81% 60%', accent: '280 50% 47%', bg: '350 30% 97%', card: '0 0% 100%', text: '0 0% 15%', textMuted: '0 0% 45%', border: '350 20% 90%' },
    dark: { primary: '330 81% 65%', accent: '280 50% 65%', bg: '300 20% 8%', card: '300 15% 12%', text: '0 0% 95%', textMuted: '0 0% 65%', border: '300 10% 20%' },
  },
  {
    id: 'rosegold', name: 'Rose Gold',
    light: { primary: '345 60% 60%', accent: '35 70% 60%', bg: '10 30% 97%', card: '0 0% 100%', text: '10 30% 15%', textMuted: '10 15% 45%', border: '10 20% 90%' },
    dark: { primary: '345 60% 70%', accent: '35 70% 65%', bg: '10 20% 8%', card: '10 15% 12%', text: '10 15% 95%', textMuted: '10 15% 65%', border: '10 15% 20%' },
  },
  {
    id: 'coral', name: 'Coral',
    light: { primary: '9 85% 61%', accent: '175 70% 40%', bg: '170 25% 97%', card: '0 0% 100%', text: '170 30% 15%', textMuted: '170 15% 42%', border: '170 20% 88%' },
    dark: { primary: '9 85% 68%', accent: '175 70% 55%', bg: '170 20% 8%', card: '170 15% 12%', text: '170 15% 95%', textMuted: '170 15% 65%', border: '170 15% 20%' },
  },
  {
    id: 'grayscale', name: 'Grayscale',
    light: { primary: '0 0% 30%', accent: '0 0% 60%', bg: '0 0% 97%', card: '0 0% 100%', text: '0 0% 15%', textMuted: '0 0% 45%', border: '0 0% 88%' },
    dark: { primary: '0 0% 45%', accent: '0 0% 70%', bg: '0 0% 7%', card: '0 0% 11%', text: '0 0% 95%', textMuted: '0 0% 65%', border: '0 0% 18%' },
  },
  {
    id: 'black', name: 'Black',
    light: { primary: '0 0% 9%', accent: '0 0% 25%', bg: '0 0% 96%', card: '0 0% 100%', text: '0 0% 10%', textMuted: '0 0% 40%', border: '0 0% 87%' },
    dark: { primary: '0 0% 20%', accent: '0 0% 35%', bg: '0 0% 4%', card: '0 0% 8%', text: '0 0% 95%', textMuted: '0 0% 55%', border: '0 0% 15%' },
  },
];

export const defaultScheme = colorSchemes.find(s => s.id === 'black');