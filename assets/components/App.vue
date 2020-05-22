<template>
    <div>
        <div v-if="sharedState.user != null">
            <h3>Hello {{ sharedState.user.data.FirstName }}</h3>
            <div>
                <md-button class="md-primary" @click="logout">Logout</md-button>
            </div>

            <div v-if="sharedState.user.userProfileImage">
                <!-- NOTE: the weird urls here b/c parcel mangles them otherwise -->
                <img :src="`${sharedState.user.userProfileImage }`">
            </div>

            <nav>
                <router-link to="/">Home</router-link>
                <router-link to="/list">List items</router-link>
                <router-link to="/list/my">My items</router-link>
            </nav>

            <router-view />
        </div>

        <!-- NOTE: else block -->
        <div v-else>
            <Login/>
        </div>
    </div>
</template>


<script lang="ts">

    import {Component, Prop, PropSync, Vue} from 'vue-property-decorator';
    import store from "../store";
    import Login from "./Login.vue";
    import {User} from "../models/User";

    @Component({
        components: {Login}
    })
    export default class App extends Vue {
        sharedState = store.state;

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


