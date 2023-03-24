<template>
  <ContentLayout slug="moz-house" />
</template>

<script lang="ts">
import Vue from 'vue'
import ContentLayout from '@/components/MozContentLayout.vue'
import { ExtraRoutes, mapApiState } from '@/lib/module'

export default Vue.extend({
  components: { ContentLayout },
  computed: {
    ...mapApiState('api', ['schedule']),
  },
  mounted() {
    if (this.schedule?.settings.house?.visible) {
      this.$router.replace({ name: ExtraRoutes.House })
    }
  },
})
</script>
