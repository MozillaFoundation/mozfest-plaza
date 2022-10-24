<template>
  <MozUtilLayout>
    <div class="content">
      <template v-if="errorCode === 'login_expired'">
        <h1>{{ $t('mozfest.serverError.loginExpired.title') }}</h1>
        <p>{{ $t('mozfest.serverError.loginExpired.info') }}</p>
        <p>
          <router-link :to="loginRoute" class="button is-link">
            {{ $t('mozfest.serverError.loginExpired.action') }}
          </router-link>
        </p>
      </template>
      <template v-else>
        <h1>{{ $t('mozfest.serverError.unknown.title') }}</h1>
        <p>{{ $t('mozfest.serverError.unknown.info') }}</p>
        <p>
          <a :href="`mailto:${$t('mozfest.serverError.unknown.email')}`">
            {{ $t('mozfest.serverError.unknown.email') }}
          </a>
        </p>
      </template>
    </div>
  </MozUtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { Routes } from '@openlab/deconf-ui-toolkit'

// TODO: migrate to @openlab/deconf-ui ?

export default Vue.extend({
  components: { MozUtilLayout },
  props: {
    errorCode: { type: String, default: 'unknown' },
  },
  computed: {
    loginRoute(): unknown {
      return { name: Routes.Login }
    },
  },
})
</script>
