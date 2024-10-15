<template>
  <TimelineTemplate v-if="room" :config="config" class="roomView" />
  <NotFoundView v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import NotFoundView from './NotFoundView.vue'
import rooms from '@/data/rooms.json'
import type { PageConfig, TimelineOptions } from '@/lib/constants'

type Config = PageConfig<string, TimelineOptions>

interface RoughRoom {
  name: Record<string, string>
  id: string
}

export default defineComponent({
  components: { TimelineTemplate, NotFoundView },
  props: {
    roomId: { type: String, required: true },
  },
  computed: {
    room(): RoughRoom {
      return (rooms as Record<string, unknown>)[this.roomId] as RoughRoom
    },
    config(): Config {
      return {
        path: 'not_used',
        name: `room_${this.roomId}`,
        kind: 'room',
        title: this.room.name,
        options: {
          filter: `rooms=${this.room.id}`,
          tile: {
            header: ['type'],
            attributes: ['themes'],
            actions: [],
          },
          controls: [],
        },
      }
    },
  },
})
</script>

<style>
.roomView .scheduleView-viewControl,
.roomView .scheduleFilters,
.roomView .appLayout-header,
.roomView .pageFooter,
.roomView .scheduleView-toggleHistory,
.roomView .appLayout-tabs {
  display: none;
}

.roomView .appLayout-page {
  margin: 0;
}

.roomView .scheduleView-title {
  font-size: 4rem;
}
</style>
