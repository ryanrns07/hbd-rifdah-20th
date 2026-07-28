/**
 * Media configuration for the gallery.
 * Add your photos and videos here. Place files in:
 *   - /public/media/photos/ (for .jpg, .png, .webp)
 *   - /public/media/videos/ (for .mp4, .webm)
 */

export type MediaType = "photo" | "video";

export interface MediaItem {
  /** Source path relative to /public, e.g. "/media/photos/moment-01.jpg" */
  src: string;
  /** Type of media */
  type: MediaType;
  /** Alt text or caption */
  caption?: string;
  /** Aspect ratio hint: "portrait" | "landscape" | "square" */
  aspect?: "portrait" | "landscape" | "square";
}

/**
 * Hero section video — replace with your own.
 * Place your video at: /public/media/videos/hero.mp4
 */
export const heroVideo = "/media/videos/hero.mp4";

/**
 * Gallery items — add your media here!
 *
 * Example:
 * ```ts
 * export const galleryItems: MediaItem[] = [
 *   { src: "/media/photos/moment-01.jpg", type: "photo", caption: "First meeting", aspect: "landscape" },
 *   { src: "/media/videos/clip-01.mp4", type: "video", caption: "Birthday surprise", aspect: "landscape" },
 * ];
 * ```
 */
export const galleryItems: MediaItem[] = [
  // ─── Add your memories here ───
  // { src: "/media/photos/example.jpg", type: "photo", caption: "A beautiful moment", aspect: "portrait" },
];

/**
 * Floating romantic quotes that appear between gallery items.
 */
export const floatingQuotes = [
  "Setiap detik bersamamu adalah puisi...",
  "Tawamu yang mengalahkan jarak...",
  "Menuju masa depan yang kita aminkan bersama.",
  "Dua dekade yang membentuk jiwa terindah...",
  "Setiap kenangan adalah hadiah yang tak ternilai.",
];
