import Vue from 'vue';
import App from './components/App.vue';

// TODO-mrc: find definition files
// @ts-ignore
import {MdDialog, MdButton, MdTabs, MdIcon, MdSelect, MdTextarea, MdInput, MdLabel} from 'vue-material/dist/components';

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import ItemList from "./components/ItemList.vue";
import ItemDetail from "./components/ItemDetail.vue";
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

Vue.use(MdDialog);
Vue.use(MdButton);
Vue.use(MdTabs);
Vue.use(MdIcon);
// TODO-mrc: Vue.use(MdLabel);
// TODO-mrc: fix me - is this the right thing to include? How does MdContent relate?
//Vue.use(MdInput);
Vue.use(VueRouter);

new Vue({
    render: h => h(App),
    router,
//    el: "#app",
}).$mount("#app");


// TODO-mrc: what's the difference between el and mount?


