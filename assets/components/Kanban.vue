<template>
    <div>
        Kanban
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';

    @Component
    export default class Kanban extends Vue {

        async created() {
            // TODO-mrc: get current sprint
            // TODO-mrc: optionally get future sprints
            // TODO-mrc: get backlog
        }
    }

</script>

<style scoped>
</style>



