# OS Dark Mode Support - Auto Dark Theme on Mobile

## How It Works

Your app now automatically detects and switches to dark theme based on your device's OS dark mode setting!

### Features:

✅ **Auto Dark Mode**: App automatically switches to dark theme when OS dark mode is enabled
✅ **Live Updates**: If you toggle OS dark mode (Settings → Display), app updates instantly
✅ **Manual Override**: Users can manually toggle between light/dark/system modes
✅ **Mobile Ready**: Works on Android and iOS with native dark mode support
✅ **Remembers Preference**: Saves user's choice in local storage

---

## How to Enable OS Dark Mode

### Android:
1. Go to **Settings** → **Display** → **Dark theme**
2. Toggle **ON** (or set to "System default")
3. Open ProposalForge → **Colors automatically switch to dark**

### iOS (iPhone):
1. Go to **Settings** → **Display & Brightness**
2. Select **Dark** mode (or "Automatic")
3. Open ProposalForge → **Colors automatically switch to dark**

### Web Browser (Testing):
1. Open **Developer Tools** (F12)
2. Press **Ctrl+Shift+P** (or **Cmd+Shift+P** on Mac)
3. Type: "emulate CSS media"
4. Select: "prefers-color-scheme: dark"
5. App switches to dark mode instantly

---

## What Changes:

When dark mode is enabled:

**Light Mode:**
- Background: White
- Text: Dark gray
- Cards: White
- Accent colors: Pink (#E91E63)

**Dark Mode:**
- Background: Dark gray/black
- Text: White
- Cards: Dark
- Accent colors: Bright pink/red

### All Colors Switch:
✅ Backgrounds
✅ Text
✅ Buttons
✅ Cards
✅ Borders
✅ Sidebar
✅ Inputs
✅ Notifications

---

## Theme Toggle Button

Located in the top navigation:

**Light Mode**: Click moon icon → **Switches to dark**
**Dark Mode**: Click sun icon → **Switches to light**
**System Mode**: Click phone icon → **Follows OS setting**

---

## System Theme (Automatic) - Recommended

By default, your app uses **"System Theme"** which means:

1. **On app first load**: Checks your OS dark mode setting
2. **If OS has dark mode ON**: App loads in dark theme
3. **If OS has dark mode OFF**: App loads in light theme
4. **If you change OS dark mode**: App updates instantly
5. **If you manually toggle**: Overrides system and saves preference

### How System Theme Works:

```
User Settings
    ↓
[System Theme Button]
    ↓
Check OS: prefers-color-scheme: dark
    ↓
OS Dark Mode ON → Apply dark colors
OS Dark Mode OFF → Apply light colors
    ↓
[Listen for OS changes]
    ↓
User toggles OS dark mode
    ↓
App updates instantly!
```

---

## Test on Your Device

### Test 1: Check Current Setting
1. Open ProposalForge app
2. Look at theme toggle button (top right)
3. If it shows phone icon = System theme (following OS)

### Test 2: Toggle OS Dark Mode (Android)
1. Settings → Display → Dark theme → ON
2. **Result**: App switches to dark automatically ✅
3. Settings → Display → Dark theme → OFF
4. **Result**: App switches to light automatically ✅

### Test 3: Manual Override
1. App in System theme (following OS)
2. Click theme toggle button
3. Now showing light/dark icon (not phone)
4. **Result**: App stays in that theme even if OS changes ✅

### Test 4: Switch Back to System
1. App in manual light/dark mode
2. Click theme toggle button until phone icon shows
3. **Result**: App goes back to following OS setting ✅

---

## Color Variables (All Automatically Switch)

```
Light Mode ↔️ Dark Mode

Background:
  Light: White (#FFFFFF)
  Dark: Very Dark Gray (#141414)

Text:
  Light: Dark Gray (#2B2B2B)
  Dark: Nearly White (#FAFAFA)

Cards:
  Light: White (#FFFFFF)
  Dark: Dark (#191919)

Primary (Pink):
  Light: #E91E63
  Dark: Bright Pink

Accents/Borders:
  Light: Light Gray (#E5E5E5)
  Dark: Dark Gray (#303030)
```

All defined in `client/src/index.css` with automatic CSS variable switching.

---

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile browsers (Chrome on Android, Safari on iOS)
✅ Progressive enhancement (graceful fallback)

---

## Developer Details

### Theme Values:
- `"light"` - Always light theme
- `"dark"` - Always dark theme
- `"system"` - Follow OS dark mode (recommended default)

### How It Detects OS Dark Mode:
```javascript
// CSS Media Query
window.matchMedia("(prefers-color-scheme: dark)").matches

// Returns:
// true = OS has dark mode enabled
// false = OS has light mode enabled
```

### How It Listens for Changes:
```javascript
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", (e) => {
  // Updates app when OS setting changes
});
```

---

## Recommended Setup

For best user experience:

1. **Default**: Use System theme (auto-detects OS)
2. **Option**: Allow users to override in settings
3. **Memory**: App remembers their choice

**User Flow:**
1. First visit → App detects OS dark mode
2. User keeps system theme → Always matches OS
3. User switches to manual theme → App remembers
4. On next visit → App respects their choice

---

## Troubleshooting

**"Dark mode not working"**
- Make sure OS has dark mode enabled (Settings → Display)
- Check browser supports `prefers-color-scheme` (all modern browsers do)
- Try manual toggle to force dark mode

**"Colors not changing"**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check theme toggle button shows correct mode

**"Changes not persisting"**
- Browser local storage must be enabled
- Check browser privacy settings
- Try incognito/private window to verify

**"Still showing old colors"**
- Check if theme CSS variables are properly defined in index.css
- Rebuild app: `npm run build`
- Clear browser cache and restart

---

## Summary

Your ProposalForge app now has **automatic dark mode support** that:

✅ Detects OS dark mode on Android/iOS
✅ Switches colors automatically
✅ Updates instantly when OS changes
✅ Allows manual override
✅ Remembers user preference
✅ Works on all devices
✅ Production-ready

**Status: Fully Implemented** ✅
**Tested on**: Chrome, Firefox, Safari, Mobile Browsers
**Ready to Deploy**: Yes ✅

---

## Next Steps

1. **Test on your phone**: Enable/disable OS dark mode in Settings
2. **Try the toggle**: Click the theme button in top navigation
3. **Check mobile**: Verify colors switch on Android/iOS
4. **Deploy**: Your app is ready with auto dark mode!

---

**Questions?** All colors are defined in `client/src/index.css` and automatically switch based on the `.dark` CSS class on the root element.
