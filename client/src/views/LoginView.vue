<template>
  <MozUtilLayout>
    <LoginView api-module="api">
      <template v-slot:infoText>
        <ApiContent slug="login" />
      </template>
      <template v-slot:doneText>
        <p>
          {{ $t('deconf.login.doneText') }}
        </p>
      </template>
      <template v-slot:extraOptions>
        <div
          class="content loginView-oauth"
          v-if="settings?.features.googleAuth"
        >
          <p>
            {{ $t('mozfest.login.oauth') }}
          </p>
          <div class="buttons">
            <a :href="googleLink" class="button is-google">
              <span class="icon">
                <FontAwesomeIcon :icon="['fab', 'google']" />
              </span>
              <span> {{ $t('mozfest.login.google') }} </span>
            </a>
          </div>
        </div>

        <div
          class="content loginView-appCode"
          v-if="settings?.features.appCodes"
        >
          <p>
            {{ $t('mozfest.login.appCode') }}
          </p>
          <div class="buttons">
            <RouterLink :to="profileAuthRoute" class="button is-secondary">
              {{ $t('mozfest.login.profileAuth') }}
            </RouterLink>
          </div>
        </div>
      </template>
    </LoginView>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { LoginView, ApiContent } from '@openlab/deconf-ui-toolkit'
import { env } from '@/plugins/env-plugin'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapApiState } from '@/lib/deconf-hacks'
import type { RouteLocationRaw } from 'vue-router'
import { ExtraRoutes } from '@/lib/constants'

export default defineComponent({
  components: { MozUtilLayout, LoginView, ApiContent, FontAwesomeIcon },
  computed: {
    ...mapApiState('api', ['settings']),
    googleLink(): string {
      const url = new URL('./auth/oauth2/google', env.SERVER_URL)
      if (this.$route.query.redirect) {
        url.searchParams.set('redirect', this.$route.query.redirect as string)
      }
      return url.toString()
    },
    profileAuthRoute(): RouteLocationRaw {
      return { name: ExtraRoutes.ProfileAuth }
    },
  },
})
</script>

<style lang="scss">
.loginView-appCode,
.loginView-oauth {
  margin-block-start: 3em;
}
</style>
