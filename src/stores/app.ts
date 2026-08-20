import { defineStore } from 'pinia';
import { db } from '../db';
import { normalizeSnapshot, type ExportPayload } from '../features/backup/snapshot';
import { BACKUP_VERSION } from '../features/backup/version';
import { linkLegacyExperimentEntries } from '../features/experiments/model';
import { plainCopy } from '../services/plain';
import {
  defaultSettings,
  normalizeDailyEntry,
  normalizeLifeEvent,
  normalizeMonthlyReview,
  normalizeResult,
  normalizeSettings,
  normalizeWeeklyReview,
  type AppSettings,
  type DailyEntry,
  type LifeEventRecord,
  type MonthlyReview,
  type ResultRecord,
  type WeeklyReview,
} from '../types';

export type { ExportPayload } from '../features/backup/snapshot';

export const useAppStore = defineStore('app', {
  state: () => ({
    loaded: false,
    loadError: '',
    dailyEntries: [] as DailyEntry[],
    results: [] as ResultRecord[],
    lifeEvents: [] as LifeEventRecord[],
    weeklyReviews: [] as WeeklyReview[],
    monthlyReviews: [] as MonthlyReview[],
    settings: structuredClone(defaultSettings) as AppSettings,
  }),
  getters: {
    entryByDate: (state) => (date: string) => state.dailyEntries.find((entry) => entry.date === date),
    reviewByWeek: (state) => (weekStart: string) => state.weeklyReviews.find((review) => review.weekStart === weekStart),
    reviewByMonth: (state) => (monthStart: string) => state.monthlyReviews.find((review) => review.monthStart === monthStart),
  },
  actions: {
    async load() {
      this.loadError = '';
      try {
        const [dailyEntries, results, lifeEvents, weeklyReviews, monthlyReviews, settings] = await Promise.all([
          db.dailyEntries.toArray(),
          db.results.toArray(),
          db.lifeEvents.toArray(),
          db.weeklyReviews.toArray(),
          db.monthlyReviews.toArray(),
          db.settings.get('main'),
        ]);
        const activeSettings = normalizeSettings(settings);
        const linkedEntries = linkLegacyExperimentEntries(dailyEntries.map(normalizeDailyEntry), activeSettings);
        this.dailyEntries = linkedEntries;
        this.results = results.map(normalizeResult).sort((a, b) => b.date.localeCompare(a.date));
        this.lifeEvents = lifeEvents.map(normalizeLifeEvent).sort((a, b) => b.date.localeCompare(a.date));
        this.weeklyReviews = weeklyReviews.map(normalizeWeeklyReview);
        this.monthlyReviews = monthlyReviews.map(normalizeMonthlyReview);
        this.settings = activeSettings;
        await Promise.all([
          db.settings.put(plainCopy(this.settings)),
          linkedEntries.length ? db.dailyEntries.bulkPut(plainCopy(linkedEntries)) : Promise.resolve(),
        ]);
      } catch (error) {
        this.loadError = error instanceof Error ? error.message : 'Не удалось открыть локальное хранилище.';
        throw error;
      } finally {
        this.loaded = true;
      }
    },
    async saveEntry(entry: DailyEntry) {
      const saved = plainCopy(normalizeDailyEntry({ ...entry, updatedAt: new Date().toISOString() }));
      await db.dailyEntries.put(saved);
      const index = this.dailyEntries.findIndex((item) => item.date === saved.date);
      if (index >= 0) this.dailyEntries[index] = saved;
      else this.dailyEntries.push(saved);
      return saved;
    },
    async saveReview(review: WeeklyReview) {
      const saved = plainCopy(normalizeWeeklyReview({ ...review, updatedAt: new Date().toISOString() }));
      await db.weeklyReviews.put(saved);
      const index = this.weeklyReviews.findIndex((item) => item.weekStart === saved.weekStart);
      if (index >= 0) this.weeklyReviews[index] = saved;
      else this.weeklyReviews.push(saved);
    },
    async saveSettings(settings: AppSettings) {
      const saved = plainCopy(normalizeSettings(settings));
      await db.settings.put(saved);
      this.settings = saved;
    },
    exportData(): ExportPayload {
      return {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        dailyEntries: this.dailyEntries,
        results: this.results,
        lifeEvents: this.lifeEvents,
        weeklyReviews: this.weeklyReviews,
        monthlyReviews: this.monthlyReviews,
        settings: this.settings,
      };
    },
    async importData(payload: unknown) {
      const prepared = normalizeSnapshot(payload);
      await db.transaction(
        'rw',
        [db.dailyEntries, db.results, db.lifeEvents, db.weeklyReviews, db.monthlyReviews, db.settings],
        async () => {
          await Promise.all([
            db.dailyEntries.clear(),
            db.results.clear(),
            db.lifeEvents.clear(),
            db.weeklyReviews.clear(),
            db.monthlyReviews.clear(),
            db.settings.clear(),
          ]);
          await db.dailyEntries.bulkPut(prepared.dailyEntries);
          await db.results.bulkPut(prepared.results);
          await db.lifeEvents.bulkPut(prepared.lifeEvents ?? []);
          await db.weeklyReviews.bulkPut(prepared.weeklyReviews);
          await db.monthlyReviews.bulkPut(prepared.monthlyReviews ?? []);
          await db.settings.put(plainCopy(prepared.settings));
        },
      );
      await this.load();
    },
    async clearAll() {
      await db.transaction(
        'rw',
        [db.dailyEntries, db.results, db.lifeEvents, db.weeklyReviews, db.monthlyReviews, db.settings],
        async () => {
          await Promise.all([
            db.dailyEntries.clear(),
            db.results.clear(),
            db.lifeEvents.clear(),
            db.weeklyReviews.clear(),
            db.monthlyReviews.clear(),
            db.settings.clear(),
          ]);
        },
      );
      await this.load();
    },
  },
});
