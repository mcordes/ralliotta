<template>
    <div class="revision">
        <div class="revision-header">
            <div class="revision-date">
                {{ data.CreationDate | formatDateTime }}
            </div>
            <div class="revision-author">
                {{ authorName }} made a change
            </div>
        </div>
        <div class="revision-details">
            {{ data.Description }}
        </div>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {getDataFromReference} from "../rally-util";

    @Component
    export default class Revision extends Vue {
        @Prop()
        data: any;

        sharedState = store.state;
        authorName = '';

        created() {
            this.authorName = getDataFromReference(this.data.User).name;
        }
    };
</script>


<style lang="css" scoped>
    .revision {
        background: #FFF;
        border-radius: 6px;
        border: 1px solid #DEDEDE;
        color: #555;
        margin-bottom: 10px;
        max-width: 800px;
        padding: 6px 8px;
        position: relative;
        transition: all 0.15s ease;
    }

    .revision:hover {
        background: #F9F9F9;
        border: 1px solid #CCC;
        color: #222;
    }

    .revision:hover .revision-header {
        background: #E8E8E8;
    }

    .revision:after {
        background: #CCC;
        bottom: -11px;
        content: '';
        height: 10px;
        left: 10px;
        position: absolute;
        width: 2px;
    }

    .revision-header {
        border-bottom: 1px solid #E4E4E4;
        margin: -6px -8px 5px;
        padding: 2px 8px;
        transition: all 0.15s ease;
    }

    .revision-date {
        border-right: 1px solid #CCC;
        display: inline-block;
        font-weight: 600;
        padding-right: 12px;
    }

    .revision-author {
        display: inline-block;
        padding-left: 10px;
    }
</style>
