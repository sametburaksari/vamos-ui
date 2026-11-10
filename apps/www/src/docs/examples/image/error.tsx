import { Image } from "@vamos-cms/ui";

export default function ImageError() {
  return (
    <div className="grid w-full max-w-xl grid-cols-3 gap-4">
      <figure className="m-0">
        <Image src="https://cdn.example.invalid/missing-logo.png" alt="Atlas Lojistik logo" width={400} height={400} aspect="1/1" rounded="ui" frame="surface" />
        <figcaption className="mt-2 text-[12px] text-fg-muted">Broken source</figcaption>
      </figure>
      <figure className="m-0">
        <Image
          src="https://cdn.example.invalid/missing-avatar.jpg"
          alt="Selin Kaya"
          width={400}
          height={400}
          aspect="1/1"
          rounded="full"
          fallback={<span className="font-display text-2xl text-fg-muted">SK</span>}
        />
        <figcaption className="mt-2 text-[12px] text-fg-muted">Custom fallback</figcaption>
      </figure>
      <figure className="m-0">
        <Image
          src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=70&auto=format&fit=crop"
          alt="Laptop on a desk"
          width={600}
          height={400}
          aspect="1/1"
          rounded="ui"
          processing
        />
        <figcaption className="mt-2 text-[12px] text-fg-muted">Still processing</figcaption>
      </figure>
    </div>
  );
}
