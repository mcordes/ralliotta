<template>
    <div>
        <span class="item-field-content-wrapper" v-if="isEdit">
            <md-field class="edit-field md-has-value">
                <label>{{ fieldName }}</label>
                <md-select v-model="value" name="movie" id="movie">
                    <md-option v-for="option in options" v-bind:value="option.value">{{ option.label ?  option.label : option.value }}</md-option>
                </md-select>
            </md-field>

            <span v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </span>

            <md-button class="md-icon-button icon-btn-small md-primary md-raised md-mini" title="Submit" @click="submit">
                <span>&#10004;</span>
            </md-button>
            <md-button class="md-icon-button icon-btn-small md-raised md-mini" title="Cancel" @click="cancel">
                <span>&#10008;</span>
            </md-button>
        </span>
        <span class="item-field-content-wrapper" v-else>
            <md-field class="md-has-value">
                <label>{{ fieldName }}</label>
                <span>{{ label }}</span>
            </md-field>
            <md-button class="md-icon-button md-mini md-raised icon-btn-small" title="Edit" @click="edit">
                <span>&#9998;</span>
            </md-button>
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
        item!: Ref;

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
            this.value = await updateSingleItemAndShowToast(this.fieldName, this.value, this.item._ref)
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
