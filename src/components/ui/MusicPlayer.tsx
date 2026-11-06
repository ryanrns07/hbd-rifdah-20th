"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface MusicPlayerProps {
  autoPlayTrigger?: boolean;
}

export default function MusicPlayer({ autoPlayTrigger }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.7;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Try auto-playing on first user interaction anywhere on the document
    const startAudioOnInteraction = () => {
      if (audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          window.removeEventListener("click", startAudioOnInteraction);
          window.removeEventListener("touchstart", startAudioOnInteraction);
        }).catch(() => {
          // Autoplay blocked until direct user interaction
        });
      }
    };

    window.addEventListener("click", startAudioOnInteraction);
    window.addEventListener("touchstart", startAudioOnInteraction);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
    };
  }, []);

  // When autoPlayTrigger changes to true, trigger play
  useEffect(() => {
    if (autoPlayTrigger && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [autoPlayTrigger]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/media/audio/romantic-bgm.mp3"
        loop
        preload="auto"
      />

      {/* Top right floating music controller */}
      <div className="fixed top-5 right-5 z-50 select-none">
        <motion.button
          onClick={togglePlay}
          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
          style={{
            background: "rgba(12, 28, 22, 0.85)",
            border: "1.5px solid rgba(245, 200, 105, 0.6)",
            color: "#f5c869",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? "Jeda Musik" : "Putar Musik"}
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {/* Animated pulsing outer ring when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-[-6px] rounded-full pointer-events-none"
              style={{
                border: "1.5px solid rgba(245, 200, 105, 0.4)",
              }}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0.1, 0.6],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {isPlaying ? (
            <div className="flex items-center gap-1">
              <span className="w-1 h-3.5 bg-[#f5c869] rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-[#f5c869] rounded-full animate-pulse delay-75" />
            </div>
          ) : (
            <Play size={16} className="ml-0.5 fill-current" />
          )}
        </motion.button>
      </div>
    </>
  );
}
