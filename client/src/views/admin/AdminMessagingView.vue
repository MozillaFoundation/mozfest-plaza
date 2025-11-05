<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { BackButton } from '@openlab/deconf-ui-toolkit'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { deconfClient, ExtraRoutes, localise } from '@/lib/module.js'

const adminRoute = { name: ExtraRoutes.Admin }

interface AdminStats {
  categories: Record<string, number>
  messages: Record<string, number>
}

const updated = ref(new Date())
const stats = ref<AdminStats | null>()
const timerId = ref<number>()
const output = ref<unknown>('')

const fullDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'medium',
})

onMounted(async () => {
  await fetchData()
  timerId.value = setInterval(() => fetchData(), 5_000)
})

onUnmounted(() => {
  if (timerId.value) clearInterval(timerId.value)
})

async function fetchData() {
  stats.value = await deconfClient.admin.getMessaging()
  updated.value = new Date()
}

const message = ref({
  title: '',
  body: '',
  url: location.origin,
})

async function sendTestMessage() {
  output.value = 'Sending…'
  const result = await deconfClient.admin.testWebPush(message.value)
  output.value = result ?? 'Something went wrong'
  await fetchData()
}
async function sendFullMessage() {
  if (!confirm('Are you sure?')) return

  output.value = 'Sending…'
  const result = await deconfClient.admin.sendWebPush(message.value)
  output.value = result ?? 'Something went wrong'

  if (result) {
    message.value = { title: '', body: '', url: location.origin }
  }
  await fetchData()
}
</script>

<template>
  <MozUtilLayout>
    <template v-slot:backButton>
      <BackButton :to="adminRoute">
        {{ localise('mozfest.pageTitles.admin') }}
      </BackButton>
    </template>

    <div class="content" v-if="stats">
      <h1 class="title">Admin Messaging</h1>
      <p class="subtitle">Use this page to send messages to visitors</p>

      <div class="columns">
        <div class="column">
          <h3>Subscribers</h3>

          <dl>
            <dt>MySchedule</dt>
            <dd>{{ stats.categories.MySchedule ?? '~' }}</dd>
            <dt>Special</dt>
            <dd>{{ stats.categories.Special ?? '~' }}</dd>
          </dl>
        </div>
        <div class="column">
          <h3>Messages</h3>

          <dl>
            <dt>sent</dt>
            <dd>{{ stats.messages.sent ?? 0 }}</dd>
            <dt>pending</dt>
            <dd>{{ stats.messages.pending ?? 0 }}</dd>
            <dt>failed</dt>
            <dd>{{ stats.messages.failed ?? 0 }}</dd>
          </dl>
        </div>
      </div>

      <p>Updated: {{ fullDate.format(updated) }}</p>

      <div class="messageBox">
        <h3 class="is-size-5">Send a message</h3>
        <p>
          This will send a message to anyone who opted-in to the
          <strong>Special</strong> category.
        </p>

        <div class="field">
          <label class="label" for="title">Title</label>
          <div class="control">
            <input
              type="text"
              class="input"
              v-model="message.title"
              id="title"
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="body">Message</label>
          <div class="control">
            <textarea
              type="text"
              class="textarea"
              v-model="message.body"
              id="body"
            ></textarea>
          </div>
        </div>

        <div class="field">
          <label for="url" class="label">URL</label>
          <div class="control">
            <input type="url" id="url" class="input" v-model="message.url" />
          </div>
        </div>

        <div class="field">
          <label for="output" class="label">Result</label>
          <pre id="output">{{ output }}</pre>
        </div>

        <p>A test message will go to any of your registered devices</p>

        <div class="buttons">
          <button class="button is-secondary" @click="sendTestMessage">
            Send test message
          </button>
          <button class="button is-primary" @click="sendFullMessage">
            Send
          </button>
        </div>
      </div>
    </div>
  </MozUtilLayout>
</template>

<style lang="scss">
.messageBox {
  border: 2px dashed $border;
  padding: 1em;
}
</style>
