<template>
  <MozUtilLayout>
    <LoginView api-module="api">
      <ApiContent slug="login" slot="infoText" />
      <p slot="doneText">
        {{ $t('deconf.login.doneText') }}
      </p>
    </LoginView>
  </MozUtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { LoginView, ApiContent } from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { MozUtilLayout, LoginView, ApiContent },
})
</script>
