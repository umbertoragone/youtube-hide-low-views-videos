# YouTube Hide Low Views Videos

[![GitHub release](https://img.shields.io/github/v/release/umbertoragone/youtube-hide-low-views-videos)](https://github.com/umbertoragone/youtube-hide-low-views-videos/releases)

A lightweight userscript that **automatically hides low views videos** from YouTube's homepage.

---

## Features

- Hides low views (usually low quality) videos
- Customizable – adjust `MIN_HOURS` and `MAX_VIEWS` in the script
- Works dynamically with YouTube's modern **Single Page Application (SPA)** behavior
- Reacts to scrolling and content updates automatically
- 100% client‑side — no API calls, no external dependencies

---

## Installation

### Option 1. Using Tampermonkey (Recommended)

[![Install](https://img.shields.io/badge/Install-Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/umbertoragone/youtube-hide-low-views-videos/main/hide-low-views-videos.user.js)

**Quick install:** Click the button above if you already have Tampermonkey installed.

Or install manually:

1. Install **[Tampermonkey](https://www.tampermonkey.net/)** for your browser.
2. Click **Create a new script**.
3. Paste the contents of [`hide-low-views-videos.user.js`](./hide-low-views-videos.user.js).
4. Save the script and refresh **YouTube**.

### Option 2. Using AdGuard

[![Install](https://img.shields.io/badge/Install-AdGuard-68BC71?style=for-the-badge&logo=adguard&logoColor=white)](https://raw.githubusercontent.com/umbertoragone/youtube-hide-low-views-videos/main/hide-low-views-videos.user.js)

**Quick install:** Click the button above if you already have AdGuard installed.

Or install manually:

1. Open AdGuard settings.
2. Navigate to **Extensions → Userscripts** (or **Filters → Custom** if using the extension).
3. Click **Add userscript**.
4. Enter the direct URL to the script: `https://raw.githubusercontent.com/umbertoragone/youtube-hide-low-views-videos/main/hide-low-views-videos.user.js`
5. AdGuard will download and manage the script automatically.
6. Refresh YouTube to activate it.

## Contributing

Pull requests are welcome. If YouTube changes its layout (again), please open an issue including an HTML snippet showing the updated badge element so the selectors can be updated quickly.
