<script setup lang="ts">
import { TAG_COUNT } from "../../Editor";
import type { LevelTag } from "../../interfaces";

const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "addTag", tag: LevelTag): void;
}>();
</script>

<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
    <section
      @click.stop=""
      class="absolute top-1/2 left-1/2 w-max max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-center text-xl font-bold">Štítky</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="button absolute top-0 right-0 w-6"
          @click="emit('closePopup')"
        />
      </div>
      <div
        class="grid max-h-[85vh] grid-cols-2 gap-1 overflow-y-auto overflow-x-hidden rounded-lg bg-black bg-opacity-20 p-2 sm:grid-cols-3"
      >
        <button
          @click="emit('addTag', [tag - 1, '', ''])"
          v-for="tag in TAG_COUNT"
          type="button"
          class="button flex items-center gap-2 rounded-full bg-black bg-opacity-20 p-1.5 text-sm"
        >
          <img :src="'/src/images/badges/' + (tag - 1) + '.svg'" alt="" />{{
            $t(`editor.tags[${tag - 1}]`)
          }}
        </button>
      </div>
    </section>
  </dialog>
</template>
