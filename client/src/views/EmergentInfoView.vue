<template>
  <ContentLayout>
    <ApiContent slug="emergent-info">
      <div class="buttons" slot="take_part">
        <a
          class="button is-medium is-link"
          :href="link"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>
            {{ $t('mozfest.emergent.takePart') }}
          </span>
          <BidirectionalIcon
            :ltr="['fas', 'arrow-right']"
            :rtl="['fas', 'arrow-left']"
          />
        </a>
      </div>
      <PrimaryEmbed
        slot="cover_image"
        link="https://player.vimeo.com/video/682949979?h=6c4377c2a8"
        class="block"
      />
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import ContentLayout from '@/components/MozContentLayout.vue'
import { ApiContent, PrimaryEmbed } from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes, mapApiState } from '@/lib/module'

interface Data {
  link: string
}

export default Vue.extend({
  components: { ApiContent, ContentLayout, PrimaryEmbed },
  data(): Data {
    return {
      link: 'https://mozfest.gradu.al/',
    }
  },
  computed: {
    ...mapApiState('api', ['schedule']),
  },
  mounted() {
    if (this.schedule?.settings.emergentSessions?.visible) {
      this.$router.replace({ name: ExtraRoutes.EmergentSessions })
      return
    }
  },
})
</script>

<style lang="scss" scoped>
.emergentInfoView {
  background: $background;
}
</style>
