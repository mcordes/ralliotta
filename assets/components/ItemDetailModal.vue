<template>
    <div>
        <md-dialog :md-active.sync="showDialog" class="item-detail-modal"
                   v-bind:md-close-on-esc="false"
                   v-bind:md-click-outside-to-close="false">
            <md-dialog-actions>
                <md-button class="md-primary" @click="close()">Close</md-button>
            </md-dialog-actions>

            <md-dialog-content>
                <div :class="cssClass">
                    <ItemDetail v-bind:formattedID="formattedID"/>
                </div>
            </md-dialog-content>
        </md-dialog>

        <a :href="linkPath" @click.exact.prevent="open" @click.ctrl="openNewTab()" @click.meta="openNewTab()" :title="title">{{ formattedID }}</a>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ItemDetail from "./ItemDetail.vue";
    import {getItemDetailURLPath} from "../utils/util";
    import LoadingMessage from "./LoadingMessage.vue";

    @Component({
        components: {ItemDetail},
    })
    export default class ItemDetailModal extends Vue {
        showDialog = false;
        linkPath = "";

        @Prop({required: true})
        formattedID!: string;

        @Prop()
        title!: string;

        @Prop()
        cssClass!: string;

        created() {
            this.linkPath = getItemDetailURLPath(this.formattedID);
        }

        open() {
            window.history.replaceState({}, "", getItemDetailURLPath(this.formattedID));
            this.showDialog = true;
            document.querySelector('body').classList.add('modal-open');
        }

        openNewTab() {
            /* noop */
        }

        close() {
            let pageURL = this.$router.currentRoute.fullPath;
            if (this.$router.mode === 'hash') {
                pageURL = "#" + pageURL;
            }
            window.history.replaceState({}, "", pageURL);
            this.showDialog = false;
            document.querySelector('body').classList.remove('modal-open');
        }
    }

</script>


<style lang="css" scoped>
</style>



