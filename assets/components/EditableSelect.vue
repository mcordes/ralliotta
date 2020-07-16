<template>
    <div>
        <span class="item-field-content-wrapper editing-select-wrapper" v-if="isEdit">
            <div class="select-buttons-wrapper">
                <md-button class="icon-btn-small md-primary md-raised md-mini" title="Submit" @click="submit">
                    <span>&#10004;</span>
                </md-button>
                <md-button class="icon-btn-small md-raised md-mini" title="Cancel" @click="cancel">
                    <span>&#10008;</span>
                </md-button>
            </div>

            <div class="select-wrapper">
                <SelectInput v-bind:searchFunc="searchFunc" v-bind:label="fieldName" v-model="value" v-bind:cssClass="'edit-field md-has-value'"/>
                <span v-if="errorMessage" class="errorMessage">
                    {{ errorMessage }}
                </span>
            </div>
        </span>
        <span class="item-field-content-wrapper" v-else>
            <md-field class="md-has-value">
                <label>{{ fieldName }}</label>
                <span v-if="selectedOptionLabel">{{ selectedOptionLabel }}</span>
                <span v-else>&ndash; No Selection &ndash;</span>
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
    import SelectInput from "./SelectInput.vue";

    @Component({
        components: {SelectInput}
    })
    export default class EditableSelect extends Vue {
        // Reference to the item this field is part of
        @Prop()
        item!: Ref;

        @Prop()
        initialValue!: Ref | null;

        @Prop()
        searchFunc!: (s: string) => SelectOption[];

        @Prop()
        fieldName!: string;

        // TODO-mrc
        @Prop()
        noBlankOption!: boolean;

        @Prop()
        blankOptionLabel!: string;

        errorMessage = '';
        isEdit = false;
        selectedOptionLabel = '';
        value = "";
        oldValue = "";

        updateSelectedOptionLabel() {
            // TODO-mrc:
            this.selectedOptionLabel = this.value ? this.value.split("|")[0] : "";
        }

        created() {
            if (this.initialValue) {
                this.value = this.initialValue._refObjectName + "|" + this.initialValue._ref;
            }

            this.updateSelectedOptionLabel();
        }

        async submit() {
            this.errorMessage = '';
            await updateSingleItemAndShowToast(this.fieldName, this.value, this.item._ref);
            this.updateSelectedOptionLabel();
            this.isEdit = false;
        }

        edit() {
            this.isEdit = true;
            this.oldValue = this.value;
        }

        cancel() {
            this.isEdit = false;
            this.value = this.oldValue;
            this.oldValue = "";
        }
    };
</script>


<style lang="css">
</style>
