import Image from "next/image";
import { config } from "@/content/config";
import { copy } from "@/content/copy";

/** Apple's official badge. Until the listing exists it points at the "free" section and says so. */
export function AppStoreBadge({ note = true, dark = false }: { note?: boolean; dark?: boolean }) {
  const live = config.appStoreUrl.length > 0;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        href={live ? config.appStoreUrl : "#free"}
        className="inline-block transition-transform hover:scale-[1.03] active:scale-[0.98]"
        data-testid="app-store-badge"
      >
        <Image
          src="/badges/app-store.svg"
          alt="Download on the App Store"
          width={180}
          height={60}
          unoptimized
          loading="eager"
        />
      </a>
      {!live && note ? (
        <span className={`text-sm font-medium ${dark ? "text-white/70" : "text-ink/70"}`}>{copy.hero.comingSoon}</span>
      ) : null}
    </div>
  );
}
