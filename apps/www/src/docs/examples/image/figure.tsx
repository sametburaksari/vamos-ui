import { Figure, FigureCaption, Image } from "@vamos-cms/ui";

export default function ImageFigure() {
  return (
    <Figure className="w-full max-w-lg">
      <Image
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop"
        alt="Glass office tower seen from below against a clear sky"
        width={1200}
        height={1600}
        aspect="4/3"
        focal={{ x: 0.5, y: 0.3 }}
        rounded="ui"
      />
      <FigureCaption credit="Photo: Can Yıldız">Levent Plaza, where the Istanbul team moves in March 2027.</FigureCaption>
    </Figure>
  );
}
