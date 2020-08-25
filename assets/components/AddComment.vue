<template>
    <div class="add-comment">

        <div>
            <TextAreaInput v-model="text" v-bind:maxlength="32768" v-bind:cssClass="'comment-textarea'"
                           placeholder="Your comment..."/>
        </div>

        <div v-if="errorMessage" class="errorMessage">
            {{ errorMessage }}
        </div>

        <div v-if="isEdit">
            <md-button class="md-primary md-raised" @click="submit">Save</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </div>

    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop, Watch} from 'vue-property-decorator';
    import store from "../store";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {Ref} from "../types/Ref";
    import TextAreaInput from "./TextAreaInput.vue";
    import {ActivityItem, toActivityItem} from "../services/service";
    import {getService} from "../services/init";
    import {DateTime} from "luxon";
    import {getRef} from "../services/mockrally";

    @Component({
        components: {TextAreaInput}
    })
    export default class AddComment extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        item!: Ref;

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
            const data = {'Text': this.text, 'Artifact': this.item._ref};

            let result;
            const service = getService();
            try {
                result = await service.createItem("conversationpost", data)
                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast({e});
                return;
            }

            // Fake out comment object with just the fields we need. We're doing this b/c after creating a comment
            // sometimes rally errors when we try to retrieve the comment we just created soon after (and it's faster)
            const user = store.getUser();
            const comment = {
                CreationDate: DateTime.local().toJSDate(),
                Text: data.Text,
                _ref: result._ref,
                User: getRef(user)
            };

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
        margin: 40px 0 10px 0;
        max-width: 1000px;
        position: relative;
    }

    .add-comment .md-field { padding-top: 0; }

    .comment-textarea {
        background: #FFF;
        padding: 10px 16px !important;
    }
</style>
