import fs from "node:fs";
import path from "node:path";
import BirthdayIntro from "@/components/sections/BirthdayIntro";
import MusicPlayer from "@/components/ui/MusicPlayer";
import Hero from "@/components/sections/Hero";
import Gallery from "@/components/sections/Gallery";
import LoveLetter from "@/components/sections/LoveLetter";

/**
 * Reads the first video file from /public/media/videos/
 * and returns an encoded URI path for the Hero component.
 */
function getHeroVideoSrc(): string {
  const videosDir = path.join(process.cwd(), "public", "media", "videos");
  try {
    const files = fs.readdirSync(videosDir);
    const videoFile = files.find((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".mp4", ".webm", ".mov"].includes(ext);
    });
    if (videoFile) {
      return "/media/videos/" + encodeURIComponent(videoFile);
    }
  } catch {
    console.warn("[Home] Could not read videos directory");
  }
  return "";
}

export default function Home() {
  const heroVideoSrc = getHeroVideoSrc();

  return (
    <main className="relative">
      {/* ═══ Persistent Floating Music Player (Looping BGM) ═══ */}
      <MusicPlayer />

      {/* ═══ The Interactive Birthday Cake Intro (Mic Blow Detection) ═══ */}
      <BirthdayIntro />

      {/* ═══ Act I: The Cinematic Entrance ═══ */}
      <Hero videoSrc={heroVideoSrc} />

      {/* ═══ Act II: The Chapters of You (Memories & Moments) ═══ */}
      <Gallery />

      {/* ═══ Act III: Love Letter & Hopes from Ryan (Boyfriend Edition) ═══ */}
      <LoveLetter />

      {/* ═══ Romantic Footer ═══ */}
      <footer
        className="relative py-14 px-6 text-center"
        style={{
          background: "var(--color-bg-primary)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div className="divider-accent mx-auto mb-6" />
        <p className="text-romantic text-base sm:text-lg mb-2 text-[#f5efe6]">
          &ldquo;Dua puluh tahun yang lalu semesta menciptakanmu, dan hari ini aku bersyukur memilikimu.&rdquo;
        </p>
        <p
          className="text-xs tracking-[0.25em] uppercase mt-4"
          style={{ color: "var(--color-text-accent)" }}
        >
          Dibuat dengan sepenuh cinta oleh Ryan &bull; Untuk Rifdah Nur Shafiyah
        </p>
        <p
          className="text-[11px] tracking-[0.15em] uppercase mt-1 opacity-40 text-[#f5efe6]"
        >
          Rifdah&apos;s 20th Era &bull; Forever & Always
        </p>
      </footer>
    </main>
  );
}
