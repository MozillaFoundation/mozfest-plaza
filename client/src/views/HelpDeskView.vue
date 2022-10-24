<template>
  <div class="helpDeskView">Redirecting...</div>
</template>

<script lang="ts">
import { mapApiState } from '@openlab/deconf-ui-toolkit'
import Vue from 'vue'

export default Vue.extend({
  created() {
    window.location.replace('https://www.mozillafestival.org/helpdesk/')
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
  },
})
</script>

<style lang="scss">
.helpDeskView {
}
</style>
