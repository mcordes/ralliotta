<template>
    <tr class="item-detail md-table-row">
        <td class="md-table-cell">
            <ItemDetailModal v-bind:formattedID="item.FormattedID"/>

        </td>
        <td class="md-table-cell">{{ item.Name }}</td>
        <td class="md-table-cell">
            <div class="avatar-wrapper" v-if="item.Owner">
                <Avatar v-bind:user="item.Owner" v-bind:size="30"/>
            </div>
            {{ ownerName }}
        </td>
        <td class="md-table-cell">
            <div class="avatar-wrapper" v-if="item.CreatedBy">
                <Avatar v-bind:user="item.CreatedBy" v-bind:size="30"/>
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
    import ItemDetailModal from "./ItemDetailModal.vue";

    @Component({
        components: {Avatar, ItemDetailModal}
    })
    export default class ItemSummary extends Vue {
        @Prop()
        item: any;

        ownerName = "";
        reporterName = "";
        status = "";

        async created() {
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

                // TODO-mrc: what about this.item.ScheduleState ? maybe some people don't use flow state?
                this.status = flowStateName;
            }
        }
    }

</script>

<style scoped>
</style>



