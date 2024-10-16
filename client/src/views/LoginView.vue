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
    </LoginView>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { LoginView, ApiContent } from '@openlab/deconf-ui-toolkit'

export default defineComponent({
  components: { MozUtilLayout, LoginView, ApiContent },
})
</script>
