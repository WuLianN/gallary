import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/images',
      component: () => import('@/views/Images.vue'),
    },
    {
      path: '/videos',
      component: () => import('@/views/Videos.vue'),
    },
  ],
})

export default router
