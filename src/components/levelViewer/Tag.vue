<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { ref } from "vue";
const props = defineProps<{
  tag: LevelTag;
}>();

const tagImage = ref<string>("")
import(`../../images/badges/${props.tag[0]}.svg`).then(res => tagImage.value = res.default)

</script>

<template>
  <div class="p-1.5 text-xs bg-black bg-opacity-40 rounded-full sm:text-sm">
    <img
      :src="tagImage"
      class="inline mr-2 w-3 align-middle sm:w-6"
      alt=""
    />
    <a
      target="_blank"
      class="text-blue-300 underline"
      :href="tag[2]"
      v-if="tag[2]"
      >{{ tag[1] == -1 ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
    >
    <span v-else>{{
      tag[1] == -1 ? $t(`editor.tags[${tag[0]}]`) : tag[1]
    }}</span>
  </div>
</template>
