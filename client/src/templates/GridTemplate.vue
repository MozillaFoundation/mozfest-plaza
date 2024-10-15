<template>
  <AppLayout>
    <WhatsOnView
      v-if="filteredSchedule && filteredSessions != null"
      :schedule="filteredSchedule"
      :sessions="filteredSessions"
      :filters-key="options.filtersKey"
      :enabled-filters="options.enabledFilters"
      :config="options.scheduleConfig"
      slot-state="future"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
      :readonly="config.options.readonly"
    >
      <template v-slot:title>
        <span>{{ config.title[$i18n.locale] }}</span>
      </template>
      <template v-slot:info>
        <ApiContent :slug="config.name" />
      </template>
      <template v-slot:noResults>
        <span>{{ $t('mozfest.general.noResults') }}</span>
      </template>
    </WhatsOnView>
    <InlineLoading v-else />
  </AppLayout>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineComponent, type PropType } from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'

import {
  ApiContent,
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  type FilteredScheduleOptions,
  filterScheduleFromSessions,
  type ScheduleFilterRecord,
  type SelectOption,
  WhatsOnView,
} from '@openlab/deconf-ui-toolkit'
import type { Session } from '@openlab/deconf-shared'
import {
  createSessionPredicate,
  getLanguageOptions,
  type GridOptions,
  mapApiState,
  type PageConfig,
  type ScheduleRecord,
} from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

type Config = PageConfig<string, GridOptions>

interface Data {
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

export default defineComponent({
  components: { AppLayout, WhatsOnView, InlineLoading, ApiContent },
  props: {
    config: { type: Object as PropType<Config>, required: true },
  },
  data(): Data {
    return {
      languages: getLanguageOptions(),
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    options(): FilteredScheduleOptions {
      const { filter, tile, controls } = this.config.options
      return {
        predicate: createSessionPredicate(filter),
        filtersKey: `grid_${this.config.name}`,
        enabledFilters: controls as any[],
        languages: getLanguageOptions(),
        scheduleConfig: {
          tileHeader: tile.header as any[],
          tileAttributes: tile.attributes as any[],
          tileActions: tile.actions as any[],
        },
      }
    },
    filteredSessions(): Session[] | null {
      if (!this.schedule) return null

      return this.schedule.sessions.filter((s) => this.options.predicate(s))
    },
    filteredSchedule(): ScheduleRecord | null {
      if (!this.schedule || !this.filteredSessions) return null
      return filterScheduleFromSessions(this.schedule, this.filteredSessions)
    },
  },
  created() {
    // TODO: should this be migrated?
    //
    // guardPage(this.schedule?.settings.arts, this.user, this.$router)
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
