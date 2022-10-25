<template>
  <UtilLayout>
    <ProfileView
      v-if="user && profile"
      api-module="api"
      :fields="fields"
      @logout="onLogout"
      @unregister="onUnregister"
    >
      <PrivateCalendarCreator slot="preActions" api-module="api" />
    </ProfileView>
  </UtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  FullAuthToken,
  PrivateCalendarCreator,
  ProfileField,
  ProfileView,
} from '@openlab/deconf-ui-toolkit'

import UtilLayout from '@/components/MozUtilLayout.vue'
import languageData from '@/data/languages.json'
import { mapApiState, StorageKey } from '@/lib/module'

export default Vue.extend({
  components: { UtilLayout, ProfileView, PrivateCalendarCreator },
  computed: {
    ...mapApiState('api', ['user', 'profile']),
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
          value: languageData[this.user.user_lang],
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
