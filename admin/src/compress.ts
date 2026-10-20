/**
 * Shrinks an image in the browser before it is uploaded.
 *
 * Nothing on the site shows an image bigger than about 440 CSS pixels, so a
 * 4000px phone photo is pure download weight. Each field gets a box sized for
 * where it is shown (at 2x for sharp screens), and the result is re-encoded as
 * WebP. The original is kept when it is already smaller, and SVG and GIF are
 * passed through: one is tiny vector art, the other may be animated.
 */

/**
 * The slot each field is drawn into, in pixels at 2x. Both are shown with
 * `object-fit: cover`, so the image is scaled until it covers the slot (not
 * until it fits inside it), and whatever overhangs is what the crop trims.
 */
export const MEDIA_BOX = {
  /** The ~3:1 band on the sleeve and the strip in the player. */
  image: { width: 1200, height: 400 },
  /** Square sleeve art, at most ~440px wide on the page. */
  poster: { width: 900, height: 900 },
} as const;

/** Never keep a side longer than this, whatever the shape. */
const MAX_SIDE = 2400;

export type MediaBox = { width: number; height: number };

export interface Compressed {
  blob: Blob;
  type: string;
  ext: string;
  before: number;
  after: number;
  width: number;
  height: number;
}

const QUALITY = 0.82;

export async function compressImage(file: File, box: MediaBox): Promise<Compressed> {
  const passThrough = (w = 0, h = 0): Compressed => ({
    blob: file,
    type: file.type,
    ext: file.name.split('.').pop()?.toLowerCase() || 'img',
    before: file.size,
    after: file.size,
    width: w,
    height: h,
  });

  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return passThrough();

  const bitmap = await createImageBitmap(file);
  try {
    const cover = Math.max(box.width / bitmap.width, box.height / bitmap.height);
    const scale = Math.min(1, cover, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return passThrough(bitmap.width, bitmap.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY));
    // Safari before 16.4 ignores the WebP request and hands back PNG.
    if (!blob || (blob.size >= file.size && scale === 1)) {
      return passThrough(bitmap.width, bitmap.height);
    }
    const type = blob.type || 'image/webp';
    return {
      blob, type, ext: type === 'image/webp' ? 'webp' : type.split('/')[1],
      before: file.size, after: blob.size, width, height,
    };
  } finally {
    bitmap.close();
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
