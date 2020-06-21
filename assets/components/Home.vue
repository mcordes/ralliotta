<template>
    <div>
        <h2>Welcome!</h2>

        <p>Another day at the old grind? We hope Ralliotta can be part of making this an
            extraordinary day! May your Rally woes be (slightly) reduced!
        </p>

        <br>
        <br>
        <br>

        <h3>Recent comments for project {{ projectName }}</h3>
        <div>
            <RecentCommentsForProject/>
        </div>

    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import RecentCommentsForProject from "./RecentCommentsForProject.vue";
    import {Project} from "../types/Project";
    import store from "../store";
    @Component({
        components: {RecentCommentsForProject}
    })
    export default class Home extends Vue {
        projectName!: string;
        sharedState = store;

        created() {
            const user = this.sharedState.getUser();
            this.projectName = user.DefaultProject._refObjectName;
        }
    }

</script>

<style scoped>
</style>



