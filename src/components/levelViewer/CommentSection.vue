<script setup lang="ts">
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';

defineProps({
    listID: {type: String, required: true}
})

</script>

<template>
    <main>
        <CommentBox :list-i-d="listID.toString()" />
        <ListBrowser :online-browser="true" :hide-search="true" online-type="comments" :comment-i-d="listID" :refreshButton="true"/>
    </main>
</template>