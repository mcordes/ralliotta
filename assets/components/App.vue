<template>
    <div>
        <div v-if="sharedState.hasCredentials() && !sharedState.getUser()">
            <p>Loading.....</p>
        </div>

        <div v-else-if="sharedState.hasCredentials() && sharedState.getUser()">
            <div class="md-toolbar md-dense md-elevation-0">
                <div class="md-toolbar-row">
                    <div class="md-toolbar-section-start">
                        <nav>
                            <router-link to="/">Home</router-link>
                            <router-link to="/list">List items</router-link>
                            <router-link to="/list/my">My items</router-link>
                            <router-link to="/kanban">Kanban</router-link>
                        </nav>
                    </div>
                    <div class="md-toolbar-section-end">
                        <h3 class="md-subheading">Hello, {{ sharedState.getUser().FirstName }}!</h3>
                        <div v-if="sharedState.getUser().userProfileImage">
                            <!-- NOTE: the weird urls here b/c parcel mangles them otherwise -->
                            <img class="user-img" :src="`${sharedState.getUser().userProfileImage }`">
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
    import {fetchCurrentUser} from "../utils/user-util";
    import {showErrorToast} from "../utils/util";

    @Component({
        components: {LoginModal}
    })
    export default class App extends Vue {
        sharedState = store;

        logout() {
            this.sharedState.clearUser();
            this.$router.push("/");
        }

        async created() {
            // If we have the user's credentials then try to retrieve the current user.
            // NOTE: This isn't a login, its continuing a session that's already active
            if (this.sharedState.hasCredentials()) {
                try {
                    const user = await fetchCurrentUser();
                    store.setUser(user);
                }
                catch(e) {
                    showErrorToast({e});
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



