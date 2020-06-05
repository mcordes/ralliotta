<template>
    <tr class="item-detail md-table-row">
        <td class="md-table-cell"><router-link :to="detailLink">{{ item.FormattedID }}</router-link></td>
        <td class="md-table-cell">{{ item.Name }}</td>
        <td class="md-table-cell">{{ ownerName }}</td>
        <td class="md-table-cell"> {{ reporterName }} </td>
        <td class="md-table-cell"> {{ status }}</td>
        <td class="md-table-cell">{{ item.CreationDate | formatDate }}</td>
        <td class="md-table-cell">{{ item.LastUpdateDate | formatDate }}</td>
    </tr>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {getDataFromReference} from "../utils/rally-util";

    @Component
    export default class ItemSummary extends Vue {
        @Prop()
        item: any;

        detailLink = "";
        ownerName = "";
        reporterName = "";
        status = "";

        async created() {
            const formattedID = this.item['FormattedID'];
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



