<template>
  <TimelineTemplate :config="pages.schedule" />
</template>

<script lang="ts">
import Vue from 'vue'
import TimelineTemplate from '@/components/TimelineTemplate.vue'
import pages from '@/data/pages.json'

export default Vue.extend({
  components: { TimelineTemplate },
  data: () => ({ pages }),
})
</script>
