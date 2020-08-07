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
    import {getService} from "../services/init";

    @Component
    export default class LoginModal extends Vue {
        username = '';
        password = '';
        errorMessage = '';
        store = store;

        async created() {
            const credentials = store.getCredentials();
            this.username = credentials.username;
        }

        async submit() {
            this.errorMessage = '';

            try {
                const session = await getService().login(this.username, this.password);
                store.setCredentials(this.username, this.password, session.sessionId, session.securityToken);
            }
            catch (e) {
                this.errorMessage = "Invalid username / password. Please try again";
                console.log("Failed to lookup current session: " + e);
                return;
            }

            try {
                const user = await getService().fetchCurrentUser();
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


<style lang="css">
    .login-modal-wrapper .md-dialog-container {
        border-radius: 20px;
        overflow: auto;
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
