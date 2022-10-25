<template>
  <p>Redirecting...</p>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  created() {
    window.location.replace('https://www.mozillafestival.org/helpdesk/')
  },
})
</script>
