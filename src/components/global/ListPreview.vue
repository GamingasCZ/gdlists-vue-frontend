<script setup lang="ts">
import type { ListCreatorInfo, ListPreview } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  rate_ratio: string;
  views: string;
  timestamp: string;
  name: string;
  creator: string;
  id: string;
  index: number;
  diffGuesser: '0' | '1';
  uid: string;
  hidden: string;
  isPinned: boolean

  userArray: ListCreatorInfo[];
}>();

const makeColor = () =>
  chroma(
    Math.floor(
      16777215 *
        Math.sin(
          props.name
            ?.split("")
            .map((p: string) => p.charCodeAt(0))
            .reduce((x, y) => x + y)! % Math.PI
        )
    )
  );

const listColor = ref<Color>(makeColor());

const emit = defineEmits(['unpinList'])

function parseElapsed(secs: number) {
  if (secs < 60) return Math.round(secs) + "s"; //s - seconds
  else if (secs < 3600) return Math.round(secs / 60) + "m"; //m - minutes
  else if (secs < 86400) return Math.round(secs / 3600) + "h"; //h - hours
  else if (secs < 604800) return Math.round(secs / 86400) + "d"; //d - days
  else if (secs < 1892160000)
    return Math.round(secs / 604800) + "w"; //w - weeks
  else return Math.round(secs / 1892160000) + "y"; //y - years
}

function getUsername() {
  let listCreator: string = "";
  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user.username;
  });
  return listCreator;
}

const getGradient = () =>
  `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;

const uploadDate = reactive(new Date(props.timestamp!));

const unpinList = () => {
  let pinned: ListPreview[] = JSON.parse(localStorage.getItem('pinnedLists')!)
  let i = 0
  let removedIndex = -1
  pinned.forEach((pin: ListPreview) => {
    if (pin.id == props.id) {
      pinned.splice(i, 1)
      removedIndex = i
    }
    i++
  })
  localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  emit('unpinList', removedIndex)
}
</script>

<template>
  <RouterLink
    :to="hidden != '0' ? hidden ?? id.toString() : id.toString()!"
    class="flex w-5/6 max-w-6xl cursor-pointer items-center gap-3 rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
    :class="{
      '!border-dotted': hidden != '0',
      '!border-white': hidden != '0',
      '!border-opacity-40': hidden != '0',
    }"
  >
    <section v-if="rate_ratio" class="flex flex-col items-center text-xs">
      <img src="../../images/genericRate.svg" alt="" class="w-3.5" />{{
        rate_ratio
      }}
    </section>

    <section class="flex flex-col gap-1 items-center">
      <div v-if="views" class="flex gap-1 text-xs">
        <img src="../../images/view.svg" alt="" class="w-4" />{{ views }}
      </div>
      <div
        v-if="timestamp"
        class="flex gap-1 text-xs hover:cursor-help"
        :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`"
      >
        <img src="../../images/time.svg" alt="" class="w-4" />{{
          parseElapsed(Date.now() / 1000 - timestamp)
        }}
      </div>
    </section>

    <section class="flex flex-col justify-center">
      <h1 class="text-lg font-bold">{{ name }}</h1>
      <p class="text-xs">- {{ creator?.length ? creator : getUsername() }} -</p>
    </section>

    <button @click.stop.prevent="unpinList()" v-if="isPinned" class="box-border p-1 ml-auto w-10 bg-black bg-opacity-40 rounded-full button">
      <img src="@/images/unpin.svg" alt="">
    </button>
  </RouterLink>
</template>
3
