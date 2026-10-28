import type { ImageMetadata } from 'astro';
import { href, type Lang } from './content';
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
import lakeHaldi from '../assets/rajasthan/lake-city/events/haldi.png';
import lakeMehndi from '../assets/rajasthan/lake-city/events/mehndi.png';
import lakeSangeet from '../assets/rajasthan/lake-city/events/sangeet.png';
import lakeWedding from '../assets/rajasthan/lake-city/events/wedding.png';
import lakeReception from '../assets/rajasthan/lake-city/events/reception.png';

export type ThemeId = 'nature' | 'amber-fort' | 'lake-city';

/** The invitation keepsake a theme opens in place of the paper envelope: its photo cut into
 *  layers (scripts/cut-invitation-objects.mjs) and their geometry, in layer pixels. */
export type InvitationModel =
  | { kind: 'envelope'; geometry: typeof amberGeometry; layers: { flap: ImageMetadata; body: ImageMetadata; seal: ImageMetadata } }
  | { kind: 'scroll'; geometry: typeof lakeGeometry; layers: { roll: ImageMetadata; ribbon: ImageMetadata } };
export type ThemeCopy = typeof natureCopy.en;

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
  },
  'amber-fort': {
    route: '/amber-fort',
    label: 'Amber Fort Romance',
    description: 'Love stories against timeless forts.',
    themeColor: '#6C2632',
    assets: amberAssets,
    invitationModel: { kind: 'envelope', geometry: amberGeometry, layers: { flap: amberFlap, body: amberBody, seal: amberSeal } } as InvitationModel,
    eventAssets: amberEventAssets,
  },
  'lake-city': {
    route: '/lake-city',
    label: 'Lake City Elegance',
    description: 'Serene waters, palaces and a timeless journey.',
    themeColor: '#17364A',
    assets: lakeAssets,
    invitationModel: { kind: 'scroll', geometry: lakeGeometry, layers: { roll: lakeRoll, ribbon: lakeRibbon } } as InvitationModel,
    eventAssets: lakeEventAssets,
  },
} as const;

const overrides: Record<Exclude<ThemeId, 'nature'>, Record<Lang, Partial<ThemeCopy>>> = {
  'amber-fort': {
    en: { chapter: 'Amber Fort Romance', heroOne: 'Love stories', heroTwo: 'against timeless forts.' },
    hi: { chapter: 'Amber Fort Romance', heroOne: 'Love stories', heroTwo: 'against timeless forts.' },
  },
  'lake-city': {
    en: { chapter: 'Lake City Elegance', heroOne: 'Serene waters.', heroTwo: 'A timeless journey.' },
    hi: { chapter: 'Lake City Elegance', heroOne: 'Serene waters.', heroTwo: 'A timeless journey.' },
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
