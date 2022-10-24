<template>
  <div class="devControl-block" v-if="isAdmin && status">
    <template v-if="status.isRunning">
      <Stack direction="horizontal" gap="regular" align="center">
        <FontAwesomeIcon :icon="['fas', 'sync']" spin size="xl" />
        <p>
          Fetching the schedule from pretalx, this can take up to 5 minutes.
        </p>
      </Stack>
    </template>
    <button
      v-else
      class="button is-fullwidth is-primary is-light"
      @click="startScrape"
    >
      Force schedule regeneration
    </button>
  </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapApiState, Stack } from '@openlab/deconf-ui-toolkit'
import { KyInstance } from 'ky/distribution/types/ky'
import Vue from 'vue'

interface Data {
  status: PretalxStatus | null
  timerId: number | null
}

interface PretalxStatus {
  isRunning: boolean
  isEnabled: boolean
}

export default Vue.extend({
  components: { FontAwesomeIcon, Stack },
  data(): Data {
    return {
      status: null,
      timerId: null,
    }
  },
  computed: {
    ...mapApiState('api', ['user']),
    isAdmin(): boolean {
      return Boolean(this.user && this.user.user_roles.includes('admin'))
    },
    pretalxAgent(): KyInstance {
      return this.$store.getters['api/agent']
    },
  },
  mounted() {
    if (!this.isAdmin) return

    this.fetchStatus()
    this.timerId = setInterval(() => this.fetchStatus(), 1000)
  },
  destroyed() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  },
  methods: {
    /** Fetch the pretalx status from the API */
    async fetchStatus() {
      this.status = await this.pretalxAgent
        .get('admin/pretalx')
        .json<PretalxStatus>()
    },

    /** Start a pretalx scrape */
    async startScrape() {
      if (this.status?.isEnabled === false) {
        alert('Pretalx regeneration is not enabled')
        return
      }

      const confirmed = confirm('Are you sure?')
      if (!confirmed) return

      const result = await this.pretalxAgent
        .post('admin/pretalx')
        .catch(() => null)

      if (result === null) alert('Failed to start regeneration')
    },
  },
})
</script>