<template>
    <div>
        <h2>Login</h2>

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
        <md-button class="md-primary" @click="submit">Submit</md-button>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop, PropSync} from 'vue-property-decorator';
    import store from "../store";
    import {User} from "../models/User";

    // TODO-mrc: make this a real dialog?

    @Component
    export default class Login extends Vue {
        username = '';
        password = '';
        sharedState = store.state;
        errorMessage = '';

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
    .md-dialog {
        max-width: 768px;
    }
    .errorMessage {
        color: red;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    input {
        padding: 10px;
        margin: 10px;
        width: 300px;
    }
</style>
