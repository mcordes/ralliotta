<template>
    <div>
        <div class="item-list">
            <h2 v-if="heading">
                {{ heading }}
            </h2>

            <div class="sticky-element">
                <ExpandableSection v-bind:expanded="expandSearchFilters">
                    <template slot="header">
                        Search filters
                    </template>
                    <template slot="main">
                        <div class="search-filters">
                            <div class="filter-item">
                                <md-checkbox v-model="includeClosedItems">Include closed items</md-checkbox>
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
                                <RefSelectInput v-bind:itemType="'project'" v-bind:label="'Project'" v-bind:selectedRef.sync="project"/>
                            </div>

                            <div v-if="!showMyItemsOnly">
                                <div class="filter-item">
                                    <RefSelectInput v-bind:itemType="'user'" v-bind:label="'Assignee'"
                                                    v-bind:selectedRef.sync="assignee" v-bind:project="project"
                                                    v-bind:disabled="!project"/>
                                </div>
                            </div>

                            <div class="filter-item">
                                <RefSelectInput v-bind:itemType="'release'" v-bind:label="'Release'"
                                                v-bind:selectedRef.sync="release" v-bind:project="project"
                                                v-bind:disabled="!project"/>
                            </div>

                            <div class="filter-item">
                                <RefSelectInput v-bind:itemType="'iteration'" v-bind:label="'Iteration'"
                                                v-bind:selectedRef.sync="iteration" v-bind:project="project"
                                                v-bind:disabled="!project"/>
                            </div>

                        </div>
                    </template>
                </ExpandableSection>
            </div>

            <table class="items-table">
                <tr class="md-table-row">

                    <th v-if="backlogOnly" class="md-table-head">Actions</th>

                    <th class="md-table-head">ID</th>
                    <th class="md-table-head">Title</th>

                    <th v-if="showPlanEstimate">Estimate</th>

                    <th class="md-table-head">
                        <Sortable v-bind:field="'Owner'" v-model="sortOrder">Assignee</Sortable>
                    </th>
                    <th class="md-table-head">Reporter</th>
                    <th class="md-table-head">Status</th>

                    <th v-if="showProject" class="md-table-head">Project</th>

                    <th class="md-table-head">
                        <Sortable v-bind:field="'CreationDate'" v-model="sortOrder">Created</Sortable>
                    </th>
                    <th class="md-table-head">
                        <Sortable v-bind:field="'LastUpdateDate'" v-model="sortOrder">Updated</Sortable>
                    </th>
                </tr>

                <ItemSummary v-for="item in items" v-bind:item="item"
                             v-bind:showAddToIteration="backlogOnly"
                             v-bind:showProject="showProject"
                             v-bind:showPlanEstimate="showPlanEstimate"></ItemSummary>

            </table>


            <div v-if="isLoading">
                <LoadingMessage/>
            </div>

            <div v-if="hasNoResults">
                <div id="no-results">[ No results found ]</div>
            </div>


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
    import {
        getItemDetailURLPath,
        getItemSearchURLPath,
        isRef,
        queryUtils, RALLY_API_ROOT_URL,
        refUtils,
        showErrorToast
    } from "../utils/util";
    import Sortable from "./Sortable.vue";
    import {ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
    import ExpandableSection from "./ExpandableSection.vue";
    import SelectInput from "./SelectInput.vue";
    import {Ref} from "../types/Ref";
    import {debounce} from "underscore";
    import RefSelectInput from "./RefSelectInput.vue";
    import {getService} from "../services/init";
    import LoadingMessage from "./LoadingMessage.vue";

    @Component({
        components: {ExpandableSection, ItemSummary, SelectInput, Sortable, RefSelectInput, LoadingMessage},
    })
    export default class ItemList extends Vue {
        items: any[] = [];
        sharedState = store;
        hasMoreRecords = false;
        totalRecords = 0;
        isLoading = false;
        includeClosedItems = false;
        searchFormattedId = '';
        expandSearchFilters = true;
        sortOrder = 'LastUpdateDate DESC';
        searchText = '';
        project = '';
        assignee = '';
        release = '';
        iteration = '';
        hasInitializedSearchParams = false;
        hasNoResults = false;

        @Prop()
        showMyItemsOnly!: boolean;

        @Prop()
        backlogOnly!: boolean;

        @Prop()
        collapseSearchFilters!: boolean;

        @Prop()
        heading!: string;

        @Prop({default: false})
        showProject!: boolean;

        @Prop()
        initialProject!: string | Ref;

        @Prop({default: false})
        initialProjectNone!: boolean;

        @Prop({default: false})
        showPlanEstimate!: boolean;

        @Watch("$route")
        async onRouteChange(to: any, from: any) {
            this.items = [];
            this.hasMoreRecords = false;
            await this.fetchResults();
        }

        @Watch("includeClosedItems")
        @Watch("searchFormattedId")
        @Watch("sortOrder")
        @Watch("project")
        @Watch("assignee")
        @Watch("release")
        @Watch("iteration")
        @Watch("searchText")
        async onSearchFieldChanged() {
            if (this.hasInitializedSearchParams) {
                await this.fetchResults();
            }
        }

        async created() {
            this.setSearchFieldsFromRequestParams()
            this.hasInitializedSearchParams = true;

            // Call fetchResults at most once every 300ms
            this.fetchResults = debounce(this.fetchResults, 300);

            this.expandSearchFilters = !this.collapseSearchFilters;

            if (!this.project) {
                // @ts-ignore
                let project = isRef(this.initialProject) ? this.initialProject._ref : this.initialProject;
                if (!project && !this.initialProjectNone) {
                    const user = this.sharedState.getUser();
                    project = user.DefaultProject._ref;
                }

                // NOTE: this triggers the onSearchFieldChanged watch which triggers a fetch
                this.project = project;
            }
        }

        async showMore() {
            const startIndex = this.items.length + 1;
            try {
                await this.fetchResults(startIndex);
            }
            catch (e) {
                showErrorToast({e});
            }
        }

        setSearchFieldsFromRequestParams() {
            this.includeClosedItems = Boolean(this.$route.query.closed);
            this.searchFormattedId = "" + (this.$route.query.id ?? "");
            this.searchText = "" + (this.$route.query.text ?? "");

            const projectOid = this.$route.query.project;
            if (projectOid) {
                this.project = RALLY_API_ROOT_URL + "/project/" + projectOid;
            }

            const releaseOid = this.$route.query.release;
            if (releaseOid) {
                this.release = RALLY_API_ROOT_URL + "/release/" + releaseOid;
            }

            const iterationOid = this.$route.query.iteration;
            if (iterationOid) {
                this.iteration = RALLY_API_ROOT_URL + "/iteration/" + iterationOid;
            }

            const assigneeOid = this.$route.query.assignee;
            if (assigneeOid) {
                this.assignee = RALLY_API_ROOT_URL + "/user/" + assigneeOid;
            }
        }

        protected async fetchResults(startIndex = 1, pageSize = 20) {
            const queryParams: any = {};
            const user = this.sharedState.getUser();
            let query = queryUtils.where('Project', '!=', null);

            if (this.project) {
                query = query.and('Project', '=', this.project);
                queryParams.project = refUtils.getId(this.project);
            }

            if (this.showMyItemsOnly) {
                query = query.and('Owner', '=', user._ref);
            }

            if (this.includeClosedItems) {
                queryParams.closed = 1;
            }
            else {
                query = query.and('ScheduleState', '!=', 'Accepted');
                query = query.and('ScheduleState', '!=', 'Completed');
            }

            if (this.backlogOnly) {
                query = query.and('Iteration', '=', 'null');
            }

            if (this.searchFormattedId) {
                query = query.and('FormattedID', 'contains', this.searchFormattedId);
                queryParams.id = this.searchFormattedId;
            }

            if (this.searchText) {
                let subQuery = queryUtils.where('Name', 'contains', this.searchText)
                subQuery = subQuery.or('Description', 'contains', this.searchText);
                query = query.and(subQuery);
                queryParams.text = this.searchText;
            }

            if (this.release) {
                query = query.and('Release', '=', this.release);
                queryParams.release = refUtils.getId(this.release);
            }

            if (this.iteration) {
                query = query.and('Iteration', '=', this.iteration);
                queryParams.iteration = refUtils.getId(this.iteration);
            }

            if (this.assignee) {
                query = query.and('Owner', '=', this.assignee);
                queryParams.assignee = refUtils.getId(this.assignee);
            }

            // Update request parameters so the user can refresh the page and retain search parameters
            // it also opens up the possibility of bookmarking search criteria or sharing it between people. Hooray!
            window.history.replaceState({}, "", getItemSearchURLPath(this.$router.currentRoute.path, queryParams));

            // clear all results if we're showing the first page worth of data
            if (startIndex === 1) {
                this.items = [];
                this.hasMoreRecords = false;
                this.totalRecords = 0;
            }

            try {
                this.isLoading = true;

                const results = await getService().fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, {
                    query,
                    startIndex,
                    pageSize,
                    order: this.sortOrder,
                    kwargs: {
                        // NOTE: this operation errors on the rally site unless we 
                        // limit the results to just the types we care about
                        types: "hierarchicalRequirement,defect"
                    }
                });
                this.items.push(...results.items);
                this.hasMoreRecords = results.hasMoreResults;
                this.totalRecords = results.totalRecords;
                this.hasNoResults = this.totalRecords === 0;
            }
            catch(e) {
                showErrorToast({e});
            }
            finally {
                this.isLoading = false;
            }
        }
    }

</script>


<style scoped>
    #no-results {
        margin-top: 20px;
        text-align: center;
    }
</style>
