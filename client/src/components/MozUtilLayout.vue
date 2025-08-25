<template>
  <UtilLayout :home-route="atriumRoute" :width="width">
    <template v-slot:brand>
      <MozillaLogo />
    </template>

    <template v-slot:backButton>
      <slot name="backButton">
        <BackButton :to="atriumRoute">
          {{ $t('mozfest.general.backToAtrium') }}
        </BackButton>
      </slot>
    </template>

    <template v-slot:languageControl>
      <LanguageControl />
    </template>

    <template v-slot:main>
      <slot></slot>
    </template>

    <template v-slot:footer>
      <MozPageFooter />
    </template>
  </UtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { BackButton, Routes, UtilLayout } from '@openlab/deconf-ui-toolkit'

import MozillaLogo from './MozillaLogo.vue'
import MozPageFooter from './MozPageFooter.vue'
import LanguageControl from '@/components/LanguageControl.vue'

export default defineComponent({
  components: {
    UtilLayout,
    MozillaLogo,
    MozPageFooter,
    BackButton,
    LanguageControl,
  },
  props: {
    width: { type: String, default: 'regular' },
  },
  computed: {
    atriumRoute(): RouteLocationRaw {
      return { name: Routes.Atrium }
    },
  },
})
</script>
