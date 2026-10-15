import { StoreLocation, StoryArticle } from '../types';

export const BRAND_INFO = {
  name: 'VELORAA ROUGEE',
  company: 'VELORAA ROUGEE',
  gst: '27BJKPG4947G1ZZ',
  supportEmail: 'support.veloraarougee@gmail.com',
  announcements: [
    'Free Shipping across India over ₹999',
    'Our products are not tested on animals',
  ],
  claimTicker: [
    'Cruelty Free',
    'Clean',
    'Made with love',
    'Not tested on animals',
    'Made in Italy',
    'Cruelty free',
    'Made with love',
    'Skin loving products',
  ],
};

export const STORY_ARTICLES: StoryArticle[] = [
  {
    slug: 'hydramatte-liquid-lipstick-crimson-vela-guide',
    title: '💋HydraMatte™ Liquid Lipstick Crimson Vela💋: The Power of Cool Red',
    kicker: 'FEATURED',
    chips: ['Featured', 'Lip Routine'],
    coverImage: '/images/hero/hero-dark-1.jpg',
    date: 'Beauty Editorial',
    intro: 'Weightless transfer-proof liquid matte lipstick in cool red with 16-hour hydration.',
    paragraphs: [
      'Finding the ultimate statement red that lifts teeth radiance and brightens complexions is the gold standard of beauty.',
      'Our HydraMatte™ Liquid Lipstick in Crimson Vela is engineered with micro-milled cool-red pigments and moisture-locking hyaluronic acid.',
      'Unlike conventional mattes that parch, the breathable formula flexes with your lips for all-day velvety comfort without feathering.',
      'Pro Tip: Apply directly from the precision doe-foot applicator starting at the cupid’s bow outwards, and let set for 30 seconds.',
    ],
    linkedProductHandles: ['hydramatte-liquid-lipstick-crimson-vela'],
  },
  {
    slug: 'velvet-lip-cream-orchid-rush-guide',
    title: '🌸Velvet Lip Cream Orchid Rush🌸: Electric Fuchsia Pink Elegance',
    kicker: 'FEATURED',
    chips: ['Featured', 'Lip Routine'],
    coverImage: '/images/hero/hero-dark-2.jpg',
    date: 'Formulation Focus',
    intro: 'Cushiony fuchsia pink whipped lip cream with rich petal-soft velvet payoff.',
    paragraphs: [
      'Orchid Rush delivers vibrant petal energy with an ethereal, cloud-soft mousse texture.',
      'Infused with cold-pressed wild rose hip oil and botanical ceramides to smooth lip lines and lock in plumping hydration.',
      'Delivers intense color opacity in a single glide while remaining weightlessly soft and comfortable.',
      'Dab gently onto the center of lips and diffuse outwards with a fingertip for a French-girl blotted stain, or wear full-strength for high-voltage glam.',
    ],
    linkedProductHandles: ['velvet-lip-cream-orchid-rush'],
  },
  {
    slug: 'satin-lip-oil-mocha-ember-guide',
    title: '✨Satin Lip Oil Mocha Ember✨: Warm Nude Cinnamon Brown Glow',
    kicker: 'FEATURED',
    chips: ['Featured', 'Lip Care'],
    coverImage: '/images/hero/hero-light-1.jpg',
    date: 'Curated Routine',
    intro: 'Warm nude cinnamon brown hydrating lip nectar with luminous glass shine.',
    paragraphs: [
      'The quintessential warm nude designed to harmonize flawlessly with South Asian and warm undertones.',
      'Satin Lip Oil in Mocha Ember pairs sweet almond oil with cinnamon extract and shea butter to drench lips in nourishing luxury.',
      'Provides the non-sticky cushion of a treatment serum with the mirror-glaze finish of a luxury gloss.',
      'Wear solo for an effortless everyday glow, or layer over Crimson Vela or Orchid Rush to add multi-dimensional dimensional luster.',
    ],
    linkedProductHandles: ['satin-lip-oil-mocha-ember'],
  },
  {
    slug: 'the-signature-trio-routine',
    title: '✨The Signature Lip Trio✨: 3 Iconic Finishes for Every Mood',
    kicker: 'FEATURED',
    chips: ['Featured', 'Signature Routine'],
    coverImage: '/images/hero/hero-light-2.jpg',
    date: 'Curated Routine',
    intro: 'How our 3 hero lip formulations combine into an ultra-streamlined, high-impact luxury ritual.',
    paragraphs: [
      'Three bespoke lip icons designed to transition your look effortlessly from boardroom power to evening allure.',
      '1. HydraMatte™ Crimson Vela: The non-drying cool red statement for uncompromising confidence.',
      '2. Velvet Lip Cream Orchid Rush: The playful, electric fuchsia pink petal blur for daytime radiance.',
      '3. Satin Lip Oil Mocha Ember: The essential warm cinnamon nude glazed nectar for everyday decadence.',
      'A complete, cohesive lip wardrobe crafted for modern luxury beauty enthusiasts.',
    ],
    linkedProductHandles: ['hydramatte-liquid-lipstick-crimson-vela', 'velvet-lip-cream-orchid-rush', 'satin-lip-oil-mocha-ember'],
  },
];

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'loc-nashik',
    name: 'Veloraa Rougee — Nashik',
    cityId: 'nashik',
    mall: 'Nashik City Centre Mall',
    city: 'Nashik',
    state: 'Maharashtra',
    address: 'Ground Floor, Untwadi Road, Lavate Nagar, Nashik, Maharashtra 422002',
    timing: '10:30 AM – 9:30 PM',
    phone: '+91 253 239 8899',
    mapUrl: 'https://maps.google.com/?q=City+Centre+Mall+Nashik+Maharashtra',
  },
  {
    id: 'loc-pune',
    name: 'Veloraa Rougee — Pune',
    cityId: 'pune',
    mall: 'Phoenix Marketcity Mall',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Upper Ground Floor, Viman Nagar, Pune, Maharashtra 411014',
    timing: '11:00 AM – 10:00 PM',
    phone: '+91 20 6689 0088',
    mapUrl: 'https://maps.google.com/?q=Phoenix+Marketcity+Pune+Maharashtra',
  },
];

export const LEGAL_PAGES_CONTENT = {
  shipping: {
    title: 'Shipping Policy',
    sections: [
      {
        heading: 'Shipping Destinations & Timelines',
        body: 'VELORAA ROUGEE delivers across the UAE and internationally to destinations covered by our premier courier partners. Local orders are typically fulfilled within 2 working days. International deliveries arrive within 4 to 5 working days depending on customs clearance.',
      },
      {
        heading: 'Customs, Duties & Taxes',
        body: 'Orders delivered outside of the local fulfillment hub may be subject to import duties, local taxes, and customs inspections in according with destination country regulations. Please verify with local customs offices for details.',
      },
      {
        heading: 'Shipping Inquiries',
        body: 'For real-time delivery status, tracking inquiries, or delivery assistance, reach our logistics desk directly at support.veloraarougee@gmail.com.',
      },
    ],
  },
  'return-policy': {
    title: 'Return & Exchange Policy',
    sections: [
      {
        heading: 'Our Return Standard',
        body: 'We want you to be completely delighted with your VELORAA ROUGEE order. If an item arrives damaged, defective, or incorrect, you may request an exchange within 14 days of delivery receipt.',
      },
      {
        heading: 'Hygiene & Product Integrity',
        body: 'Due to strict cosmetic safety and hygiene regulations, beauty products must remain unopened, unused, and in their original sealed packaging to be eligible for exchange or return authorization.',
      },
      {
        heading: 'Submitting a Request',
        body: 'To initiate an exchange or report a fulfillment issue, email our support concierge at support.veloraarougee@gmail.com with your order number, photo documentation, and item details.',
      },
    ],
  },
  'terms-and-conditions': {
    title: 'Terms And Conditions',
    sections: [
      {
        heading: 'About our Terms',
        body: 'Welcome to VELORAA ROUGEE. By browsing, accessing, or placing an order through our storefront, you acknowledge and agree to comply with our commercial terms and privacy standards.',
      },
      {
        heading: 'Company & Business Details',
        body: 'Company: VELORAA ROUGEE. Registered GST: 27BJKPG4947G1ZZ. Official support contact: support.veloraarougee@gmail.com. All intellectual property, imagery, and product assets remain the exclusive property of VELORAA ROUGEE.',
      },
      {
        heading: 'Pricing & Availability',
        body: 'All product prices are quoted in INR (₹) and include applicable taxes where indicated. We reserve the right to correct typographical pricing discrepancies or update variant availability.',
      },
      {
        heading: 'Support Concierge Hours',
        body: 'Our support concierge is at your service Monday through Friday, 9:00 AM – 6:00 PM GST at support.veloraarougee@gmail.com.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Who We Are',
        body: 'VELORAA ROUGEE operates this e-commerce storefront dedicated to luxury cosmetics and beauty products. We are committed to safeguarding personal information collected during your visit.',
      },
      {
        heading: 'Information We Collect',
        body: 'We collect personal information necessary to process orders, manage delivery addresses, process inquiries, and provide customer support (such as your name, email address, delivery details, and order history).',
      },
      {
        heading: 'Cookies & Analytics',
        body: 'Our site utilizes necessary functional session cookies and secure analytics to remember shopping cart items, facilitate checkout flows, and optimize browsing responsiveness.',
      },
      {
        heading: 'Keeping Your Information Secure',
        body: 'We implement industry-standard encryption protocols and strict access controls. We do not sell or license your personal details to third-party brokers.',
      },
    ],
  },
};
