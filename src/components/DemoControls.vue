<script setup lang="ts">
import { ref } from 'vue';
import { resetDemo } from '../demo/bootstrap';
import { notifySaved, notifyUnknownError } from '../services/notifications';
import { useAppStore } from '../stores/app';

const store = useAppStore();
const resetting = ref(false);

async function reset() {
  if (resetting.value || !window.confirm('Заменить локальные изменения исходными демонстрационными данными?')) return;
  resetting.value = true;
  try {
    await resetDemo(store);
    notifySaved('Демонстрационные данные восстановлены');
  } catch (error) {
    notifyUnknownError(error, 'Не удалось восстановить демонстрационные данные');
  } finally {
    resetting.value = false;
  }
}
</script>

<template>
  <div class="demo-controls">
    <span>Демонстрационные данные</span>
    <button class="secondary-button" type="button" :disabled="resetting" @click="reset">
      {{ resetting ? 'Сбрасываю…' : 'Сбросить демо-данные' }}
    </button>
  </div>
</template>

<style scoped>
.demo-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.72rem;
  opacity: 0.78;
}

.demo-controls .secondary-button {
  min-height: 32px;
  padding: 5px 9px;
  border-color: rgba(17, 24, 43, 0.08);
  background: rgba(255, 255, 255, 0.42);
}

@media (max-width: 620px) {
  .demo-controls span {
    display: none;
  }

  .demo-controls .secondary-button {
    font-size: 0.68rem;
  }
}
</style>
