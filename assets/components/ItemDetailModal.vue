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

        <a :href="'/detail/' + formattedID" @click.prevent="open" :title="title">{{ formattedID }}</a>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ItemDetail from "./ItemDetail.vue";

    @Component({
        components: {ItemDetail},
    })
    export default class ItemDetailModal extends Vue {
        showDialog = false;

        @Prop({required: true})
        formattedID!: string;

        @Prop()
        title!: string;

        @Prop()
        cssClass!: string;

        open() {
            window.history.replaceState({}, "", "/detail/" + this.formattedID);
            this.showDialog = true;
            document.querySelector('body').classList.add('modal-open');
        }

        close() {
            const pageURL = this.$router.currentRoute.fullPath;
            window.history.replaceState({}, "", pageURL);
            this.showDialog = false;
            document.querySelector('body').classList.remove('modal-open');
        }
    }

</script>


<style lang="css" scoped>
</style>



