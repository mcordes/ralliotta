<template>
    <div>
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
            <div class="text-read-value" v-html="value"></div>
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
</style>
