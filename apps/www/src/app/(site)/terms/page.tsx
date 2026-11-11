import { A, C, DocPage, H2, P, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms of service",
  description:
    "Terms for the Vamos UI docs site, registry and hosted MCP server (mcp.vamos.ist): licences, trademarks, acceptable use, availability, no warranty and governing law.",
  path: "/terms/",
});

const ISSUES = "https://github.com/sametburaksari/vamos-ui/issues";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-8">
      <DocPage
        eyebrow="Legal · Last updated 12 November 2026"
        title="Terms of service"
        description="Short terms for a free developer service. The code is open source; the hosted services are provided as they are."
        toc={[
          { id: "scope", title: "What these terms cover" },
          { id: "licences", title: "Code licences" },
          { id: "trademarks", title: "Name and logo" },
          { id: "use", title: "Acceptable use" },
          { id: "availability", title: "Availability" },
          { id: "output", title: "Tool output" },
          { id: "warranty", title: "No warranty" },
          { id: "liability", title: "Liability" },
          { id: "law", title: "Governing law" },
          { id: "changes", title: "Changes and contact" },
        ]}
      >
        <H2 id="scope">What these terms cover</H2>
        <P>
          These terms apply to the documentation site <C>https://ui.vamos.ist</C>, the component registry under{" "}
          <C>https://ui.vamos.ist/r/</C> and the hosted MCP server <C>https://mcp.vamos.ist/mcp</C> (together, &ldquo;the
          services&rdquo;), provided free of charge by Vamos, a digital agency in Istanbul, Türkiye (&ldquo;Vamos&rdquo;,
          &ldquo;we&rdquo;). By using the services you accept these terms. How we handle data is described in the{" "}
          <A href="/privacy">privacy policy</A>.
        </P>

        <H2 id="licences">Code licences</H2>
        <P>
          The component kit (<C>@vamos-ui/react</C>), the registry items, the documentation site source, the <C>vamos-ui</C> CLI
          and the <C>@vamos-ui/mcp</C> package are open source under the MIT License. Code you copy from the registry or the docs is
          yours to use under that licence, including in commercial and closed-source work, as long as you keep the copyright notice.
          Some other parts of the repository use different licences; <A href="/docs/license">License</A> and{" "}
          <A href="https://github.com/sametburaksari/vamos-ui/blob/main/LICENSE.md">LICENSE.md</A> are authoritative.
        </P>

        <H2 id="trademarks">Name and logo</H2>
        <P>
          &ldquo;Vamos&rdquo;, &ldquo;Vamos UI&rdquo;, &ldquo;Vamos CMS&rdquo; and the Vamos logo are trademarks of Vamos and are not
          covered by the open-source licences. You may say your project is &ldquo;built with Vamos UI&rdquo; and link to us. You
          may not use the names or logo for a fork, package, registry, theme or hosted service, or imply that we endorse you,
          without written permission. See the{" "}
          <A href="https://github.com/sametburaksari/vamos-ui/blob/main/TRADEMARKS.md">trademark policy</A>.
        </P>

        <H2 id="use">Acceptable use</H2>
        <P>When you use the services, including through an AI client, do not:</P>
        <UL>
          <li>attack, probe or try to break into the servers, or bypass any limit or protection;</li>
          <li>send traffic at a volume that degrades the service for others (normal use by AI clients and the CLI is fine; for heavy automated use, run your own MCP server or mirror the registry);</li>
          <li>use the services for anything unlawful, or to build or distribute malware;</li>
          <li>send passwords, keys or other people&apos;s personal data in tool arguments;</li>
          <li>present the services, or content from them, as your own product under the Vamos name.</li>
        </UL>
        <P>We may block traffic that breaks these rules or threatens the services, without notice.</P>

        <H2 id="availability">Availability</H2>
        <P>
          The services are free and provided on a best-effort basis. We do not guarantee that they are available, uninterrupted or
          error-free, and we may change, rate-limit, suspend or discontinue any of them at any time. You can always run the MCP server
          and the registry yourself (<C>npx -y @vamos-ui/mcp</C>, <A href="/docs/publish-a-registry">Publish a registry</A>).
        </P>

        <H2 id="output">Tool output and your code</H2>
        <P>
          The MCP tools return documentation, code, plans, commands and lint results. They are aids, not guarantees: a clean{" "}
          <C>verify_code</C> result does not mean code is accessible, secure or correct in every respect. You are responsible for
          reviewing, testing and deciding what you ship, and for the commands you or your AI client run.
        </P>

        <H2 id="warranty">No warranty</H2>
        <P>
          The services and all content are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any
          kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement, to the
          extent the law allows.
        </P>

        <H2 id="liability">Liability</H2>
        <P>
          To the extent the law allows, Vamos is not liable for indirect or consequential damages, lost profits, lost data or
          business interruption arising from the use of, or inability to use, the services. Nothing in these terms limits liability
          that cannot be limited by law, such as liability for intent or gross negligence.
        </P>

        <H2 id="law">Governing law</H2>
        <P>
          These terms are governed by the laws of the Republic of Türkiye. The courts and enforcement offices of Istanbul have
          jurisdiction, without prejudice to mandatory consumer protection rules of your country of residence.
        </P>

        <H2 id="changes">Changes and contact</H2>
        <P>
          We may update these terms; the date at the top shows the latest version and the history is public in the{" "}
          <A href="https://github.com/sametburaksari/vamos-ui">repository</A>. Questions: <A href={ISSUES}>GitHub issues</A>.
        </P>
      </DocPage>
    </div>
  );
}
