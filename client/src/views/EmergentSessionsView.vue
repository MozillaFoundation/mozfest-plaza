<template>
  <AppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
      :schedule-date="scheduleDate"
      :route-query="$route.query"
      @filter="onFilter"
    >
      <span slot="title">{{ $t('mozfest.emergent.title') }}</span>
      <ApiContent slot="infoText" slug="emergent-filters">
        <a
          slot="button"
          class="button is-link"
          style="margin-bottom: 1rem"
          href="https://mozfest.gradu.al/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span> Take Part </span>
          <BidirectionalIcon
            :ltr="['fas', 'arrow-right']"
            :rtl="['fas', 'arrow-left']"
          />
        </a>
      </ApiContent>
      <span slot="noResults">{{ $t('mozfest.emergent.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.emergent.loading') }}
    </InlineLoading>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'

import {
  ApiContent,
  FilteredScheduleOptions,
  FilteredScheduleView,
  guardPage,
} from '@openlab/deconf-ui-toolkit'
import { getLanguageOptions, mapApiState, StorageKey } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

const typeAllowList = new Set(['emergent-session'])

const options: FilteredScheduleOptions = {
  predicate: (s) => typeAllowList.has(s.type),
  filtersKey: StorageKey.EmergentSessionsFilters,
  enabledFilters: ['query', 'track', 'language', 'date', 'theme'],
  scheduleConfig: {
    tileHeader: ['track'],
    tileAttributes: ['themes'],
  },
  languages: getLanguageOptions(),
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { ApiContent, AppLayout, FilteredScheduleView, InlineLoading },
  data: (): Data => ({ options }),
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
  },
  mounted() {
    guardPage(
      this.schedule?.settings?.emergentSessions,
      this.user,
      this.$router
    )
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
