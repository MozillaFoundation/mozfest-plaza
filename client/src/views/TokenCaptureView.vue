<template>
  <div class="content">
    <p>Processing token...</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { createLoginFinishEvent, Routes } from '@openlab/deconf-ui-toolkit'
import { StorageKey } from '@/lib/module'
import { AuthToken } from '@openlab/deconf-shared'
import { setLocale } from '@/i18n/module'

export default Vue.extend({
  mounted() {
    this.processHash(window.location.hash)
  },
  methods: {
    async processHash(hash: string) {
      if (!hash || !hash.startsWith('#')) return

      const params = new URLSearchParams(hash.slice(1))
      const authToken = params.get('token')
      if (!authToken) return

      localStorage.setItem(StorageKey.AuthToken, authToken)
      await this.$store.dispatch('api/authenticate', { token: authToken })

      this.$metrics.track(createLoginFinishEvent())

      const user: AuthToken = this.$store.state.api.user
      if (user) setLocale(user.user_lang)

      this.$router.replace({
        name: Routes.Atrium,
      })
    },
  },
})
</script>
