<template>
  <ApiError :home-route="homeRoute">
    <MozfestLogo slot="brand" />
    <MozPageFooter slot="footer" />
  </ApiError>
</template>

<script lang="ts">
import Vue from 'vue'
import { ApiError } from '@openlab/deconf-ui-toolkit'

import MozfestLogo from './MozfestLogo.vue'
import MozPageFooter from './MozPageFooter.vue'

export default Vue.extend({
  components: { MozfestLogo, MozPageFooter, ApiError },
  props: {
    homeRoute: { type: Object, required: true },
  },
})
</script>
