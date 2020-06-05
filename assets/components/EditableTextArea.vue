<template>
    <div class="item-description-wrapper">
        <div v-if="isEdit">
            <md-field>
                <!-- <md-textarea v-model="value" required/> -->
                <froala :tag="'textarea'" :config="config" v-model="value" required></froala>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>
            <md-button class="md-primary md-raised" @click="submit">Submit</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </div>
        <div v-else>
            <div class="item-description-read" v-html="value"></div>
            <md-button class="md-primary md-raised" @click="edit">Edit</md-button>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {AddUpdateFieldData, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    // @ts-ignore
    import VueFroala from 'vue-froala-wysiwyg';
    import {updateSingleItemAndShowToast} from "../utils/component-util";

    @Component
    export default class Comment extends Vue {
        // Reference to the item this field is part of
        @Prop()
        itemRef!: string;

        @Prop()
        value!: any;

        @Prop()
        fieldName!: string;
        errorMessage = '';
        isEdit = false;

        async submit() {
            this.errorMessage = '';
            this.value = await updateSingleItemAndShowToast(this.fieldName, this.value, this.itemRef)
            this.isEdit = false;
        }

        edit() {
            this.isEdit = true;
        }

        cancel() {
            this.isEdit = false;
        }
    };
</script>


<style lang="css">
    .item-description-wrapper { width: calc(80% - 20px); }
    .item-description-read {
        background: #FFF;
        border: 1px solid #e4e4e4;
        border-radius: 6px;
        padding: 10px 20px;
    }
    .fr-box #logo { display: none; }
</style>
