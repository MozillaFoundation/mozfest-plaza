<template>
  <MozUtilLayout>
    <article class="utilsView content">
      <h1>Utilities</h1>

      <details class="content">
        <summary>PrimaryEmbed</summary>

        <TextField
          name="primaryUrl"
          id="primaryUrl"
          type="url"
          label="URL"
          v-model="primaryUrl"
        />

        <PrimaryEmbed v-if="isUrl(primaryUrl)" :link="primaryUrl" />
        <p v-else class="notification is-danger">Invalid URL entered</p>

        <p><strong>Examples</strong></p>
        <ul>
          <li v-for="url in primaryExamples" :key="url">
            <code>{{ url }}</code>
          </li>
        </ul>
      </details>

      <details class="content">
        <summary>SecondaryEmbed</summary>

        <TextField
          name="secondaryUrl"
          id="secondaryUrl"
          type="url"
          label="URL"
          v-model="secondaryUrl"
        />

        <SecondaryEmbed v-if="isUrl(secondaryUrl)" :link="secondaryUrl" />
        <p v-else class="notification is-danger">Invalid URL entered</p>

        <p><strong>Examples</strong></p>
        <ul>
          <li v-for="url in secondaryExamples" :key="url">
            <code>{{ url }}</code>
          </li>
        </ul>
      </details>

      <details>
        <summary>Room URLs</summary>
        <ul>
          <li v-for="room in rooms" :key="room.slug">
            <a :href="roomUrl(room.slug)">
              {{ room.name.en }}
            </a>
          </li>
        </ul>
      </details>
    </article>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  PrimaryEmbed,
  SecondaryEmbed,
  TextField,
} from '@openlab/deconf-ui-toolkit'
import type { Localised } from '@openlab/deconf-shared'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import rooms from '@/data/rooms.json'
import router from '@/router/module'

interface Room {
  slug: string
  id: number
  name: Localised
}

interface Data {
  primaryUrl: string
  secondaryUrl: string
  primaryExamples: readonly string[]
  secondaryExamples: readonly string[]
  rooms: Room[]
}

const primaryExamples = Object.freeze([
  'https://player.vimeo.com/video/123456',
  'https://vimeo.com/123456',
  'https://vimeo.com/event/123456',
  'https://vimeo.com/event/123456/embed',

  'https://hosted.panopto.com/Panopto/Pages/Embed.aspx?id=123456',
  'https://twitch.tv/abcdef',
  'https://anchor.fm/abcdef/embed/episodes/123456',
  'https://spatial.chat/s/123456',

  'https://youtube.com?v=123456',
  'https://youtube-nocookie.com?v=123456',
  'https://youtube.com/embed/live_stream?channel=abcdef',
  'https://youtube-nocookie.com/embed/live_stream?channel=abcdef',
  'https://youtu.be/abcdef',

  'https://zoom.us/my/abcdef',
  'https://zoom.us/j/123456789',
  'https://some-org.zoom.us/meeting/register/abcdef',
  'https://meet.google.com/abc-defg-hij',
  'https://teams.microsoft.com/*',

  'https://hubs.mozilla.com/abcdef',
  'https://hub.link/abcdef',
  'https://hubs.mozillafestival.org/abcdef',

  'https://cinnamon.video/watch?v=123456',
  'https://cinnamon.video/embed?v=123456',
])

const secondaryExamples = Object.freeze([
  'https://vimeo.com/live-chat/123456/',
  'https://vimeo.com/event/123456/chat/interaction/',
  'https://vimeo.com/event/123456/chat/',
])

export default defineComponent({
  components: { PrimaryEmbed, SecondaryEmbed, TextField, MozUtilLayout },
  data(): Data {
    return {
      primaryUrl: 'https://zoom.us/my/123456',
      secondaryUrl: 'https://vimeo.com/event/123456/chat/',
      primaryExamples,
      secondaryExamples,
      rooms: Object.entries(rooms)
        .map(([slug, room]) => ({ ...room, slug } as Room))
        .sort((a, b) => a.name.en!.localeCompare(b.name.en!)),
    }
  },
  methods: {
    isUrl(input: string) {
      try {
        new URL(input)
        return true
      } catch {
        return false
      }
    },
    roomUrl(roomId: string) {
      const r = router.resolve({ name: 'room', params: { roomId } })
      return r.href
    },
  },
})
</script>

<style>
.utilsView .secondaryEmbed {
  max-width: 400px;
}

.utilsView details > * + * {
  margin-block-start: 1em;
}
</style>
