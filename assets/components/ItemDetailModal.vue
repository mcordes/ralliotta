<template>
    <div>
        <md-dialog :md-active.sync="showDialog" class="item-detail-modal"
                   v-bind:md-close-on-esc="false"
                   v-bind:md-click-outside-to-close="false">

            <!-- TODO-mrc:
            <md-dialog-title>{{ item.data.FormattedID }} - {{ item.data.Name }}</md-dialog-title>
            -->

            <md-dialog-content>
                <div>
                    <ItemDetail/>
                </div>
            </md-dialog-content>

            <md-dialog-actions>
                <md-button class="md-primary" @click="close()">Close</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import ItemDetail from "./ItemDetail.vue";


    @Component({
        components: {ItemDetail},
    })
    export default class ItemDetailModal extends Vue {
        showDialog = true;

        close() {
            this.showDialog = false;
            const hasHistory = window.history.length > 2;

            if (hasHistory) {
                this.$router.back();
            }
            else {
                this.$router.push('/');
            }
        }
    }

</script>


<style scoped>

</style>



