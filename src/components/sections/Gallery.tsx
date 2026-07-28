import fs from "node:fs";
import path from "node:path";
import GalleryClient from "./GalleryClient";

/* ═══════════════════════════════════════════════
   IMAGE & VIDEO EXTENSIONS
   ═══════════════════════════════════════════════ */

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

/* ═══════════════════════════════════════════════
   FLOATING QUOTES
   ═══════════════════════════════════════════════ */

const floatingQuotes = [
  "Setiap detik bersamamu adalah puisi...",
  "Tawamu yang mengalahkan jarak...",
  "Menuju masa depan yang kita aminkan bersama.",
  "Dua dekade yang membentuk jiwa terindah...",
  "Setiap kenangan adalah hadiah yang tak ternilai.",
];

/* ═══════════════════════════════════════════════
   GALLERY SERVER COMPONENT
   Reads the filesystem at build time / request time
   to discover all media files automatically.
   ═══════════════════════════════════════════════ */

export default function Gallery() {
  const photosDir = path.join(process.cwd(), "public", "media", "photos");
  const videosDir = path.join(process.cwd(), "public", "media", "videos");

  /* ── Read photo filenames ── */
  let photos: string[] = [];
  try {
    const allPhotoFiles = fs.readdirSync(photosDir);
    photos = allPhotoFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    });
    // Sort for deterministic order
    photos.sort();
  } catch {
    console.warn("[Gallery] Could not read photos directory:", photosDir);
  }

  /* ── Read video filenames ── */
  let videos: string[] = [];
  try {
    const allVideoFiles = fs.readdirSync(videosDir);
    videos = allVideoFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return VIDEO_EXTENSIONS.has(ext);
    });
    videos.sort();
  } catch {
    console.warn("[Gallery] Could not read videos directory:", videosDir);
  }

  return (
    <GalleryClient
      photos={photos}
      videos={videos}
      quotes={floatingQuotes}
    />
  );
}
