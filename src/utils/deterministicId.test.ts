import { describe, it, expect } from 'vitest';
import { deterministicUuid } from './deterministicId';

describe('deterministicUuid', () => {
  it('aynı girdi için her zaman aynı id\'yi üretir', async () => {
    const a = await deterministicUuid('Matematik|7|Sayılar ve Nicelikler');
    const b = await deterministicUuid('Matematik|7|Sayılar ve Nicelikler');
    expect(a).toBe(b);
  });

  it('farklı girdiler için farklı id üretir', async () => {
    const a = await deterministicUuid('Matematik|7|Sayılar ve Nicelikler');
    const b = await deterministicUuid('Matematik|7|Cebirsel Düşünme');
    expect(a).not.toBe(b);
  });

  it('geçerli bir UUID v5 formatı üretir (versiyon ve varyant bitleri doğru)', async () => {
    const id = await deterministicUuid('M.7.1.1');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
