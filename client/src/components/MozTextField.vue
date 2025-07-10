<template>
  <div class="field">
    <label class="label" :for="name">
      {{ label }}
    </label>
    <div class="control">
      <input
        :id="name"
        :type="type"
        class="input"
        :class="inputClass"
        :value="modelValue"
        @input="onInput"
        @keyup.enter="onEnter"
        :placeholder="placeholder"
        :disabled="disabled"
        v-bind="inputAttrs"
      />
    </div>
    <div class="help" v-if="help" :class="inputClass">
      {{ help }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

//
// Wraps a bulma input field
//

//
// i18n
// - n/a
//
// icons
// - n/a
//
// sass
// - n/a
//

export default defineComponent({
  name: 'TextField',
  props: {
    name: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, required: true },
    placeholder: { type: String, default: '' },
    help: { type: String, default: null },
    hasError: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    disabled: { type: Boolean, default: false },
    inputAttrs: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue', 'enter'],
  computed: {
    inputClass(): unknown {
      return {
        'is-danger': this.hasError,
      }
    },
  },
  methods: {
    onInput(event: Event): void {
      if (!(event.target instanceof HTMLInputElement)) return
      this.$emit('update:modelValue', event.target.value)
    },
    onEnter(): void {
      this.$emit('enter')
    },
  },
})
</script>
