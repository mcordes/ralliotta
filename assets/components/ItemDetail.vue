<template>
    <div class="item-detail">
        <div v-if="isReady">
            <h2>{{ item.FormattedID }} - {{ item.Name }}</h2>

            <div class="item-summary">
                <div class="item-fields">Maybe fields go here?</div>
                <EditableTextArea v-bind:value="item.Description" v-bind:fieldName="'Description'" v-bind:itemRef="item._ref"/>
            </div>

            <hr style="margin: 50px 0;">

            <div v-for="activity in activityItems">
                <div v-if="activity.type === 'comment'">
                    <Comment v-bind:data="activity.data" v-bind:itemRef="item._ref"/>
                </div>
                <div v-else>
                    <Revision v-bind:data="activity.data"/>
                </div>
            </div>

            <div>
                <AddComment v-bind:itemRef="item._ref" v-bind:activityItems="activityItems"/>
            </div>

            <div>
                <h3 @click="toggleShowAllFields" title="toggle showing all fields">
                    <span v-if="showAllFields"> - </span>
                    <span v-else> + </span>
                    All fields</h3>
                <div v-if="showAllFields">
                    <div v-for="field in itemFields" v-bind:field="field">
                        <div class="field">{{ field }}</div>
                        <div class="value">{{ item[field] }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import store from "../store";
    import {
        ActivityItem,
        fetchComments, fetchRevisionHistory,
        fetchSingleItemByFormattedID3, getActivityForItem
    } from "../utils/rally-util";
    import Comment from "./Comment.vue";
    import EditableTextArea from "./EditableTextArea.vue";
    import Revision from "./Revision.vue";
    import AddComment from "./AddComment.vue";
    import {Artifact} from "../types/Artifact";

    async function fetchItem(formattedID: string) {
        return await fetchSingleItemByFormattedID3(formattedID);
    }

    @Component({
        components: {EditableTextArea, Comment, Revision, AddComment},
    })
    export default class ItemDetail extends Vue {
        item!: Artifact;
        itemFields: string[] = [];
        activityItems: ActivityItem[] = [];
        showAllFields = false;
        isReady = false;

        async created() {
            const formattedID = this.$route.params['formattedID'];

            this.item = await fetchItem(formattedID);
            if (!this.item) {
                // TODO-mrc: show 404 page? We didn't find it
                throw new Error("implement me");
            }
            this.isReady = true;

            this.activityItems = await getActivityForItem(this.item._ref, this.item.RevisionHistory);

            // TODO-mrc: fix me
            // this.itemFields = filterOutFieldsExcludedFromDisplay(Object.keys(this.item));
            this.itemFields = Object.keys(this.item);

        }

        toggleShowAllFields() {
            this.showAllFields = !this.showAllFields;
        }
    }

</script>

<style scoped>
    .value, .field {display: inline-block; padding: 10px }
    .item-summary { width: 100%; }
    .item-fields {
        background: #FFF;
        border-radius: 6px;
        border: 1px solid #e4e4e4;
        float: right;
        min-height: 500px; /* temporary for POC of layout */
        padding: 10px 20px;
        width: 20%;
    }
</style>



