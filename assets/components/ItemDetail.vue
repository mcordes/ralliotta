<template>
    <div class="item-detail">
        <div v-if="isReady">
            <h2>
                <span class="item-id-header">{{ item.FormattedID }} -</span>
                <EditableText fieldName="Name" v-bind:initialValue="item.Name" v-bind:item="item"/>
            </h2>

            <div class="item-summary-wrapper">
                <div class="item-description">
                    <EditableTextArea v-bind:initialValue="item.Description" v-bind:fieldName="'Description'" v-bind:item="item"/>
                </div>

                <div class="item-fields">
                    <div>
                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Owner'" v-bind:initialValue="item.Owner"
                                            v-bind:item="item" v-bind:searchFunc="searchAssigneeList"/>
                        </div>

                        <div class="item-field">
                            Created: <TimeSinceDate v-bind:date="item.CreationDate"/>
                        </div>
                        <div class="item-field">
                            Last Updated: <TimeSinceDate v-bind:date="item.LastUpdateDate"/>
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Iteration'" v-bind:initialValue="item.Iteration"
                                            v-bind:item="item" v-bind:searchFunc="searchIterationList"/>
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Release'" v-bind:initialValue="item.Release"
                                            v-bind:item="item" v-bind:searchFunc="searchReleaseList"/>
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
                            Project: {{ item.Project._refObjectName }}
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'FlowState'" v-bind:initialValue="item.FlowState"
                                            v-bind:item="item" v-bind:searchFunc="searchFlowStateList" v-bind:noBlankOption="true"/>
                        </div>

                        <div class="item-field">
                            <a :href="rallyUIDetailURL" title="Open this item in Rally in a new window." target="_blank">View in Rally UI</a>
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
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import {
        fetchSingleItemByFormattedID,
        getSelectOptionsFromRefs,
        searchFlowStates,
        searchIterations,
        searchProjectTeamMembers,
        searchReleases,
        refUtils
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
    import TimeSinceDate from "./TimeSinceDate.vue";
    import store from "../store";
    import {showErrorToast} from "../utils/util";
    import {NotFoundError} from "../exceptions";

    @Component({
        components: {
            TimeSinceDate, EditableText, EditableTextArea, Comment: CommentInfo, Revision: RevisionInfo, AddComment,
            ExpandableSection, AttachmentSummary, EditableSelect},
    })
    export default class ItemDetail extends Vue {
        item!: Artifact;
        itemFields: string[] = [];
        activityItems: ActivityItem[] = [];
        isReady = false;
        rallyUIDetailURL = "";

        @Prop()
        formattedID!: string;

        async created() {
            if (!this.formattedID) {
                // TODO-mrc: fix warning
                this.formattedID = this.$route.params['formattedID'];
            }
            await this.loadItem();
        }

        async loadItem() {
            this.item = await fetchSingleItemByFormattedID(this.formattedID);
            if (!this.item) {
                throw new NotFoundError(`Unable to find item with id: ${this.formattedID}`);
            }

            // Show item right away when it's ready, then do the other async calls
            this.isReady = true;

            try{
                this.activityItems = await getActivityForItem(this.item);
            }
            catch (e) {
                showErrorToast({e});
            }

            this.itemFields = Object.keys(this.item);

            const projectId = refUtils.getId(this.item.Project);
            const itemObjectId = refUtils.getId(this.item);
            const itemType = refUtils.getType(this.item);

            // Link to this item in the official Rally UI
            this.rallyUIDetailURL = `https://rally1.rallydev.com/#/${projectId}/detail/${itemType}/${itemObjectId}`;
        }

        async searchReleaseList(search: string) {
            return await getSelectOptionsFromRefs(await searchReleases(this.item.Project, search));
        }

        async searchAssigneeList(search: string) {
            const user = store.getUser();
            return await getSelectOptionsFromRefs(await searchProjectTeamMembers(this.item.Project, search, user));
        }

        async searchIterationList(search: string) {
            return await getSelectOptionsFromRefs(await searchIterations(this.item.Project, search));
        }

        async searchFlowStateList(search: string) {
            return await getSelectOptionsFromRefs(await searchFlowStates(this.item.Project, search));
        }

        // TODO-mrc: also exists in itemlist. Fixme.
        getValueFromLabelAndValue(s: string | undefined) {
            if (!s) {
                return "";
            }
            return s.split("|").slice(-1)[0];
        }
    }

</script>

<style lang="css" scoped>
    .value, .field { display: inline-block; padding: 10px; }
</style>
