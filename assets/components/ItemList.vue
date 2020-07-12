<template>
    <div>
        <div class="item-list">
            <h2>
                {{ heading ? heading : "Search" }}
            </h2>

            <div class="sticky-element">
                <ExpandableSection v-bind:expanded="expandSearchFilters">
                    <template slot="header">
                        Search filters
                    </template>
                    <template slot="main">
                        <div class="search-filters">
                            <div class="filter-item">
                                <md-checkbox v-model="showOpenItemsOnly">Only open items</md-checkbox>
                            </div>

                            <div class="filter-item">
                                <md-field>
                                    <label>Search by ID:</label>
                                    <md-input v-model="searchFormattedId"/>
                                </md-field>
                            </div>

                            <div class="filter-item">
                                <md-field>
                                    <label>Text search</label>
                                    <md-input v-model="searchText"/>
                                </md-field>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchProjectList" v-bind:label="'Project'" v-model="projectLabelAndValue"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchAssigneeList" v-bind:label="'Assignee'" v-model="assigneeLabelAndValue"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchReleaseList" v-bind:label="'Release'" v-model="releaseLabelAndValue"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchIterationList" v-bind:label="'Iteration'" v-model="iterationLabelAndValue"/>
                            </div>

                        </div>
                    </template>
                </ExpandableSection>
            </div>

            <table class="items-table">
                <tr class="md-table-row">
                    <th class="md-table-head">ID</th>
                    <th class="md-table-head">Title</th>
                    <th class="md-table-head">
                        <Sortable v-bind:field="'Owner'" v-model="sortOrder">Assignee</Sortable>
                    </th>
                    <th class="md-table-head">Reporter</th>
                    <th class="md-table-head">Status</th>
                    <th class="md-table-head">
                        <Sortable v-bind:field="'CreationDate'" v-model="sortOrder">Created</Sortable>
                    </th>
                    <th class="md-table-head">
                        <Sortable v-bind:field="'LastUpdateDate'" v-model="sortOrder">Last Updated</Sortable>
                    </th>
                </tr>

                <ItemSummary v-for="item in items" v-bind:item="item"></ItemSummary>
            </table>

            <div v-if="hasMoreRecords" style="text-align: center;">
                <md-button class="md-primary md-raised" @click="showMore" :disabled="isLoading">Show more</md-button>
            </div>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import store from "../store";
    import ItemSummary from "./ItemSummary.vue";
    import {showErrorToast} from "../utils/util";
    import Sortable from "./Sortable.vue";
    import {
        fetchListOfItems,
        getSelectOptionsFromRefs,
        queryUtils, searchIterations, searchProjects, searchProjectTeamMembers, searchReleases
    } from "../utils/rally-util";
    import {ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import {SelectOption} from "../types/SelectOption";
    import SelectInput from "./SelectInput.vue";
    import {Ref} from "../types/Ref";

    @Component({
        components: {ExpandableSection, ItemSummary, SelectInput, Sortable},
    })
    export default class ItemList extends Vue {
        items: any[] = [];
        sharedState = store;
        hasMoreRecords = false;
        totalRecords = 0;
        isLoading = false;
        showOpenItemsOnly = true;
        searchFormattedId = '';
        expandSearchFilters = true;
        sortOrder = 'LastUpdateDate DESC';
        searchText = '';
        projectLabelAndValue = '';
        assigneeLabelAndValue = '';
        releaseLabelAndValue = '';
        iterationLabelAndValue = '';

        @Prop()
        showMyItemsOnly!: boolean;

        @Prop()
        backlogOnly!: boolean;

        @Prop()
        heading!: string;

        // TODO-mrc
        @Prop()
        project!: Ref | string;

        @Watch("$route")
        async onRouteChange(to: any, from: any) {
            this.items = [];
            this.hasMoreRecords = false;
            await this.fetchResults();
        }

        @Watch("showOpenItemsOnly")
        async onShowOpenItemsOnlyChanged() {
            await this.fetchResults();
        }

        @Watch("searchFormattedId")
        async onSearchFormattedIdChanged() {
            await this.fetchResults();
        }

        @Watch("sortOrder")
        async onSortOrderChanged() {
            console.log("Sort order changed!");
            await this.fetchResults();
        }

        @Watch("projectLabelAndValue")
        async onSearchProject() {
            // TODO-mrc: hack, this is a bit of a mess
            // TODO-mrc: we won't want the label and value when it's on its way back from SelectInput
            // TODO-mrc: this fields is also used for the search query. Learn more about .sync and v-model and
            // figure out to just get the value back from SelectInput and remove this dumb crap
            if (!this.projectLabelAndValue || this.projectLabelAndValue.indexOf('|') != -1) {
                await this.fetchResults();
            }
        }

        @Watch("assigneeLabelAndValue")
        async onSearchAssignee() {
            // TODO-mrc: same issue as above
            if (!this.assigneeLabelAndValue || this.assigneeLabelAndValue.indexOf('|') != -1) {
                await this.fetchResults();
            }
        }

        @Watch("releaseLabelAndValue")
        async onSearchRelease() {
            // TODO-mrc: same issue as above
            if (!this.releaseLabelAndValue || this.releaseLabelAndValue.indexOf('|') != -1) {
                await this.fetchResults();
            }
        }

        @Watch("iterationLabelAndValue")
        async onSearchIteration() {
            // TODO-mrc: same issue as above
            if (!this.iterationLabelAndValue || this.iterationLabelAndValue.indexOf('|') != -1) {
                await this.fetchResults();
            }
        }

        @Watch("searchText")
        async onSearchTextChanged() {
            await this.fetchResults();
        }

        async created() {
            this.expandSearchFilters = !this.backlogOnly;

            // TODO-mrc: default to all projects on the my work page?
            // Default project list to the user's default project

            // TODO-mrc: default to this.project if set
            // TODO-mrc: we need both the code and the name, maybe it really needs to be a Ref object and never a string?
            const user = this.sharedState.getUser();
            const projectRef = user.DefaultProject;

            // NOTE: this triggers the onSearchProject watch which triggers a fetch
            this.projectLabelAndValue = projectRef._refObjectName + "|" + projectRef._ref;
        }

        async showMore() {
            this.isLoading = true;
            const startIndex = this.items.length;
            try {
                await this.fetchResults(startIndex);
            }
            catch (e) {
                showErrorToast({e});
            }
            this.isLoading = false;
        }

        protected async fetchResults(startIndex = 1, pageSize = 20) {
            const user = this.sharedState.getUser();
            // TODO-mrc: is there no other way to create a query that will match anything?
            let query = queryUtils.where('Project', '!=', null);


            if (this.projectLabelAndValue) {
                query = queryUtils.where('Project', '=', this.getValueFromLabelAndValue(this.projectLabelAndValue));
            }

            if (this.showMyItemsOnly) {
                query = query.and('Owner', '=', user._ref);
            }

            if (this.showOpenItemsOnly) {
                // TODO-mrc: include Completed too? Probably make what defines an open ticket configurable
                query = query.and('ScheduleState', '!=', 'Accepted');
            }

            if (this.backlogOnly) {
                query = queryUtils.where('Iteration', '=', 'null');
            }

            if (this.searchFormattedId) {
                query = query.and('FormattedID', 'contains', this.searchFormattedId);
            }

            if (this.searchText) {
                // TOOD-mrc: paranthesis are sure to be wrong here
                // TODO-mrc: the plan is to match text in either of these
                query = query.and('Name', 'contains', this.searchText);

                // TODO-mrc:
                // query = query.or('Description', 'contains', this.searchText);
            }

            if (this.releaseLabelAndValue) {
                query = query.and('Release', '=', this.getValueFromLabelAndValue(this.releaseLabelAndValue));
            }

            if (this.iterationLabelAndValue) {
                query = query.and('Iteration', '=', this.getValueFromLabelAndValue(this.iterationLabelAndValue));
            }

            if (this.assigneeLabelAndValue) {
                query = query.and('Owner', '=', this.getValueFromLabelAndValue(this.assigneeLabelAndValue));
            }

            // clear all results if we're showing the first page worth of data
            if (startIndex === 1) {
                this.items = [];
                this.hasMoreRecords = false;
                this.totalRecords = 0;
            }

            try {
                const results = await fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, {
                    query,
                    startIndex,
                    pageSize,
                    order: this.sortOrder,
                    kwargs: {
                        // TODO-mrc: document me (and use this elsewhere?)
                        types: "hierarchicalRequirement,defect"
                    }
                });
                this.items.push(...results.items);
                this.hasMoreRecords = results.hasMoreResults;
                this.totalRecords = results.totalRecords;
            }
            catch(e) {
                showErrorToast({e});
            }
        }

        async searchProjectList(search: string) {
            return await getSelectOptionsFromRefs(await searchProjects(search));
        }

        async searchReleaseList(search: string) {
            const projectValue = this.getValueFromLabelAndValue(this.projectLabelAndValue);
            return await getSelectOptionsFromRefs(await searchReleases(projectValue, search));
        }

        async searchAssigneeList(search: string) {
            const projectValue = this.getValueFromLabelAndValue(this.projectLabelAndValue);
            const user = store.getUser();
            return await getSelectOptionsFromRefs(await searchProjectTeamMembers(projectValue, search, user));
        }

        async searchIterationList(search: string) {
            const projectValue = this.getValueFromLabelAndValue(this.projectLabelAndValue);
            return await getSelectOptionsFromRefs(await searchIterations(projectValue, search));
        }

        getValueFromLabelAndValue(s: string | undefined) {
            if (!s) {
                return "";
            }
            return s.split("|").slice(-1)[0];
        }

    };

</script>


<style scoped>
</style>
