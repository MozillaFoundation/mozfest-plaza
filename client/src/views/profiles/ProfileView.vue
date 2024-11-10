<template>
  <MozUtilLayout>
    <ProfileView
      v-if="user && profile"
      api-module="api"
      :fields="fields"
      @logout="onLogout"
      @unregister="onUnregister"
    >
      <template v-slot:preActions>
        <div class="buttons">
          <router-link
            class="button is-primary"
            :to="calendarRoute"
            v-if="settings?.features.calendarSync"
          >
            {{ $t('mozfest.profile.calendar') }}
          </router-link>
          <router-link
            class="button is-primary"
            :to="notificationsRoute"
            v-if="settings?.features.webPush"
          >
            {{ $t('mozfest.profile.notifications') }}
          </router-link>
        </div>
      </template>
    </ProfileView>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  type FullAuthToken,
  type ProfileField,
  ProfileView,
} from '@openlab/deconf-ui-toolkit'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import languageData from '@/data/languages.json'
import { ExtraRoutes, mapApiState, StorageKey } from '@/lib/module'
import type { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  components: { MozUtilLayout, ProfileView },

  computed: {
    ...mapApiState('api', ['user', 'profile', 'settings']),
    fields(): ProfileField[] {
      if (!this.user || !this.profile) return []
      return [
        {
          label: this.$t('deconf.profile.mozfest.nameText'),
          value: this.profile.name,
        },
        {
          label: this.$t('deconf.profile.mozfest.emailText'),
          value: this.profile.email,
        },
        {
          label: this.$t('deconf.profile.mozfest.localeText'),
          value: (languageData as Record<string, string>)[this.user.user_lang],
        },
        {
          label: this.$t('deconf.profile.mozfest.registeredText'),
          value: this.profile.created.toLocaleString(),
        },
        {
          label: this.$t('deconf.profile.mozfest.whenText'),
          value: this.iatToString((this.user as FullAuthToken).iat),
        },
      ]
    },
    calendarRoute(): RouteLocationRaw {
      return { name: ExtraRoutes.ProfileCalendar }
    },
    notificationsRoute(): RouteLocationRaw {
      return { name: ExtraRoutes.ProfileNotifications }
    },
  },
  mounted() {
    this.fetchProfile()
  },
  methods: {
    async fetchProfile() {
      await this.$store.dispatch('api/fetchProfile')
      if (!this.profile) this.onLogout()
    },
    onLogout() {
      localStorage.removeItem(StorageKey.AuthToken)

      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
    async onUnregister() {
      localStorage.removeItem(StorageKey.AuthToken)

      setTimeout(() => {
        window.location.reload()
      }, 500)
    },

    //
    // Formatters
    //
    iatToString(iat: number) {
      const date = new Date(iat * 1000)
      date.setMinutes(
        date.getMinutes() + date.getTimezoneOffset(),
        date.getSeconds(),
        date.getMilliseconds()
      )
      return date.toLocaleString()
    },
    boolToString(value: boolean) {
      return value ? this.$t('ifrc.general.yes') : this.$t('ifrc.general.no')
    },
  },
})
</script>

<style lang="scss">
// .profileView-heading {
//   font-weight: bold;
//   font-size: $size-5;
//   margin-bottom: 0.3em;
// }
</style>
