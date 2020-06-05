<template>
    <div>
        <h3 @click="toggleExpanded" :title="title">
            <span v-if="isExpanded"> - </span>
            <span v-else> + </span>
            {{ label }}</h3>
        <div v-if="isExpanded">
            <!-- NOTE: child elements of this component will appear here -->
            <slot></slot>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component
    export default class ExpandableSection extends Vue {
        @Prop()
        label!: string;

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



