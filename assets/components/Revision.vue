<template>
    <div class="revision">
        {{ authorName }} made a change @ {{ data.CreationDate | formatDateTime }}
        <div>
            {{ data.Description }}
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {getDataFromReference} from "../rally-util";

    @Component
    export default class Revision extends Vue {
        @Prop()
        data: any;

        sharedState = store.state;
        authorName = '';

        created() {
            this.authorName = getDataFromReference(this.data.User).name;
        }
    };
</script>


<style lang="css" scoped>
    .revision { margin-bottom: 10px }
</style>
