<template>
    <div class="item-detail">
        <div v-if="isReady">
            <h2>{{ item.FormattedID }} -
                <EditableText fieldName="Name" v-bind:value="item.Name" v-bind:itemRef="item._ref"/>
            </h2>

            <div class="item-summary">
                <div class="item-fields">
                    <div>
                        <EditableSelect v-bind:fieldName="'ScheduleState'" v-bind:value="item.ScheduleState"
                                        v-bind:itemRef="item._ref" v-bind:options="scheduleStateOptions"/>
                    </div>
                    <div>
                        <EditableSelect v-bind:fieldName="'FlowState'" v-bind:value="item.FlowState._ref"
                                        v-bind:itemRef="item._ref" v-bind:options="flowStateOptions"/>
                    </div>

                </div>

                <EditableTextArea v-bind:value="item.Description" v-bind:fieldName="'Description'" v-bind:itemRef="item._ref"/>
            </div>

            <hr style="margin: 50px 0;">

            <div v-for="activity in activityItems">
                <div v-if="activity.type === 'comment'">
                    <Comment v-bind:data="activity.data" v-bind:itemRef="item._ref"/>
                </div>
                <div v-if="activity.type === 'revision'">
                    <Revision v-bind:data="activity.data"/>
                </div>
                <div v-if="activity.type === 'attachment'">
                    <AttachmentSummary v-bind:data="activity.data"/>
                </div>
            </div>

            <div>
                <AddComment v-bind:itemRef="item._ref" v-bind:activityItems="activityItems"/>
            </div>

            <ExpandableSection title="toggle showing all fields">
                <template v-slot:header>
                    <h3>All fields</h3>
                </template>
                <template v-slot:main>
                    <div>
                        <div v-for="field in itemFields" v-bind:field="field">
                            <div class="field">{{ field }}</div>
                            <div class="value">{{ item[field] }}</div>
                        </div>
                    </div>
                </template>
            </ExpandableSection>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {fetchSingleItemByFormattedID3, getFlowStateOptions} from "../utils/rally-util";
    import Comment from "./Comment.vue";
    import EditableTextArea from "./EditableTextArea.vue";
    import Revision from "./Revision.vue";
    import AddComment from "./AddComment.vue";
    import {Artifact} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import {ActivityItem, getActivityForItem} from "../utils/activity-util";
    import AttachmentSummary from "./AttachmentSummary.vue";
    import EditableText from "./EditableText.vue";
    import EditableSelect from "./EditableSelect.vue";
    import {SelectOption} from "../types/SelectOption";

    async function fetchItem(formattedID: string) {
        return await fetchSingleItemByFormattedID3(formattedID);
    }

    @Component({
        components: {EditableText, EditableTextArea, Comment, Revision, AddComment, ExpandableSection,
            AttachmentSummary, EditableSelect},
    })
    export default class ItemDetail extends Vue {
        item!: Artifact;
        itemFields: string[] = [];
        activityItems: ActivityItem[] = [];
        isReady = false;
        scheduleStateOptions!: SelectOption[];
        flowStateOptions!: SelectOption[];


        async created() {
            const formattedID = this.$route.params['formattedID'];

            this.item = await fetchItem(formattedID);
            if (!this.item) {
                // TODO-mrc: show 404 page? We didn't find it
                throw new Error("implement me");
            }

            this.scheduleStateOptions = ["Defined", "In-Progress", "Completed", "Accepted"].map(v => {return {value: v}});

            // TODO-mrc: probably just cache these
            this.flowStateOptions = await getFlowStateOptions();

            this.isReady = true;

            this.activityItems = await getActivityForItem(this.item);

            this.itemFields = Object.keys(this.item);

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



