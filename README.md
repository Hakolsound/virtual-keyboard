# Virtual Keyboard — Chrome Extension for Kiosk

A touch-optimised virtual keyboard that injects into any Chrome page via a content script. Built for Windows kiosk deployments where a physical keyboard is not available.

**Languages:** English · Hebrew (RTL) · Spanish · Portuguese BR · Emoji  
**Works on:** any website — no source code access required  
**Suppresses:** Windows on-screen keyboard (TabTip.exe) via registry

---

## How it works

The extension injects a React app into every Chrome tab using a Shadow DOM overlay. When the user taps any `<input>` or `<textarea>` on the host page, the keyboard slides up from the bottom. Keystrokes are dispatched as real `InputEvent`/`KeyboardEvent` on the focused element, fully compatible with React, Vue, Angular, and plain HTML forms.

```
Chrome tab (any web app)
└── Shadow DOM overlay  ← our extension
    └── Virtual Keyboard (React, iOS-style design)
        ├── Number row   (toggle with 123 key)
        ├── Letter rows  (layout switches with language)
        └── Bottom row   (⇧ · 123 · 🌐 · Space · Done · ⌫)
```

---

## Keyboard layout

```
[ q ][ w ][ e ][ r ][ t ][ y ][ u ][ i ][ o ][ p ]
  [ a ][ s ][ d ][ f ][ g ][ h ][ j ][ k ][ l ]
[ ⇧ ][ z ][ x ][ c ][ v ][ b ][ n ][ m ][ ⌫ ]
[ 123 ][  🌐  ][        space        ][ Done ]
```

- **⇧** — single tap: next char uppercase · double tap: caps lock (blue) · third tap: off
- **123** — toggle number row on/off
- **🌐** — tap to open language picker popover · swipe space bar left/right to cycle languages
- **Space** — insert space · swipe left/right to switch language · hold 3 seconds → staff settings
- **Done** — dismiss keyboard and blur the input
- **⌫** — tap to delete · hold to repeat-delete

---

## Emoji panel

Tap 🌐 and select **Emoji** to open the emoji panel:

- Horizontal paged categories (swipe or tap icons)
- Visual search bar (tap a category name to filter)
- **ABC** button returns to the previous language
- **⌫** backspace in emoji context
- Full grapheme cluster deletion (handles multi-codepoint emoji like 👨‍👩‍👧)

---

## Staff settings (PIN protected)

Settings are hidden from kiosk users and accessible only to staff.

**To open settings:** press and hold the **space bar for 3 seconds**.

A PIN entry screen appears. Enter the PIN to access keyboard settings.

> **PIN code: `3924`**

In the settings screen you can:
- Enable or disable individual languages
- At least one language must remain enabled

Settings are saved in `localStorage` and persist across page reloads.

---

## Requirements

- Windows 10 / 11 (64-bit)
- Google Chrome installed
- Node.js 18+ (for building from source)
- Administrator access (for install script)

---

## New machine setup (step by step)

Complete checklist for setting up a brand-new Windows kiosk machine from scratch.

### Step 1 — Install prerequisites

1. **Google Chrome** — download from google.com/chrome and install
2. **Node.js 18+** — download from nodejs.org (LTS version) and install  
   Verify: open Command Prompt and run `node -v`
3. **Git** — download from git-scm.com and install  
   Verify: `git --version`

### Step 2 — Clone and build the extension

Open Command Prompt (no admin needed):

```bat
git clone https://github.com/Hakolsound/virtual-keyboard.git
cd virtual-keyboard
npm install
npm run build
```

Note the full path to the `dist\` folder — you'll need it in Step 4.  
Example: `C:\Users\Kiosk\virtual-keyboard\dist`

### Step 3 — Suppress the Windows touch keyboard

Open Command Prompt **as Administrator** (right-click → Run as administrator):

```bat
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletPC" /v PreventLaunchingTouchKeyboard /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7"    /v DisableNewKeyboardExperience  /t REG_DWORD /d 1 /f
taskkill /F /IM TabTip.exe
```

### Step 4 — Load the extension in Chrome

1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist\` folder from Step 2

The extension appears in the list as **Virtual Keyboard**.

### Step 5 — Create the kiosk desktop shortcut

Right-click the Desktop → **New → Shortcut**  
Paste this as the location (replace the two placeholder paths):

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI,Translate --disable-session-crashed-bubble --hide-crash-restore-bubble --load-extension="C:\Users\Kiosk\virtual-keyboard\dist" https://your-kiosk-app.com
```

Name the shortcut **Kiosk**, then double-click it to launch.

### Step 6 — Verify everything works

1. The kiosk app opens full-screen
2. Tap any text field → keyboard slides up from the bottom
3. Type characters → they appear in the field
4. Tap **Done** → keyboard dismisses
5. Hold **space bar 3 seconds** → PIN screen appears (PIN: `3924`) → settings accessible

---

## Quick start — build & install

### 1. Clone and build

```bat
git clone https://github.com/hakolsound/virtual-keyboard.git
cd virtual-keyboard
npm install
npm run build
```

The built extension lands in `dist/`.

### 2. Load the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `dist\` folder inside this project

### 3. Suppress the Windows touch keyboard

Run in an elevated Command Prompt (as Administrator):

```bat
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletPC" /v PreventLaunchingTouchKeyboard /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7"    /v DisableNewKeyboardExperience  /t REG_DWORD /d 1 /f
taskkill /F /IM TabTip.exe
```

### 4. Launch Chrome in kiosk mode with the extension

Replace `C:\path\to\dist` with the actual path to the `dist\` folder.

```bat
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TranslateUI,Translate ^
  --disable-session-crashed-bubble ^
  --hide-crash-restore-bubble ^
  --load-extension="C:\path\to\dist" ^
  https://your-kiosk-app.com
```

---

## Updating the extension

A convenience script is included. From the project root in PowerShell or Command Prompt:

```bat
.\update.bat
```

This runs `git pull` + `npm run build` and pauses so you can review the output. After it completes, go to `chrome://extensions` and click the **reload** icon on the Virtual Keyboard card.

---

## Development workflow

```bat
npm run dev       # watch mode — rebuilds on every file save
```

After a rebuild, go to `chrome://extensions` and click the **reload** icon on the Virtual Keyboard card.

---

## Project structure

```
src/
├── content.ts                  # Extension entry: Shadow DOM mount + autofill suppression
├── dispatcher.ts               # Fires real DOM events on host inputs (React-compatible)
└── keyboard/
    ├── App.tsx                 # Root: SettingsProvider > KeyboardProvider
    ├── context/
    │   ├── KeyboardContext.tsx # Active target, value, shift, focus/blur detection
    │   └── SettingsContext.tsx # Enabled languages, localStorage persistence
    ├── layouts/
    │   ├── types.ts
    │   ├── en.ts  he.ts  es.ts  pt-br.ts  emoji.ts
    │   └── index.ts
    └── components/
        ├── VirtualKeyboard.tsx # Slide animation, globe popover, settings modal host
        ├── KeyboardHeader.tsx  # (empty — no visible header)
        ├── KeyRow.tsx
        ├── Key.tsx             # All pointer handling, press feedback, swipe, hold timers
        ├── EmojiPanel.tsx      # Paged categories, search, ABC/⌫ bar
        └── SettingsModal.tsx   # PIN screen + language toggles
```

---

## Adding a new language

1. Create `src/keyboard/layouts/xx.ts` following the same structure as `en.ts`
2. Add it to `src/keyboard/layouts/index.ts` — `LAYOUTS`, `ALL_LANGUAGE_CODES`, `LANGUAGE_LABELS`
3. Add its display name to `LANGUAGE_NAMES` in `VirtualKeyboard.tsx` and `SettingsModal.tsx`
4. Run `npm run build`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Windows keyboard still appears | Set registry keys, restart Chrome. Run `taskkill /F /IM TabTip.exe` manually if needed. |
| Keyboard does not appear on a site | Site may use `contenteditable` or cross-origin iframes — not yet supported. |
| Extension not loading | Confirm `dist\` contains `manifest.json` and `content.js`. Reload extension at `chrome://extensions`. |
| Keys appear but value doesn't change | Host app may use a non-standard input binding. The extension uses the native `HTMLInputElement.prototype` setter. Open an issue with details. |
| Settings PIN forgotten | PIN is `3924`. Access by holding the space bar for 3 seconds. |

---

## License

MIT
