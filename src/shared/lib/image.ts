export type PhotoError = 'not-image' | 'too-big' | 'unreadable';

const MAX_SIDE = 1024;
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

export async function shrinkPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not-image' satisfies PhotoError);
  if (file.size > MAX_INPUT_BYTES) throw new Error('too-big' satisfies PhotoError);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('unreadable' satisfies PhotoError));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('unreadable' satisfies PhotoError);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.65);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function sizedImage(url: string, px: number) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const side = Math.round(px);
  return url.replace('/upload/', `/upload/c_fill,g_face,w_${side},h_${side},f_auto,q_auto/`);
}
