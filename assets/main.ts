import Vue from 'vue';
import App from './components/App.vue';

// @ts-ignore
import {MdDialog, MdDialogConfirm, MdButton, MdTabs, MdIcon, MdContent, MdField, MdCheckbox, MdMenu, MdList, MdRadio, MdAutocomplete, MdProgress, MdToolbar, MdDrawer} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/black-green-light.css';
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

import Kanban from "./components/Kanban.vue";
import MyWork from "./components/MyWork.vue";
import {config} from "./config";
import {toDateTime} from "./utils/util";
import {AuthenticationError, NotFoundError} from "./exceptions";
import NewItem from "./components/NewItem.vue";
import store from "./store";
import 'jodit/build/jodit.min.css';

// @ts-ignore
import JoditVue from 'jodit-vue';
import Search from "./components/Search.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/new', component: NewItem },
    { path: '/list', component: Search },
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

/* eslint-disable @typescript-eslint/no-unused-vars */
router.afterEach((to, from) => {
    const selector = document.querySelector('.md-drawer');
    if (selector) {
        selector.classList.remove('md-active');
    }
});

Vue.config.productionTip = false;

Vue.use(MdField);
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdDialog);
Vue.use(MdDialogConfirm);
Vue.use(MdCheckbox);
Vue.use(MdIcon);
Vue.use(MdMenu);
Vue.use(MdList);
Vue.use(MdRadio);
Vue.use(MdAutocomplete);
Vue.use(MdProgress);
Vue.use(VueRouter);
Vue.use(VueToast);
Vue.use(JoditVue)
Vue.use(MdToolbar);
Vue.use(MdDrawer);

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

// Error handler
// eslint-disable @typescript-eslint/no-unused-vars
Vue.config.errorHandler = function (err, vm, info) {
    // Show the 404 page if we've catch a NotFoundError
    if (err instanceof NotFoundError) {
        vm.$router.push("/404");
    }

    // Handle 401s from api
    if (err instanceof AuthenticationError) {
        // NOTE: clearing the user triggers App.vue to hide the page and LoginModal.vue to show itself
        store.clearUser();
    }

    // Any other errors with 'error 401' in it - also clear user
    if (`${err}`.indexOf("Error 401") !== -1) {
        store.clearUser();
    }

    throw err;
}
