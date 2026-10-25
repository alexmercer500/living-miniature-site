import data from '../data/site-content.json';

export type Lang = 'en' | 'hi';
export type Localized = { en: string; hi: string };
export type UiKey = keyof typeof data.ui.en;

export const content = data;
export const langs: Lang[] = ['en', 'hi'];

export const loc = (value: Localized, lang: Lang) => value[lang];
export const t = (lang: Lang, key: UiKey) => data.ui[lang][key];

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Locale-aware internal URL: `/invitation` -> `/hi/invitation` for Hindi. */
export function href(lang: Lang, path = '/') {
  const prefix = lang === 'hi' ? '/hi' : '';
  const clean = path === '/' ? '/' : path.replace(/\/$/, '');
  return `${base}${prefix}${clean === '/' && prefix ? '/' : clean}`;
}

/** Royal Heritage is the secondary experience; href itself stays locale-only. */
export const royalHref = (lang: Lang, path = '/') => href(lang, `/royal${path === '/' ? '' : path}`);

/** Returns a Date only for real ISO dates; placeholders like `YYYY-MM-DD` return null. */
export function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso: string, lang: Lang, withWeekday = false) {
  const d = parseDate(iso);
  if (!d) return null;
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: withWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export const initials = () =>
  [data.couple.partnerOne, data.couple.partnerTwo].map((n) => n.trim().charAt(0).toUpperCase());

export const mapConfigured = () => /^https?:\/\//.test(data.venue.mapUrl);
export const rsvpConfigured = () => data.rsvp.enabled && /^(https?:|mailto:|tel:)/.test(data.rsvp.url);
