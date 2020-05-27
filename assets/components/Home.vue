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
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {getRallyAPI, updateItem} from "../util";
    import store from "../store";

    @Component
    export default class Home extends Vue {
    }

</script>

<style scoped>
</style>



