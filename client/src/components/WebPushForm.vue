<script lang="ts" setup>
import { TextField } from '@openlab/deconf-ui-toolkit'
import { computed, ref } from 'vue'

export interface WebPushSubmit {
  name: string
  categories: string[]
}

const data = ref<WebPushSubmit>({
  name: '',
  categories: [],
})

const props = defineProps<{ disabled?: boolean }>()

const emit = defineEmits<{
  (e: 'submit', data: WebPushSubmit): void
}>()

const canSubmit = computed(() => {
  return (
    !props.disabled &&
    data.value.name.trim().length > 0 &&
    data.value.categories.length > 0
  )
})

function onSubmit() {
  emit('submit', data.value)
}
</script>

<template>
  <div class="webPushForm">
    <h4>Add this device</h4>

    <TextField
      name="webPush-name"
      id="webPush-name"
      label="Device name"
      v-model="data.name"
      placeholder="Rob's laptop"
      required
    />

    <div class="field">
      <label class="label">Categories</label>
      <div class="webPushForm-categories">
        <label>
          <input
            type="checkbox"
            name="webPushForm-categories"
            v-model="data.categories"
            value="MySchedule"
          />
          MySchedule events
        </label>
        <label>
          <input
            type="checkbox"
            name="webPushForm-categories"
            v-model="data.categories"
            value="Special"
          />
          Special messages
        </label>
      </div>
    </div>

    <div class="buttons">
      <button
        class="button is-success"
        @click="onSubmit"
        :disabled="!canSubmit"
      >
        Register
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.webPushForm {
  border: 2px dashed $border;
  padding: 1em;
  border-radius: $radius;
}

.webPushForm-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
}
</style>
