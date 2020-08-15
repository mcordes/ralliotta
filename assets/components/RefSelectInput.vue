<template>
    <div>
        <div v-if="(syncedSelectedRef && selectedRefLabel) || (!syncedSelectedRef)">
            <SelectInput v-bind:searchFunc="searchFunc" v-bind:label="label" v-bind:selectedValue.sync="syncedSelectedRef"
                         v-bind:selectedLabel.sync="selectedRefLabel" v-bind:cssClass="cssClass"
                         v-bind:disabled="disabled"/>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, PropSync, Vue, Watch} from "vue-property-decorator";
    import {Ref} from "../types/Ref";
    import SelectInput from "./SelectInput.vue";
    import {getSelectOptionsFromRefs} from "../utils/util";
    import {getService} from "../services/init";

    export type ItemSelectType = "project" | "release" | "iteration" | "epic" | "user";

    @Component({
        components: {SelectInput},
    })
    export default class RefSelectInput extends Vue {
        selectedRefLabel = "";

        @PropSync("selectedRef", {required: true})
        syncedSelectedRef!: string | Ref | undefined;

        @Prop({required: true})
        itemType!: ItemSelectType;

        // Optional - not required for project search
        @Prop()
        project!: Ref | string;

        @Prop()
        label!: string;

        @Prop()
        cssClass!: string;

        @Prop({default: false})
        disabled!: boolean;

        async created() {
            if (this.syncedSelectedRef) {
                const item: Ref = await getService().fetchSingleItemByRef(this.syncedSelectedRef);
                this.selectedRefLabel = item._refObjectName;
            }
        }

        async searchFunc(s: string) {
            let results;

            debugger;
            switch(this.itemType) {
                case "project":
                    results = await getService().searchProjects(s);
                    break;
                case "release":
                    results = await getService().searchReleases(this.project, s);
                    break;
                case "iteration":
                    results = await getService().searchIterations(this.project, s);
                    break;
                case "epic":
                    results = await getService().searchEpics(this.project, s);
                    break;
                case "user":
                    results = await getService().searchProjectTeamMembers(this.project, s);
                    break;
                default:
                    throw new Error("Unexpected search item type: " + this.itemType);
            }

            return await getSelectOptionsFromRefs(results);
        }
    };

</script>


<style scoped>
</style>
