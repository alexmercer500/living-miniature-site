/** Shared behaviour for the parchment form dialogs (RSVP, blessing): open from a trigger,
 *  close on the × button, Escape or a tap outside, and give focus back to the trigger. */
export function sheetDialog(dialog: HTMLDialogElement) {
  let opener: HTMLElement | null = null;
  const close = () => { if (dialog.open) dialog.close(); };
  const open = (from?: HTMLElement) => {
    opener = from ?? (document.activeElement as HTMLElement | null);
    if (!dialog.open) dialog.showModal();
  };
  const outside = (event: MouseEvent) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  };
  const closer = dialog.querySelector<HTMLButtonElement>('[data-sheet-close]');
  const restore = () => opener?.focus({ preventScroll: true });
  closer?.addEventListener('click', close);
  dialog.addEventListener('click', outside);
  dialog.addEventListener('close', restore);
  return {
    open, close,
    dispose() {
      close();
      closer?.removeEventListener('click', close);
      dialog.removeEventListener('click', outside);
      dialog.removeEventListener('close', restore);
    },
  };
}

/** Opens WhatsApp with a message. A new tab keeps the invitation open behind it. */
export function openWhatsApp(number: string, text: string) {
  const url = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  // (`noopener` would make window.open return null, hiding whether a popup blocker stepped in.)
  const tab = window.open(url, '_blank');
  if (tab) tab.opener = null; else location.href = url;
}

export const store = {
  get<T>(key: string): T | undefined {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : undefined; } catch { return undefined; }
  },
  set(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: nothing is kept */ }
  },
};

/** The family name from a personal link (`?to=`), set by the inline script on the home page. */
export const guestName = () => (window as Window & { nsGuest?: string }).nsGuest ?? '';
