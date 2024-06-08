<template>
  <ApiContent :slug="slug">
    <!-- feedback_form -->
    <AirtableEmbed
      slot="feedback_form"
      src="https://airtable.com/embed/shrSoLQIyaX54VlAy?backgroundColor=teal"
    />

    <!-- callouts -->
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

    <!-- calendar -->
    <section slot="calendar" class="calendarWidget block">
      <PrivateCalendarCreator api-module="api" />
    </section>

    <TitoWidget slot="tito" />

    <!-- ... -->
  </ApiContent>
</template>

<script lang="ts">
import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ApiContent, PrivateCalendarCreator } from '@openlab/deconf-ui-toolkit'

import TitoWidget from '@/components/TitoWidget.vue'
import AirtableEmbed from '@/components/AirtableEmbed.vue'

export default Vue.extend({
  components: {
    ApiContent,
    FontAwesomeIcon,
    PrivateCalendarCreator,
    TitoWidget,
    AirtableEmbed,
  },
  props: {
    slug: { type: String, required: true },
  },
})
</script>

<style lang="scss">
.calendarWidget {
  border: 3px solid $border;
  border-radius: $radius;
  padding: 1rem;
}
.calendarWidget > * {
  margin-bottom: 0;
}
</style>
