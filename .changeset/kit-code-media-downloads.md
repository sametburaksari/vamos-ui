---
"@vamos-ui/react": minor
"vamos-ui": minor
"@vamos-ui/mcp": patch
---

Five new website components for code samples, app mockups, store links, video lists and file downloads, and the site recipes now use them.

- `CodeBlock` and `CodeTabs`: highlighted code with a file name, line numbers, marked lines and a copy button that falls back where the clipboard is blocked. The language picked in one `CodeTabs` switches every other block on the page and can be remembered per browser (`useCodeLanguage` lets an install line or SDK table follow it). A small built-in highlighter colours with tokens; Shiki or Prism output plugs in through `highlight` or `html`.
- `DeviceFrame` and `DeviceScreens`: a phone, tablet or desktop browser drawn from tokens whose screen lays content out at the device's real width and scales to fit; swap screens from feature tabs or scroll.
- `StoreBadges`: App Store and Google Play links drawn as plain text with a generic icon (no store artwork), more stores, and an optional QR code on wide screens.
- `VideoPlaylist` (`@vamos-ui/react/media`): one player and a list that swaps the video; YouTube and Vimeo stay behind the click-to-load facade.
- `DownloadKit`: files with format and size, downloaded one by one or ticked and saved as one ZIP built in the browser (`createZip`, no dependency); files that fail to fetch are listed inside the archive.
- Labels for all of them in English, Turkish, German, French, Spanish and Arabic.
- Recipes: developer-tool and publication use `code-block`; mobile-app uses `device-frame` and `store-badges`; musician and game use `video-playlist` and `download-kit`; digital-products uses `device-frame` and `download-kit`.
