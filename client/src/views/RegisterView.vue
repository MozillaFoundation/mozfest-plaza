<template>
  <p>Redirecting...</p>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  mounted() {
    window.open(this.$t('mozfest.general.registerUrl') as string)
    this.$router.back()
  },
})
</script>
