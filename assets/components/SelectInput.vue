<template>
    <div>
        <md-autocomplete v-model="internalValue"
                :md-options="options"
                @md-changed="search" @md-opened="search"
                @md-selected="setSyncedValue"
                :disabled="disabled">

            <label>{{ label }}</label>
            <template slot="md-autocomplete-item" slot-scope="{ item }">{{ getLabelFromLabelAndValue(item) }}</template>
            <template slot="md-autocomplete-empty" slot-scope="{ term }">{{ term ? "No results found": ""}}</template>
        </md-autocomplete>
    </div>
</template>


<script lang="ts">
    import {Component, Prop, PropSync, Vue, Watch} from "vue-property-decorator";
    import {SelectOption} from "../types/SelectOption";

    @Component({
        components: {},
    })
    export default class SelectInput extends Vue {
        @PropSync("selectedValue", {required: true})
        syncedSelectedValue!: string | undefined;

        @PropSync("selectedLabel", {default: ""})
        syncedSelectedLabel!: string | undefined;

        @Prop()
        searchFunc!: (s: string) => SelectOption[];

        @Prop()
        label!: string;

        @Prop()
        cssClass!: string;

        @Prop({default: false})
        disabled!: boolean;

        options: SelectOption[] | Promise<SelectOption[]> = [];
        internalValue: SelectOption | null = null;

        @Watch("internalValue")
        onInternalValueChanged(to: SelectOption, from: any) {
            // NOTE: if we've unselected, then make sure the caller knows about it.
            // See 'setSyncedValue' for where we set these when a value is selected.
            if (!to || !to.value) {
                this.syncedSelectedLabel = "";
                this.syncedSelectedValue = "";
            }
        }

        created() {
            if (this.syncedSelectedValue) {
                this.internalValue = this.hackSelectOption({label: this.syncedSelectedLabel, value: this.syncedSelectedValue });
            }
        }

        async search(searchObj: SelectOption | string) {
            const search = typeof searchObj === "string" ? searchObj : searchObj?.label ?? "";

            this.options = new Promise(async resolve => {
                const results: SelectOption[] = (await this.searchFunc(search)).map(v => this.hackSelectOption(v));

                // If there's an exact match, let's put (a copy of) it at the top of the results
                if (search && results.length > 1) {
                    const searchLower = search.toLowerCase();
                    const exactMatchIndex = results.findIndex(r => {
                        return r.label?.toLowerCase().startsWith(searchLower)
                    });
                    if (exactMatchIndex !== -1) {
                        const exactMatch = results[exactMatchIndex];
                        results.unshift(exactMatch);
                    }
                }

                resolve(results);
            })
        }

        setSyncedValue(selected: SelectOption) {
            this.syncedSelectedLabel = selected ? this.getLabelFromLabelAndValue(selected) : "";
            this.syncedSelectedValue = selected ? this.getValueFromLabelAndValue(selected) : "";
        }

        getLabelFromLabelAndValue(s: SelectOption) {
            return s ? s.label : "";
        }

        getValueFromLabelAndValue(s: SelectOption) {
            return s.value;
        }

        // NOTE: vuematerial's autocomplete only handles a single value so we're
        // hacking making an object look enough like a string to make get this work
        // See: https://github.com/vuematerial/vue-material/issues/1243
        hackSelectOption(option: SelectOption): SelectOption {
            const optionAny: any = option;
            optionAny.toLowerCase = () => {
                return option.label;
            };
            optionAny.toString = () => {
                return option.label;
            }
            return optionAny;
        }
    };

</script>


<style scoped>
</style>
