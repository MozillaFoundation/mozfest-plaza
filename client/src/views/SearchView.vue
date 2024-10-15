<template>
  <AppLayout>
    <div class="searchView">
      <div class="searchView-header">
        <ApiContent slug="search" />
        <div class="inlineField">
          <label class="button is-static is-size-5" for="searchQuery">
            {{ $t('mozfest.searchView.search') }}
          </label>
          <input
            id="searchQuery"
            type="text"
            class="input is-size-5"
            :value="query"
            @input="onQuery"
          />
        </div>
      </div>
      <div class="searchView-results">
        <NoResults v-if="filteredSessions.length === 0">
          <template v-if="query">
            {{ $t('mozfest.searchView.noResults') }}
          </template>
          <template v-else>
            {{ $t('mozfest.searchView.prompt') }}
          </template>
        </NoResults>

        <SessionBoard v-else>
          <SessionTile
            v-for="session in filteredSessions"
            :key="session.id"
            slot-state="future"
            :session="session"
            :schedule="schedule"
            :config="config"
          />
        </SessionBoard>
      </div>
    </div>
  </AppLayout>
</template>

<script lang="ts">
import AppLayout from '@/components/MozAppLayout.vue'
import { mapApiState } from '@/lib/module'
import {
  ApiContent,
  createQueryPredicate,
  debounce,
  type Debounced,
  guardPage,
  NoResults,
  type ScheduleConfig,
  SessionBoard,
  type SessionPredicate,
  SessionTile,
} from '@openlab/deconf-ui-toolkit'
import { defineComponent } from 'vue'

interface Data {
  query: string
  triggerQuery: Debounced<[string]> | null
  config: ScheduleConfig
}

const config: ScheduleConfig = {
  tileHeader: ['type'],
  tileAttributes: ['track', 'themes'],
}

export default defineComponent({
  components: { AppLayout, ApiContent, NoResults, SessionBoard, SessionTile },
  data(): Data {
    return {
      query: '',
      triggerQuery: null,
      config,
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    predicate(): SessionPredicate | null {
      return createQueryPredicate(this.$i18n.locale, this.query, this.schedule)
    },
    filteredSessions() {
      if (!this.schedule || !this.query) return []
      const predicate = createQueryPredicate(
        this.$i18n.locale,
        this.query,
        this.schedule,
      )
      if (!predicate) return this.schedule.sessions
      return this.schedule.sessions.filter((s) => predicate(s)).slice(0, 50)
    },
  },
  mounted() {
    guardPage(this.schedule?.settings.search, this.user, this.$router)
    this.triggerQuery = debounce(300, (value) => (this.query = value))
  },
  methods: {
    onQuery(e: InputEvent) {
      if (!this.triggerQuery) return
      this.triggerQuery((e.target as HTMLInputElement).value)
    },
  },
})
</script>

<style lang="scss">
.searchView {
  flex: 1; // Fill AppLayout
  background: $background;
  padding-bottom: $block-spacing * 5;
}
.searchView-header {
  padding: $block-spacing;
  background-color: $white;
  border-bottom: 1px solid $border;
}
.searchView-header h1 {
  font-size: $size-3;
  font-weight: bold;
  margin: 0;
}
.searchView .input {
  width: 320px;
  max-width: 100%;
}
.searchView .inlineField label {
  pointer-events: all;
}
</style>
