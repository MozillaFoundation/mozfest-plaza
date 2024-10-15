<template>
  <UtilLayout>
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
  </UtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import UtilLayout from '@/components/MozUtilLayout.vue'
import { LoginView, ApiContent } from '@openlab/deconf-ui-toolkit'

export default defineComponent({
  components: { UtilLayout, LoginView, ApiContent },
})
</script>
