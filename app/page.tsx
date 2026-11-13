import { Demo } from "@/components/demo";
import { Games } from "@/components/games";
import { Hero } from "@/components/hero";
import { ForHumans, ForPaws, Free, Questions, SiteFooter } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <Demo />
        <Games />
        <ForPaws />
        <ForHumans />
        <Free />
        <Questions />
      </main>
      <SiteFooter />
    </>
  );
}
