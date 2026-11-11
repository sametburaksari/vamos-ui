"use client";

import * as React from "react";
import { Container, FeatureGrid, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { useCourse } from "./course-provider";
import { CourseCompare } from "./course-compare";
import { copyFor } from "./content";

const c = {
  crumb: { en: "Courses", tr: "Kurslar" },
  title: { en: "Three courses, *side by side*", tr: "Üç kurs, *yan yana*" },
  lead: { en: "Same instructors, same cars, same test route. What changes is how many lessons you get, how much classroom time, and how fast you go. Switch licence and pace — the table recalculates.", tr: "Aynı eğitmenler, aynı araçlar, aynı sınav güzergâhı. Değişen; ders sayısı, sınıf süresi ve ilerleme hızınız. Ehliyet sınıfını ve hızı değiştirin — tablo yeniden hesaplar." },
  table: { en: "Course comparison", tr: "Kurs karşılaştırması" },
  allEyebrow: { en: "On every course", tr: "Her kursta" },
  allTitle: { en: "What you never pay *extra* for", tr: "Asla *ek ücret* ödemedikleriniz" },
};

export function CoursesPage() {
  const { t, locale } = useCourse();
  const { intl, labels } = copyFor(locale);
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Clearroad", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.table)} className="pt-4!">
        <Container>
          <CourseCompare />
        </Container>
      </Section>
      <FeatureGrid
        locale={intl}
        labels={labels}
        variant="list"
        theme={{ surface: "surface-2" }}
        eyebrow={t(c.allEyebrow)}
        title={t(c.allTitle)}
        items={[
          { title: t({ en: "Exam fees guidance", tr: "Sınav harcı rehberliği" }), text: t({ en: "We file the paperwork and tell you exactly which state fees to pay, and when.", tr: "Evrakları biz hazırlar, hangi resmi harcı ne zaman ödeyeceğinizi tam olarak söyleriz." }) },
          { title: t({ en: "Dual-control cars", tr: "Çift kumandalı araçlar" }), text: t({ en: "Nine cars under three years old, all with a second brake on the instructor’s side.", tr: "Üç yaşından genç dokuz araç; hepsinde eğitmen tarafında ikinci fren." }) },
          { title: t({ en: "Lesson app", tr: "Ders uygulaması" }), text: t({ en: "Book, move or cancel lessons up to 24 hours before, and see your instructor’s notes after each one.", tr: "Dersleri 24 saat öncesine kadar ayırtın, taşıyın ya da iptal edin; her dersten sonra eğitmen notlarını görün." }) },
          { title: t({ en: "Same instructor", tr: "Aynı eğitmen" }), text: t({ en: "One named instructor from the first lesson to test day, unless you ask to change.", tr: "İlk dersten sınav gününe kadar tek eğitmen; siz değiştirmek istemedikçe." }) },
        ]}
      />
    </>
  );
}
