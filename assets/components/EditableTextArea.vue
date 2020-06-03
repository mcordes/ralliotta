<template>
    <div>
        <div v-if="isEdit">
            <!-- TODO-mrc: use md-textarea and limit size -->
            <md-field>
                <md-textarea v-model="value" required/>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>
            <md-button class="md-primary" @click="submit">Submit</md-button>
            <md-button class="md-primary" @click="cancel">Cancel</md-button>
        </div>
        <div v-else>
            <div>{{ value }}</div>

            <md-button class="md-primary" @click="edit">Edit</md-button>
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop, PropSync} from 'vue-property-decorator';
    import store from "../store";
    import {AddUpdateFieldData, updateItem} from "../rally-util";
    import {showErrorToast, showSuccessToast} from "../util";

    @Component
    export default class Comment extends Vue {
        // Reference to the item this field is part of
        @Prop()
        itemRef!: string;

        // TODO-mrc: I think this needs to be a prop-sync b/c we're going to mutate it
        @Prop()
        value!: any;

        @Prop()
        fieldName!: string;

        sharedState = store.state;
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


<style lang="css" scoped>
</style>
