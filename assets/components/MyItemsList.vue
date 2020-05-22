<template>
    <div>
        <div class="item-list">

            <div>
                My items
            </div>

            <!-- TODO-mrc: is there a way to reuse the ItemList template?
                Or maybe this should just be joined with ItemList and this is just one potential option?
            -->
            <ItemSummary v-for="item in items" v-bind:item="item"></ItemSummary>

            <div v-if="hasMoreRecords">
                <md-button class="md-primary" @click="showMore" :disabled="isLoading">Show more</md-button>
            </div>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component} from "vue-property-decorator";
    import ItemSummary from "./ItemSummary.vue";
    import {ARTIFACT_SEARCH_FIELDS, fetchListOfItems, queryUtils} from "../util";
    import ItemList from "./ItemList.vue";

    // TODO-mrc: can we get some code reuse between this and ItemList? How?

    // TODO-mrc: this works, but why does webstorm show errors below. strange.

    @Component({
        components: {ItemSummary},
    })
    export default class MyItemsList extends ItemList {

        async fetchResults(startIndex: number = 1, pageSize: number = 20) {
            // TODO-mrc: will user be set here? What about a getter / setter would that work better?
            const userRef = this.sharedState.user.getID();
            const query = queryUtils.where('Owner', '=', userRef);
            const results = await fetchListOfItems('artifact', ARTIFACT_SEARCH_FIELDS, query);
            this.items.push(...results.items);
            this.hasMoreRecords = results.hasMoreResults;
        }
    };

</script>

<style scoped>
</style>



