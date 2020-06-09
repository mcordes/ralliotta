<template>
    <div>
        <div v-if="imageURL">
            <img :src="imageURL">
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {refUtils} from "../utils/rally-util";
    import {Ref} from "../types/Ref";
    import store from "../store";

    @Component
    export default class Avatar extends Vue {
        @Prop()
        user!: Ref;

        @Prop()
        size!: number;

        imageURL = '';

        async created() {
            if (!this.user) {
                return;
            }

            const userObjectId = refUtils.getId(this.user._ref);
            const sessionId = store.getCredentials().sessionId;

            // TODO-mrc: proxy domain
            const size = this.size || 43;
            this.imageURL = `http://localhost:8088/avatar/user/${userObjectId}/session/${sessionId}?size=${size}`;
        }
    }

</script>

<style scoped>
</style>



