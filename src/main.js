import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import 'babel-polyfill'
import fastclick from 'fastclick'

import VueLazyLoad from 'vue-lazyload'
import 'common/stylus/index.styl'

Vue.config.productionTip = false

fastclick.attach(document.body)

Vue.use(VueLazyLoad,{
  error: require('common/image/default.png'),
  loading: require('common/image/timg.jpg')
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
