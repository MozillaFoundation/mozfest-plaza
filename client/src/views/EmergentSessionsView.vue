<template>
  <MozAppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
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
          <span class="icon ltr-only">
            <fa-icon :icon="['fas', 'arrow-right']" />
          </span>
          <span class="icon rtl-only">
            <fa-icon :icon="['fas', 'arrow-left']" />
          </span>
        </a>
      </ApiContent>
      <span slot="noResults">{{ $t('mozfest.emergent.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.emergent.loading') }}
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

const typeAllowList = new Set(['emergent-session'])

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
        filtersKey: StorageKey.EmergentSessionsFilters,
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
    guardRoute(
      this.schedule?.settings,
      'emergentSessions',
      this.user,
      this.$router
    )
  },
})
</script>
