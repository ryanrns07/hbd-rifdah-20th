import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/sections/Hero";
import Gallery from "@/components/sections/Gallery";
import Guestbook from "@/components/sections/Guestbook";

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
      {/* ═══ Act I: The Cinematic Entrance ═══ */}
      <Hero videoSrc={heroVideoSrc} />

      {/* ═══ Act II: The Chapters of You ═══ */}
      <Gallery />

      {/* ═══ Act III: Guestbook (Task 4) ═══ */}
      <Guestbook />

      {/* ═══ Footer ═══ */}
      <footer
        className="relative py-12 px-6 text-center"
        style={{
          background: "var(--color-bg-primary)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div className="divider-accent mx-auto mb-6" />
        <p
          className="text-romantic text-sm md:text-base mb-2"
        >
          &ldquo;Kamu adalah puisi yang tak pernah selesai kubaca.&rdquo;
        </p>
        <p
          className="text-xs tracking-[0.2em] uppercase mt-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          Made with ♥ — Rifdah&apos;s 20th Era
        </p>
      </footer>
    </main>
  );
}
