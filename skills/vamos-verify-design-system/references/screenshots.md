# Screenshots

Vamos UI dark mode is the `.dark` class, not the OS colour scheme, so set the attributes on `<html>` before each shot instead of relying on `prefers-color-scheme`.

## Playwright script (if the project has Playwright, or `npx -y playwright` is acceptable to the user)

```js
// scripts/design-shots.mjs: node scripts/design-shots.mjs http://localhost:3000 / /shipments
import { chromium } from "playwright";

const [base, ...routes] = process.argv.slice(2);
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 375, height: 812 } };
const browser = await chromium.launch();
for (const route of routes.length ? routes : ["/"]) {
  for (const [device, viewport] of Object.entries(viewports)) {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
      await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });
      await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), theme === "dark");
      await page.evaluate(() => document.fonts.ready);
      const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
      await page.screenshot({ path: `design-shots/${slug}-${device}-${theme}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) console.log(`horizontal overflow: ${slug} ${device} ${theme}`);
      await page.close();
    }
  }
}
await browser.close();
```

Run the dev server first. Create `design-shots/` before running. Add more axes the same way, e.g. `document.documentElement.dataset.material = "glass"`.

## Useful checks in the page

```js
getComputedStyle(document.querySelector("h1")).fontFamily      // brand display font?
getComputedStyle(document.body).fontFamily                     // brand body font?
document.documentElement.dataset.accent                        // "brand"?
getComputedStyle(document.documentElement).getPropertyValue("--accent-base")
```

## Without a browser
Say that no screenshots were taken. Report only what the code and verifiers show, and list the visual checks under "Not checked".
