/** Things that change when the app ships. Everything else on the site reads from here. */
export const config = {
  name: "Paw Party",
  /** The App Store listing. Leave empty until the app is live; the badge then says so. */
  appStoreUrl: "",
  /** Where support requests go. Leave empty to hide the contact line. */
  supportEmail: "",
  /** Canonical address of the site, used in metadata and the sitemap. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paw-party-site.vercel.app",
  /** Set to true once the privacy and support text has been reviewed. Until then those pages say so. */
  legalReviewed: false,
} as const;
