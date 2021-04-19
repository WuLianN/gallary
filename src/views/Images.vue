<template>
  <div class="gallary">
    <div
      class="gallary-img-wrapper gallary-img-special"
      v-for="(item, index) in list"
      :key="item.id"
      @click="getCurrentIndex(index)"
    >
      <img
        class="gallary-img"
        @error="error(index)"
        :data-src="item.url"
        alt=""
      />
    </div>

    <template v-if="list.length % rowImgSize !== 0">
      <div
        class="gallary-img-wrapper"
        v-for="(item, index) in rowImgSize - (list.length % rowImgSize)"
        :key="index"
      ></div>
    </template>
  </div>
</template>

<script setup>
import mediumZoom from 'medium-zoom'
import _ from 'lodash'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { pictureList } from '@/api/beauty'

const getPictureList = async (listQuery) => {
  const { page, limit } = listQuery
  const res = await pictureList(page, limit)
  return res.list
}

const getList = async (listQuery) => {
  list.value = await getPictureList(listQuery)
}

const handleScroll = async () => {
  console.log(1)
  const scrollTop = Math.floor(document.querySelector('#app').scrollTop)
  const scrollHeight = Math.floor(document.querySelector('#app').scrollHeight)
  const clientHeight = Math.floor(document.querySelector('#app').clientHeight)

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

const error = (index) => {
  // 移除不能加载的图片
  list.value.splice(index, 1)
}

const touchStart = (e) => {
  const { clientX } = e.changedTouches[0]
  startClienX = clientX
}

const touchEnd = async (e) => {
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

const getCurrentIndex = (index) => {
  currentIndex = firstOpenIndex = index
}

const moveScrollBar = (firstOpenIndex, currentIndex) => {
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

const handleSelected = () => {
  const firstOpenImg = document.querySelectorAll('.gallary-img-special')[
    firstOpenIndex
  ]
  const currentImg = document.querySelectorAll('.gallary-img-special')[
    currentIndex
  ]

  // 滑动 切换选中效果
  if (firstOpenIndex !== currentIndex) {
    firstOpenImg.classList.remove('selected')
    currentImg.classList.add('selected')
  }

  // 点击 - 关闭 - 点击 -> 移除选中效果
  if (previousIndex !== firstOpenIndex) {
    if (previousIndex >= 0) {
      const previousImg = document.querySelectorAll('.gallary-img-special')[
        previousIndex
      ]
      previousImg.classList.remove('selected')
    }

    previousIndex = firstOpenIndex
  }

  // 滑动 -> 移除选中效果
  if (previousIndex !== currentIndex) {
    if (previousIndex >= 0) {
      const previousImg = document.querySelectorAll('.gallary-img-special')[
        previousIndex
      ]
      previousImg.classList.remove('selected')
    }

    previousIndex = currentIndex
  }
}

const lazyLoad = () => {
  const options = {
    root: document.querySelector('#app'),
    rootMargin: '0px',
    threshold: 0.25,
  }

  const callback = (entries) => {
    entries.forEach((ele) => {
      if (ele.intersectionRatio > 0 && ele.intersectionRatio <= 1) {
        ele.target.src = ele.target.dataset.src
      }
    })
  }

  const observer = new IntersectionObserver(callback, options)

  const target = document.querySelectorAll('.gallary-img')

  Array.from(target).forEach((item) => {
    observer.observe(item)
  })
}

const listQuery = {
  page: 1,
  limit: 30,
}

const list = ref([]) // 图片列表
const rowImgSize = 4 // 一行的图片数量
let hasOpenImg = ref(false)
let debounce
let startClienX
let firstOpenIndex // 点击放大当前图片的索引
let currentIndex // 左右滑动，控制 currentIndex 的变化
let previousIndex = -1 // 移除上一个选中效果

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

        // 添加/移除/切换 选中效果
        handleSelected()
      })

      zoom.on('open', () => {
        hasOpenImg.value = true
        const img = document.querySelectorAll('.gallary-img-special')[
          firstOpenIndex
        ]

        img.classList.add('selected')
      })

      // 开启图片懒加载
      lazyLoad()
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
  getList(listQuery)

  debounce = _.debounce(handleScroll, 100, {
    leading: false,
    trailing: true,
  })

  const dom = document.querySelector('#app')
  dom.addEventListener('scroll', debounce)
})

onBeforeUnmount(() => {
  const dom = document.querySelector('#app')
  dom.removeEventListener('scroll', debounce)
})
</script>

<style scoped>
.gallary {
  width: 100vw;
  padding: 5px 0 0 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-content: flex-start;
}

.gallary-img-wrapper {
  width: 87px;
  height: 87px;
  position: relative;
  margin: 0 0 5px 0;
}

.gallary-img {
  width: 100%;
  height: 100%;
}

.selected {
  border: 1px solid red;
  box-shadow: 0 0 5px red;
}
</style>
