<template>
    <div>
        <div v-for="comment in comments">

            <!-- TODO-mrc: this won't work, comment.Artifact.FormattedID isn't filled in. new endpoint for ref?
            <router-link :to="'/detail/' + comment.Artifact.FormattedID">{{ comment.Artifact.FormattedID }}</router-link>
            -->

            <div class="comment-header">
                <div class="comment-date">
                    <TimeSinceDate v-bind:date="comment.CreationDate"/>
                </div>
                <div class="comment-author">
                    <div class="avatar-wrapper">
                        <Avatar v-bind:user="comment.User" v-bind:size="30"/>
                    </div>
                    {{ comment.User._refObjectName }} said:
                </div>
            </div>
            <div class="comment-details">
                {{ comment.Text }}
            </div>
        </div>

        <div v-if="hasMoreRecords" style="text-align: center;">
            <md-button class="md-primary md-raised" @click="showMore" :disabled="isLoading">Show more</md-button>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {showErrorToast} from "../utils/util";
    import {fetchListOfItems, queryUtils} from "../utils/rally-util";
    import {COMMENT_SEARCH_FIELDS} from "../types/Comment";
    import store from "../store";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import Avatar from "./Avatar.vue";


    // TODO-mrc: there's quite a bit of duplication here w/ ItemList. Fix me?
    @Component({
        components: {Avatar, TimeSinceDate}
    })
    export default class RecentCommentsForProject extends Vue {
        comments: Comment[] = [];
        hasMoreRecords = false;
        totalRecords = 0;
        isLoading = false;
        sharedState = store;

        // TODO-mrc: needed?
        /*
        @Watch("$route")
        async onRouteChange(to: any, from: any) {
            this.comments = [];
            this.hasMoreRecords = false;
            await this.fetchResults();
        }
         */

        async created() {
            await this.fetchResults();
        }

        async showMore() {
            this.isLoading = true;
            const startIndex = this.comments.length;
            try {
                await this.fetchResults(startIndex);
            }
            catch (e) {
                showErrorToast({e});
            }
            this.isLoading = false;
        }

        protected async fetchResults(startIndex = 1, pageSize = 5) {
            const user = this.sharedState.getUser();


            // TODO-mrc: no project attribute on a comment
            // maybe this is when we'd use the scope attribute in the rally api?
            //const projectRef = user.DefaultProject;
            //let query = queryUtils.where('Project', '=', projectRef);

            // clear all results if we're showing the first page worth of data
            if (startIndex === 1) {
                this.comments = [];
                this.hasMoreRecords = false;
                this.totalRecords = 0;
            }

            try {
                const results = await fetchListOfItems('conversationPost', COMMENT_SEARCH_FIELDS, {
//                    query,
                    startIndex,
                    pageSize,
                    order: "CreationDate desc"
                });
                this.comments.push(...results.items);
                this.hasMoreRecords = results.hasMoreResults;
                this.totalRecords = results.totalRecords;
            }
            catch(e) {
                showErrorToast();
            }
        }
    };

</script>


<style scoped>
</style>
