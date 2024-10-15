<template>
  <TimelineTemplate :config="pages.schedule" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { TimelineTemplate },
  data: () => ({ pages }),
})
</script>
