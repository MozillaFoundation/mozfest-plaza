<template>
  <UtilLayout>
    <ApiMessage :error-code="errorCode" />
  </UtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import UtilLayout from '@/components/MozUtilLayout.vue'
import { ApiMessage } from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { UtilLayout, ApiMessage },
  props: {
    errorCode: { type: String, default: 'unknown' },
  },
})
</script>
