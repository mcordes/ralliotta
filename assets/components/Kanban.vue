<template>
    <div>
        Kanban

        <div v-if="currentIteration">
            <h2>Current iteration: {{ currentIteration.StartDate | formatDate }} - {{ currentIteration.EndDate | formatDate }} ({{ currentIteration.Name }})</h2>
            <IterationItemListBySwimlane v-bind:iteration="currentIteration"/>
        </div>

        <!-- TODO-mrc: maybe don't retrieve the data for this until it's shown? And refresh when shown/hidden? -->
        <div v-if="previousIteration">
            <ExpandableSection title="Show previous iteration">
                <template v-slot:header>
                    <h2>Previous iteration
                        {{ previousIteration.StartDate | formatDate }} - {{ previousIteration.EndDate | formatDate }} ({{ previousIteration.Name }})
                    </h2>
                </template>
                <template v-slot:main>
                    <IterationItemListBySwimlane v-bind:iteration="previousIteration"/>
                </template>
            </ExpandableSection>
        </div>

        <div>
            <ItemList v-bind:backlogOnly="true" v-bind:heading="'Backlog'"/>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {getCurrentIteration, getPreviousIteration} from "../utils/rally-util";
    import store from "../store";
    import ItemList from "./ItemList.vue";
    import IterationItemListBySwimlane from "./IterationItemListBySwimlane.vue";
    import ExpandableSection from "./ExpandableSection.vue";
    import {DateTime} from "luxon";
    import {showErrorToast} from "../utils/util";

    @Component({
        components: {ItemList, IterationItemListBySwimlane, ExpandableSection}
    })
    export default class Kanban extends Vue {
        currentIteration: any = {};  // TODO-mrc Iteration | undefined;
        previousIteration: any = {}; // TODO-mrc: Iteration | undefined;

        async created() {
            const user = store.getUser();

            // TODO-mrc: TODO: add project drop down to this page instead
            const projectRef = user.DefaultProject;

            const now = DateTime.utc();

            try {
                [this.currentIteration, this.previousIteration] = await Promise.all([
                    getCurrentIteration(projectRef, now),
                    getPreviousIteration(projectRef, now)
                ])
            }
            catch (e) {
                showErrorToast({e});
            }
        }
    }

</script>

<style scoped>
</style>



