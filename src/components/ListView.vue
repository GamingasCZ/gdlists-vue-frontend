<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  FavoritedLevel,
  ListPreview,
  Level,
} from "@/interfaces";
import CommentSection from "./levelViewer/CommentSection.vue";
import LevelCard from "./global/LevelCard.vue";
import SharePopup from "./global/SharePopup.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, onUnmounted, getCurrentInstance } from "vue";
import { modifyListBG } from "@/Editor";
import chroma, { hsl } from "chroma-js";
import PickerPopup from "./global/PickerPopup.vue";
import router from "@/router";
import { loadRouteLocation } from "vue-router";

const props = defineProps({
  listID: { type: String, required: false },
  randomList: Boolean,
});

onUnmounted(() => {
  document.body.style.backgroundImage = '';
});

watch(props, () => main())
onMounted(() => main())

const PRIVATE_LIST: boolean =
  props.randomList ? false : props?.listID?.match(/^\d+$/g)?.length == 1;

const favoritedIDs = ref<string[] | null>();

let addIntoRecentlyViewed = false;
let recentlyViewed: ListPreview[];

const LIST_DATA = ref<ListFetchResponse>({data: {levels: []}});
const LIST_CREATOR = ref<string>("");
const LIST_COL = ref<number[]>([0, 0, 0]);

const nonexistentList = ref<boolean>(false)
function main() {
  
  let listURL = `${!PRIVATE_LIST ? "pid" : "id"}=${props?.listID}`;
  if (props.randomList) listURL = "random";

  nonexistentList.value = false
  
  axios
    .get(import.meta.env.VITE_API + "/getLists.php?" + listURL)
    .then((res: AxiosResponse) => {
      if (res.data == 2) {
        nonexistentList.value = true
        return
      }
  
      LIST_DATA.value = res.data[0];
      LIST_CREATOR.value = LIST_DATA.value?.creator! || res.data[1][0].username;
  
      // Use new levelList structure (put levels into 'levels' array)
      if (!LIST_DATA.value?.data.levels) {
        LIST_DATA.value!.data.levels = [];
        Object.keys(LIST_DATA.value?.data!)
          .filter((x: string) => x.match(/\d+/g))
          .forEach((level: string) => {
            LIST_DATA.value?.data.levels.push(LIST_DATA.value.data[level]);
          });
      }
  
      if (localStorage != undefined) {
        favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
        recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")!) ?? [];
  
        addIntoRecentlyViewed =
          recentlyViewed.filter((list: ListPreview) => list.id == (!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!))
          .length == 0; // Has not been viewed yet
      }
  
      if (addIntoRecentlyViewed) {
        let isListPrivate = Boolean(LIST_DATA.value?.hidden != "0");
        recentlyViewed.push({
          creator: LIST_CREATOR.value,
          id: (!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!).toString(),
          name: LIST_DATA.value?.name!,
          uploadDate: Date.now(),
          hidden: "0",
        });
        if (recentlyViewed.length == 10) recentlyViewed.splice(0, 1); // Gets sliced to 3 on homepage
        localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
      }
  
      document.title = `${LIST_DATA.value?.name} | GD Seznamy`;
  
      // Set list colors
      let listColors: number[] | string = LIST_DATA.value?.data.pageBGcolor!;
      LIST_COL.value =
        typeof listColors == "string" ? chroma(listColors).hsl() : listColors;
      if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]))
        modifyListBG(LIST_COL.value);
  
      // Set list background image
      let listBG = LIST_DATA.value?.data?.titleImg!;
      (
        document.body as HTMLBodyElement
      ).style.backgroundImage = `url('${
        typeof listBG == "string" ? listBG : listBG[0] ?? ""
      }')`;
      positionListBackground()
  
      // Check pinned status
      if (localStorage) {
        JSON.parse(localStorage.getItem("pinnedLists")!).forEach((pin: ListPreview) => {
          if ([LIST_DATA.value.id, LIST_DATA.value.hidden].includes(pin.id!)) listPinned.value = true
        });
      }
    });
  
  }
  
const positionListBackground = () => ["left", "center", "right"][LIST_DATA.value.data.titleImg?.[3]];

const tryJumping = (ind: number, forceJump = false) => {
  let isJumpingFromFaves = new URLSearchParams(window.location.search).get(
    "goto"
  );
  if (forceJump) {
    isJumpingFromFaves = ind.toString();
    jumpToPopupOpen.value = false;
  }

  if (isJumpingFromFaves && parseInt(isJumpingFromFaves) == ind) {
    let jumpedToCard = document.querySelectorAll(".levelCard");

    if (parseInt(isJumpingFromFaves) > 1) {
      jumpedToCard[
        Math.max(0, parseInt(isJumpingFromFaves) - 2)
      ].scrollIntoView();
    }
    (
      jumpedToCard[Math.max(0, parseInt(isJumpingFromFaves))] as HTMLDivElement
    ).style.animation = "flash 0.8s linear";
  }
};

const listPinned = ref<boolean>(false)
const toggleListPin = () => {
  if (localStorage) {
    let pinned: ListPreview[] = JSON.parse(localStorage.getItem('pinnedLists')!)
    if (listPinned.value) { // Remove from pinned
      let i = 0
      pinned.forEach((pin: ListPreview) => {
        if (pin.id == LIST_DATA.value.id) pinned.splice(i, 1)
        i++
      })
    }
    else {
      pinned.push({
        name: LIST_DATA.value.name,
        creator: LIST_CREATOR.value,
        uploadDate: Date.now(),
        id: LIST_DATA.value.id,
        hidden: LIST_DATA.value.hidden,
        isPinned: true
      })
    }
    if (pinned.length > 5) { // Remove last pinned level
      pinned.splice(0, 1)
    }

    listPinned.value = !listPinned.value
    localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  }
}

const getURL = () => `${window.location.host}/${!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!}`;
const sharePopupOpen = ref<boolean>(false);
const jumpToPopupOpen = ref<boolean>(false);
const commentsShowing = ref<boolean>(false)

const listActions = (action: string) => {
  switch (action) {
    case "comments":
      commentsShowing.value = !commentsShowing.value;
      break;
    case "sharePopup":
      sharePopupOpen.value = true;
      break;
    case "jumpPopup":
      jumpToPopupOpen.value = true;
      break;
    case "pinList":
      toggleListPin()
      break;
    case "editList":
      router.push(`/${!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!}/edit`)
      break;
  }
};

</script>

<template>
  <!-- <div
    :style="{
      height: (LIST_DATA?.data?.titleImg?.[2] ?? 0) + '%',
      backgroundPositionY: (LIST_DATA?.data?.titleImg?.[1] ?? 0) + '%',
    }"
  > -->
    <div
      v-if="LIST_DATA?.data.titleImg?.[4]"
      :style="{
        backgroundImage: `linear-gradient(180deg, ${chroma(
          chroma.hsl(
            LIST_COL[0],
            0.36,
            LIST_COL[1] < 1 ? LIST_COL[1] : LIST_COL[1] * 0.015625
          )
        ).hex()}, transparent)`,
      }"
      class="absolute w-full h-full -z-20"
    ></div>
  <!-- </div> -->

  <SharePopup
    v-show="sharePopupOpen"
    @close-popup="sharePopupOpen = false"
    :share-text="getURL()"
  />
  <PickerPopup
    @select-option="tryJumping(LIST_DATA?.data.levels.indexOf($event)!, true)"
    v-show="jumpToPopupOpen"
    picker-data-type="level"
    :picker-data="LIST_DATA.data.levels"
    @close-popup="jumpToPopupOpen = false"
    browser-name="Skočit na"
  />

  <section class="mt-12 text-white">
    <header>
      <div class=""></div>
      <ListDescription
        @do-list-action="listActions"
        v-bind="LIST_DATA"
        :creator="LIST_CREATOR"
        :id="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
        :list-pinned="listPinned"
        class="mb-8"
        v-if="LIST_DATA.name != undefined && !nonexistentList"
      />
    </header>
    <main class="flex flex-col gap-4">

      <!-- Nonexistent list -->
      <section v-if="nonexistentList" class="flex flex-col items-center my-20 text-white">
        <img src="@/images/listError.svg" class="w-56 opacity-60" alt="">
        <h2 class="mt-2 text-2xl font-bold opacity-60">Tento seznam neexistuje!</h2>
        <div class="flex gap-3 mt-5 max-sm:flex-col">
          <RouterLink to="/random">
            <button class="p-2 rounded-md bg-greenGradient button"><img src="@/images/dice.svg" class="inline mr-3 w-8" alt="">Jít na náhodný seznam</button>
          </RouterLink>
          <RouterLink to="/">
            <button class="p-2 text-left rounded-md bg-greenGradient button"><img src="@/images/browseMobHeader.svg" class="inline mr-3 w-8" alt="">Jít domů</button>
          </RouterLink>
        </div>
      </section>

      <!-- List -->
      <LevelCard
        v-for="(level, index) in LIST_DATA?.data.levels"
        v-bind="level"
        :favorited="favoritedIDs?.includes(level.levelID!)"
        :level-index="index"
        :list-i-d="PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
        :list-name="LIST_DATA?.name!"
        :translucent-card="LIST_DATA?.data.translucent!"
        class="levelCard"
        :disable-stars="false"
        v-show="!commentsShowing"
        @vnode-mounted="tryJumping(index)"
      />

      <CommentSection v-show="commentsShowing" v-if="LIST_DATA?.id != undefined" :list-i-d="PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"/>
    </main>
  </section>
</template>
