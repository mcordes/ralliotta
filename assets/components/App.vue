<template>
    <div>
        <div v-if="store.hasCredentials() && sharedState.user == null">
            <p>Loading...</p>
        </div>

        <div v-else-if="store.hasCredentials() && sharedState.user">
            <div class="md-toolbar md-dense md-elevation-0">
                <div class="md-toolbar-row">
                    <div class="md-toolbar-section-start">
                        <h3 class="md-subheading">Hello {{ sharedState.user.data.FirstName }}</h3>
                    </div>
                    <div class="md-toolbar-section-end">
                        <md-button class="md-raised" @click="logout">Logout</md-button>
                        <div v-if="sharedState.user.userProfileImage">
                            <!-- NOTE: the weird urls here b/c parcel mangles them otherwise -->
                            <img class="user-img" :src="`${sharedState.user.userProfileImage }`">
                        </div>
                    </div>
                </div>

                <nav class="md-toolbar-row">
                    <router-link to="/">Home</router-link>
                    <router-link to="/list">List items</router-link>
                    <router-link to="/list/my">My items</router-link>
                </nav>
            </div>

            <router-view />
        </div>

        <!-- NOTE: else block -->
        <div v-else>
            <Login/>
        </div>
    </div>
</template>


<script lang="ts">

    import {Component, Prop, Vue} from 'vue-property-decorator';
    import store from "../store";
    import Login from "./Login.vue";
    import {User} from "../models/User";

    @Component({
        components: {Login}
    })
    export default class App extends Vue {
        sharedState = store.state;
        store = store;

        logout() {
            store.clearUser();
            // TODO-mrc: navigate back to home page?
            // TODO-mrc: add 'are you sure' modal at some point.
        }

        async created() {
            // If we have the user's credentials then try to retrieve the current user.
            // TODO-mrc: the login page might still flash. Fix that.
            // NOTE: This isn't a login, its continuing a session that's already active

            // TODO-mrc: verify session (do we know when it's going to expire, if so check that too)
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
</style>



