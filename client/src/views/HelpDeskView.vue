<template>
  <ContentLayout>
    <ApiContent slug="help">
      <iframe
        slot="feedback_form"
        class="airtable-embed airtable-dynamic-height"
        src="https://airtable.com/embed/shrSoLQIyaX54VlAy?backgroundColor=teal"
        frameborder="0"
        onmousewheel=""
        width="100%"
        height="1770"
        style="background: transparent; border: 1px solid #ccc"
      ></iframe>
      <div class="buttons" slot="callouts">
        <a
          class="button is-large is-slack"
          href="http://mozillafestival.org/slack"
        >
          <span class="icon">
            <FontAwesomeIcon :icon="['fab', 'slack']" />
          </span>
          <span>Slack</span>
        </a>
        <a
          class="button is-large is-secondary"
          href="mailto:support@mozillafestival.org"
        >
          <span class="icon">
            <FontAwesomeIcon :icon="['fas', 'envelope']" />
          </span>
          <span>Email</span>
        </a>
        <a
          class="button is-large is-twitter"
          href="https://twitter.com/intent/tweet?hashtags=mozhelp"
        >
          <span class="icon">
            <FontAwesomeIcon :icon="['fab', 'twitter']" />
          </span>
          <span>Twitter</span>
        </a>
      </div>
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import ContentLayout from '@/components/MozContentLayout.vue'
import { ApiContent } from '@openlab/deconf-ui-toolkit'
import { loadScript } from '@/lib/module'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default Vue.extend({
  components: { ApiContent, ContentLayout, FontAwesomeIcon },
  created() {
    loadScript(
      'tito-embed-v1',
      'https://static.airtable.com/js/embed/embed_snippet_v1.js'
    )
  },
})
</script>
