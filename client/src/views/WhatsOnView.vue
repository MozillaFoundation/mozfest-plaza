<template>
  <AppLayout>
    <WhatsOnView
      v-if="apiState === 'ready'"
      :schedule="schedule"
      :sessions="filteredSessions"
      :filters-key="filtersKey"
      :enabled-filters="enabledFilters"
      :config="config"
      slot-state="future"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
      :readonly="!scheduleIsLive"
    >
      <template v-slot:title>
        <span>{{ $t('mozfest.whatsOn.title') }}</span>
      </template>
      <template v-slot:info>
        <ApiContent slug="whats-on-filters" />
      </template>
      <template v-slot:noResults>
        <span>{{ $t('mozfest.general.noResults') }}</span>
      </template>
    </WhatsOnView>
    <InlineLoading v-else />
  </AppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  guardPage,
  type ScheduleConfig,
  type ScheduleFilterRecord,
  type SelectOption,
  WhatsOnView,
} from '@openlab/deconf-ui-toolkit'
import type { Session } from '@openlab/deconf-shared'
import { StorageKey, getLanguageOptions, mapApiState } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'
import { mapWhatsOnState } from '@/store/module'

interface Data {
  filtersKey: string
  enabledFilters: Array<keyof ScheduleFilterRecord>
  config: ScheduleConfig
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

// TODO: how can this use GridTemplate when it fetches its own sessions?

export default defineComponent({
  components: { AppLayout, WhatsOnView, InlineLoading, ApiContent },
  data(): Data {
    return {
      filtersKey: StorageKey.WhatsOnFilters,
      enabledFilters: ['query', 'sessionType', 'track', 'language'],
      config: {
        tileHeader: ['type'],
        tileAttributes: ['track', 'languages'],
      },
      languages: getLanguageOptions(),
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    ...mapWhatsOnState('whatsOn', ['apiState', 'sessions']),
    filteredSessions(): Session[] {
      if (!this.schedule || !this.sessions) return []

      // Custom filtering here

      return this.sessions
    },
    scheduleIsLive(): boolean {
      return Boolean(this.schedule?.settings.schedule.enabled)
    },
  },
  created() {
    guardPage(this.schedule?.settings.whatsOn, this.user, this.$router)
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.$store.commit(
        'whatsOn/sessions',
        await this.$store.dispatch('api/fetchWhatsOn'),
      )
    },
    onFilter(filters: ScheduleFilterRecord) {
      this.$router.replace({
        query: encodeScheduleFilters(filters),
      })
    },
  },
})
</script>
