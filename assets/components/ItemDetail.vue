<template>
    <div class="item-detail">
        <div>
            <h2>{{ item.data.FormattedID }} - {{ item.data.Name }}</h2>

            <div>
                <!-- TODO-mrc: could also just pass in item and field name, then we can get the value -->
                <EditableTextArea v-bind:value="item.data.Description" v-bind:fieldName="'Description'" v-bind:itemRef="item.getRef()"/>
            </div>


            <!-- TODO-mrc: this is for debugging and inspiration purposes -->
            <div>
                <h3 @click="toggleShowAllFields" title="toggle showing all fields">
                    <span v-if="showAllFields"> - </span>
                    <span v-else> + </span>
                    Assorted fields</h3>
                <div v-if="showAllFields">
                    <div v-for="field in itemFields" v-bind:field="field">
                        <div class="field">{{ field }}</div>
                        <div class="value">{{ item.data[field] }}</div>
                        <!-- TODO-mrc: determine field type and list that too until we figure out how to display each type -->
                    </div>
                </div>
            </div>

            <br>
            <br>

            <md-tabs md-dynamic-height>
                <md-tab md-label="Comments">
                    <div v-for="comment in comments" v-bind:comment="comment">
                        <Comment v-bind:data="comment" v-bind:itemRef="item.getRef()"/>
                    </div>

                    <!-- Add one for the new comment form as well -->
                    <!-- TODO-mrc
                    <Comment v-bind:itemRef="item.getRef()"/>
                    -->

                </md-tab>

                <md-tab md-label="History">
                    <div v-for="revision in revisions" v-bind:revision="revision">
                        <Revision v-bind:data="revision"/>
                    </div>
                </md-tab>
            </md-tabs>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import store from "../store";
    import {
        fetchListOfItems, fetchSingleItemByFormattedID3,
        queryUtils
    } from "../rally-util";
    import Comment from "./Comment.vue";
    import EditableTextArea from "./EditableTextArea.vue";
    import Revision from "./Revision.vue";

    async function fetchItem(formattedID: string) {
        return await fetchSingleItemByFormattedID3(formattedID);
    }

    async function fetchComments(itemIdentifier: string) {
        const query = queryUtils.where('Artifact', '=', itemIdentifier);

        // TODO-mrc: sort by PostNumber
        // TODO-mrc: I have no idea what one does with Object Id , ditch it
        const results = await fetchListOfItems('conversationPost', ['Name', 'PostNumber', 'Text', 'User', 'CreationDate'], query);
        return results.items;
    }

    async function fetchRevisionHistory(revisionHistoryRef: string) {
        if (!revisionHistoryRef) {
            return [];
        }

        const query = queryUtils.where('RevisionHistory', '=', revisionHistoryRef);

        // TODO-mrc: sort by revision#
        const result = await fetchListOfItems("revision", ['Description', 'RevisionNumber', 'User',
            'CreationDate'], query);
        return result.items;
    }

    @Component({
        components: {EditableTextArea, Comment, Revision},
    })
    export default class ItemDetail extends Vue {
        // TODO-mrc: use UserType fix me
        item: any = {data: {}};
        itemFields: string[] = [];
        comments: any[] = [];
        revisions: any[] = [];
        sharedState = store.state;
        showAllFields = false;

        async created() {
            const formattedID = this.$route.params['formattedID'];

            this.item = await fetchItem(formattedID);
            if (!this.item) {
                // TODO-mrc: show 404 page? We didn't find it
                throw new Error("implement me");
            }

            this.comments = await fetchComments(this.item.getRef());
            this.revisions = await fetchRevisionHistory(this.item.data['RevisionHistory']);


            // TODO-mrc: fix me
            // this.itemFields = filterOutFieldsExcludedFromDisplay(Object.keys(this.item));
            this.itemFields = Object.keys(this.item.data);
        }

        toggleShowAllFields() {
            this.showAllFields = !this.showAllFields;
        }
    }

</script>

<style scoped>
    .value, .field {display: inline-block; padding: 10px }

</style>



