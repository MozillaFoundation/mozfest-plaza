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
        <div class="content loginView-oauth">
          <hr />
          <p>{{ $t('mozfest.login.oauth') }}</p>
          <div class="buttons">
            <a :href="googleLink" class="button is-google">
              <span class="icon">
                <FontAwesomeIcon :icon="['fab', 'google']" />
              </span>
              <span> {{ $t('mozfest.login.google') }} </span>
            </a>
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

export default defineComponent({
  components: { MozUtilLayout, LoginView, ApiContent, FontAwesomeIcon },
  computed: {
    googleLink(): string {
      const url = new URL('./auth/oauth2/google', env.SERVER_URL)
      if (this.$route.query.redirect) {
        url.searchParams.set('redirect', this.$route.query.redirect as string)
      }
      return url.toString()
    },
  },
})
</script>

<style lang="scss">
.loginView-oauth {
  margin-block-start: 3em;
}
</style>
