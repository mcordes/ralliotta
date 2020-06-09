<template>
    <tr class="item-detail md-table-row">
        <td class="md-table-cell">
            <router-link :to="detailLink">{{ item.FormattedID }}</router-link>
        </td>
        <td class="md-table-cell">{{ item.Name }}</td>
        <td class="md-table-cell">
            <div v-if="item.Owner">
                <Avatar v-bind:user="item.Owner"/>
            </div>
            {{ ownerName }}
        </td>
        <td class="md-table-cell">
            <div v-if="item.CreatedBy">
                <Avatar v-bind:user="item.CreatedBy"/>
            </div>
            {{ reporterName }}
        </td>
        <td class="md-table-cell"> {{ status }}</td>
        <td class="md-table-cell">{{ item.CreationDate | formatDate }}</td>
        <td class="md-table-cell">{{ item.LastUpdateDate | formatDate }}</td>
    </tr>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import Avatar from "./Avatar.vue";

    @Component({
        components: {Avatar}
    })
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
                this.ownerName = this.item.Owner._refObjectName;
            }

            if (this.item.CreatedBy) {
                this.reporterName = this.item.CreatedBy._refObjectName;
            }

            if (this.item.ScheduleState) {
                let flowStateName = "";
                if (this.item.FlowState) {
                    flowStateName = this.item.FlowState._refObjectName;
                }

                this.status = `${this.item.ScheduleState}: ${flowStateName}`;
            }
        }
    }

</script>

<style scoped>
</style>



