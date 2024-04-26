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
      <span slot="title">{{ config.title[$i18n.locale] }}</span>
      <ApiContent slot="infoText" :slug="config.name" />
      <span slot="noResults">{{ $t('mozfest.general.noResults') }}</span>
    </FilteredScheduleView>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  FilteredScheduleOptions,
  FilteredScheduleView,
} from '@openlab/deconf-ui-toolkit'
import {
  getLanguageOptions,
  mapApiState,
  TimelineOptions,
  PageConfig,
  createSessionPredicate,
} from '@/lib/module'
import { PropType } from 'vue/types/v3-component-props'

type Config = PageConfig<'timeline', TimelineOptions>

export default Vue.extend({
  components: { AppLayout, FilteredScheduleView, ApiContent },
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true,
    },
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
