<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    openForFirstVisit?: boolean;
    buttonLabel?: string;
    inline?: boolean;
  }>(),
  { openForFirstVisit: false, buttonLabel: 'Как это работает', inline: false },
);

const emit = defineEmits<{ 'intro-seen': [] }>();
const isOpen = ref(false);
const closeButton = ref<HTMLButtonElement>();
const openedAsIntro = ref(false);

watch(
  () => props.openForFirstVisit,
  async (shouldOpen) => {
    if (!shouldOpen) {
      if (openedAsIntro.value) {
        isOpen.value = false;
        openedAsIntro.value = false;
      }
      return;
    }
    if (isOpen.value) return;
    openedAsIntro.value = true;
    isOpen.value = true;
    await nextTick();
    closeButton.value?.focus();
  },
  { immediate: true },
);

async function open() {
  openedAsIntro.value = false;
  isOpen.value = true;
  await nextTick();
  closeButton.value?.focus();
}

function close() {
  isOpen.value = false;
  if (openedAsIntro.value) emit('intro-seen');
  openedAsIntro.value = false;
}
</script>

<template>
  <button
    class="help-link"
    :class="{ 'help-link--inline': inline }"
    type="button"
    aria-label="Как работает приложение"
    title="Как это работает"
    aria-haspopup="dialog"
    @click="open"
  >
    <span aria-hidden="true">?</span>
    <strong>{{ buttonLabel }}</strong>
  </button>

  <Teleport to="body">
    <div v-if="isOpen" class="help-backdrop" @click.self="close">
      <section class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="how-it-works-title" @keydown.esc="close">
        <div class="help-dialog__heading">
          <div>
            <span class="eyebrow">Зачем нужны записи</span>
            <h2 id="how-it-works-title">Зачем нужна «Траектория»</h2>
          </div>
          <button ref="closeButton" class="help-dialog__close" type="button" aria-label="Закрыть объяснение" @click="close">×</button>
        </div>

        <p class="help-dialog__lead">
          Записи помогают вспомнить неделю по конкретным дням: что происходило, что вы сделали и как себя чувствовали. В конце можно решить,
          что продолжить, изменить или пока оставить как есть.
        </p>

        <ol class="help-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Сегодня: коротко записать главное</strong>
              <p>Отметьте сон, состояние, действия или условия дня. Заполнять всё не обязательно.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Заметка дня: оставить мысль или деталь</strong>
              <p>
                Запишите, что произошло или что вы заметили. Это может быть обычная мысль, разговор или деталь, которая поможет вспомнить
                день при разборе.
              </p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Неделя и история: увидеть изменения</strong>
              <p>
                Здесь записи собраны по времени: видно, что повторялось и какие итоги появились. Приложение не угадывает причины — вывод и
                следующий шаг выбираете вы.
              </p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Эксперимент: проверить одно изменение</strong>
              <p>
                Выберите одно изменение и отмечайте, получилось ли его соблюдать. В конце сравните записи и решите, стоит ли продолжать.
              </p>
            </div>
          </li>
        </ol>

        <p class="help-dialog__note">После обзора не обязательно что-то менять. Можно продолжить как есть и вернуться к решению позже.</p>

        <div class="help-dialog__actions">
          <RouterLink class="primary-button" to="/" @click="close">Начать запись</RouterLink>
        </div>
      </section>
    </div>
  </Teleport>
</template>
