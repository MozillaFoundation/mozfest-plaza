<template>
  <AppLayout>
    <div class="contentTemplate appLayout-main">
      <section class="section">
        <div class="container">
          <BoxContent>
            <MozApiContent :slug="config.options.contentSlug" />
          </BoxContent>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import { BoxContent } from '@openlab/deconf-ui-toolkit'
import { ContentOptions, PageConfig } from '@/lib/module'

import AppLayout from '@/components/MozAppLayout.vue'
import MozApiContent from '@/components/MozApiContent.vue'

type Config = PageConfig<'content', ContentOptions>

export default Vue.extend({
  components: { AppLayout, MozApiContent, BoxContent },
  props: {
    config: { type: Object as PropType<Config>, required: true },
  },
  created() {
    // TODO: should the guardPage logic be migrated too?
  },
})
</script>

<style lang="scss">
.contentTemplate {
  background: $background;

  .boxContent {
    max-width: 720px;
    margin-inline: auto;
  }
}
</style>
