<template>
  <!-- <pre>{{ room }}</pre> -->
  <TimelineTemplate v-if="room" :config="config" class="roomView" />
  <NotFoundView v-else />
</template>

<script lang="ts">
import type { PageConfig, TimelineOptions } from '@/lib/constants'
import { mapApiState } from '@/lib/deconf-hacks.ts'
import { getRooms, type Room } from '@/lib/rooms.ts'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import { defineComponent } from 'vue'
import NotFoundView from './NotFoundView.vue'

type Config = PageConfig<string, TimelineOptions>

export default defineComponent({
  components: { TimelineTemplate, NotFoundView },
  props: {
    roomId: { type: String, required: true },
  },
  computed: {
    ...mapApiState('api', ['schedule']),
    room(): Room {
      const rooms = getRooms(this.schedule?.tracks ?? [])
      return rooms.find((r) => r.slug === this.roomId)!
    },
    config(): Config {
      return {
        path: 'not_used',
        name: `room_${this.roomId}`,
        kind: 'room',
        title: this.room.name as Record<string, string>,
        options: {
          filter: `tracks=${this.room.id}`,
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
