<template>
  <PageFooter :links="links">
    Made with
    <a href="https://deconf.app/" target="_blank" rel="noopener"> Deconf </a>
    /
    {{ appName }}
    {{ appVersion }}
  </PageFooter>
</template>

<script lang="ts">
import { env } from '@/plugins/env-plugin.js'
import { PageFooter, type PageFooterLink } from '@openlab/deconf-ui-toolkit'
import { defineComponent } from 'vue'

export interface _Data {
  appName: string
  appVersion: string
}

export default defineComponent({
  components: { PageFooter },
  data(): _Data {
    return {
      appName: this.$t('mozfest.footer.appName') || env.APP_NAME,
      appVersion: this.$env.BUILD_NAME || `v${env.APP_VERSION}`,
    }
  },
  computed: {
    links(): PageFooterLink[] {
      return [
        {
          title: this.$t('mozfest.footer.privacy'),
          url: this.$t('mozfest.footer.privacyUrl'),
        },
        {
          title: this.$t('mozfest.footer.terms'),
          url: this.$t('mozfest.footer.termsUrl'),
        },
        {
          title: this.$t('mozfest.footer.guidelines'),
          url: this.$t('mozfest.footer.guidelinesUrl'),
        },
      ]
    },
  },
})
</script>
