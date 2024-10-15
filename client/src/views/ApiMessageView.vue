<template>
  <UtilLayout>
    <ApiMessage :error-code="errorCode" />
  </UtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UtilLayout from '@/components/MozUtilLayout.vue'
import { ApiMessage } from '@openlab/deconf-ui-toolkit'

export default defineComponent({
  components: { UtilLayout, ApiMessage },
  props: {
    errorCode: { type: String, default: 'unknown' },
  },
})
</script>
