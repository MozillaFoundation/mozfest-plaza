<template>
  <MozAppLayout>
    <div class="emergentInfoView">
      <section class="section">
        <div class="container">
          <BoxContent>
            <ApiContent slug="emergent-info">
              <div class="buttons" slot="take_part">
                <a
                  class="button is-medium is-link"
                  :href="link"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span class="icon rtl-only">
                    <fa-icon :icon="['fas', 'arrow-left']" />
                  </span>
                  <span>
                    {{ $t('mozfest.emergent.takePart') }}
                  </span>
                  <span class="icon ltr-only">
                    <fa-icon :icon="['fas', 'arrow-right']" />
                  </span>
                </a>
              </div>
              <PrimaryEmbed
                slot="cover_image"
                link="https://player.vimeo.com/video/682949979?h=6c4377c2a8"
                class="block"
              />
            </ApiContent>
          </BoxContent>
        </div>
      </section>
    </div>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  BoxContent,
  mapApiState,
  PrimaryEmbed,
} from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes, guardRoute, MozConferenceConfig } from '@/lib/module'

interface Data {
  link: string
}

export default Vue.extend({
  components: { MozAppLayout, BoxContent, ApiContent, PrimaryEmbed },
  data(): Data {
    return {
      link: 'https://mozfest.gradu.al/',
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
  },
  mounted() {
    if (
      (this.schedule?.settings as MozConferenceConfig).emergentSessions?.visible
    ) {
      this.$router.replace({ name: ExtraRoutes.EmergentSessions })
      return
    }
    guardRoute(this.schedule?.settings, 'emergentInfo', this.user, this.$router)
  },
})
</script>

<style lang="scss" scoped>
.emergentInfoView {
  background: $background;
}
</style>
