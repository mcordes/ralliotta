<template>
    <div class="item-detail">
        <div>
            <h2>{{ item.data.FormattedID }} - {{ item.data.Name }}</h2>

            <div>
                {{ item.data.Description }}
            </div>


            <!-- TODO-mrc: fix me -->
            <h3>Assorted fields</h3>

            <div v-for="field in itemFields" v-bind:field="field">
                <div class="field">{{ field }}</div>
                <div class="value">{{ item.data[field] }}</div>
                <!-- TODO-mrc: determine field type and list that too until we figure out how to display each type -->
            </div>

            <md-tabs md-dynamic-height>
                <md-tab md-label="Comments">
                    <div v-for="comment in comments" v-bind:comment="comment">
                        <div>Author: {{ comment.User._refObjectName }}</div>
                        <div>Post Number: {{ comment.PostNumber }}</div>
                        <div>Text: {{ comment }}</div>
                        <div>Ref: {{ comment._ref }}</div>

                        <!-- NOTE: no created date? -->
                    </div>
                </md-tab>

                <md-tab md-label="History">
                    <div v-for="revision in revisions" v-bind:revision="revision">
                        <div>Author: {{ revision.User._refObjectName }}</div>
                        <div>Revision Number: {{ revision.RevisionNumber }}</div>
                        <div>Description: {{ revision.Description }}</div>

                        <!-- NOTE: no created date? -->
                    </div>
                </md-tab>
            </md-tabs>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {
        fetchListOfItems, fetchSingleItemByFormattedID3,
        filterOutFieldsExcludedFromDisplay,
        queryUtils
    } from "../util";

    async function fetchItem(formattedID: string) {
        return await fetchSingleItemByFormattedID3(formattedID);
    }

    async function fetchComments(itemIdentifier: string) {
        const query = queryUtils.where('Artifact', '=', itemIdentifier);

        // TODO-mrc: sort by PostNumber
        // TODO-mrc: I have no idea what one does with Object Id , ditch it
        const results = await fetchListOfItems('conversationPost', ['Name', 'PostNumber', 'Text', 'User'], query);
        return results.items;
    }

    async function fetchRevisionHistory(revisionHistoryRef: string) {
        if (!revisionHistoryRef) {
            return [];
        }

        const query = queryUtils.where('RevisionHistory', '=', revisionHistoryRef);

//        fetchListOfItems("revision", [], query)
//        https://rally1.rallydev.com/slm/webservice/v2.0/revisionhistory/384725176552/revisions

        // TODO-mrc: sort by revision#
        const result = await fetchListOfItems("revision", ['Description', 'RevisionNumber', 'User'], query);
        return result.items;
    }

    @Component
    export default class ItemDetail extends Vue {
        // TODO-mrc: use UserType fix me
        item: any = {data: {}};
        itemFields: string[] = [];
        comments: any[] = [];
        revisions: any[] = [];
        sharedState = store.state;


        async created() {
            const formattedID = this.$route.params['formattedID'];

            this.item = await fetchItem(formattedID);
            if (!this.item) {
                // TODO-mrc: show 404 page? We didn't find it
                throw new Error("implement me");
            }

            this.comments = await fetchComments(this.item.getID());
            this.revisions = await fetchRevisionHistory(this.item.data['RevisionHistory']);


            // TODO-mrc: fix me
            // this.itemFields = filterOutFieldsExcludedFromDisplay(Object.keys(this.item));
            this.itemFields = Object.keys(this.item.data);
        }
    }

</script>

<style scoped>
    .value, .field {display: inline-block; padding: 10px }

</style>



