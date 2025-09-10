<template>
  <TokenCaptureView :token-key="tokenKey" @success="onSuccess" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Routes, TokenCaptureView } from '@openlab/deconf-ui-toolkit'
import { StorageKey } from '@/lib/module'
import type { AuthToken } from '@openlab/deconf-shared'

export default defineComponent({
  components: { TokenCaptureView },
  data() {
    return { tokenKey: StorageKey.AuthToken }
  },
  methods: {
    onSuccess(user: AuthToken, params: URLSearchParams) {
      const redirect = params.get('redirect')
      if (redirect?.startsWith('/')) window.location.href = redirect
      else this.$router.replace({ name: Routes.Atrium })
    },
  },
})
</script>
