import Vue from 'vue'
import App from './App.vue'
import { JsPlumbToolkitVue2Plugin } from '@jsplumbtoolkit/browser-ui-vue2'

Vue.config.productionTip = false

// import jsPlumb Toolkit plugin
Vue.use(JsPlumbToolkitVue2Plugin)

new Vue({ render: h => h(App) }).$mount('#app')

