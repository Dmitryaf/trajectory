import { describe, expect, it } from 'vitest';
import { buildEventComparison } from '../src/features/analytics/eventComparison';
import { buildObservations } from '../src/features/analytics/observations';
import { summarize } from '../src/features/analytics/periodSummary';
import { emptyDailyEntry, type DailyEntry } from '../src/types';

function entry(date: string, patch: Partial<DailyEntry>): DailyEntry {
  return { ...emptyDailyEntry(date), specialDay: null, ...patch };
}

describe('personal analytics semantics', () => {
  it('counts recorded samples without filling missing values', () => {
    const summary = summarize([
      entry('2026-07-01', { sleepMinutes: 420, energy: 4 }),
      entry('2026-07-02', { sleepMinutes: null, energy: 2 }),
      entry('2026-07-03', { sleepMinutes: 480, energy: null }),
    ]);

    expect(summary.coveredEntriesCount).toBe(3);
    expect(summary.sleepSamples).toBe(2);
    expect(summary.energySamples).toBe(2);
    expect(summary.averageSleep).toBe(450);
    expect(summary.averageEnergy).toBe(3);
  });

  it('uses equal before/after windows and excludes the event day', () => {
    const entries = Array.from({ length: 11 }, (_, index) =>
      entry(`2026-07-${String(index + 1).padStart(2, '0')}`, { sleepMinutes: 400 + index * 5, energy: 3 }),
    );

    const comparison = buildEventComparison('2026-07-06', entries, [], undefined, 5, '2026-07-11');

    expect(comparison).toMatchObject({
      windowDays: 5,
      beforeStart: '2026-07-01',
      beforeEnd: '2026-07-05',
      afterStart: '2026-07-07',
      afterEnd: '2026-07-11',
      beforeEntries: 5,
      afterEntries: 5,
    });
  });

  it('labels factor comparisons as association rather than causation', () => {
    const entries = Array.from({ length: 8 }, (_, index) =>
      entry(`2026-07-${String(index + 1).padStart(2, '0')}`, {
        contextFactors: index < 4 ? ['screen'] : [],
        recordedFields: ['contextFactors'],
        contextFactorsRecorded: true,
        sleepMinutes: index < 4 ? 360 : 480,
        energy: index < 4 ? 2 : 4,
      }),
    );

    expect(
      buildObservations(entries)
        .map((item) => item.text)
        .join(' '),
    ).toContain('Это связь, а не доказанная причина.');
  });
});
