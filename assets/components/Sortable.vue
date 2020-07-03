<template>
    <div @click="toggleSort">
        <span v-if="isAscending"> + </span>
        <span v-else-if="isDescending"> - </span>
        <span v-else>+/-</span>
        <slot/>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Prop, Watch, PropSync} from 'vue-property-decorator';

    @Component
    export default class Sortable extends Vue {
        @Prop()
        field!: string;

        // NOTE: PropSync didn't work here - the value never changed.
        //@PropSync("value", {required: true, type: String})
        @Prop()
        value!: string;

        isAscending = false;
        isDescending = false;

        // A local internal-only copy of value we'll manipulate to avoid Prop warnings
        valueInternal = '';

        @Watch("value")
        onValueChanged() {
            this.valueInternal = this.value;
            this.reset();
        }

        async created() {
            this.valueInternal = this.value;
            this.reset();
        }

        reset() {
            const sortVal = this.valueInternal || "";
            const [sortFieldName, sortDirection] = sortVal.split(" ");
            const isSorting = sortFieldName === this.field;

            this.isAscending = isSorting && sortDirection === 'ASC';
            this.isDescending = isSorting && !this.isAscending;
        }

        toggleSort() {
            this.valueInternal = (this.field + (!this.isAscending ? ' ASC' : ' DESC'));
            this.reset();

            // Tell the parent that 'value' was updated (value and input are magically related somehow in vue)
            this.$emit('input', this.valueInternal);
        }
    }

</script>

<style scoped>
</style>



