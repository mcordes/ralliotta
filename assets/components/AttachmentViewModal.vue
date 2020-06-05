<template>
    <md-dialog :md-active.sync="show">
        <md-dialog-title>View attachment - {{ attachment.Name }}</md-dialog-title>

        <!-- TODO-mrc: what if it's not an image? -->
        <div>
            <img :src="attachmentContent">
        </div>

        <md-dialog-actions>
            <md-button class="md-primary md-raised" @click="close">Close</md-button>
        </md-dialog-actions>

    </md-dialog>
</template>



<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {Attachment} from "../types/Attachment";

    @Component
    export default class LoginModal extends Vue {
        @Prop()
        attachmentContent!: string;

        @Prop()
        attachment!: Attachment;

        show = true;

        async close() {
            this.show = false;
        }
    };
</script>


<style lang="css">
</style>
