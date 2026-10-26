/** A short physical "crack" for moments like breaking the wax seal. Best effort only:
 *  Android uses the Vibration API (after the guest has interacted, as browsers require);
 *  iOS 18+ has no such API, but toggling a native switch plays the system haptic. */
let iosSwitch: HTMLLabelElement | undefined;

export function sealHaptic() {
  const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
  if (typeof nav.vibrate === 'function') {
    if (nav.userActivation?.hasBeenActive !== false) nav.vibrate([14, 45, 22]);
    return;
  }
  if (!/iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document)) return;
  if (!iosSwitch) {
    iosSwitch = document.createElement('label');
    iosSwitch.setAttribute('aria-hidden', 'true');
    iosSwitch.style.cssText = 'position:fixed;left:-99px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    iosSwitch.append(input);
    document.body.append(iosSwitch);
  }
  iosSwitch.click();
}
