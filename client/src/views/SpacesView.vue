<template>
  <MozAppLayout>
    <div class="spacesView">
      <section class="section">
        <div class="container">
          <BoxContent>
            <ApiContent slug="spaces" />
          </BoxContent>
        </div>
      </section>
    </div>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import { ApiContent, BoxContent, mapApiState } from '@openlab/deconf-ui-toolkit'
import { guardRoute } from '@/lib/module'

export default Vue.extend({
  components: { MozAppLayout, ApiContent, BoxContent },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
  },
  created() {
    guardRoute(this.schedule?.settings, 'social', this.user, this.$router)
  },
})
</script>

<style lang="scss">
.spacesView {
  background: $background;
}
</style>
