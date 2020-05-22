<template>
    <div class="item-detail">
        <h3>XXX</h3>

        <div>
            TODO:
            <ul>
                <li>Name: {{ item.Name }}</li>
                <li>Owner: {{ item.Owner }}</li>
                <li>ID: {{ item.ObjectID }}</li>
                <li>FormattedID: {{ item.FormattedID }}</li>
                <li>ScheduleState: {{ item.ScheduleState }}</li>

                <li><router-link :to="detailLink">Detail</router-link></li>

                <!-- TODO-mrc fix these
                <li>Release: {{ item.Release?._refObjectName }}</li>
                <li>Project: {{ item.Project?._refObjectName }}</li>
                <li>Iteration: {{ item.Iteration?._refObjectName }}</li>
                <li>Parent: {{ item.Parent?._refObjectName }}</li>
                <li>Creation Date: {{ item.CreatinDate }}</li>
                <li>Description: {{ item.Description }}</li>
                <li>Attachments: {{ item.Attachments }}</li>
                <li>Notes: {{ item.Notes }}</li>
                -->

            </ul>

        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";

    @Component
    export default class ItemSummary extends Vue {
        @Prop()
        item: any;

        detailLink: string = "";
        sharedState = store.state;

        async created() {
            const formattedID = this.item['FormattedID'];

            // TODO-mrc: is there a better way to do this? Seems unnecessary
            this.detailLink = `/detail/${formattedID}`;
        }
    }

</script>

<style scoped>
</style>



