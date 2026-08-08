import { BadRequestException } from '@nestjs/common';
import { normalizeYouTubeUrl } from './youtube';

describe('normalizeYouTubeUrl', () => {
  it.each([
    ['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeYouTubeUrl(input)).toBe(expected);
  });

  it('rejects non YouTube links', () => {
    expect(() => normalizeYouTubeUrl('https://example.com/video')).toThrow(BadRequestException);
  });
});
