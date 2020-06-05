<template>
    <div>
        <div v-if="store.hasCredentials() && sharedState.user == null">
            <p>Loading.....</p>
        </div>

        <div v-else-if="store.hasCredentials() && sharedState.user">
            <div class="md-toolbar md-dense md-elevation-0">
                <div class="md-toolbar-row">
                    <div class="md-toolbar-section-start">
                        <nav>
                            <router-link to="/">Home</router-link>
                            <router-link to="/list">List items</router-link>
                            <router-link to="/list/my">My items</router-link>
                        </nav>
                    </div>
                    <div class="md-toolbar-section-end">
                        <h3 class="md-subheading">Hello, {{ sharedState.user.data.FirstName }}!</h3>
                        <div v-if="sharedState.user.userProfileImage">
                            <!-- NOTE: the weird urls here b/c parcel mangles them otherwise -->
                            <img class="user-img" :src="`${sharedState.user.userProfileImage }`">
                        </div>
                        <md-button class="md-raised" @click="logout">Logout</md-button>
                    </div>
                </div>
            </div>

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
    import {User} from "../models/User";

    @Component({
        components: {LoginModal}
    })
    export default class App extends Vue {
        sharedState = store.state;
        store = store;

        logout() {
            store.clearUser();
            // TODO: navigate back to home page?
            // TODO: add 'are you sure' modal at some point.
        }

        async created() {
            // If we have the user's credentials then try to retrieve the current user.
            // NOTE: This isn't a login, its continuing a session that's already active
            if (store.hasCredentials()) {
                try {
                    const user = await User.fetchCurrentUser();
                    store.setUser(user);
                }
                catch(e) {
                    console.log("Unable to retrieve current user: " + e  + ": " + e.message);
                }
            }
        }
    };

</script>


<style scoped>
    nav a {
        padding: 5px;
        margin-right: 10px;
        color: inherit;
    }

    /* Added for by vue-router */
    nav a.router-link-exact-active {
        color: blue;
    }
</style>



