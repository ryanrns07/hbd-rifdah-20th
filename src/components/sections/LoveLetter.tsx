"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Mail, ChevronDown, Check } from "lucide-react";

export default function LoveLetter() {
  const [isOpen, setIsOpen] = useState(false);
  const [revealedWishes, setRevealedWishes] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const wishes = [
    "Semoga hatimu selalu dipeluk damai dan ketenangan.",
    "Semoga setiap langkah dan impian besarmu dipermudah oleh-Nya.",
    "Tawamu yang selalu jadi obat terbaik di hari-hari lelahku.",
    "Terima kasih telah mengajarkanku arti mencintai dengan tulus.",
    "Semoga kamu selalu percaya pada kemampuan hebat dalam dirimu.",
    "Aku berjanji akan selalu ada di setiap musim hidupmu.",
    "Keanggunan hatimu adalah keindahan yang paling abadi.",
    "Dua puluh tahun yang membentuk perempuan paling istimewa bagiku.",
    "Semoga semesta senantiasa menjaga senyum manis di wajahmu.",
    "Menua bersamamu adalah doa yang selalu kuaminkan.",
  ];

  const toggleWish = (idx: number) => {
    if (revealedWishes.includes(idx)) {
      setRevealedWishes(revealedWishes.filter((i) => i !== idx));
    } else {
      setRevealedWishes([...revealedWishes, idx]);
    }
  };

  return (
    <section
      id="love-letter"
      ref={sectionRef}
      className="relative py-28 sm:py-36 px-4 sm:px-6 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--color-bg-primary) 0%, #150f0d 50%, var(--color-bg-primary) 100%)",
      }}
    >
      {/* Ambient background rose-gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #c8956c 0%, #e63946 40%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <span
            className="inline-block text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 font-sans"
            style={{ color: "var(--color-text-accent)" }}
          >
            Spesial Dari Hati Kekasihmu
          </span>
          <div className="divider-accent mx-auto mb-6" />
          <h2 className="heading-cinematic text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">
            Surat Cinta <span className="text-accent-warm">& Harapan</span>
          </h2>
          <p
            className="text-romantic text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sebuah warkat abadi yang kutulis untuk menyambut dua dekade keanggunanmu, Rifdah.
          </p>
        </motion.div>

        {/* ═════════════════════════════════════════════
            THE INTERACTIVE ENVELOPE / LETTER
           ═════════════════════════════════════════════ */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {!isOpen ? (
            /* Envelope Sealed View */
            <motion.div
              onClick={() => setIsOpen(true)}
              className="group cursor-pointer relative p-8 sm:p-12 rounded-3xl transition-all duration-500 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(30, 22, 19, 0.85) 0%, rgba(18, 13, 11, 0.95) 100%)",
                border: "1px solid rgba(212, 165, 116, 0.25)",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 30px 80px rgba(200, 149, 108, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Envelope flap lines */}
              <div
                className="absolute inset-x-0 top-0 h-28 pointer-events-none opacity-40"
                style={{
                  background: "radial-gradient(ellipse at top, rgba(212, 165, 116, 0.3) 0%, transparent 70%)",
                }}
              />

              <div className="flex flex-col items-center text-center relative z-10 py-6">
                {/* Wax Seal */}
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl relative"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #e63946 0%, #a81d28 65%, #6d1017 100%)",
                    border: "2px solid rgba(255, 200, 200, 0.4)",
                    boxShadow: "0 10px 25px rgba(168, 29, 40, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 10px 25px rgba(168, 29, 40, 0.5)",
                      "0 10px 35px rgba(200, 149, 108, 0.6)",
                      "0 10px 25px rgba(168, 29, 40, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart size={32} className="text-[#ffe5e8] fill-[#ffe5e8]" />
                </motion.div>

                <span
                  className="text-xs uppercase tracking-[0.25em] mb-2 font-medium"
                  style={{ color: "var(--color-text-accent)" }}
                >
                  From: Ryan Ramadhan
                </span>

                <h3 className="text-2xl sm:text-3xl font-serif text-[#f5efe6] mb-3">
                  Untuk Rifdah Nur Shafiyah
                </h3>

                <p className="text-xs sm:text-sm text-romantic text-[#f5efe6]/70 mb-6 max-w-sm">
                  Tersimpan di dalamnya seluruh doa, janji, dan rasa syukurku. Ketuk untuk membuka surat ini.
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium tracking-wider bg-[#c8956c]/20 text-accent-warm border border-[#c8956c]/40 group-hover:bg-[#c8956c]/30 transition-all">
                  <Mail size={14} />
                  <span>Buka Surat Cinta</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Open Letter View */
            <AnimatePresence>
              <motion.div
                className="relative p-6 sm:p-12 md:p-14 rounded-3xl overflow-hidden backdrop-blur-xl"
                style={{
                  background: "linear-gradient(160deg, rgba(28, 22, 19, 0.95) 0%, rgba(15, 12, 10, 0.98) 100%)",
                  border: "1px solid rgba(212, 165, 116, 0.35)",
                  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.8), 0 0 50px rgba(200, 149, 108, 0.15)",
                }}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Decorative parchment paper watermark */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 opacity-10 pointer-events-none text-accent-warm">
                  <Heart size={120} />
                </div>

                {/* Letter Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#d4a574]/20 mb-8 gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-accent-warm">
                      Surat Untuk Rifdah &bull; Usia ke-20
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif text-[#f5efe6] mt-0.5">
                      Sayangku, Rifdah Nur Shafiyah
                    </h3>
                  </div>
                  <span className="text-xs text-[#f5efe6]/50 italic">
                    Dua Dekade Penuh Keanggunan
                  </span>
                </div>

                {/* Letter Body */}
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[#f5efe6]/90 font-serif text-justify sm:text-left">
                  <p>
                    <span className="text-2xl sm:text-3xl text-accent-warm font-serif italic float-left mr-2 leading-none">
                      S
                    </span>
                    elamat ulang tahun yang kedua puluh, cintaku. Dua dekade bukanlah waktu yang singkat; 
                    ia adalah rangkuman dari setiap proses, senyuman, tangisan, dan kebaikan yang telah 
                    membentukmu menjadi wanita yang luar biasa anggun seperti hari ini.
                  </p>

                  <p>
                    Mengenalmu dan bisa berjalan bersamamu adalah salah satu berkah terindah yang pernah 
                    Tuhan anugerahkan dalam hidupku. Di tengah dunia yang sering kali bising dan terburu-buru, 
                    kehadiranmu selalu menjadi tempatku berpulang—tempat yang teduh, hangat, dan penuh kedamaian.
                  </p>

                  <p>
                    Mungkin jarak atau kesibukan kadang menguji kita, tapi percayalah, tak ada sedetik pun 
                    rasa sayang ini berkurang. Setiap senyummu di layar HP, setiap tawamu saat kita berbagi cerita, 
                    selalu berhasil mengubah hari-hariku yang biasa menjadi luar biasa berharga.
                  </p>

                  <p>
                    Di usiamu yang ke-20 ini, doaku tak akan pernah putus untukmu. Semoga hatimu selalu dijaga 
                    oleh kebahagiaan, langkahmu dimudahkan dalam menggapai segala cita-cita besar yang kamu impikan, 
                    dan semoga kamu selalu dikelilingi oleh cinta yang tulus. Jangan pernah ragu pada kemampuan 
                    hebat yang ada di dalam dirimu, ya?
                  </p>

                  <p className="pt-2">
                    Terima kasih sudah memilih untuk terus bergandengan tangan denganku. Aku berjanji akan selalu 
                    ada untuk merayakan setiap bahagiamu, dan menjadi tempatmu bersandar di saat lelah. 
                    Selamat bertumbuh lebih indah lagi, Bidadariku.
                  </p>
                </div>

                {/* Letter Signature */}
                <div className="mt-10 pt-6 border-t border-[#d4a574]/20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <p className="text-xs text-[#f5efe6]/60">Tertanda dengan segenap cinta,</p>
                    <p className="text-xl font-serif text-accent-warm mt-1 italic">
                      Ryan Ramadhan ♥
                    </p>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-accent-warm hover:underline self-end"
                  >
                    Tutup Surat
                  </button>
                </div>

                {/* ═════════════════════════════════════════
                    BONUS: UNGKAPAN KECIL & HARAPAN (HARIAN)
                   ═════════════════════════════════════════ */}
                <div className="mt-12 pt-8 border-t border-[#d4a574]/15">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-[#ffd700]" />
                    <h4 className="text-sm font-sans tracking-wider uppercase text-[#f5efe6] font-medium">
                      10 Bisikan Kasih & Harapan Ryan Untukmu:
                    </h4>
                  </div>
                  <p className="text-xs text-[#f5efe6]/60 mb-4">
                    Ketuk salah satu kartu di bawah untuk membuka bisikan harapan:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {wishes.map((wish, idx) => {
                      const isRevealed = revealedWishes.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleWish(idx)}
                          className="cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-3"
                          style={{
                            background: isRevealed ? "rgba(200, 149, 108, 0.15)" : "rgba(255, 255, 255, 0.03)",
                            borderColor: isRevealed ? "rgba(212, 165, 116, 0.4)" : "rgba(255, 255, 255, 0.07)",
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] text-accent-warm font-mono">
                              #{idx + 1}
                            </span>
                            <span className={isRevealed ? "text-[#f5efe6]" : "text-[#f5efe6]/50 italic"}>
                              {isRevealed ? wish : "Ketuk untuk membuka harapan..."}
                            </span>
                          </div>
                          <span className="text-accent-warm flex-shrink-0">
                            {isRevealed ? <Check size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}

