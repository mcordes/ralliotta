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
import './css/app.css';
import {DateTime} from "luxon";

// @ts-ignore
import TimeAgo from 'javascript-time-ago';
// @ts-ignore
import en from 'javascript-time-ago/locale/en';
import Kanban from "./components/Kanban.vue";
import MyWork from "./components/MyWork.vue";

// @ts-ignore
import config from "./config.json";
import {toDateTime} from "./utils/util";
import {NotFoundError} from "./exceptions";

const routes = [
    { path: '/', component: Home },
    { path: '/list', component: ItemList },
    { path: '/list/my', component: MyWork},
    { path: '/detail/:formattedID', component: ItemDetail },
    { path: '/404', component: InvalidRoute },
    { path: '/kanban', component: Kanban },
    { path: '*', component: InvalidRoute }
];

const router = new VueRouter({
    mode: config.routerMode,
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

Vue.filter("formatDate", function (value: string | Date | DateTime) {
    if (!value) {
        return "";
    }
    return toDateTime(value).toFormat("MM/dd/yyyy");
});


Vue.filter("formatDateTime", function (value: string | Date | DateTime) {
    if (!value) {
        return "";
    }
    return toDateTime(value).toFormat("MM/dd/yyyy HH:mm");
});


Vue.filter("timeSince", function (value: string | Date | DateTime) {
    if (!value) {
        return "";
    }

    const date = toDateTime(value).toJSDate();
    TimeAgo.addLocale(en)
    const timeAgo = new TimeAgo('en-US')
    return timeAgo.format(date);
});


// Error handler

Vue.config.errorHandler = function (err, vm, info) {
    // Show the 404 page if we've catch a NotFoundError
    if (err instanceof NotFoundError) {
        // TODO-mrc: does it need to change the URL?
        vm.$router.push("/404");
    }

    throw err;
}
