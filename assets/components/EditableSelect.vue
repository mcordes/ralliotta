<template>
    <div>
        <span v-if="isEdit">
            <md-field>
                <label>{{ fieldName }}</label>
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
            <md-field>
                <label>{{ fieldName }}</label>
                <span>{{ label }}</span>
            </md-field>
            <md-button class="md-primary md-raised" @click="edit">Edit</md-button>
        </span>
    </div>
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
        label = '';

        created() {
            const option = this.options.find(o => o.value === this.value);
            if (option) {
                this.label = option.label ? option.label : option.value;
            }
        }

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
