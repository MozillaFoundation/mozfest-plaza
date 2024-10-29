<template>
  <div class="select is-small languageControl">
    <select name="languageControl" :value="$i18n.locale" @change="onChange">
      <option
        v-for="option in options"
        :key="`${option.value}`"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { SelectOption } from '@openlab/deconf-ui-toolkit'
import { getLanguageOptions } from '@/lib/module'
import { setLocale } from '@/i18n/module'

export interface _Data {
  options: SelectOption[]
}

const hiddenLanguages = new Set(['asl', 'cc'])

export default defineComponent({
  data(): _Data {
    return {
      options: getLanguageOptions().filter(
        (l) => !hiddenLanguages.has(l.value as string)
      ),
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
  border-radius: $radius;
}
</style>
