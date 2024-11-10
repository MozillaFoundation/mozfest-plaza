<script lang="ts" setup>
import { ref } from 'vue'
import {
  PrimaryEmbed,
  SecondaryEmbed,
  TextField,
} from '@openlab/deconf-ui-toolkit'
import type { Localised } from '@openlab/deconf-shared'

import MozUtilLayout from '@/components/MozUtilLayout.vue'
import { ExtraRoutes } from '@/lib/constants'
import rawRooms from '@/data/rooms.json'
import { useRouter } from 'vue-router'

const messagingRoute = { name: ExtraRoutes.AdminMessaging }
const scheduleRoute = { name: ExtraRoutes.AdminSchedule }

interface Room {
  slug: string
  id: number
  name: Localised
}

const rooms = Object.entries(rawRooms)
  .map(([slug, room]) => ({ ...room, slug } as Room))
  .sort((a, b) => a.name.en!.localeCompare(b.name.en!))

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
])

const primaryEmbedUrl =
  'https://ui.deconf.app/?path=/story/session-primaryembed--youtube-full'

const secondaryExamples = Object.freeze([
  'https://vimeo.com/live-chat/123456/',
  'https://vimeo.com/event/123456/chat/interaction/',
  'https://vimeo.com/event/123456/chat/',
])

const secondaryEmbedUrl =
  'https://ui.deconf.app/?path=/story/session-secondaryembed--vimeo-chat'

function isUrl(input: string) {
  try {
    new URL(input)
    return true
  } catch {
    return false
  }
}

const primaryUrl = ref('https://zoom.us/my/123456')
const secondaryUrl = ref('https://vimeo.com/event/123456/chat/')
const router = useRouter()

function roomUrl(roomId: string) {
  const r = router.resolve({ name: 'room', params: { roomId } })
  return r.href
}
</script>

<template>
  <MozUtilLayout>
    <div class="content">
      <h1 class="title">Admin</h1>
      <p class="subtitle">These pages are to help administrate the website</p>

      <p class="buttons">
        <RouterLink :to="messagingRoute" class="button is-link">
          Messaging →
        </RouterLink>
        <RouterLink :to="scheduleRoute" class="button is-link">
          Schedule →
        </RouterLink>
      </p>

      <p>Below are some useful tools to help with content.</p>

      <details>
        <summary>Room URLs</summary>
        <ul>
          <li v-for="room in rooms" :key="room.id">
            <a :href="roomUrl(room.slug)" target="_blank">
              {{ room.name.en }}
            </a>
          </li>
        </ul>
      </details>

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

        <p><a :href="primaryEmbedUrl" target="_blank">More examples →</a></p>
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

        <p><a :href="secondaryEmbedUrl" target="_blank">More examples →</a></p>
      </details>
    </div>
  </MozUtilLayout>
</template>
