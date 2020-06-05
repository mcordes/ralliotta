<template>
    <span :title="date | formatDateTime">{{ date | timeSince }}</span>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    @Component({
    })
    export default class TimeSinceDate extends Vue {
        @Prop()
        date!: Date;
    };
</script>


<style lang="css" scoped>
</style>
