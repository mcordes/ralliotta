<template>
    <div>
        <div v-if="imageURL">
            <img :src="imageURL">
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {Ref} from "../types/Ref";
    import {getService} from "../services/init";

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

            this.imageURL = getService().getAvatarImageURL(this.user, this.size);
        }
    }

</script>

<style scoped>
</style>



