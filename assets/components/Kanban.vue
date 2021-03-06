<template>
    <div>
        <h2>Kanban</h2>

        <div>
            <SelectInput v-bind:searchFunc="searchProjectList" v-bind:label="'Project'" v-bind:selectedValue.sync="project"
                v-bind:selectedLabel.sync="projectLabel"/>
        </div>

        <div v-if="isReady">
            <div v-if="currentIteration">
                <h3>Current iteration: {{ currentIteration.StartDate | formatDate }} - {{ currentIteration.EndDate | formatDate }} ({{ currentIteration.Name }})
                    <span v-if="currentIteration.PlannedVelocity">(Story points: {{ currentIteration.PlannedVelocity }})</span>
                </h3>
                <div>
                    <IterationItemListBySwimlane v-bind:iteration="currentIteration" v-bind:project="project"/>
                </div>
            </div>

            <div v-if="previousIteration">
                <ExpandableSection title="Show previous iteration">
                    <template v-slot:header>
                        <h3>Previous iteration
                            {{ previousIteration.StartDate | formatDate }} - {{ previousIteration.EndDate | formatDate }} ({{ previousIteration.Name }})
                            <span v-if="previousIteration.PlannedVelocity">(Story points: {{ previousIteration.PlannedVelocity }})</span>
                        </h3>
                    </template>
                    <template v-slot:main>
                        <IterationItemListBySwimlane v-bind:iteration="previousIteration" v-bind:project="project"/>
                    </template>
                </ExpandableSection>
            </div>
        </div>

        <div>
            <ExpandableSection title="Backlog">
                <template v-slot:header>
                    <h3>Backlog</h3>
                </template>
                <template v-slot:main>
                    <Backlog v-bind:initialProject="project"/>
                </template>
            </ExpandableSection>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import store from "../store";
    import ItemList from "./ItemList.vue";
    import IterationItemListBySwimlane from "./IterationItemListBySwimlane.vue";
    import ExpandableSection from "./ExpandableSection.vue";
    import {DateTime} from "luxon";
    import {
      getRecentlyUsedProject,
      getSelectOptionsFromRefs,
      setRecentlyUsedProject,
      showErrorToast
    } from "../utils/util";
    import {Iteration} from "../types/Iteration";
    import SelectInput from "./SelectInput.vue";
    import Backlog from "./Backlog.vue";
    import {getService} from "../services/init";

    @Component({
        components: {ItemList, IterationItemListBySwimlane, ExpandableSection, SelectInput, Backlog}
    })
    export default class Kanban extends Vue {
        currentIteration?: Iteration = undefined;
        previousIteration?: Iteration = undefined;
        currentIterationMetrics?: any;
        previousIterationMetrics?: any;
        isReady = false;
        project = "";
        projectLabel = "";

        async created() {
            const user = store.getUser();

            const recentProject = getRecentlyUsedProject();
            this.project = recentProject ? recentProject.ref : user.DefaultProject._ref;
            this.projectLabel = recentProject ? recentProject.label : user.DefaultProject._refObjectName;
        }

        @Watch("project")
        async projectChanged(to: string, from: string) {
            if (to) {
                await this.load();
                setRecentlyUsedProject(this.project, this.projectLabel);
            }
        }

        async load() {
            const now = DateTime.utc();

            try {
                [this.currentIteration, this.previousIteration] = await getService().getCurrentAndPreviousIterations(this.project, now);
                this.isReady = true;
            }
            catch (e) {
                showErrorToast({e});
            }
        }

        async searchProjectList(search: string) {
            return await getSelectOptionsFromRefs(await getService().searchProjects(search));
        }
    }

</script>

<style lang="css" scoped>
</style>
