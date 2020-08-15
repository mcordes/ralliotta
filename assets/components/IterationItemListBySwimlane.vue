<template>
    <div class="swimlane-wrapper">
        <div class="swimlane" v-for="flowStateGroup in groupedArtifacts">
            <div class="swimlane-header">{{ flowStateGroup.Group.Name }}</div>

            <div>
                    <div v-for="item in flowStateGroup.Items" v-bind:item="item"
                             class="item" :key="item._ref">
                        <div>
                            <ItemDetailModal v-bind:formattedID="item.FormattedID" cssClass="item-id"/>
                        </div>
                        <div class="item-name">{{ item.Name }}</div>
                        <div class="avatar-wrapper" v-if="item.Owner">
                            <Avatar v-bind:user="item.Owner" v-bind:size="30"/>
                        </div>
                        <div class="item-owner">{{ item.Owner ? item.Owner._refObjectName : "" }}</div>
                    </div>
            </div>
            <br>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import store from "../store";
    import {Artifact} from "../types/Artifact";
    import Avatar from "./Avatar.vue";
    import {Iteration} from "../types/Iteration";
    import {Ref} from "../types/Ref";
    import ItemDetailModal from "./ItemDetailModal.vue";
    import {FlowState} from "../types/FlowState";
    import {getService} from "../services/init";

    @Component({
        components: {Avatar, ItemDetailModal}
    })
    export default class IterationItemListBySwimlane extends Vue {
        groupedArtifacts: {Group: any, Items: Artifact[]}[] = [];

        @Prop()
        iteration!: Iteration;

        @Prop({required: true})
        project!: Ref | string;

        @Watch("project")
        onProjectChanged() {
            this.load();
        }

        async created() {
            console.assert(this.iteration != null);
            console.assert(!!this.iteration);
            await this.load();
        }

        async load() {
            this.groupedArtifacts = await getService().getArtifactsGroupedByFlowState(this.project, this.iteration);
        }
    }

</script>

<style lang="css" scoped>
    .avatar-wrapper {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .swimlane-wrapper { display: flex; }

    .swimlane {
        background-color: #FFF;
        border: 1px solid #E2E2E2;
        border-radius: 5px;
        box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
        flex: 1;
        margin-right: 15px;
        padding: 0 15px 15px;
        transition: 0.15s ease box-shadow;
    }

    .swimlane:last-child {
        margin-right: 0;
    }

    .swimlane:hover {
        border-color: #D6D6D6;
        box-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
    }

    .swimlane ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .swimlane-header {
        border-bottom: 1px solid #C7C7C7;
        font-size: 1rem;
        font-weight: 600;
        padding: 8px 6px 6px;
        text-align: center;
        width: 100%;
    }

    .item {
        background-color: #f3f7ff;
        border-radius: 6px;
        border: 1px solid #d7dfea;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        margin-top: 15px;
        padding: 10px 15px;
        transition: 0.15s ease all;
    }

    .item:hover {
        background-color: #E6F1FD;
        border-color: #A5B7D0;
    }

    .item-id {
        border: none;
        color: #0b53b7 !important;
        font-weight: 600;
        font-size: 0.95rem;
        display: inline-block;
        padding: 2px 0 5px;
    }

    .item-id:hover {
        color: #0b62dc !important;
        text-decoration: underline !important;
    }

    .item-name {
        line-height: 1.3;
        margin-bottom: 10px;
    }

    .item-owner {
        font-size: 0.8rem;
    }
</style>
