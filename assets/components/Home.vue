<template>
    <div>
        <h2>Welcome!</h2>

        <p>Another day at the old grind? We hope Ralliotta can be part of making this an
            extraordinary day! May your Rally woes be (slightly) reduced!
        </p>

        <div class="recent-activity">
            <h3>Recent comments for project {{ projectName }}</h3>
            <div>
                <RecentCommentsForProject/>
            </div>
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

<style lang="css" scoped>
    .recent-activity {
        margin-top: 60px;
    }
</style>

<style lang="css">
    .recent-activity .comment-details p:first-child { margin-top: 0; }
    .recent-activity .comment-details p:last-child { margin-bottom: 0; }
</style>
