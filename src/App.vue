<template>
  <div class="nav" v-show="hasGo">
    <!-- <router-link to="/images">图片</router-link>
    <router-link to="/videos">视频</router-link> -->

    <div @click="goImages">图片</div>
    <div @click="goVideos">视频</div>
  </div>

  <router-view></router-view>
</template>

<script setup>
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

let hasGo = ref(true)
const goImages = () => {
  hasGo.value = false
  router.push({
    path: '/images',
  })
}
const goVideos = () => {
  hasGo.value = false
  router.push({
    path: '/videos',
  })
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  overflow: scroll;
}

.nav {
  width: 100vw;
  height: 30px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
}
</style>
