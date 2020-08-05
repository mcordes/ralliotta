<template>
    <div>
        <ItemList v-bind:backlogOnly="true"
                  v-bind:initialProject="initialProject"
                  v-bind:collapseSearchFilters="true"
        />
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Prop} from "vue-property-decorator";
    import ItemList from "./ItemList.vue";
    import {Ref} from "../types/Ref";
    import {Iteration} from "../types/Iteration";

    @Component({components: {ItemList}})
    export default class Backlog extends Vue {
        @Prop()
        initialProject!: string | Ref;
    };

</script>


<style scoped>
</style>
