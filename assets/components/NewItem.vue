<template>
    <div>
        <h2>Create new {{ itemType === 'defect' ? 'defect' : 'story' }}</h2>

        <div>
            <md-field class="radio-field-wrapper">
                <label>Type</label>
                <md-radio value="hierarchicalrequirement" v-model="itemType" class="md-primary">Story</md-radio>
                <md-radio value="defect" v-model="itemType" class="md-secondary">Defect</md-radio>
            </md-field>

            <md-field>
                <label>Title</label>
                <md-input id="title" type="text" v-model="title"/>
            </md-field>

            <div>
                <div>Description</div>
                <TextAreaInput v-model="description"/>
            </div>

            <div>
                <RefSelectInput v-bind:itemType="'project'" v-bind:label="'Project'" v-bind:selectedRef.sync="project"/>
            </div>
            <div>
                <RefSelectInput v-bind:itemType="'release'" v-bind:label="'Release'" v-bind:selectedRef.sync="release"
                                v-bind:project="project" v-bind:disabled="!project"/>
            </div>

            <div>
                <RefSelectInput v-bind:itemType="'epic'" v-bind:label="'Epic'" v-bind:selectedRef.sync="epic"
                                v-bind:project="project" v-bind:disabled="!project"/>
            </div>

            <md-field>
                <md-button class="md-primary md-raised" @click="submit">Save</md-button>
                <md-button class="md-secondary" @click="clearForm">Clear</md-button>
            </md-field>

            <div v-if="errorMessage" class="errorMessage">
                {{ errorMessage }}
            </div>


            <!-- modal success message -->
            <div>
                <md-dialog-confirm
                    :md-active.sync="showSuccessMessage"
                    :md-title="'Created!'"
                    :md-content="'Created item <a href=\'' + createItemDetailURLPath + '\' target=\'_blank\' title=\'click to open in new window\'>' + createdItemFormattedID + '</a>'"
                    md-confirm-text="View"
                    md-cancel-text="Ok"
                    @md-cancel="clearForm"
                    @md-confirm="gotoItem" />
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, Watch} from "vue-property-decorator";
    import {getItemDetailURLPath, showErrorToast, showSuccessToast} from "../utils/util";
    import SelectInput from "./SelectInput.vue";
    import {SelectOption} from "../types/SelectOption";
    import store from "../store";
    import TextAreaInput from "./TextAreaInput.vue";
    import RefSelectInput from "./RefSelectInput.vue";
    import {AddUpdateFieldData} from "../services/service";
    import {getService} from "../services/init";

    @Component({
        components: {TextAreaInput, RefSelectInput},
    })
    export default class NewItem extends Vue {
        errorMessage = '';
        itemType: "hierarchicalrequirement" | "defect" = "hierarchicalrequirement";
        title = "";
        description = "";
        release = "";
        project = "";
        createdItemFormattedID = "";
        createItemDetailURLPath = "";
        showSuccessMessage = false;
        epic = "";

        async created() {
            const user = store.getUser();
            this.project = user.DefaultProject._ref;
        }

        async submit() {
            this.errorMessage = '';

            const data: AddUpdateFieldData = {
                'Name': this.title,
                'Description': this.description,
                'Release': this.release,
                'Parent': this.epic
            };

            if (!this.title || !this.description) {
                this.errorMessage = "Please enter title and description."
                return;
            }

            let result;
            try {
                result = await getService().createItem(this.itemType, data);
                this.createdItemFormattedID = result.FormattedID;
                this.createItemDetailURLPath = getItemDetailURLPath(this.createdItemFormattedID);
                this.showSuccessMessage = true;

                showSuccessToast("Saved.");
            }
            catch(e) {
                showErrorToast();
            }
        }

        async gotoItem() {
            await this.$router.push(`/detail/${this.createdItemFormattedID}`);
        }

        clearForm() {
            this.title = "";
            this.description = "";
            this.createdItemFormattedID = "";
            this.showSuccessMessage = false;

            // TODO: these don't get reset. Why?
            this.epic = '';
            this.release = "";

            const user = store.getUser();
            this.project = user.DefaultProject._ref;
        }

        @Watch("description")
        descriptionChanged() {
            console.log("description changed - " + this.description);
        }
    };

</script>


<style scoped>
</style>
