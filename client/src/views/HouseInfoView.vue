<template>
  <ContentLayout slug="moz-house" />
</template>

<script lang="ts">
import Vue from 'vue'
import ContentLayout from '@/components/MozContentLayout.vue'
import { mapApiState } from '@/lib/module'
// import { guardPage } from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { ContentLayout },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
  },
  mounted() {
    // guardPage(this.schedule?.settings.house, this.user, this.$router)
  },
})
</script>
