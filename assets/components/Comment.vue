<template>
    <div class="comment">
        <div v-if="isEdit">
            <md-field>
                <md-textarea v-model="text" required maxlength="32768"/>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>
            <md-button class="md-primary" @click="submit">Submit</md-button>

            <div v-if="!isNewComment">
                <md-button class="md-primary" @click="cancel">Cancel</md-button>
            </div>
        </div>
        <div v-else>
            {{ authorName }} said @ {{ data.CreationDate | formatDateTime }}
            <div>
                {{ data.Text }}
            </div>
            <md-button class="md-primary" @click="edit">Edit</md-button>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {createItem, fetchSingleItemByRef, getDataFromReference, updateItem} from "../rally-util";
    import {showErrorToast, showSuccessToast} from "../util";

    @Component
    export default class Comment extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        itemRef: string;

        // Optional - only set when editing an existing comment
        @Prop()
        data: any;

        text = '';
        sharedState = store.state;
        errorMessage = '';
        isEdit = false;
        isNewComment = false;
        authorName = '';

        created() {
            // if we're creating a new comment, then show the editable form
            this.text = this.data?.Text || '';
            this.isNewComment = !this.data;
            this.isEdit = this.isNewComment;
            this.authorName = getDataFromReference(this.data.User).name;
        }

        async submit() {
            this.errorMessage = '';

            // TODO-mrc: will it fill in the user for me?
            const data = {'Text': this.text, 'Artifact': this.itemRef};

            // TODO-mrc: error handling
            let result;
            try {
                if (this.isNewComment) {
                    result = await createItem("conversationpost", data)
                } else {
                    const commentRef = this.data._ref;
                    result = await updateItem(commentRef, data)
                }
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
    .comment { margin-bottom: 10px }
</style>
