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

// IntersectionObserver fires when an input becomes visible in the viewport.
// This handles slide/carousel SPAs where inputs exist in the DOM but are hidden
// until their slide transitions in — timeout retries can't catch that.
let io: IntersectionObserver | null = null

function getIntersectionObserver(): IntersectionObserver {
  if (io) return io
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const el = entry.target as HTMLInputElement
      if (!isTextInput(el)) continue
      if (el.disabled || el.readOnly) continue
      // Only auto-focus if no text input is currently active
      if (isTextInput(document.activeElement as Element)) continue
      el.focus()
      // Re-apply focus for up to 8 frames in case the SPA steals it back
      let frames = 8
      const retry = () => {
        if (!el.isConnected || frames-- <= 0) return
        if (isTextInput(document.activeElement as Element) && document.activeElement !== el) return
        if (document.activeElement !== el) el.focus()
        requestAnimationFrame(retry)
      }
      requestAnimationFrame(retry)
    }
  }, { threshold: 0.5 })  // fires when input is at least 50% visible
  return io
}

function watchInput(el: HTMLInputElement) {
  suppressAutofill(el)
  getIntersectionObserver().observe(el)
}

function setupInputWatcher() {
  document.querySelectorAll<HTMLInputElement>('input').forEach(watchInput)

  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node instanceof HTMLInputElement) {
          watchInput(node)
        } else if (node instanceof HTMLElement) {
          node.querySelectorAll<HTMLInputElement>('input').forEach(watchInput)
        }
      })
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
