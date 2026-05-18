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
    └── Virtual Keyboard (React + Tailwind)
        ├── Language chips  (EN · עב · ES · PT · 😀)
        ├── Number row
        ├── Letter rows  (layout switches with language)
        ├── Bottom row   (Shift · ' · - · . · Space · Clear · ⌫ · Done)
        └── Settings modal  (toggle languages on/off)
```

---

## Requirements

- Windows 10 / 11 (64-bit)
- Google Chrome installed
- Node.js 18+ (for building from source)
- Administrator access (for install script)

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

### 2. Edit the kiosk URL

Open `scripts\install.bat` in Notepad and change this line to your kiosk app URL:

```bat
set "TARGET_URL=https://your-kiosk-app.com"
```

### 3. Run the installer (as Administrator)

Right-click `scripts\install.bat` → **Run as administrator**

The script will:
- Disable the Windows touch keyboard (registry + kill TabTip.exe)
- Register a startup task to keep TabTip suppressed after reboot
- Create a **Kiosk** shortcut on the Desktop that launches Chrome with the extension loaded

### 4. Launch

Double-click the **Kiosk** shortcut on the Desktop.

Chrome starts in kiosk mode with the virtual keyboard extension active.

---

## Manual installation (step by step)

Use this if you prefer not to run the installer script, or want to understand each step.

### Step 1 — Build the extension

```bat
npm install
npm run build
```

Output: `dist\content.js`, `dist\manifest.json`, `dist\icons\`

### Step 2 — Suppress the Windows touch keyboard

Open **Registry Editor** (`regedit.exe`) as Administrator and create these values:

| Path | Value name | Type | Data |
|------|-----------|------|------|
| `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\TabletPC` | `PreventLaunchingTouchKeyboard` | DWORD | `1` |
| `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\TabletTip\1.7` | `DisableNewKeyboardExperience` | DWORD | `1` |

Or run in an elevated Command Prompt:

```bat
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletPC" /v PreventLaunchingTouchKeyboard /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7"    /v DisableNewKeyboardExperience  /t REG_DWORD /d 1 /f
taskkill /F /IM TabTip.exe
```

### Step 3 — Load the extension in Chrome

Open Chrome and go to:

```
chrome://extensions
```

1. Enable **Developer mode** (toggle in the top-right corner)
2. Click **Load unpacked**
3. Select the `dist\` folder inside this project
4. The extension appears in the list as **Virtual Keyboard**

> For a permanent kiosk installation, skip the UI and use the command-line flag instead (see Step 4).

### Step 4 — Launch Chrome in kiosk mode with the extension

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

To create a Desktop shortcut manually:
1. Right-click Desktop → **New → Shortcut**
2. Paste the full command above as the location
3. Name it **Kiosk**

### Step 5 — Verify it works

1. Open any page with a text input
2. Tap (or click) the input field
3. The virtual keyboard should slide up from the bottom
4. Type a few characters — they appear in the input
5. Tap **Done** — the keyboard dismisses

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
├── content.ts                  # Extension entry: Shadow DOM mount
├── dispatcher.ts               # Fires real DOM events on host inputs
└── keyboard/
    ├── App.tsx                 # Root: SettingsProvider > KeyboardProvider
    ├── keyboard.css            # Tailwind base — injected into Shadow DOM
    ├── context/
    │   ├── KeyboardContext.tsx # Active target, value, shift, focus detection
    │   └── SettingsContext.tsx # Enabled languages, localStorage persistence
    ├── layouts/
    │   ├── types.ts
    │   ├── en.ts  he.ts  es.ts  pt-br.ts  emoji.ts
    │   └── index.ts
    ├── hooks/
    │   └── useLongPress.ts     # Hold-to-repeat for Backspace
    └── components/
        ├── VirtualKeyboard.tsx # Slide animation, responsive sizing
        ├── KeyboardHeader.tsx  # Language chips + settings gear
        ├── KeyRow.tsx
        ├── Key.tsx             # pointerdown.preventDefault — focus never leaves host input
        ├── EmojiPanel.tsx      # Scrollable grid, category tabs
        └── SettingsModal.tsx   # Language toggles, last-language guard
```

---

## Adding a new language

1. Create `src/keyboard/layouts/xx.ts` following the same structure as `en.ts`
2. Add it to `src/keyboard/layouts/index.ts` — `LAYOUTS`, `ALL_LANGUAGE_CODES`, `LANGUAGE_LABELS`
3. Add its display name to `LANGUAGE_NAMES` in `SettingsModal.tsx`
4. Run `npm run build`

---

## Troubleshooting

### Windows keyboard still appears

- Make sure the registry keys were set and Chrome was restarted
- Run `scripts\suppress-tabletip.bat` as Administrator to kill the process manually
- Check Task Manager for `TabTip.exe` — if it keeps coming back, add the startup task:
  ```bat
  schtasks /create /tn "VKB-SuppressTabTip" /tr "taskkill /F /IM TabTip.exe" /sc onlogon /f
  ```

### Keyboard does not appear on a specific site

- Some sites use custom input components (shadow DOM, `contenteditable`, iframes)
- `contenteditable` elements are not yet detected — open an issue if needed
- Iframes on a different origin cannot be accessed by content scripts (browser security)

### Extension not loading

- Confirm the `dist\` folder contains `manifest.json` and `content.js`
- Chrome must be restarted after running with `--load-extension` for the first time
- In `chrome://extensions`, check for any error badge on the Virtual Keyboard card

### Keys appear but value does not change in the host app

The host app may use a non-standard input binding. The extension uses the native `HTMLInputElement.prototype` setter to trigger React/Vue synthetic events. If the host uses a completely custom input abstraction, open an issue with details.

---

## License

MIT
