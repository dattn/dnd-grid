import Vue from 'vue'
import App from './App'
import VueTouch from 'vue-touch'

Vue.use(VueTouch, {name: 'v-touch'})

// eslint-disable-next-line no-new
new Vue({
    el: '#app',
    render: h => h(App)
})
