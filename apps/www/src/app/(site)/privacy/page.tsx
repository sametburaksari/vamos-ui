import { A, C, Callout, DocPage, H2, H3, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy policy",
  description:
    "What the Vamos UI docs site, registry, CLI and hosted MCP server (mcp.vamos.ist) collect, why, how long it is kept, who it is shared with and how to contact us.",
  path: "/privacy/",
});

const ISSUES = "https://github.com/sametburaksari/vamos-ui/issues";
const ADVISORY = "https://github.com/sametburaksari/vamos-ui/security/advisories/new";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-8">
      <DocPage
        eyebrow="Legal · Last updated 12 November 2026"
        title="Privacy policy"
        description="Vamos UI has no accounts, no cookies, no analytics and no advertising. The only personal data we handle is what any web server sees: your IP address and the request, kept for 30 days."
        toc={[
          { id: "who", title: "Who we are" },
          { id: "summary", title: "Summary" },
          { id: "site", title: "Docs site" },
          { id: "registry", title: "Registry" },
          { id: "cli", title: "CLI and local MCP" },
          { id: "mcp", title: "Hosted MCP server" },
          { id: "logs", title: "Server logs" },
          { id: "sharing", title: "Sharing" },
          { id: "retention", title: "Retention" },
          { id: "rights", title: "Your rights" },
          { id: "changes", title: "Changes" },
          { id: "contact", title: "Contact" },
          { id: "tr", title: "Türkçe özet" },
        ]}
      >
        <H2 id="who">Who we are</H2>
        <P>
          Vamos UI is published by <strong className="text-fg">Vamos</strong>, a digital agency in Istanbul, Türkiye
          (&ldquo;Vamos&rdquo;, &ldquo;we&rdquo;). Vamos is the data controller for the services this policy covers:
        </P>
        <UL>
          <li>the documentation site <C>https://ui.vamos.ist</C>;</li>
          <li>the component registry under <C>https://ui.vamos.ist/r/</C>;</li>
          <li>the <C>vamos-ui</C> command-line tool and the <C>@vamos-ui/mcp</C> package when you run them yourself;</li>
          <li>the hosted MCP server <C>https://mcp.vamos.ist/mcp</C>, including when you add it to Claude, ChatGPT or another AI client.</li>
        </UL>

        <H2 id="summary">Summary</H2>
        <Table
          head={["", "What we receive", "Kept"]}
          rows={[
            ["Docs site and registry", "Standard web server log entries (IP address, time, URL, status, browser user agent, referrer).", "30 days"],
            ["Hosted MCP server", "The tool calls your AI client sends (tool name and arguments) to compute an answer, plus a web server log entry per request. Arguments are not stored.", "Logs 30 days; arguments not kept"],
            ["CLI and local MCP server", "Nothing. They run on your computer and send us no telemetry. Fetching the registry produces a normal server log entry.", "30 days (log entry)"],
          ]}
        />
        <P>We do not sell personal data, do not use it for advertising or profiling, and do not use it to train AI models.</P>

        <H2 id="site">Docs site</H2>
        <P>
          <C>ui.vamos.ist</C> is a set of static files served from a server we operate. It has no sign-in, sets no cookies and
          runs no analytics, tracking pixels or advertising scripts.
        </P>
        <UL>
          <li>
            <strong className="text-fg">Theme choices</strong> (light/dark, accent, density, font) are saved in your browser&apos;s{" "}
            <C>localStorage</C> under the key <C>vamos-theme</C> so the site looks the same on your next visit. Some interactive
            examples save their demo state the same way. This data stays in your browser and is never sent to us; clear it in your
            browser settings at any time.
          </li>
          <li>
            <strong className="text-fg">Third-party content on some example pages.</strong> Image galleries, website templates and
            other previews load sample photos from Unsplash (<C>images.unsplash.com</C>); the font previews and font picker load
            fonts from Google Fonts (<C>fonts.googleapis.com</C>, <C>fonts.gstatic.com</C>); one video player example loads a
            script from jsDelivr (<C>cdn.jsdelivr.net</C>). When your browser loads these files, that provider receives your IP
            address and browser user agent under its own privacy policy. The site&apos;s own fonts are served from our server.
          </li>
        </UL>

        <H2 id="registry">Registry</H2>
        <P>
          The registry is a collection of public, static JSON files under <C>https://ui.vamos.ist/r/</C>. It is read by the CLI,
          the MCP server and anyone who opens the URLs. Requests to it are logged like any other request to the site (see{" "}
          <A href="#logs">Server logs</A>).
        </P>

        <H2 id="cli">CLI and local MCP server</H2>
        <P>
          <C>npx vamos-ui</C> and <C>npx @vamos-ui/mcp</C> run on your own computer. They contain no telemetry and never send your
          project files, code or usage data to us. They make network requests only for the work you ask for:
        </P>
        <UL>
          <li>reading item JSON from the registry (<C>https://ui.vamos.ist/r</C>, or the registry you configure);</li>
          <li>installing npm packages through your package manager, which talks to the npm registry you use;</li>
          <li><C>brand import &lt;url&gt;</C> and the MCP tool <C>import_design_system</C> with a URL: fetching the page you name, its stylesheets and logo files, from your computer.</li>
        </UL>

        <H2 id="mcp">Hosted MCP server (mcp.vamos.ist)</H2>
        <P>
          The hosted server answers Model Context Protocol requests. It has no accounts and no sign-in, and it is stateless: every
          request is handled on its own and nothing is kept between requests.
        </P>
        <H3>What it receives</H3>
        <UL>
          <li>
            <strong className="text-fg">Tool calls</strong> sent by your AI client: the tool name and its arguments. Depending on
            the tool, arguments are a search query, an item or block name, a screen description, a colour, a code snippet you asked
            it to check, or page HTML/CSS you asked it to read. Your AI client decides what to send; the server cannot read your
            files, your chat or anything else on your device.
          </li>
          <li>
            <strong className="text-fg">Connection details</strong> every web server sees: the IP address that made the request
            (when you use Claude or ChatGPT, this is usually the AI provider&apos;s server rather than your own address), time,
            path, status code, response size and user agent.
          </li>
        </UL>
        <H3>How it is used</H3>
        <P>
          Arguments are processed in memory only to compute the tool&apos;s answer and are discarded when the response is sent. The
          server application does not write tool arguments or results to disk or to its logs; its process log contains start-up
          messages and unexpected errors. To answer, the server reads the public registry from <C>ui.vamos.ist</C>; it does not
          call any other service. The tools are read-only: they cannot change anything on your computer or in any account.
        </P>
        <Callout tone="warning" title="Do not send secrets">
          Do not put passwords, API keys, customer data or other personal data into code or HTML you ask the server to check. It
          does not need them, and the hosted server is a public service.
        </Callout>
        <P>
          The AI client you use (for example Claude or ChatGPT) is operated by its own provider and has its own privacy policy. It
          decides when to call the server and what to show you.
        </P>

        <H2 id="logs">Server logs</H2>
        <P>
          The web server in front of the docs site, the registry and the MCP server (Apache) writes an access log entry for each
          request: IP address, date and time, method and URL, status code, bytes sent, referrer and user agent. It does not log
          request bodies, so MCP tool arguments are not in these logs. We use the logs to keep the services running and secure:
          to diagnose errors, detect abuse and attacks, and see aggregate load. We do not combine them with other data or use them
          to identify visitors. Our legal basis is our legitimate interest in operating a secure service (GDPR Art. 6(1)(f); KVKK
          Art. 5(2)(f)).
        </P>

        <H2 id="sharing">Who we share data with</H2>
        <UL>
          <li><strong className="text-fg">Hosting:</strong> the provider we rent our server from stores the files and logs on our behalf, as part of hosting the server.</li>
          <li><strong className="text-fg">Authorities:</strong> only when the law requires it.</li>
        </UL>
        <P>We share no data with anyone else and we do not sell it. The third-party providers on some example pages (see <A href="#site">Docs site</A>) receive requests directly from your browser, not from us.</P>

        <H2 id="retention">Retention</H2>
        <P>
          Access logs and process logs are deleted after <strong className="text-fg">30 days</strong>. Logs connected to a
          security incident may be kept longer, only as long as needed to investigate it. MCP tool arguments and results are not
          retained at all.
        </P>

        <H2 id="rights">Your rights</H2>
        <P>
          Depending on where you live (for example under the GDPR or Türkiye&apos;s KVKK), you can ask for access to, correction of
          or deletion of personal data about you, object to its processing, and complain to your data protection authority (in
          Türkiye, the KVKK Board). Because we hold no accounts, we can only find log entries if you tell us the IP address and
          approximate time. There is no automated decision-making.
        </P>
        <P>
          The services are developer tools, not directed at children, and we do not knowingly collect data from children.
        </P>

        <H2 id="changes">Changes</H2>
        <P>
          If we change what we collect, we update this page and the date at the top before the change takes effect. The history of
          this page is public in the{" "}
          <A href="https://github.com/sametburaksari/vamos-ui">repository</A>.
        </P>

        <H2 id="contact">Contact</H2>
        <UL>
          <li>
            Questions about this policy: open an issue at <A href={ISSUES}>github.com/sametburaksari/vamos-ui/issues</A>. For a
            request that involves your personal data, do not post the data publicly: open an issue saying you have a privacy
            request and we will reply with a private way to continue.
          </li>
          <li>
            Security problems: report them privately through <A href={ADVISORY}>GitHub private vulnerability reporting</A>. See{" "}
            <A href="/docs/security">Security</A>.
          </li>
        </UL>

        <H2 id="tr">Türkçe özet</H2>
        <P>
          Vamos UI&apos;ı İstanbul&apos;daki dijital ajans Vamos yayımlar ve bu hizmetler için veri sorumlusudur. Dokümantasyon
          sitesinde (<C>ui.vamos.ist</C>) hesap, çerez, analitik veya reklam yoktur; tema tercihleri yalnızca tarayıcınızda (
          <C>localStorage</C>) tutulur. Bazı örnek sayfalar Unsplash, Google Fonts ve jsDelivr&apos;dan dosya yükler; bu sağlayıcılar
          IP adresinizi görür. CLI ve yerel MCP sunucusu bilgisayarınızda çalışır, telemetri göndermez. Barındırılan MCP sunucusu (
          <C>mcp.vamos.ist</C>) yapay zekâ istemcinizin gönderdiği araç adını ve argümanlarını yalnızca yanıtı hesaplamak için
          bellekte işler, saklamaz. Web sunucusu her istek için IP adresi, zaman, adres, durum kodu ve tarayıcı bilgisini kaydeder;
          bu kayıtlar güvenlik ve işletim amacıyla (KVKK m. 5/2-f, meşru menfaat) tutulur ve <strong className="text-fg">30 gün</strong>{" "}
          sonra silinir. Veriler satılmaz; yalnızca barındırma sağlayıcısı (bizim adımıza) ve yasal zorunlulukta yetkili makamlar
          erişebilir. KVKK m. 11 kapsamındaki haklarınız için <A href={ISSUES}>GitHub issues</A> üzerinden kişisel veri paylaşmadan
          başvurun; size özel bir iletişim yolu bildiririz. İngilizce metin esastır.
        </P>
      </DocPage>
    </div>
  );
}
