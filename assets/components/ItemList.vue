<template>
    <div>
        <div class="item-list">
            <h2>
                {{ heading ? heading : "Search" }}
            </h2>

            <div>
                <ExpandableSection v-bind:expanded="expandSearchFilters">
                    <template slot="header">
                        [Search filters]
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
                                TODO: More fields
                            </div>
                        </div>
                    </template>
                </ExpandableSection>
            </div>

            <ul style="display:none;">
                <li>TODO: filter by schedule state / flow state?</li>
                <li>TODO: assigned to me / user</li>
                <li>TODO: search title / body? for some text</li>
                <li>TODO-Caleb: Make this as simple as possible (for now it's just more visually appealing)</li>
                <li>TODO: project (defaulted to default project)</li>
                <li>TODO: iteration / release</li>
                <li>TODO: sort by last updated - descending / ascending </li>
            </ul>

            <table class="items-table">
                <tr class="md-table-row">
                    <th class="md-table-head">ID</th>
                    <th class="md-table-head">Title</th>
                    <th class="md-table-head">Assignee</th>
                    <th class="md-table-head">Reporter</th>
                    <th class="md-table-head">Status</th>
                    <th class="md-table-head">Created</th>
                    <th class="md-table-head">Last Updated</th>
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
    import {fetchListOfItems, ListOptions, queryUtils} from "../utils/rally-util";
    import {showErrorToast} from "../utils/util";
    import {ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
    import {DateTime} from "luxon";
    import ExpandableSection from "./ExpandableSection.vue";


    @Component({
        components: {ExpandableSection, ItemSummary},
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

        @Watch("showOpenItemsOnly")
        async onShowOpenItemsOnlyChanged() {
            await this.fetchResults();
        }

        @Watch("searchFormattedId")
        async onSearchFormattedIdChanged() {
            await this.fetchResults();
        }

        async created() {
            this.expandSearchFilters = !this.backlogOnly;
            await this.fetchResults();
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
            const projectRef = user.DefaultProject;
            let query = queryUtils.where('Project', '=', projectRef);

            if (this.showMyItemsOnly) {
                query = query.and('Owner', '=', user._ref);
            }

            if (this.showOpenItemsOnly) {
                // TODO-mrc: include Completed too? Probably make what defines an open ticket configurable
                query = query.and('ScheduleState', '!=', 'Accepted');
            }

            if (this.backlogOnly) {
                query = queryUtils.where('Iteration', '=', null);
            }

            if (this.searchFormattedId) {
                query = query.and('FormattedID', 'contains', this.searchFormattedId);
            }

            // clear all results if we're showing the first page worth of data
            if (startIndex === 1) {
                this.items = [];
                this.hasMoreRecords = false;
                this.totalRecords = 0;
            }

            try {
                const results = await fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, {query, startIndex, pageSize});
                this.items.push(...results.items);
                this.hasMoreRecords = results.hasMoreResults;
                this.totalRecords = results.totalRecords;
            }
            catch(e) {
                showErrorToast();
            }
        }
    };

</script>


<style scoped>
</style>
