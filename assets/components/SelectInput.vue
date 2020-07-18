<template>
    <div>
        <md-autocomplete v-model="internalValue"
                :md-options="stringOptions"
                @md-changed="search" @md-opened="search"
                @md-selected="setSyncedValue">

            <!-- TODO-mrc; debounce? 300 ms or so? -->

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
        syncedSelectedValue!: string;

        @PropSync("selectedLabel", {default: ""})
        syncedSelectedLabel!: string;

        @Prop()
        searchFunc!: (s: string) => SelectOption[];

        @Prop()
        label!: string;

        @Prop()
        cssClass!: string;

        stringOptions: string[] | Promise<string[]> = [];
        internalValue = "";

        @Watch("internalValue")
        onInternalValueChanged(to: any, from: any) {
            // NOTE: if we've unselected, then make sure the caller knows about it.
            // See 'setSyncedValue' for where we set these when a value is selected.
            if (!to) {
                this.syncedSelectedLabel = "";
                this.syncedSelectedValue = "";
            }
        }

        created() {
            // TODO-mrc
            this.internalValue = this.syncedSelectedLabel + "|" + this.syncedSelectedValue;
        }

        async search(search: string) {
            this.stringOptions = new Promise(async resolve => {
                const results: string[] = this.flattenSelectOptions(await this.searchFunc(search));

                // If there's an exact match, let's put (a copy of) it at the top of the results
                if (search && results.length > 1) {
                    const searchLower = search.toLowerCase();
                    const exactMatchIndex = results.findIndex(r => {
                        return r.toLowerCase().startsWith(searchLower)
                    });
                    if (exactMatchIndex !== -1) {
                        const exactMatch = results[exactMatchIndex];
                        results.unshift(exactMatch);
                    }
                }

                resolve(results);
            })
        }

        flattenSelectOptions(options: SelectOption[]) {
            return options.map(o => {
                return `${o.label}|${o.value}`;
            });
        }

        setSyncedValue(selected: string | undefined) {
            console.log("AAAA setting synced value" + selected);

            this.syncedSelectedLabel = selected ? this.getLabelFromLabelAndValue(selected) : "";
            this.syncedSelectedValue = selected ? this.getValueFromLabelAndValue(selected) : "";
        }

        getLabelFromLabelAndValue(s: string) {
            return s.split("|")[0];
        }

        getValueFromLabelAndValue(s: string) {
            return s.split("|")[1];
        }
    };

</script>


<style scoped>
</style>