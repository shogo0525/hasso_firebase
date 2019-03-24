import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import AdminLogin from './views/AdminLogin.vue'
import Board from './views/Board.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/admin/login',
      name: 'admin.login',
      component: AdminLogin
    },
    {
      path: '/board/:id',
      name: 'board.show',
      component: Board
    }
  ]
})
