import { sheetDialog, openWhatsApp, store, guestName } from './sheet-dialog';

interface Draft { attend: string; name: string; guests: number; events: string[]; note: string }
interface Labels { heading: string; yes: string; no: string; guests: string; events: string; note: string }

/** RSVP form → a ready-written WhatsApp message. The draft stays on this device only. */
export function setupRsvp(root: HTMLElement) {
  const trigger = root.querySelector<HTMLAnchorElement>('[data-rsvp-open]');
  const dialog = root.querySelector<HTMLDialogElement>('#ns-rsvp');
  const form = dialog?.querySelector<HTMLFormElement>('[data-rsvp-form]');
  if (!trigger || !dialog || !form || typeof dialog.showModal !== 'function') return () => {};
  const sheet = sheetDialog(dialog);
  const labels = JSON.parse(form.dataset.labels ?? '{}') as Labels;
  const coming = form.querySelector<HTMLElement>('[data-rsvp-coming]')!;
  const guests = form.elements.namedItem('guests') as HTMLInputElement;
  const status = form.querySelector<HTMLElement>('[data-rsvp-status]')!;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | RadioNodeList | null;

  const read = (): Draft => ({
    attend: (field('attend') as RadioNodeList).value || 'yes',
    name: (field('name') as HTMLInputElement).value.trim(),
    guests: Math.min(20, Math.max(1, Math.round(+guests.value) || 1)),
    events: [...form.querySelectorAll<HTMLInputElement>('input[name="events"]:checked')].map(box => box.value),
    note: (field('note') as HTMLTextAreaElement).value.trim(),
  });
  const write = (draft: Partial<Draft>) => {
    if (draft.attend) (field('attend') as RadioNodeList).value = draft.attend;
    if (draft.name) (field('name') as HTMLInputElement).value = draft.name;
    if (draft.guests) guests.value = String(draft.guests);
    if (draft.events) form.querySelectorAll<HTMLInputElement>('input[name="events"]').forEach(box => { box.checked = draft.events!.includes(box.value); });
    if (draft.note) (field('note') as HTMLTextAreaElement).value = draft.note;
  };
  const sync = () => { coming.hidden = read().attend === 'no'; };

  const message = (d: Draft) => [
    labels.heading,
    d.name,
    d.attend === 'no' ? `✗ ${labels.no}` : `✓ ${labels.yes}`,
    ...(d.attend === 'no' ? [] : [`${labels.guests}: ${d.guests}`, ...(d.events.length ? [`${labels.events}: ${d.events.join(', ')}`] : [])]),
    ...(d.note ? [`${labels.note}: ${d.note}`] : []),
  ].join('\n');

  const open = (event: Event) => {
    event.preventDefault();
    const saved = store.get<Draft>('ns-rsvp');
    write(saved ?? { name: guestName() });
    sync();
    status.textContent = '';
    sheet.open(trigger);
  };
  const step = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-step]');
    if (!button) return;
    guests.value = String(Math.min(20, Math.max(1, (+guests.value || 1) + Number(button.dataset.step))));
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const draft = read();
    if (!draft.name) return form.reportValidity();
    store.set('ns-rsvp', draft);
    openWhatsApp(form.dataset.whatsapp ?? '', message(draft));
    status.textContent = status.dataset.sent ?? '';
  };

  trigger.addEventListener('click', open);
  form.addEventListener('change', sync);
  form.addEventListener('click', step);
  form.addEventListener('submit', submit);
  return () => {
    sheet.dispose();
    trigger.removeEventListener('click', open);
    form.removeEventListener('change', sync);
    form.removeEventListener('click', step);
    form.removeEventListener('submit', submit);
  };
}
