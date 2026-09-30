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
    slug: 'bronza-bronzer-tips-and-tricks',
    title: '🤎BRONZA Bronzer🤎: Tips & Tricks',
    kicker: 'FEATURED',
    chips: ['Featured'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/bb496562b60f5973769bdb0813137d0dc0688413-1200x330.webp',
    date: 'Beauty Editorial',
    intro: 'Understand your skin and its complex needs with our tips and tricks, extensive guides and blog posts.',
    paragraphs: [
      'Who said that bronzed complexion is only for summer? We have got the product that will give you a gorgeous bronzy look all year long.',
      'Let us tell you more about and give you some tips on how to make the best out of this multipurpose product.',
      'The Bronza Bronzer is available in 8 different shades, featuring varied undertones from cool to warm tones that flatter distinct skin tones.',
      'Cool toned shades like TAUPE, CARAMEL, and COCOA are ideal for precise face contouring.',
      'Warm toned shades such as ALMOND, HONEY, and HAZELNUT can be used for bronzing. Use a fluffy brush on temples, cheeks, and jawline, with a subtle touch on the nose for an authentic sun-kissed look.',
      'Extra beauty tip: Bronzer can also double as a luxurious eyeshadow for warm monochromatic everyday wear.',
      'Everyday neutrals: HONEY, HAZELNUT, and CARAMEL. For evening drama: COPPER or PEANUT for an intense, sculpted finish.',
    ],
    linkedProductHandles: ['bronza-bronzer'],
  },
  {
    slug: 'cherry-and-strawberry-fruity-tints-to-add-a-flush-to-your-lips-and-cheeks',
    title: '🍒Cherry & Strawberry🍓: Fruity tints to add a flush to your lips and cheeks',
    kicker: 'FEATURED',
    chips: ['Featured', 'Beauty'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/f45bd464b383889a76e2f6c46ad92ec78a0b1222-1200x330.jpg',
    date: 'Formulation Focus',
    intro: 'Fruity tints that blend like water and last through coffee, humidity, and long evenings.',
    paragraphs: [
      "Whether it's a light natural tint or a vibrant base for blush and lipstick, we have you covered!",
      'VELORAA ROUGEE has crafted a long-lasting formula for a lightweight tint that comes in 2 mouthwatering shades: 🍒 Cherry and 🍓 Strawberry.',
      'Cherry delivers a classic deep ruby flush with cool berry undertones, while Strawberry enlivens cheekbones with bright, youthful warmth.',
      'The water-light consistency absorbs instantaneously into lips and cheeks without creating stickiness, tackiness, or powder migration.',
    ],
    linkedProductHandles: ['lip-and-cheek-tint'],
  },
  {
    slug: 'summer-must-haves-2022',
    title: 'Summer must haves 2022',
    kicker: 'FEATURED',
    chips: ['Featured', 'Makeup'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/c5030ef09119ae61415a941e91f40584c34abdc3-1200x330.jpg',
    date: 'Curated Routine',
    intro: 'The season of glam, travel, and gorgeous summer looks is here.',
    paragraphs: [
      "Let's pack our summer makeup bags, but we don't want to overcrowd them. We will take only the essentials, so let's go through our favorite summer beauty staples.",
      '1. Liquid matte lipstick — long-lasting, transfer-proof, water-resistant formula that stays through heat and dips in the pool.',
      '2. Lash champion mascara — locks curls and grips even straight, petite lashes with smudge-proof endurance.',
      '3. Pearla Sun kissed blush & Blooming Cheeks — luminous cheek color that glows naturally in golden-hour light.',
      '4. Kohl Kajal — multipurpose intense black pigment for waterlines, tightlining, or blended sultry eyes.',
    ],
    linkedProductHandles: ['liquid-matte-lipstick', 'travel-size-lash-champions-mascara', 'kohl-kajal-1'],
  },
  {
    slug: 'summer-2022-makeup-trends',
    title: 'Summer 2022 Makeup Trends',
    kicker: 'FEATURED',
    chips: ['Featured', 'Makeup'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/9b56d9fc7c008e0fc6169b0198d58d818228a212-1200x330.jpg',
    date: 'Trend Forecast',
    intro: 'From hydrated mirror gloss to graphic eyes, explore the aesthetic directions shaping the season.',
    paragraphs: [
      'This season celebrates luminous skin combined with intentional graphic definition.',
      'Natural brows brushed upward with fixing mascara provide an effortless structural lift to the face without needing heavy pomades.',
      'Lip combinations lean into sharply contoured lip liners paired with high-shine hydrating balms or tinted glosses.',
      'Clean Italian craftsmanship and comfortable formulations allow everyday wear that feels as lightweight as skincare.',
    ],
    linkedProductHandles: ['the-brow-boss-fix-mascara', 'the-lip-liner', 'hydrating-gloss'],
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
