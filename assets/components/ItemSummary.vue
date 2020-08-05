<template>
    <tr class="item-detail md-table-row">

        <!-- TODO-mrc: implement me
        <td class="md-table-cell" v-if="showAddToIteration">
            <button title="Add to current iteration" class="md-primary md-raised"
                       @click="showAddToIterationConfirmation = true">++</button>

            <button title="Remove from current iteration" class="md-primary md-raised"
                       @click="showRemoveFromIterationConfirmation = true">--</button>
        </td>
        -->

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

        <td v-if="showProject" class="md-table-cell"> {{ projectName }}</td>

        <td class="md-table-cell">{{ item.CreationDate | formatDate }}</td>
        <td class="md-table-cell">{{ item.LastUpdateDate | formatDate }}

            <div>
                <md-dialog-confirm
                        :md-active.sync="showAddToIterationConfirmation"
                        md-title="Are you sure?"
                        md-content="Add the item to the current iteration?"
                        md-confirm-text="Yes"
                        md-cancel-text="No"
                        @md-confirm="addToCurrentIteration" />

                <md-dialog-confirm
                        :md-active.sync="showRemoveFromIterationConfirmation"
                        md-title="Are you sure?"
                        md-content="Remove the item from the current iteration?"
                        md-confirm-text="Yes"
                        md-cancel-text="No"
                        @md-confirm="removeFromCurrentIteration" />
            </div>
        </td>
    </tr>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import Avatar from "./Avatar.vue";
    import ItemDetailModal from "./ItemDetailModal.vue";
    import {getCurrentAndPreviousIterations, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {DateTime} from "luxon";

    @Component({
        components: {Avatar, ItemDetailModal}
    })
    export default class ItemSummary extends Vue {
        ownerName = "";
        reporterName = "";
        status = "";
        projectName = "";
        showAddToIterationConfirmation = false;
        showRemoveFromIterationConfirmation = false;

        @Prop()
        item: any;

        @Prop({default: false})
        showAddToIteration!: boolean;

        @Prop({default: false})
        showProject!: boolean;

        async created() {
            if (this.item.Owner) {
                this.ownerName = this.item.Owner._refObjectName;
            }

            if (this.item.CreatedBy) {
                this.reporterName = this.item.CreatedBy._refObjectName;
            }

            if (this.item.FlowState) {
                let flowStateName = "";
                if (this.item.FlowState) {
                    flowStateName = this.item.FlowState._refObjectName;
                }

                this.status = flowStateName;
            }

            this.projectName = this.item.Project._refObjectName;
        }

        async addToCurrentIteration() {
            // TODO-mrc: cache this?
            const now = DateTime.utc();
            const [currentIteration] = await getCurrentAndPreviousIterations(this.item.Project, now);

            try {
                const data = {Iteration: currentIteration._ref};
                await updateItem(this.item._ref, data);

                showSuccessToast("Added to current iteration");
                // TODO-mrc: reload row? Change styling of row?

                // TODO-mrc: show include total storypoints for sprint / iteration?
            }
            catch(e) {
                showErrorToast();
            }

            // TODO-mrc: hide add button and show remove button
            // TODO-mrc: reload current iteration swimlanes
        }

        async removeFromCurrentIteration() {
            try {
                const data = {Iteration: null};
                await updateItem(this.item._ref, data);
                showSuccessToast("Removed from current iteration");

                // TODO-mrc: reload row? Change styling of row?
            }
            catch(e) {
                showErrorToast();
            }
            // TODO-mrc: hide remove button and show add button
        }
    }

</script>

<style scoped>
</style>



