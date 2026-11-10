import { chromium } from "@playwright/test";
import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
const slugs = process.argv[2].split(",");
const only = process.argv[3]; // optional combo filter
const combos = [
  { name: "lg", dark: false, material: "glass", density: "comfortable" },
  { name: "dg", dark: true, material: "glass", density: "comfortable" },
  { name: "ls", dark: false, material: "solid", density: "comfortable" },
  { name: "dc", dark: true, material: "solid", density: "compact" },
].filter(c => !only || only.split("+").includes(c.name));
const browser = await chromium.launch({ channel: "chrome" });
const out = {};
await Promise.all(combos.map(async (c) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript((s) => { try { localStorage.setItem("vamos-theme", JSON.stringify(s)); } catch {} },
    { dark: c.dark, material: c.material, accent: "lime", density: c.density, font: "editorial" });
  await ctx.route(/fonts\.(googleapis|gstatic)|unsplash|picsum|images\./, r => r.continue());
  const page = await ctx.newPage();
  for (const slug of slugs) {
    const errs = [];
    page.removeAllListeners("pageerror"); page.removeAllListeners("console");
    page.on("pageerror", e => errs.push("pageerror: " + e.message.slice(0, 200)));
    page.on("console", m => { if (m.type() === "error" && !/DevTools|HMR|Fast Refresh/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    try {
      await page.goto(`http://localhost:3200/docs/components/${slug}`, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(1500);
      const info = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const bad = [];
        document.querySelectorAll("[data-preview], .preview, [class*='preview']").forEach(() => {});
        // find elements overflowing their nearest scroll-clip ancestor horizontally
        const all = document.querySelectorAll("main *");
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.width === 0) continue;
          if (r.right > window.innerWidth + 1 && !el.closest("[data-overflow-ok]")) {
            let p = el.parentElement, clipped = false;
            while (p) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; }
            if (!clipped) bad.push((el.className?.toString?.() || el.tagName).slice(0, 80));
          }
        }
        return { docW, h: document.documentElement.scrollHeight, bad: bad.slice(0, 5) };
      });
      let contrast = [];
      if (!process.env.NOAXE) { try {
        const r = await new AxeBuilder({ page }).include("main").withRules(["color-contrast"]).analyze();
        contrast = r.violations.flatMap(v => v.nodes.map(n => (n.target.join(" ").slice(0,90)) + " | " + (n.any[0]?.message||"").slice(0,90)));
      } catch (e) { contrast = ["axe-fail " + String(e).slice(0,80)]; } }
      const file = `/private/tmp/vqa/${slug}.${c.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      out[slug + "." + c.name] = { ...info, errs: errs.slice(0, 5), contrast: contrast.slice(0, 8), nContrast: contrast.length };
    } catch (e) { out[slug + "." + c.name] = { fail: String(e).slice(0, 200) }; }
  }
  await ctx.close();
}));
await browser.close();
fs.writeFileSync("/private/tmp/vqa/report-" + Date.now() + ".json", JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) if (v.fail || v.errs?.length || v.nContrast || v.bad?.length || v.docW > 1440) console.log(k, JSON.stringify(v));
console.log("heights:", Object.entries(out).filter(([k]) => k.endsWith(".lg")).map(([k, v]) => k.split(".")[0] + ":" + v.h).join(" "));
