<template>
  <MozUtilLayout>
    <template v-slot:backButton>
      <BackButton :to="profileRoute">
        {{ localise('deconf.profile.title') }}
      </BackButton>
    </template>

    <div v-if="devices">
      <header class="content">
        <h1>{{ localise('mozfest.profileNotifications.name') }}</h1>
        <p>
          Use this page to configure your MozFest Plaza web-push notifications.
          You can add your current browser, update which notifications you
          receive or stop them entirely.
        </p>
      </header>

      <section class="content">
        <h2>Devices</h2>

        <p v-if="devices.length === 0">You haven't added any devices yet</p>

        <WebPushDeviceRow
          v-for="device in devices"
          :key="device.id"
          :device="device"
          :is-current="isCurrent(device)"
          @update="updateDevice"
          @delete="deleteDevice"
        />
      </section>

      <WebPushForm v-if="!hasCurrent && canAddDevice" @submit="addDevice" />

      <p v-if="!canAddDevice">
        Your current device doesn't support the [Web Push
        API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).
      </p>

      <!-- <details>
        <summary>debug</summary>
        <button @click="test">Send a test</button>
      </details> -->
    </div>
  </MozUtilLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { BackButton, Routes } from '@openlab/deconf-ui-toolkit'
import MozUtilLayout from '@/components/MozUtilLayout.vue'

import {
  apiClient,
  localise,
  shallowCompare,
  type WebPushDevice,
  type WebPushDeviceUpdate,
} from '@/lib/module.js'
import { ServiceWorkerPlugin } from '@/plugins/service-worker-plugin'
import WebPushDeviceRow from '@/components/WebPushDeviceRow.vue'
import WebPushForm, { type WebPushSubmit } from '@/components/WebPushForm.vue'

const profileRoute = { name: Routes.Profile }

const devices = ref<WebPushDevice[]>()

const serviceWorker = ServiceWorkerPlugin.use()
const subscription = shallowRef<PushSubscription | null>(null)

// Fetch the previous subscription when the pages loads
onMounted(async () => {
  if (Notification.permission !== 'granted') return
  if (!serviceWorker.registration) return // TODO: should this be watched instead?
  subscription.value =
    await serviceWorker.registration.pushManager.getSubscription()
})

onMounted(() => fetchDevices())

const hasCurrent = computed(() => {
  return devices.value?.some((d) => isCurrent(d))
})

async function fetchDevices() {
  devices.value = (await apiClient.listWebPushDevices()) ?? undefined
}

function isCurrent(device: WebPushDevice) {
  return Boolean(
    subscription.value &&
      shallowCompare(subscription.value.toJSON()?.keys, device.keys)
  )
}

async function updateDevice(id: number, update: WebPushDeviceUpdate) {
  console.log('@update', id, update)
  const ok = await apiClient.updateWebPushDevice(id, update)
  if (!ok) alert('Failed to update device')
  await fetchDevices()
}

async function deleteDevice(id: number) {
  if (!confirm('Are you sure?')) return
  console.log('@delete', id)
  const ok = await apiClient.deleteWebPushDevice(id)
  if (!ok) alert('Failed to delete device')
  await fetchDevices()
}

// TODO: a better test
const canAddDevice = computed(() => serviceWorker.registration)

async function addDevice(data: WebPushSubmit) {
  console.log('addDevice', data)

  if (!serviceWorker.registration) return

  const creds = await apiClient.getWebPushCredentials()
  if (!creds) return

  const result = await Notification.requestPermission()
  if (result !== 'granted') return

  const sub =
    subscription.value ??
    (await serviceWorker.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: creds.publicKey,
    }))
  await apiClient.createWebPushDevice({
    ...data,
    endpoint: sub.endpoint,
    expiration: sub.expirationTime ? new Date(sub.expirationTime) : null,
    keys: sub.toJSON().keys!,
  })
  subscription.value = sub

  await fetchDevices()
}

async function test() {
  if (!subscription.value) return

  // await apiClient.fetch(
  //   new URL('notifications/web-push-test', apiClient.baseUrl).toString(),
  //   {
  //     method: 'POST',
  //     body: JSON.stringify(subscription.value),
  //     headers: {
  //       'content-type': 'application/json',
  //     },
  //   }
  // )
}
</script>
