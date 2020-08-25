<template>
    <div class="item-detail">

        <div v-if="!isReady">
            <LoadingMessage/>
        </div>

        <div v-if="isReady">
            <h2>
                <span class="item-id-header">{{ item.FormattedID }} -</span>
                <EditableText fieldName="Name" v-bind:initialValue="item.Name" v-bind:item="item"
                    v-bind:onChange="this.itemChanged"/>
            </h2>

            <div class="item-summary-wrapper">
                <div class="item-description">
                    <EditableTextArea v-bind:initialValue="item.Description" v-bind:fieldName="'Description'"
                                      v-bind:item="item" v-bind:onChange="this.itemChanged"/>
                </div>

                <div class="item-fields">
                    <div>
                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Owner'" v-bind:initialValue="item.Owner"
                                            v-bind:item="item" v-bind:searchFunc="searchAssigneeList"
                                            v-bind:onChange="this.itemChangedAndReloadActivities"/>
                        </div>

                        <div class="item-field">
                            Created: <TimeSinceDate v-bind:date="item.CreationDate"/>
                        </div>
                        <div class="item-field">
                            Updated: <TimeSinceDate v-bind:date="item.LastUpdateDate"/>
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Iteration'" v-bind:initialValue="item.Iteration"
                                            v-bind:item="item" v-bind:searchFunc="searchIterationList"
                                            v-bind:onChange="this.itemChangedAndReloadActivities"/>
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'Release'" v-bind:initialValue="item.Release"
                                            v-bind:item="item" v-bind:searchFunc="searchReleaseList"
                                            v-bind:onChange="this.itemChangedAndReloadActivities"/>
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
                            Tasks: {{ item.Tasks ? item.Tasks.Count : "0" }}
                        </div>

                        <div class="item-field">
                            Project: {{ item.Project._refObjectName }}
                        </div>

                        <div class="item-field">
                            <EditableSelect v-bind:fieldName="'FlowState'" v-bind:initialValue="item.FlowState"
                                            v-bind:item="item" v-bind:searchFunc="searchFlowStateList"
                                            v-bind:noBlankOption="true"
                                            v-bind:onChange="this.itemChangedAndReloadActivities"/>
                        </div>

                        <div class="item-field" v-if="isLiveService">
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
    import {Component, Prop, PropSync, Vue, Watch} from 'vue-property-decorator';
    import CommentInfo from "./CommentInfo.vue";
    import EditableTextArea from "./EditableTextArea.vue";
    import RevisionInfo from "./RevisionInfo.vue";
    import AddComment from "./AddComment.vue";
    import {Artifact} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import AttachmentSummary from "./AttachmentSummary.vue";
    import EditableText from "./EditableText.vue";
    import EditableSelect from "./EditableSelect.vue";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import store from "../store";
    import {getSelectOptionsFromRefs, isRef, refUtils, showErrorToast} from "../utils/util";
    import {NotFoundError} from "../exceptions";
    import {ActivityItem} from "../services/service";
    import {getService} from "../services/init";
    import {config} from "../config";
    import {debounce} from "underscore";
    import LoadingMessage from "./LoadingMessage.vue";

    @Component({
        components: {
            TimeSinceDate, EditableText, EditableTextArea, Comment: CommentInfo, Revision: RevisionInfo, AddComment,
            ExpandableSection, AttachmentSummary, EditableSelect, LoadingMessage},
    })
    export default class ItemDetail extends Vue {
        item!: Artifact;
        itemFields: string[] = [];
        activityItems: ActivityItem[] = [];
        isReady = false;
        rallyUIDetailURL = "";
        isLiveService = !config.useMockRallyAPI;
        _formattedID = "";

        @Prop()
        formattedID!: string;

        async created() {
            if (!this._formattedID) {
                this._formattedID = this.formattedID || this.$route.params['formattedID'];
            }
            await this.loadItem();
            await this.loadActivityItems();

            // Call the loadActivityItems fn at most once every 2 seconds
            this.loadActivityItems = debounce(this.loadActivityItems, 2000);
        }

        async loadActivityItems() {
            console.log("Loading activity items");
            try{
                this.activityItems = await getService().getActivityForItem(this.item);
            }
            catch (e) {
                showErrorToast({e});
            }
        }

        async loadItem() {
            this.item = await getService().fetchSingleItemByFormattedID(this._formattedID);
            if (!this.item) {
                throw new NotFoundError(`Unable to find item with id: ${this._formattedID}`);
            }

            // Show item right away when it's ready, then do the other async calls
            this.isReady = true;

            // Make a list of 'interesting' fields to show the user
            this.itemFields = Object.keys(this.item).filter((k: string) => {
                const value: any = (this.item as any)[k];
                return !(k.startsWith("_") || isRef(value));
            });

            const projectId = refUtils.getId(this.item.Project);
            const itemObjectId = refUtils.getId(this.item);
            const itemType = refUtils.getType(this.item);

            // Link to this item in the official Rally UI
            this.rallyUIDetailURL = `https://rally1.rallydev.com/#/${projectId}/detail/${itemType}/${itemObjectId}`;
        }

        async itemChanged() {
            console.log("XXX item changed");
            this.$root.$emit("itemChanged", this.item._ref);
        }

        async itemChangedAndReloadActivities() {
            await this.loadActivityItems();
            await this.itemChanged();
        }

        async searchReleaseList(search: string) {
            return await getSelectOptionsFromRefs(await getService().searchReleases(this.item.Project, search));
        }

        async searchAssigneeList(search: string) {
            return await getSelectOptionsFromRefs(await getService().searchProjectTeamMembers(this.item.Project, search));
        }

        async searchIterationList(search: string) {
            return await getSelectOptionsFromRefs(await getService().searchIterations(this.item.Project, search));
        }

        async searchFlowStateList(search: string) {
            return await getSelectOptionsFromRefs(await getService().searchFlowStates(this.item.Project, search));
        }
    }

</script>

<style lang="css" scoped>
    .value, .field { display: inline-block; padding: 10px; }
    .field {
        font-weight: bold;
        width: 210px;
        margin-left: 20px;
    }
</style>
