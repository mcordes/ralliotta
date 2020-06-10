<template>
    <div class="comment">
        <div v-if="isEdit">
            <md-field>
                <md-textarea v-model="text" required maxlength="32768"/>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>
            <md-button class="md-primary md-raised" @click="submit">Submit</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </div>
        <div v-else>
            <div class="comment-header">
                <div class="comment-date">
                    <TimeSinceDate v-bind:date="comment.CreationDate"/>
                </div>
                <div class="comment-author">
                    <div class="avatar-wrapper" v-if="comment.user">
                        <Avatar v-bind:user="comment.User" v-bind:size="30"/>
                    </div>
                    {{ activity.userName }} said:
                </div>
            </div>
            <div class="comment-details">
                {{ comment.Text }}
            </div>
            <div class="comment-actions">
                <md-button class="md-icon-button md-mini md-raised icon-btn-small" title="Edit" @click="edit">
                    <span>&#9998;</span>
                </md-button>
            </div>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {fetchSingleItemByRef, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {Comment} from "../types/Comment";
    // @ts-ignore
    import VueFroala from 'vue-froala-wysiwyg';
    import {ActivityItem} from "../utils/activity-util";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import {Ref} from "../types/Ref";
    import Avatar from "./Avatar.vue";

    @Component({
        components: {TimeSinceDate, Avatar},
    })
    export default class CommentInfo extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        item!: Ref;

        // Optional - only set when editing an existing comment
        @Prop()
        activity!: ActivityItem;

        // Optional - only set when editing an existing comment
        comment!: Comment;

        text = '';
        errorMessage = '';
        isEdit = false;

        created() {
            this.comment = this.activity.data;
            this.text = this.comment?.Text || '';
        }

        async submit() {
            this.errorMessage = '';
            const data = {'Text': this.text, 'Artifact': this.item._ref};

            let result;
            try {
                result = await updateItem(this.comment._ref, data)
                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast();
            }

            // re-retrive comment with all the fields included (the responses above just include a subset of them)
            const persistedComment = await fetchSingleItemByRef(result._ref);
            this.comment = persistedComment;

            this.isEdit = false;
        }

        edit() {
            this.isEdit = true;
        }

        cancel() {
            this.isEdit = false;
        }

    };
</script>


<style lang="css" scoped>
    .comment-actions {
        display: inline-block;
        width: 100%;
    }

    .comment-actions .icon-btn-small { float: right; }
</style>
