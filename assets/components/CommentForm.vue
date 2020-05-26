<template>
    <div>
        <h2>New Comment</h2>
        <div>
            <!-- TODO-mrc: use md-textarea and limit size to 	32,768 characters -->
            <textarea v-model="text" placeholder="Your comment"></textarea>
        </div>

        <div v-if="errorMessage" class="errorMessage">
            {{ errorMessage }}
        </div>
        <md-button class="md-primary" @click="submit">Submit</md-button>
    </div>
</template>



<script lang="ts">
    import {Component, Vue, Prop} from 'vue-property-decorator';
    import store from "../store";
    import {createItem} from "../util";

    @Component
    export default class CommentForm extends Vue {
        // Reference to the item we'll attach the comment to
        @Prop()
        itemRef = '';

        text = '';
        sharedState = store.state;
        errorMessage = '';

        async submit() {
            this.errorMessage = '';

            // TODO-mrc: will it fill in the user for me?
            const data = {'Text': this.text, 'Artifact': this.itemRef};

            // TODO-mrc: error handling
            const comment = await createItem("conversationpost", data)

            // TODO-mrc; refresh all comments? Or just stick this one in the list?
            // TODO-mrc: what if it's an update?
        }
    };
</script>


<style lang="css" scoped>
    /* TODO-mrc: move this to a common css file */
    .errorMessage {
        color: red;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    input {
        padding: 10px;
        margin: 10px;
        width: 300px;
    }
</style>
