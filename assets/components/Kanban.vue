<template>
    <div>
        Kanban

        <div>
            <h2>Current iteration</h2>

            <div v-for="flowState in groupedArtifacts" v-bind:flowState="flowState">
                Swimlane: {{ flowState.Group.Name }}
                <ul>
                    <li v-for="item in flowState.Items" v-bind:item="item">
                        <router-link :to="'/detail/' + item.FormattedID">{{ item.FormattedID }}</router-link> <br>
                        {{ item.Name }}
                        <div class="avatar-wrapper" v-if="item.Owner">
                            <Avatar v-bind:user="item.Owner" v-bind:size="30"/>
                        </div>
                        {{ item.Owner ? item.Owner._refObjectName : "" }}

                    </li>
                </ul>
                <br>
            </div>
        </div>

        <div>
            <ItemList v-bind:backlogOnly="true" v-bind:heading="'Backlog'"/>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {getArtifactsGroupedByFlowState, getCurrentIteration} from "../utils/rally-util";
    import store from "../store";
    import ItemList from "./ItemList.vue";
    import {Artifact} from "../types/Artifact";
    import Avatar from "./Avatar.vue";

    @Component({
        components: {ItemList, Avatar}
    })
    export default class Kanban extends Vue {
        groupedArtifacts: {Group: any, Items: Artifact[]}[] = [];

        async created() {
            const user = store.getUser();
            const projectRef = user.DefaultProject;
            const iteration = await getCurrentIteration(projectRef);
            if (!iteration) {
                throw new Error("Cant find current iteration");
                // TODO-mrc: what shall we do here?
            }
            this.groupedArtifacts = await getArtifactsGroupedByFlowState(projectRef, iteration);
        }
    }

</script>

<style scoped>
</style>



