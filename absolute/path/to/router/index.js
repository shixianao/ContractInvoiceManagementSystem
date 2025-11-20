import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import ContractManagement from '../components/ContractManagement.vue'
import InvoiceManagement from '../components/InvoiceManagement.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { 
      path: '/home', 
      component: Home,
      children: [
        { path: '/contracts', component: ContractManagement },
        { path: '/invoices', component: InvoiceManagement }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.localStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router