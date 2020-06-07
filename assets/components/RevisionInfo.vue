<template>
    <ExpandableSection title="View details">
        <template v-slot:header>
            <div class="revision-header">
                <div class="revision-date">
                    <TimeSinceDate v-bind:date="revision.CreationDate"/>
                </div>
                <div class="revision-author">
                    {{ label }}
                </div>
            </div>
        </template>
        <template v-slot:main>
            <div class="revision-details">
                {{ revision.Description }}
            </div>
        </template>
    </ExpandableSection>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import ExpandableSection from "./ExpandableSection.vue";
    import {ActivityItem} from "../utils/activity-util";
    import {Revision} from "../types/Revision";
    import TimeSinceDate from "./TimeSinceDate.vue";
    @Component({
        components: {ExpandableSection, TimeSinceDate}
    })
    export default class RevisionInfo extends Vue {
        @Prop()
        activity!: ActivityItem;

        revision!: Revision;
        label = '';

        created() {
            this.revision = this.activity.data;
            this.label = this.getLabel();
        }

        getLabel() {
            const desc = this.revision.Description || '';
            const changedFields: string[] = desc.split(", ").map((change: any) => {
                // NOTE: the first words of each change is the FIELD name in caps.
                const matches = /^([A-Z\s]+)/.exec(change);
                return matches ? matches[1].trim() : '';
            });

            const len = changedFields.length;
            if (len > 1) {
                return `${this.activity.userName} changed fields ` + changedFields.slice(0, len -1).join(", ") + " and " + changedFields[len - 1];
            }
            else {
                return `${this.activity.userName} changed the field ${changedFields[0]}`;
            }
        }
    };
</script>


<style lang="css" scoped>
</style>
