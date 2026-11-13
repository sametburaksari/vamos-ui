import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { formSender } from "../src/project/forms";

const hasPhp = (() => {
  try {
    execFileSync("php", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

describe("formSender", () => {
  it("php-mail: contact.php with the recipient, the fields and no visitor input in headers", () => {
    const r = formSender({ kind: "php-mail", siteName: "Kil & Ateş", to: "atolye@example.com", from: "form@example.com", fieldsFile: "app/contact-fields.ts" });
    expect(Object.keys(r.files)).toEqual(["public/contact.php", "app/contact-fields.ts"]);
    const php = r.files["public/contact.php"]!;
    expect(php).toContain("const CONTACT_TO = 'atolye@example.com';");
    expect(php).toContain("'name' => 'message', 'label' => 'Mesaj', 'required' => true, 'max' => 2000");
    expect(php).toMatch(/FILTER_VALIDATE_EMAIL\)\) \$headers\[\] = 'Reply-To: '/);
    expect(php).toContain("same_host($origin)");
    expect(r.action).toBe("/contact.php");
    expect(r.files["app/contact-fields.ts"]).toContain('"name": "email"');
  });

  it("escapes quotes in baked-in PHP strings", () => {
    const php = formSender({ kind: "php-mail", siteName: "O'Neil's", to: "a@example.com" }).files["public/contact.php"]!;
    expect(php).toContain("'O\\'Neil\\'s: Web sitesinden yeni mesaj'");
  });

  it.runIf(hasPhp)("php-mail output is valid PHP", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-form-"));
    const file = path.join(dir, "contact.php");
    writeFileSync(file, formSender({ kind: "php-mail", to: "a@example.com", booking: true, lang: "en" }).files["public/contact.php"]!);
    expect(execFileSync("php", ["-l", file]).toString()).toContain("No syntax errors");
  });

  it("resend / smtp: a server action and a shared field list; env and dependencies", () => {
    const resend = formSender({ kind: "resend", to: "a@example.com", appDir: "src/app", lang: "en" });
    expect(Object.keys(resend.files)).toEqual(["src/app/contact-fields.ts", "src/app/actions/contact.ts"]);
    expect(resend.files["src/app/actions/contact.ts"]).toMatch(/^"use server";/);
    expect(resend.files["src/app/actions/contact.ts"]).toContain("https://api.resend.com/emails");
    expect(Object.keys(resend.env)).toEqual(["RESEND_API_KEY", "CONTACT_TO", "CONTACT_FROM"]);
    const smtp = formSender({ kind: "smtp" });
    expect(smtp.dependencies).toContain("nodemailer");
    expect(smtp.files["app/actions/contact.ts"]).toContain("nodemailer.createTransport");
    // A "use server" module may only export async functions.
    expect(smtp.files["app/actions/contact.ts"]!.match(/^export (?!async function)/m)).toBeNull();
  });

  it("booking forms ask for phone and date; bad addresses are refused", () => {
    const r = formSender({ kind: "smtp", booking: true });
    expect(r.files["app/contact-fields.ts"]).toContain('"name": "date"');
    expect(() => formSender({ kind: "php-mail", to: "not-an-email" })).toThrow(/not an email/);
  });
});

describe("vamos-ui site form", () => {
  it("static export → php-mail with the inbox from vamos.site.json; server kinds refused; files kept", async () => {
    const { run } = await import("../src/cli");
    const { existsSync, readFileSync } = await import("node:fs");
    const dir = mkdtempSync(path.join(tmpdir(), "vb-siteform-"));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { next: "16.0.0", react: "19.2.0" } }));
    writeFileSync(path.join(dir, "next.config.mjs"), 'export default { output: "export" };');
    writeFileSync(path.join(dir, "vamos.site.json"), JSON.stringify({ name: "Kıyı Seramik", contact: { email: "atolye@example.com" } }));
    const opts = { cwd: dir, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } };
    expect(await run(["site", "form", "--json"], opts)).toBe(0);
    expect(readFileSync(path.join(dir, "public/contact.php"), "utf8")).toContain("const CONTACT_TO = 'atolye@example.com';");
    expect(existsSync(path.join(dir, "app/contact-fields.ts"))).toBe(true);
    expect(await run(["site", "form", "--kind", "smtp", "--json"], opts)).not.toBe(0);
    writeFileSync(path.join(dir, "public/contact.php"), "<?php // edited");
    expect(await run(["site", "form", "--json"], opts)).toBe(0);
    expect(readFileSync(path.join(dir, "public/contact.php"), "utf8")).toBe("<?php // edited");
  });
});
