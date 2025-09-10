<template>
  <div class="shareSheet">
    <Stack direction="vertical" gap="regular" align="start">
      <h2 class="title">{{ $t('deconf.session.mozfest.share') }}</h2>
      <div class="buttons">
        <button class="button is-mastodon" @click="onMastodon">
          <FontAwesomeIcon class="icon" :icon="['fab', 'mastodon']" />
          <span>Mastodon</span>
        </button>
        <button class="button is-twitter" @click="onTwitter">
          <FontAwesomeIcon class="icon" :icon="['fab', 'twitter']" />
          <span>Tweet</span>
        </button>
        <button class="button is-primary" @click="onCopy">Copy URL</button>
        <button class="button is-secondary" @click="onCancel">Cancel</button>
      </div>
    </Stack>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { FontAwesomeIcon, Stack } from '@openlab/deconf-ui-toolkit'
import type { MozSession } from '@/lib/module'
import copy from 'copy-to-clipboard'

export default defineComponent({
  components: { Stack, FontAwesomeIcon },
  props: {
    session: { type: Object as PropType<MozSession>, required: true },
  },
  computed: {
    url(): string {
      return this.$env.SESSION_SHARE_URL.replace('$1', this.session.id)
    },
  },
  methods: {
    async onCopy() {
      this.track('copy')
      copy(this.url)
      this.$dialog.close()
    },
    onMastodon() {
      this.track('mastodon')
      const url = new URL('https://toot.kytta.dev')
      url.searchParams.set('text', this.url)
      window.open(url)
      this.$dialog.close()
    },
    onTwitter() {
      this.track('twitter')
      const url = new URL('https://twitter.com/intent/tweet')
      url.searchParams.set('text', this.url)
      window.open(url)
      this.$dialog.close()
    },
    onCancel() {
      this.$dialog.close()
    },
    track(kind: string) {
      this.$metrics.track({
        eventName: 'session/share',
        payload: {
          sessionId: this.session.id,
          kind,
        },
      })
    },
  },
})
</script>
