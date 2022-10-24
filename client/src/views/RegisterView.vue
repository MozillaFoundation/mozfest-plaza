<template>
  <div class="registerView">Redirecting...</div>
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
