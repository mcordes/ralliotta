<template>
    <div>
        <ItemList v-bind:showMyItemsOnly="true" v-bind:heading="'My Items'"/>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import ItemList from "./ItemList.vue";

    @Component({
        components: {ItemList},
    })
    export default class MyItems extends Vue {
    };

</script>


<style scoped>
</style>
