<template>
    <div>
        <div class="activity-wrapper">
            <div class="comment" v-for="comment in comments">
                <div class="comment-header">
                    <div class="comment-date">
                        <TimeSinceDate v-bind:date="comment.CreationDate"/>
                    </div>
                    <div class="comment-author">
                        <div class="ticket-id">
                            <ItemDetailModal class="item-id" v-bind:formattedID="comment.Artifact.FormattedID" v-bind:title="comment.Artifact.Name"/>
                        </div>
                        <div class="avatar-wrapper">
                            <Avatar v-bind:user="comment.User" v-bind:size="30"/>
                        </div>
                        {{ comment.User._refObjectName }} said:
                    </div>
                </div>
                <div class="comment-details" v-html="comment.Text"></div>
            </div>
        </div>

        <div v-if="hasMoreRecords" class="show-more-wrapper">
            <md-button class="md-primary md-raised" @click="showMore" :disabled="isLoading">Show more</md-button>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {showErrorToast} from "../utils/util";
    import {COMMENT_SEARCH_FIELDS} from "../types/Comment";
    import store from "../store";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import Avatar from "./Avatar.vue";
    import ItemDetailModal from "./ItemDetailModal.vue";
    import {getService} from "../services/init";


    @Component({
        components: {Avatar, TimeSinceDate, ItemDetailModal}
    })
    export default class RecentCommentsForProject extends Vue {
        comments: Comment[] = [];
        hasMoreRecords = false;
        totalRecords = 0;
        isLoading = false;
        sharedState = store;

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
            const projectRef = user.DefaultProject;

            // clear all results if we're showing the first page worth of data
            if (startIndex === 1) {
                this.comments = [];
                this.hasMoreRecords = false;
                this.totalRecords = 0;
            }

            try {
                const results = await getService().fetchListOfItems('conversationPost', COMMENT_SEARCH_FIELDS, {
                    startIndex,
                    pageSize,
                    order: "CreationDate desc",
                    projectScope: projectRef,
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


<style lang="css" scoped>
    .activity-wrapper div:last-child:after {
        width: 0;
        height: 0;
    }

    .comment {
        margin: 20px 0;
    }

    .comment:before,
    .comment:after {
        bottom: -21px;
        height: 20px;
    }

    .comment .ticket-id {
        float: left;
        margin-right: 10px;
    }

    .attachment:before,
    .add-comment:before,
    .comment:before {
        top: -21px;
    }

    .show-more-wrapper {
        text-align: center;
        max-width: 1000px;
    }
</style>

<style lang="css">
    .comment-details p:first-child { margin-top: 0; }
    .comment-details p:last-child { margin-bottom: 0; }

    .comment .ticket-id .item-id > a {
        color: #1A59AB;
        font-weight: 600;
        text-decoration: none;
    }
</style>
