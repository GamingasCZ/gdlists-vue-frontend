import { ref, watch } from "vue";

export const SETTINGS = ref({
  scrolling: 0,
  language: 0,
  homepageColumns: 1
});

watch(SETTINGS, () => {
  if (localStorage) {
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value))
  }
}, {deep: true})
