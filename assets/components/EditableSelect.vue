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
                <SelectInput v-bind:searchFunc="searchFunc" v-bind:label="fieldName" v-bind:cssClass="'edit-field md-has-value'"
                    v-bind:selectedValue.sync="selectedValue" v-bind:selectedLabel.sync="selectedLabel"/>
                <span v-if="errorMessage" class="errorMessage">
                    {{ errorMessage }}
                </span>
            </div>
        </span>
        <span class="item-field-content-wrapper" v-else>
            <md-field class="md-has-value">
                <label>{{ fieldName }}</label>
                <span v-if="selectedLabel">{{ selectedLabel }}</span>
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
        selectedValue = "";
        selectedLabel = "";
        oldValue = "";
        oldLabel = "";

        created() {
            if (this.initialValue) {
                this.selectedLabel = this.initialValue._refObjectName;
                this.selectedValue = this.initialValue._ref;
            }
        }

        async submit() {
            this.errorMessage = '';
            await updateSingleItemAndShowToast(this.fieldName, this.selectedValue, this.item._ref);
            this.isEdit = false;
        }

        edit() {
            this.isEdit = true;
            this.oldValue = this.selectedValue;
            this.oldLabel = this.selectedLabel;
        }

        cancel() {
            this.isEdit = false;
            this.selectedValue = this.oldValue;
            this.selectedLabel = this.oldLabel;
            this.oldValue = "";
            this.oldLabel = "";
        }
    };
</script>


<style lang="css">
</style>
