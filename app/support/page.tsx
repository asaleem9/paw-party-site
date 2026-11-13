import type { Metadata } from "next";
import { TextPage } from "@/components/sections";
import { config } from "@/content/config";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.support.title };

export default function Support() {
  return (
    <TextPage title={copy.support.title}>
      <p>{copy.support.body}</p>
      <p className="mt-3 font-semibold text-ink" data-testid="support-contact">
        {config.supportEmail ? (
          <>
            {copy.support.contactPrefix}{" "}
            <a href={`mailto:${config.supportEmail}`} className="underline underline-offset-4">
              {config.supportEmail}
            </a>
          </>
        ) : (
          copy.support.noContact
        )}
      </p>

      <h2 className="mt-12 font-display text-2xl font-extrabold tracking-tight text-ink">{copy.support.tipsTitle}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        {copy.support.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-extrabold tracking-tight text-ink">{copy.questions.title}</h2>
      <dl className="mt-4 space-y-6">
        {copy.questions.items.map((item) => (
          <div key={item.q}>
            <dt className="font-display text-xl font-extrabold tracking-tight text-ink">{item.q}</dt>
            <dd className="mt-1">{item.a}</dd>
          </div>
        ))}
      </dl>
    </TextPage>
  );
}
