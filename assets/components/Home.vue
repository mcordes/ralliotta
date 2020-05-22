<template>
    <div>
        <div>Your homepage</div>
        <p>Put something here, but what? Maybe...</p>
        <ul>
            <li>A list of tickets assigned to you</li>
            <li>Tickets you're watching (whatever that means to rally)</li>
            <li>User info - project(s), name, profile image, etc </li>
            <li>
                <router-link to="/list">List items</router-link>
            </li>
        </ul>

        <md-button class="md-primary" @click="submit">Test update</md-button>

    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {getRallyAPI, updateItem} from "../util";
    import store from "../store";

    // TODO-mrc: update object test

    @Component
    export default class Home extends Vue {
        async submit() {
            const api = getRallyAPI(store.getCredentials());
            const ref = "https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement/367283016592";

            try {
                await updateItem(ref, {'Name': 'Ni User Story 2'})
            }
            catch(e) {
                const msg = "error updating item -" + e;
                console.log(msg);
                throw new Error(msg);
            }

            alert('it worked?');
        }
    }

</script>

<style scoped>
</style>



