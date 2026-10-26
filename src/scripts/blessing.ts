import { sheetDialog, openWhatsApp, store, guestName } from './sheet-dialog';

interface Blessing { text: string; from: string }

/** The last garland tag invites the guest's own blessing. It hangs there on this device
 *  only (nothing is published), and can be sent to the couple on WhatsApp. */
export function setupBlessing(root: HTMLElement) {
  const tag = root.querySelector<HTMLButtonElement>('[data-wish-own]');
  const dialog = root.querySelector<HTMLDialogElement>('#ns-blessing');
  const form = dialog?.querySelector<HTMLFormElement>('[data-blessing-form]');
  const message = tag?.querySelector<HTMLElement>('.ns-wish-message');
  if (!tag || !dialog || !form || !message || typeof dialog.showModal !== 'function') return () => {};
  const sheet = sheetDialog(dialog);
  const text = form.elements.namedItem('blessing') as HTMLTextAreaElement;
  const from = form.elements.namedItem('from') as HTMLInputElement;
  const status = form.querySelector<HTMLElement>('[data-blessing-status]')!;
  const original = { text: message.textContent ?? '', label: tag.getAttribute('aria-label') ?? '' };
  const ownLabel = tag.dataset.ownLabel ?? '';

  const show = (blessing?: Blessing) => {
    tag.toggleAttribute('data-written', Boolean(blessing));
    message.textContent = blessing ? blessing.text : ownLabel;
    tag.setAttribute('aria-label', blessing ? `${ownLabel}: ${blessing.text}` : ownLabel);
  };
  show(store.get<Blessing>('ns-blessing'));

  const open = () => {
    const saved = store.get<Blessing>('ns-blessing');
    text.value = saved?.text ?? '';
    from.value = saved?.from || guestName();
    status.textContent = '';
    sheet.open(tag);
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const blessing = { text: text.value.trim(), from: from.value.trim() };
    if (!blessing.text) return form.reportValidity();
    store.set('ns-blessing', blessing);
    show(blessing);
    if ((event.submitter as HTMLButtonElement | null)?.value === 'send') {
      openWhatsApp(form.dataset.whatsapp ?? '', [form.dataset.heading, `“${blessing.text}”`, blessing.from && `${form.dataset.from} ${blessing.from}`].filter(Boolean).join('\n'));
    }
    status.textContent = status.dataset.saved ?? '';
    setTimeout(() => sheet.close(), 1400);
  };

  tag.addEventListener('click', open);
  form.addEventListener('submit', submit);
  return () => {
    sheet.dispose();
    tag.removeEventListener('click', open);
    form.removeEventListener('submit', submit);
    tag.removeAttribute('data-written');
    message.textContent = original.text;
    tag.setAttribute('aria-label', original.label);
  };
}
