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
import Vue from 'vue'
import { Stack } from '@openlab/deconf-ui-toolkit'
import { MozSession } from '@/lib/module'
import copy from 'copy-to-clipboard'
import { PropType } from 'vue/types/v3-component-props'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default Vue.extend({
  components: { Stack, FontAwesomeIcon },
  props: {
    session: { type: Object as PropType<MozSession> },
  },
  computed: {
    url() {
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
