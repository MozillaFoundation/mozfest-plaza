<template>
  <UtilLayout>
    <LoginView api-module="api">
      <ApiContent slug="login" slot="infoText" />
      <p slot="doneText">
        {{ $t('deconf.login.doneText') }}
      </p>
    </LoginView>
  </UtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import UtilLayout from '@/components/MozUtilLayout.vue'
import { LoginView, ApiContent } from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { UtilLayout, LoginView, ApiContent },
})
</script>
