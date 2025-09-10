<template>
  <div v-if="isAdmin && status">
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
import { defineComponent } from 'vue'
import { FontAwesomeIcon, Stack } from '@openlab/deconf-ui-toolkit'
import { apiClient, mapApiState } from '@/lib/module'

export interface _Data {
  status: PretalxStatus | null
  timerId: number | null
}

interface PretalxStatus {
  isRunning: boolean
  isEnabled: boolean
}

export default defineComponent({
  components: { FontAwesomeIcon, Stack },
  data(): _Data {
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
  },
  mounted() {
    if (!this.isAdmin) return

    this.fetchStatus()
    this.timerId = window.setInterval(() => this.fetchStatus(), 1000)
  },
  unmounted() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  },
  methods: {
    /** Fetch the pretalx status from the API */
    async fetchStatus() {
      this.status = await apiClient.fetchJson<PretalxStatus>('admin/pretalx')
    },

    /** Start a pretalx scrape */
    async startScrape() {
      if (this.status?.isEnabled === false) {
        alert('Pretalx regeneration is not enabled')
        return
      }

      const confirmed = confirm('Are you sure?')
      if (!confirmed) return

      const result = await apiClient.fetchJson('admin/pretalx', {
        method: 'post',
      })

      if (result === null) alert('Failed to start regeneration')
    },
  },
})
</script>
