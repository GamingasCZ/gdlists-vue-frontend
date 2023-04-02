import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/Homepage.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../components/Editor.vue')
    },
    {
      path: '/browse',
      name: 'browser',
      props: route => ({browserName: "Komunitní seznamy", query: route.query.q ?? ""}),
      component: () => import('@/components/CommunityLists.vue')
    },
    {
      path: '/:id',
      name: 'listViewer',
      props: route => ({listID: route.params.id}),
      component: () => import('@/components/ListView.vue')
    }
  ]
})

export default router
