import { BRAND_INFO, LEGAL_PAGES_CONTENT, STORE_LOCATIONS, STORY_ARTICLES } from '../data/content';
import { StoreLocation, StoryArticle } from '../types';
import { api, hasApi } from '../lib/api';

type LegalTab = 'shipping' | 'return-policy' | 'terms-and-conditions' | 'privacy-policy';

let stories = STORY_ARTICLES;
let locations = STORE_LOCATIONS;
let legal = LEGAL_PAGES_CONTENT;
let announcements = BRAND_INFO.announcements;
let claimTicker = BRAND_INFO.claimTicker;
const sectionEnabled = new Map<string, boolean>();

export function getStoryArticles() {
  return stories;
}
export function getStoreLocations() {
  return locations;
}
export function getLegalPages() {
  return legal;
}
export function getAnnouncements() {
  return announcements;
}
export function getClaimTicker() {
  return claimTicker;
}
export function isHomepageSectionEnabled(key: string) {
  if (sectionEnabled.size === 0) return true;
  return sectionEnabled.get(key) !== false;
}

export async function hydrateContent() {
  if (!hasApi()) return;
  const [storyRows, locationRows, homepage] = await Promise.all([
    api<Record<string, unknown>[]>('/stories'),
    api<Record<string, unknown>[]>('/locations'),
    api<{ sections?: { section_key: string; enabled: boolean }[]; settings?: { announcements?: string[]; claim_ticker?: string[] } }>('/homepage'),
  ]);
  stories = storyRows.map((row) => ({
    slug: String(row.slug),
    title: String(row.title),
    kicker: String(row.kicker || ''),
    chips: (row.chips as string[]) || [],
    coverImage: String(row.cover_image || ''),
    intro: String(row.excerpt || ''),
    paragraphs: String(row.content || '').split('\n\n').filter(Boolean),
    linkedProductHandles: (row.product_slugs as string[]) || [],
  })) satisfies StoryArticle[];
  locations = locationRows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    cityId: String(row.city || '').toLowerCase(),
    mall: String(row.mall || ''),
    city: String(row.city || ''),
    state: String(row.region || ''),
    address: String(row.address || ''),
    timing: String(row.opening_hours || ''),
    phone: row.phone ? String(row.phone) : undefined,
    mapUrl: String(row.map_url || ''),
  })) satisfies StoreLocation[];
  for (const section of homepage.sections ?? []) sectionEnabled.set(section.section_key, section.enabled);
  if (homepage.settings?.announcements) announcements = homepage.settings.announcements;
  if (homepage.settings?.claim_ticker) claimTicker = homepage.settings.claim_ticker;
  const tabs: LegalTab[] = ['shipping', 'return-policy', 'terms-and-conditions', 'privacy-policy'];
  const nextLegal = { ...legal };
  await Promise.all(tabs.map(async (tab) => {
    try {
      const page = await api<{ title: string; sections: { heading: string; body: string }[] }>(`/legal/${tab}`);
      nextLegal[tab] = page;
    } catch {
      // Keep the static page if the API has not been seeded yet.
    }
  }));
  legal = nextLegal;
}
