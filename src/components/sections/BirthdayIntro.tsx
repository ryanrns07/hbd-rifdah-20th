"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Wind, Sparkles, Heart, Volume2 } from "lucide-react";

interface BirthdayIntroProps {
  onComplete?: () => void;
}

export default function BirthdayIntro({ onComplete }: BirthdayIntroProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBlown, setIsBlown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const blowCountRef = useRef(0);

  // Play a celebratory synth chime using Web Audio API
  const playCelebrationChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Bright romantic arpeggio)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch {
      // AudioContext not allowed or not supported; gracefully ignore
    }
  }, []);

  // Trigger candle blowout & celebration
  const triggerBlowout = useCallback(() => {
    if (isBlown) return;
    setIsBlown(true);
    setIsListening(false);

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // Play chime
    playCelebrationChime();

    // Trigger fireworks / confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ["#d4a574", "#e0a96d", "#f5efe6", "#ff6b8b", "#ffd166"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ["#d4a574", "#e0a96d", "#f5efe6", "#ff6b8b", "#ffd166"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big heart burst in center
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.55 },
        colors: ["#c8956c", "#ff4d6d", "#ffffff", "#ffd700"],
      });
    }, 400);
  }, [isBlown, playCelebrationChime]);

  // Start microphone listening
  const startMicrophone = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError("Browser tidak mendukung sensor mikrofon. Gunakan tombol tiup manual.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsListening(true);
      blowCountRef.current = 0;

      const detectBlow = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average energy in lower frequency bins (wind/blow noise creates strong low rumble)
        let lowEnergy = 0;
        const lowBins = Math.min(24, bufferLength);
        for (let i = 0; i < lowBins; i++) {
          lowEnergy += dataArray[i];
        }
        const avgLow = lowEnergy / lowBins;
        setAudioLevel(Math.min(100, Math.round(avgLow)));

        // Blow detection threshold
        if (avgLow > 65) {
          blowCountRef.current += 1;
          if (blowCountRef.current >= 3) {
            triggerBlowout();
            return;
          }
        } else {
          blowCountRef.current = Math.max(0, blowCountRef.current - 0.5);
        }

        animFrameRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err: unknown) {
      console.warn("Microphone access error:", err);
      setMicError("Izin mikrofon tidak diberikan. Kamu bisa meniupnya dengan sentuhan tombol.");
      setIsListening(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleEnterWebsite = () => {
    setIsDismissed(true);
    if (onComplete) onComplete();
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isDismissed) {
    return (
      // Small re-open button fixed in the corner so she can replay anytime
      <motion.button
        onClick={() => {
          setIsDismissed(false);
          setIsBlown(false);
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-wider backdrop-blur-md transition-all hover:scale-105 shadow-xl"
        style={{
          background: "rgba(20, 16, 14, 0.85)",
          color: "var(--color-accent)",
          border: "1px solid var(--color-border-hover)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ boxShadow: "0 0 20px rgba(200, 149, 108, 0.4)" }}
      >
        <span>🎂</span>
        <span>Tiup Lilin Lagi</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          background: "radial-gradient(circle at center, #1b1311 0%, #0a0808 70%, #050404 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.2 } }}
      >
        {/* Ambient warm glow behind cake */}
        <div
          className="absolute pointer-events-none rounded-full blur-3xl transition-opacity duration-1000"
          style={{
            width: "480px",
            height: "480px",
            background: isBlown
              ? "radial-gradient(circle, rgba(200, 149, 108, 0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(251, 133, 0, 0.28) 0%, rgba(200, 149, 108, 0.12) 50%, transparent 70%)",
          }}
        />

        {/* Floating golden dust particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#ffd700]"
              style={{
                left: `${(i * 19) % 100}%`,
                top: `${(i * 23) % 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center py-6">
          {/* Eyebrow badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 text-[11px] tracking-[0.25em] uppercase"
            style={{
              background: "rgba(200, 149, 108, 0.12)",
              color: "var(--color-accent-light)",
              border: "1px solid rgba(200, 149, 108, 0.25)",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={13} className="text-[#ffd700]" />
            <span>Spesial Untuk Rifdah Nur Shafiyah</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="heading-cinematic text-3xl sm:text-4xl md:text-5xl mb-2 font-serif text-[#f5efe6]"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isBlown ? (
              <span className="text-accent-warm">Selamat Ulang Tahun ke-20!</span>
            ) : (
              <>
                Make a Wish, <span className="text-accent-warm">Sayang</span>
              </>
            )}
          </motion.h1>

          <motion.p
            className="text-xs sm:text-sm text-romantic max-w-sm mb-6 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isBlown
              ? "Lilin telah terpadamkan dan seluruh semesta mengaminkan doamu. Hari ini adalah awal dari dekade terindahmu."
              : "Tutup matamu sejenak, ucapkan doa terbaikmu dalam hati, lalu tiup lilin ini dengan sepenuh jiwa..."}
          </motion.p>

          {/* ═══════════════════════════════════════════
              THE BIRTHDAY CAKE & NUMBER 20 CANDLES
             ═══════════════════════════════════════════ */}
          <div
            className="relative my-4 cursor-pointer select-none group"
            onClick={triggerBlowout}
            title={isBlown ? "Lilin sudah ditiup" : "Klik untuk meniup lilin"}
          >
            {/* The SVG Birthday Cake */}
            <svg
              width="260"
              height="260"
              viewBox="0 0 260 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            >
              {/* Plate / Stand */}
              <ellipse cx="130" cy="235" rx="100" ry="14" fill="#2a1e19" stroke="#d4a574" strokeWidth="1.5" />
              <ellipse cx="130" cy="233" rx="90" ry="10" fill="#1f1612" />

              {/* Bottom Tier Cake */}
              <rect x="55" y="150" width="150" height="75" rx="10" fill="url(#bottomTierGrad)" />
              {/* Cream dripping */}
              <path
                d="M55 165 C 65 175, 75 160, 85 172 C 95 180, 105 165, 115 175 C 125 182, 135 168, 145 176 C 155 182, 165 166, 175 174 C 185 180, 195 168, 205 165"
                stroke="#f7ede2"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              {/* Bottom tier decorative dots / pearls */}
              <circle cx="75" cy="205" r="3.5" fill="#ffd700" opacity="0.8" />
              <circle cx="105" cy="208" r="3.5" fill="#ffd700" opacity="0.8" />
              <circle cx="130" cy="210" r="4" fill="#ffd700" opacity="0.9" />
              <circle cx="155" cy="208" r="3.5" fill="#ffd700" opacity="0.8" />
              <circle cx="185" cy="205" r="3.5" fill="#ffd700" opacity="0.8" />

              {/* Top Tier Cake */}
              <rect x="75" y="95" width="110" height="60" rx="8" fill="url(#topTierGrad)" />
              {/* Top cream dripping */}
              <path
                d="M75 106 C 85 116, 95 104, 105 114 C 115 120, 125 108, 135 116 C 145 122, 155 108, 165 116 C 175 120, 180 110, 185 106"
                stroke="#f7ede2"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Strawberries / Rosettes on top tier */}
              <circle cx="90" cy="94" r="5" fill="#e63946" />
              <circle cx="115" cy="92" r="5" fill="#e63946" />
              <circle cx="145" cy="92" r="5" fill="#e63946" />
              <circle cx="170" cy="94" r="5" fill="#e63946" />

              {/* ── CANDLE "2" ── */}
              {/* Candle Body '2' */}
              <path
                d="M102 52 C 102 44, 114 44, 114 52 C 114 60, 102 68, 100 78 L 118 78"
                stroke="url(#goldCandleGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Wick */}
              <line x1="108" y1="44" x2="108" y2="38" stroke="#555" strokeWidth="2" strokeLinecap="round" />

              {/* ── CANDLE "0" ── */}
              {/* Candle Body '0' */}
              <rect
                x="138"
                y="46"
                width="16"
                height="32"
                rx="8"
                stroke="url(#goldCandleGrad)"
                strokeWidth="5"
                fill="none"
              />
              {/* Wick */}
              <line x1="146" y1="46" x2="146" y2="38" stroke="#555" strokeWidth="2" strokeLinecap="round" />

              {/* Gradients */}
              <defs>
                <linearGradient id="bottomTierGrad" x1="55" y1="150" x2="205" y2="225" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4a2822" />
                  <stop offset="0.5" stopColor="#361b17" />
                  <stop offset="1" stopColor="#25120f" />
                </linearGradient>
                <linearGradient id="topTierGrad" x1="75" y1="95" x2="185" y2="155" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#63372c" />
                  <stop offset="0.5" stopColor="#49241d" />
                  <stop offset="1" stopColor="#301511" />
                </linearGradient>
                <linearGradient id="goldCandleGrad" x1="100" y1="40" x2="150" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffd700" />
                  <stop offset="0.5" stopColor="#d4af37" />
                  <stop offset="1" stopColor="#aa771c" />
                </linearGradient>
              </defs>
            </svg>

            {/* ── CANDLE FLAMES (Visible when NOT blown) ── */}
            {!isBlown && (
              <>
                {/* Flame on '2' */}
                <motion.div
                  className="absolute"
                  style={{
                    left: "102px",
                    top: "22px",
                  }}
                  animate={{
                    scale: [1, 1.15, 0.95, 1.1, 1],
                    y: [0, -2, 1, -1, 0],
                    rotate: [-2, 3, -1, 2, -2],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="w-4 h-7 rounded-full relative"
                    style={{
                      background: "radial-gradient(ellipse at 50% 80%, #ffffff 0%, #ffea79 25%, #ff9e00 60%, #ff3c00 90%, transparent 100%)",
                      filter: "drop-shadow(0 0 10px #ff9e00) drop-shadow(0 0 20px #ff5400)",
                    }}
                  />
                </motion.div>

                {/* Flame on '0' */}
                <motion.div
                  className="absolute"
                  style={{
                    left: "140px",
                    top: "22px",
                  }}
                  animate={{
                    scale: [1, 1.1, 0.9, 1.15, 1],
                    y: [0, -1, 2, -2, 0],
                    rotate: [2, -3, 1, -2, 2],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: 0.15,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="w-4 h-7 rounded-full relative"
                    style={{
                      background: "radial-gradient(ellipse at 50% 80%, #ffffff 0%, #ffea79 25%, #ff9e00 60%, #ff3c00 90%, transparent 100%)",
                      filter: "drop-shadow(0 0 10px #ff9e00) drop-shadow(0 0 20px #ff5400)",
                    }}
                  />
                </motion.div>
              </>
            )}

            {/* ── SMOKE PUFFS (When blown) ── */}
            {isBlown && (
              <>
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-white/40 blur-[1px]"
                  style={{ left: "107px", top: "35px" }}
                  initial={{ opacity: 0.8, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 3.5, x: -8 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-white/40 blur-[1px]"
                  style={{ left: "145px", top: "35px" }}
                  initial={{ opacity: 0.8, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 3.5, x: 8 }}
                  transition={{ duration: 1.6, delay: 0.1, ease: "easeOut" }}
                />
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════
              CONTROLS & ACTION BUTTONS
             ═══════════════════════════════════════════ */}
          {!isBlown ? (
            <div className="flex flex-col items-center gap-3 mt-4 w-full px-4">
              {/* Mic Status / Level bar when listening */}
              {isListening && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
                  style={{
                    background: "rgba(224, 169, 109, 0.15)",
                    color: "var(--color-accent-light)",
                    border: "1px solid var(--color-border-hover)",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Mendengarkan tiupanmu... Tiup mikrofon HP-mu sekarang!</span>
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden ml-1">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-75"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Main Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                {!isListening ? (
                  <button
                    onClick={startMicrophone}
                    className="btn-primary flex items-center gap-2 text-xs sm:text-sm py-3 px-6 shadow-lg shadow-[#c8956c]/20"
                  >
                    <Mic size={16} />
                    <span>Nyalakan Mic & Tiup Suara</span>
                  </button>
                ) : null}

                {/* Manual blowout fallback button */}
                <button
                  onClick={triggerBlowout}
                  className="flex items-center gap-2 text-xs py-3 px-5 rounded-full transition-all"
                  style={{
                    background: isListening ? "rgba(255, 255, 255, 0.08)" : "rgba(200, 149, 108, 0.15)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Wind size={15} className="text-accent-warm" />
                  <span>{isListening ? "Atau Klik untuk Tiup Manual" : "Tiup Manual (Tanpa Mic)"}</span>
                </button>
              </div>

              {micError && (
                <p className="text-[11px] text-amber-300/80 mt-1 max-w-xs">{micError}</p>
              )}
            </div>
          ) : (
            /* Celebration Message & Button to Enter Site */
            <motion.div
              className="flex flex-col items-center gap-4 mt-4 w-full px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="p-4 sm:p-5 rounded-2xl max-w-md backdrop-blur-md"
                style={{
                  background: "rgba(20, 16, 14, 0.65)",
                  border: "1px solid var(--color-border-hover)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                }}
              >
                <div className="flex justify-center mb-2 text-[#ffd700]">
                  <Sparkles size={20} />
                </div>
                <p className="text-romantic text-sm sm:text-base leading-relaxed text-[#f5efe6] italic">
                  &ldquo;Di antara miliaran manusia di bumi, terima kasih sudah memilih untuk bertumbuh dan berbahagia bersamaku. Selamat memasuki usia 20 tahun yang penuh keanggunan, Rifdah.&rdquo;
                </p>
                <p className="text-xs text-right mt-3 text-accent-warm font-medium">
                  — Dengan segenap cinta, Ryan ♥
                </p>
              </div>

              <button
                onClick={handleEnterWebsite}
                className="btn-primary flex items-center gap-2 text-sm sm:text-base py-3.5 px-8 mt-2 shadow-2xl hover:scale-105 transition-transform"
              >
                <Heart size={16} className="fill-current text-accent-warm" />
                <span>Buka Hadiah & Kenangan Kita</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
