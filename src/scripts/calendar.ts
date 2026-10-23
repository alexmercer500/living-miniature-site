/**
 * "Add to calendar": builds an .ics file on the device and hands it to the browser.
 * Buttons carry their event as JSON in data-ics; they only render for real dates.
 */
interface CalEvent { id: string; title: string; date: string; time: string; location: string; description: string }

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

function ics(e: CalEvent) {
  const [y, m, d] = e.date.split('-').map(Number);
  const time = /^(\d{1,2}):(\d{2})/.exec(e.time);
  let when: string[];
  if (time) {
    // Floating local time: the event happens at this wall-clock time wherever the guest is.
    const start = new Date(y, m - 1, d, +time[1], +time[2]);
    const end = new Date(start.getTime() + 3 * 36e5);
    const local = (x: Date) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
    when = [`DTSTART:${local(start)}`, `DTEND:${local(end)}`];
  } else {
    const next = new Date(y, m - 1, d + 1);
    when = [`DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`];
  }
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Living Miniature//Wedding//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.id}-${e.date}@living-miniature`,
    `DTSTAMP:${stamp(new Date())}`,
    ...when,
    `SUMMARY:${esc(e.title)}`,
    e.location && `LOCATION:${esc(e.location)}`,
    e.description && `DESCRIPTION:${esc(e.description)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

document.querySelectorAll<HTMLButtonElement>('[data-ics]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const e = JSON.parse(btn.dataset.ics!) as CalEvent;
    const url = URL.createObjectURL(new Blob([ics(e)], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${e.id}.ics` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
});
