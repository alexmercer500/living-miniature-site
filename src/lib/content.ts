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
/** Directions to the one venue, from its name and address (Google Maps works on every phone). */
export const directionsUrl = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${data.venue.name}, ${data.venue.address}`)}`;

/** RSVP is a WhatsApp message composed on the guest's phone; `rsvp.url` swaps in an external form. */
export const rsvpConfigured = () => data.rsvp.enabled;
export const rsvpFormUrl = () => (/^(https?:|mailto:|tel:)/.test(data.rsvp.url) ? data.rsvp.url : undefined);

const digits = (number: string) => number.replace(/\D/g, '');
/** A wa.me link; with no number, WhatsApp asks the guest which chat to send it to. */
export const whatsappHref = (number: string, text = '') =>
  `https://wa.me/${digits(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const telHref = (number: string) => `tel:+${digits(number)}`;
/** Contacts with a real number (at least 8 digits); placeholders stay hidden. */
export const contacts = () => data.contacts.filter(c => digits(c.phone).length >= 8 || digits(c.whatsapp).length >= 8);
export const photosConfigured = () => /^https?:\/\//.test(data.photos.albumUrl);

/** `HH:MM` as a local time (7:00 pm / शाम 7:00); anything else is shown as written. */
export function formatTime(time: string, lang: Lang) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return time;
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })
    .format(new Date(2000, 0, 1, +m[1], +m[2]));
}
