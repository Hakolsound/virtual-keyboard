/**
 * Chrome Extension content script.
 * Mounts the virtual keyboard React app inside a Shadow DOM node
 * so it is fully isolated from the host page's styles and scripts.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './keyboard/App'
import styles from './keyboard/keyboard.css?inline'

// Bail if already injected (e.g. hot reload / duplicate injection)
if (!document.getElementById('vkb-shadow-host')) {
  mountKeyboard()
}

function mountKeyboard() {
  // ── Shadow host ────────────────────────────────────────────────────────────
  const host = document.createElement('div')
  host.id = 'vkb-shadow-host'

  // The host itself is fixed-positioned and pointer-events:none so it never
  // intercepts touches meant for the page. Inner elements opt back in.
  host.style.cssText = [
    'position: fixed',
    'top: 0',
    'bottom: 0',
    'left: 0',
    'right: 0',
    'z-index: 2147483647',
    'pointer-events: none',
  ].join(';')

  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  // ── Inject compiled Tailwind CSS ───────────────────────────────────────────
  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  shadow.appendChild(styleEl)

  // ── Mount point — re-enables pointer events for the keyboard itself ────────
  const mountEl = document.createElement('div')
  mountEl.style.cssText = [
    'position: fixed',
    'bottom: 0',
    'left: 0',
    'right: 0',
    'pointer-events: auto',
  ].join(';')
  shadow.appendChild(mountEl)

  // ── Suppress autofill + auto-focus new inputs on stage advance ───────────
  setupInputWatcher()

  // ── React root ─────────────────────────────────────────────────────────────
  const root = createRoot(mountEl)
  root.render(React.createElement(App))

  // ── Viewport meta — prevent Chrome zoom on input focus ────────────────────
  ensureViewportMeta()
}

function isTextInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    return ['text', 'search', 'email', 'url', 'tel', 'password', ''].includes(el.type.toLowerCase())
  }
  return false
}

function suppressAutofill(el: HTMLInputElement) {
  const type = el.type.toLowerCase()
  if (type === 'password') {
    el.setAttribute('autocomplete', 'new-password')
  } else {
    el.setAttribute('autocomplete', 'off')
  }
  el.setAttribute('data-lpignore', 'true')
  el.setAttribute('data-form-type', 'other')
  if (el.name && !el.dataset.vkbOrigName) {
    el.dataset.vkbOrigName = el.name
    el.name = el.name + '_vkb_' + Math.random().toString(36).slice(2, 7)
  }
}

function persistFocus(el: HTMLInputElement, rAfAttempts = 8) {
  // Called after el.focus() — re-applies focus on the next frame if the app stole it.
  // Stops once the element is confirmed focused OR another text input takes over.
  if (rAfAttempts <= 0) return
  requestAnimationFrame(() => {
    if (!el.isConnected) return
    if (isTextInput(document.activeElement as Element) && document.activeElement !== el) return
    if (document.activeElement !== el) {
      el.focus()
    }
    persistFocus(el, rAfAttempts - 1)
  })
}

function tryAutoFocus(el: HTMLInputElement, attempt = 0) {
  if (!isTextInput(el)) return
  if (el.disabled || el.readOnly) return
  setTimeout(() => {
    // Only skip if the user is actively typing in another text field
    if (isTextInput(document.activeElement as Element)) return
    // Element was detached (React remounted it) — find the replacement
    if (!el.isConnected) {
      if (attempt < 4) {
        const replacement = document.querySelector<HTMLInputElement>('input')
        if (replacement) tryAutoFocus(replacement, attempt + 1)
      }
      return
    }
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      if (attempt < 4) tryAutoFocus(el, attempt + 1)
      return
    }
    el.focus()
    persistFocus(el)
  }, 150 + attempt * 200)
}

function setupInputWatcher() {
  document.querySelectorAll<HTMLInputElement>('input').forEach(suppressAutofill)

  // Auto-focus the first visible input already on the page
  const initial = document.querySelector<HTMLInputElement>('input')
  if (initial) tryAutoFocus(initial)

  let pendingFocus: HTMLInputElement | null = null

  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node instanceof HTMLInputElement) {
          suppressAutofill(node)
          if (!pendingFocus) pendingFocus = node
        } else if (node instanceof HTMLElement) {
          node.querySelectorAll<HTMLInputElement>('input').forEach(suppressAutofill)
          if (!pendingFocus) {
            const first = node.querySelector<HTMLInputElement>('input')
            if (first) pendingFocus = first
          }
        }
      })
    }
    // One auto-focus attempt per mutation batch
    if (pendingFocus) {
      tryAutoFocus(pendingFocus)
      pendingFocus = null
    }
  })
  mo.observe(document.body, { childList: true, subtree: true })
}

function ensureViewportMeta() {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'viewport'
    document.head.appendChild(meta)
  }
  if (!meta.content.includes('maximum-scale')) {
    meta.content = meta.content
      ? meta.content + ', maximum-scale=1, user-scalable=no'
      : 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
  }
}
