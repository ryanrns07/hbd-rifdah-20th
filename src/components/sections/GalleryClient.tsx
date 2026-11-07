"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface GalleryClientProps {
  /** Photo filenames from the server component */
  photos: string[];
  /** Video filenames from the server component */
  videos: string[];
  /** Floating romantic quotes */
  quotes: string[];
}

type GalleryItem =
  | { kind: "photo"; filename: string }
  | { kind: "video"; filename: string }
  | { kind: "quote"; text: string };

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const PHOTO_BASE = "/media/photos/";
const VIDEO_BASE = "/media/videos/";
const QUOTE_INTERVAL = 4;
const AVG_CARD_WIDTH = 420;

/* ═══════════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════════ */

function SectionHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center py-20 md:py-28 px-6"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        className="text-xs tracking-[0.3em] uppercase mb-4"
        style={{ color: "var(--color-text-accent)" }}
      >
        Jejak Langkah Kita & Kenangan Indah
      </span>
      <div className="divider-accent mx-auto mb-6" />
      <h2 className="heading-cinematic text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">
        The Chapters of <span className="text-accent-warm">You & Us</span>
      </h2>
      <p
        className="text-sm sm:text-base max-w-lg"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Setiap potret dan tawa yang terabadikan adalah bukti betapa berharganya setiap detik yang kulalui bersamamu.
      </p>
    </motion.div>
  );
}

/** A single photo card with parallax reveal */
function PhotoCard({
  filename,
  index,
  progress,
}: {
  filename: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const isLarge = index % 5 === 0;
  const isTall = index % 3 === 1;

  const cardWidth = isLarge ? "min(500px, 80vw)" : "min(360px, 75vw)";
  const cardHeight = isTall ? "450px" : isLarge ? "500px" : "380px";

  const src = PHOTO_BASE + encodeURIComponent(filename);

  const y = useTransform(
    progress,
    [0, 1],
    [index % 2 === 0 ? 30 : -30, index % 2 === 0 ? -30 : 30]
  );

  return (
    <motion.div
      ref={ref}
      className="flex-shrink-0 relative overflow-hidden rounded-xl group"
      style={{ width: cardWidth, height: cardHeight, y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        delay: 0.05 * (index % 6),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Image
        src={src}
        alt={`Kenangan bersama Rifdah — foto ${index + 1}`}
        fill
        sizes="(max-width: 768px) 80vw, 500px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          objectPosition: "center 20%",
          filter: "brightness(0.88) contrast(1.05) saturate(0.95) sepia(0.05)",
        }}
        unoptimized
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Bottom warm glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4"
        style={{
          background: "linear-gradient(to top, rgba(10,8,8,0.4), transparent)",
        }}
      />
    </motion.div>
  );
}

/** A floating quote card */
function QuoteCard({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className="flex-shrink-0 flex items-center justify-center px-6"
      style={{ width: "min(320px, 70vw)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center">
        <span
          className="block text-5xl mb-4 leading-none"
          style={{ color: "var(--color-accent)", fontFamily: "Georgia, serif" }}
        >
          &ldquo;
        </span>
        <p className="text-romantic text-base sm:text-lg md:text-xl leading-relaxed">
          {text}
        </p>
        <div className="divider-accent mx-auto mt-6" />
      </div>
    </motion.div>
  );
}

/** A video card */
function VideoCard({ filename }: { filename: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const src = VIDEO_BASE + encodeURIComponent(filename);

  return (
    <motion.div
      ref={ref}
      className="flex-shrink-0 relative overflow-hidden rounded-xl"
      style={{ width: "min(400px, 80vw)", height: "420px" }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="video-cinematic absolute inset-0 h-full w-full rounded-xl"
      />
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(10,8,8,0.5) 0%, transparent 40%)",
        }}
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--color-accent)" }}
        />
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Video memori
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN GALLERY CLIENT COMPONENT
   ═══════════════════════════════════════════════ */

export default function GalleryClient({
  photos,
  videos,
  quotes,
}: GalleryClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  /* ── SSR-safe window dimensions ── */
  const [windowWidth, setWindowWidth] = useState(1200);
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Build interleaved items ── */
  const items = useMemo<GalleryItem[]>(() => {
    const result: GalleryItem[] = [];
    let qIdx = 0;
    let vIdx = 0;

    for (let i = 0; i < photos.length; i++) {
      result.push({ kind: "photo", filename: photos[i] });

      if ((i + 1) % QUOTE_INTERVAL === 0 && qIdx < quotes.length) {
        result.push({ kind: "quote", text: quotes[qIdx] });
        qIdx++;
      }

      if ((i + 1) % 8 === 0 && vIdx < videos.length) {
        result.push({ kind: "video", filename: videos[vIdx] });
        vIdx++;
      }
    }

    while (vIdx < videos.length) {
      result.push({ kind: "video", filename: videos[vIdx] });
      vIdx++;
    }

    return result;
  }, [photos, videos, quotes]);

  /* ── Scroll dimensions ── */
  const estimatedScrollWidth = items.length * AVG_CARD_WIDTH;
  const sectionHeight = estimatedScrollWidth + windowHeight;

  /* ── Framer Motion horizontal scroll ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["1%", `-${Math.max(0, estimatedScrollWidth - windowWidth)}px`]
  );

  return (
    <section id="gallery">
      <SectionHeader />

      {/* Pinned horizontal scroll container */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${sectionHeight}px` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <motion.div
            ref={scrollTrackRef}
            className="flex gap-5 md:gap-7 items-center pl-8 md:pl-16"
            style={{ x }}
          >
            {items.map((item, i) => {
              switch (item.kind) {
                case "photo":
                  return (
                    <PhotoCard
                      key={`photo-${i}`}
                      filename={item.filename}
                      index={i}
                      progress={scrollYProgress}
                    />
                  );
                case "video":
                  return (
                    <VideoCard
                      key={`video-${i}`}
                      filename={item.filename}
                    />
                  );
                case "quote":
                  return (
                    <QuoteCard
                      key={`quote-${i}`}
                      text={item.text}
                    />
                  );
              }
            })}

            {/* End spacer */}
            <div className="flex-shrink-0 w-[30vw]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
