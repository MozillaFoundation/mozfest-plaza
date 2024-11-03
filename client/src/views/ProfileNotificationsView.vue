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

      <button v-if="!subscription" class="button" @click="start">Start</button>
      <div v-else class="content">
        <pre>{{ subscription }}</pre>
        <button @click="test">test</button>
      </div>
    </div>
  </MozUtilLayout>
</template>

<script setup lang="ts">
import { BackButton, Routes } from '@openlab/deconf-ui-toolkit'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { ServiceWorkerPlugin } from '@/plugins/service-worker-plugin'

import { apiClient, localise } from '@/lib/module.js'
import { onMounted, shallowRef } from 'vue'

const profileRoute = { name: Routes.Profile }

const serviceWorker = ServiceWorkerPlugin.use()
const subscription = shallowRef<PushSubscription | null>()

// Fetch the previous subscription when the pages loads
onMounted(async () => {
  if (Notification.permission !== 'granted') return
  subscription.value =
    await serviceWorker.registration?.pushManager.getSubscription()
})

async function start() {
  if (!serviceWorker.registration || subscription.value) return

  const creds = await apiClient.getWebPushCredentials()
  if (!creds) return

  const result = await Notification.requestPermission()
  if (result !== 'granted') return

  subscription.value = await serviceWorker.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: creds.publicKey,
  })
}

async function test() {
  if (!subscription.value) return

  await fetch(new URL('/notifications/web-push-test', apiClient.baseUrl), {
    method: 'POST',
    body: JSON.stringify(subscription.value),
    headers: {
      'content-type': 'application/json',
    },
  })
}
</script>
