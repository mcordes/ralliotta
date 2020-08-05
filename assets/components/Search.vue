<template>
    <div>
        <ItemList v-bind:heading="'Search'"/>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import ItemList from "./ItemList.vue";

    @Component({
        components: {ItemList},
    })
    export default class Search extends Vue {
    };

</script>


<style scoped>
</style>
