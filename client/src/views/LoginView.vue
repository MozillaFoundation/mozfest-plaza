<template>
  <MozUtilLayout>
    <div class="loginView">
      <h1 class="title">{{ $t('deconf.login.title') }}</h1>

      <div class="content">
        <ApiContent slug="login" />
      </div>

      <div class="loginView-form" v-if="mode === 'email'">
        <div class="notification is-danger" v-if="state === 'error'">
          <p>{{ $t('deconf.login.badEmail') }}</p>
        </div>

        <MozTextField
          name="email"
          type="email"
          :label="$t('deconf.login.email.label')"
          :placeholder="$t('deconf.login.email.placeholder')"
          :help="$t('deconf.login.email.help')"
          :has-error="state === 'error'"
          :disabled="state === 'working'"
          v-model="emailAddress"
          @enter="submitEmail"
          :input-attrs="{
            autocomplete: 'email',
          }"
        />
        <div class="buttons">
          <button
            class="button is-primary"
            @click="submitEmail"
            :disabled="state === 'working'"
          >
            {{ $t('deconf.login.submitButton') }}
          </button>
        </div>
      </div>

      <div class="loginView-form" v-if="mode === 'code'">
        <div class="notification is-success" v-if="state === 'input'">
          <p>{{ $t('mozfest.login.emailSent') }}</p>
        </div>
        <div class="notification is-danger" v-if="state === 'error'">
          <p>{{ $t('mozfest.login.badCode') }}</p>
        </div>

        <!-- <input name="code" required="" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{1,6}"> -->
        <MozTextField
          name="code"
          type="text"
          :label="$t('mozfest.login.oneTimeCode.label')"
          :help="$t('mozfest.login.oneTimeCode.help')"
          :has-error="state === 'error'"
          :disabled="state === 'working'"
          v-model="oneTimeCode"
          @enter="submitCode"
          :input-attrs="{
            autocomplete: 'one-time-code',
            inputmode: 'numeric',
          }"
        />
        <div class="buttons">
          <button
            class="button is-primary"
            @click="submitCode"
            :disabled="state === 'working'"
          >
            {{ $t('mozfest.login.submitCode') }}
          </button>
          <button class="button is-primary is-outlined" @click="startAgain">
            {{ $t('mozfest.login.startAgain') }}
          </button>
        </div>
      </div>
    </div>

    <div class="content loginView-oauth" v-if="settings?.features.googleAuth">
      <p>
        {{ $t('mozfest.login.oauth') }}
      </p>
      <div class="buttons">
        <a :href="googleLink" class="button is-google">
          <span class="icon">
            <FontAwesomeIcon :icon="['fab', 'google']" />
          </span>
          <span> {{ $t('mozfest.login.google') }} </span>
        </a>
      </div>
    </div>

    <div class="content loginView-appCode" v-if="settings?.features.appCodes">
      <p>
        {{ $t('mozfest.login.appCode') }}
      </p>
      <div class="buttons">
        <RouterLink :to="profileAuthRoute" class="button is-secondary">
          {{ $t('mozfest.login.profileAuth') }}
        </RouterLink>
      </div>
    </div>

    <hr />

    <div class="content">
      <p>
        {{ $t('deconf.login.registerLabel') }}
        <router-link :to="registerRoute">
          {{ $t('deconf.login.registerAction') }}
        </router-link>
      </p>
    </div>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { ApiContent, FontAwesomeIcon, Routes } from '@openlab/deconf-ui-toolkit'
import { env } from '@/plugins/env-plugin'
import type { RouteLocationRaw } from 'vue-router'
import { ExtraRoutes } from '@/lib/constants'
import MozTextField from '@/components/MozTextField.vue'
import { deconfClient, mapApiState } from '@/lib/module'

type FormState = 'input' | 'working' | 'error' | 'success'

export interface _Data {
  emailAddress: string
  oneTimeCode: string
  state: FormState
  mode: 'email' | 'code'
  token?: string
}

export default defineComponent({
  components: {
    MozUtilLayout,
    ApiContent,
    FontAwesomeIcon,
    MozTextField,
  },
  data: (): _Data => ({
    emailAddress: '',
    oneTimeCode: '',
    state: 'input',
    mode: 'email',
  }),
  computed: {
    ...mapApiState('api', ['settings']),
    googleLink(): string {
      const url = new URL('./auth/oauth2/google', env.SERVER_URL)
      if (this.redirect) {
        url.searchParams.set('redirect', this.redirect)
      }
      return url.toString()
    },
    profileAuthRoute(): RouteLocationRaw {
      return { name: ExtraRoutes.ProfileAuth }
    },
    registerRoute(): RouteLocationRaw {
      return { name: Routes.Register }
    },
    redirect() {
      return this.$route.query.redirect as string | undefined
    },
  },

  mounted() {
    const { code, token } = this.$route.query
    if (typeof token === 'string') {
      this.token = token
    }
    if (typeof code === 'string') {
      this.oneTimeCode = code
      this.mode = 'code'
      this.submitCode()
    }
  },

  methods: {
    async submitEmail() {
      if (this.state === 'working') return
      this.state = 'working'

      const login = await deconfClient.auth.login(
        this.emailAddress,
        this.redirect
      )

      if (!login) {
        this.state = 'error'
        return
      }

      this.token = login.token
      this.mode = 'code'
      this.state = 'input'
    },
    async submitCode() {
      if (this.state === 'working') return
      this.state = 'working'

      const result = await deconfClient.auth.verify(
        this.oneTimeCode,
        this.token
      )

      if (!result) {
        this.state = 'error'
        return
      }

      const params = new URLSearchParams({ token: result.token })
      if (this.redirect) params.set('redirect', this.redirect)

      const url = new URL('_auth', env.SELF_URL)
      url.hash = params.toString()

      location.href = url.toString()
    },
    startAgain() {
      this.oneTimeCode = ''
      this.mode = 'email'
      this.state = 'input'
      this.$router.push({ name: Routes.Login })
    },
  },
})
</script>

<style lang="scss">
.loginView-appCode,
.loginView-oauth {
  margin-block-start: 3em;
}
</style>
