<template>
  <div class="container">
    <div class="video-wrapper" v-for="(item, index) in videoData" :key="index">
      <video
        :src="item.url"
        :data-index="index"
        :ref="setVideoRef"
        class="video"
        :height="videoHeight"
        controls
      ></video>
    </div>
  </div>
</template>

<script setup>
import { touchStart, touchEnd } from '@/utils/touch'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import _ from 'lodash'

const videoHeight = ref(200)
let videoRefs = []
const setVideoRef = (el) => {
  if (el) {
    videoRefs.push(el)
  }
}

let startClienY
let direction
const videoData = ref([
  { name: 1, url: '/video/1.mp4' },
  { name: 2, url: '/video/2.mp4' },
  { name: 3, url: '/video/3.mp4' },
  { name: 4, url: '/video/4.mkv' },
  { name: 5, url: '/video/5.mkv' },
  { name: 6, url: '/video/6.mkv' },
])

const getTouchStart = (e) => {
  // const touchData = touchStart(e)
  // const { clientY } = touchData

  // startClienY = clientY

  document
    .querySelector('.container')
    .removeEventListener('scroll', debounceScroll)
}

const getTouchEnd = (e) => {
  const touchData = touchEnd(e)
  const { clientY: endClientY } = touchData

  // if (endClientY - startClienY > 30) {
  //   // 往下
  //   direction = 'down'
  //   autoplay()
  // } else if (endClientY - startClienY < -30) {
  //   // 往上
  //   direction = 'up'
  //   autoplay()
  // }

  // 惯性滚动结束后，再计算intersectionRatio
  document
    .querySelector('.container')
    .addEventListener('scroll', debounceScroll)
}

const autoplay = () => {
  const container = document.querySelector('.container').getBoundingClientRect()
    .height
  const margin = (container - videoHeight.value) / 2

  const options = {
    root: document.querySelector('.container'),
    rootMargin: `-${margin}px 0px`,
    threshold: 1,
  }

  const callback = (entries) => {
    entries.forEach((ele) => {
      // if (direction === 'up') {
      //   if (ele.intersectionRatio > 0 && ele.intersectionRatio < 1) {
      //     // const index = ele.target.dataset.index
      //     // if (index != 0) {
      //     //   const isPaused = videoRefs[index - 1].paused
      //     //   !isPaused && videoRefs[index - 1].pause()
      //     // }
      //     // videoRefs[index].play()
      //   }
      // } else if (direction === 'down') {
      //   if (ele.intersectionRatio >= 0.95) {
      //     // const index = ele.target.dataset.index
      //     // const isPaused = videoRefs[index].paused
      //     // if (isPaused) {
      //     //   videoRefs[index].play()
      //     // }
      //   }
      // }

      // 中间播放
      if (ele.intersectionRatio > 0.6) {
        videoRefs.forEach((item) => {
          !item.paused && item.pause()
        })

        const index = ele.target.dataset.index
        videoRefs[index].play()
      }
    })
  }

  const observer = new IntersectionObserver(callback, options)

  const target = document.querySelectorAll('.video')

  Array.from(target).forEach((item) => {
    observer.observe(item)
  })
}

let debounceScroll = _.debounce(autoplay, 100, {
  leading: false,
  trailing: true,
})

onMounted(() => {
  const container = document.querySelector('.container')
  container.addEventListener('touchstart', getTouchStart)
  container.addEventListener('touchend', getTouchEnd)
})

onBeforeUnmount(() => {
  const container = document.querySelector('.container')
  container.removeEventListener('touchstart', getTouchStart)
  container.removeEventListener('touchend', getTouchEnd)
})
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: scroll;
}

.video-wrapper {
  height: 200px;
  margin: 0 0 30px 0;
}

.video {
  width: 100vw;
  object-fit: fill;
}
</style>
