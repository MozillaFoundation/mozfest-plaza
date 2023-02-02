<template>
  <UtilLayout>
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
    </article>
  </UtilLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import UtilLayout from '@/components/MozUtilLayout.vue'
import {
  PrimaryEmbed,
  SecondaryEmbed,
  TextField,
} from '@openlab/deconf-ui-toolkit'

interface Data {
  primaryUrl: string
  secondaryUrl: string
  primaryExamples: readonly string[]
  secondaryExamples: readonly string[]
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
  'https://vimeo.com/event/2816447/chat/',
])

export default Vue.extend({
  components: { PrimaryEmbed, SecondaryEmbed, TextField, UtilLayout },
  data(): Data {
    return {
      primaryUrl: 'https://zoom.us/my/123456',
      secondaryUrl: 'https://vimeo.com/event/2816447/chat/',
      primaryExamples,
      secondaryExamples,
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
