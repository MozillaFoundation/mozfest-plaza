<template>
  <MozAppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
    >
      <span slot="title">{{ $t('mozfest.misinfoCon.title') }}</span>
      <ApiContent slot="infoText" slug="misinfo-con-filters" />
      <span slot="noResults">{{ $t('mozfest.misinfoCon.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.misinfoCon.loading') }}
    </InlineLoading>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import InlineLoading from '@/components/InlineLoading.vue'
import { ApiContent, mapApiState } from '@openlab/deconf-ui-toolkit'
import {
  StorageKey,
  getLanguageOptions,
  guardRoute,
  FilteredScheduleOptions,
} from '@/lib/module'
import { Session } from '@openlab/deconf-shared'
import FilteredScheduleView from '@/components/FilteredScheduleView.vue'

const typeAllowList = new Set(['misinfocon-discussion', 'misinfocon-workshop'])

function predicate(session: Session): boolean {
  return typeAllowList.has(session.type)
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { MozAppLayout, FilteredScheduleView, ApiContent, InlineLoading },
  data(): Data {
    return {
      options: {
        predicate: (s) => predicate(s),
        filtersKey: StorageKey.MisinfoConFilters,
        scheduleConfig: {
          tileHeader: ['type'],
          tileAttributes: ['languages', 'themes', 'recorded'],
        },
        enabledFilters: ['query', 'sessionType', 'language', 'date', 'theme'],
        languages: getLanguageOptions(),
      },
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
  },
  created() {
    guardRoute(this.schedule?.settings, 'misinfoCon', this.user, this.$router)
  },
})
</script>

<style lang="scss">
// ...
</style>
