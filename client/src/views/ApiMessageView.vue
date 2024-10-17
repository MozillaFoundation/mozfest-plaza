<template>
  <MozUtilLayout>
    <div v-if="errorCode === 'oauth2_failed'" class="content">
      <h1>{{ $t('mozfest.apiMessage.oauth2Failed.title') }}</h1>
      <p>{{ $t('mozfest.apiMessage.oauth2Failed.info') }}</p>
      <p>
        <router-link :to="loginRoute" class="button is-link">
          {{ $t('mozfest.apiMessage.oauth2Failed.action') }}
        </router-link>
      </p>
    </div>
    <div v-else-if="errorCode === 'not_registered'" class="content">
      <h1>{{ $t('mozfest.apiMessage.notRegistered.title') }}</h1>
      <p>{{ $t('mozfest.apiMessage.notRegistered.info') }}</p>
      <p>
        <router-link :to="loginRoute" class="button is-link">
          {{ $t('mozfest.apiMessage.notRegistered.action') }}
        </router-link>
      </p>
    </div>
    <ApiMessage v-else :error-code="errorCode" />
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { ApiMessage, Routes } from '@openlab/deconf-ui-toolkit'
import type { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  components: { MozUtilLayout, ApiMessage },
  props: {
    errorCode: { type: String, default: 'unknown' },
  },
  computed: {
    loginRoute(): RouteLocationRaw {
      return { name: Routes.Login }
    },
  },
})
</script>
