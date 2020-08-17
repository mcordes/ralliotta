<template>
    <tr class="item-detail md-table-row" v-bind:class="{'added-to-iteration': addedToIteration}">
        <td class="md-table-cell" v-if="showAddToIteration">
            <div v-if="addedToIteration">
                <button title="Remove from current iteration" class="md-primary md-raised"
                        @click="showRemoveFromIterationConfirmation = true">--</button>
            </div>
            <div v-else>
                <button title="Add to current iteration" class="md-primary md-raised"
                        @click="showAddToIterationConfirmation = true">++</button>
            </div>
        </td>

        <td class="md-table-cell">
            <ItemDetailModal v-bind:formattedID="item.FormattedID"/>

        </td>
        <td class="md-table-cell">{{ item.Name }}</td>

        <td v-if="showPlanEstimate">{{ item.PlanEstimate }}</td>

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
            </div>
            <div>
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
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {DateTime} from "luxon";
    import {getService} from "../services/init";

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
        addedToIteration = false;

        @Prop()
        item: any;

        @Prop({default: false})
        showAddToIteration!: boolean;

        @Prop({default: false})
        showProject!: boolean;

        @Prop({default: false})
        showPlanEstimate!: boolean;

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
            const now = DateTime.utc();
            const [currentIteration] = await getService().getCurrentAndPreviousIterations(this.item.Project, now);

            try {
                const data = {Iteration: currentIteration._ref};
                await getService().updateItem(this.item._ref, data);

                const newTotalPoints = currentIteration.PlannedVelocity ?? 0 + this.item.PlanEstimate ?? 0;

                showSuccessToast(`Added to current iteration (story points: ${newTotalPoints})`);
                this.addedToIteration = true;

                // Trigger an event that Kanban.vue will look for a reload the iteration swimlane breakdown thingey
                this.$root.$emit("iterationItemsChanged", currentIteration._ref);
            }
            catch(e) {
                showErrorToast({e});
            }
        }

        async removeFromCurrentIteration() {
            const now = DateTime.utc();
            const [currentIteration] = await getService().getCurrentAndPreviousIterations(this.item.Project, now);

            try {
                const data = {Iteration: null};
                await getService().updateItem(this.item._ref, data);

                const newTotalPoints = currentIteration.PlannedVelocity ?? 0 - this.item.PlanEstimate ?? 0;
                showSuccessToast(`Removed from current iteration (story points: ${newTotalPoints})`);

                this.addedToIteration = false;

                // Trigger an event that Kanban.vue will look for a reload the iteration swimlane breakdown thingey
                this.$root.$emit("iterationItemsChanged", currentIteration._ref);
            }
            catch(e) {
                showErrorToast({e});
            }
        }
    }

</script>

<style scoped>
    .added-to-iteration {
        opacity: 0.3;
    }
    .added-to-iteration button {
        opacity: 1;
    }
</style>



