"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLenis } from "lenis/react";

interface HeroProps {
  videoSrc: string;
}

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.3, delayChildren: 0.5 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const dividerVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const bounceVariants = {
  animate: {
    y: [0, 8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/* ─── Typewriter hook inline ─── */
function TypewriterText({ text, delay = 2 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.p
      ref={ref}
      className="text-romantic text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.03,
            delay: delay + i * 0.04,
            ease: "easeIn",
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ─── Hero Component ─── */
export default function Hero({ videoSrc }: HeroProps) {
  const lenis = useLenis();

  const handleScrollDown = () => {
    if (lenis) {
      // Use Lenis for an ultra-smooth, slow scroll to the gallery
      lenis.scrollTo("#gallery", {
        duration: 3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      // Fallback
      const gallery = document.getElementById("gallery");
      if (gallery) {
        gallery.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative flex h-screen items-center justify-center overflow-hidden"
    >
      {/* ── Background Video ── */}
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className="video-cinematic absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* ── Gradient Overlay ── */}
      <div className="video-overlay absolute inset-0 z-[1]" />

      {/* ── Vignette Edges ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          boxShadow: "inset 0 0 150px 60px rgba(10, 8, 8, 0.6)",
        }}
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative top line */}
        <motion.div
          className="divider-accent mx-auto mb-8"
          variants={dividerVariants}
        />

        {/* Eyebrow label */}
        <motion.span
          className="inline-block text-xs sm:text-sm tracking-[0.3em] uppercase mb-6"
          style={{ color: "var(--color-text-accent)", fontFamily: "var(--font-outfit)" }}
          variants={fadeUpVariants}
        >
          Kado Ulang Tahun dari Ryan &bull; Untuk Bidadariku
        </motion.span>

        {/* Main Headline */}
        <motion.h1
          className="heading-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-8"
          variants={fadeUpVariants}
        >
          Dua Dekade
          <br />
          <span className="text-accent-warm">Penuh Keanggunan.</span>
        </motion.h1>

        {/* Typewriter sub-headline */}
        <TypewriterText
          text="Selamat ulang tahun ke-20, Rifdah Nur Shafiyah. Terima kasih telah hadir, mewarnai setiap detak hidupku, dan menjadi rumah ternyaman tempatku berpulang."
          delay={2.5}
        />

        {/* Bottom divider */}
        <motion.div
          className="divider-accent mx-auto mt-10 mb-10"
          variants={dividerVariants}
        />

        {/* CTA Button */}
        <motion.div variants={fadeUpVariants}>
          <button
            onClick={handleScrollDown}
            className="btn-primary"
            aria-label="Mulai perjalanan — scroll ke galeri"
          >
            <span>Susuri Kenangan Kita ✨</span>
          </button>
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
        onClick={handleScrollDown}
        variants={bounceVariants}
        animate="animate"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        transition={{ delay: 4 }}
      >
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Scroll
        </span>
        <ChevronDown size={18} style={{ color: "var(--color-text-muted)" }} />
      </motion.div>
    </section>
  );
}
