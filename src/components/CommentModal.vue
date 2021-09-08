<template>
    <div class="c-modal">
        <div class="c-container">
            <a @click="$emit('close')">close</a>
            <p>Escriba aquí su comentario</p>
            <form @submit.prevent>
                <textarea v-model.trim="comment"></textarea>
                <button @click="addCommentModal()" :disabled="comment == ''" class="button">Añadir comentario</button>
            </form>
        </div>
    </div>
</template>

<script>
import { addComment, auth } from '@/firebase.js'

export default {
    name: 'comment-modal',
    props: ['post'],
    data() {
        return {
            comment: ''
        }
    },
    methods: {
        async addCommentModal() {
            await addComment(this.post.id, {
                createdOn: new Date(),
                content: this.comment,
                postId: this.post.id,
                userId: auth.currentUser.uid,
                userName: this.$store.state.userProfile.name
            })
            this.$emit('close')
        }
    },
}
</script>