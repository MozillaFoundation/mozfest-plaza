<template>
  <MozAppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
    >
      <span slot="title">{{ $t('deconf.schedule.title') }}</span>
      <ApiContent slot="infoText" slug="schedule-filters" />
      <span slot="noResults">{{ $t('deconf.schedule.noResults') }}</span>
    </FilteredScheduleView>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import { ApiContent, mapApiState } from '@openlab/deconf-ui-toolkit'
import {
  StorageKey,
  getLanguageOptions,
  guardRoute,
  FilteredScheduleOptions,
} from '@/lib/module'
import { Session } from '@openlab/deconf-shared'
import FilteredScheduleView from '@/components/FilteredScheduleView.vue'

const typeAllowList = new Set([
  'discussion',
  'workshop',
  'extended-workshop',
  'social-moments',
  'broadcast-talk',
  'community-plenary',
])

function predicate(session: Session): boolean {
  return typeAllowList.has(session.type)
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { MozAppLayout, FilteredScheduleView, ApiContent },
  data(): Data {
    return {
      options: {
        predicate: (s) => predicate(s),
        filtersKey: StorageKey.ScheduleFilters,
        scheduleConfig: {
          tileHeader: ['type'],
          tileAttributes: ['languages', 'recorded', 'track', 'themes'],
        },
        enabledFilters: [
          'query',
          'sessionType',
          'track',
          'language',
          'date',
          'isRecorded',
          'theme',
        ],
        languages: getLanguageOptions(),
      },
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
  },
  created() {
    guardRoute(this.schedule?.settings, 'schedule', this.user, this.$router)
  },
})
</script>
