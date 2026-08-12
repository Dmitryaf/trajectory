// @vitest-environment happy-dom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TodayView from '../src/views/TodayView.vue';
import { buildDemoPayload } from '../scripts/generate-demo-data.mjs';
import { normalizeSnapshot } from '../src/features/backup/snapshot';
import { createStore, routerLinkStub } from './helpers/viewScenario';

describe('showcase Today surface', () => {
  it('renders the real daily form with synthetic product context', () => {
    const { pinia, store } = createStore();
    const demo = normalizeSnapshot(buildDemoPayload('2026-07-21'));
    store.dailyEntries = demo.dailyEntries;
    store.settings = demo.settings;

    const wrapper = mount(TodayView, {
      global: { plugins: [pinia], stubs: { RouterLink: routerLinkStub } },
    });

    expect(wrapper.get('h1').text()).toBe('Сегодня');
    expect(wrapper.text()).toContain('Шаг по текущей цели');
    expect(wrapper.text()).toContain('Первый час без уведомлений');
    expect(wrapper.find('form.checkin-grid').exists()).toBe(true);
  });
});
