"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Wind, Heart, ChevronRight, RotateCcw } from "lucide-react";

interface BirthdayIntroProps {
  onComplete?: () => void;
}

type Stage = "greeting" | "lighting" | "ready" | "blown" | "stats-age" | "stats-heart" | "final-wish";

export default function BirthdayIntro({ onComplete }: BirthdayIntroProps) {
  const [stage, setStage] = useState<Stage>("greeting");
  const [litCandles, setLitCandles] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const blowCountRef = useRef(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 5 Symmetrical Candle positions on top of the cake
  const candlePositions = [80, 100, 120, 140, 160];

  // ── Step 0: Auto-advance from Greeting to Lighting Cake ──
  useEffect(() => {
    if (stage === "greeting") {
      const timer = setTimeout(() => {
        setStage("lighting");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // ── Step 1: Animated Matchstick lighting each of the 5 candles ──
  useEffect(() => {
    if (stage === "lighting") {
      setLitCandles([]);
      const timers: NodeJS.Timeout[] = [];
      [0, 1, 2, 3, 4].forEach((idx) => {
        const t = setTimeout(() => {
          setLitCandles((prev) => [...prev, idx]);
        }, 800 + idx * 750);
        timers.push(t);
      });

      // Once all 5 are lit, switch to "ready"
      const finalTimer = setTimeout(() => {
        setStage("ready");
      }, 800 + 5 * 750 + 600);
      timers.push(finalTimer);

      return () => timers.forEach(clearTimeout);
    }
  }, [stage]);

  // ── Step 3: Blowout Action & Confetti ──
  const triggerBlowout = useCallback(() => {
    if (stage === "blown" || stage === "stats-age" || stage === "stats-heart" || stage === "final-wish") return;

    setStage("blown");
    setIsListening(false);
    setLitCandles([]);

    // Stop mic stream
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

    // Celebratory Confetti bursts
    const count = 180;
    const defaults = {
      origin: { y: 0.65 },
      colors: ["#f5c869", "#ffd166", "#f48c06", "#ff4d6d", "#fbf5eb"],
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.4),
      spread: 60,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.3),
      spread: 100,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.3),
      spread: 140,
      decay: 0.91,
      scalar: 0.9,
    });

    // Automatically transition to Slide 1 (20 TAHUN) after 2.8s
    setTimeout(() => {
      setStage("stats-age");
    }, 2800);
  }, [stage]);

  // ── Microphone Blow Detection ──
  const startMicrophone = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError("Browser tidak mendukung mikrofon. Silakan gunakan tombol tahan.");
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

        let lowEnergy = 0;
        const lowBins = Math.min(20, bufferLength);
        for (let i = 0; i < lowBins; i++) {
          lowEnergy += dataArray[i];
        }
        const avgLow = lowEnergy / lowBins;

        if (avgLow > 55) {
          blowCountRef.current += 1;
          if (blowCountRef.current >= 2) {
            triggerBlowout();
            return;
          }
        } else {
          blowCountRef.current = Math.max(0, blowCountRef.current - 0.4);
        }

        animFrameRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch {
      setMicError("Izin mikrofon ditolak. Kamu bisa meniup lilin dengan tombol tahan.");
      setIsListening(false);
    }
  };

  // ── Press and Hold Handlers (TEKAN LAMA AJA) ──
  const handleHoldStart = () => {
    if (stage !== "ready") return;
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 1100;

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);

      if (pct >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        triggerBlowout();
      }
    }, 40);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
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
      <motion.button
        onClick={() => {
          setIsDismissed(false);
          setStage("lighting");
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-wider backdrop-blur-md transition-all shadow-xl select-none"
        style={{
          background: "rgba(14, 30, 24, 0.9)",
          color: "#f5c869",
          border: "1px solid rgba(245, 200, 105, 0.4)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <RotateCcw size={14} />
        <span>Tiup Lilin Lagi</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 overflow-hidden select-none"
        style={{
          background: "radial-gradient(circle at 50% 35%, #152d24 0%, #0c1b15 55%, #050b08 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.2 } }}
      >
        {/* Soft background ambient glow */}
        <div
          className="absolute pointer-events-none rounded-full blur-3xl transition-opacity duration-1000"
          style={{
            width: "440px",
            height: "440px",
            background: "radial-gradient(circle, rgba(245, 200, 105, 0.2) 0%, transparent 70%)",
            opacity: stage === "ready" || stage === "lighting" ? 1 : 0.4,
          }}
        />

        {/* ═════════════════════════════════════════════
            STAGE 0: GREETING SCREEN (Matching Frame 1)
           ═════════════════════════════════════════════ */}
        {stage === "greeting" && (
          <motion.div
            className="text-center z-10 flex flex-col items-center cursor-pointer max-w-sm"
            onClick={() => setStage("lighting")}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.6 } }}
          >
            <h1 className="text-4xl sm:text-5xl font-serif text-[#fbf5eb] mb-4 flex items-center justify-center gap-2">
              <span>Rifdah</span>
              <span className="text-3xl">😇</span>
            </h1>

            <p className="text-xl sm:text-2xl font-serif text-[#fbf5eb] flex items-center justify-center gap-2">
              <span>Selamat ulang tahun ya cantik</span>
              <span className="text-xl">☺️.</span>
            </p>

            <span className="text-xs text-[#f5c869]/70 tracking-widest uppercase mt-8 animate-pulse">
              Ketuk untuk menyalakan lilin &rarr;
            </span>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════
            STAGE 1 & 2: THE REFINED CAKE & CANDLE LIGHTING / BLOW
           ═════════════════════════════════════════════ */}
        {(stage === "lighting" || stage === "ready" || stage === "blown") && (
          <motion.div
            className="flex flex-col items-center text-center z-10 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.7 } }}
          >
            {/* Top tracked status text matching the video */}
            <motion.h2
              className="text-xs sm:text-sm tracking-[0.3em] uppercase mb-8 font-sans font-medium"
              style={{ color: "#f5c869" }}
              key={stage}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {stage === "lighting" ? "LILINNYA LAGI DINYALAIN" : "LILINNYA UDAH NYALA"}
            </motion.h2>

            {/* ── REFINED CAKE SVG (Neat, clean, perfectly centered) ── */}
            <div className="relative my-2">
              <svg
                width="240"
                height="210"
                viewBox="0 0 240 210"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
              >
                {/* Platter / Dark Circular Plate */}
                <ellipse cx="120" cy="188" rx="88" ry="12" fill="#0c231a" stroke="#16382b" strokeWidth="2" />
                <ellipse cx="120" cy="186" rx="80" ry="8" fill="#071711" />

                {/* Bottom Tier Sponge */}
                <rect x="48" y="125" width="144" height="60" rx="8" fill="#9e6e47" />

                {/* Bottom Tier Scalloped Frosting (Clean & Neatly Rounded) */}
                <path
                  d="M48 138 C 56 148, 64 148, 72 138 C 80 148, 88 148, 96 138 C 104 148, 112 148, 120 138 C 128 148, 136 148, 144 138 C 152 148, 160 148, 168 138 C 176 148, 184 148, 192 138 L 192 125 L 48 125 Z"
                  fill="#f7cfd3"
                />

                {/* Sprinkles on Bottom Tier */}
                <circle cx="68" cy="158" r="2.5" fill="#f5c869" />
                <circle cx="88" cy="166" r="2.5" fill="#d8b4e2" />
                <circle cx="112" cy="162" r="2.5" fill="#fbf5eb" />
                <circle cx="136" cy="167" r="2.5" fill="#f5c869" />
                <circle cx="158" cy="160" r="2.5" fill="#90e0ef" />
                <circle cx="176" cy="165" r="2.5" fill="#f7cfd3" />

                {/* Top Tier Sponge */}
                <rect x="66" y="80" width="108" height="48" rx="6" fill="#ab7b52" />

                {/* Top Tier Scalloped Frosting */}
                <path
                  d="M66 92 C 73 100, 81 100, 88 92 C 95 100, 103 100, 110 92 C 117 100, 124 100, 131 92 C 138 100, 146 100, 153 92 C 160 100, 167 100, 174 92 L 174 80 L 66 80 Z"
                  fill="#f7cfd3"
                />

                {/* ── 5 ELEGANT CANDLES ── */}
                {candlePositions.map((cx, idx) => (
                  <g key={idx}>
                    {/* Candle Body */}
                    <rect
                      x={cx - 3.5}
                      y="38"
                      width="7"
                      height="44"
                      rx="2"
                      fill="#fbf5eb"
                      stroke="#f3b8c3"
                      strokeWidth="1"
                    />
                    {/* Candy Pink Stripes */}
                    <line x1={cx - 3} y1="48" x2={cx + 3} y2="50" stroke="#f7cfd3" strokeWidth="2" strokeLinecap="round" />
                    <line x1={cx - 3} y1="60" x2={cx + 3} y2="62" stroke="#f7cfd3" strokeWidth="2" strokeLinecap="round" />
                    <line x1={cx - 3} y1="72" x2={cx + 3} y2="74" stroke="#f7cfd3" strokeWidth="2" strokeLinecap="round" />
                    {/* Candle Wick */}
                    <line x1={cx} y1="38" x2={cx} y2="32" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                ))}
              </svg>

              {/* ── CANDLE FLAMES (Only for lit candles) ── */}
              {stage !== "blown" && (
                <div className="absolute inset-0 pointer-events-none">
                  {candlePositions.map((cx, idx) => {
                    const isLit = litCandles.includes(idx);
                    if (!isLit) return null;
                    return (
                      <motion.div
                        key={idx}
                        className="absolute"
                        style={{
                          left: `${cx - 8}px`,
                          top: "10px",
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [1, 1.15, 0.95, 1.1, 1],
                          y: [0, -1.5, 1, -1, 0],
                          opacity: 1,
                        }}
                        transition={{
                          scale: { duration: 1.1 + (idx % 3) * 0.2, repeat: Infinity, ease: "easeInOut" },
                          y: { duration: 1.3, repeat: Infinity, ease: "easeInOut" },
                        }}
                      >
                        {/* Glow halo */}
                        <div
                          className="w-8 h-8 -ml-2 -mt-1 rounded-full absolute pointer-events-none blur-sm"
                          style={{
                            background: "radial-gradient(circle, rgba(255, 200, 50, 0.5) 0%, transparent 70%)",
                          }}
                        />
                        {/* Flame teardrop */}
                        <div
                          className="w-4 h-6 rounded-full relative"
                          style={{
                            background: "radial-gradient(ellipse at 50% 85%, #ffffff 0%, #fff099 30%, #f5a623 65%, #e63946 95%)",
                            filter: "drop-shadow(0 0 6px #f5a623)",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ── SMOOTH MATCHSTICK ANIMATION ── */}
              {stage === "lighting" && (
                <motion.div
                  className="absolute pointer-events-none z-20"
                  initial={{ x: 200, y: 80, opacity: 0, rotate: 30 }}
                  animate={{
                    x: [200, 76, 96, 116, 136, 156, 210],
                    y: [80, 22, 22, 22, 22, 22, 45],
                    opacity: [0, 1, 1, 1, 1, 1, 0],
                    rotate: [30, 22, 22, 22, 22, 22, 40],
                  }}
                  transition={{
                    duration: 4.8,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.38, 0.56, 0.74, 0.9, 1],
                  }}
                >
                  <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                    <line x1="12" y1="12" x2="38" y2="38" stroke="#d4a373" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="10" cy="10" r="3.5" fill="#a4161a" />
                    <circle cx="8" cy="8" r="4.5" fill="#f5a623" className="animate-pulse" />
                    <circle cx="7" cy="7" r="2.5" fill="#ffffff" />
                  </svg>
                </motion.div>
              )}

              {/* ── SMOKE PUFFS (When blown) ── */}
              {stage === "blown" && (
                <div className="absolute inset-0 pointer-events-none">
                  {candlePositions.map((cx, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute w-2 h-2 rounded-full bg-white/50 blur-[1px]"
                      style={{ left: `${cx - 1}px`, top: "30px" }}
                      initial={{ opacity: 0.8, y: 0, scale: 0.8 }}
                      animate={{
                        opacity: 0,
                        y: -40,
                        scale: 3.5,
                        x: idx % 2 === 0 ? -6 : 6,
                      }}
                      transition={{ duration: 1.6, delay: idx * 0.08, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Text below the cake matching the reference video ── */}
            {stage === "ready" && (
              <motion.div
                className="flex flex-col items-center mt-4 w-full"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs sm:text-sm text-[#fbf5eb]/80 max-w-xs leading-relaxed mb-6 font-sans">
                  Lilinnya cuma lima, biar kuenya nggak kebakaran. Tiup ya, beneran tiup.
                </p>

                {/* ── Action Buttons ── */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  {/* Button 1: IZINKAN MIKROFON (Yellow Pill) */}
                  <button
                    onClick={startMicrophone}
                    className="w-full py-3.5 px-6 rounded-full font-sans font-semibold text-xs tracking-wider uppercase transition-all transform active:scale-95 shadow-lg select-none"
                    style={{
                      background: "#f5c869",
                      color: "#1a1610",
                      boxShadow: "0 6px 20px rgba(245, 200, 105, 0.3)",
                    }}
                  >
                    {isListening ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span>Mendengarkan... Tiup Sekarang! 💨</span>
                      </span>
                    ) : (
                      "IZINKAN MIKROFON"
                    )}
                  </button>

                  {/* Button 2: TEKAN LAMA AJA (Dark Pill) */}
                  <div
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    className="relative overflow-hidden w-full py-3.5 px-6 rounded-full font-sans text-xs tracking-wider uppercase text-[#fbf5eb] text-center cursor-pointer border select-none transition-all active:scale-95"
                    style={{
                      background: "rgba(18, 38, 30, 0.7)",
                      borderColor: "rgba(245, 200, 105, 0.35)",
                    }}
                  >
                    {/* Hold Progress Fill */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#f5c869]/25 transition-all"
                      style={{ width: `${holdProgress}%` }}
                    />
                    <span className="relative z-10 font-medium">
                      {holdProgress > 0 ? `Menahan... ${holdProgress}%` : "TEKAN LAMA AJA"}
                    </span>
                  </div>

                  {micError && (
                    <p className="text-[11px] text-amber-300/80 mt-1">{micError}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* When blown: status */}
            {stage === "blown" && (
              <motion.p
                className="text-sm font-serif text-[#fbf5eb] mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Horeee! Lilinnya padam... ✨
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════
            STAGE 4: SLIDE 1 — "20 TAHUN" (Matching Frame 7)
           ═════════════════════════════════════════════ */}
        {stage === "stats-age" && (
          <motion.div
            className="text-center z-10 flex flex-col items-center max-w-sm cursor-pointer"
            onClick={() => setStage("stats-heart")}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl sm:text-8xl font-serif text-[#fbf5eb] mb-2 tracking-tight">
              20
            </h1>
            <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#f5c869] mb-6 font-medium">
              TAHUN
            </span>
            <p className="text-sm sm:text-base text-[#fbf5eb]/80 leading-relaxed max-w-xs font-serif">
              Artinya bumi udah 20 kali keliling matahari sejak kamu ada.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setStage("stats-heart");
              }}
              className="mt-10 p-3 rounded-full border border-[#f5c869]/30 text-[#f5c869] hover:bg-[#f5c869]/10 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════
            STAGE 5: SLIDE 2 — "737 JUTA DETAK JANTUNG" (Matching Frame 8)
           ═════════════════════════════════════════════ */}
        {stage === "stats-heart" && (
          <motion.div
            className="text-center z-10 flex flex-col items-center max-w-sm cursor-pointer"
            onClick={() => setStage("final-wish")}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl font-serif text-[#fbf5eb] mb-2 tracking-tight">
              737 juta
            </h1>
            <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#f5c869] mb-6 font-medium">
              DETAK JANTUNG
            </span>
            <p className="text-sm sm:text-base text-[#fbf5eb]/80 leading-relaxed max-w-xs font-serif">
              Kira-kira segitu sejak napas pertama kamu.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setStage("final-wish");
              }}
              className="mt-10 p-3 rounded-full border border-[#f5c869]/30 text-[#f5c869] hover:bg-[#f5c869]/10 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════
            STAGE 6: SLIDE 3 — FINAL WISH WITH SINCERE APOLOGY (Matching Frame 9)
           ═════════════════════════════════════════════ */}
        {stage === "final-wish" && (
          <motion.div
            className="text-center z-10 flex flex-col items-center max-w-md w-full py-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#f5c869] mb-3 font-medium">
              DARI HATI RYAN UNTUKMU
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif text-[#fbf5eb] mb-3 flex items-center justify-center gap-2">
              <span>Rifdah Cantikku</span>
              <span>☺️</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#fbf5eb]/85 leading-relaxed max-w-sm font-serif mb-5 text-justify sm:text-center">
              Maaf ya sayang kalau beberapa bulan kemarin sejak Juli aku sempat hilang kabar dan membiarkanmu merasa berjuang sendirian di sana. Terima kasih sudah tetap sabar dan tegar menungguku... Tetap jadi Rifdah yang ceria ya, bahagia dan menggapai segala cita-citamu. Semoga di lain waktu kita bisa rayain bareng-bareng secara langsung ya 🥰.
            </p>

            <div className="w-16 h-[1px] bg-[#f5c869]/30 my-2" />

            <div className="my-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#f5c869]">
                ULANG TAHUN BERIKUTNYA
              </span>
              <h3 className="text-4xl sm:text-5xl font-serif text-[#fbf5eb] mt-1 mb-1">
                359°
              </h3>
              <span className="text-[11px] tracking-widest uppercase text-[#fbf5eb]/60">
                HARI LAGI
              </span>
            </div>

            {/* Buttons matching Frame 9 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full max-w-xs">
              <button
                onClick={handleEnterWebsite}
                className="w-full py-3.5 px-6 rounded-full font-sans font-semibold text-xs tracking-wider uppercase transition-all transform active:scale-95 shadow-lg select-none flex items-center justify-center gap-2"
                style={{
                  background: "#f5c869",
                  color: "#1a1610",
                  boxShadow: "0 6px 20px rgba(245, 200, 105, 0.3)",
                }}
              >
                <Heart size={14} className="fill-current" />
                <span>Buka Hadiah Kita</span>
              </button>

              <button
                onClick={() => setStage("lighting")}
                className="w-full py-3 px-6 rounded-full font-sans text-xs tracking-wider uppercase text-[#fbf5eb] text-center border select-none transition-all active:scale-95"
                style={{
                  background: "rgba(18, 38, 30, 0.7)",
                  borderColor: "rgba(245, 200, 105, 0.35)",
                }}
              >
                Tiup Lagi
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
