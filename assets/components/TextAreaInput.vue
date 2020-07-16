<template>
    <div>
        <md-field>
            <jodit-editor :class="cssClass" :config="config" :buttons="buttons"
                  v-bind:value="syncedValue"
                  v-on:input="$emit('input', $event)"/>
        </md-field>
    </div>
</template>


<script lang="ts">
    import {Component, Vue, PropSync, Prop} from 'vue-property-decorator';

    @Component
    export default class TextAreaInput extends Vue {
        @PropSync("value", {required: true, type: String })
        syncedValue!: string;

        @Prop()
        maxlength!: number;

        @Prop()
        cssClass!: string;

        @Prop()
        placeholder!: string;

        config = {}

        buttons = ["paragraph", "underline" , "italic", "bold", "strikethrough", "|", "ul", "ol", "|", "outdent",
            "indent" , "|", "table", "link"];

        created() {
            this.config = {
                spellcheck: false,
                toolbarSticky: false,
                showXPathInStatusbar: false,
                showWordsCounter: false,
                placeholder: this.placeholder || '',

                // TODO-mrc
                // maxlength: this.maxlength
            }
        }
    };
</script>


<style lang="css">
    .fr-box { width: 100%; }
</style>
