<template>
  <div class="contentTemplate appLayout-main">
    <section class="section">
      <div class="container">
        <BoxContent>
          <MozApiContent :slug="config.options.contentSlug" />
        </BoxContent>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import { BoxContent } from '@openlab/deconf-ui-toolkit'
import type { ContentOptions, PageConfig } from '@/lib/module'

import MozApiContent from '@/components/MozApiContent.vue'

type Config = PageConfig<string, ContentOptions>

export default defineComponent({
  components: { MozApiContent, BoxContent },
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
