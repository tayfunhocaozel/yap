import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./networkStatus', () => ({ isReachable: vi.fn() }));
vi.mock('./pushOutbox', () => ({ pushOutbox: vi.fn() }));
vi.mock('./pullTable', () => ({ pullTable: vi.fn() }));

import { isReachable } from './networkStatus';
import { pushOutbox } from './pushOutbox';
import { pullTable } from './pullTable';
import { kickSync } from './syncEngine';

describe('kickSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(isReachable).mockResolvedValue(true);
    vi.mocked(pushOutbox).mockResolvedValue(undefined);
    vi.mocked(pullTable).mockResolvedValue(undefined);
    vi.mocked(pushOutbox).mockClear();
    vi.mocked(pullTable).mockClear();
    vi.mocked(isReachable).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('500ms debounce sonrasında senkronu tetikler', async () => {
    kickSync();
    expect(pushOutbox).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(pushOutbox).toHaveBeenCalledTimes(1);
  });

  it('art arda çağrılar tek bir senkrona toplanır (debounce)', async () => {
    kickSync();
    kickSync();
    kickSync();

    await vi.advanceTimersByTimeAsync(500);

    expect(pushOutbox).toHaveBeenCalledTimes(1);
  });

  it('erişilemez durumda push/pull hiç çağrılmaz', async () => {
    vi.mocked(isReachable).mockResolvedValue(false);

    kickSync();
    await vi.advanceTimersByTimeAsync(500);

    expect(pushOutbox).not.toHaveBeenCalled();
    expect(pullTable).not.toHaveBeenCalled();
  });

  it('push, pull\'dan önce çağrılır (sıralı)', async () => {
    const order: string[] = [];
    vi.mocked(pushOutbox).mockImplementation(async () => {
      order.push('push');
    });
    vi.mocked(pullTable).mockImplementation(async () => {
      order.push('pull');
    });

    kickSync();
    await vi.advanceTimersByTimeAsync(500);

    expect(order[0]).toBe('push');
    expect(order.slice(1)).toEqual(['pull', 'pull']);
  });
});
