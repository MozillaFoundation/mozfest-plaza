<template>
  <AppLayout>
    <WhatsOnView
      v-if="filteredSessions != null"
      :schedule="filteredSchedule"
      :sessions="filteredSessions"
      :filters-key="options.filtersKey"
      :enabled-filters="options.enabledFilters"
      :config="config"
      slot-state="future"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
      :readonly="config.options.readonly"
    >
      <span slot="title">{{ config.title[$i18n.locale] }}</span>
      <ApiContent slot="info" :slug="config.name" />
      <span slot="noResults">{{ $t('mozfest.general.noResults') }}</span>
    </WhatsOnView>
    <InlineLoading v-else />
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'

import {
  ApiContent,
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  FilteredScheduleOptions,
  filterScheduleFromSessions,
  ScheduleFilterRecord,
  SelectOption,
  WhatsOnView,
} from '@openlab/deconf-ui-toolkit'
import { Session } from '@openlab/deconf-shared'
import {
  createSessionPredicate,
  getLanguageOptions,
  GridOptions,
  mapApiState,
  PageConfig,
  ScheduleRecord,
} from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'
import { PropType } from 'vue/types/v3-component-props'

type Config = PageConfig<'grid', GridOptions>

interface Data {
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

export default Vue.extend({
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
