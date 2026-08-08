import { slugify } from './slug';

describe('slugify', () => {
  it('makes a URL safe slug from an AdminJS value', () => {
    expect(slugify(' Test 2 ')).toBe('test-2');
  });

  it('removes URL reserved characters', () => {
    expect(slugify('Paint / Primer #1')).toBe('paint-primer-1');
  });
});
