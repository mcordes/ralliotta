<template>
    <div class="attachment">
        <div class="attachment-header">
            <div class="attachment-date">
                <TimeSinceDate v-bind:date="attachment.CreationDate"/>
            </div>
            <div class="attachment-author">
                <div class="avatar-wrapper" v-if="attachment.User">
                    <Avatar v-bind:user="attachment.User" v-bind:size="30"/>
                </div>
                {{ activity.userName }} added an attachment
            </div>
        </div>
        <div class="attachment-details">
            <!-- TODO-mrc: What if it's a PDF or something? Check the content type -->
            <!-- TODO-mrc:shrink to preview -->
            <div v-if="attachmentContent">
                <img :src="attachmentContent" @click="toggleViewFullImage()" title="Click to view larger image">
            </div>
        </div>

        <div v-if="viewFullImage">
            <AttachmentViewModal v-bind:attachment="attachment" v-bind:attachment-content="attachmentContent"/>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {ActivityItem, fetchAttachmentContent} from "../utils/activity-util";
    import {Attachment} from "../types/Attachment";
    import AttachmentViewModal from "./AttachmentViewModal.vue";
    import TimeSinceDate from "./TimeSinceDate.vue";
    import Avatar from "./Avatar.vue";
    @Component({
        components: {AttachmentViewModal, TimeSinceDate, Avatar}
    })
    export default class AttachmentSummary extends Vue {
        @Prop()
        activity!: ActivityItem;

        attachment!: Attachment;
        attachmentContent = '';
        viewFullImage = false;

        async created() {
            this.attachment = this.activity.data;

            // TODO-mrc: error handling
            this.attachmentContent = await fetchAttachmentContent(this.attachment);
        }

        toggleViewFullImage() {
            this.viewFullImage = !this.viewFullImage;
        }
    };
</script>


<style lang="css" scoped>
</style>
