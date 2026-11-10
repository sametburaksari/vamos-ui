import { chromium } from "@playwright/test";
const [url, fn] = [process.argv[2], process.argv[3]];
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
await p.goto("http://localhost:3200" + url, { waitUntil: "domcontentloaded", timeout: 180000 }); await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(fn), null, 1));
await b.close();
