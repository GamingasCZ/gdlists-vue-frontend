import chroma from 'chroma-js'
import { ref } from 'vue'
import type { LevelList, Level, LevelTag } from './interfaces'

export const TAG_COUNT = 27

export const levelList = ref<LevelList>({
  description: '',
  diffGuesser: [false, false, false],
  pageBGColor: [0, 0, 0.2],
  titleImg: ['', 0, 33, 1, true],
  translucent: false,
  levels: []
})

export function addLevel() {
  let levelInfo: Level = {
    levelName: '',
    creator: '',
    color: chroma.hsl(Math.floor(Math.random() * 360), 1, Math.random() / 2).hsl(),
    levelID: '',
    video: '',
    difficulty: [0, 0],
    tags: []
  }

  levelList.value.levels.push(levelInfo)
}

export const deleteLevel = (index: number) => {
  levelList.value.levels.splice(index, 1)
}

export const moveLevel = (from: number, to: number) => {
  if (to < 0 || to >= levelList.value.levels.length) return from

  let currentCard = levelList.value.levels[from]
  levelList.value.levels.splice(from, 1)
  levelList.value.levels.splice(to, 0, currentCard)
  return to
}