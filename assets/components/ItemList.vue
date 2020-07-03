<template>
    <div>
        <div class="item-list">
            <h2>
                {{ heading ? heading : "Search" }}
            </h2>

            <div>
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
                                <!-- TODO-mrc: make reusable SelectInput component for this. The only trick
                                   is how to get v-model to work in the component and still bubble the changes
                                   up to us. PropSync? This looks promising:
                                   https://stackoverflow.com/questions/47311936/v-model-and-child-components
                                   -->
                                <md-field>
                                    <label>Project</label>
                                    <md-select v-model="searchProject">
                                        <md-option value="">-- No value --</md-option>
                                        <md-option v-for="option in projectSelectOptions" v-bind:value="option.value">
                                            {{ option.label }}
                                        </md-option>
                                    </md-select>
                                </md-field>
                            </div>

                            <div class="filter-item">
                                <md-field>
                                    <label>Assignee</label>
                                    <md-select v-model="searchAssignee">
                                        <md-option value="">-- No value --</md-option>
                                        <md-option v-for="option in assigneeSelectOptions" v-bind:value="option.value">
                                            {{ option.label }}
                                        </md-option>
                                    </md-select>
                                </md-field>
                            </div>

                            <div class="filter-item">
                                <md-field>
                                    <label>Release</label>
                                    <md-select v-model="searchRelease">
                                        <md-option value="">-- No value --</md-option>
                                        <md-option v-for="option in releaseSelectOptions" v-bind:value="option.value">
                                            {{ option.label }}
                                        </md-option>
                                    </md-select>
                                </md-field>
                            </div>

                            <div class="filter-item">
                                <md-field>
                                    <label>Iteration</label>
                                    <md-select v-model="searchIteration">
                                        <md-option value="">-- No value --</md-option>
                                        <md-option v-for="option in iterationSelectOptions" v-bind:value="option.value">
                                            {{ option.label }}
                                        </md-option>
                                    </md-select>
                                </md-field>
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
    import Sortable from "./Sortable.vue";
    import {
        fetchListOfItems, getIterationList,
        getProjectList, getProjectTeamMembers, getReleaseList,
        getSelectOptionsFromRefs,
        queryUtils
    } from "../utils/rally-util";
    import {showErrorToast} from "../utils/util";
    import {ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import {SelectOption} from "../types/SelectOption";

    @Component({
        components: {ExpandableSection, ItemSummary, Sortable},
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
        searchProject = '';
        searchAssignee = '';
        searchRelease = '';
        searchIteration = '';
        projectSelectOptions: SelectOption[] = [];
        assigneeSelectOptions: SelectOption[] = [];
        releaseSelectOptions: SelectOption[] = [];
        iterationSelectOptions: SelectOption[] = [];

        @Prop()
        showMyItemsOnly!: boolean;

        @Prop()
        backlogOnly!: boolean;

        @Prop()
        heading!: string;

        @Watch("$route")
        async onRouteChange(to: any, from: any) {
            this.items = [];
            this.hasMoreRecords = false;
            await this.fetchResults();
        }

        // TODO-mrc: is there a better way to watch these? combined maybe?
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

        @Watch("searchProject")
        async onSearchProject() {
            await this.updateProjectSelectOptions();
            await this.fetchResults();
        }

        @Watch("searchAssignee")
        async onSearchAssignee() {
            await this.fetchResults();
        }

        @Watch("searchRelease")
        async onSearchRelease() {
            await this.fetchResults();
        }

        @Watch("searchIteration")
        async onSearchIteration() {
            await this.fetchResults();
        }

        @Watch("searchText")
        async onSearchTextChanged() {
            await this.fetchResults();
        }

        async created() {
            this.expandSearchFilters = !this.backlogOnly;

            // TODO-mrc: default to all projects on the my work page?
            // Default project list to the user's default project
            const user = this.sharedState.getUser();
            const projectRef = user.DefaultProject;

            // TODO-mrc: this triggers the onSearchProject watch. weird.
            this.searchProject = projectRef._ref;

            // Fetch is already run in the onSearchProject watch. Fix me
            // await this.fetchResults();
            // await this.updateProjectSelectOptions();

            this.projectSelectOptions = await getSelectOptionsFromRefs(await getProjectList());
        }

        async updateProjectSelectOptions() {
            const user = this.sharedState.getUser();
            this.assigneeSelectOptions = await getSelectOptionsFromRefs(await getProjectTeamMembers(this.searchProject, user));
            this.releaseSelectOptions = await getSelectOptionsFromRefs(await getReleaseList(this.searchProject));
            this.iterationSelectOptions = await getSelectOptionsFromRefs(await getIterationList(this.searchProject));
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
            let query = queryUtils.where('Project', '=', this.searchProject);

            if (this.showMyItemsOnly) {
                query = query.and('Owner', '=', user._ref);
            }

            if (this.showOpenItemsOnly) {
                // TODO-mrc: include Completed too? Probably make what defines an open ticket configurable
                query = query.and('ScheduleState', '!=', 'Accepted');
            }

            if (this.backlogOnly) {
                // TODO-mrc: this doesn't work. Fix me.
                // TODO-mrc: I also tried "null", and "". What's next?
                // query = queryUtils.where('Iteration', '=', 'null');
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

            if (this.searchRelease) {
                query = query.and('Release', '=', this.searchRelease);
            }

            if (this.searchIteration) {
                query = query.and('Iteration', '=', this.searchIteration);
            }

            if (this.searchAssignee) {
                query = query.and('Owner', '=', this.searchAssignee);
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
    };

</script>


<style scoped>
</style>
