<template>
    <md-dialog :md-active.sync="!store.hasCredentials()"
        v-bind:md-close-on-esc="false"
        v-bind:md-click-outside-to-close="false"
        class="login-modal-wrapper"
    >
        <md-dialog-title>Login</md-dialog-title>

        <div>
            <md-field>
                <label>Username</label>
                <md-input id="username" type="text" v-model="username"/>
            </md-field>

            <md-field>
                <label>Password</label>
                <md-input id="password" type="password" v-model="password"/>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>
        </div>

        <md-dialog-actions>
            <md-button class="md-primary md-raised" @click="submit">Submit</md-button>
        </md-dialog-actions>

    </md-dialog>
</template>



<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import store from "../store";
    import {User} from "../models/User";

    // TODO-mrc: make this a real dialog?

    @Component
    export default class LoginModal extends Vue {
        username = '';
        password = '';
        sharedState = store.state;
        errorMessage = '';
        store = store;

        async created() {
            // TODO-mrc: maybe ditch the individual username/password fields and just store them in the store / state?
            const credentials = store.getCredentials();
            this.username = credentials.username;
        }

        async submit() {
            this.errorMessage = '';

            // TODO-mrc: do these in parallel and return an invalid password error if either fail (?)
            try {
                const session = await User.fetchCurrentSession(this.username, this.password);
                store.setCredentials(this.username, this.password, session.sessionId, session.securityToken);
            }
            catch (e) {
                this.errorMessage = "Invalid username / password. Please try again";
                console.log("Failed to lookup current session: " + e);
                return;
            }

            try {
                const user = await User.fetchCurrentUser();
                store.setUser(user);
            }
            catch (e) {
                this.errorMessage = "Invalid username / password. Please try again";
                console.log("Failed to lookup current user: " + e);
                return;
            }
        }
    };
</script>


<style lang="css" scoped>
    /*
        seems to not work because this is scoped strangely,
        outputted rules targeting data atttributes so we have less
        control over the wrapper container itself
        E.g. `.login-modal-wrapper .md-dialog-container[data-v-54d765]`
     */
    .login-modal-wrapper .md-dialog-container {
        border-radius: 20px;
        overflow: scroll;
        padding: 15px;
    }

    .login-modal-wrapper .md-dialog-title {
        padding: 14px 0 0;
        text-align: center;
    }

    .login-modal-wrapper .md-primary {
        display: block;
        margin: 10px auto 15px;
    }

    @media all and (max-width: 400px), (max-height: 400px) {
        .login-modal-wrapper .md-dialog-container {
            height: 100%;
            max-height: 95%;
            width: 100%;
        }
    }
</style>
