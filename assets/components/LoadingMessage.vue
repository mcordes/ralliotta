<template>
    <div id="loading-message">
        Loading...
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';

    @Component
    export default class LoadingMessage extends Vue {
    }
</script>


<style lang="css" scoped>
    #loading-message {
        margin-top: 20px;
        text-align: center;
    }
</style>
