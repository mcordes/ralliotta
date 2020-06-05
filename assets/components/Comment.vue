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
                    {{ data.CreationDate | formatDateTime }}
                </div>
                <div class="comment-author">
                    {{ authorName }} said:
                </div>
            </div>
            <div class="comment-details">
                {{ data.Text }}
            </div>
            <div class="comment-actions">
                <md-button class="md-icon-button md-mini" @click="edit">
                    <md-icon>&#9998;</md-icon>
                </md-button>
            </div>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {createItem, fetchSingleItemByRef, getDataFromReference, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";

    // @ts-ignore
    import VueFroala from 'vue-froala-wysiwyg';

    @Component
    export default class Comment extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        itemRef!: string;

        // Optional - only set when editing an existing comment
        @Prop()
        data: any;

        text = '';
        errorMessage = '';
        isEdit = false;
        authorName = '';

        created() {
            // if we're creating a new comment, then show the editable form
            this.text = this.data?.Text || '';
            this.authorName = getDataFromReference(this.data.User).name;
        }

        async submit() {
            this.errorMessage = '';
            const data = {'Text': this.text, 'Artifact': this.itemRef};

            let result;
            try {
                const commentRef = this.data._ref;
                result = await updateItem(commentRef, data)
                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast();
            }

            // re-retrive comment with all the fields included (the responses above just include a subset of them)
            const persistedComment = await fetchSingleItemByRef(result._ref);
            this.data = persistedComment;

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
    .comment {
        background: #FFF;
        border-radius: 6px;
        border: 1px solid #CCC;
        margin-bottom: 10px;
        max-width: 1000px;
        padding: 6px 8px;
        position: relative;
    }

    .comment:after {
        background: #CCC;
        bottom: -11px;
        content: '';
        height: 10px;
        left: 10px;
        position: absolute;
        width: 2px;
    }

    .comment-header {
        background: #EAEAEA;
        border-bottom: 1px solid #CCC;
        border-radius: 5px 5px 0 0;
        margin: -6px -8px 5px;
        padding: 2px 8px;
    }

    .comment-date {
        border-right: 1px solid #CCC;
        display: inline-block;
        font-weight: 600;
        padding-right: 12px;
    }

    .comment-author {
        display: inline-block;
        padding-left: 10px;
    }

    .comment-details {}

    .comment-actions {
        display: inline-block;
        width: 100%;
    }

    .comment-actions .md-button { float: right; }
</style>
