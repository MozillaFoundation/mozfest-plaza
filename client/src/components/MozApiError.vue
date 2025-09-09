<template>
  <MozUtilLayout>
    <ApiError />
    <template v-slot:backButton>
      <span><!-- this hides the back button --></span>
    </template>
  </MozUtilLayout>
</template>

<script lang="ts">
import { ApiError } from '@openlab/deconf-ui-toolkit'
import { defineComponent } from 'vue'

import MozUtilLayout from './MozUtilLayout.vue'

export default defineComponent({
  components: { MozUtilLayout, ApiError },
  props: {},
})
</script>
