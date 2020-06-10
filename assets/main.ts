import Vue from 'vue';
import App from './components/App.vue';

// @ts-ignore
import {MdDialog, MdButton, MdTabs, MdIcon, MdContent, MdField, MdCheckbox, MdMenu, MdList} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/black-green-light.css';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';

// @ts-ignore
import VueFroala from 'vue-froala-wysiwyg';

import ItemList from "./components/ItemList.vue";
import ItemDetail from "./components/ItemDetail.vue";
import InvalidRoute from "./components/InvalidRoute.vue";
import Home from "./components/Home.vue";
import VueRouter from "vue-router";

// @ts-ignore
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";

// include common css file
import './app.css';
import {DateTime} from "luxon";

// @ts-ignore
import TimeAgo from 'javascript-time-ago';
// @ts-ignore
import en from 'javascript-time-ago/locale/en';
import Kanban from "./components/Kanban.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/list', component: ItemList },
    { path: '/list/my', component: ItemList, props: {showMyItemsOnly: true}},
    { path: '/detail/:formattedID', component: ItemDetail },
    { path: '/kanban', component: Kanban },
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
Vue.use(MdCheckbox);
Vue.use(MdIcon);
Vue.use(MdMenu);
Vue.use(MdList);
Vue.use(VueRouter);
Vue.use(VueToast);
Vue.use(VueFroala);

new Vue({
    render: h => h(App),
    router,
}).$mount("#app");


// filters

Vue.filter("formatDate", function (value: string) {
    if (!value) {
        return "";
    }
    return DateTime.fromISO(value).toFormat("MM/dd/yyyy");
});


Vue.filter("formatDateTime", function (value: string) {
    if (!value) {
        return "";
    }
    return DateTime.fromISO(value).toFormat("MM/dd/yyyy HH:mm");
});


Vue.filter("timeSince", function (value: string) {
    if (!value) {
        return "";
    }

    const date = DateTime.fromISO(value).toJSDate();
    TimeAgo.addLocale(en)
    const timeAgo = new TimeAgo('en-US')
    return timeAgo.format(date);
});



