/**
 * Business facts for the cinematic edition. Source of truth: docs/CONTENT.md
 * (owner brief, 2026-10-17) and the live site at naplin-sage.vercel.app.
 * Never add prices, stock, programme details, reviews or policies here
 * without owner confirmation.
 */

export const business = {
  name: 'Hair By Naplin',
  city: 'Kumasi',
  country: 'Ghana',
  // Kumasi city centre, for the story chapter. Not a street address.
  coordinates: '6.69° N · 1.62° W',
  hours: {
    days: 'Monday – Saturday',
    time: '8:00 AM – 8:00 PM',
  },
  // Owner confirmed on 2026-10-17 that both numbers may be published.
  phones: [
    { display: '050 211 5818', tel: '+233502115818' },
    { display: '054 923 9934', tel: '+233549239934' },
  ],
} as const;

export type NavItem = { label: string; href: string };

export const navigation: readonly NavItem[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Services', href: '/services' },
  { label: 'Academy', href: '/academy' },
  { label: 'Our Story', href: '/story' },
];

export const bookLink: NavItem = { label: 'Book', href: '/book' };

export const marquee = [
  'Hair By Naplin',
  'Made to move',
  'Kumasi',
  'The art of hair',
];

export const chapters = [
  {
    id: 'texture',
    word: 'Texture',
    line: 'Every strand tells a story.',
  },
  {
    id: 'movement',
    word: 'Movement',
    line: 'Made to move with you.',
  },
  {
    id: 'finish',
    word: 'Finish',
    line: 'The detail that changes everything.',
  },
] as const;

export const collection = [
  {
    id: 'frontal-wigs',
    name: 'Frontal Wigs',
    line: 'Ready to wear. Styled to move.',
  },
  {
    id: 'closure-wigs',
    name: 'Closure Wigs',
    line: 'Versatile looks. Everyday elegance.',
  },
  {
    id: 'hair-bundles',
    name: 'Luxury Hair Bundles',
    line: 'The foundation of the look you have in mind.',
  },
] as const;

// Owner-confirmed services. No durations, prices or availability are implied.
export const services = [
  {
    id: 'hairstyling',
    name: 'Hairstyling',
    line: 'Polished looks for every occasion.',
  },
  {
    id: 'retouching',
    name: 'Retouching',
    line: 'Keep your style looking its best.',
  },
  {
    id: 'pony-styles',
    name: 'Pony styles',
    line: 'Sleek, sculpted, confident.',
  },
  { id: 'pedicure', name: 'Pedicure', line: 'Care from head to toe.' },
] as const;

// Owner-confirmed training areas. Programme formats, fees, durations,
// schedules, admissions, intakes and certification are unknown, not "free".
export const academyDisciplines = [
  { id: 'wigs', name: 'Wig work', line: 'Practical wig making and styling.' },
  {
    id: 'extensions',
    name: 'Extensions',
    line: 'Working with extensions, installation and related techniques.',
  },
  {
    id: 'braiding',
    name: 'Braiding',
    line: 'Practical braiding across styles and techniques.',
  },
  {
    id: 'hairstyling',
    name: 'Hairstyling',
    line: 'Handling and styling hair with confidence.',
  },
] as const;

export const imageryNote =
  'Photography on this site is generated campaign concept imagery. It does not show Hair By Naplin clients, staff, students, premises or specific products.';
