<template>
  <div class="collagedSession">
    <!-- <div class="collagedSession-header"></div> -->
    <h2 class="collagedSession-title">
      <router-link :to="sessionRoute">
        {{ localeTitle }}
      </router-link>
    </h2>
    <router-link :to="sessionRoute">
      <img :src="source" class="collagedSession-image"></img>
    </router-link>
    <!-- <div class="collagedSession-footer"></div> -->
  </div>
</template>

<script lang="ts">
import type { Session } from '@openlab/deconf-shared';
import { localiseFromObject, Routes } from '@openlab/deconf-ui-toolkit';
import { defineComponent, type PropType } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

type MozSession = Session & {
  metadata?: {
    preview_image?: string
  }
}

export default defineComponent({
  props: {
    session: {
      type: Object as PropType<Session>,
      required: true
    },
  },
  computed: {
    source(): string {
      return (this.session as MozSession)?.metadata?.preview_image ?? "/default-collage.webp"
    },
    sessionRoute(): RouteLocationRaw {
      return { name: Routes.Session, params: { sessionId: this.session.id } };
    },
    localeTitle(): string {
      return localiseFromObject(this.$i18n.locale, this.session.title) ?? ""
    }
  }
})
</script>

<style lang="scss">

$collagedSession-titleWeight: $weight-bold !default;
$collagedSession-titleSize: $size-5 !default;
$collagedSession-titleColor: $text-strong !default;
$collagedSession-descriptionColor: $grey !default;
$collagedSession-textWidth: 720px !default;

.collagedSession {
  padding: 1rem !important;
}
.collagedSession > * + * {
  margin-block-start: 1rem;
  display: block;
}
.collagedSession-title {
  font-family: $title-family;
  font-weight: $collagedSession-titleWeight;
  font-size: $collagedSession-titleSize;
  line-height: 1.2;

  a {
    color: $collagedSession-titleColor;
  }
  a:hover {
    text-decoration: underline;
  }
}
.collagedSession-image {
  display: block;
}
</style>
