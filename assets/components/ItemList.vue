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
                                <SelectInput v-bind:searchFunc="searchProjectList" v-bind:label="'Project'" v-bind:selectedValue.sync="project" v-bind:selectedLabel.sync="projectLabel"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchAssigneeList" v-bind:label="'Assignee'" v-bind:selectedValue.sync="assignee"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchReleaseList" v-bind:label="'Release'" v-bind:selectedValue.sync="release"/>
                            </div>

                            <div class="filter-item">
                                <SelectInput v-bind:searchFunc="searchIterationList" v-bind:label="'Iteration'" v-bind:selectedValue.sync="iteration"/>
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
        project = '';
        projectLabel = '';
        assignee = '';
        release = '';
        iteration = '';

        @Prop()
        showMyItemsOnly!: boolean;

        @Prop()
        backlogOnly!: boolean;

        @Prop()
        heading!: string;

        @Prop()
        initialProject!: Ref;

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

        @Watch("project")
        async onSearchProject() {
            await this.fetchResults();
        }

        @Watch("assignee")
        async onSearchAssignee() {
            await this.fetchResults();
        }

        @Watch("release")
        async onSearchRelease() {
            await this.fetchResults();
        }

        @Watch("iteration")
        async onSearchIteration() {
            await this.fetchResults();
        }

        @Watch("searchText")
        async onSearchTextChanged() {
            await this.fetchResults();
        }

        async created() {
            this.expandSearchFilters = !this.backlogOnly;

            let projectRef = this.initialProject;
            if (!this.initialProject) {
                const user = this.sharedState.getUser();
                projectRef = user.DefaultProject;
            }

            // NOTE: this triggers the onSearchProject watch which triggers a fetch
            this.project = projectRef._ref;
            this.projectLabel = projectRef._refObjectName;
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
            let query = queryUtils.where('Project', '!=', null);

            if (this.project) {
                query = queryUtils.where('Project', '=', this.project);
            }

            if (this.showMyItemsOnly) {
                query = query.and('Owner', '=', user._ref);
            }

            if (this.showOpenItemsOnly) {
                query = query.and('ScheduleState', '!=', 'Accepted');
            }

            if (this.backlogOnly) {
                query = queryUtils.where('Iteration', '=', 'null');
            }

            if (this.searchFormattedId) {
                query = query.and('FormattedID', 'contains', this.searchFormattedId);
            }

            if (this.searchText) {
                let subQuery = queryUtils.where('Name', 'contains', this.searchText)
                subQuery = subQuery.or('Description', 'contains', this.searchText);
                query = query.and(subQuery);
            }

            if (this.release) {
                query = query.and('Release', '=', this.release);
            }

            if (this.iteration) {
                query = query.and('Iteration', '=', this.iteration);
            }

            if (this.assignee) {
                query = query.and('Owner', '=', this.assignee);
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
            return await getSelectOptionsFromRefs(await searchReleases(this.project, search));
        }

        async searchAssigneeList(search: string) {
            const user = store.getUser();
            return await getSelectOptionsFromRefs(await searchProjectTeamMembers(this.project, search, user));
        }

        async searchIterationList(search: string) {
            return await getSelectOptionsFromRefs(await searchIterations(this.project, search));
        }
    };

</script>


<style scoped>
</style>
