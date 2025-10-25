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

      <WebPushForm
        v-if="!hasCurrent && canAddDevice"
        @submit="addDevice"
        :disabled="isWorking"
      />

      <p v-if="!canAddDevice">
        Your current device doesn't support the
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Push_API">
          Web Push API
        </a>
        . If you're on mobile, try adding this website to your homescreen.
      </p>

      <details v-if="$dev.isEnabled">
        <summary>debug</summary>
        <button @click="test">Send a test</button>
      </details>
    </div>
  </MozUtilLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { BackButton, Routes } from '@openlab/deconf-ui-toolkit'
import MozUtilLayout from '@/components/MozUtilLayout.vue'

import {
  deconfClient,
  localise,
  shallowCompare,
  StorageKey,
  type WebPushDevice,
  type WebPushDeviceUpdate,
} from '@/lib/module.js'
import { ServiceWorkerPlugin } from '@/plugins/service-worker-plugin'
import WebPushDeviceRow from '@/components/WebPushDeviceRow.vue'
import WebPushForm, { type WebPushSubmit } from '@/components/WebPushForm.vue'

const profileRoute = { name: Routes.Profile }

const isWorking = ref(false)
const devices = ref<WebPushDevice[] | null>(null)

const serviceWorker = ServiceWorkerPlugin.use()
const subscription = shallowRef<PushSubscription | null>(null)

const currentDeviceId = ref<number>()

const webPushAvailable = 'Notification' in window

// Fetch the previous subscription when the pages loads
onMounted(async () => {
  if (!webPushAvailable || Notification.permission !== 'granted') return
  if (!serviceWorker.registration) return // TODO: should this be watched instead?
  subscription.value =
    await serviceWorker.registration.pushManager.getSubscription()
})

// Get and parse the "current" web push device id
onMounted(() => {
  const deviceId = localStorage.getItem(StorageKey.WebPushDevice)
  currentDeviceId.value = deviceId ? parseInt(deviceId) : undefined
})

// Fetch web push devices from the server
onMounted(() => fetchDevices())

const hasCurrent = computed(() => {
  return devices.value?.some((d) => isCurrent(d))
})

async function fetchDevices() {
  devices.value = await deconfClient.notifs.listWebPushDevices()
}

function isCurrent(device: WebPushDevice) {
  return Boolean(
    subscription.value &&
      shallowCompare(subscription.value.toJSON()?.keys, device.keys)
  )
}

async function updateDevice(id: number, update: WebPushDeviceUpdate) {
  console.log('@update', id, update)
  const ok = await deconfClient.notifs.updateWebPushDevice(id, update)
  if (!ok) alert('Failed to update device')
  await fetchDevices()
}

async function deleteDevice(id: number) {
  if (!confirm('Are you sure?')) return
  console.log('@delete', id)
  const ok = await deconfClient.notifs.deleteWebPushDevice(id)
  if (!ok) alert('Failed to delete device')
  await fetchDevices()
}

const canAddDevice = computed(
  () => webPushAvailable && serviceWorker.registration
)

async function addDevice(data: WebPushSubmit) {
  if (isWorking.value) return
  isWorking.value = true

  if (!webPushAvailable || !serviceWorker.registration) return

  const creds = await deconfClient.notifs.getWebPushCredentials()
  if (!creds) return

  const result = await Notification.requestPermission()
  if (result !== 'granted') return

  const sub =
    subscription.value ??
    (await serviceWorker.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: creds.publicKey,
    }))
  const newDevice = await deconfClient.notifs.createWebPushDevice({
    ...data,
    endpoint: sub.endpoint,
    expires_at: sub.expirationTime ? new Date(sub.expirationTime) : null,
    keys: sub.toJSON().keys!,
  })
  subscription.value = sub

  if (newDevice) {
    currentDeviceId.value = newDevice.id
    localStorage.setItem(StorageKey.WebPushDevice, `${newDevice.id}`)
  }

  await fetchDevices()

  isWorking.value = false
}

async function test() {
  if (!subscription.value) return

  const ok = await deconfClient.notifs.testWebPush()

  if (!ok) alert('Something went wrong')
}
</script>
