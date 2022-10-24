<template>
  <MozAppLayout>
    <WhatsOnView
      v-if="apiState === 'ready'"
      :schedule="schedule"
      :sessions="filteredSessions"
      :filters-key="filtersKey"
      :enabled-filters="enabledFilters"
      :config="config"
      slot-state="future"
      :language-options="languages"
      :url-filters="urlFilters"
      @filter="onFilter"
      :readonly="!scheduleIsLive"
    >
      <span slot="title">{{ $t('mozfest.whatsOn.title') }}</span>
      <ApiContent slot="info" slug="whats-on-filters" />
      <span slot="noResults">{{ $t('mozfest.whatsOn.noResults') }}</span>
    </WhatsOnView>
    <InlineLoading v-else>
      {{ $t('mozfest.whatsOn.loading') }}
    </InlineLoading>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  mapApiState,
  ScheduleConfig,
  ScheduleFilterRecord,
  SelectOption,
  WhatsOnView,
} from '@openlab/deconf-ui-toolkit'
import { Session } from '@openlab/deconf-shared'
import { StorageKey, getLanguageOptions, guardRoute } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'
import { mapWhatsOnState } from '@/store/module'

interface Data {
  filtersKey: string
  enabledFilters: Array<keyof ScheduleFilterRecord>
  config: ScheduleConfig
  languages: SelectOption[]
  urlFilters: ScheduleFilterRecord | null
}

export default Vue.extend({
  components: { MozAppLayout, WhatsOnView, InlineLoading, ApiContent },
  data(): Data {
    return {
      filtersKey: StorageKey.WhatsOnFilters,
      enabledFilters: ['query', 'sessionType', 'track'],
      config: {
        tileHeader: ['type'],
        tileAttributes: ['track', 'languages'],
      },
      languages: getLanguageOptions(),
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    ...mapWhatsOnState('whatsOn', ['apiState', 'sessions']),
    filteredSessions(): Session[] {
      if (!this.schedule || !this.sessions) return []

      // Custom filtering here

      return this.sessions
    },
    scheduleIsLive(): boolean {
      return Boolean(this.schedule?.settings.schedule.enabled)
    },
  },
  created() {
    guardRoute(this.schedule?.settings, 'whatsOn', this.user, this.$router)
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.$store.commit(
        'whatsOn/sessions',
        await this.$store.dispatch('api/fetchWhatsOn')
      )
    },
    onFilter(filters: ScheduleFilterRecord) {
      this.$router.replace({
        query: encodeScheduleFilters(filters),
      })
    },
  },
})
</script>
