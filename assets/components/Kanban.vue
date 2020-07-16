<template>
    <div>
        <h2>Kanban</h2>

        <div>
            <SelectInput v-bind:searchFunc="searchProjectList" v-bind:label="'Project'" v-bind:selectedValue.sync="project"
                v-bind:selectedLabel.sync="projectLabel"/>
        </div>

        <div v-if="isReady">
            <div v-if="currentIteration">
                <h3>Current iteration: {{ currentIteration.StartDate | formatDate }} - {{ currentIteration.EndDate | formatDate }} ({{ currentIteration.Name }})</h3>
                <div>
                    <IterationItemListBySwimlane v-bind:iteration="currentIteration" v-bind:project="project"/>
                </div>
            </div>

            <div v-if="previousIteration">
                <ExpandableSection title="Show previous iteration">
                    <template v-slot:header>
                        <h3>Previous iteration
                            {{ previousIteration.StartDate | formatDate }} - {{ previousIteration.EndDate | formatDate }} ({{ previousIteration.Name }})
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
                    <ItemList v-bind:backlogOnly="true" v-bind:initialProject="project"/>
                </template>
            </ExpandableSection>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import {getCurrentAndPreviousIterations, getSelectOptionsFromRefs, searchProjects} from "../utils/rally-util";
    import store from "../store";
    import ItemList from "./ItemList.vue";
    import IterationItemListBySwimlane from "./IterationItemListBySwimlane.vue";
    import ExpandableSection from "./ExpandableSection.vue";
    import {DateTime} from "luxon";
    import {showErrorToast} from "../utils/util";
    import {Iteration} from "../types/Iteration";
    import SelectInput from "./SelectInput.vue";

    @Component({
        components: {ItemList, IterationItemListBySwimlane, ExpandableSection, SelectInput}
    })
    export default class Kanban extends Vue {
        currentIteration?: Iteration = undefined;
        previousIteration?: Iteration = undefined;
        isReady = false;
        project = "";
        projectLabel = "";

        async created() {
            const user = store.getUser();
            this.project = user.DefaultProject._ref;
            this.projectLabel = user.DefaultProject._refObjectName;
        }

        @Watch("project")
        async projectChanged(to: string, from: string) {
            if (to) {
                await this.load();
            }
        }

        async load() {
            const now = DateTime.utc();

            try {
                [this.currentIteration, this.previousIteration] = await getCurrentAndPreviousIterations(this.project, now);
                this.isReady = true;
            }
            catch (e) {
                showErrorToast({e});
            }
        }

        async searchProjectList(search: string) {
            return await getSelectOptionsFromRefs(await searchProjects(search));
        }
    }

</script>

<style lang="css" scoped>
</style>
