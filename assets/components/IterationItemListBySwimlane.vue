<template>
    <div>
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
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {getArtifactsGroupedByFlowState} from "../utils/rally-util";
    import store from "../store";
    import {Artifact} from "../types/Artifact";
    import Avatar from "./Avatar.vue";
    import {Iteration} from "../types/Iteration";

    @Component({
        components: {Avatar}
    })
    export default class IterationItemListBySwimlane extends Vue {
        groupedArtifacts: {Group: any, Items: Artifact[]}[] = [];

        @Prop()
        iteration!: Iteration;

        async created() {
            console.assert(this.iteration != null);

            const user = store.getUser();
            const projectRef = user.DefaultProject;
            console.assert(!!this.iteration);
            this.groupedArtifacts = await getArtifactsGroupedByFlowState(projectRef, this.iteration);
        }
    }

</script>

<style scoped>
</style>



