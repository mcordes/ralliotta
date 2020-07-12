<template>
    <div>
        <h2>Create new {{ itemType === 'defect' ? 'defect' : 'story' }}</h2>

        <div>
            <md-field class="radio-field-wrapper">
                <label>Type</label>
                <md-radio value="hierarchicalRequest" v-model="itemType" class="md-primary">Story</md-radio>
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
                <SelectInput v-bind:searchFunc="searchProjectList" v-bind:label="'Project'" v-model="projectLabelAndValue"/>
            </div>
            <div>
                <SelectInput v-bind:searchFunc="searchReleaseList" v-bind:label="'Release'" v-model="releaseLabelAndValue"/>
            </div>

            <div>
                <SelectInput v-bind:searchFunc="searchEpicList" v-bind:label="'Epic'" v-model="epicLabelAndValue"/>
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
                    :md-content="'Created item <a href=\'/detail/' + createdItemFormattedID + '\' target=\'_blank\' title=\'click to open in new window\'>' + createdItemFormattedID + '</a>'"
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
    import {
        AddUpdateFieldData,
        createItem,
        getSelectOptionsFromRefs,
        searchEpics, searchProjects, searchReleases
    } from "../utils/rally-util";
    import {showErrorToast, showSuccessToast} from "../utils/util";
    import SelectInput from "./SelectInput.vue";
    import {SelectOption} from "../types/SelectOption";
    import store from "../store";
    import TextAreaInput from "./TextAreaInput.vue";

    @Component({
        components: {TextAreaInput, SelectInput},
    })
    export default class NewItem extends Vue {
        errorMessage = '';
        itemType: "hierarchicalRequest" | "defect" = "hierarchicalRequest";
        title = "";
        description = "";
        releaseLabelAndValue = "";
        projectLabelAndValue = "";
        createdItemFormattedID = "";
        showSuccessMessage = false;
        epicLabelAndValue = "";

        async created() {
            const user = store.getUser();
            this.projectLabelAndValue = user.DefaultProject._refObjectName + "|" + user.DefaultProject._ref;
        }

        async submit() {
            this.errorMessage = '';

            const data: AddUpdateFieldData = {
                'Name': this.title,
                'Description': this.description,
                // TODO-mrc:
                'Release': this.releaseLabelAndValue ? this.releaseLabelAndValue[0] : null,
                'Parent': this.epicLabelAndValue ? this.epicLabelAndValue[0] : null
            };

            if (!this.title || !this.description) {
                this.errorMessage = "Please enter title and description."
                return;
            }

            let result;
            try {
                result = await createItem(this.itemType, data);
                this.createdItemFormattedID = result.FormattedID;
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
            this.releaseLabelAndValue = "";
            this.createdItemFormattedID = "";
            this.showSuccessMessage = false;
            this.epicLabelAndValue = '';

            const user = store.getUser();
            this.projectLabelAndValue = user.DefaultProject._refObjectName + "|" + user.DefaultProject._ref;
        }

        @Watch("description")
        descriptionChanged() {
            console.log("description changed - " + this.description);
        }

        async searchEpicList(search: string) {
            const projectValue = this.projectLabelAndValue.split("|")[1];

            const epics = await searchEpics(projectValue, search);
            return epics.map(r => {
                return {
                    value: r._ref,
                    label: r.FormattedID + ": " + r.Name,
                }
            });
        }

        async searchProjectList(search: string) {
            return await getSelectOptionsFromRefs(await searchProjects(search));
        }

        async searchReleaseList(search: string) {
            // TODO-mrc: fixme
            const projectValue = this.projectLabelAndValue.split("|")[1];
            return await getSelectOptionsFromRefs(await searchReleases(projectValue, search));
        }

    };


</script>


<style scoped>
</style>
