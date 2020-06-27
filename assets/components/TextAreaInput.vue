<template>
    <div>
        <md-field>
            <froala :tag="'textarea'" :config="config" v-model="modelValue" required :class="cssClass"></froala>
        </md-field>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, PropSync, Prop} from 'vue-property-decorator';
    // @ts-ignore
    import VueFroala from 'vue-froala-wysiwyg';

    @Component
    export default class TextAreaInput extends Vue {
        @PropSync("value")
        modelValue!: string;

        // TODO-mrc: include all 3 of these in the html above, but what options does froala have?
        @Prop()
        maxlength = null;

        @Prop()
        cssClass!: string;

        @Prop()
        placeholder!: string;

        config = {}

        created() {
            this.config = {
                placeholderText: this.placeholder || '',
            }
        }
    };
</script>


<style lang="css">
    .fr-box { width: 100%; }
</style>
