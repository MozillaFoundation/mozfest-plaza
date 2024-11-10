<script lang="ts" setup>
import { BackButton } from '@openlab/deconf-ui-toolkit'

import { ExtraRoutes, localise } from '@/lib/module.js'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import PretalxDevBlock from '@/components/PretalxDevBlock.vue'

const adminRoute = { name: ExtraRoutes.Admin }
</script>

<template>
  <MozUtilLayout>
    <template v-slot:backButton>
      <BackButton :to="adminRoute">
        {{ localise('mozfest.pageTitles.admin') }}
      </BackButton>
    </template>

    <div class="content">
      <h1 class="title">Admin Schedule</h1>
      <p class="subtitle">Use this page to update the schedule</p>

      <hr />

      <PretalxDevBlock :dev-plugin="$dev" />
    </div>
  </MozUtilLayout>
</template>
