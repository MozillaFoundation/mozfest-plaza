<template>
  <AppLayout>
    <WhatsOnView
      v-if="filteredSessions != null"
      :schedule="filteredSchedule"
      :sessions="filteredSessions"
      :filters-key="filtersKey"
      :enabled-filters="enabledFilters"
      :config="config"
      slot-state="future"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
      :readonly="false"
    >
      <span slot="title">{{ $t('mozfest.skillShare.title') }}</span>
      <ApiContent slot="info" slug="lightning-talks-filters" />
      <span slot="noResults">{{ $t('mozfest.skillShare.noResults') }}</span>
    </WhatsOnView>
    <InlineLoading v-else>
      {{ $t('mozfest.skillShare.loading') }}
    </InlineLoading>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'

import {
  ApiContent,
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  filterScheduleFromSessions,
  guardPage,
  ScheduleConfig,
  ScheduleFilterRecord,
  SelectOption,
  WhatsOnView,
} from '@openlab/deconf-ui-toolkit'
import { Session } from '@openlab/deconf-shared'
import { getLanguageOptions, mapApiState, StorageKey } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

interface Data {
  filtersKey: string
  enabledFilters: (keyof ScheduleFilterRecord)[]
  config: ScheduleConfig
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

const sessionTypeAllowList = new Set(['skill-share--lightning-talk'])

export default Vue.extend({
  components: { AppLayout, WhatsOnView, InlineLoading, ApiContent },
  data(): Data {
    return {
      filtersKey: StorageKey.SkillShareFilters,
      enabledFilters: ['query', 'track', 'language', 'theme'],
      config: {
        tileHeader: ['track'],
        tileAttributes: ['themes'],
      },
      languages: getLanguageOptions(),
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    filteredSessions(): Session[] | null {
      if (!this.schedule) return null

      return this.schedule.sessions.filter((s) =>
        sessionTypeAllowList.has(s.type)
      )
    },
    filteredSchedule(): unknown | null {
      if (!this.schedule || !this.filteredSessions) return null
      return filterScheduleFromSessions(this.schedule, this.filteredSessions)
    },
  },
  created() {
    guardPage(this.schedule?.settings.skillShare, this.user, this.$router)
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
