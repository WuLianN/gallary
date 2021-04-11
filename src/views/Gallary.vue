<template>
  <div class="gallary">
    <div
      class="gallary-img-wrapper"
      v-for="(item, index) in list"
      :key="item.id"
      @click="getCurrentIndex(index)"
    >
      <img class="gallary-img" @error="error(index)" :src="item.url" alt="" />
    </div>

    <template v-if="list.length % 4 !== 0">
      <div
        class="gallary-img-wrapper"
        v-for="(item, index) in 4 - (list.length % 4)"
        :key="index"
      >
        <div class="gallary-img"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import mediumZoom from 'medium-zoom'
import _ from 'lodash'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { pictureList } from '@/api/beauty'

async function getPictureList(listQuery) {
  const { page, limit } = listQuery
  const res = await pictureList(page, limit)
  return res.list
}

async function handleScroll() {
  const scrollTop = Math.floor(document.documentElement.scrollTop)
  const scrollHeight = Math.floor(document.documentElement.scrollHeight)
  const clientHeight = Math.floor(document.documentElement.clientHeight)

  if (scrollHeight - scrollTop <= clientHeight + 10) {
    listQuery.page++

    const data = await getPictureList(listQuery)
    if (data.length === 0) {
      console.log('not more')
    } else {
      list.value.push(...data)
    }
  }
}

function error(index) {
  // 移除不能加载的图片
  list.value.splice(index, 1)
}

function touchStart(e) {
  const { clientX } = e.changedTouches[0]
  startClienX = clientX
}

function touchEnd(e) {
  const { clientX: endClientX } = e.changedTouches[0]
  const zoom = document.querySelector('.medium-zoom-image--opened')
  if (endClientX - startClienX > 50) {
    if (currentIndex !== 0) {
      currentIndex--
      const imageUrl = list.value[currentIndex].url

      zoom.setAttribute('src', imageUrl)
    }
  } else if (endClientX - startClienX < -50) {
    if (currentIndex !== list.value.length) {
      currentIndex++
      const imageUrl = list.value[currentIndex].url

      zoom.setAttribute('src', imageUrl)
    }
  }
}

function getCurrentIndex(index) {
  currentIndex = index
}

const listQuery = {
  page: 1,
  limit: 30,
}

const list = ref([])
let hasOpenImg = ref(false)
let debounce
let startClienX
let currentIndex

const getList = async () => {
  list.value = await getPictureList(listQuery)
}

watch(
  () => [...list.value],
  () => {
    nextTick(() => {
      const zoom = mediumZoom(
        Array.from(document.querySelectorAll('.gallary-img')).filter(
          (img) => !img.classList.contains('medium-zoom-image')
        ),
        {
          margin: 10,
          background: 'rgba(0, 0, 0, .85)',
        }
      )

      zoom.on('close', () => {
        // console.log('close')
        hasOpenImg.value = false
      })

      zoom.on('open', () => {
        // console.log('open')
        hasOpenImg.value = true
      })
    })
  }
)

watch(
  () => hasOpenImg.value,
  () => {
    console.log(hasOpenImg.value)
    if (hasOpenImg.value) {
      window.addEventListener('touchstart', touchStart)
      window.addEventListener('touchend', touchEnd)
    } else {
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchend', touchEnd)
    }
  }
)

onMounted(() => {
  // 获取图片列表
  getList()

  debounce = _.debounce(handleScroll, 100, {
    leading: false,
    trailing: true,
  })

  window.addEventListener('scroll', debounce)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', debounce)
})
</script>

<style scoped>
.gallary {
  width: 100vw;
  padding: 1.6vw 0 0 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
}

.gallary-img-wrapper {
  width: 23vw;
  height: 23vw;
  position: relative;
  padding: 0 0 1.6vw 0;
}

.gallary-img {
  width: 100%;
  height: 100%;
}
</style>
