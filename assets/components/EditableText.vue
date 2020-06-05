<template>
    <span>
        <span v-if="isEdit">
            <md-field>
                <md-input type="text" v-model="value"/>
            </md-field>

            <span v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </span>
            <md-button class="md-primary md-raised" @click="submit">Submit</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </span>
        <span v-else>
            <span v-html="value"></span>
            <md-button class="md-primary md-raised" @click="edit">Edit</md-button>
        </span>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {AddUpdateFieldData, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";

    @Component
    export default class EditableText extends Vue {
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

            const data: AddUpdateFieldData = {};
            data[this.fieldName] = this.value;

            try {
                const result = await updateItem(this.itemRef, data)
                this.value = result[this.fieldName];
                showSuccessToast("Saved.");
            }
            catch (e) {
                showErrorToast({e});
            }

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
