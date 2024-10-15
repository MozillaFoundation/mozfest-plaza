<template>
  <AppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions ?? undefined"
      :options="options"
      :schedule-date="scheduleDate"
      :route-query="route.query"
      @filter="onFilter"
    >
      <template v-slot:title>
        <span>{{ config.title[$i18n.locale] }}</span>
      </template>
      <template v-slot:infoText>
        <ApiContent :slug="config.name" />
      </template>
      <template v-slot:noResults>
        <span>{{ $t('mozfest.general.noResults') }}</span>
      </template>
    </FilteredScheduleView>
  </AppLayout>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineComponent, type PropType } from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  type FilteredScheduleOptions,
  FilteredScheduleView,
} from '@openlab/deconf-ui-toolkit'
import {
  getLanguageOptions,
  mapApiState,
  type TimelineOptions,
  type PageConfig,
  createSessionPredicate,
} from '@/lib/module'
import { useRoute } from 'vue-router'

type Config = PageConfig<string, TimelineOptions>

export default defineComponent({
  components: { AppLayout, FilteredScheduleView, ApiContent },
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate(): Date {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
    options(): FilteredScheduleOptions {
      const { filter, tile, controls } = this.config.options
      return {
        predicate: createSessionPredicate(filter),
        filtersKey: `timeline_${this.config.name}`,
        enabledFilters: controls as any[],
        languages: getLanguageOptions(),
        scheduleConfig: {
          tileHeader: tile.header as any[],
          tileAttributes: tile.attributes as any[],
          tileActions: tile.actions as any[],
        },
      }
    },
  },
  mounted() {
    // TODO: should this be migrated?
    //
    // const pages = this.schedule?.settings[this.options.]
    // guardPage(this.schedule?.settings.schedule, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
