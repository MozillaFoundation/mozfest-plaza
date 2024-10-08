<template>
  <AtriumTemplate :config="pages.plaza" />
</template>

<script lang="ts">
import Vue from 'vue'
import AtriumTemplate from '@/templates/AtriumTemplate.vue'
import pages from '@/data/pages.json'

export default Vue.extend({
  components: { AtriumTemplate },
  data: () => ({ pages }),
})
</script>
