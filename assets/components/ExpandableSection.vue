<template>
    <div>
        <div class="expandable-section" v-bind:class="{ 'expanded': isExpanded, 'collapsed': !isExpanded }" @click="toggleExpanded" :title="title">
            <span class="toggle-expansion">
                <span></span>
                <span></span>
            </span>
            <slot name="header"/>
        </div>
        <div v-if="isExpanded">
            <!-- NOTE: child elements of this component will appear here -->
            <slot name="main"/>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component
    export default class ExpandableSection extends Vue {
        @Prop()
        title!: string;

        isExpanded = false;

        toggleExpanded() {
            this.isExpanded = !this.isExpanded;
        }
    }

</script>

<style scoped>
</style>



