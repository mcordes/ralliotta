<template>
    <tr class="item-detail">
        <td><router-link :to="detailLink">{{ item.FormattedID }}</router-link></td>
        <td>{{ item.Name }}</td>
        <td>{{ ownerName }}</td>
        <td> {{ reporterName }} </td>
        <td> {{ status }}</td>
        <td>{{ item.CreationDate | formatDate }}</td>
        <td>{{ item.LastUpdateDate | formatDate }}</td>

        <!-- TODO-mrc: more? release, project, iteration, has attachments? -->
    </tr>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {getDataFromReference} from "../util";

    @Component
    export default class ItemSummary extends Vue {
        @Prop()
        item: any;

        detailLink = "";
        sharedState = store.state;
        ownerName = "";
        reporterName = "";
        status = "";

        async created() {
            const formattedID = this.item['FormattedID'];

            // TODO-mrc: is there a better way to do this? Seems unnecessary
            this.detailLink = `/detail/${formattedID}`;

            if (this.item.Owner) {
                const data = getDataFromReference(this.item.Owner);
                this.ownerName = data.name;
            }

            if (this.item.CreatedBy) {
                const data = getDataFromReference(this.item.CreatedBy);
                this.reporterName = data.name;
            }

            if (this.item.ScheduleState) {
                let flowStateName = "";
                if (this.item.FlowState) {
                    const data = getDataFromReference(this.item.FlowState);
                    flowStateName = data.name;
                }

                this.status = `${this.item.ScheduleState}: ${flowStateName}`;
            }
        }
    }

</script>

<style scoped>
</style>



