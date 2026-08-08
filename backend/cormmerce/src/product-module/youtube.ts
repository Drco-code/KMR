import { BadRequestException } from '@nestjs/common';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function normalizeYouTubeUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new BadRequestException('Each video must be a valid YouTube URL');
  }

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

  if (!videoId || !YOUTUBE_ID.test(videoId)) {
    throw new BadRequestException('Each video must be a valid YouTube URL');
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
}
