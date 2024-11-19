<template>
  <MozUtilLayout>
    <template v-slot:backButton v-if="user">
      <BackButton :to="profileRoute">
        {{ localise('deconf.profile.title') }}
      </BackButton>
    </template>

    <div class="content">
      <header class="content">
        <h1>{{ localise('mozfest.profileAuth.name') }}</h1>
        <p>Use this page to generate an App Code or use one to log in.</p>
      </header>

      <div class="content" v-if="user">
        <h2>Create login</h2>
        <p>
          Generate an App Code to log in to another browser or device.
          <strong> Never share this code with anyone else </strong>. Your code
          lasts for 5 minutes.
        </p>
        <div class="buttons">
          <button class="button is-primary" @click="generateCode" v-if="!code">
            Generate code
          </button>
          <div class="codeBox" v-if="code">
            <pre>{{ code }}</pre>
            <button class="button is-primary" @click="copyCode">
              <template v-if="copied">Copied</template>
              <template v-else>Copy code</template>
            </button>
          </div>
        </div>
      </div>

      <div class="content" v-if="!user">
        <h2>Log in</h2>
        <p>
          Navigate to <strong>Profile → App Codes</strong> on the website to
          generate a code. Paste that code here and press Log in.
        </p>

        <TextField v-model="code" type="string" name="code" label="Code" />

        <div class="buttons">
          <button class="button is-primary" @click="submitCode">Log in</button>
        </div>
      </div>
    </div>
  </MozUtilLayout>
</template>

<script lang="ts" setup>
import { Routes, BackButton, TextField } from '@openlab/deconf-ui-toolkit'
import copy from 'copy-to-clipboard'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { apiClient, localise, useUser } from '@/lib/module.js'
import { ref } from 'vue'

const profileRoute = { name: Routes.Profile }

const user = useUser()

const MAX_CODE_DURATION = 30_000
const code = ref('')
const copied = ref(false)

interface LoginCode {
  token: string
  url: string
}

async function generateCode() {
  const result = await apiClient.fetchJson<{ token: string }>('auth/login-code')
  if (!result) return

  code.value = result.token

  setTimeout(() => {
    code.value = ''
  }, MAX_CODE_DURATION)
}

function copyCode() {
  if (!code.value) return
  copy(code.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 5_000)
}

async function submitCode() {
  if (!code.value) return

  const result = await apiClient.fetchJson<LoginCode>(
    `auth/login-code/${code.value}`,
    { method: 'POST' }
  )
  if (!result) alert('Failed to log in')
  else location.href = result.url
}
</script>

<style>
.codeBox {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  align-items: center;
  gap: 0.5em;
}
.codeBox pre {
  user-select: all;
  text-wrap: nowrap;
  font-size: 0.9rem;
}
</style>
