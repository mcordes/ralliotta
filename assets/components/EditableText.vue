<template>
    <span>
        <span v-if="isEdit">
            <md-field class="edit-field no-label">
                <md-input type="text" v-model="value"/>
            </md-field>

            <span v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </span>

            <md-button style="margin-top: -3px;" class="md-icon-button icon-btn-small md-primary md-raised md-mini" title="Submit" @click="submit">
                <span>&#10004;</span>
            </md-button>
            <md-button style="margin-top: -3px;" class="md-icon-button icon-btn-small md-raised md-mini" title="Cancel" @click="cancel">
                <span>&#10008;</span>
            </md-button>
        </span>
        <span v-else>
            <span v-html="value"></span>
            <md-button style="margin-top: -3px;" class="md-icon-button md-mini icon-btn-small" title="Edit" @click="edit">
                <span>&#9998;</span>
            </md-button>
        </span>
    </span>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import {showErrorToast, showSuccessToast, toStringOrBlank} from "../utils/util";
    import {updateSingleItemAndShowToast} from "../utils/component-util";
    import {Ref} from "../types/Ref";

    @Component
    export default class EditableText extends Vue {
        errorMessage = '';
        isEdit = false;
        value = "";

        // Reference to the item this field is part of
        @Prop()
        item!: Ref;

        @Prop()
        initialValue!: string;

        @Prop()
        fieldName!: string;

        @Prop({default: null})
        onChange!: () => void | undefined;


        created() {
            this.value = toStringOrBlank(this.initialValue);
        }

        async submit() {
            this.errorMessage = '';
            this.value = await updateSingleItemAndShowToast(this.fieldName, this.value, this.item._ref)
            this.isEdit = false;

            if (this.onChange) {
                this.onChange();
            }
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
    .edit-field.no-label {
        float: left;
        margin: 0;
        max-width: 500px;
        min-height: auto;
        padding: 0 0 3px;
    }

    .edit-field .md-input {
        height: 22px;
        margin: 0 10px;
    }
</style>
