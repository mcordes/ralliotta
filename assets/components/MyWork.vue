<template>
    <div>
        <ItemList v-bind:showMyItemsOnly="true"
                  v-bind:heading="'My work'"
                  v-bind:showProject="true"
                  v-bind:initialProjectNone="true"/>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import ItemList from "./ItemList.vue";

    @Component({
        components: {ItemList},
    })
    export default class MyWork extends Vue {
    };

</script>


<style scoped>
</style>
