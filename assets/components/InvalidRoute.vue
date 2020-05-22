<template>
    <div>
        <h3>Page not found</h3>

        <div>
            <p>Show a 404 style page? Or can we get nginx to do it for us?</p>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';

    @Component
    export default class InvalidRoute extends Vue {
    }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>



