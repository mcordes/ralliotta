<template>
    <div>
        <md-field>
             <froala :tag="'textarea'" :config="config"
                    v-bind:value="syncedValue"
                    v-on:input="$emit('input', $event)"
                    required :class="cssClass"></froala>
        </md-field>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, PropSync, Prop} from 'vue-property-decorator';
    // @ts-ignore
    import VueFroala from 'vue-froala-wysiwyg';

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

        config = {
        }

        created() {
            this.config = {
                placeholderText: this.placeholder || '',
                charCounterCount: true,
                maxlength: this.maxlength
            }
        }
    };
</script>


<style lang="css">
    .fr-box { width: 100%; }
</style>
