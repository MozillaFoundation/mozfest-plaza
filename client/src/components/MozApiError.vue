<template>
  <ApiError :home-route="homeRoute">
    <template v-slot:brand>
      <MozfestLogo />
    </template>
    <template v-slot:footer>
      <MozPageFooter />
    </template>
  </ApiError>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { ApiError } from '@openlab/deconf-ui-toolkit'

import MozfestLogo from './MozfestLogo.vue'
import MozPageFooter from './MozPageFooter.vue'

export default defineComponent({
  components: { MozfestLogo, MozPageFooter, ApiError },
  props: {
    homeRoute: { type: Object as PropType<RouteLocationRaw>, required: true },
  },
})
</script>
