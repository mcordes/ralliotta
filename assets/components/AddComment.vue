<template>
    <div class="add-comment">
        <md-field>
            <md-textarea class="comment-textarea" v-model="text" required maxlength="32768"
                         placeholder="Your comment..."/>
        </md-field>

        <div v-if="errorMessage" class="errorMessage">
            {{ errorMessage }}
        </div>

        <div v-if="isEdit">
            <md-button class="md-raised" @click="submit">Save</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </div>

    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop, Watch} from 'vue-property-decorator';
    import store from "../store";
    import {createItem, fetchSingleItemByRef, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {ActivityItem, toActivityItem} from "../utils/activity-util";

    @Component
    export default class AddComment extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        itemRef!: string;

        @Prop()
        activityItems!: ActivityItem[];

        @Watch("text")
        onTextChange() {
            this.isEdit = !!this.text;  // set to true if text is non blank / null
        }

        text = '';
        sharedState = store;
        errorMessage = '';
        isEdit = false;

        async submit() {
            this.errorMessage = '';
            const data = {'Text': this.text, 'Artifact': this.itemRef};

            let result;
            try {
                result = await createItem("conversationpost", data)
                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast();
            }

            // re-retrive comment with all the fields included (the responses above just include a subset of them)
            const comment = await fetchSingleItemByRef(result._ref);

            // add to list of activities
            this.activityItems.push(toActivityItem(comment, "comment"));

            this.clear();
        }

        cancel() {
            this.text = '';
        }

        clear() {
            this.text = '';
            this.errorMessage = '';
        }
    };
</script>


<style lang="css" scoped>
    .add-comment {
        margin-bottom: 10px;
        max-width: 1000px;
    }

    .add-comment .md-field { padding-top: 0; }

    .comment-textarea { background: #FFF; }
</style>
