<template>
  <TokenCaptureView :token-key="tokenKey" @success="onSuccess" />
</template>

<script lang="ts">
import Vue from 'vue'
import { Routes, TokenCaptureView } from '@openlab/deconf-ui-toolkit'
import { StorageKey } from '@/lib/module'
import { AuthToken } from '@openlab/deconf-shared'
import { setLocale } from '@/i18n/module'

export default Vue.extend({
  components: { TokenCaptureView },
  data() {
    return { tokenKey: StorageKey.AuthToken }
  },
  methods: {
    onSuccess(user: AuthToken, params: URLSearchParams) {
      setLocale(user.user_lang)
      const redir = params.get('redirect')
      if (!redir) this.$router.replace({ name: Routes.Atrium })
      else window.location.href = redir
    },
  },
})
</script>
