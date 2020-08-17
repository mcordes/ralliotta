<template>
    <div>
        <div v-if="sharedState.hasCredentials() && !sharedState.getUser()">
            <p>Loading.....</p>
        </div>

        <div v-else-if="sharedState.hasCredentials() && sharedState.getUser()">
            <div class="md-toolbar md-dense md-elevation-0">
                <div class="md-toolbar-row">
                    <div class="md-toolbar-section-start">
                        <md-button class="md-icon-button main-nav-toggle" @click="toggelNavigation">
                            <md-icon>menu</md-icon>
                        </md-button>
                        <nav class="main-nav">
                            <router-link to="/">Home</router-link>
                            <router-link to="/list">Search</router-link>
                            <router-link to="/list/my">My work</router-link>
                            <router-link to="/kanban">Kanban</router-link>
                            <router-link to="/new">New</router-link>
                        </nav>
                    </div>
                    <div class="md-toolbar-section-end">
                        <md-menu md-size="medium" md-align-trigger>
                            <md-button md-menu-trigger>
                                <span class="md-subheading">Hello, {{ sharedState.getUser().FirstName }}!</span>
                                <span v-if="sharedState.getUser().userProfileImage">
                                    <!-- NOTE: the weird urls are here b/c parcel mangles them otherwise -->
                                    <img class="user-img" :src="`${sharedState.getUser().userProfileImage }`">
                                </span>
                            </md-button>

                            <md-menu-content>
                                <md-menu-item @click="logout">Logout</md-menu-item>
                            </md-menu-content>
                        </md-menu>
                    </div>
                </div>
            </div>

            <md-drawer md-swipeable class="md-drawer md-left md-temporary">
                <md-toolbar class="md-toolbar md-transparent md-elevation-1">
                    <button type="button" class="md-button md-icon-button md-dense md-input-action md-clear md-theme-default" @click="toggelNavigation">
                        <div class="md-ripple">
                            <div class="md-button-content">
                                <i class="md-icon md-icon-font md-icon-image md-theme-default">
                                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                    </svg>
                                </i>
                            </div>
                        </div>
                    </button>
                </md-toolbar>
                <md-list class="md-list">
                    <md-list-item class="md-list-item">
                        <md-button to="/">Home</md-button>
                    </md-list-item>
                    <md-list-item class="md-list-item">
                        <md-button to="/list">Search</md-button>
                    </md-list-item>
                    <md-list-item class="md-list-item">
                        <md-button to="/list/my">My work</md-button>
                    </md-list-item>
                    <md-list-item class="md-list-item">
                        <md-button to="/kanban">Kanban</md-button>
                    </md-list-item>
                    <md-list-item class="md-list-item">
                        <md-button to="/new">New</md-button>
                    </md-list-item>
                </md-list>
            </md-drawer>

            <router-view class="content-wrapper" />
        </div>

        <!-- NOTE: this will show / hide itself appropriately -->
        <LoginModal/>

    </div>
</template>


<script lang="ts">

    import {Component, Prop, Vue} from 'vue-property-decorator';
    import store from "../store";
    import LoginModal from "./LoginModal.vue";
    import {showErrorToast} from "../utils/util";
    import {AuthenticationError} from "../exceptions";
    import {getService} from "../services/init";

    @Component({
        components: {LoginModal}
    })
    export default class App extends Vue {
        sharedState = store;

        logout() {
            this.sharedState.clearUser();
            this.$router.push("/");
        }

        toggelNavigation() {
            document.querySelector('.md-drawer').classList.toggle('md-active');
        }

        async created() {
            // If we have the user's credentials then try to retrieve the current user.
            // NOTE: This isn't a login, its continuing a session that's already active
            if (this.sharedState.hasCredentials()) {
                try {
                    const user = await getService().fetchCurrentUser();
                    store.setUser(user);
                }
                catch(e) {
                    // NOTE: if we get a 401 back from the service we'll throw an AuthenticationError and that will be
                    // handled in main.ts
                    if (!(e instanceof AuthenticationError)) {
                        showErrorToast({e});
                        console.log("Unable to retrieve current user: " + e  + ": " + e.message);
                    }
                    throw e;
                }
            }
        }
    };

</script>


<style scoped>
    .md-drawer {
        background: #FFF;
        z-index: 1000;
    }

    .md-drawer .md-list .md-button {
        width: 100%;
    }

    nav a {
        padding: 5px;
        margin-right: 10px;
        color: inherit;
    }

    /* Added for vue-router */
    nav a.router-link-exact-active {
        color: blue;
    }
</style>



