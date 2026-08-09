import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(__dirname, '../../..');

const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8');

describe('PlaceholderImage fallback usage', () => {
  it('does not rely on the external placeholder image service', () => {
    const files = [
      'components/cards/ProductCard.tsx',
      'app/product/[id].tsx',
      'app/messages.tsx',
      'app/profile.tsx',
      'app/checkout/[id].tsx',
    ];

    for (const file of files) {
      expect(readProjectFile(file), file).not.toContain('via.placeholder.com');
    }
  });

  it('uses the local fallback component where product images can be missing', () => {
    const files = [
      'components/cards/ProductCard.tsx',
      'app/product/[id].tsx',
      'app/messages.tsx',
      'app/profile.tsx',
      'app/checkout/[id].tsx',
    ];

    for (const file of files) {
      expect(readProjectFile(file), file).toMatch(/PlaceholderImage|SafeImage/);
    }
  });
});
