<template>
  <MozUtilLayout>
    <template v-slot:backButton>
      <BackButton :to="profileRoute">
        {{ localise('deconf.profile.title') }}
      </BackButton>
    </template>

    <div class="content">
      <h1>{{ localise('mozfest.profileNotifications.name') }}</h1>
      <p>Coming soon!</p>
    </div>
  </MozUtilLayout>
</template>

<script setup lang="ts">
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { BackButton, Routes } from '@openlab/deconf-ui-toolkit'

import { localise } from '@/lib/module.js'

const profileRoute = { name: Routes.Profile }
</script>
