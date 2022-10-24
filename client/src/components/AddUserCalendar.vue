<template>
  <div class="addUserCalender">
    <p class="addUserCalender-title">
      {{ $t('mozfest.addUserCalendar.title') }}
    </p>

    <!-- The "generate" button -->
    <template v-if="!privateUrl">
      <button class="button is-primary" @click="generate">
        {{ $t('mozfest.addUserCalendar.generate') }}
      </button>
    </template>

    <!-- The control to copy the URL -->
    <template v-else>
      <div class="addUserCalendar-control">
        <input
          type="text"
          class="input addUserCalendar-input"
          :value="privateUrl"
          readonly
        />
        <button class="button" :class="copyClasses" @click="copyLink">
          {{
            didCopy
              ? $t('mozfest.addUserCalendar.copied')
              : $t('mozfest.addUserCalendar.copy')
          }}
        </button>
        <p class="addUserCalendar-help">
          {{ $t('mozfest.addUserCalendar.info') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import copyToClipboard from 'copy-to-clipboard'

interface Data {
  privateUrl: string | null
  didCopy: boolean
}

// TODO: migrate to PrivateCalendarCreator

export default Vue.extend({
  data(): Data {
    return { privateUrl: null, didCopy: false }
  },
  computed: {
    copyClasses(): unknown {
      return {
        'is-dark': !this.didCopy,
        'is-success': this.didCopy,
      }
    },
  },
  methods: {
    async generate() {
      this.$metrics.track({ eventName: 'profile/userCalendar', payload: {} })

      this.privateUrl = await this.$store.dispatch('api/fetchUserCalendar')
      if (!this.privateUrl) alert('Something went wrong')
    },
    copyLink() {
      if (!this.privateUrl) return
      copyToClipboard(this.privateUrl)

      this.didCopy = true
      setTimeout(() => (this.didCopy = false), 5000)
    },
  },
})
</script>

<style lang="scss">
$addUserCalender-titleWeight: bold !default;
$addUserCalender-titleSize: $size-5 !default;
$addUserCalender-titleFamily: $family-title !default;

.addUserCalender {
  margin-bottom: $block-spacing;
}
.addUserCalender-title {
  font-weight: $addUserCalender-titleWeight;
  font-size: $addUserCalender-titleSize;
  font-family: $addUserCalender-titleFamily;
  margin-bottom: 0.3em;
}
.addUserCalendar-control {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.addUserCalendar-input {
  flex: 400px 0;
  color: $grey;
}
.addUserCalendar-help {
  flex: 100%;
  font-size: $size-7;
}
</style>
