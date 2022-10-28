<template>
  <div class="select is-small languageControl">
    <select name="languageControl" :value="$i18n.locale" @change="onChange">
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { SelectOption } from '@openlab/deconf-ui-toolkit'
import { getLanguageOptions } from '@/lib/module'
import { setLocale } from '@/i18n/module'

interface Data {
  options: SelectOption[]
}

export default Vue.extend({
  data(): Data {
    return {
      options: getLanguageOptions(),
    }
  },
  methods: {
    onChange(event: Event) {
      setLocale((event.target as HTMLSelectElement)?.value)
    },
  },
})
</script>

<style lang="scss">
.languageControl select {
  border-radius: 6px;
}
</style>
