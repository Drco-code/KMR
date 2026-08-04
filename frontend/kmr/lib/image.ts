export function isValidImageSrc(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export function getValidImages(images: string[] | null | undefined): string[] {
  return (images ?? []).filter(isValidImageSrc);
}
