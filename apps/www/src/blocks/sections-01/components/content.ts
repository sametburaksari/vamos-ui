// Sample media for the marketing-sections gallery (fictional businesses, real photos).

const unsplash = (id: string, w: number, h: number, alt: string) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h, alt });

export const photos = {
  diningRoom: unsplash("1517248135467-4c7edcad34c4", 2000, 1333, "The dining room at dusk, candles on oak tables"),
  mezeTable: unsplash("1414235077428-338989a2e8c0", 2000, 1333, "Plates of meze and rakı glasses on a white tablecloth"),
  spaStones: unsplash("1544161515-4ab6ce6db874", 1400, 1750, "A therapist laying warm stones beside a massage table"),
  spaRoom: unsplash("1540555700478-4be289fbecef", 1600, 1067, "A treatment room with folded towels and a lit candle"),
  studio: unsplash("1497366216548-37526070297c", 2400, 1600, "The studio’s long table by the window, late afternoon"),
  team: unsplash("1522071820081-009f0129c71c", 1600, 1067, "Four people reviewing a site layout on a laptop"),
  dashboard: unsplash("1551288049-bebda4e38f71", 2400, 1600, "Bookings report: covers per evening for October"),
  laptop: unsplash("1499951360447-b19be8fe80f5", 1600, 1067, "A site layout open on a laptop beside sketches"),
  hotelRoom: unsplash("1505691938895-1758d7feb511", 1600, 1067, "A hotel room with linen bedding and morning light"),
  clinic: unsplash("1629909613654-28e377c37b09", 1600, 1067, "A bright clinic reception with oak benches"),
};

export const featureItems = [
  { title: "Bookings from every channel", text: "WhatsApp, Instagram and the site form land in one list, newest first.", icon: "calendar-check", media: photos.laptop },
  { title: "Opening hours that stay true", text: "Change them once; the site, Google profile and auto-replies follow.", icon: "clock", media: photos.clinic },
  { title: "Reports in plain language", text: "Covers, no-shows and reply times per week, emailed on Monday at nine.", icon: "chart-line", media: photos.dashboard },
  { title: "KVKK-ready forms", text: "A linked notice, a separate marketing opt-in and nothing pre-ticked.", icon: "shield-check", media: photos.team },
];
