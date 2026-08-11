// Product/brand images are stored as plain, untransformed Cloudinary
// delivery URLs (see CloudinaryAdminUploadProvider on the backend), often
// the full original upload, sometimes several MB. Rather than transforming
// at upload time (which would need re-uploading every existing image to
// change), we rewrite the URL at display time: insert an f_auto,q_auto,w_*
// transformation right after `/upload/`, sized to how the image actually
// renders. This is the standard Cloudinary pattern and is what makes the
// image genuinely small to fetch, not just resized in the browser.
export function cloudinaryUrl(url: string, width: number): string {
  const match = url.match(/^(.*\/upload\/)(.*)$/);
  if (!match) return url;
  const [, prefix, rest] = match;
  return `${prefix}f_auto,q_auto,w_${width}/${rest}`;
}
