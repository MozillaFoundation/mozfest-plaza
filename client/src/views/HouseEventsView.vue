<template>
  <MozAppLayout>
    <ScheduleView
      v-if="filteredSessions != null"
      :schedule="schedule"
      :sessions="filteredSessions"
      :user-sessions="userSessions || []"
      :filters-key="filtersKey"
      :config="config"
      :schedule-date="scheduleDate"
      :enabled-filters="enabledFilters"
      :is-during-conference="isDuringConference"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
    >
      <p slot="title">{{ $t('mozfest.houseEvents.title') }}</p>
      <p slot="infoText">{{ $t('mozfest.houseEvents.info') }}</p>
      <p slot="noResults">{{ $t('mozfest.houseEvents.noResults') }}</p>
    </ScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.houseEvents.loading') }}
    </InlineLoading>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import {
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  isDuringConference,
  mapApiState,
  ScheduleConfig,
  ScheduleFilterRecord,
  ScheduleView,
  SelectOption,
} from '@openlab/deconf-ui-toolkit'
import { StorageKey, getLanguageOptions } from '@/lib/module'
import { Session } from '@openlab/deconf-shared'
import InlineLoading from '@/components/InlineLoading.vue'

const sessionTypeAllowList = new Set(['mozfest-house'])

interface Data {
  filtersKey: string
  config: ScheduleConfig
  enabledFilters: Array<keyof ScheduleFilterRecord>
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

export default Vue.extend({
  components: { MozAppLayout, ScheduleView, InlineLoading },
  data(): Data {
    return {
      filtersKey: StorageKey.HouseEventsFilters,
      enabledFilters: ['query', 'track', 'language', 'theme'],
      config: {
        tileHeader: ['track'],
        tileAttributes: ['languages', 'themes'],
      },
      languages: getLanguageOptions(),
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate(): Date {
      return this.$dev.scheduleDate || this.$temporal.date
    },
    filteredSessions(): Session[] {
      if (!this.schedule) return []

      return this.schedule.sessions.filter((s) =>
        sessionTypeAllowList.has(s.type)
      )
    },
    isDuringConference(): boolean {
      // TODO: custom date range for these events
      return isDuringConference(
        this.scheduleDate,
        this.schedule?.settings ?? null
      )
    },
  },
  methods: {
    onFilter(filters: ScheduleFilterRecord) {
      this.$router.replace({
        query: encodeScheduleFilters(filters),
      })
    },
  },
})
</script>

<style lang="scss">
// ...
</style>
