<template>
  <MozUtilLayout>
    <ApiMessage :error-code="errorCode" />
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { ApiMessage } from '@openlab/deconf-ui-toolkit'

export default defineComponent({
  components: { MozUtilLayout, ApiMessage },
  props: {
    errorCode: { type: String, default: 'unknown' },
  },
})
</script>
