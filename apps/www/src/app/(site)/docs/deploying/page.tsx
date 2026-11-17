import { A, C, Callout, Code, DocPage, H2, H3, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Deploying a site",
  description: "Publish a site built with the kit on Vercel, Cloudflare Pages, Spacefast, Netlify, cPanel or a VPS: host config, a contact form that works on each host, secrets, domain records and the post-launch check.",
  path: "/docs/deploying/",
});

export default function DeployingPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Deploying a site"
      description="The CLI writes each host's config (one HTTPS address, security headers, cache), the contact form sender that runs there, and prints the secret and domain steps. With --publish it also runs the host's own CLI, after showing exactly what will run and asking."
      toc={[
        { id: "flow", title: "The flow" },
        { id: "hosts", title: "Hosts" },
        { id: "vercel", title: "Vercel", sub: true },
        { id: "cloudflare", title: "Cloudflare Pages", sub: true },
        { id: "spacefast", title: "Spacefast", sub: true },
        { id: "other-hosts", title: "Netlify, cPanel, VPS", sub: true },
        { id: "forms", title: "Contact form senders" },
        { id: "edge", title: "The edge function", sub: true },
        { id: "turnstile", title: "Turnstile", sub: true },
        { id: "secrets", title: "Secrets" },
        { id: "domains", title: "Domain records" },
        { id: "publish", title: "site deploy --publish" },
        { id: "check", title: "After the deploy" },
      ]}
      prev={{ href: "/docs/commerce", title: "Online store checkout" }}
      next={{ href: "/docs/cli", title: "CLI & registry" }}
    >
      <H2 id="flow">The flow</H2>
      <Code lang="bash" code={`npx vamos-ui site form                 # the contact form sender for this host
npx vamos-ui site deploy --domain ornek.com.tr   # host config + steps + secret commands
npx vamos-ui site deploy --publish      # optional: run the host CLI after a confirmation
npx vamos-ui site check                 # audit + deploy checks on the live address`} />
      <P>
        The host comes from <C>--host</C>, else from the plan in <C>vamos.project.json</C> (<C>npx vamos-ui new</C> asks
        where the site will run). Neither command replaces a file that already exists, and nothing is published without{" "}
        <C>--publish</C> and your yes.
      </P>

      <H2 id="hosts">Hosts</H2>
      <Table
        head={["Host", "Build", "Config written", "Contact form"]}
        rows={[
          ["Vercel", "Next.js server", <C key="v">vercel.json</C>, <span key="vf"><C>resend</C> or <C>smtp</C> server action</span>],
          ["Cloudflare Pages", <span key="c">static export (<C>out</C>)</span>, <C key="c2">public/_headers, public/_redirects</C>, <span key="cf"><C>edge</C>: functions/api/contact.ts</span>],
          ["Spacefast", <span key="s">static export, or server on Next 16.2.x / 16.3.x / 15.5.24+</span>, <C key="s2">public/_headers, public/_redirects</C>, <span key="sf"><C>edge</C>: functions/api/contact.ts</span>],
          ["Netlify", "Next.js server", <C key="n">public/_headers, public/_redirects</C>, <span key="nf"><C>resend</C> or <C>smtp</C></span>],
          ["cPanel / Plesk", <span key="p">static export (<C>out</C>)</span>, <C key="p2">public/.htaccess</C>, <span key="pf"><C>php-mail</C>: public/contact.php</span>],
          ["VPS", "Next.js standalone on pm2", <C key="vp">deploy/nginx-&lt;domain&gt;.conf, deploy/ecosystem.config.cjs</C>, <span key="vpf"><C>resend</C> or <C>smtp</C></span>],
        ]}
      />

      <H3 id="vercel">Vercel</H3>
      <UL>
        <li>Import the Git repository (framework: Next.js), or run <C>npx vamos-ui site deploy --publish</C>, which runs <C>npx vercel deploy --prod</C>.</li>
        <li><C>vercel.json</C> sends the security headers, caches <C>/_next/static</C> for a year and 301s the other host name.</li>
      </UL>
      <Callout tone="warning" title="Vercel Hobby is non-commercial">
        Vercel&apos;s free Hobby plan is for personal, non-commercial use only. A client or business site needs Vercel Pro, or
        one of the other hosts here.
      </Callout>

      <H3 id="cloudflare">Cloudflare Pages</H3>
      <P>
        Set <C>output: &quot;export&quot;</C> (and <C>images: {"{ unoptimized: true }"}</C> or a loader) in{" "}
        <C>next.config</C>, then build and upload <C>out/</C> from the project root, so <C>functions/</C> deploys with it:
      </P>
      <Code lang="bash" code={`npm run build
npx wrangler pages deploy out --project-name defter-hesap`} />
      <P>
        A site that needs a Next.js server (a shop) deploys as a Worker through the OpenNext adapter instead
        (<C>@opennextjs/cloudflare</C>); <C>--publish</C> only handles the static export.
      </P>

      <H3 id="spacefast">Spacefast</H3>
      <P>
        <C>sf publish</C> detects a Next.js project, builds it and uploads <C>out</C>. Server rendering works only on the
        versions its bundled adapter supports; <C>site deploy</C> reads the installed version and picks the mode:
      </P>
      <Table
        head={["Next.js", "Server-rendered", "What site deploy does"]}
        rows={[
          ["16.2.x, 16.3.x, 15.5.24+", "Yes", <C key="1">sf publish</C>],
          ["14.2, 15.0–15.5.23, 16.0, 16.1, 16.4", "No (export only)", <span key="2"><C>output: &quot;export&quot;</C>, build, <C>sf publish ./out --prebuilt</C></span>],
          ["Anything else, prereleases", "No", <span key="3">build the export yourself, <C>sf publish ./out --prebuilt</C></span>],
        ]}
      />
      <UL>
        <li>
          New apps from <C>vamos-ui create</C> depend on <C>next@^16.0.0</C>, which currently installs 16.4, so on Spacefast
          they publish as a static export. That is what a kit website needs; pin <C>~16.3.0</C> yourself only if you need
          server rendering there.
        </li>
        <li>With the edge form, <C>functions/</C> is copied into <C>out/</C> before the upload so the <C>/api/contact</C> route publishes with the site.</li>
        <li>Spacefast reads <C>_headers</C> and <C>_redirects</C>, so the same files as Cloudflare apply. Every plan allows commercial use; the datacenter can be Amsterdam.</li>
        <li>Publish signed in (<C>sf login</C>). An anonymous, unclaimed Space can only call a short list of APIs, so the form could not reach Resend.</li>
      </UL>

      <H3 id="other-hosts">Netlify, cPanel, VPS</H3>
      <P>
        These keep their printed steps (no <C>--publish</C>): Netlify imports from Git; on cPanel you upload the contents of{" "}
        <C>out/</C> to <C>public_html</C> (the <C>.htaccess</C> and <C>contact.php</C> go with it); on a VPS, nginx with a
        certbot certificate proxies to Next.js on pm2.
      </P>

      <H2 id="forms">Contact form senders</H2>
      <P>
        <C>npx vamos-ui site form</C> writes the sender behind <A href="/docs/components/contact-form">ContactForm</A> and one
        field list shared by the page and the sender. The kind comes from <C>--kind</C>, else the plan, else the project: a
        static export on Cloudflare Pages or Spacefast gets <C>edge</C>, another static export <C>php-mail</C>, a Next.js server{" "}
        <C>smtp</C>.
      </P>
      <Table
        head={["Kind", "File", "Form action", "Sends with"]}
        rows={[
          [<C key="1">edge</C>, <C key="1f">functions/api/contact.ts</C>, <C key="1a">&quot;/api/contact&quot;</C>, "Resend HTTP API"],
          [<C key="2">php-mail</C>, <C key="2f">public/contact.php</C>, <C key="2a">&quot;/contact.php&quot;</C>, "The host's mail server"],
          [<C key="3">resend</C>, <C key="3f">app/actions/contact.ts</C>, <C key="3a">{"{sendContact}"}</C>, "Resend HTTP API"],
          [<C key="4">smtp</C>, <C key="4f">app/actions/contact.ts</C>, <C key="4a">{"{sendContact}"}</C>, "Your own mailbox (nodemailer)"],
        ]}
      />
      <P>
        Every sender validates the same fields, requires the privacy notice (KVKK) consent when the form shows the checkbox,
        drops honeypot and too-fast submits with a fake success, refuses cross-site posts, rate-limits per IP and puts no
        visitor input into mail headers except a checked Reply-To.
      </P>

      <H3 id="edge">The edge function</H3>
      <P>
        One file runs on both hosts: it exports <C>onRequestPost</C> for Cloudflare Pages Functions and <C>POST</C> for the
        Spacefast file router, and uses only <C>fetch</C>, <C>Request</C> and <C>Response</C>.
      </P>
      <Code code={`import { contactFields, privacyCheckbox } from "@/app/contact-fields";

<ContactForm
  action="/api/contact"
  fields={contactFields}
  privacyLink={{ href: "/kvkk", label: "KVKK Aydınlatma Metni" }}
  privacyCheckbox={privacyCheckbox}
  turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
/>`} />
      <Table
        head={["Answer", "When"]}
        rows={[
          [<C key="1">200 {"{ ok: true, status: \"success\" }"}</C>, "Sent (or a bot was quietly dropped). Without JavaScript: a 303 back to the page with ?vb_sent=<form>."],
          [<C key="2">422 {"{ status: \"invalid\", errors }"}</C>, "A field is missing, too long or malformed, or the consent box is not ticked."],
          [<C key="3">403</C>, "Cross-site post, or the Turnstile check failed."],
          [<C key="4">429</C>, "More than 5 messages from one IP in 10 minutes (Retry-After: 600)."],
          [<C key="5">400 / 405 / 413 / 415</C>, "Unreadable body, not a POST, over 32 KB, or an unsupported content type."],
          [<C key="6">500 / 502</C>, "A secret is not set, or Resend refused the message. The log names the variable, never its value."],
        ]}
      />
      <Callout title="The rate limit is best effort">
        The counter lives in the memory of one running instance, and the platform runs many short-lived instances, so a
        determined sender can get past it. For a hard limit add a Cloudflare WAF rate-limiting rule for{" "}
        <C>/api/contact</C>, or turn on Turnstile.
      </Callout>

      <H3 id="turnstile">Turnstile</H3>
      <P>
        Optional, for every sender except <C>php-mail</C>. Create a Turnstile widget for the domain in the Cloudflare dashboard,
        give the site key to the build as <C>NEXT_PUBLIC_TURNSTILE_SITE_KEY</C> and the secret to the host as{" "}
        <C>TURNSTILE_SECRET</C>. ContactForm loads the Turnstile script only when it has a site key; the sender checks the token
        with Cloudflare&apos;s siteverify API and refuses a submit without one while the secret is set. Turnstile needs
        JavaScript, so a no-JS submit is refused then.
      </P>

      <H2 id="secrets">Secrets</H2>
      <P>
        <C>site deploy</C> and <C>site form</C> print the command for each secret. None of them puts the value on the command
        line: the host CLI asks for it, so it stays out of your shell history. Never commit them.
      </P>
      <Table
        head={["Host", "Command"]}
        rows={[
          ["Vercel", <C key="v">npx vercel env add RESEND_API_KEY production</C>],
          ["Cloudflare Pages", <C key="c">npx wrangler pages secret put RESEND_API_KEY --project-name defter-hesap</C>],
          ["Spacefast", <C key="s">sf env set RESEND_API_KEY --value-from-stdin --space defter-hesap</C>],
          ["cPanel", <span key="p"><C>CONTACT_TO</C> / <C>CONTACT_FROM</C> inside <C>public/contact.php</C> (no secret)</span>],
        ]}
      />
      <P>
        The edge and Resend senders read <C>RESEND_API_KEY</C>, <C>CONTACT_TO</C> (comma-separated for several inboxes),{" "}
        <C>CONTACT_FROM</C> (an address on a domain verified in Resend) and the optional <C>TURNSTILE_SECRET</C>; SMTP adds{" "}
        <C>SMTP_HOST</C>, <C>SMTP_PORT</C>, <C>SMTP_USER</C> and <C>SMTP_PASS</C>.
      </P>

      <H2 id="domains">Domain records</H2>
      <Table
        head={["Host", "Add the domain", "DNS"]}
        rows={[
          ["Vercel", "Project → Settings → Domains", "A 76.76.21.21 for the bare domain, CNAME for www (as Vercel shows)."],
          ["Cloudflare Pages", "Custom domains", "Created for you when the zone is on Cloudflare. SSL/TLS: Full (strict), Always Use HTTPS on."],
          ["Spacefast", <C key="s">sf domains add ornek.com.tr --space defter-hesap</C>, "The A / CNAME records it prints; HTTPS is issued automatically."],
          ["cPanel", "Addon domain / the account's main domain", "The host's nameservers or A record; AutoSSL before the HTTPS redirect goes live."],
          ["VPS", "nginx server_name", "A (and AAAA) to the server; certbot --nginx for the certificate."],
        ]}
      />
      <P>
        Pass <C>--domain</C> (and <C>--www</C> to serve on www) so the redirect from the other host name is written for you.
      </P>

      <H2 id="publish">site deploy --publish</H2>
      <P>
        For Vercel, Cloudflare Pages and Spacefast, <C>--publish</C> runs the host&apos;s CLI after writing the files. It first
        shows the host, the project or Space, the directory and every command, then asks (the default answer is no). In CI or
        another non-interactive run it publishes only with <C>--yes</C>. If the CLI is missing or you are not signed in it
        prints the install or login command (<C>npx vercel login</C>, <C>npx wrangler login</C>, <C>sf login</C>) and stops.
      </P>
      <Code lang="bash" code={`npx vamos-ui site deploy --host spacefast --space defter-hesap --publish
#  Host:      spacefast
#  Target:    Spacefast Space defter-hesap
#  Directory: out
#  1. npm run build
#  2. cp -R functions out/functions
#  3. sf publish ./out --prebuilt --space defter-hesap
#  ◆ Publish to spacefast now?  No / Yes

npx vamos-ui site deploy --host cloudflare --project defter-hesap --publish --yes   # CI
npx vamos-ui site deploy --publish --dry-run                                       # show the plan only`} />

      <H2 id="check">After the deploy</H2>
      <P>
        <C>npx vamos-ui site check</C> runs the audit on the live URL plus the deploy checks: http → https, one host name, the
        security headers (and every header your <C>public/_headers</C> sets), a real 404, robots.txt and sitemap.xml. With a
        form sender in the project it also sends an empty POST to its endpoint (<C>/api/contact</C> or <C>/contact.php</C>, or{" "}
        <C>--form-endpoint</C>): a 400, 405, 415 or 422 proves the route is live, a 404 means the function did not deploy. The
        empty request never passes validation, so nothing is sent. Then send one real message and check the inbox and the spam
        folder.
      </P>
    </DocPage>
  );
}
