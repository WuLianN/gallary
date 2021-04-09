<template>
  <!-- <div v-for=""></div> -->
  <div></div>
</template>

<script setup>
import { pictureList } from '../api/beauty'

async function getPictureList(listQuery) {
  const { page, limit } = listQuery
  const list = await pictureList(page, limit)
  console.log(list)
}

const listQuery = {
  page: 1,
  limit: 10,
}

const list = getPictureList(listQuery)

</script>

<style scoped></style>
