<template>
  <div class="collageTemplate" v-if="configuredSchedule && filteredSessions">
    <div class="collageTemplate-header">
      <h1 class="collageTemplate-title">
        <slot name="title">
          {{ localePageTitle }}
        </slot>
      </h1>
      <div class="collageTemplate-content">
        <slot name="info">
          <ApiContent :slug="config.name" />
        </slot>
      </div>
      <ScheduleFilters
        :schedule="configuredSchedule"
        :filters="filters"
        @filter="onFilter"
        :enabled-filters="(config.options.controls as any[])"
        :language-options="languages"
      />
    </div>
    <div class="collageTemplate-sessions">
      <NoResults v-if="filteredSessions.length === 0">
        <slot name="noResults">
          {{ $t('mozfest.general.noResults') }}
        </slot>
      </NoResults>

      <SessionBoard>
        <CollagedSession
          v-for="session in filteredSessions"
          :key="session.id"
          :session="session"
        />
      </SessionBoard>
    </div>
  </div>
</template>

<script lang="ts">
import CollagedSession from '@/components/CollagedSession.vue'
import {
  createSessionPredicate,
  getLanguageOptions,
  mapApiState,
  type CollageOptions,
  type PageConfig,
  type ScheduleRecord,
} from '@/lib/module.js'
import type { Session } from '@openlab/deconf-shared'
import {
  filterScheduleFromSessions,
  ScheduleFilters,
  loadScheduleFilters,
  encodeScheduleFilters,
  scheduleComputed,
  type ScheduleConfig,
  type ScheduleFilterRecord,
  type SelectOption,
  decodeUrlScheduleFilters,
  NoResults,
  createFilterPredicate,
  SessionBoard,
  ApiContent,
  localiseFromObject,
} from '@openlab/deconf-ui-toolkit'
import { defineComponent, type PropType } from 'vue'

type Config = PageConfig<string, CollageOptions>

export interface _Data {
  filterKey: string
  languages: SelectOption[]
  filters: ScheduleFilterRecord
}

export default defineComponent({
  components: {
    ScheduleFilters,
    NoResults,
    CollagedSession,
    SessionBoard,
    ApiContent,
  },
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true,
    },
  },
  data(): _Data {
    const filterKey = `collage_${this.$props.config.name}`
    return {
      filterKey,
      languages: getLanguageOptions(),
      filters:
        decodeUrlScheduleFilters(this.$route.query) ||
        loadScheduleFilters(filterKey),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },
    configPredicate() {
      return createSessionPredicate(this.config.options.filter)
    },
    configuredSessions(): Session[] | null {
      if (!this.schedule) return null
      return this.schedule.sessions.filter((s) => this.configPredicate(s))
    },
    filteredSessions(): Session[] | null {
      if (!this.schedule || !this.configuredSessions) return null

      const userPredicate = createFilterPredicate(
        this.$i18n.locale,
        this.filters,
        this.schedule
      )

      return this.configuredSessions.filter(
        (s) =>
          this.configPredicate(s) && (userPredicate ? userPredicate(s) : true)
      )
    },
    configuredSchedule(): ScheduleRecord | null {
      if (!this.schedule || !this.configuredSessions) return null
      return filterScheduleFromSessions(
        this.schedule,
        this.configuredSessions
      ) as ScheduleRecord
    },
    localePageTitle(): string {
      return localiseFromObject(this.$i18n.locale, this.config.title) ?? ''
    },
  },
  methods: {
    onFilter(filters: ScheduleFilterRecord) {
      this.filters = filters

      this.$router.replace({ query: encodeScheduleFilters(filters) })

      window.setTimeout(() => {
        const encoded = encodeScheduleFilters(filters)
        localStorage.setItem(this.filterKey, JSON.stringify(encoded))
      })
    },
  },
})
</script>

<style lang="scss">
$collageTemplate-background: $background !default;
$collageTemplate-titleSize: $size-3 !default;
$collageTemplate-titleWeight: bold !default;
$collageTemplate-titleFamily: $family-title !default;

.collageTemplate {
  flex: 1; // Fill AppLayout
  background: $collageTemplate-background;
  padding-bottom: $block-spacing * 5;
}
.collageTemplate-header {
  padding: $block-spacing;
  background-color: $white;
  border-bottom: 1px solid $border;
}
.collageTemplate-title {
  font-size: $collageTemplate-titleSize;
  font-weight: $collageTemplate-titleWeight;
  font-family: $collageTemplate-titleFamily;
}
.collageTemplate-content {
  margin-bottom: 0.5rem;
}
.collageTemplate-sessions {
}

.collageGrid {
}
.collageGrid-session {
}
</style>
