import type { ImageMetadata } from 'astro';
import { content, href, loc, type Lang, type Localized } from './content';
import { natureCopy } from './nature-content';
import { landscapes, natureEvents, eventFallback } from './nature-assets';
import amberHeroMobile from '../assets/rajasthan/amber-fort/hero-mobile.png';
import amberHeroDesktop from '../assets/rajasthan/amber-fort/hero-desktop.png';
import amberJourneyMobile from '../assets/rajasthan/amber-fort/journey-mobile.png';
import amberJourneyDesktop from '../assets/rajasthan/amber-fort/journey-desktop.png';
import amberVenueMobile from '../assets/rajasthan/amber-fort/venue-mobile.png';
import amberVenueDesktop from '../assets/rajasthan/amber-fort/venue-desktop.png';
import amberClosingMobile from '../assets/rajasthan/amber-fort/closing-mobile.png';
import amberClosingDesktop from '../assets/rajasthan/amber-fort/closing-desktop.png';
import amberWishesMobile from '../assets/rajasthan/amber-fort/wishes-mobile.png';
import amberWishesDesktop from '../assets/rajasthan/amber-fort/wishes-desktop.png';
import amberFlap from '../assets/rajasthan/amber-fort/object/flap.png';
import amberBody from '../assets/rajasthan/amber-fort/object/body.png';
import amberSeal from '../assets/rajasthan/amber-fort/object/seal.png';
import amberGeometry from '../assets/rajasthan/amber-fort/object/geometry.json';
import amberModelGeometry from '../assets/rajasthan/amber-fort/model/geometry.json';
import amberHaldi from '../assets/rajasthan/amber-fort/events/haldi.png';
import amberMehndi from '../assets/rajasthan/amber-fort/events/mehndi.png';
import amberSangeet from '../assets/rajasthan/amber-fort/events/sangeet.png';
import amberWedding from '../assets/rajasthan/amber-fort/events/wedding.png';
import amberReception from '../assets/rajasthan/amber-fort/events/reception.png';
import lakeHeroMobile from '../assets/rajasthan/lake-city/hero-mobile.png';
import lakeHeroDesktop from '../assets/rajasthan/lake-city/hero-desktop.png';
import lakeJourneyMobile from '../assets/rajasthan/lake-city/journey-mobile.png';
import lakeJourneyDesktop from '../assets/rajasthan/lake-city/journey-desktop.png';
import lakeVenueMobile from '../assets/rajasthan/lake-city/venue-mobile.png';
import lakeVenueDesktop from '../assets/rajasthan/lake-city/venue-desktop.png';
import lakeClosingMobile from '../assets/rajasthan/lake-city/closing-mobile.png';
import lakeClosingDesktop from '../assets/rajasthan/lake-city/closing-desktop.png';
import lakeWishesMobile from '../assets/rajasthan/lake-city/wishes-mobile.png';
import lakeWishesDesktop from '../assets/rajasthan/lake-city/wishes-desktop.png';
import lakeRoll from '../assets/rajasthan/lake-city/object/roll.png';
import lakeRibbon from '../assets/rajasthan/lake-city/object/ribbon.png';
import lakeGeometry from '../assets/rajasthan/lake-city/object/geometry.json';
import lakeModelGeometry from '../assets/rajasthan/lake-city/model/geometry.json';
import lakeHaldi from '../assets/rajasthan/lake-city/events/haldi.png';
import lakeMehndi from '../assets/rajasthan/lake-city/events/mehndi.png';
import lakeSangeet from '../assets/rajasthan/lake-city/events/sangeet.png';
import lakeWedding from '../assets/rajasthan/lake-city/events/wedding.png';
import lakeReception from '../assets/rajasthan/lake-city/events/reception.png';
// The printed invitation cards, one per themed site (the nature root keeps the HTML invitation).
import royalRatneshInvitation from '../assets/royal-ratnesh-pallavi-invitation.png';
import royalWeddingByTheLake from '../assets/royal-wedding-by-the-lake.png';

export type ThemeId = 'nature' | 'amber-fort' | 'lake-city';
/** Which of the two names is written first on this site (the bride's side puts her first). */
export type CoupleFirst = 'one' | 'two';
/** A per-theme change to one celebration, keyed by its id in site-content.json. */
export type EventOverride = { date?: string; venueName?: Localized };

/** The invitation keepsake a theme opens in place of the paper envelope: its 3D model's parts,
 *  rendered as layers (scripts/render-keepsake-standins.mjs), and their geometry in layer pixels. */
export type InvitationModel =
  | { kind: 'envelope'; geometry: typeof amberGeometry; layers: { flap: ImageMetadata; body: ImageMetadata; seal: ImageMetadata }; model3d?: KeepsakeModel3d<typeof amberModelGeometry> }
  | { kind: 'scroll'; geometry: typeof lakeGeometry; layers: { roll: ImageMetadata; ribbon: ImageMetadata }; model3d?: KeepsakeModel3d<typeof lakeModelGeometry> };
/** A keepsake's 3D model (scripts/envelope-model.ts, scroll-model.ts): its geometry and textures
 *  by file name (scripts/build-envelope-model.mjs, build-scroll-model.mjs). Its rendered layers
 *  are its stand-in and fallback. */
export type KeepsakeModel3d<G> = { geometry: G; textures: Record<string, ImageMetadata> };
export type ThemeCopy = typeof natureCopy.en;

const byName = (images: Record<string, ImageMetadata>) => Object.fromEntries(Object.entries(images)
  .map(([path, image]) => [path.slice(path.lastIndexOf('/') + 1, -'.webp'.length), image]));
const amberModelTextures = byName(import.meta.glob<ImageMetadata>('../assets/rajasthan/amber-fort/model/*.webp', { eager: true, import: 'default' }));
const lakeModelTextures = byName(import.meta.glob<ImageMetadata>('../assets/rajasthan/lake-city/model/*.webp', { eager: true, import: 'default' }));

const amberAssets = {
  ...landscapes,
  hero: { mobile: amberHeroMobile, desktop: amberHeroDesktop },
  journey: { mobile: amberJourneyMobile, desktop: amberJourneyDesktop },
  venue: { mobile: amberVenueMobile, desktop: amberVenueDesktop },
  // No letter painting of its own: the envelope rests on the venue terrace (open floor, fort view).
  letter: { mobile: amberVenueMobile, desktop: amberVenueDesktop },
  closing: { mobile: amberClosingMobile, desktop: amberClosingDesktop },
  wishes: { mobile: amberWishesMobile, desktop: amberWishesDesktop },
};
const lakeAssets = {
  ...landscapes,
  hero: { mobile: lakeHeroMobile, desktop: lakeHeroDesktop },
  journey: { mobile: lakeJourneyMobile, desktop: lakeJourneyDesktop },
  venue: { mobile: lakeVenueMobile, desktop: lakeVenueDesktop },
  // No letter painting of its own: the scroll rests on the lakeside terrace.
  letter: { mobile: lakeVenueMobile, desktop: lakeVenueDesktop },
  closing: { mobile: lakeClosingMobile, desktop: lakeClosingDesktop },
  wishes: { mobile: lakeWishesMobile, desktop: lakeWishesDesktop },
};
const amberEventAssets = {
  ...natureEvents,
  haldi: amberHaldi,
  mehndi: amberMehndi,
  sangeet: amberSangeet,
  reception: amberReception,
  wedding: amberWedding,
  'floral-courtyard': amberHaldi,
  'lantern-garden': amberSangeet,
  'mandap-courtyard': amberWedding,
};
const lakeEventAssets = {
  ...natureEvents,
  haldi: lakeHaldi,
  mehndi: lakeMehndi,
  sangeet: lakeSangeet,
  reception: lakeReception,
  wedding: lakeWedding,
  'floral-courtyard': lakeHaldi,
  'lantern-garden': lakeSangeet,
  'mandap-courtyard': lakeWedding,
};

/** Theme registry for the original nature story and the two Rajasthan variants. */
export const themeConfig = {
  nature: {
    route: '/',
    label: 'Nature & Stories',
    description: 'A living miniature wedding invitation.',
    themeColor: '#213B32',
    assets: landscapes,
    invitationModel: null as InvitationModel | null,
    eventAssets: natureEvents,
    coupleFirst: 'one' as CoupleFirst,
    invitationCard: null as ImageMetadata | null,
    events: {} as Record<string, EventOverride>,
    venueLocationIds: undefined as readonly string[] | undefined,
  },
  'amber-fort': {
    route: '/amber-fort',
    label: 'Amber Fort Romance',
    description: 'Love stories against timeless forts.',
    themeColor: '#6C2632',
    assets: amberAssets,
    invitationModel: { kind: 'envelope', geometry: amberGeometry, layers: { flap: amberFlap, body: amberBody, seal: amberSeal }, model3d: { geometry: amberModelGeometry, textures: amberModelTextures } } as InvitationModel,
    eventAssets: amberEventAssets,
    coupleFirst: 'one' as CoupleFirst,
    invitationCard: royalRatneshInvitation as ImageMetadata | null,
    events: {} as Record<string, EventOverride>,
    venueLocationIds: undefined as readonly string[] | undefined,
  },
  'lake-city': {
    route: '/lake-city',
    label: 'Lake City Elegance',
    description: 'Serene waters, palaces and a timeless journey.',
    themeColor: '#17364A',
    assets: lakeAssets,
    invitationModel: { kind: 'scroll', geometry: lakeGeometry, layers: { roll: lakeRoll, ribbon: lakeRibbon }, model3d: { geometry: lakeModelGeometry, textures: lakeModelTextures } } as InvitationModel,
    eventAssets: lakeEventAssets,
    // The bride's side: Pallavi first, her celebrations end on the 25th (the reception moves from
    // the 26th to the wedding day, with no venue of its own), and only the wedding venue is shown.
    coupleFirst: 'two' as CoupleFirst,
    invitationCard: royalWeddingByTheLake as ImageMetadata | null,
    events: { 'event-four': { date: '2026-11-25', venueName: { en: '', hi: '' } } } as Record<string, EventOverride>,
    venueLocationIds: ['wedding'] as readonly string[],
  },
} as const;

const overrides: Record<Exclude<ThemeId, 'nature'>, Record<Lang, Partial<ThemeCopy>>> = {
  'amber-fort': {
    en: {
      chapter: 'A Royal Welcome', welcome: 'A Royal Welcome', heroOne: 'From this moment,', heroTwo: 'a lifetime together.',
      dateLine: '23–26 November 2026', roots: 'Our beginnings',
      rootsBody: 'The love, traditions, and blessings that brought us to this beautiful day.',
    },
    hi: {
      chapter: 'शाही स्वागत', welcome: 'शाही स्वागत', heroOne: 'इस पल से,', heroTwo: 'उम्र भर का साथ।',
      dateLine: '23–26 नवम्बर 2026', roots: 'हमारी शुरुआत',
      rootsBody: 'वह प्रेम, परंपराएँ और आशीर्वाद जो हमें इस सुंदर दिन तक लाए।',
    },
  },
  'lake-city': {
    en: { chapter: 'Lake City Elegance', heroOne: 'Serene waters.', heroTwo: 'A timeless journey.', dateLine: '23–25 November 2026', venueLine: 'One location. One beautiful celebration.', venuePreviewNote: 'Wedding and fera at Dhancha Bhavan.' },
    hi: { chapter: 'Lake City Elegance', heroOne: 'Serene waters.', heroTwo: 'A timeless journey.', dateLine: '23–25 नवम्बर 2026', venueLine: 'एक स्थल। एक सुंदर उत्सव।', venuePreviewNote: 'विवाह एवं फेरे Dhancha Bhavan में।' },
  },
};

export function themeCopy(theme: ThemeId, lang: Lang): ThemeCopy {
  return theme === 'nature' ? natureCopy[lang] : { ...natureCopy[lang], ...overrides[theme][lang] };
}

export function themeHref(lang: Lang, theme: ThemeId, path = '/') {
  const route = themeConfig[theme].route === '/' ? '' : themeConfig[theme].route;
  const suffix = !path || path === '/' ? '' : `/${path.replace(/^\/+/, '')}`;
  return href(lang, `${route}${suffix}` || '/');
}

export const themeEventFallback = eventFallback;

/** The joiner the couple's two names are written with, per language. */
const coupleJoin = (lang: Lang) => (lang === 'hi' ? ' एवं ' : ' & ');

/** The couple's two names, in this site's order (the bride's side writes her name first). */
export function coupleNames(lang: Lang, theme: ThemeId): [string, string] {
  const [one, two] = loc(content.couple.displayName, lang).split(coupleJoin(lang)) as [string, string];
  return themeConfig[theme].coupleFirst === 'two' && two ? [two, one] : [one, two];
}

/** The couple, written as one line in this site's name order. */
export function coupleDisplay(lang: Lang, theme: ThemeId) {
  return coupleNames(lang, theme).join(coupleJoin(lang));
}

/** The two initials of the monogram, in this site's name order. */
export function coupleInitials(theme: ThemeId): [string, string] {
  return coupleNames('en', theme).map(name => name.trim().charAt(0).toUpperCase()) as [string, string];
}

/** The celebrations as this site shows them (a theme may move or re-place an event). */
export function eventsFor(theme: ThemeId) {
  const changes = themeConfig[theme].events;
  return content.events.map(event => (changes[event.id] ? { ...event, ...changes[event.id] } : event));
}

/** The venues as this site shows them (a theme may keep only some of them). */
export function locationsFor(theme: ThemeId) {
  const locations = content.venue.locations ?? [];
  const ids = themeConfig[theme].venueLocationIds;
  return ids ? locations.filter(location => ids.includes(location.id)) : locations;
}
