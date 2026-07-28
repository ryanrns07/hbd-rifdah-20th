"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase, type GuestbookEntry } from "@/lib/supabase";
import { Send, Loader2, Heart } from "lucide-react";

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // 1. Fetch existing entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Silently fail if there's an error (e.g., placeholder URL)
        // console.error("Supabase fetch error:", error.message);
      } else if (data) {
        setEntries(data as GuestbookEntry[]);
      }
    } catch (err) {
      // Silently fail to prevent Next.js dev overlay for expected network errors
      // console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const newEntry = {
        sender_name: name.trim(),
        message: message.trim(),
      };

      const { data, error } = await supabase
        .from("guestbook")
        .insert([newEntry])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Success
      setSuccessMsg("Pesan cinta berhasil dikirim!");
      setName("");
      setMessage("");
      
      // Update local state without refetching immediately
      if (data && data.length > 0) {
        setEntries((prev) => [data[0] as GuestbookEntry, ...prev]);
      }
      
      // Clear success message after 4s
      setTimeout(() => setSuccessMsg(""), 4000);
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(
        err.message?.includes("Failed to fetch") 
          ? "Gagal terhubung. Pastikan konfigurasi Supabase sudah benar."
          : "Gagal mengirim pesan. Coba lagi nanti."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Formatting date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <section
      id="guestbook"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 overflow-hidden"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-50" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-[var(--color-accent)] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[var(--color-accent-light)] rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-16">
          <span
            className="text-xs tracking-[0.3em] uppercase mb-4 block"
            style={{ color: "var(--color-text-accent)" }}
          >
            A Letter For You
          </span>
          <div className="divider-accent mx-auto mb-6" />
          <h2 className="heading-cinematic text-3xl md:text-5xl mb-4">
            Words of <span className="text-accent-warm">Love & Wishes</span>
          </h2>
          <p
            className="text-sm sm:text-base max-w-lg mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Tinggalkan harapan, doa, atau sekadar cerita manis untuk Rifdah di usia barunya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ─── FORM SECTION ─── */}
          <div className="lg:col-span-5 w-full">
            <div className="glass rounded-2xl p-6 sm:p-8 relative">
              <h3 className="heading-cinematic text-2xl mb-6">Tulis Pesan</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest mb-2 text-white/60">
                    Nama Kamu
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    suppressHydrationWarning
                    placeholder="Siapa yang mengirim?"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-widest mb-2 text-white/60">
                    Pesan / Doa
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    suppressHydrationWarning
                    rows={4}
                    placeholder="Tuliskan sesuatu yang manis..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
                {successMsg && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                    <Heart size={14} /> {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                  className="btn-primary w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Mengirim...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={16} /> Kirim Pesan
                      </span>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* ─── MESSAGES LIST SECTION ─── */}
          <div className="lg:col-span-7 w-full">
            <h3 className="heading-cinematic text-2xl mb-6 px-2 flex items-center justify-between">
              <span>Pesan Masuk</span>
              <span className="text-sm font-sans tracking-widest text-white/40">
                {entries.length} Pesan
              </span>
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-white/50">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center text-white/50 border-dashed border-white/20">
                  Belum ada pesan. Jadilah yang pertama memberikan harapan!
                </div>
              ) : (
                <AnimatePresence>
                  {entries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass glass-hover rounded-xl p-5 sm:p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-[var(--color-accent)] tracking-wide">
                          {entry.sender_name}
                        </h4>
                        <span className="text-xs text-white/40">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <p className="text-white/80 leading-relaxed text-sm sm:text-base font-light">
                        "{entry.message}"
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
          
        </div>
      </motion.div>
    </section>
  );
}
