import Vue from 'vue';
import App from './components/App.vue';

// TODO-mrc: find definition files
// @ts-ignore
import {MdDialog, MdButton, MdTabs, MdIcon, MdContent, MdField} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/black-green-light.css'

import ItemList from "./components/ItemList.vue";
import ItemDetail from "./components/ItemDetail.vue";
import InvalidRoute from "./components/InvalidRoute.vue";
import Home from "./components/Home.vue";
import VueRouter from "vue-router";

// TODO-mrc: find definition files
// @ts-ignore
import VueToastify from "vue-toastify";

// include common css file
import './app.css';
import {DateTime} from "luxon";

const routes = [
    { path: '/', component: Home },
    { path: '/list', component: ItemList },
    { path: '/list/my', component: ItemList, props: {showMyItemsOnly: true}},
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
Vue.use(VueToastify);

new Vue({
    render: h => h(App),
    router,
}).$mount("#app");


// filters

Vue.filter("formatDate", function (value: any) {
    if (!value) {
        return "";
    }
    return DateTime.fromISO(value).toFormat("MM/dd/yyyy");
});


Vue.filter("formatDateTime", function (value: any) {
    if (!value) {
        return "";
    }
    return DateTime.fromISO(value).toFormat("MM/dd/yyyy HH:mm");
});



