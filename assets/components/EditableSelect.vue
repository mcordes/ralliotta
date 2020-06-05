<template>
    <span>
        <span v-if="isEdit">
            <md-field>
                <md-label>{{ fieldName }}</md-label>
                <md-select v-model="value" name="movie" id="movie">
                    <md-option v-for="option in options" v-bind:value="option.value">{{ option.label ?  option.label : option.value }}</md-option>
                </md-select>
            </md-field>

            <span v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </span>
            <md-button class="md-primary md-raised" @click="submit">Submit</md-button>
            <md-button class="md-raised" @click="cancel">Cancel</md-button>
        </span>
        <span v-else>
            <md-label>{{ fieldName }}</md-label>
            <span v-html="value"></span>
            <md-button class="md-primary md-raised" @click="edit">Edit</md-button>
        </span>
    </span>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {AddUpdateFieldData, updateItem} from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import {Ref} from "../types/Ref";
    import {SelectOption} from "../types/SelectOption";
    import {updateSingleItemAndShowToast} from "../utils/component-util";

    @Component
    export default class EditableSelect extends Vue {
        // Reference to the item this field is part of
        @Prop()
        itemRef!: string;

        @Prop()
        value!: any;

        @Prop()
        options!: SelectOption[];

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
