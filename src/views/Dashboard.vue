<template>
    <div id="dashboard">
        <transition name="fade">
            <comment-modal v-if="showCommentModal" :post="selectedPost" @close="toggleCommentModal()" />
        </transition>
        <section>
            <div class="col1">
                <div class="profile">
                    <h5>{{ userProfile.name }}</h5>
                    <p>{{ userProfile.title }}</p>
                    <div class="create-post">
                        <p>Crear un post</p>
                        <form @submit.prevent>
                            <textarea v-model.trim="post.content"></textarea>
                            <button
                                @click="createPost()"
                                :disabled="post.content === ''"
                                class="button"
                            >Publicar</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col2">
                <div v-if="posts.length">
                    <div v-for="post in posts" :key="post.id" class="post">
                        <h5>{{ post.userName }}</h5>
                        <span>{{ post.createdOn | formatDate }}</span>
                        <p>{{ post.content | trimLength }}</p>
                        <ul>
                            <li><a @click="toggleCommentModal(post)">comments {{ post.comments }}</a></li>
                            <li><a @click="likePost(post.id, post.likes)">likes {{ post.likes }}</a></li>
                            <li><a @click="viewPost(post)">view full post</a></li>
                        </ul>
                    </div>
                </div>
                <div v-else>
                    <p class="no-results">No hay publicaciones</p>
                </div>
            </div>
        </section>

        <transition name="fade">
            <div v-if="postAreLiked" class="p-modal mini">
                <div class="p-container">
                    <a @click="postAreLiked = !postAreLiked" class="close">close</a>
                    Este post ya los has valorado con anterioridad.
                </div>
            </div>
        </transition>

        <!-- full post modal -->
        <transition name="fade">
            <div v-if="showPostModal" class="p-modal">
                <div class="p-container">
                    <a @click="closePostModal()" class="close">close</a>
                    <div class="post">
                        <h5>{{ fullPost.userName }}</h5>
                        <span>{{ fullPost.createdOn | formatDate }}</span>
                        <p>{{ fullPost.content }}</p>
                        <ul>
                            <li><a>comments {{ fullPost.comments }}</a></li>
                            <li><a>likes {{ fullPost.likes }}</a></li>
                        </ul>
                    </div>
                    <div v-show="postComments.length" class="comments">
                        <div v-for="comment in postComments" :key="comment.id" class="comment">
                            <p>{{ comment.userName }}</p>
                            <span>{{ comment.createdOn | formatDate }}</span>
                            <p>{{ comment.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import * as firebase from '@/firebase.js'
import moment from 'moment'
import CommentModal from '@/components/CommentModal'

export default {
    components: {
        CommentModal
    },
    data() {
        return {
            post: {
                content: '',
            },
            showPostModal: false,
            showCommentModal: false,
            selectedPost: {},
            fullPost: {},
            postComments: [],
            postAreLiked: false,
        }
    },
    computed: {
        ...mapState(['userProfile', 'posts'])
    },
    methods: {
        createPost() {
            this.$store.dispatch('createPost', {
                content: this.post.content,
                userName: this.userProfile.name,
            })
            this.post.content = ''
        },
        async likePost(id, likesCount) {
            const liked = await this.$store.dispatch('likePost', {id, likesCount})
            this.postAreLiked = !liked
        },
        toggleCommentModal(post) {
            this.showCommentModal = !this.showCommentModal
            if (this.showCommentModal) {
                this.selectedPost = post
            } else {
                this.selectedPost = {}
            }
        },
        async viewPost(post) {
            this.postComments = await firebase.getComments(post.id)
            this.fullPost = post
            this.showPostModal = true
        },
        closePostModal() {
            this.showPostModal = false;
            this.postComments = [];
        }
    },
    filters: {
        formatDate(val) {
            if (!val) return '-'
            let date = val.toDate()
            return moment(date).locale("es").fromNow()
        },
        trimLength(val) {
            if (val.length < 200) { return val }
            return `${val.substring(0, 200)}...`
        }
    },
    mounted() {
        this.$store.dispatch('getPosts')
    },
}
</script>

<style lang="scss" scoped>

</style>