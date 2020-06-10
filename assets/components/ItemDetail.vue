<template>
    <div class="item-detail">
        <div v-if="isReady">
            <h2>
                <span class="item-id-header">{{ item.FormattedID }} -</span>
                <EditableText fieldName="Name" v-bind:value="item.Name" v-bind:item="item"/>
            </h2>

            <div class="item-summary-wrapper">
                <div class="item-description">
                    <EditableTextArea v-bind:value="item.Description" v-bind:fieldName="'Description'" v-bind:item="item"/>
                </div>

                <div class="item-fields">
                    <div>
                        <!-- Make this editable
                            try to cache users or just do a real time search?
                        -->
                        <div class="item-field">
                            Assignee:
                            <div v-if="item.Owner != null">
                                <div class="avatar-wrapper">
                                    <Avatar v-bind:user="item.Owner" v-bind:size="30"/>
                                </div>
                                {{ item.Owner._refObjectName }}
                            </div>

                        </div>

                        <div class="item-field">
                            Created: <TimeSinceDate v-bind:date="item.CreationDate"/>
                        </div>
                        <div class="item-field">
                            Last Updated: <TimeSinceDate v-bind:date="item.LastUpdateDate"/>
                        </div>

                        <!-- TODO-mrc: link to search page with this project selected -->
                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Iteration'" v-bind:value="item.Iteration._ref"
                                            v-bind:item="item" v-bind:options="iterationOptions" v-if="iterationOptions.length > 0"/>
                        </div>

                        <!-- TODO-mrc: editable -->
                        <!-- TODO-mrc: link to search page with this project selected -->
                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Release'" v-bind:value="item.Release._ref"
                                            v-bind:item="item" v-bind:options="releaseOptions" v-if="releaseOptions.length > 0"/>
                        </div>

                        <div class="item-field">
                            AcceptedDate: <TimeSinceDate v-bind:date="item.AcceptedDate"/>
                        </div>
                        <div class="item-field">
                            BlockedReason: {{ item.BlockedReason }}
                        </div>
                        <div class="item-field">
                            PlanEstimate: {{ item.PlanEstimate }}
                        </div>

                        <div class="item-field">
                            Tasks: {{ item.Tasks.Count }}
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'ScheduleState'" v-bind:value="item.ScheduleState"
                                            v-bind:item="item" v-bind:options="scheduleStateOptions" v-if="scheduleStateOptions.length > 0"/>
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'FlowState'" v-bind:value="item.FlowState._ref"
                                            v-bind:item="item" v-bind:options="flowStateOptions" v-if="flowStateOptions.length > 0"/>
                        </div>
                    </div> <!-- end `item-fields` wrapper -->
                </div>
            </div>

            <hr style="margin: 50px 0;">

            <div class="activity-wrapper">
                <div v-for="activity in activityItems">
                    <div v-if="activity.type === 'comment'">
                        <Comment v-bind:activity="activity" v-bind:item="item"/>
                    </div>
                    <div v-if="activity.type === 'revision'">
                        <Revision v-bind:activity="activity"/>
                    </div>
                    <div v-if="activity.type === 'attachment'">
                        <AttachmentSummary v-bind:activity="activity"/>
                    </div>
                </div>

                <div>
                    <AddComment v-bind:item="item" v-bind:activityItems="activityItems"/>
                </div>
            </div>

            <hr style="margin: 50px 0;">

            <div class="activity-wrapper">
                <ExpandableSection title="toggle showing all fields">
                    <template v-slot:header>
                        <div class="revision-header">
                            <div class="revision-date">
                                <h3>All fields</h3>
                            </div>
                        </div>
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
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {
        fetchSingleItemByFormattedID3,
        getFlowStateList, getIterationList,
        getProjectList, getReleaseList,
        getSelectOptionsFromRefs
    } from "../utils/rally-util";
    import CommentInfo from "./CommentInfo.vue";
    import EditableTextArea from "./EditableTextArea.vue";
    import RevisionInfo from "./RevisionInfo.vue";
    import AddComment from "./AddComment.vue";
    import {Artifact} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import {ActivityItem, getActivityForItem} from "../utils/activity-util";
    import AttachmentSummary from "./AttachmentSummary.vue";
    import EditableText from "./EditableText.vue";
    import EditableSelect from "./EditableSelect.vue";
    import {SelectOption} from "../types/SelectOption";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import Avatar from "./Avatar.vue";
    import store from "../store";

    async function fetchItem(formattedID: string) {
        return await fetchSingleItemByFormattedID3(formattedID);
    }

    @Component({
        components: {
            TimeSinceDate, EditableText, EditableTextArea, Comment: CommentInfo, Revision: RevisionInfo, AddComment,
            ExpandableSection, AttachmentSummary, EditableSelect, Avatar},
    })
    export default class ItemDetail extends Vue {
        item!: Artifact;
        itemFields: string[] = [];
        activityItems: ActivityItem[] = [];
        isReady = false;
        scheduleStateOptions: SelectOption[] = [];
        flowStateOptions: SelectOption[] = [];
        iterationOptions: SelectOption[] = [];
        releaseOptions: SelectOption[] = [];


        async created() {
            const formattedID = this.$route.params['formattedID'];

            this.item = await fetchItem(formattedID);
            if (!this.item) {
                // TODO-mrc: show 404 page? We didn't find it
                throw new Error("implement me");
            }
            this.isReady = true;

            this.scheduleStateOptions = ["Defined", "In-Progress", "Completed", "Accepted"].map(v => {return {value: v}});

            const user = store.getUser();
            const projectRef = user.DefaultProject;

            this.flowStateOptions = await getSelectOptionsFromRefs(await getFlowStateList(projectRef));
            this.iterationOptions = await getSelectOptionsFromRefs(await getIterationList(projectRef));
            this.releaseOptions = await getSelectOptionsFromRefs(await getReleaseList(projectRef));

            this.activityItems = await getActivityForItem(this.item);

            this.itemFields = Object.keys(this.item);

        }
    }

</script>

<style lang="css" scoped>
    .value, .field { display: inline-block; padding: 10px; }
</style>
