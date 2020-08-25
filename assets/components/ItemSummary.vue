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
            <ItemDetailModal v-bind:formattedID="syncedItem.FormattedID"/>

        </td>
        <td class="md-table-cell">{{ syncedItem.Name }}</td>

        <td v-if="showPlanEstimate">{{ syncedItem.PlanEstimate }}</td>

        <td class="md-table-cell">
            <div class="avatar-wrapper" v-if="syncedItem.Owner">
                <Avatar v-bind:user="syncedItem.Owner" v-bind:size="30"/>
            </div>
            {{ ownerName }}
        </td>
        <td class="md-table-cell">
            <div class="avatar-wrapper" v-if="syncedItem.CreatedBy">
                <Avatar v-bind:user="syncedItem.CreatedBy" v-bind:size="30"/>
            </div>
            {{ reporterName }}
        </td>
        <td class="md-table-cell status-column"> {{ status }}</td>

        <td v-if="showProject" class="md-table-cell"> {{ projectName }}</td>

        <td class="md-table-cell">{{ syncedItem.CreationDate | formatDate }}</td>
        <td class="md-table-cell">{{ syncedItem.LastUpdateDate | formatDate }}

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
import {Component, Vue, Prop, PropSync} from 'vue-property-decorator';
    import Avatar from "./Avatar.vue";
    import ItemDetailModal from "./ItemDetailModal.vue";
    import {refUtils, showErrorToast, showSuccessToast} from "../utils/util";
    import {DateTime} from "luxon";
    import {getService} from "../services/init";
    import {debounce} from "underscore";

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

        @PropSync("item")
        syncedItem: any;

        @Prop({default: false})
        showAddToIteration!: boolean;

        @Prop({default: false})
        showProject!: boolean;

        @Prop({default: false})
        showPlanEstimate!: boolean;

        async created() {
            if (this.syncedItem.Owner) {
                this.ownerName = this.syncedItem.Owner._refObjectName;
            }

            if (this.syncedItem.CreatedBy) {
                this.reporterName = this.syncedItem.CreatedBy._refObjectName;
            }

            if (this.syncedItem.FlowState) {
                let flowStateName = "";
                if (this.syncedItem.FlowState) {
                    flowStateName = this.syncedItem.FlowState._refObjectName;
                }

                this.status = flowStateName;
            }

            this.projectName = this.syncedItem.Project._refObjectName;

            // TODO: it would be nice if this only was triggered if the list page was viewable and just queued up
            // if it's obscured by the detail page. Fix me.

            // NOTE: Listens for EVENT
            // Listen for this item to be changed and reload throttled once every 2 seconds
            this.$root.$on("itemChanged", debounce(this.reloadItem, 2000));
        }

        async addToCurrentIteration() {
            const now = DateTime.utc();
            const [currentIteration] = await getService().getCurrentAndPreviousIterations(this.syncedItem.Project, now);

            try {
                const data = {Iteration: currentIteration._ref};
                await getService().updateItem(this.syncedItem._ref, data);

                const newTotalPoints = currentIteration.PlannedVelocity ?? 0 + this.syncedItem.PlanEstimate ?? 0;

                showSuccessToast(`Added to current iteration (story points: ${newTotalPoints})`);
                this.addedToIteration = true;

                // NOTE: triggers an event
                // Trigger an event that Kanban.vue will look for a reload the iteration swimlane breakdown thingey
                this.$root.$emit("iterationItemsChanged", currentIteration._ref);
            }
            catch(e) {
                showErrorToast({e});
            }
        }

        async removeFromCurrentIteration() {
            const now = DateTime.utc();
            const [currentIteration] = await getService().getCurrentAndPreviousIterations(this.syncedItem.Project, now);

            try {
                const data = {Iteration: null};
                await getService().updateItem(this.syncedItem._ref, data);

                const newTotalPoints = currentIteration.PlannedVelocity ?? 0 - this.syncedItem.PlanEstimate ?? 0;
                showSuccessToast(`Removed from current iteration (story points: ${newTotalPoints})`);

                this.addedToIteration = false;

                // NOTE: triggers an event
                // Trigger an event that Kanban.vue will look for a reload the iteration swimlane breakdown thingey
                this.$root.$emit("iterationItemsChanged", currentIteration._ref);
            }
            catch(e) {
                showErrorToast({e});
            }
        }

        async reloadItem(itemRef: string) {
            if (itemRef === this.syncedItem._ref) {
                console.log(`Refreshing item ${this.syncedItem.FormattedID}- ${refUtils.getId(itemRef)}`);

                try {
                    this.syncedItem = await getService().fetchSingleItemByRef(itemRef);
                }
                catch (e) {
                    showErrorToast({e});
                }
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
    .status-column {
        white-space: nowrap;
    }
</style>



