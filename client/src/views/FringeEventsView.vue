<template>
  <MozAppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
    >
      <span slot="title">{{ $t('mozfest.fringeEvents.title') }}</span>
      <ApiContent slot="infoText" slug="fringe-filters" />
      <span slot="noResults">{{ $t('mozfest.fringeEvents.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.fringeEvents.loading') }}
    </InlineLoading>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'

import { ApiContent, mapApiState } from '@openlab/deconf-ui-toolkit'
import { Session } from '@openlab/deconf-shared'
import {
  FilteredScheduleOptions,
  getLanguageOptions,
  guardRoute,
  StorageKey,
} from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'
import FilteredScheduleView from '@/components/FilteredScheduleView.vue'

const typeAllowList = new Set(['fringe-events'])

function predicate(session: Session): boolean {
  return typeAllowList.has(session.type)
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { MozAppLayout, FilteredScheduleView, InlineLoading, ApiContent },
  data(): Data {
    return {
      options: {
        predicate: (s) => predicate(s),
        filtersKey: StorageKey.FringeEventsFilters,
        enabledFilters: ['query', 'track', 'language', 'date', 'theme'],
        scheduleConfig: {
          tileHeader: ['track'],
          tileAttributes: ['themes'],
        },
        languages: getLanguageOptions(),
      },
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
  },
  mounted() {
    guardRoute(this.schedule?.settings, 'fringe', this.user, this.$router)
  },
})
</script>
