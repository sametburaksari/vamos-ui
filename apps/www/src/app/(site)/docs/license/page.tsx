import { Badge } from "@vamos-cms/ui";
import { A, C, DocPage, H2, P, Table, UL } from "@/components/docs/prose";

export const metadata = { title: "License" };

const yes = <Badge tone="success">Yes</Badge>;
const no = <Badge tone="danger">No</Badge>;

export default function LicensePage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="License & trademark"
      description="The component kit is MIT. The Vamos panel apps are source-available. The names are trademarks."
      toc={[
        { id: "kit", title: "Component kit — MIT" },
        { id: "apps", title: "Panel apps — FSL" },
        { id: "trademark", title: "Trademark" },
        { id: "can-i", title: "Can I…?" },
        { id: "contributing", title: "Contributing" },
      ]}
      prev={{ href: "/directory", title: "Directory" }}
      next={{ href: "/docs/changelog", title: "Changelog" }}
    >
      <H2 id="kit">Component kit — MIT</H2>
      <P>
        <C>@vamos-cms/ui</C>, the docs examples and the registry items are released under the MIT license. Use them in any
        project, commercial or not. Keep the copyright notice in copied files.
      </P>

      <H2 id="apps">Panel apps — FSL</H2>
      <P>
        The Vamos panel apps (Site/CMS, CRM, People, Work) are source-available under the{" "}
        <A href="https://fsl.software">Functional Source License, version 1.1, with Apache 2.0 future license</A>{" "}
        (FSL-1.1-ALv2):
      </P>
      <UL>
        <li>You can read, use, modify and self-host them, including for your own business.</li>
        <li>You may not offer them, or a modified version, as a competing commercial product or service.</li>
        <li>Each release automatically becomes Apache-2.0 two years after it is published.</li>
      </UL>

      <H2 id="trademark">Trademark</H2>
      <P>
        &quot;Vamos&quot;, &quot;Vamos UI&quot; and the logo are trademarks of Vamos. The licenses cover the code, not the
        names. A fork must use a different name and logo. Saying your project is &quot;built with Vamos UI&quot; is fine.
      </P>

      <H2 id="can-i">Can I…?</H2>
      <Table
        head={["Question", "Answer"]}
        rows={[
          ["Use the kit in client projects", yes],
          ["Sell websites or panels built with the kit", yes],
          ["Copy components and change them", yes],
          ["Self-host the panel apps for my company", yes],
          ["Resell the kit itself as a UI kit under the Vamos name", no],
          ["Fork the panel apps and sell them as a SaaS", <span key="saas" className="flex items-center gap-2">{no}<span className="text-fg-muted">until that release becomes Apache-2.0</span></span>],
          ["Remove the copyright notice", no],
        ]}
      />

      <H2 id="contributing">Contributing</H2>
      <P>
        Contributions are accepted under the Developer Certificate of Origin: sign off each commit with{" "}
        <C>git commit -s</C>. Contributions to the kit are MIT; contributions to the apps follow the apps&apos; license.
      </P>
    </DocPage>
  );
}
