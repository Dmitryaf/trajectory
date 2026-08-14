import type { useAppStore } from '../../stores/app';

type AppStore = ReturnType<typeof useAppStore>;

const demoDataUrl = `${import.meta.env.BASE_URL}demo/trajectory-demo.json`;

function isEmpty(store: AppStore): boolean {
  return (
    store.dailyEntries.length === 0 &&
    store.results.length === 0 &&
    store.lifeEvents.length === 0 &&
    store.weeklyReviews.length === 0 &&
    store.monthlyReviews.length === 0
  );
}

async function fetchDemoPayload(): Promise<unknown> {
  const response = await fetch(demoDataUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Не удалось загрузить демонстрационные данные (${response.status}).`);
  return response.json();
}

export async function bootstrapDemo(store: AppStore): Promise<boolean> {
  if (!isEmpty(store)) return false;
  await store.importData(await fetchDemoPayload());
  return true;
}

export async function resetDemo(store: AppStore): Promise<void> {
  await store.importData(await fetchDemoPayload());
}
