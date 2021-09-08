import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from '../firebase'
import router from '../router/index'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        userProfile: {},
        posts: []
    },
    mutations: {
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setPosts(state, val) {
            state.posts = val
        }
    },
    actions: {
        async login({ dispatch }, form) {
            try {
                const user = await firebase.userSignIn(form)
                dispatch('fetchUserProfile', user)
            } catch (err) {
                console.log(err.message)
            }
        },
        async logout({ commit }) {
            try {
                await firebase.userSignOut()
                commit('setUserProfile', {})
                router.push({ name: 'Login' })
            } catch (err) {
                console.log(err.message)
            }
        },
        async fetchUserProfile({ commit }, user) {
            try {
                const userProfile = await firebase.getUserProfile(user.uid)
                commit('setUserProfile', userProfile)
                if (router.currentRoute.path == '/login') {
                    router.push({ name: 'Dashboard' })
                }
            } catch (err) {
                console.log(err.message)
            }
        },
        async signup({ dispatch },  form) {
            try {
                const user = await firebase.createUser(form)
                await firebase.addUserProfile(user.uid, form)
                dispatch('fetchUserProfile', user)
            } catch (err) {
                console.log(err.message)
            }
        },
        async createPost({ state }, post) {
            await firebase.addPost({
                createdOn: new Date(),
                content: post.content,
                userId: firebase.auth.currentUser.uid,
                userName: state.userProfile.name,
                comments: 0,
                likes: 0
            })
        },
        async likePost({ commit }, post) {
            return await firebase.addLike(post, commit)
        },
        getPosts({ commit }) {
            firebase.snapshotPosts(commit)
        },
        async updateProfile({ dispatch }, user) {
            user.uid = firebase.auth.currentUser.uid
            await firebase.updateUserProfile(user)
            dispatch('fetchUserProfile', user)
            await firebase.updateUserInAllPosts(user)
            await firebase.updateUserInAllComments(user)
        }
    },
    modules: {}
})

export default store;
