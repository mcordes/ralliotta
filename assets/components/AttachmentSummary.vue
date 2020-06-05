<template>
    <div class="attachment">
        <div class="attachment-header">
            <div class="attachment-date">
                {{ data.CreationDate | formatDateTime }}
            </div>
            <div class="attachment-author">
                {{ authorName }} added an attachment
            </div>
        </div>
        <div class="attachment-details">
            <!-- TODO-mrc: What if it's a PDF or something? Check the content type -->
            <!-- TODO-mrc:shrink to preview -->
            <!-- TODO-mc: click to view full sized attachment -->
            <div v-if="attachmentContent">
                <img :src="attachmentContent" @click="toggleViewFullImage()" title="Click to larger image">
            </div>
        </div>

        <div v-if="viewFullImage">
            <AttachmentViewModal v-bind:attachment="data" v-bind:attachment-content="attachmentContent"/>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {getDataFromReference} from "../utils/rally-util";
    import {fetchAttachmentContent} from "../utils/activity-util";
    import {Attachment} from "../types/Attachment";
    import AttachmentViewModal from "./AttachmentViewModal.vue";
    @Component({
        components: {AttachmentViewModal}
    })
    export default class AttachmentSummary extends Vue {
        @Prop()
        data!: Attachment;

        authorName = '';
        attachmentContent = '';
        viewFullImage = false;

        async created() {
            this.authorName = getDataFromReference(this.data.User).name;

            // TODO-mrc: error handling
            this.attachmentContent = await fetchAttachmentContent(this.data);
        }

        toggleViewFullImage() {
            this.viewFullImage = !this.viewFullImage;
        }
    };
</script>


<style lang="css" scoped>

    /*
        TODO-mrc: maybe combine this with the styling in Revision?
    */
    .attachment {
        background: #FFF;
        border-radius: 6px;
        border: 1px solid #DEDEDE;
        color: #555;
        margin-bottom: 10px;
        max-width: 800px;
        padding: 6px 8px;
        position: relative;
        transition: all 0.15s ease;
    }

    .attachment:hover {
        background: #F9F9F9;
        border: 1px solid #CCC;
        color: #222;
    }

    .attachment:hover .attachment-header {
        background: #E8E8E8;
    }

    .attachment:after {
        background: #CCC;
        bottom: -11px;
        content: '';
        height: 10px;
        left: 10px;
        position: absolute;
        width: 2px;
    }

    .attachment-header {
        border-bottom: 1px solid #E4E4E4;
        margin: -6px -8px 5px;
        padding: 2px 8px;
        transition: all 0.15s ease;
    }

    .attachment-date {
        border-right: 1px solid #CCC;
        display: inline-block;
        font-weight: 600;
        padding-right: 12px;
    }

    .attachment-author {
        display: inline-block;
        padding-left: 10px;
    }
</style>
