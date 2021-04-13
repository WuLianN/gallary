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

    <template v-if="list.length % rowImgSize !== 0">
      <div
        class="gallary-img-wrapper"
        v-for="(item, index) in rowImgSize - (list.length % rowImgSize)"
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

async function getList() {
  list.value = await getPictureList(listQuery)
}

async function handleScroll() {
  const scrollTop = Math.floor(document.body.scrollTop)
  const scrollHeight = Math.floor(document.body.scrollHeight)
  const clientHeight = Math.floor(document.body.clientHeight)

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

async function touchEnd(e) {
  const { clientX: endClientX } = e.changedTouches[0]
  const zoom = document.querySelector('.medium-zoom-image--opened')
  if (endClientX - startClienX > 50) {
    // 往右滑，加载左边的图片
    if (currentIndex !== 0) {
      currentIndex--
      const imageUrl = list.value[currentIndex].url

      zoom.setAttribute('src', imageUrl)
    }
  } else if (endClientX - startClienX < -50) {
    // 往左滑，加载右边的图片
    if (currentIndex !== list.value.length) {
      currentIndex++
      let imageUrl

      // 滑动加载更多图片
      if (currentIndex === list.value.length) {
        listQuery.page++

        const data = await getPictureList(listQuery)
        if (data.length === 0) {
          console.log('not more')
        } else {
          list.value.push(...data)
          imageUrl = list.value[currentIndex].url
        }
      } else {
        imageUrl = list.value[currentIndex].url
      }

      zoom.setAttribute('src', imageUrl)
    }
  }
}

function getCurrentIndex(index) {
  currentIndex = firstOpenIndex = index
}

function moveScrollBar(firstOpenIndex, currentIndex) {
  // 计算图片的行之差
  const firstRowNum = Math.floor(firstOpenIndex / rowImgSize)
  const currentRowNum = Math.floor(currentIndex / rowImgSize)
  const rowDifferentAbs = Math.abs(currentRowNum - firstRowNum)
  // 判断方向
  const different = currentIndex - firstOpenIndex

  // 行之差 >= 1，即换行了 
  if (rowDifferentAbs >= 1) {
    const imgHeight = document.querySelector('.gallary-img').height
    const padding = 5
    const totalHeight = imgHeight + padding
    const scrollHeight = totalHeight * rowDifferentAbs
    const currentScrollY = window.scrollY

    if (different > 0) {
      window.scrollTo(0, currentScrollY + scrollHeight)
    } else if (different < 0) {
      window.scrollTo(0, currentScrollY - scrollHeight)
    }
  }
}

const listQuery = {
  page: 1,
  limit: 30,
}

const list = ref([])
const rowImgSize = 4 // 一行的图片数量
let hasOpenImg = ref(false)
let debounce
let startClienX
let firstOpenIndex, currentIndex

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
        hasOpenImg.value = false

        // 计算 firstOpenIndex 与 currentIndex 的差，来校正位置
        moveScrollBar(firstOpenIndex, currentIndex)
      })

      zoom.on('open', () => {
        hasOpenImg.value = true
      })
    })
  }
)

watch(
  () => hasOpenImg.value,
  () => {
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
  padding: 5px 0 0 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
}

.gallary-img-wrapper {
  width: 87px;
  height: 87px;
  position: relative;
  padding: 0 0 5px 0;
}

.gallary-img {
  width: 100%;
  height: 100%;
}
</style>
