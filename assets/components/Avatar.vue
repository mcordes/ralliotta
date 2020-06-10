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

    // @ts-ignore
    import config from "../config.json";

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
            const size = this.size || 43;
            this.imageURL = `${config.avatarURL}?oid=${userObjectId}&sid=${sessionId}&size=${size}`;
        }
    }

</script>

<style scoped>
</style>



