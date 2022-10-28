<template>
  <UtilLayout :home-route="atriumRoute" :width="width">
    <MozfestLogo slot="brand" />

    <template slot="backButton">
      <slot name="backButton">
        <BackButton :to="atriumRoute">
          {{ $t('mozfest.general.backToAtrium') }}
        </BackButton>
      </slot>
    </template>

    <LanguageControl slot="languageControl" />

    <slot slot="main" />

    <MozPageFooter slot="footer" />
  </UtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import { Location } from 'vue-router'
import { BackButton, Routes, UtilLayout } from '@openlab/deconf-ui-toolkit'

import MozfestLogo from './MozfestLogo.vue'
import MozPageFooter from './MozPageFooter.vue'
import LanguageControl from '@/components/LanguageControl.vue'

export default Vue.extend({
  components: {
    UtilLayout,
    MozfestLogo,
    MozPageFooter,
    BackButton,
    LanguageControl,
  },
  props: {
    width: { type: String, default: 'regular' },
  },
  computed: {
    atriumRoute(): Location {
      return { name: Routes.Atrium }
    },
  },
})
</script>
