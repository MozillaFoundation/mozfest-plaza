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
import { PageFooter, PageFooterLink } from '@openlab/deconf-ui-toolkit'
import Vue from 'vue'

interface Data {
  appName: string
  appVersion: string
}

export default Vue.extend({
  components: { PageFooter },
  data(): Data {
    return {
      appName: this.$t('mozfest.footer.appName') || process.env.VUE_APP_NAME,
      appVersion: this.$env.BUILD_NAME || `v${process.env.VUE_APP_VERSION}`,
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
