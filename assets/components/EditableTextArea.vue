<template>
    <div>
        <div v-if="isEdit">
            <div>
                <TextAreaInput v-model="value" />
            </div>

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
    import {toStringOrBlank} from "../utils/util";
    import {updateSingleItemAndShowToast} from "../utils/component-util";
    import {Ref} from "../types/Ref";
    import TextAreaInput from "./TextAreaInput.vue";

    @Component({
        components: {TextAreaInput}
    })
    export default class EditableTextArea extends Vue {
        errorMessage = '';
        isEdit = false;
        value = '';

        // Reference to the item this field is part of
        @Prop()
        item!: Ref;

        @Prop()
        initialValue!: any;

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
</style>
