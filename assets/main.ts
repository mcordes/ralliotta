import Vue from 'vue';
import App from './components/App.vue';

// TODO-mrc: find definition files
// @ts-ignore
import {MdDialog, MdButton, MdTabs, MdIcon, MdContent, MdField} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import ItemList from "./components/ItemList.vue";
import InvalidRoute from "./components/InvalidRoute.vue";
import Home from "./components/Home.vue";
import MyItemsList from "./components/MyItemsList.vue";
import VueRouter from "vue-router";

const routes = [
    { path: '/', component: Home },
    { path: '/list', component: ItemList },
    { path: '/list/my', component: MyItemsList },
    { path: '/detail/:formattedID', component: ItemDetail },
    { path: '*', component: InvalidRoute }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

Vue.config.productionTip = false;

Vue.use(MdField);
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdDialog);
Vue.use(MdIcon);
Vue.use(VueRouter);

new Vue({
    render: h => h(App),
    router,
}).$mount("#app");

