<template>
  <MozUtilLayout>
    <ApiError :home-route="homeRoute"></ApiError>
    <template v-slot:backButton>
      <span><!-- this hides the back button --></span>
    </template>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { ApiError } from '@openlab/deconf-ui-toolkit'

import MozUtilLayout from './MozUtilLayout.vue'

export default defineComponent({
  components: { MozUtilLayout, ApiError },
  props: {
    homeRoute: { type: Object as PropType<RouteLocationRaw>, required: true },
  },
})
</script>
