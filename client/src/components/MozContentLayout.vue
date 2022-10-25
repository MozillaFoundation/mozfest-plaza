<template>
  <AppLayout>
    <div class="contentLayout appLayout-main">
      <section class="section">
        <div class="container">
          <BoxContent>
            <slot>
              <ApiContent v-if="slug" :slug="slug" />
            </slot>
          </BoxContent>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import AppLayout from './MozAppLayout.vue'
import { ApiContent, BoxContent, guardPage } from '@openlab/deconf-ui-toolkit'
import { mapApiState } from '@/lib/module'
import { PageFlag } from '@openlab/deconf-shared/dist/conference'

export default Vue.extend({
  props: {
    slug: { type: String as PropType<string | null>, default: null },
    flag: { type: Object as PropType<PageFlag | null>, default: null },
  },
  components: { AppLayout, ApiContent, BoxContent },
  computed: {
    ...mapApiState('api', ['user']),
  },
  created() {
    if (this.flag) guardPage(this.flag, this.user, this.$router)
  },
})
</script>

<style lang="scss">
.contentLayout {
  background: $background;
}
</style>
