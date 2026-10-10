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
    slug: 'lash-champions-mascara-curl-and-lift-guide',
    title: '✨Travel Size Lash Champions Mascara✨: The Secret to High-Def Lashes',
    kicker: 'FEATURED',
    chips: ['Featured', 'Eye Routine'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/bb496562b60f5973769bdb0813137d0dc0688413-1200x330.webp',
    date: 'Beauty Editorial',
    intro: 'Engineered specifically for short, straight, or stubborn lashes with a travel-ready wand.',
    paragraphs: [
      'Finding a mascara that grips every single petite hair without clumping or smudging used to be impossible.',
      'Our Travel Size Lash Champions Mascara features a micro-precision brush designed to reach right into the roots.',
      'Available in Petite and Tall curling wands to tailor lifting power to your natural lash architecture.',
      'Pro Tip: Place the wand at the lash base, wiggle gently for 2 seconds to deposit pigment, then sweep upward in clean strokes.',
    ],
    linkedProductHandles: ['travel-size-lash-champions-mascara'],
  },
  {
    slug: 'swiss-beauty-bold-matt-lip-liner-guide',
    title: '👄Swiss Beauty Bold Matt Lip Liner👄: Precision & Non-Drying Matte Guide',
    kicker: 'FEATURED',
    chips: ['Featured', 'Lip Routine'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/f45bd464b383889a76e2f6c46ad92ec78a0b1222-1200x330.jpg',
    date: 'Formulation Focus',
    intro: 'Glides on like velvet, sets into a transfer-proof shield that lasts through long dinners and humidity.',
    paragraphs: [
      'Whether creating a subtle everyday contour or an exaggerated glamorous pout, the Bold Matt Lip Liner in Shade 10 Pink Crush is an essential.',
      'Engineered with pure pigment concentration, it provides sharp edge control without pulling or dragging sensitive lip tissue.',
      'Rich in conditioning emollients that ensure a smooth, tug-free glide and non-drying all-day wear.',
      'Fill in the entire lip for a velvety matte base, or trace borders for sharp high-definition definition.',
    ],
    linkedProductHandles: ['swiss-beauty-bold-matt-lip-liner'],
  },
  {
    slug: 'lip-balm-nourishing-hydration-guide',
    title: '🍓Lip Balm🍓: Raspberry & Vitamin E Deep Hydration',
    kicker: 'FEATURED',
    chips: ['Featured', 'Lip Care'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/c5030ef09119ae61415a941e91f40584c34abdc3-1200x330.jpg',
    date: 'Curated Routine',
    intro: 'Nourish and soothe dry lips with antioxidant raspberry seed extract and soothing vitamin E.',
    paragraphs: [
      'Healthy, plump lips start with a deeply restorative moisture barrier.',
      'Our Lip Balm is formulated with raspberry seed extract to shield against environmental stress, paired with vitamin E for all-day hydration.',
      'Wear alone as an everyday satin balm, or use as an overnight conditioning mask for baby-soft lips.',
      'Pairs perfectly under your lip liner for comfortable, long-lasting color wear.',
    ],
    linkedProductHandles: ['lip-balm'],
  },
  {
    slug: 'the-signature-trio-routine',
    title: '✨The Signature Trio✨: 3 Essentials for Effortless Luxury',
    kicker: 'FEATURED',
    chips: ['Featured', 'Signature Routine'],
    coverImage: 'https://cdn.sanity.io/images/03h1hklz/production/9b56d9fc7c008e0fc6169b0198d58d818228a212-1200x330.jpg',
    date: 'Curated Routine',
    intro: 'How our 3 hero products combine into an ultra-streamlined, high-impact beauty ritual.',
    paragraphs: [
      'Minimalism meets maximum luxury: you do not need 20 products for effortless poise.',
      '1. Curl, lift, and fan out lashes with Travel Size Lash Champions Mascara.',
      '2. Define and accentuate contours with Swiss Beauty Bold Matt Lip Liner in Pink Crush.',
      '3. Lock in cushiony hydration and natural glow with Lip Balm.',
      'A complete, cohesive ritual designed for modern luxury beauty enthusiasts.',
    ],
    linkedProductHandles: ['travel-size-lash-champions-mascara', 'swiss-beauty-bold-matt-lip-liner', 'lip-balm'],
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
