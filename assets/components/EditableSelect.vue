<template>
    <div>
        <span class="item-field-content-wrapper" v-if="isEdit">
            <md-field class="edit-field md-has-value">
                <label>{{ fieldName }}</label>
                <md-select v-model.sync="value">
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
                <span>{{ selectedOptionLabel }}</span>
            </md-field>
            <md-button class="md-icon-button md-mini md-raised icon-btn-small" title="Edit" @click="edit">
                <span>&#9998;</span>
            </md-button>
        </span>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {Ref} from "../types/Ref";
    import {SelectOption} from "../types/SelectOption";
    import {updateSingleItemAndShowToast} from "../utils/component-util";
    import {toStringOrBlank} from "../utils/util";

    @Component
    export default class EditableSelect extends Vue {
        // Reference to the item this field is part of
        @Prop()
        item!: Ref;

        @Prop()
        initialValue!: string | Ref | null;

        @Prop()
        options!: SelectOption[];

        @Prop()
        fieldName!: string;

        @Prop()
        noBlankOption!: boolean;

        @Prop()
        blankOptionLabel!: string;

        errorMessage = '';
        isEdit = false;
        selectedOptionLabel = '';
        value = "";

        updateSelectedOptionLabel() {
            const selectedOption = this.options.find(o => o.value === this.value);
            if (selectedOption) {
                this.selectedOptionLabel = selectedOption.label ? selectedOption.label : selectedOption.value;
            }
        }

        created() {
            this.value = this.isRef(this.initialValue) ? (this.initialValue as Ref)._ref : toStringOrBlank(this.initialValue);
            this.updateSelectedOptionLabel();

            if (!this.noBlankOption) {
                const label = this.blankOptionLabel ? this.blankOptionLabel : "-- No value --";
                this.options.unshift({label, value: ""})
            }
        }

        async submit() {
            this.errorMessage = '';
            await updateSingleItemAndShowToast(this.fieldName, this.value, this.item._ref);
            this.updateSelectedOptionLabel();
            this.isEdit = false;
        }

        edit() {
            this.isEdit = true;
        }

        cancel() {
            this.isEdit = false;
        }

        // TODO-mrc: is there a better way to test that an object matches an interface?
        isRef(obj: any) {
            return obj && typeof(obj) == 'object' && '_ref' in obj;
        }
    };
</script>


<style lang="css">
</style>
