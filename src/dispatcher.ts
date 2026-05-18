/**
 * Dispatches a value update to a host-page input in a way that triggers
 * React's synthetic onChange, plain DOM listeners, and any other framework.
 *
 * The native prototype setter trick is required because React overrides the
 * instance-level value property. Calling the prototype setter bypasses React's
 * wrapper and fires a real property change, which React's event delegation then
 * picks up via the dispatched 'input' event.
 */

type TextTarget = HTMLInputElement | HTMLTextAreaElement

const nativeInputSetter    = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,    'value')?.set
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set

export function dispatchToTarget(
  el:        TextTarget,
  newValue:  string,
  cursorPos: number,
): void {
  const setter = el instanceof HTMLTextAreaElement ? nativeTextareaSetter : nativeInputSetter
  if (!setter) {
    // Fallback: execCommand (deprecated but Chrome still supports it)
    el.focus()
    el.select()
    document.execCommand('insertText', false, newValue)
    return
  }

  setter.call(el, newValue)

  // Dispatch input + change so React, Vue, and vanilla handlers all fire
  el.dispatchEvent(new Event('input',  { bubbles: true, cancelable: true }))
  el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

  // Restore cursor position (best effort — host app may override)
  try {
    el.setSelectionRange(cursorPos, cursorPos)
  } catch {
    // Some input types don't support selectionRange (e.g. number, email)
  }
}
