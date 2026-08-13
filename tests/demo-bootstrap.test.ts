import 'fake-indexeddb/auto';
import { createPinia, setActivePinia } from 'pinia';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDemoPayload } from '../scripts/generate-demo-data.mjs';
import { db } from '../src/db';
import { bootstrapDemo, resetDemo } from '../src/demo/bootstrap';
import { useAppStore } from '../src/stores/app';
import { emptyDailyEntry } from '../src/types';

const anchor = '2026-08-11';

beforeEach(async () => {
  await db.delete();
  await db.open();
  setActivePinia(createPinia());
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(buildDemoPayload(anchor)), { status: 200 })),
  );
});

afterAll(async () => {
  vi.unstubAllGlobals();
  await db.delete();
});

describe('demo bootstrap', () => {
  it('imports the synthetic snapshot only when local data is empty', async () => {
    const store = useAppStore();
    await store.load();

    await expect(bootstrapDemo(store)).resolves.toBe(true);
    expect(store.dailyEntries.length).toBeGreaterThan(40);

    await store.saveEntry({ ...emptyDailyEntry('2026-08-12'), importantFact: 'Local edit', updatedAt: '' });
    await expect(bootstrapDemo(store)).resolves.toBe(false);
    expect(store.entryByDate('2026-08-12')?.importantFact).toBe('Local edit');
  });

  it('restores the reproducible baseline on explicit reset', async () => {
    const store = useAppStore();
    await store.load();
    await bootstrapDemo(store);
    await store.saveEntry({ ...store.dailyEntries[0]!, importantFact: 'Changed locally' });

    await resetDemo(store);

    expect(store.dailyEntries.some((entry) => entry.importantFact === 'Changed locally')).toBe(false);
  });
});
