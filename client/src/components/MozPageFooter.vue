<template>
  <PageFooter :links="links">
    Made by
    <a href="https://openlab.ncl.ac.uk/" target="_blank" rel="noopener">
      Open Lab
    </a>
    /
    {{ appName }}
    {{ appVersion }}
  </PageFooter>
</template>

<script lang="ts">
import { PageFooter, type PageFooterLink } from '@openlab/deconf-ui-toolkit'
import { defineComponent } from 'vue'

interface Data {
  appName: string
  appVersion: string
}

export default defineComponent({
  components: { PageFooter },
  data(): Data {
    return {
      appName: this.$t('mozfest.footer.appName') || __APP_NAME__,
      appVersion: this.$env.BUILD_NAME || `v${__APP_VERSION__}`,
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
