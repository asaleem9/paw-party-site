import type { Metadata } from "next";
import { TextPage } from "@/components/sections";
import { config } from "@/content/config";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.privacy.title,
  robots: config.legalReviewed ? undefined : { index: false },
};

export default function Privacy() {
  return (
    <TextPage title={copy.privacy.title}>
      {config.legalReviewed ? null : (
        <p className="mb-10 rounded-2xl bg-sun px-5 py-4 font-semibold text-ink" data-testid="draft-note">
          {copy.privacy.draftNote}
        </p>
      )}
      {copy.privacy.sections.map((section) => (
        <section key={section.heading} className="mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mt-3">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </TextPage>
  );
}
