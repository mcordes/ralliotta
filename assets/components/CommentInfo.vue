<template>
    <div class="comment">
        <div v-if="isEdit">

            <div>
                <TextAreaInput v-model="text" v-bind:maxlength="32768" v-bind:class="'comment-textarea'" v-bind:placeholder="'Your comment...'"/>
            </div>

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
                    <div class="avatar-wrapper" v-if="activity.user">
                        <Avatar v-bind:user="activity.user" v-bind:size="30"/>
                    </div>
                    {{ activity.userName }} said:
                </div>
            </div>
            <div class="comment-details" v-html="comment.Text"></div>
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
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {Comment} from "../types/Comment";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import {Ref} from "../types/Ref";
    import Avatar from "./Avatar.vue";
    import TextAreaInput from "./TextAreaInput.vue";
    import {ActivityItem} from "../services/service";
    import {getService} from "../services/init";

    @Component({
        components: {TimeSinceDate, Avatar, TextAreaInput},
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
                result = await getService().updateItem(this.comment._ref, data)
                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast();
            }

            // re-retrive comment with all the fields included (the responses above just include a subset of them)
            const persistedComment = await getService().fetchSingleItemByRef(result._ref);
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
