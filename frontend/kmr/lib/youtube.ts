const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = url.searchParams.get('v');
      if (!videoId) {
        const [first, second] = url.pathname.split('/').filter(Boolean);
        if (first === 'embed' || first === 'shorts') videoId = second ?? null;
      }
    }

    return videoId && YOUTUBE_ID.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}
