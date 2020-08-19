<template>
    <span :title="date | formatDateTime">{{ formattedTime }}</span>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {toDateTime} from "../utils/util";

    // @ts-ignore
    import TimeAgo from 'javascript-time-ago';

    // @ts-ignore
    import en from 'javascript-time-ago/locale/en';

    @Component({
    })
    export default class TimeSinceDate extends Vue {
        formattedTime = '';
        intervalId: number | null = null;

        @Prop()
        date!: Date;

        created() {
            this.setFormattedTime();
            this.intervalId = setInterval(this.setFormattedTime, 60 * 1000);
        }

        destroyed() {
            if(this.intervalId) {
                clearInterval(this.intervalId);
            }
        }

        setFormattedTime() {
            console.log("updating time since date");
            const date = toDateTime(this.date).toJSDate();
            TimeAgo.addLocale(en);
            const timeAgo = new TimeAgo('en-US');
            this.formattedTime = timeAgo.format(date);
        }
    }
</script>


<style lang="css" scoped>
</style>
