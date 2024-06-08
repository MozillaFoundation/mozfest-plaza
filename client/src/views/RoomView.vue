<template>
  <TimelineTemplate v-if="room" :config="config" class="roomView" />
  <NotFoundView v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import NotFoundView from './NotFoundView.vue'
import rooms from '@/data/rooms.json'
import { PageConfig, TimelineOptions } from '@/lib/constants'

type Config = PageConfig<'room', TimelineOptions>

export default Vue.extend({
  components: { TimelineTemplate, NotFoundView },
  props: {
    roomId: { type: String, required: true },
  },
  computed: {
    room(): any {
      console.log(rooms)

      return rooms[this.roomId]
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
