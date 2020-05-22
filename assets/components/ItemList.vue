<template>
    <div>
        <div class="item-list">

            <div>
                List page
            </div>

            <ItemSummary v-for="item in items" v-bind:item="item"></ItemSummary>

            <div v-if="hasMoreRecords">
                <md-button class="md-primary" @click="showMore" :disabled="isLoading">Show more</md-button>
            </div>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
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
            const query = queryUtils.where('Project', '=', projectRef);
            const results = await fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, query, startIndex, pageSize);

            this.items.push(...results.items);
            this.hasMoreRecords = results.hasMoreResults;
            this.totalRecords = results.totalRecords;
        }
    };

</script>


<style scoped>
</style>



