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
    'inset: 0',
    'z-index: 2147483647',
    'pointer-events: none',
    'overflow: hidden',
  ].join(';')

  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  // ── Inject compiled Tailwind CSS ───────────────────────────────────────────
  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  shadow.appendChild(styleEl)

  // ── Mount point — re-enables pointer events for the keyboard itself ────────
  const mountEl = document.createElement('div')
  mountEl.style.cssText = 'pointer-events: auto; position: absolute; bottom: 0; left: 0; right: 0;'
  shadow.appendChild(mountEl)

  // ── React root ─────────────────────────────────────────────────────────────
  const root = createRoot(mountEl)
  root.render(React.createElement(App))

  // ── Viewport meta — prevent Chrome zoom on input focus ────────────────────
  ensureViewportMeta()
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
