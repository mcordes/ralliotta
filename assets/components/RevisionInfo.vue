<template>
    <ExpandableSection title="View details">
        <template v-slot:header>
            <div class="revision-header">
                <div class="revision-date">
                    {{ revision.CreationDate | formatDateTime }}
                </div>
                <div class="revision-author">
                    {{ label }}
                </div>
            </div>
        </template>
        <template v-slot:main>
            <div class="revision">
                <div class="revision-details">
                    {{ revision.Description }}
                </div>
            </div>
        </template>
    </ExpandableSection>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import ExpandableSection from "./ExpandableSection.vue";
    import {ActivityItem} from "../utils/activity-util";
    import {Revision} from "../types/Revision";
    @Component({
        components: {ExpandableSection}
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
    .revision {
        background: #FFF;
        border-radius: 6px;
        border: 1px solid #DEDEDE;
        color: #555;
        margin-bottom: 10px;
        max-width: 800px;
        padding: 6px 8px;
        position: relative;
        transition: all 0.15s ease;
    }

    .revision:hover {
        background: #F9F9F9;
        border: 1px solid #CCC;
        color: #222;
    }

    .revision:hover .revision-header {
        background: #E8E8E8;
    }

    .revision:after {
        background: #CCC;
        bottom: -11px;
        content: '';
        height: 10px;
        left: 10px;
        position: absolute;
        width: 2px;
    }

    .revision-header {
        border-bottom: 1px solid #E4E4E4;
        margin: -6px -8px 5px;
        padding: 2px 8px;
        transition: all 0.15s ease;
    }

    .revision-date {
        border-right: 1px solid #CCC;
        display: inline-block;
        font-weight: 600;
        padding-right: 12px;
    }

    .revision-author {
        display: inline-block;
        padding-left: 10px;
    }
</style>
