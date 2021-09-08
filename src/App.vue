<template>
    <div id="app">
        <site-nav v-if="showNav"/>
        <router-view/>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import SiteNav from '@/components/SiteNav.vue'

export default {
    components: {
        SiteNav
    },
    computed: {
        ...mapState(['userProfile']),
        showNav() {
            return Object.keys(this.userProfile).length > 1
        }
    }
}
</script>
