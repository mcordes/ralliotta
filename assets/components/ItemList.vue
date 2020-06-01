<template>
    <div>
        <div class="item-list">

            <h2>
                <span v-if="showMyItemsOnly">My items</span>
                <span v-else>List page</span>
            </h2>

            <table>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                </tr>

                <ItemSummary v-for="item in items" v-bind:item="item"></ItemSummary>
            </table>

            <div v-if="hasMoreRecords">
                <md-button class="md-primary" @click="showMore" :disabled="isLoading">Show more</md-button>
            </div>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import store from "../store";
    import ItemSummary from "./ItemSummary.vue";
    import {ARTIFACT_SEARCH_FIELDS, fetchListOfItems, queryUtils} from "../util";


    @Component({
        components: {ItemSummary},
    })
    export default class ItemList extends Vue {
        items: any[] = [];
        sharedState = store.state;
        hasMoreRecords = false;
        totalRecords = 0;
        isLoading = false;

        // TODO-mrc: I think this will become more generic as we add more search stuff.
        // For now it's just a way to have a single view for the list page and the assigned to me page.
        @Prop({default: false})
        showMyItemsOnly: boolean;

        @Watch("$route")
        async onRouteChange(to: any, from: any) {
            this.items = [];
            await this.fetchResults();
        }

        async created() {
            await this.fetchResults();
        }

        // TODO-mrc: prevent this from being called more than once at a time
        // TODO-mrc: we could disable the submit button, anything else or is that enough?
        async showMore() {
            // TODO-mrc: try / catch blocks for things like this?
            this.isLoading = true;
            const startIndex = this.items.length;
            await this.fetchResults(startIndex);
            this.isLoading = false;
        }

        protected async fetchResults(startIndex = 1, pageSize = 20) {
            const projectRef = this.sharedState.user.getDefaultProjectID();
            // TODO-mrc: make this configurable - I envision a bunch of form fields at first
            let query = queryUtils.where('Project', '=', projectRef);

            if (this.showMyItemsOnly) {
                const userRef = this.sharedState.user.getRef();
                query = query.and('Owner', '=', userRef);
            }

            const results = await fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, query, startIndex, pageSize);

            this.items.push(...results.items);
            this.hasMoreRecords = results.hasMoreResults;
            this.totalRecords = results.totalRecords;
        }
    };

</script>


<style scoped>
</style>
