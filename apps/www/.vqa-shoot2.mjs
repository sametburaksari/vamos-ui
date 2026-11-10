import { chromium } from "@playwright/test";
import fs from "node:fs";
const slugs = process.argv[2].split(",");
const only = process.argv[3];
const combos = [
  { name: "lg", dark: false, material: "glass", density: "comfortable" },
  { name: "dg", dark: true, material: "glass", density: "comfortable" },
  { name: "ls", dark: false, material: "solid", density: "comfortable" },
  { name: "dc", dark: true, material: "solid", density: "compact" },
].filter(c => !only || only.split("+").includes(c.name));
fs.mkdirSync("/private/tmp/vqa/p", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const out = {};
await Promise.all(combos.map(async (c) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  await ctx.addInitScript((s) => { try { localStorage.setItem("vamos-theme", JSON.stringify(s)); } catch {} },
    { dark: c.dark, material: c.material, accent: "lime", density: c.density, font: "editorial" });
  const page = await ctx.newPage();
  for (const slug of slugs) {
    const errs = [];
    page.removeAllListeners("pageerror"); page.removeAllListeners("console");
    page.on("pageerror", e => errs.push("pageerror: " + e.message.slice(0, 200)));
    page.on("console", m => { if (m.type() === "error" && !/DevTools|HMR|Fast Refresh/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    try {
      await page.goto(`http://localhost:3200/docs/components/${slug}`, { waitUntil: "domcontentloaded", timeout: 120000 });
      await page.waitForTimeout(3000);
      const info = await page.evaluate(() => {
        const res = [];
        document.querySelectorAll(".preview-stage").forEach((st, i) => {
          const sr = st.getBoundingClientRect(); const bad = [];
          for (const el of st.querySelectorAll("*")) {
            const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
            if (r.right > sr.right - 1 || r.left < sr.left + 1) {
              let p = el.parentElement, clipped = false;
              while (p && p !== st) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; }
              if (!clipped && getComputedStyle(el).position !== "fixed") bad.push((el.tagName + "." + (el.className?.toString?.() || "")).slice(0, 70));
            }
          }
          res.push({ i, bad: bad.slice(0, 3) });
        });
        return res;
      });
      const stages = await page.locator(".preview-stage").all();
      for (let i = 0; i < stages.length; i++) {
        await stages[i].scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
        await stages[i].screenshot({ path: `/private/tmp/vqa/p/${slug}.${c.name}.${i}.png`, animations: "disabled" });
      }
      out[slug + "." + c.name] = { n: stages.length, errs, overflow: info.filter(x => x.bad.length) };
    } catch (e) { out[slug + "." + c.name] = { fail: String(e).slice(0, 200) }; }
  }
  await ctx.close();
}));
await browser.close();
fs.writeFileSync(`/private/tmp/vqa/r2-${slugs[0]}.json`, JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) if (v.fail || v.errs?.length || v.overflow?.length) console.log(k, JSON.stringify(v));
console.log("done", slugs.length);
