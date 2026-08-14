<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import { bootstrapDemo } from './features/demo/bootstrap';
import DemoControls from './features/demo/ui/DemoControls.vue';
import { useAppStore } from './stores/app';

const store = useAppStore();
const ready = ref(false);
const loadError = ref('');

onMounted(async () => {
  try {
    await store.load();
    await bootstrapDemo(store);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Не удалось загрузить демонстрационные данные.';
  } finally {
    ready.value = true;
  }
});

const navItems = [
  { to: '/', label: 'Сегодня', icon: '●' },
  { to: '/week', label: 'Неделя', icon: '▦' },
  { to: '/trends', label: 'История', icon: '≋' },
];
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="brand" aria-label="Траектория — главная">
        <span class="brand__mark"><i></i></span>
        <span><strong>Траектория</strong><small>факты, а не оценка</small></span>
      </RouterLink>
      <DemoControls v-if="ready && !loadError" />
    </header>

    <main class="app-main">
      <div v-if="!ready" class="loading-card" role="status" aria-live="polite">
        <span class="loading-card__mark" aria-hidden="true"><i></i></span>
        <strong>Загружаю демонстрационные данные…</strong>
      </div>
      <section v-else-if="loadError" class="storage-error" role="alert">
        <span class="storage-error__mark" aria-hidden="true">!</span>
        <div>
          <p class="eyebrow">Локальное хранилище недоступно</p>
          <h1>Приложение пока не открылось</h1>
          <p>{{ loadError }}</p>
        </div>
      </section>
      <RouterView v-else />
    </main>

    <nav v-if="ready && !loadError" class="bottom-nav" aria-label="Основная навигация">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="bottom-nav__item">
        <span>{{ item.icon }}</span>
        <small>{{ item.label }}</small>
      </RouterLink>
    </nav>
    <Toaster position="top-center" rich-colors />
  </div>
</template>
